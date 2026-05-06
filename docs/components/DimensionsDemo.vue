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

        //- Ink type selector
        UFormField(label='Ink Type')
            USelect(
                v-model='selected_ink'
                :items='ink_options'
                :disabled='!service.cover_calc_requires_ink'
                placeholder='Select...'
                class='w-full'
            )

        //- Paper type selector
        UFormField(label='Paper Type')
            USelect(
                v-model='selected_paper'
                :items='paper_options'
                :disabled='!service.cover_calc_requires_paper'
                placeholder='Select...'
                class='w-full'
            )

    //- Results
    DimensionsTable(v-if='dimensions' :dims='dimensions')
    div.text-sm.py-12.text-center(v-else-if='warning' style='color: var(--color-text-muted)')
        | {{ warning }}
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

// Build options with disabled state for invalid combinations
const size_options = computed(() => {
    const valid = new Set(service.value.get_sizes({
        binding_type: selected_binding.value as BindingTypeId | undefined,
        unit: unit.value as UnitType,
    }).map(s => s.id))
    return service.value.get_sizes({unit: unit.value as UnitType}).map(s => ({
        label: `${s.name} (${s.width.round(3)}\u00D7${s.height.round(3)})`,
        value: s.id,
        disabled: !valid.has(s.id),
    }))
})

const binding_options = computed(() => {
    const valid = new Set(service.value.get_binding_types({
        pages: pages.value,
        size: selected_size.value as SizeId | undefined,
        ink_type: selected_ink.value as InkTypeId | undefined,
        paper_type: selected_paper.value as PaperTypeId | undefined,
    }).map(b => b.id))
    return service.value.get_binding_types().map(b => ({
        label: b.name,
        value: b.id,
        disabled: !valid.has(b.id),
    }))
})

const ink_options = computed(() => {
    const valid = new Set(service.value.get_ink_types({
        binding_type: selected_binding.value as BindingTypeId | undefined,
        paper_type: selected_paper.value as PaperTypeId | undefined,
    }).map(i => i.id))
    return service.value.get_ink_types().map(i => ({
        label: i.name,
        value: i.id,
        disabled: !valid.has(i.id),
    }))
})

const paper_options = computed(() => {
    const valid = new Set(service.value.get_paper_types({
        binding_type: selected_binding.value as BindingTypeId | undefined,
        ink_type: selected_ink.value as InkTypeId | undefined,
    }).map(p => p.id))
    return service.value.get_paper_types().map(p => ({
        label: p.name,
        value: p.id,
        disabled: !valid.has(p.id),
    }))
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

// Auto-select when only one enabled option, reset if current selection becomes disabled
watch(binding_options, (list) => {
    const enabled = list.filter(b => !b.disabled)
    if (enabled.length === 1) {
        selected_binding.value = enabled[0]!.value
    } else if (selected_binding.value
            && !enabled.some(b => b.value === selected_binding.value)) {
        selected_binding.value = undefined
    }
}, {immediate: true})

watch(ink_options, (list) => {
    const enabled = list.filter(i => !i.disabled)
    if (enabled.length === 1) {
        selected_ink.value = enabled[0]!.value
    } else if (selected_ink.value
            && !enabled.some(i => i.value === selected_ink.value)) {
        selected_ink.value = undefined
    }
}, {immediate: true})

watch(paper_options, (list) => {
    const enabled = list.filter(p => !p.disabled)
    if (enabled.length === 1) {
        selected_paper.value = enabled[0]!.value
    } else if (selected_paper.value
            && !enabled.some(p => p.value === selected_paper.value)) {
        selected_paper.value = undefined
    }
}, {immediate: true})

watch(size_options, (list) => {
    const enabled = list.filter(s => !s.disabled)
    if (selected_size.value && !enabled.some(s => s.value === selected_size.value)) {
        selected_size.value = undefined
    }
}, {immediate: true})

// Calculate dimensions and capture any error
const calc_result = computed<{result:GetDimensionsResult | null, error:string | null}>(() => {
    if (!selected_size.value || !selected_binding.value || !pages.value) {
        return {result: null, error: null}
    }
    if (service.value.cover_calc_requires_paper && !selected_paper.value) {
        return {result: null, error: null}
    }
    if (service.value.cover_calc_requires_ink && !selected_ink.value) {
        return {result: null, error: null}
    }
    try {
        return {
            result: service.value.get_dimensions({
                size: selected_size.value as SizeId,
                pages: pages.value,
                binding_type: selected_binding.value as BindingTypeId,
                paper_type: selected_paper.value as PaperTypeId | undefined,
                ink_type: selected_ink.value as InkTypeId | undefined,
                unit: unit.value as UnitType,
            }),
            error: null,
        }
    } catch (e) {
        return {result: null, error: e instanceof Error ? e.message : 'Invalid combination'}
    }
})

const dimensions = computed(() => calc_result.value.result)

// Warning message explaining why results aren't shown
const warning = computed<string | null>(() => {
    if (!selected_binding.value) {
        if (pages.value && binding_options.value.every(b => b.disabled)) {
            return 'No binding type supports that number of pages'
        }
        return 'Select a binding type'
    }
    if (!selected_size.value) {
        if (binding_options.value.find(b => b.value === selected_binding.value)?.disabled) {
            return 'Selected binding is not available for this size'
        }
        return 'Select a size'
    }
    if (!pages.value) {
        return 'Enter number of pages'
    }
    if (service.value.cover_calc_requires_ink && !selected_ink.value) {
        return 'Select an ink type'
    }
    if (service.value.cover_calc_requires_paper && !selected_paper.value) {
        return 'Select a paper type'
    }
    return calc_result.value.error
})
</script>
