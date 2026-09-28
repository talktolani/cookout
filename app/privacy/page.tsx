import { EVENT } from '@/content/event'

export const metadata = { title: 'Privacy | The Cookout', robots: { index: false } }

// Meta's Business Tools Terms require a privacy notice on any site running the
// pixel. Keep this in step with what lib/meta.ts and lib/submit.ts actually send.
export default function Privacy() {
  return (
    <main className="wrap" style={{ maxWidth: 720, padding: '64px 24px', lineHeight: 1.65 }}>
      <h1 className="headline" style={{ textAlign: 'left' }}>Privacy</h1>
      <p>This page covers what {EVENT.name} collects on this site and what happens to it.</p>

      <h2>What we collect</h2>
      <p>When you sign up or buy a ticket we collect your name, email and WhatsApp number, plus the ad or link that brought you here. We also count page visits so we know which pages work.</p>

      <h2>What we use it for</h2>
      <p>To send you your ticket link, the address, parking details and set times, and updates about the event you signed up for. You can stop WhatsApp messages at any time by replying STOP, and every email has an unsubscribe link.</p>

      <h2>Who else sees it</h2>
      <p>Tickets are sold through TicketMelon, which has its own privacy policy. We use Meta (Facebook and Instagram) to measure our ads: the Meta pixel on this site sets cookies, and when you sign up we send Meta your email and number in scrambled (hashed) form so it can tell which ads led to sign-ups. Meta never gets them in readable form from us. We don't sell your details to anyone.</p>

      <h2>Your choices</h2>
      <p>You can block Meta's cookies in your browser settings or change your ad preferences in your Facebook or Instagram settings. To see or delete what we hold about you, message us on Instagram at @thecookout.kl.</p>
    </main>
  )
}
