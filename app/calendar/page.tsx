import Media from '@/components/Media'
import { EVENT, MEDIA } from '@/content/event'
import { CALENDAR, CALENDAR_PAGE } from '@/content/thanks'
import '../preregister/mobile.css'
import '../thanks/thanks.css'

export const metadata = { title: 'Add To Calendar | The Cookout', robots: { index: false } }

// The Add To Calendar button in the emails lands here (see CALENDAR_PAGE).
export default function CalendarPage() {
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
          <h1 className="ty-big">{CALENDAR_PAGE.big}</h1>
          <p className="ty-sub">{CALENDAR_PAGE.sub}</p>
          <p className="facts">{EVENT.dateShort} | {EVENT.timeShort}</p>

          <div className="ty-cards ty-cards-one">
            <div className="ty-card">
              <div className="ty-actions ty-actions-stack">
                <a className="btn ty-pill" href={CALENDAR.google} target="_blank" rel="noopener noreferrer" data-track="calendar-google">
                  {CALENDAR_PAGE.google}
                </a>
                <a className="btn ty-pill ghost" href={CALENDAR.ics} data-track="calendar-apple">
                  {CALENDAR_PAGE.apple}
                </a>
                <a className="btn ty-pill ghost" href={CALENDAR.outlook} target="_blank" rel="noopener noreferrer" data-track="calendar-outlook">
                  {CALENDAR_PAGE.outlook}
                </a>
              </div>
              <p className="ty-note">{CALENDAR_PAGE.note}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
