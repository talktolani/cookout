import Media from '@/components/Media'
import Countdown from '@/components/Countdown'
import TrustBar from '@/components/TrustBar'
import CtaLink from '@/components/CtaLink'
import StickyCta from '@/components/StickyCta'
import VideoCard from '@/components/VideoCard'
import TeamForm from '@/components/TeamForm'
import NoiseLayer from '@/components/NoiseLayer'
import BuyModal from '@/components/BuyModal'
import FaqList from '@/components/FaqList'
import { EVENT, TICKETS, MEDIA } from '@/content/event'
import { SALES } from '@/content/sales'
import { EVENT_SCHEMA } from '@/lib/eventSchema'
import '../preregister/mobile.css'
import './sales.css'

export const metadata = {
  title: 'The Cookout | Tickets',
  description: `${EVENT.dateShort}, ${EVENT.timeShort} at ${EVENT.venue}, ${EVENT.city}. Barbecue, games, pickleball and a sound system. Early Bird ${TICKETS.earlyBird.price}, first drink included.`,
  // Indexable since 25 Sep: this is the page the Event markup lives on.
  alternates: { canonical: '/tickets' },
}

export default function Tickets() {
  const hasMedia = Boolean(MEDIA.V1?.src)
  return (
    <main className="sl-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_SCHEMA) }} />
      <section className="sl-hero">
        {hasMedia && <div className="sq-media"><Media slot="V1" fill /></div>}
        <div className="sl-hero-scrim" />
        <div className="sl-hero-inner wrap">
          <div className="eyebrow">{EVENT.venue.toUpperCase()} · {EVENT.city.toUpperCase()}</div>
          <div className="mark"><span className="the">THE</span><span className="out">COOKOUT!</span></div>
          <h1 className="sl-head">{SALES.hero.headline}</h1>
          <p className="sl-facts">{EVENT.dateShort} | {EVENT.timeShort}</p>
          <p className="sl-offer">{SALES.hero.offer}</p>
          <div className="sl-ctas">
            <CtaLink track="hero-cta">{SALES.hero.cta}</CtaLink>
          </div>
          <Countdown iso={TICKETS.earlyBird.closesISO} label="until Early Bird closes" />
        </div>
        <div className="sl-hero-trust"><TrustBar /></div>
      </section>

      <section className="sl-sec sl-sunset" id="whats-on">
        <NoiseLayer alpha={46} />
        <div className="wrap">
          <div className="sl-intro">
            <div className="sl-intro-head">
              <p className="sl-intro-eyebrow">{SALES.intro.eyebrow}</p>
              <h2 className="sl-h2 left">{SALES.intro.heading}</h2>
            </div>
            <p className="sl-intro-body">{SALES.intro.body}</p>
          </div>
          <h2 className="sl-h2">{SALES.pillars.heading}</h2>
          <p className="sl-lead">{SALES.pillars.lead}</p>
          <div className="sl-pillars">
            {SALES.pillars.items.map((p) => (
              <article className="sl-card" key={p.title}>
                <VideoCard img={p.img} video={p.video} alt={p.alt} />
                <div className="sl-card-body">
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="sl-center">
            <CtaLink track="pillars-cta">{SALES.pillars.cta}</CtaLink>
            <p className="sl-cta-sub">{SALES.pillars.sub}</p>
          </div>
        </div>
      </section>

      <section className="sl-sec sl-run">
        <div className="wrap">
          <h2 className="sl-h2">{SALES.run.heading}</h2>
          <ol className="sl-steps">
            {SALES.run.steps.map((s) => (
              <li key={s.title}>
                <span className="sl-time">{s.time}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sl-sec sl-tourney" id="team">
        <div className="sl-bgvid" aria-hidden="true"><VideoCard img={SALES.tournament.img} video={SALES.tournament.video} alt="" /></div>
        <div className="sl-tourney-scrim" />
        <div className="wrap sl-cols">
          <h2 className="sl-h2 left sl-cols-head">{SALES.tournament.heading}</h2>
          <div className="sl-cols-cta"><TeamForm /></div>
          <p className="sl-body sl-cols-copy">{SALES.tournament.body}</p>
        </div>
      </section>

      <section className="sl-sec sl-band">
        <div className="wrap sl-split rev">
          <div className="sl-tall-wrap"><VideoCard img={SALES.stack.img} video={SALES.stack.video} alt={SALES.stack.alt} /></div>
          <div>
            <h2 className="sl-h2 left">{SALES.stack.heading}</h2>
            <ul className="sl-ticks">
              {SALES.stack.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <p className="sl-note">{SALES.stack.note}</p>
            <div className="sl-stack-cta">
              <CtaLink track="stack-cta">{SALES.stack.cta}</CtaLink>
              <p className="sl-cta-sub">{SALES.stack.sub}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sl-sec" id="tickets">
        <div className="wrap">
          <h2 className="sl-h2">{SALES.tickets.heading}</h2>
          <p className="sl-lead">{SALES.tickets.lead}</p>
          <div className="sl-tiers">
            {SALES.tickets.tiers.map((t) => (
              <div className={`sl-tier${t.feature ? ' feature' : ''}`} key={t.name}>
                <div className="sl-tier-name">{t.name}</div>
                <div className="sl-tier-price">{t.price}</div>
                <div className="sl-tier-note">{t.note}</div>
              </div>
            ))}
          </div>
          <div className="sl-center">
            <CtaLink track="tickets-cta">{SALES.tickets.cta}</CtaLink>
            <p className="sl-cta-sub">{SALES.tickets.micro}</p>
            <Countdown iso={TICKETS.earlyBird.closesISO} label="until Early Bird closes" />
          </div>
        </div>
      </section>

      <section className="sl-sec sl-band">
        <div className="wrap sl-narrow">
          <h2 className="sl-h2">Questions</h2>
          <FaqList items={SALES.faq} />
        </div>
      </section>

      <section className="sl-sec sl-final">
        <div className="sl-bgvid" aria-hidden="true"><VideoCard img={SALES.final.img} video={SALES.final.video} alt="" /></div>
        <div className="sl-final-scrim" aria-hidden="true" />
        <div className="wrap">
          <h2 className="sl-h2">{SALES.final.heading}</h2>
          <p className="sl-facts">{EVENT.dateShort} | {EVENT.timeShort}</p>
          <div className="sl-center">
            <CtaLink track="final-cta">{SALES.final.cta}</CtaLink>
            <p className="sl-cta-sub">{SALES.final.sub}</p>
          </div>
          <TrustBar />
          <p className="sl-social"><a href={SALES.social.instagramUrl} target="_blank" rel="noopener">Follow {SALES.social.instagram} on Instagram</a></p>
        </div>
      </section>

      <StickyCta />
      <BuyModal />
    </main>
  )
}
