<template lang="pug">
div.max-w-4xl.mx-auto.px-4.py-12(class='sm:px-6 lg:px-8')
    div.prose.prose-gray.max-w-none(v-if='page')
        ContentRenderer(:value='page')
    p(v-else) Page not found
</template>

<script setup lang="ts">
// Fetch the markdown content for the current route
const route = useRoute()
const slug = (route.params.slug as string[])?.join('/') || 'index'

const {data: page} = await useAsyncData(slug, () => {
    return queryCollection('content').path('/' + slug).first()
})
</script>
