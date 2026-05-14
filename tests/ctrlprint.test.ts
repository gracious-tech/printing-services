// AI-generated

// Tests for ctrlPrint dimensions verified against ctrlPrint artwork guidelines:
// - Bleed: 3mm interior and cover
// - Margin: 5mm interior and cover
// - Gutter: 0 (stitch), 10mm (others)
// - Spine: lookup table by page count, differs for 128gsm vs 150gsm paper
// - No spine text (max 100 pages)

import {describe, test, expect} from 'vitest'
import {get_service} from '../src/index.js'


const ctrlprint = get_service('ctrlprint')


describe('ctrlPrint spine calculation (via get_dimensions)', () => {

    // Spine is only for paperback (perfect bound), zero for all other bindings
    // 128gsm table: [44,3.5] [54,4] [62,4.5] [70,5] [78,5.5] [86,6] [94,6.5] [100,7]
    // 150gsm table: [46,4] [52,4.5] [60,5] [66,5.5] [74,6] [82,6.5] [88,7] [96,7.5] [100,8]

    function get_spine(pages:number, paper_type:'white_coated'|'white_coated_denser'):string {
        const dims = ctrlprint.get_dimensions({
            size: 'a5',
            pages,
            binding_type: 'paperback',
            paper_type,
        })
        return dims.cover_spine.toString()
    }

    describe('128gsm (white_coated)', () => {

        test('40 pages = 3.5mm', () => {
            expect(get_spine(40, 'white_coated')).toBe('3.5')
        })

        test('44 pages = 3.5mm (boundary)', () => {
            expect(get_spine(44, 'white_coated')).toBe('3.5')
        })

        test('45 pages = 4mm (next bracket)', () => {
            expect(get_spine(45, 'white_coated')).toBe('4')
        })

        test('100 pages = 7mm (max)', () => {
            expect(get_spine(100, 'white_coated')).toBe('7')
        })

        test('70 pages = 5mm', () => {
            expect(get_spine(70, 'white_coated')).toBe('5')
        })
    })

    describe('150gsm (white_coated_denser)', () => {

        test('40 pages = 4mm', () => {
            expect(get_spine(40, 'white_coated_denser')).toBe('4')
        })

        test('46 pages = 4mm (boundary)', () => {
            expect(get_spine(46, 'white_coated_denser')).toBe('4')
        })

        test('47 pages = 4.5mm (next bracket)', () => {
            expect(get_spine(47, 'white_coated_denser')).toBe('4.5')
        })

        test('100 pages = 8mm (max)', () => {
            expect(get_spine(100, 'white_coated_denser')).toBe('8')
        })

        test('82 pages = 6.5mm', () => {
            expect(get_spine(82, 'white_coated_denser')).toBe('6.5')
        })
    })

    describe('non-paperback bindings', () => {

        test('wire bound has zero spine', () => {
            const dims = ctrlprint.get_dimensions({
                size: 'a5',
                pages: 40,
                binding_type: 'paperback_wire',
            })
            expect(dims.cover_spine.toString()).toBe('0')
            expect(dims.cover_has_spine).toBe(false)
        })

        test('stitch has zero spine', () => {
            const dims = ctrlprint.get_dimensions({
                size: 'a5',
                pages: 20,
                binding_type: 'paperback_stitch',
                paper_type: 'white_coated',
            })
            expect(dims.cover_spine.toString()).toBe('0')
        })
    })
})


describe('ctrlPrint dimensions - perfect bound A5', () => {

    // A5 = 148x210mm, bleed 3mm, margin 5mm, gutter 10mm
    const dims = ctrlprint.get_dimensions({
        size: 'a5',
        pages: 60,
        binding_type: 'paperback',
        paper_type: 'white_coated',
    })

    test('interior bleed is 3mm', () => {
        expect(dims.interior_bleed.toFixed(0)).toBe('3')
    })

    test('interior margin is 5mm', () => {
        expect(dims.interior_margin.toFixed(0)).toBe('5')
    })

    test('interior gutter is 10mm for non-stitch', () => {
        expect(dims.interior_gutter.toFixed(0)).toBe('10')
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

    test('interior safe subtracts margin and gutter', () => {
        // 148 - 5*2 - 10 = 128
        expect(dims.interior_safe_width.toFixed(0)).toBe('128')
        // 210 - 5*2 = 200
        expect(dims.interior_safe_height.toFixed(0)).toBe('200')
    })

    test('cover bleed is 3mm', () => {
        expect(dims.cover_bleed.toFixed(0)).toBe('3')
    })

    test('cover margin is 5mm', () => {
        expect(dims.cover_margin.toFixed(0)).toBe('5')
    })

    test('spine for 60 pages 128gsm is 4.5mm', () => {
        expect(dims.cover_spine.toFixed(1)).toBe('4.5')
    })

    test('no spine text (max 100 pages, too thin)', () => {
        expect(dims.cover_has_spine_text).toBe(false)
    })

    test('cover trim is two faces plus spine', () => {
        // 148*2 + 4.5 = 300.5
        expect(dims.cover_trim_width.toFixed(1)).toBe('300.5')
        expect(dims.cover_trim_height.toFixed(0)).toBe('210')
    })

    test('cover total includes bleed', () => {
        // 300.5 + 3*2 = 306.5
        expect(dims.cover_total_width.toFixed(1)).toBe('306.5')
        // 210 + 3*2 = 216
        expect(dims.cover_total_height.toFixed(0)).toBe('216')
    })

    test('bleed is on all 4 edges', () => {
        expect(dims.interior_has_bleed).toBe(true)
    })

    test('interior does not include cover', () => {
        expect(dims.interior_includes_cover).toBe(false)
    })
})


describe('ctrlPrint dimensions - stitch A5', () => {

    const dims = ctrlprint.get_dimensions({
        size: 'a5',
        pages: 20,
        binding_type: 'paperback_stitch',
        paper_type: 'white_coated',
    })

    test('gutter is 0 for stitch', () => {
        expect(dims.interior_gutter.toFixed(0)).toBe('0')
    })

    test('interior safe width has no gutter penalty', () => {
        // 148 - 5*2 = 138
        expect(dims.interior_safe_width.toFixed(0)).toBe('138')
    })
})


describe('ctrlPrint unit conversion', () => {

    test('returns inch values when requested', () => {
        const dims = ctrlprint.get_dimensions({
            size: 'a5',
            pages: 40,
            binding_type: 'paperback',
            paper_type: 'white_coated',
            unit: 'inch',
        })
        expect(dims.unit).toBe('inch')
        // 148mm = 5.8268" (approximately)
        expect(dims.interior_trim_width.toFixed(4)).toBe('5.8268')
    })
})
