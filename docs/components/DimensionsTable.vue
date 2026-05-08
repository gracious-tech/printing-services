<template lang="pug">
div.space-y-6

    //- Interior dimensions section
    UCard
        template(#header)
            h3.font-semibold Interior Dimensions
        div.overflow-x-auto
            table.w-full.text-sm
                tbody
                    tr(v-for='row in interior_rows' :key='row.key'
                        class='border-b border-(--color-border) last:border-0')
                        td.py-2.pr-4.font-mono.text-xs.text-(--color-text-muted).whitespace-nowrap
                            | {{ row.key }}
                        td.py-2.pr-4.text-right.tabular-nums.whitespace-nowrap
                            | {{ row.value }} {{ dims.unit }}
                        td.py-2.text-(--color-text-muted).hidden(class='md:table-cell') {{ row.desc }}

    //- Cover dimensions section
    UCard
        template(#header)
            h3.font-semibold Cover Dimensions
        div.overflow-x-auto
            table.w-full.text-sm
                tbody
                    tr(v-for='row in cover_rows' :key='row.key'
                        class='border-b border-(--color-border) last:border-0')
                        td.py-2.pr-4.font-mono.text-xs.text-(--color-text-muted).whitespace-nowrap
                            | {{ row.key }}
                        td.py-2.pr-4.text-right.tabular-nums.whitespace-nowrap
                            | {{ row.value }} {{ dims.unit }}
                        td.py-2.text-(--color-text-muted).hidden(class='md:table-cell') {{ row.desc }}

    //- Cover regions section
    UCard
        template(#header)
            h3.font-semibold Cover Regions
        div.overflow-x-auto
            table.w-full.text-sm
                thead
                    tr.text-(--color-text-muted).text-xs
                        th.py-2.pr-4.text-left.font-medium Region
                        th.py-2.pr-4.text-right.font-medium x
                        th.py-2.pr-4.text-right.font-medium y
                        th.py-2.pr-4.text-right.font-medium w
                        th.py-2.text-right.font-medium h
                tbody
                    tr(v-for='row in region_rows' :key='row.label'
                        class='border-t border-(--color-border)')
                        td.py-2.pr-4.font-medium {{ row.label }}
                        td.py-2.pr-4.text-right.tabular-nums {{ row.region.x }}
                        td.py-2.pr-4.text-right.tabular-nums {{ row.region.y }}
                        td.py-2.pr-4.text-right.tabular-nums {{ row.region.w }}
                        td.py-2.text-right.tabular-nums {{ row.region.h }}

    //- Metadata section
    UCard
        template(#header)
            h3.font-semibold Metadata
        div.overflow-x-auto
            table.w-full.text-sm
                tbody
                    tr(v-for='row in metadata_rows' :key='row.key'
                        class='border-b border-(--color-border) last:border-0')
                        td.py-2.pr-4.font-mono.text-xs.text-(--color-text-muted).whitespace-nowrap
                            | {{ row.key }}
                        td.py-2.pr-4 {{ row.value }}
                        td.py-2.text-(--color-text-muted).hidden(class='md:table-cell') {{ row.desc }}

</template>

<script setup lang="ts">
import type {GetDimensionsResult} from 'printing-services'

const props = defineProps<{
    dims:GetDimensionsResult<string>
}>()

// Metadata rows (non-numeric properties)
const metadata_rows = computed(() => [
    {key: 'unit', value: props.dims.unit,
        desc: 'Unit of all dimensions'},
    {key: 'interior_includes_cover', value: props.dims.interior_includes_cover,
        desc: 'Whether interior PDF includes cover pages'},
    {key: 'interior_blank_pages', value: props.dims.interior_blank_pages,
        desc: 'Blank pages to add before back cover (to ensure it\'s the last page)'},
    {key: 'interior_has_bleed', value: props.dims.interior_has_bleed,
        desc: 'Whether interior pages have bleed'},
    {key: 'cover_has_bleed', value: props.dims.cover_has_bleed,
        desc: 'Whether cover has bleed'},
    {key: 'cover_has_spine', value: props.dims.cover_has_spine,
        desc: 'Whether cover has a spine area'},
    {key: 'cover_has_spine_text', value: props.dims.cover_has_spine_text,
        desc: 'Whether spine is wide enough for text'},
    {key: 'cover_has_flaps', value: props.dims.cover_has_flaps,
        desc: 'Whether cover has dust jacket flaps'},
])

// Interior dimension rows
const interior_rows = computed(() => [
    {key: 'bleed', value: props.dims.interior_bleed,
        desc: 'Bleed beyond trim edge'},
    {key: 'margin', value: props.dims.interior_margin,
        desc: 'Safe margin from trim'},
    {key: 'gutter', value: props.dims.interior_gutter,
        desc: 'Additional inner-edge margin'},
    {key: 'trim_width', value: props.dims.interior_trim_width,
        desc: 'Finished page width'},
    {key: 'trim_height', value: props.dims.interior_trim_height,
        desc: 'Finished page height'},
    {key: 'safe_width', value: props.dims.interior_safe_width,
        desc: 'Safe content width'},
    {key: 'safe_height', value: props.dims.interior_safe_height,
        desc: 'Safe content height'},
    {key: 'total_width', value: props.dims.interior_total_width,
        desc: 'Full page width with bleed'},
    {key: 'total_height', value: props.dims.interior_total_height,
        desc: 'Full page height with bleed'},
])

// Cover dimension rows
const cover_rows = computed(() => [
    {key: 'bleed', value: props.dims.cover_bleed,
        desc: 'Bleed beyond cover trim'},
    {key: 'margin', value: props.dims.cover_margin,
        desc: 'Safe margin from face trim'},
    {key: 'spine', value: props.dims.cover_spine,
        desc: 'Spine width'},
    {key: 'spine_margin', value: props.dims.cover_spine_margin,
        desc: 'Safe margin from spine edges'},
    {key: 'face_width', value: props.dims.cover_face_width,
        desc: 'Width of one cover face'},
    {key: 'face_height', value: props.dims.cover_face_height,
        desc: 'Height of one cover face'},
    {key: 'safe_width', value: props.dims.cover_safe_width,
        desc: 'Safe content width per face'},
    {key: 'safe_height', value: props.dims.cover_safe_height,
        desc: 'Safe content height per face'},
    {key: 'trim_width', value: props.dims.cover_trim_width,
        desc: 'Full cover trim width'},
    {key: 'trim_height', value: props.dims.cover_trim_height,
        desc: 'Cover trim height'},
    {key: 'total_width', value: props.dims.cover_total_width,
        desc: 'Full document width'},
    {key: 'total_height', value: props.dims.cover_total_height,
        desc: 'Full document height'},
])

// Cover region rows
const region_rows = computed(() => [
    {label: 'Back', region: props.dims.cover_region_back},
    {label: 'Spine', region: props.dims.cover_region_spine},
    {label: 'Front', region: props.dims.cover_region_front},
])
</script>
