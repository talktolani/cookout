import Link from 'next/link'
import Media from './Media'

type Tier = {
  slot: string; name: string; body: string; includes: readonly string[]
  brief: string; align: 'left' | 'right'; accent: 'green' | 'ember'
}

/**
 * The Omnia VIP pattern. A full bleed photo of the empty table with a solid
 * colour panel overlapping it, alternating sides down the page.
 * No prices here: position sells, money happens in the booking step.
 */
export default function PositionPanel({ tier }: { tier: Tier }) {
  return (
    <div className={`pos ${tier.align === 'right' ? 'right' : ''} ${tier.accent === 'ember' ? 'warm' : ''}`}>
      <Media slot={tier.slot} spec="Empty table, wide, no crowd" brief={tier.brief} fill />
      <div className="panel">
        <h3 className={tier.name.startsWith('[') ? 'ph' : undefined}>{tier.name}</h3>
        <p className={tier.body.startsWith('[') ? 'ph' : undefined}>{tier.body}</p>
        <ul>
          {tier.includes.map((i) => (
            <li key={i} className={i.startsWith('[') ? 'ph' : undefined}>{i}</li>
          ))}
        </ul>
        <Link href="#book" className="btn" data-track={`table-${tier.slot}`}>Book This Table</Link>
      </div>
    </div>
  )
}
