import { useMemo } from 'react'
import { Cloud } from 'react-icon-cloud'

/**
 * 3D tag cloud of tech logos.
 *
 * Previously this fetched ~36 icons from the simple-icons CDN plus a JSON index
 * from raw.githubusercontent.com that now 404s upstream (console error on every
 * visit, and some slugs no longer exist → "Cannot read properties of undefined
 * (reading 'hex')"). It now renders the logo images that are already bundled
 * with the site: no network requests, no errors.
 */
export const cloudProps = {
  containerProps: {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: 'default',
    tooltip: 'native',
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: '#0000',
    maxSpeed: 0.04,
    minSpeed: 0.02,
  },
}

export default function IconCloud({ icons = [] }) {
  const items = useMemo(
    () =>
      icons.map((icon) => (
        <a key={icon.text} href="#about" title={icon.text} onClick={(e) => e.preventDefault()}>
          <img src={icon.svg} alt={icon.text} width="21" height="21" />
        </a>
      )),
    [icons]
  )
  return (
    <Cloud {...cloudProps}>
      <>{items}</>
    </Cloud>
  )
}
