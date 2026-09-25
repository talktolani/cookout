import PreregisterForm from '@/components/PreregisterForm'
import Countdown from '@/components/Countdown'
import Media from '@/components/Media'
import ViewportFit from '@/components/ViewportFit'
import { EVENT, HERO, TICKETS, MEDIA } from '@/content/event'

export const metadata = {
  title: 'The Cookout — Pre-register for Early Bird',
  description: `Barbecue, games and a sound system at ${EVENT.venue}, ${EVENT.city}. ${EVENT.date}. Pre-register for first access to Early Bird at ${TICKETS.earlyBird.price}.`,
}

/**
 * Squeeze page. One goal: capture the contact.
 *
 * Structure follows what the evidence supports rather than what looks busy.
 * Above the fold on a 375px viewport, in order: proof of what and where, the
 * promise, the deadline, the field, the button. Nothing else, and no exit
 * links: the footer is hidden by CSS on this page.
 *
 * The background only renders media when MEDIA.V1 has a URL. Until then the
 * brand gradient carries it, which costs 0 bytes and cannot hurt load time.
 * That matters: hero video raises LCP by over a second on average, and every
 * second of delay costs conversions, so an empty slot has to be free.
 */
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

          <p className="facts">
            {EVENT.date} · {EVENT.timeRange}
          </p>

          <p className="sq-offer">
            Pre-register and we&apos;ll send you the link before anyone else gets it.
          </p>

          <Countdown iso={TICKETS.earlyBird.closesISO} label="until Early Bird closes" />

          <PreregisterForm />
        </div>
      </div>
    </main>
  )
}
