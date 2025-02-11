/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', '"Noto Sans"', '"Helvetica Neue"', 'Helvetica', '"Nimbus Sans L"', 'Arial', '"Liberation Sans"', '"PingFang SC"', '"Hiragino Sans GB"', '"Noto Sans CJK SC"', '"Source Han Sans SC"', '"Source Han Sans CN"', '"Microsoft YaHei"', '"Wenquanyi Micro Hei"', '"WenQuanYi Zen Hei"', '"ST Heiti"', 'SimHei', '"WenQuanYi Zen Hei Sharp"', 'sans-serif'],
        code: ['"JetBrains Mono"', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        display: ['"Old Standard TT"', 'serif'],
        deco: ['"EB Garamond"', 'serif']
      },
      screens: {
        xs: '475px',
      }
    },
  },
  plugins: [
    require('@headlessui/tailwindcss')({ prefix: 'ui' })
  ]
}

