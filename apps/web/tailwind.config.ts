import type { Config } from 'tailwindcss'
import sharedConfig from '../../packages/config/tailwind/index.js'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  ...sharedConfig,
}

export default config
