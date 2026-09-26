import Media from '@/components/Media'
import TrustBar from '@/components/TrustBar'
import ThanksName from '@/components/ThanksName'
import ShareActions from '@/components/ShareActions'
import { EVENT, MEDIA } from '@/content/event'
import { THANKS_PAGE, CALENDAR } from '@/content/thanks'
import '../preregister/mobile.css'
import './thanks.css'

export const metadata = { title: "You're on the list | The Cookout", robots: { index: false } }

export default function Thanks({
  searchParams,
}: {
  searchParams: { booked?: string; ticket?: string }
}) {
  const v = searchParams?.booked === '1' ? THANKS_PAGE.table
    : searchParams?.ticket === '1' ? THANKS_PAGE.ticket
    : THANKS_PAGE.preregister
  const hasMedia = Boolean(MEDIA.V1?.src)

  return (
    <main className="squeeze ty-page">
      {hasMedia && (
        <div className="sq-media">
          <Media slot="V1" fill />
        </div>
      )}
      <div className="sq-scrim" />

      <div className="ty-inner">
        <div className="wrap">
          <div className="eyebrow">{EVENT.venue.toUpperCase()} · {EVENT.city.toUpperCase()}</div>

          <h1 className="ty-big"><ThanksName base={v.big} /></h1>
          <p className="ty-sub">{v.sub}</p>
          <p className="facts">{EVENT.dateShort} | {EVENT.timeShort}</p>

          <p className="ty-steps-label">{THANKS_PAGE.stepsHeading}</p>
          <div className="ty-cards">
            <div className="ty-card">
              <h2>{THANKS_PAGE.calendar.title}</h2>
              <p>{THANKS_PAGE.calendar.body}</p>
              <div className="ty-actions">
                <a className="btn ty-pill" href={CALENDAR.google} target="_blank" rel="noopener noreferrer" data-track="thanks-calendar-google">
                  {THANKS_PAGE.calendar.google}
                </a>
                <a className="btn ty-pill ghost" href={CALENDAR.ics} data-track="thanks-calendar-apple">
                  {THANKS_PAGE.calendar.apple}
                </a>
              </div>
            </div>

            <div className="ty-card">
              <h2>{THANKS_PAGE.share.title}</h2>
              <p>{THANKS_PAGE.share.body}</p>
              <ShareActions />
            </div>
          </div>

          <TrustBar />
        </div>
      </div>
    </main>
  )
}
