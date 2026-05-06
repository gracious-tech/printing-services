<template lang="pug">
div

    //- Hero section
    section.py-16.px-4(class='sm:py-24' style='background: linear-gradient(to bottom, var(--color-surface-raised), var(--color-bg))')
        div.max-w-3xl.mx-auto.text-center
            img.mx-auto.mb-8.rounded-2xl(src='/icon.png' alt='' style='width: 256px; height: 256px')
            h1.text-4xl.font-bold.mb-8(class='sm:text-5xl' style='color: var(--color-text)')
                | Book Printing Dimensions
            p.text-lg.mb-8.max-w-2xl.mx-auto(class='sm:text-xl' style='color: var(--color-text-muted)')
                | Get exact bleed, margin, spine width, and cover dimensions
                | for popular print-on-demand services.
                | Manually verified against official specifications, no AI guesses.

            //- Install command
            div.inline-flex.items-center.gap-3.rounded-lg.px-5.py-3.font-mono.text-sm(
                style='background-color: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text)')
                span npm install printing-services
                UButton(
                    :icon='copied ? "i-lucide-check" : "i-lucide-copy"'
                    :color='copied ? "primary" : "neutral"'
                    variant='ghost'
                    size='xs'
                    class='cursor-pointer'
                    @click='copy_install'
                    :aria-label='"Copy install command"'
                )

            //- Supported services
            p.mt-6.text-sm(style='color: var(--color-text-muted)')
                | Supports
                |
                span(style='font-weight: bold') KDP
                |
                | and
                |
                span(style='font-weight: bold') Lulu

    //- Calculator section
    section.max-w-5xl.mx-auto.px-4.py-12(class='sm:px-6 lg:px-8')
        h2.text-2xl.font-bold.mb-2(style='color: var(--color-text)') Demo
        p.mb-8(style='color: var(--color-text-muted)')
            | This is a simple UI for getting dimensions using the module. No UI is actually included.

        ClientOnly
            DimensionsDemo
            template(#fallback)
                div.text-center.py-12.text-gray-400 Loading calculator...
</template>

<script setup lang="ts">
// Copy the install command to clipboard
const copied = ref(false)
function copy_install() {
    navigator.clipboard.writeText('npm install printing-services')
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
}
</script>
