import type { TailwindFn } from 'twrnc'
import { create } from 'twrnc'

// eslint-disable-next-line ts/no-var-requires
const tw = create(require('../tailwind.config.js')) as TailwindFn & {
  setColorScheme: (theme: 'dark' | 'light') => void
}

tw.color = (utils) => {
  const styleObj = tw.style(utils)
  const color
    = styleObj.color || styleObj.backgroundColor || styleObj.borderColor
  return typeof color === `string` ? color : undefined
}

export default tw
