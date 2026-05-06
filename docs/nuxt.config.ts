
export default defineNuxtConfig({

    app: {
        head: {
            title: 'Printing Services',
            meta: [
                {name: 'description', content: 'Get exact bleed, margin, spine width, and cover dimensions for popular print-on-demand services.'},
            ],
            link: [
                {rel: 'icon', type: 'image/png', href: '/icon.png'},
            ],
        },
    },

    modules: [
        '@nuxt/content',
        '@nuxt/ui',
    ],

    css: [
        '~/assets/styles/imports.css',
        '~/assets/styles/main.sass',
    ],

    compatibilityDate: '2026-05-06',

})
