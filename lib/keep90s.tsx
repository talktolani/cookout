import { Fragment } from 'react'

// Headlines are uppercased in CSS, which would print "90S". This keeps the
// lowercase s in "90s" (the brand spelling) wherever it appears.
export function keep90s(text: string) {
  return text.split('90s').map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <span style={{ textTransform: 'none' }}>90s</span>}
      {part}
    </Fragment>
  ))
}
