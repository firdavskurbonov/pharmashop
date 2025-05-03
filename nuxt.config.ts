import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-04-04',
  ssr: true,
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  css: [
    '@/assets/css/main.css',
  ],
  app: {
    head: {
      title: 'Аптека',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Интернет магазин аптечный' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  imports: {
    dirs: ['stores']
  },

  typescript: {
    strict: true,
    typeCheck: true
  },
  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name: "orderconfirmation",
        path: "/orderconfirmation",
        file: '~/pages/orderconfirmation.vue',
      });
    },
  },
  // vite: {
  //   // optimizeDeps: {
  //   //   include: ['vue']
  //   // },
  //   resolve: {
  //     alias: {
  //       vue: './node_modules/@vue/compat'
  //     },
  //     dedupe: ['vue']
  //   }
  // }

 
  
})
