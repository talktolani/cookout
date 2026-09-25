import { FAQ } from '@/content/event'

export default function Faq() {
  return (
    <section className="band">
      <div className="wrap narrow">
        <h2>Questions</h2>
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p className={f.a.startsWith('[') ? 'ph' : undefined}>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
