import type { Config } from 'tailwindcss'
import baseConfig from '@demicommerce/tailwind-config'

const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      ...baseConfig.theme?.extend,
      keyframes: {
        ...(baseConfig.theme?.extend?.keyframes ?? {}),
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(8deg)' },
        },
      },
      animation: {
        ...(baseConfig.theme?.extend?.animation ?? {}),
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
      },
    },
  },
}

export default config
