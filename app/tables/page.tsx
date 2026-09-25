import Link from 'next/link'
import Media from '@/components/Media'
import PositionPanel from '@/components/PositionPanel'
import TableForm from '@/components/TableForm'
import Ph from '@/components/Ph'
import { EVENT, TABLES } from '@/content/event'

export const metadata = { title: 'Tables and VIP — The Cookout' }

export default function Tables() {
  return (
    <>
      <div className="hero">
        <div className="hero-media short">
          <Media slot={TABLES.hero.slot} spec={TABLES.hero.spec} brief={TABLES.hero.brief} fill />
          <div className="hero-scrim" />
          <div className="hero-inner">
            <div className="wrap">
              <div className="eyebrow">THE COOKOUT · {EVENT.date.toUpperCase()}</div>
              <h1 className="headline">{TABLES.hero.heading}</h1>
              <p className="support" style={{ color: 'var(--cream)', fontSize: 18 }}>{TABLES.hero.support}</p>
              <div className="ctarow">
                <Link href="#book" className="btn" data-track="tables-hero-book">Book A Table</Link>
                <Link href="/#register" className="btn ghost" data-track="tables-hero-guest">Free Guest List</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="wrap narrow" style={{ textAlign: 'center' }}>
          <p className="lead">{TABLES.lead}</p>
        </div>
      </section>

      {TABLES.tiers.map((t) => <PositionPanel key={t.slot} tier={t} />)}

      <section>
        <div className="wrap">
          <div className="split">
            <Media slot={TABLES.map.slot} spec={TABLES.map.spec} brief={TABLES.map.brief} ratio="16/9" />
            <div>
              <h2>{TABLES.map.heading}</h2>
              <ul className="ticks">
                {TABLES.map.points.map((p) => (
                  <li key={p}>{p.includes('[') ? <Ph>{p}</Ph> : p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="book">
        <div className="wrap narrow">
          <h2>{TABLES.form.heading}</h2>
          <TableForm />
        </div>
      </section>
    </>
  )
}
