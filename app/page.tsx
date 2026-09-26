import Link from 'next/link'
import Media from '@/components/Media'
import Carousel from '@/components/Carousel'
import Faq from '@/components/Faq'
import RegisterForm from '@/components/RegisterForm'
import Ph from '@/components/Ph'
import TicketCheckout from '@/components/TicketCheckout'
import {
  EVENT, HERO, THREE, VENUE_SECTION, TOURNAMENT,
  INCLUDED, GETTING_THERE, REGISTER, TICKETS,
} from '@/content/event'

export default function Home() {
  return (
    <>
      <div className="hero">
        <div className="hero-media">
          <Media
            slot="V1 · HERO LOOP"
            spec="16:9 desktop / 9:16 mobile · 15-20s · muted autoplay loop"
            brief="Full bleed, behind everything."
            fill
          />
          <div className="hero-scrim" />
          <div className="hero-inner">
            <div className="wrap">
              <div className="eyebrow">{HERO.eyebrow}</div>
              <div className="mark">
                <span className="the">THE</span>
                <span className="out">COOKOUT!</span>
              </div>
              <h1 className="headline">{HERO.headline}</h1>
              <p className="facts">{HERO.facts}</p>
              <p className="support">{HERO.support}</p>
              <div className="ctarow">
                <Link href="#tickets" className="btn" data-track="hero-tickets">{HERO.primaryCta}</Link>
                <Link href="#register" className="btn ghost" data-track="hero-guestlist">{HERO.secondaryCta}</Link>
              </div>
            </div>
          </div>
          <div className="hero-cue" aria-hidden="true"><span />SCROLL</div>
        </div>
      </div>

      <section>
        <div className="wrap">
          <h2>{THREE.heading}</h2>
          <p className="lead">{THREE.lead}</p>
          <div className="triple">
            {THREE.items.map((i) => (
              <div key={i.slot}>
                <Media slot={i.slot} spec={i.spec} brief={i.brief} ratio="4/5" />
                <h3 style={{ marginTop: 18 }}>{i.title}</h3>
                <p style={{ fontSize: '15.5px', marginBottom: 0 }}>{i.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="split">
            <Media slot={VENUE_SECTION.slot} spec={VENUE_SECTION.spec} brief={VENUE_SECTION.brief} ratio="16/9" />
            <div>
              <h2>{VENUE_SECTION.heading}</h2>
              <p>{VENUE_SECTION.body}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap narrow">
          <h2>{TOURNAMENT.heading}</h2>
          <p>{TOURNAMENT.body}</p>
          <Link href="#register" className="btn" data-track="tournament-cta">{TOURNAMENT.cta}</Link>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2>{INCLUDED.heading}</h2>
          <div className="split">
            <ul className="ticks">
              {INCLUDED.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <Media
              slot="P1 · WELCOME DRINK"
              spec="4:5 still"
              brief="The included drink in hand, venue soft behind it."
              ratio="4/5"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <h2>{GETTING_THERE.heading}</h2>
          <div className="split">
            <div>
              <p>
                {EVENT.venue}, <Ph>{EVENT.address}</Ph>. Parking is free and there&apos;s plenty of it.
                The week of the event we&apos;ll send you a map, the gate to use, and a drop off pin for Grab.
              </p>
            </div>
            <Media slot={GETTING_THERE.slot} spec={GETTING_THERE.spec} brief={GETTING_THERE.brief} ratio="16/9" />
          </div>
        </div>
      </section>

      <Carousel />

      <section id="tickets">
        <div className="wrap narrow">
          <h2>Tickets</h2>
          <p className="lead">
            Every tier gets the same night. The only difference is what you paid.
          </p>
          <div className="tiers3">
            {[TICKETS.earlyBird, TICKETS.ga, TICKETS.door].map((t, i) => (
              <div className={`tier3 ${i === 0 ? 'feature' : ''}`} key={t.name}>
                <div className="t3name">{t.name}</div>
                <div className="t3price">{t.price}</div>
                <p className="t3note">{t.note}</p>
              </div>
            ))}
          </div>
          <p className="micro" style={{ marginBottom: 22 }}>
            Early Bird runs through {TICKETS.earlyBird.closes}. The price rises after that.
          </p>
          <TicketCheckout />
        </div>
      </section>

      <section className="band" id="register">
        <div className="wrap narrow">
          <h2>{REGISTER.heading}</h2>
          <p>{REGISTER.body}</p>
          <RegisterForm />
        </div>
      </section>

      <Faq />
    </>
  )
}
