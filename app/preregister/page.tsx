import PreregisterForm from '@/components/PreregisterForm'
import Countdown from '@/components/Countdown'
import Media from '@/components/Media'
import ViewportFit from '@/components/ViewportFit'
import TrustBar from '@/components/TrustBar'
import { EVENT, HERO, TICKETS, MEDIA } from '@/content/event'
import './mobile.css'

export const metadata = {
  title: 'The Cookout — Pre-register for Early Bird',
  description: `Barbecue, games and a sound system at ${EVENT.venue}, ${EVENT.city}. ${EVENT.date}. Pre-register for first access to Early Bird at ${TICKETS.earlyBird.price}.`,
}

export default function Preregister() {
  const hasMedia = Boolean(MEDIA.V1?.src)

  return (
    <main className="squeeze">
      <ViewportFit />
      {hasMedia && (
        <div className="sq-media">
          <Media slot="V1" fill />
        </div>
      )}
      <div className="sq-scrim" />

      <div className="sq-inner">
        <div className="wrap">
          <div className="eyebrow">{EVENT.venue.toUpperCase()} · {EVENT.city.toUpperCase()}</div>

          <div className="mark">
            <span className="the">THE</span>
            <span className="out">COOKOUT!</span>
          </div>

          <h1 className="sq-head">{HERO.headline}</h1>

          <p className="facts">{EVENT.dateShort} | {EVENT.timeShort}</p>

          <p className="sq-offer">
            Pre-register free, get the cheapest tickets first. Early Bird closes {TICKETS.earlyBird.closes}.
          </p>

          <Countdown iso={TICKETS.earlyBird.closesISO} label="until Early Bird closes" />

          <PreregisterForm />

          <TrustBar />
        </div>
      </div>
    </main>
  )
}
