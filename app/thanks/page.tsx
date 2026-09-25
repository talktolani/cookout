import Link from 'next/link'
import Media from '@/components/Media'
import { EVENT, THANKS } from '@/content/event'

export const metadata = { title: "You're on the list — The Cookout", robots: { index: false } }

const cal = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
  'The Cookout'
)}&dates=${EVENT.calendar.start}/${EVENT.calendar.end}&location=${encodeURIComponent(
  `${EVENT.venue}, ${EVENT.city}`
)}`

export default function Thanks({
  searchParams,
}: {
  searchParams: { booked?: string; ticket?: string }
}) {
  const booked = searchParams?.booked === '1'
  const ticketed = searchParams?.ticket === '1'
  const c = booked ? THANKS.table : ticketed ? THANKS.ticket : THANKS.guest

  return (
    <>
      <div style={{ background: 'linear-gradient(178deg,#0B1024,#241B33)' }}>
        <div className="wrap narrow ty">
          <div className="eyebrow" style={{ marginBottom: 8 }}>{EVENT.city.toUpperCase()}</div>
          <div className="big">{c.big}</div>
          <p className="lead">{c.sub}</p>
          <p>{c.body}</p>
          <p style={{ color: 'var(--green)', fontWeight: 700 }}>{c.reminder}</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="split">
            <Media
              slot={THANKS.video.slot}
              spec={THANKS.video.spec}
              brief={THANKS.video.brief}
              ratio="9/16"
              style={{ maxWidth: 300, margin: '0 auto' }}
            />
            <div>
              <h2>You&apos;re in. Here&apos;s what happens next.</h2>
              <p>Watch this, then do the things below while you&apos;re here. They take a minute and they&apos;re the difference between turning up and having a night.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 style={{ maxWidth: 'none' }}>Do these now, while you&apos;re here</h2>
          <div className="nexts">
            <div className="nextcard">
              <h3>Add It To Your Calendar</h3>
              <p>{EVENT.date}, {EVENT.timeRange}.</p>
              <a className="btn ghost" href={cal} target="_blank" rel="noopener noreferrer" data-track="thanks-calendar">Add It To Your Calendar</a>
            </div>
            {!booked && !ticketed && (
              <div className="nextcard">
                <h3>Register Your Team</h3>
                <p>Pickle, padel and pool run in pairs. Free to enter, and the bracket closes 5 days out.</p>
                <Link className="btn ghost" href="/#register" data-track="thanks-team">Register Your Team</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="split rev">
            <Media slot={THANKS.share.slot} spec={THANKS.share.spec} brief={THANKS.share.brief} ratio="4/5" />
            <div>
              <h2>{THANKS.share.heading}</h2>
              <p>{THANKS.share.body}</p>
              <a
                className="btn"
                data-track="thanks-share"
                href={`https://wa.me/?text=${encodeURIComponent(
                  `The Cookout, ${EVENT.date}, ${EVENT.venue}. Barbecue, games and a sound system.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {THANKS.share.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {!booked && !ticketed && (
        <section className="band">
          <div className="wrap narrow">
            <h2>Want a table?</h2>
            <p>Reserved seating, fast track entry, and drinks waiting when you arrive. Tables are limited.</p>
            <Link href="/tables" className="btn ghost" data-track="thanks-tables">See Table Positions</Link>
          </div>
        </section>
      )}
    </>
  )
}
