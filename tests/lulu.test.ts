// AI-generated

// Tests for Lulu dimensions verified against Lulu's documented specifications:
// - Spine (paperback): pages / 444 + 0.06
// - Spine (hardcover): lookup table with specific ranges
// - Interior bleed: 0.125" all sides
// - Interior margin: 0.5"
// - Gutter: 0 for coil/stitch, varies by page count for perfect/hardcover
// - Cover bleed: 0.125" (paperback), 0.625" (hardcover case wrap), 0.25" (hardcover jacket)
// - Cover margin: 0.5" (paperback/jacket), 0.625" (hardcover case wrap)
// - Hardcover overhang: 0.25" width, 0.5" height (case wrap); 0.25" both (jacket)
// - Flaps (jacket only): 2.25" live + 0.5"*2 margin + 0.25" fold safety = 3.5"

import {describe, test, expect} from 'vitest'
import Big from 'big.js'
import lulu from '../src/services/lulu.js'
import {
    calc_interior_gutter,
    calc_depth,
    calc_cover_spine,
    calc_cover_bleed,
    calc_cover_margin,
    calc_cover_overhang_width,
    calc_cover_overhang_height,
    calc_cover_flap,
} from '../src/services/lulu.js'
import type {CalcArgs} from '../src/types.js'


// Helper to create CalcArgs
function args(overrides:Partial<CalcArgs>={}):CalcArgs {
    return {
        size: {width: Big('6'), height: Big('9')},
        pages: 300,
        binding_type: 'paperback',
        ink_type: 'bw',
        paper_type: 'white',
        ...overrides,
    }
}


describe('Lulu gutter calculation', () => {

    test('coil binding has no gutter', () => {
        expect(calc_interior_gutter(args({binding_type: 'paperback_coil'})).toString()).toBe('0')
    })

    test('stitch binding has no gutter', () => {
        expect(calc_interior_gutter(args({binding_type: 'paperback_stitch'})).toString()).toBe('0')
    })

    test('perfect bound <= 60 pages has no gutter', () => {
        expect(calc_interior_gutter(args({pages: 32})).toString()).toBe('0')
        expect(calc_interior_gutter(args({pages: 60})).toString()).toBe('0')
    })

    test('perfect bound 61-150 pages = 0.125"', () => {
        expect(calc_interior_gutter(args({pages: 61})).toString()).toBe('0.125')
        expect(calc_interior_gutter(args({pages: 150})).toString()).toBe('0.125')
    })

    test('perfect bound 151-400 pages = 0.5"', () => {
        expect(calc_interior_gutter(args({pages: 151})).toString()).toBe('0.5')
        expect(calc_interior_gutter(args({pages: 400})).toString()).toBe('0.5')
    })

    test('perfect bound 401-600 pages = 0.625"', () => {
        expect(calc_interior_gutter(args({pages: 401})).toString()).toBe('0.625')
        expect(calc_interior_gutter(args({pages: 600})).toString()).toBe('0.625')
    })

    test('perfect bound 601+ pages = 0.75"', () => {
        expect(calc_interior_gutter(args({pages: 601})).toString()).toBe('0.75')
        expect(calc_interior_gutter(args({pages: 800})).toString()).toBe('0.75')
    })
})


describe('Lulu spine calculation - paperback', () => {

    // Formula: pages / 444 + 0.06
    test('100 pages', () => {
        const spine = calc_cover_spine(args({pages: 100}))
        // 100/444 + 0.06 = 0.2252... + 0.06 = 0.2852...
        const expected = Big(100).div(444).plus(0.06)
        expect(spine.toFixed(6)).toBe(expected.toFixed(6))
    })

    test('300 pages', () => {
        const spine = calc_cover_spine(args({pages: 300}))
        // 300/444 + 0.06 = 0.6757... + 0.06 = 0.7357...
        const expected = Big(300).div(444).plus(0.06)
        expect(spine.toFixed(6)).toBe(expected.toFixed(6))
    })

    test('500 pages', () => {
        const spine = calc_cover_spine(args({pages: 500}))
        const expected = Big(500).div(444).plus(0.06)
        expect(spine.toFixed(6)).toBe(expected.toFixed(6))
    })

    test('32 pages (minimum)', () => {
        const spine = calc_cover_spine(args({pages: 32}))
        const expected = Big(32).div(444).plus(0.06)
        expect(spine.toFixed(6)).toBe(expected.toFixed(6))
    })
})


describe('Lulu spine calculation - hardcover (lookup table)', () => {

    // Verified against Lulu's hardcover spine width specifications
    test('24 pages = 0.25"', () => {
        expect(calc_cover_spine(args({pages: 24, binding_type: 'hardcover'})).toString())
            .toBe('0.25')
    })

    test('84 pages = 0.25" (upper bound of first range)', () => {
        expect(calc_cover_spine(args({pages: 84, binding_type: 'hardcover'})).toString())
            .toBe('0.25')
    })

    test('85 pages = 0.5"', () => {
        expect(calc_cover_spine(args({pages: 85, binding_type: 'hardcover'})).toString())
            .toBe('0.5')
    })

    test('140 pages = 0.5"', () => {
        expect(calc_cover_spine(args({pages: 140, binding_type: 'hardcover'})).toString())
            .toBe('0.5')
    })

    test('141 pages = 0.625"', () => {
        expect(calc_cover_spine(args({pages: 141, binding_type: 'hardcover'})).toString())
            .toBe('0.625')
    })

    test('307 pages = 1"', () => {
        expect(calc_cover_spine(args({pages: 307, binding_type: 'hardcover'})).toString())
            .toBe('1')
    })

    test('800 pages = 2.125" (maximum)', () => {
        expect(calc_cover_spine(args({pages: 800, binding_type: 'hardcover'})).toString())
            .toBe('2.125')
    })

    test('hardcover_jacket uses same table', () => {
        expect(calc_cover_spine(args({pages: 307, binding_type: 'hardcover_jacket'})).toString())
            .toBe('1')
    })
})


describe('Lulu spine calculation - coil/stitch', () => {

    test('coil has no spine', () => {
        expect(calc_cover_spine(args({binding_type: 'paperback_coil'})).toString()).toBe('0')
    })

    test('stitch has no spine', () => {
        expect(calc_cover_spine(args({binding_type: 'paperback_stitch'})).toString()).toBe('0')
    })
})


describe('Lulu depth calculation', () => {

    // Depth uses the paperback formula for non-hardcover bindings (including coil/stitch)
    test('coil depth uses paperback formula', () => {
        const depth = calc_depth(args({binding_type: 'paperback_coil', pages: 100}))
        const expected = Big(100).div(444).plus(0.06)
        expect(depth.toFixed(6)).toBe(expected.toFixed(6))
    })

    test('stitch depth uses paperback formula', () => {
        const depth = calc_depth(args({binding_type: 'paperback_stitch', pages: 50}))
        const expected = Big(50).div(444).plus(0.06)
        expect(depth.toFixed(6)).toBe(expected.toFixed(6))
    })

    test('hardcover depth uses lookup table', () => {
        // 300 pages hardcover = 0.938" (from SPINE_WIDTH_HARDCOVER table)
        expect(calc_depth(args({binding_type: 'hardcover', pages: 300})).toString()).toBe('0.938')
    })

    test('paperback depth same as spine', () => {
        const depth = calc_depth(args({pages: 300}))
        const spine = calc_cover_spine(args({pages: 300}))
        expect(depth.toFixed(6)).toBe(spine.toFixed(6))
    })
})


describe('Lulu cover bleed', () => {

    test('paperback = 0.125"', () => {
        expect(calc_cover_bleed(args()).toString()).toBe('0.125')
    })

    test('hardcover case wrap = 0.625"', () => {
        expect(calc_cover_bleed(args({binding_type: 'hardcover'})).toString()).toBe('0.625')
    })

    test('hardcover jacket = 0.25"', () => {
        expect(calc_cover_bleed(args({binding_type: 'hardcover_jacket'})).toString()).toBe('0.25')
    })

    test('coil = 0.125"', () => {
        expect(calc_cover_bleed(args({binding_type: 'paperback_coil'})).toString()).toBe('0.125')
    })
})


describe('Lulu cover margin', () => {

    test('paperback = 0.5"', () => {
        expect(calc_cover_margin(args()).toString()).toBe('0.5')
    })

    test('hardcover case wrap = 0.625"', () => {
        expect(calc_cover_margin(args({binding_type: 'hardcover'})).toString()).toBe('0.625')
    })

    test('hardcover jacket = 0.5"', () => {
        expect(calc_cover_margin(args({binding_type: 'hardcover_jacket'})).toString()).toBe('0.5')
    })
})


describe('Lulu cover overhang', () => {

    test('paperback has no overhang', () => {
        expect(calc_cover_overhang_width(args()).toString()).toBe('0')
        expect(calc_cover_overhang_height(args()).toString()).toBe('0')
    })

    test('hardcover case wrap: 0.25" width, 0.5" height', () => {
        expect(calc_cover_overhang_width(args({binding_type: 'hardcover'})).toString())
            .toBe('0.25')
        expect(calc_cover_overhang_height(args({binding_type: 'hardcover'})).toString())
            .toBe('0.5')
    })

    test('hardcover jacket: 0.25" width, 0.25" height', () => {
        expect(calc_cover_overhang_width(args({binding_type: 'hardcover_jacket'})).toString())
            .toBe('0.25')
        expect(calc_cover_overhang_height(args({binding_type: 'hardcover_jacket'})).toString())
            .toBe('0.25')
    })
})


describe('Lulu cover flaps', () => {

    test('paperback has no flaps', () => {
        expect(calc_cover_flap(args()).toString()).toBe('0')
    })

    test('hardcover case wrap has no flaps', () => {
        expect(calc_cover_flap(args({binding_type: 'hardcover'})).toString()).toBe('0')
    })

    test('hardcover jacket has 3.5" flaps', () => {
        // 2.25 live + 0.5 margin + 0.5 margin + 0.25 fold safety = 3.5
        expect(calc_cover_flap(args({binding_type: 'hardcover_jacket'})).toString()).toBe('3.5')
    })
})


describe('Lulu get_dimensions - paperback US Trade 300 pages', () => {

    const dims = lulu.get_dimensions({
        size: 'us_trade',
        pages: 300,
        binding_type: 'paperback',
        paper_type: 'white',
        ink_type: 'bw',
    })

    test('unit is inch', () => {
        expect(dims.unit).toBe('inch')
    })

    // Interior
    test('interior bleed is 0.125" all sides', () => {
        expect(dims.interior_bleed.toString()).toBe('0.125')
        expect(dims.interior_has_bleed).toBe(true)
    })

    test('interior margin is 0.5"', () => {
        expect(dims.interior_margin.toString()).toBe('0.5')
    })

    test('interior gutter is 0.5" (151-400 page range)', () => {
        expect(dims.interior_gutter.toString()).toBe('0.5')
    })

    test('interior trim is 6" x 9"', () => {
        expect(dims.interior_trim_width.toString()).toBe('6')
        expect(dims.interior_trim_height.toString()).toBe('9')
    })

    test('interior total = trim + bleed*2 on both axes', () => {
        // 6 + 0.125*2 = 6.25
        expect(dims.interior_total_width.toString()).toBe('6.25')
        // 9 + 0.125*2 = 9.25
        expect(dims.interior_total_height.toString()).toBe('9.25')
    })

    test('interior safe area accounts for margin and gutter', () => {
        // safe_width = 6 - 0.5*2 - 0.5 = 4.5
        expect(dims.interior_safe_width.toString()).toBe('4.5')
        // safe_height = 9 - 0.5*2 = 8
        expect(dims.interior_safe_height.toString()).toBe('8')
    })

    // Cover
    test('cover bleed is 0.125"', () => {
        expect(dims.cover_bleed.toString()).toBe('0.125')
    })

    test('cover margin is 0.5"', () => {
        expect(dims.cover_margin.toString()).toBe('0.5')
    })

    test('cover spine follows formula', () => {
        const expected = Big(300).div(444).plus(0.06)
        expect(dims.cover_spine.toFixed(6)).toBe(expected.toFixed(6))
    })

    test('cover spine margin is 0.125"', () => {
        expect(dims.cover_spine_margin.toString()).toBe('0.125')
    })

    test('cover face equals interior trim (no overhang for paperback)', () => {
        expect(dims.cover_face_width.toString()).toBe('6')
        expect(dims.cover_face_height.toString()).toBe('9')
    })

    test('cover trim width = face*2 + spine', () => {
        const spine = Big(300).div(444).plus(0.06)
        const expected = Big('6').times(2).plus(spine)
        expect(dims.cover_trim_width.toFixed(6)).toBe(expected.toFixed(6))
    })

    test('cover total = trim + bleed*2', () => {
        const spine = Big(300).div(444).plus(0.06)
        const trim_w = Big('6').times(2).plus(spine)
        const expected_w = trim_w.plus(Big('0.125').times(2))
        expect(dims.cover_total_width.toFixed(6)).toBe(expected_w.toFixed(6))
        // height = 9 + 0.125*2 = 9.25
        expect(dims.cover_total_height.toString()).toBe('9.25')
    })

    test('no flaps', () => {
        expect(dims.cover_has_flaps).toBe(false)
    })

    test('has spine text (300 >= 82)', () => {
        expect(dims.cover_has_spine_text).toBe(true)
    })

    test('depth equals spine for paperback', () => {
        const expected = Big(300).div(444).plus(0.06)
        expect(dims.depth.toFixed(6)).toBe(expected.toFixed(6))
    })
})


describe('Lulu get_dimensions - hardcover case wrap US Trade', () => {

    const dims = lulu.get_dimensions({
        size: 'us_trade',
        pages: 300,
        binding_type: 'hardcover',
        paper_type: 'white',
        ink_type: 'bw',
    })

    test('cover bleed is 0.625" (case wrap)', () => {
        expect(dims.cover_bleed.toString()).toBe('0.625')
    })

    test('cover margin is 0.625"', () => {
        expect(dims.cover_margin.toString()).toBe('0.625')
    })

    test('hardcover spine from lookup table (279-306 range) = 0.938"', () => {
        expect(dims.cover_spine.toString()).toBe('0.938')
    })

    test('face overhangs trim by 0.25" width and 0.5" height', () => {
        // face_width = 6 + 0.25 = 6.25
        expect(dims.cover_face_width.toString()).toBe('6.25')
        // face_height = 9 + 0.5 = 9.5
        expect(dims.cover_face_height.toString()).toBe('9.5')
    })

    test('cover total dimensions', () => {
        // trim_width = 6.25*2 + 0.938 = 13.438
        expect(dims.cover_trim_width.toString()).toBe('13.438')
        // total_width = 13.438 + 0.625*2 = 14.688
        expect(dims.cover_total_width.toString()).toBe('14.688')
        // total_height = 9.5 + 0.625*2 = 10.75
        expect(dims.cover_total_height.toString()).toBe('10.75')
    })

    test('no flaps for case wrap', () => {
        expect(dims.cover_has_flaps).toBe(false)
    })

    test('depth equals spine for hardcover', () => {
        expect(dims.depth.toString()).toBe('0.938')
    })
})


describe('Lulu get_dimensions - hardcover jacket US Trade', () => {

    const dims = lulu.get_dimensions({
        size: 'us_trade',
        pages: 300,
        binding_type: 'hardcover_jacket',
        paper_type: 'white',
        ink_type: 'bw',
    })

    test('cover bleed is 0.25"', () => {
        expect(dims.cover_bleed.toString()).toBe('0.25')
    })

    test('cover margin is 0.5"', () => {
        expect(dims.cover_margin.toString()).toBe('0.5')
    })

    test('face overhangs by 0.25" width and 0.25" height', () => {
        expect(dims.cover_face_width.toString()).toBe('6.25')
        expect(dims.cover_face_height.toString()).toBe('9.25')
    })

    test('has flaps of 3.5" each', () => {
        expect(dims.cover_has_flaps).toBe(true)
    })

    test('cover total includes flaps', () => {
        // trim_width = 6.25*2 + 0.938 = 13.438
        // total_width = 13.438 + (0.25 + 3.5)*2 = 13.438 + 7.5 = 20.938
        expect(dims.cover_total_width.toString()).toBe('20.938')
        // total_height = 9.25 + 0.25*2 = 9.75
        expect(dims.cover_total_height.toString()).toBe('9.75')
    })
})


describe('Lulu get_dimensions - coil depth (no spine)', () => {

    const dims = lulu.get_dimensions({
        size: 'us_trade',
        pages: 100,
        binding_type: 'paperback_coil',
        paper_type: 'white',
        ink_type: 'bw',
    })

    test('coil has no spine', () => {
        expect(dims.cover_has_spine).toBe(false)
        expect(dims.cover_spine.toString()).toBe('0')
    })

    test('coil still has depth (approximated via paperback formula)', () => {
        const expected = Big(100).div(444).plus(0.06)
        expect(dims.depth.toFixed(6)).toBe(expected.toFixed(6))
    })
})


describe('Lulu get_dimensions - spine text threshold', () => {

    test('no spine text at 81 pages', () => {
        const dims = lulu.get_dimensions({
            size: 'us_trade',
            pages: 81,
            binding_type: 'paperback',
            paper_type: 'white',
            ink_type: 'bw',
        })
        expect(dims.cover_has_spine_text).toBe(false)
    })

    test('spine text at 82 pages', () => {
        const dims = lulu.get_dimensions({
            size: 'us_trade',
            pages: 82,
            binding_type: 'paperback',
            paper_type: 'white',
            ink_type: 'bw',
        })
        expect(dims.cover_has_spine_text).toBe(true)
    })
})


describe('Lulu get_dimensions - cover regions', () => {

    const dims = lulu.get_dimensions({
        size: 'us_trade',
        pages: 300,
        binding_type: 'paperback',
        paper_type: 'white',
        ink_type: 'bw',
    })
    const spine = Big(300).div(444).plus(0.06)

    test('back cover region starts after bleed', () => {
        expect(dims.cover_region_back.x.toString()).toBe('0.125')
        expect(dims.cover_region_back.y.toString()).toBe('0.125')
        expect(dims.cover_region_back.w.toString()).toBe('6')
        expect(dims.cover_region_back.h.toString()).toBe('9')
    })

    test('spine region starts after back cover', () => {
        const expected_x = Big('0.125').plus('6')
        expect(dims.cover_region_spine.x.toFixed(6)).toBe(expected_x.toFixed(6))
        expect(dims.cover_region_spine.w.toFixed(6)).toBe(spine.toFixed(6))
        expect(dims.cover_region_spine.h.toString()).toBe('9')
    })

    test('front cover region starts after spine', () => {
        const expected_x = Big('0.125').plus('6').plus(spine)
        expect(dims.cover_region_front.x.toFixed(6)).toBe(expected_x.toFixed(6))
        expect(dims.cover_region_front.w.toString()).toBe('6')
        expect(dims.cover_region_front.h.toString()).toBe('9')
    })
})


describe('Lulu get_dimensions - unit conversion', () => {

    test('returns mm when requested', () => {
        const dims = lulu.get_dimensions({
            size: 'us_trade',
            pages: 100,
            binding_type: 'paperback',
            paper_type: 'white',
            ink_type: 'bw',
            unit: 'mm',
        })
        expect(dims.unit).toBe('mm')
        // 6" = 152.4mm
        expect(dims.interior_trim_width.toFixed(1)).toBe('152.4')
        // 9" = 228.6mm
        expect(dims.interior_trim_height.toFixed(1)).toBe('228.6')
        // bleed 0.125" = 3.175mm
        expect(dims.interior_bleed.toFixed(3)).toBe('3.175')
    })
})
