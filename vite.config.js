import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    Components({
      resolvers: IconsResolver({
        prefix: false,
        enabledCollections: ['carbon'],
        alias: {
          cb: 'carbon'
        }
      })
    }),
    Icons(),
    tailwindcss()
  ]
})
