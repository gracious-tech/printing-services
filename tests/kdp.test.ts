// AI-generated

// Tests for KDP dimensions verified against official KDP documentation:
// - Spine: white paper 0.002252"/page, cream 0.0025"/page, premium color 0.002347"/page
// - Interior bleed: 0.125" on outer 3 edges only (not gutter edge)
// - Interior margin: 0.25" minimum outside, gutter varies by page count
// - Gutter (incl. margin): 24-150=0.375", 151-300=0.5", 301-500=0.625", 501-700=0.75", 701+=0.875"
// - Cover bleed: 0.125" paperback, 0.591" hardcover (wrap)
// - Cover margin: 0.125" paperback, 0.394" hardcover (hinge)
// - Spine text: allowed when pages > 79

import {describe, test, expect} from 'vitest'
import Big from 'big.js'
import kdp from '../src/services/kdp.js'
import {calc_gutter_kdp_amount, calc_cover_spine} from '../src/services/kdp.js'
import type {CalcArgs} from '../src/types.js'


describe('KDP gutter calculation (official KDP values)', () => {

    // KDP documents gutter INCLUDING the 0.25" margin
    // The function returns this full value

    test('24-150 pages = 0.375"', () => {
        expect(calc_gutter_kdp_amount(24).toString()).toBe('0.375')
        expect(calc_gutter_kdp_amount(100).toString()).toBe('0.375')
        expect(calc_gutter_kdp_amount(150).toString()).toBe('0.375')
    })

    test('151-300 pages = 0.5"', () => {
        expect(calc_gutter_kdp_amount(151).toString()).toBe('0.5')
        expect(calc_gutter_kdp_amount(200).toString()).toBe('0.5')
        expect(calc_gutter_kdp_amount(300).toString()).toBe('0.5')
    })

    test('301-500 pages = 0.625"', () => {
        expect(calc_gutter_kdp_amount(301).toString()).toBe('0.625')
        expect(calc_gutter_kdp_amount(400).toString()).toBe('0.625')
        expect(calc_gutter_kdp_amount(500).toString()).toBe('0.625')
    })

    test('501-700 pages = 0.75"', () => {
        expect(calc_gutter_kdp_amount(501).toString()).toBe('0.75')
        expect(calc_gutter_kdp_amount(600).toString()).toBe('0.75')
        expect(calc_gutter_kdp_amount(700).toString()).toBe('0.75')
    })

    test('701+ pages = 0.875"', () => {
        expect(calc_gutter_kdp_amount(701).toString()).toBe('0.875')
        expect(calc_gutter_kdp_amount(828).toString()).toBe('0.875')
    })
})


describe('KDP spine calculation (official KDP formulas)', () => {

    // Paperback white paper: pages * 0.002252"
    test('paperback white 300 pages', () => {
        const args:CalcArgs = {
            size: {width: Big('6'), height: Big('9')},
            pages: 300,
            binding_type: 'paperback',
            ink_type: 'bw',
            paper_type: 'white',
        }
        // 300 * 0.002252 = 0.6756
        expect(calc_cover_spine(args).toFixed(4)).toBe('0.6756')
    })

    // Paperback cream paper: pages * 0.0025"
    test('paperback cream 300 pages', () => {
        const args:CalcArgs = {
            size: {width: Big('6'), height: Big('9')},
            pages: 300,
            binding_type: 'paperback',
            ink_type: 'bw',
            paper_type: 'cream',
        }
        // 300 * 0.0025 = 0.75
        expect(calc_cover_spine(args).toFixed(4)).toBe('0.7500')
    })

    // Paperback premium color: pages * 0.002347"
    test('paperback premium color 300 pages', () => {
        const args:CalcArgs = {
            size: {width: Big('6'), height: Big('9')},
            pages: 300,
            binding_type: 'paperback',
            ink_type: 'color_premium',
            paper_type: 'white',
        }
        // 300 * 0.002347 = 0.7041
        expect(calc_cover_spine(args).toFixed(4)).toBe('0.7041')
    })

    // Hardcover adds 0.189" to spine
    test('hardcover white 300 pages', () => {
        const args:CalcArgs = {
            size: {width: Big('6'), height: Big('9')},
            pages: 300,
            binding_type: 'hardcover',
            ink_type: 'bw',
            paper_type: 'white',
        }
        // 300 * 0.002252 + 0.189 = 0.8646
        expect(calc_cover_spine(args).toFixed(4)).toBe('0.8646')
    })

    test('paperback white 100 pages', () => {
        const args:CalcArgs = {
            size: {width: Big('6'), height: Big('9')},
            pages: 100,
            binding_type: 'paperback',
            ink_type: 'bw',
            paper_type: 'white',
        }
        // 100 * 0.002252 = 0.2252
        expect(calc_cover_spine(args).toFixed(4)).toBe('0.2252')
    })
})


describe('KDP get_dimensions - paperback US Trade', () => {

    // US Trade 6x9, 300 pages, paperback, white paper, BW ink
    const dims = kdp.get_dimensions({
        size: 'us_trade',
        pages: 300,
        binding_type: 'paperback',
        paper_type: 'white',
        ink_type: 'bw',
    })

    test('unit is inch', () => {
        expect(dims.unit).toBe('inch')
    })

    // Interior dimensions
    test('interior bleed is 0.125"', () => {
        expect(dims.interior_bleed.toString()).toBe('0.125')
    })

    test('interior has bleed outer-only', () => {
        expect(dims.interior_has_bleed).toBe('outer-only')
    })

    test('interior margin is 0.25"', () => {
        expect(dims.interior_margin.toString()).toBe('0.25')
    })

    test('interior gutter is 0.25" (KDP 0.5" minus 0.25" margin)', () => {
        // 151-300 pages: KDP gutter = 0.5", minus margin 0.25" = 0.25"
        expect(dims.interior_gutter.toString()).toBe('0.25')
    })

    test('interior trim is 6" x 9"', () => {
        expect(dims.interior_trim_width.toString()).toBe('6')
        expect(dims.interior_trim_height.toString()).toBe('9')
    })

    test('interior total width = trim + bleed on outer edge only = 6.125"', () => {
        // Outer-only: bleed added to one side only
        expect(dims.interior_total_width.toString()).toBe('6.125')
    })

    test('interior total height = trim + bleed*2 = 9.25"', () => {
        // Bleed on top and bottom
        expect(dims.interior_total_height.toString()).toBe('9.25')
    })

    test('interior safe area accounts for margin and gutter', () => {
        // safe_width = trim - margin*2 - gutter = 6 - 0.5 - 0.25 = 5.25
        expect(dims.interior_safe_width.toString()).toBe('5.25')
        // safe_height = trim - margin*2 = 9 - 0.5 = 8.5
        expect(dims.interior_safe_height.toString()).toBe('8.5')
    })

    // Cover dimensions
    test('cover bleed is 0.125" for paperback', () => {
        expect(dims.cover_bleed.toString()).toBe('0.125')
    })

    test('cover margin is 0.125" for paperback', () => {
        expect(dims.cover_margin.toString()).toBe('0.125')
    })

    test('cover spine is 0.6756" (300 * 0.002252)', () => {
        expect(dims.cover_spine.toFixed(4)).toBe('0.6756')
    })

    test('cover spine margin is 0.0625"', () => {
        expect(dims.cover_spine_margin.toString()).toBe('0.0625')
    })

    test('cover has spine text (300 > 79)', () => {
        expect(dims.cover_has_spine_text).toBe(true)
    })

    test('cover face equals interior trim for paperback (no overhang)', () => {
        expect(dims.cover_face_width.toString()).toBe('6')
        expect(dims.cover_face_height.toString()).toBe('9')
    })

    test('cover trim width = face*2 + spine', () => {
        // 6*2 + 0.6756 = 12.6756
        expect(dims.cover_trim_width.toFixed(4)).toBe('12.6756')
    })

    test('cover total width = trim + bleed*2', () => {
        // 12.6756 + 0.125*2 = 12.9256
        expect(dims.cover_total_width.toFixed(4)).toBe('12.9256')
    })

    test('cover total height = face + bleed*2 = 9.25"', () => {
        expect(dims.cover_total_height.toString()).toBe('9.25')
    })

    test('no flaps for paperback', () => {
        expect(dims.cover_has_flaps).toBe(false)
    })

    test('interior does not include cover', () => {
        expect(dims.interior_includes_cover).toBe(false)
    })
})


describe('KDP get_dimensions - hardcover US Trade', () => {

    // US Trade 6x9, 300 pages, hardcover, white paper, BW ink
    const dims = kdp.get_dimensions({
        size: 'us_trade',
        pages: 300,
        binding_type: 'hardcover',
        paper_type: 'white',
        ink_type: 'bw',
    })

    test('cover bleed is 0.591" (wrap) for hardcover', () => {
        expect(dims.cover_bleed.toString()).toBe('0.591')
    })

    test('cover margin is 0.394" (hinge) for hardcover', () => {
        expect(dims.cover_margin.toString()).toBe('0.394')
    })

    test('hardcover spine includes 0.189" addition', () => {
        // 300 * 0.002252 + 0.189 = 0.8646
        expect(dims.cover_spine.toFixed(4)).toBe('0.8646')
    })

    test('hardcover face overhangs interior trim', () => {
        // width overhang: 0.197"
        expect(dims.cover_face_width.toFixed(3)).toBe('6.197')
        // height overhang: 0.236"
        expect(dims.cover_face_height.toFixed(3)).toBe('9.236')
    })

    test('cover total includes wrap bleed on both sides', () => {
        // trim_width = 6.197*2 + 0.8646 = 13.2586
        // total_width = 13.2586 + 0.591*2 = 14.4406
        expect(dims.cover_total_width.toFixed(4)).toBe('14.4406')
        // total_height = 9.236 + 0.591*2 = 10.418
        expect(dims.cover_total_height.toFixed(3)).toBe('10.418')
    })
})


describe('KDP get_dimensions - spine text threshold', () => {

    test('no spine text at 79 pages', () => {
        const dims = kdp.get_dimensions({
            size: 'us_trade',
            pages: 79,
            binding_type: 'paperback',
            paper_type: 'white',
            ink_type: 'bw',
        })
        expect(dims.cover_has_spine_text).toBe(false)
    })

    test('spine text at 80 pages', () => {
        const dims = kdp.get_dimensions({
            size: 'us_trade',
            pages: 80,
            binding_type: 'paperback',
            paper_type: 'white',
            ink_type: 'bw',
        })
        expect(dims.cover_has_spine_text).toBe(true)
    })
})


describe('KDP get_dimensions - unit conversion', () => {

    test('returns mm when requested', () => {
        const dims = kdp.get_dimensions({
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
