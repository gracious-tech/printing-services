<template lang="pug">
header(class='sticky top-0 z-50'
    :style='{\
        borderBottom: "1px solid var(--color-border)",\
        backgroundColor: "var(--color-surface)"\
    }')
    div(class='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8')
        div(class='flex items-center justify-between h-14')

            //- Logo/title
            NuxtLink(
                class='flex items-center gap-2 text-lg font-bold'
                to='/'
                style='color: var(--color-accent-light)')
                img(class='size-7 rounded' src='/icon.png' alt='')
                | Printing Services

            //- Desktop nav (always visible on sm+)
            nav(class='hidden sm:flex items-center gap-1')
                NuxtLink(
                    v-for='link in links'
                    :key='link.to'
                    :to='link.to'
                    :class='[\
                        "px-3 py-1.5 rounded-md text-sm transition-colors",\
                        route.path === link.to\
                            ? "nav-link-active"\
                            : "nav-link"\
                    ]'
                ) {{ link.label }}
                a(
                    class='inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors nav-link'
                    href='https://github.com/gracious-tech/printing-services'
                    target='_blank')
                    | GitHub
                    UIcon(class='size-3.5' name='i-lucide-external-link')

            //- Mobile menu button (only visible below sm)
            button(
                class='sm:hidden p-2 rounded-md'
                style='color: var(--color-text-muted)'
                @click='mobile_open = !mobile_open')
                UIcon(:name='mobile_open ? "i-lucide-x" : "i-lucide-menu"' class='size-5')

    //- Mobile nav dropdown
    div(
        v-if='mobile_open'
        class='sm:hidden'
        :style='{\
            borderTop: "1px solid var(--color-border)",\
            backgroundColor: "var(--color-surface)"\
        }')
        nav(class='px-4 py-2 space-y-1')
            NuxtLink(
                v-for='link in links'
                :key='link.to'
                :to='link.to'
                :class='[\
                    "block px-3 py-2 rounded-md text-sm transition-colors",\
                    route.path === link.to\
                        ? "nav-link-active"\
                        : "nav-link"\
                ]'
                @click='mobile_open = false'
            ) {{ link.label }}
            a(class='block px-3 py-2 rounded-md text-sm nav-link'
                href='https://github.com/gracious-tech/printing-services'
                target='_blank')
                | GitHub
</template>

<script setup lang="ts">
// Navigation links
const links = [
    {to: '/introduction', label: 'Introduction'},
    {to: '/api', label: 'API'},
    {to: '/explanation', label: 'Explanation'},
    {to: '/research', label: 'Research'},
]

const route = useRoute()
const mobile_open = ref(false)

// Close mobile menu on route change
watch(() => route.path, () => {
    mobile_open.value = false
})
</script>
