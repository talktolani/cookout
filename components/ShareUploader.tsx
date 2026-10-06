'use client'
import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics'
import { SHARE, SHARE_LIMITS } from '@/content/share'

// Guests send photos and videos to a private bucket. The upload function
// (AIOS site-upload) hands out one signed URL per file; the browser PUTs each
// file straight to Storage, so a big video never passes through a server of
// ours. See CLAUDE.md "Guest uploads".
const ENDPOINT =
  process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT ?? 'https://imovvalxcypylkbtrbeb.supabase.co/functions/v1/site-upload'

type Status = 'ready' | 'uploading' | 'done' | 'error'
type Item = { id: string; file: File; type: string; status: Status; progress: number; error?: string }
type Signed = { path: string; signed_url: string }

const EXT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', heic: 'image/heic', heif: 'image/heif',
  webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', mov: 'video/quicktime', m4v: 'video/mp4',
  webm: 'video/webm', '3gp': 'video/3gpp', mkv: 'video/x-matroska',
}

// Some phones hand over HEIC or MOV with an empty type; Storage rejects an
// unnamed type, so work it out from the extension.
function typeOf(f: File): string {
  if (f.type.startsWith('image/') || f.type.startsWith('video/')) return f.type
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  return EXT_TYPES[ext] ?? ''
}

function size(n: number): string {
  return n >= 1024 * 1024 * 1024
    ? `${(n / 1024 ** 3).toFixed(1)} GB`
    : n >= 1024 * 1024
      ? `${Math.round(n / 1024 / 1024)} MB`
      : `${Math.max(1, Math.round(n / 1024))} KB`
}

function visitorId(): string {
  try {
    let v = localStorage.getItem('ck_v')
    if (!v) {
      v = crypto.randomUUID().replace(/-/g, '')
      localStorage.setItem('ck_v', v)
    }
    return v
  } catch {
    return ''
  }
}

async function call(body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => null)
    return res.ok && json?.ok ? json : null
  } catch {
    return null
  }
}

// One PUT per file, shaped like supabase-js uploadToSignedUrl. XHR rather than
// fetch because fetch can't report upload progress.
function put(url: string, file: File, type: string, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const fd = new FormData()
    fd.append('cacheControl', '3600')
    fd.append('', new File([file], file.name, { type }))
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`status ${xhr.status}`)))
    xhr.onerror = () => reject(new Error('network'))
    xhr.ontimeout = () => reject(new Error('timeout'))
    xhr.send(fd)
  })
}

export default function ShareUploader() {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [hp, setHp] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [drag, setDrag] = useState(false)
  const [doneCount, setDoneCount] = useState<number | null>(null)
  const batch = useRef<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Leaving mid-upload loses the files that haven't finished.
  useEffect(() => {
    if (!busy) return
    const stop = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', stop)
    return () => window.removeEventListener('beforeunload', stop)
  }, [busy])

  const patch = (id: string, p: Partial<Item>) =>
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...p } : i)))

  function add(list: FileList | File[]) {
    setMsg('')
    const next: Item[] = []
    let problem = ''
    const seen = new Set(items.map((i) => `${i.file.name}|${i.file.size}|${i.file.lastModified}`))
    for (const f of Array.from(list)) {
      const key = `${f.name}|${f.size}|${f.lastModified}`
      if (seen.has(key)) continue
      const type = typeOf(f)
      if (!type) { problem = SHARE.errors.type; continue }
      if (f.size > SHARE_LIMITS.maxBytes) { problem = SHARE.errors.size; continue }
      if (items.length + next.length >= SHARE_LIMITS.maxFiles) { problem = SHARE.errors.many; break }
      seen.add(key)
      next.push({ id: crypto.randomUUID(), file: f, type, status: 'ready', progress: 0 })
    }
    if (next.length) setItems((cur) => [...cur, ...next])
    if (problem) setMsg(problem)
  }

  async function send() {
    const todo = items.filter((i) => i.status !== 'done')
    if (!todo.length || busy) return
    setBusy(true)
    setMsg('')
    track('cta', { id: 'share-send' }, { files: todo.length })
    const ok = new Set<string>()

    for (let c = 0; c < todo.length; c += SHARE_LIMITS.perCall) {
      const chunk = todo.slice(c, c + SHARE_LIMITS.perCall)
      const res = await call({
        action: 'sign',
        files: chunk.map((i) => ({ name: i.file.name, size: i.file.size, type: i.type })),
        name,
        handle,
        visitor_id: visitorId(),
        batch_id: batch.current || undefined,
        _hp: hp,
      })
      const signed = (res?.uploads as Signed[] | undefined) ?? []
      if (!res || signed.length !== chunk.length) {
        chunk.forEach((i) => patch(i.id, { status: 'error', error: SHARE.errors.generic }))
        continue
      }
      batch.current = String(res.batch_id)

      const finished: string[] = []
      let next = 0
      const worker = async () => {
        while (next < chunk.length) {
          const idx = next++
          const item = chunk[idx]
          patch(item.id, { status: 'uploading', progress: 0, error: undefined })
          try {
            await put(signed[idx].signed_url, item.file, item.type, (p) => patch(item.id, { progress: p }))
            patch(item.id, { status: 'done', progress: 1 })
            finished.push(signed[idx].path)
            ok.add(item.id)
          } catch {
            patch(item.id, { status: 'error', error: SHARE.errors.failed })
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(SHARE_LIMITS.concurrency, chunk.length) }, worker))
      if (finished.length) await call({ action: 'done', paths: finished })
    }

    setBusy(false)
    if (todo.every((i) => ok.has(i.id))) {
      track('form_submit', undefined, { form: 'share-upload', files: items.length })
      setDoneCount(items.length)
    } else {
      setMsg(SHARE.errors.generic)
    }
  }

  function reset() {
    setItems([])
    setDoneCount(null)
    setMsg('')
    batch.current = ''
  }

  if (doneCount !== null) {
    return (
      <div className="sh-card sh-done">
        <h2>{SHARE.doneBig}</h2>
        <p>{SHARE.doneSub(doneCount)}</p>
        <button type="button" className="btn" onClick={reset} data-track="share-more">
          {SHARE.more}
        </button>
      </div>
    )
  }

  const pending = items.filter((i) => i.status !== 'done').length
  const hasError = items.some((i) => i.status === 'error')

  return (
    <div className="sh-card">
      <div className="sh-fields">
        <input type="text" placeholder={SHARE.name} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" disabled={busy} aria-label={SHARE.name} />
        <input type="text" placeholder={SHARE.handle} value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={40} autoCapitalize="none" autoCorrect="off" disabled={busy} aria-label={SHARE.handle} />
        <input className="sq-hp" type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>

      <label
        className={`sh-pick${drag ? ' drag' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!busy) add(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef}
          className="sh-file-input"
          type="file"
          multiple
          accept="image/*,video/*"
          disabled={busy}
          onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = '' }}
        />
        <strong>{items.length ? SHARE.pickMore : SHARE.pick}</strong>
        <span>{SHARE.hint}</span>
      </label>

      {items.length > 0 && (
        <ul className="sh-list">
          {items.map((i) => (
            <li className="sh-item" key={i.id}>
              <div className="sh-bar" style={{ width: `${Math.round(i.progress * 100)}%` }} />
              <div className="sh-row">
                <span className="sh-name">{i.file.name}</span>
                <span className={`sh-meta${i.status === 'error' ? ' err' : i.status === 'done' ? ' ok' : ''}`}>
                  {i.status === 'error' ? i.error : i.status === 'done' ? 'Sent' : i.status === 'uploading' ? `${Math.round(i.progress * 100)}%` : size(i.file.size)}
                </span>
                {!busy && i.status !== 'done' && (
                  <button type="button" className="sh-x" aria-label={`Remove ${i.file.name}`} onClick={() => setItems((cur) => cur.filter((x) => x.id !== i.id))}>
                    ×
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {msg && <p className="sh-err" role="alert">{msg}</p>}

      {pending > 0 && (
        <div className="sh-actions">
          <button type="button" className="btn" onClick={send} disabled={busy} data-track="share-send">
            {busy ? SHARE.sending : hasError ? SHARE.retry : `${SHARE.send} (${pending})`}
          </button>
        </div>
      )}

      <p className="sh-note">{SHARE.note}</p>
    </div>
  )
}
