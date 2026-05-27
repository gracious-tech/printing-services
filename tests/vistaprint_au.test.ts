// AI-generated

// Tests for VistaPrint Australia stitch-bound booklets
// - Inline cover (interior includes cover pages)
// - Bleed: 3mm, Margin: 3mm
// - No spine (stitch binding)
// - Sizes: A5, A5 Landscape, A4, A4 Landscape

import {describe, test, expect} from 'vitest'
import Big from 'big.js'
import {get_service} from '../src/index.js'


const vistaprint = get_service('vistaprint_au')


describe('VistaPrint AU service properties', () => {

    test('is Australian', () => {
        expect(vistaprint.countries).toEqual(['au'])
    })

    test('has 4 sizes including landscape', () => {
        const sizes = vistaprint.get_sizes()
        expect(sizes.length).toBe(4)
        const ids = sizes.map(s => s.id)
        expect(ids).toContain('a5')
        expect(ids).toContain('a5_landscape')
        expect(ids).toContain('a4')
        expect(ids).toContain('a4_landscape')
    })

    test('has 2 cover types', () => {
        const covers = vistaprint.get_cover_types()
        expect(covers.length).toBe(2)
        const ids = covers.map(c => c.id)
        expect(ids).toContain('glossy_paper')
        expect(ids).toContain('glossy')
    })
})


describe('VistaPrint AU dimensions - A5 booklet', () => {

    // A5 = 148x210mm, bleed 3mm, margin 3mm, stitch binding
    const dims = vistaprint.get_dimensions({
        size: 'a5',
        pages: 20,
        binding_type: 'paperback_stitch',
    })

    test('interior includes cover', () => {
        expect(dims.interior_includes_cover).toBe(true)
    })

    test('interior bleed is 3mm', () => {
        expect(dims.interior_bleed.toFixed(0)).toBe('3')
    })

    test('interior margin is 3mm', () => {
        expect(dims.interior_margin.toFixed(0)).toBe('3')
    })

    test('interior trim is A5', () => {
        expect(dims.interior_trim_width.toFixed(0)).toBe('148')
        expect(dims.interior_trim_height.toFixed(0)).toBe('210')
    })

    test('interior total includes bleed', () => {
        // 148 + 3*2 = 154
        expect(dims.interior_total_width.toFixed(0)).toBe('154')
        // 210 + 3*2 = 216
        expect(dims.interior_total_height.toFixed(0)).toBe('216')
    })

    test('no spine for stitch binding', () => {
        expect(dims.cover_has_spine).toBe(false)
        expect(dims.cover_spine.toFixed(0)).toBe('0')
    })

    test('depth approximated via Lulu paperback formula in mm', () => {
        // Lulu formula: pages/444 + 0.06 (in inches), converted to mm
        const expected_inches = Big(20).div(444).plus(0.06)
        const expected_mm = expected_inches.times('25.4')
        expect(dims.depth.toFixed(3)).toBe(expected_mm.toFixed(3))
    })

    test('cover total for stitch (two faces + bleed, no spine)', () => {
        // (148*2 + 0) + (3+0)*2 = 302
        expect(dims.cover_total_width.toFixed(0)).toBe('302')
        // 210 + 3*2 = 216
        expect(dims.cover_total_height.toFixed(0)).toBe('216')
    })
})


describe('VistaPrint AU landscape dimensions', () => {

    test('A5 landscape has swapped dimensions', () => {
        const dims = vistaprint.get_dimensions({
            size: 'a5_landscape',
            pages: 20,
            binding_type: 'paperback_stitch',
        })
        // A5 landscape = 210x148mm
        expect(dims.interior_trim_width.toFixed(0)).toBe('210')
        expect(dims.interior_trim_height.toFixed(0)).toBe('148')
    })
})
