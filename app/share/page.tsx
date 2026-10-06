import Media from '@/components/Media'
import ShareUploader from '@/components/ShareUploader'
import { MEDIA } from '@/content/event'
import { SHARE } from '@/content/share'
import '../preregister/mobile.css'
import '../thanks/thanks.css'
import './share.css'

export const metadata = {
  title: 'Share Your Cookout | The Cookout',
  description: 'Send us your photos and videos from The Cookout. Only the team sees them.',
  robots: { index: false },
}

// The table cards' QR code lands here. One job: send photos and videos.
export default function SharePage() {
  const hasMedia = Boolean(MEDIA.V1?.src)
  return (
    <main className="squeeze ty-page share-page">
      {hasMedia && (
        <div className="sq-media">
          <Media slot="V1" fill />
        </div>
      )}
      <div className="sq-scrim" />

      <div className="ty-inner">
        <div className="wrap">
          <div className="eyebrow">{SHARE.eyebrow}</div>
          <h1 className="ty-big">{SHARE.big}</h1>
          <p className="ty-sub">{SHARE.sub}</p>
          <ShareUploader />
        </div>
      </div>
    </main>
  )
}
