import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        2: '2px',
        4: '4px',
      },
      // fontFamily: {
      //   sans: ['Noto Sans'],
      // },
      fontSize: {
        base: '16px',
        xxs: '11px',
        xxxs: '10px',
      },
      fontWeight: {
        '100': '100',
        '200': '200',
        '300': '300',
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
        '900': '900',
        semibold: '500',
        bold: '600',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config;
