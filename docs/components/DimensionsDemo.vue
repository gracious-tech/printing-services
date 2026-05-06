<template lang="pug">
div.space-y-8

    //- Input controls
    div.grid.grid-cols-1.gap-4(class='sm:grid-cols-2 lg:grid-cols-3')

        //- Service selector
        UFormField(label='Service' class='sm:col-span-2 lg:col-span-3')
            USelect(
                v-model='service_id'
                :items='service_options'
                class='w-full'
            )
            div(class='flex gap-2 mt-2')
                UButton(
                    :to='service.url_website'
                    target='_blank'
                    variant='soft'
                    size='lg'
                    label='Website')
                UButton(
                    :to='service.url_guide'
                    target='_blank'
                    variant='soft'
                    size='lg'
                    label='Guide')
                UButton(
                    :to='service.url_pricing'
                    target='_blank'
                    variant='soft'
                    size='lg'
                    label='Pricing')

        //- Unit toggle
        UFormField(label='Unit')
            USelect(
                v-model='unit'
                :items='unit_options'
                class='w-full'
            )

        //- Size selector
        UFormField(label='Size')
            USelect(
                v-model='selected_size'
                :items='size_options'
                placeholder='Select...'
                class='w-full'
            )

        //- Pages input
        UFormField(label='Pages')
            UInput(
                v-model='pages_str'
                type='number'
                placeholder='300'
                class='w-full'
            )

        //- Binding selector
        UFormField(label='Binding')
            USelect(
                v-model='selected_binding'
                :items='binding_options'
                placeholder='Select...'
                class='w-full'
            )

        //- Ink type selector (only shown when needed for calculation and multiple options)
        UFormField(v-if='service.cover_calc_requires_ink && ink_options.length > 1' label='Ink Type')
            USelect(
                v-model='selected_ink'
                :items='ink_options'
                placeholder='Select...'
                class='w-full'
            )

        //- Paper type selector (only shown when needed for calculation and multiple options)
        UFormField(v-if='service.cover_calc_requires_paper && paper_options.length > 1' label='Paper Type')
            USelect(
                v-model='selected_paper'
                :items='paper_options'
                placeholder='Select...'
                class='w-full'
            )

    //- Results
    DimensionsTable(v-if='dimensions' :dims='dimensions')
    div.text-sm.py-12.text-center(v-else style='color: var(--color-text-muted)')
        | Select all required options to calculate dimensions
</template>

<script setup lang="ts">
import {get_service, list_services} from 'printing-services'
import type {
    BindingTypeId,
    InkTypeId,
    PaperTypeId,
    SizeId,
    UnitType,
    GetDimensionsResult,
} from 'printing-services'

// All available services
const services = list_services()

// Reactive selections
const service_id = ref(services[0]!.id)
const selected_size = ref<string | undefined>(undefined)
const selected_binding = ref<string | undefined>(undefined)
const selected_ink = ref<string | undefined>(undefined)
const selected_paper = ref<string | undefined>(undefined)
const pages_str = ref('300')
const unit = ref<string>('mm')

// Parsed pages value
const pages = computed(() => {
    const n = parseInt(pages_str.value)
    return isNaN(n) ? 0 : n
})

// Current service
const service = computed(() => {
    return services.find(s => s.id === service_id.value)!
})

// Build options arrays for USelect
const service_options = computed(() => {
    return services.map(s => ({label: s.name, value: s.id}))
})

const size_options = computed(() => {
    return service.value.get_sizes({
        binding_type: selected_binding.value as BindingTypeId | undefined,
        unit: unit.value as UnitType,
    }).map(s => ({
        label: `${s.name} (${s.width.round(3)}\u00D7${s.height.round(3)})`,
        value: s.id,
    }))
})

const binding_options = computed(() => {
    return service.value.get_binding_types({
        pages: pages.value,
        size: selected_size.value as SizeId | undefined,
        ink_type: selected_ink.value as InkTypeId | undefined,
        paper_type: selected_paper.value as PaperTypeId | undefined,
    }).map(b => ({label: b.name, value: b.id}))
})

const ink_options = computed(() => {
    return service.value.get_ink_types({
        binding_type: selected_binding.value as BindingTypeId | undefined,
        paper_type: selected_paper.value as PaperTypeId | undefined,
    }).map(i => ({label: i.name, value: i.id}))
})

const paper_options = computed(() => {
    return service.value.get_paper_types({
        binding_type: selected_binding.value as BindingTypeId | undefined,
        ink_type: selected_ink.value as InkTypeId | undefined,
    }).map(p => ({label: p.name, value: p.id}))
})

const unit_options = [
    {label: 'Millimetres', value: 'mm'},
    {label: 'Inches', value: 'inch'},
]

// Reset all selections when service changes
watch(service_id, () => {
    selected_size.value = undefined
    selected_binding.value = undefined
    selected_ink.value = undefined
    selected_paper.value = undefined
})

// Auto-select when only one option exists, reset if current selection is invalid
watch(binding_options, (list) => {
    if (list.length === 1) {
        selected_binding.value = list[0]!.value
    } else if (selected_binding.value
            && !list.some(b => b.value === selected_binding.value)) {
        selected_binding.value = undefined
    }
}, {immediate: true})

watch(ink_options, (list) => {
    if (list.length === 1) {
        selected_ink.value = list[0]!.value
    } else if (selected_ink.value
            && !list.some(i => i.value === selected_ink.value)) {
        selected_ink.value = undefined
    }
}, {immediate: true})

watch(paper_options, (list) => {
    if (list.length === 1) {
        selected_paper.value = list[0]!.value
    } else if (selected_paper.value
            && !list.some(p => p.value === selected_paper.value)) {
        selected_paper.value = undefined
    }
}, {immediate: true})

watch(size_options, (list) => {
    if (selected_size.value && !list.some(s => s.value === selected_size.value)) {
        selected_size.value = undefined
    }
}, {immediate: true})

// Whether we have enough to calculate
const can_calculate = computed(() => {
    if (!selected_size.value || !selected_binding.value || !pages.value) {
        return false
    }
    if (service.value.cover_calc_requires_paper && !selected_paper.value) {
        return false
    }
    if (service.value.cover_calc_requires_ink && !selected_ink.value) {
        return false
    }
    return true
})

// Calculate dimensions reactively
const dimensions = computed<GetDimensionsResult | null>(() => {
    if (!can_calculate.value) {
        return null
    }
    try {
        return service.value.get_dimensions({
            size: selected_size.value as SizeId,
            pages: pages.value,
            binding_type: selected_binding.value as BindingTypeId,
            paper_type: selected_paper.value as PaperTypeId | undefined,
            ink_type: selected_ink.value as InkTypeId | undefined,
            unit: unit.value as UnitType,
        })
    } catch {
        return null
    }
})
</script>
