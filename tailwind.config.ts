import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors'

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
      colors: {
        primary: {
          DEFAULT: colors.violet[300],
          ...colors.violet
        },
        secondary: {
          DEFAULT: colors.rose[300],
          ...colors.rose
        },
        bg: {
          DEFAULT: colors.slate[800],
          ...colors.slate
        },
        text: {
          DEFAULT: colors.slate[200],
          ...colors.slate
        }
      }
    }
	},

	plugins: [require('@tailwindcss/typography')]
} as Config;
