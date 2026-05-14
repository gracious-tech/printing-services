// AI-generated

// Tests for Officeworks stitch-bound booklets
// - Inline cover (interior includes cover pages)
// - Bleed: 5mm, Margin: 5mm
// - No spine (stitch binding)
// - Sizes: A5, A4 only

import {describe, test, expect} from 'vitest'
import {get_service} from '../src/index.js'


const officeworks = get_service('officeworks')


describe('Officeworks service properties', () => {

    test('is Australian', () => {
        expect(officeworks.countries).toEqual(['au'])
    })

    test('has 2 sizes', () => {
        expect(officeworks.get_sizes().length).toBe(2)
        const ids = officeworks.get_sizes().map(s => s.id)
        expect(ids).toContain('a5')
        expect(ids).toContain('a4')
    })

    test('only stitch binding', () => {
        const bindings = officeworks.get_binding_types()
        expect(bindings.length).toBe(1)
        expect(bindings[0]!.id).toBe('paperback_stitch')
    })
})


describe('Officeworks dimensions - A5 booklet', () => {

    // A5 = 148x210mm, bleed 5mm, margin 5mm, stitch binding
    const dims = officeworks.get_dimensions({
        size: 'a5',
        pages: 20,
        binding_type: 'paperback_stitch',
    })

    test('interior includes cover', () => {
        expect(dims.interior_includes_cover).toBe(true)
    })

    test('interior bleed is 5mm', () => {
        expect(dims.interior_bleed.toFixed(0)).toBe('5')
    })

    test('interior margin is 5mm', () => {
        expect(dims.interior_margin.toFixed(0)).toBe('5')
    })

    test('no gutter', () => {
        expect(dims.interior_gutter.toFixed(0)).toBe('0')
    })

    test('interior trim is A5', () => {
        expect(dims.interior_trim_width.toFixed(0)).toBe('148')
        expect(dims.interior_trim_height.toFixed(0)).toBe('210')
    })

    test('interior total includes bleed on all sides', () => {
        // 148 + 5*2 = 158
        expect(dims.interior_total_width.toFixed(0)).toBe('158')
        // 210 + 5*2 = 220
        expect(dims.interior_total_height.toFixed(0)).toBe('220')
    })

    test('no spine for stitch binding', () => {
        expect(dims.cover_has_spine).toBe(false)
        expect(dims.cover_spine.toFixed(0)).toBe('0')
        expect(dims.cover_has_spine_text).toBe(false)
    })

    test('no flaps or overhang', () => {
        expect(dims.cover_has_flaps).toBe(false)
        expect(dims.cover_face_width.toFixed(0)).toBe('148')
        expect(dims.cover_face_height.toFixed(0)).toBe('210')
    })

    test('cover total is two faces plus bleed, no spine', () => {
        // (148*2 + 0) + (5+0)*2 = 306
        expect(dims.cover_total_width.toFixed(0)).toBe('306')
        // 210 + 5*2 = 220
        expect(dims.cover_total_height.toFixed(0)).toBe('220')
    })
})


describe('Officeworks blank pages for 4-page multiple', () => {

    test('20 pages needs 0 blank pages (20+2 covers = 22, need 24, so 2 blanks)', () => {
        const dims = officeworks.get_dimensions({
            size: 'a5',
            pages: 20,
            binding_type: 'paperback_stitch',
        })
        expect(dims.interior_blank_pages).toBe(2)
    })

    test('22 pages needs 0 blank pages (22+2 = 24, already multiple of 4)', () => {
        const dims = officeworks.get_dimensions({
            size: 'a5',
            pages: 22,
            binding_type: 'paperback_stitch',
        })
        expect(dims.interior_blank_pages).toBe(0)
    })

    test('10 pages needs 0 blank pages (10+2 = 12, already multiple of 4)', () => {
        const dims = officeworks.get_dimensions({
            size: 'a5',
            pages: 10,
            binding_type: 'paperback_stitch',
        })
        expect(dims.interior_blank_pages).toBe(0)
    })

    test('8 pages needs 2 blank pages (8+2 = 10, need 12)', () => {
        const dims = officeworks.get_dimensions({
            size: 'a5',
            pages: 8,
            binding_type: 'paperback_stitch',
        })
        expect(dims.interior_blank_pages).toBe(2)
    })
})
