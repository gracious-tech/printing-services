// AI-generated

import {describe, test, expect} from 'vitest'
import Big from 'big.js'
import {get_custom_dimensions} from '../src/custom.js'


describe('get_custom_dimensions', () => {

    describe('with standard size id', () => {

        test('resolves size id and converts to requested unit', () => {
            // A5 is natively 148x210mm
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: 'a5',
                bleed: 3,
                spine: 8,
            })
            expect(dims.interior_trim_width.toFixed(0)).toBe('148')
            expect(dims.interior_trim_height.toFixed(0)).toBe('210')
            expect(dims.unit).toBe('mm')
        })

        test('converts size from native unit to requested unit', () => {
            // US Trade is natively 6x9 inch = 152.4x228.6mm
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: 'us_trade',
                bleed: 3,
                spine: 10,
            })
            expect(dims.interior_trim_width.toFixed(1)).toBe('152.4')
            expect(dims.interior_trim_height.toFixed(1)).toBe('228.6')
        })

        test('throws on invalid size id', () => {
            expect(() => get_custom_dimensions({
                unit: 'mm',
                size: 'nonexistent' as never,
                bleed: 3,
                spine: 8,
            })).toThrow('Not a valid size id')
        })
    })

    describe('with custom size', () => {

        test('uses provided width and height directly', () => {
            const dims = get_custom_dimensions({
                unit: 'inch',
                size: {width: 6, height: 9},
                bleed: 0.125,
                spine: 0.5,
            })
            expect(dims.interior_trim_width.toFixed(0)).toBe('6')
            expect(dims.interior_trim_height.toFixed(0)).toBe('9')
        })
    })

    describe('bleed and spine', () => {

        test('applies bleed to interior and cover', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 8,
            })
            expect(dims.interior_bleed.toFixed(0)).toBe('3')
            expect(dims.cover_bleed.toFixed(0)).toBe('3')
        })

        test('applies spine width', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 8,
            })
            expect(dims.cover_spine.toFixed(0)).toBe('8')
            expect(dims.cover_has_spine).toBe(true)
        })

        test('zero spine means no spine', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 0,
            })
            expect(dims.cover_has_spine).toBe(false)
        })

        test('depth equals spine when spine >= 1mm', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 8,
            })
            expect(dims.depth.toFixed(0)).toBe('8')
        })

        test('depth has 1mm minimum when spine is 0', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 0,
            })
            expect(dims.depth.toFixed(0)).toBe('1')
        })

        test('depth has 1mm minimum in inches', () => {
            const dims = get_custom_dimensions({
                unit: 'inch',
                size: {width: 6, height: 9},
                bleed: 0.125,
                spine: 0,
            })
            // 1mm = 1/25.4 = 0.03937...
            expect(dims.depth.toFixed(4)).toBe('0.0394')
        })

        test('depth clamps small spine to 1mm', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 0.5,
            })
            expect(dims.depth.toFixed(0)).toBe('1')
        })
    })

    describe('defaults', () => {

        test('margin defaults to 0.5 inches converted to unit', () => {
            // 0.5 inch = 12.7mm
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 8,
            })
            expect(dims.interior_margin.toFixed(1)).toBe('12.7')
            expect(dims.cover_margin.toFixed(1)).toBe('12.7')
        })

        test('margin default in inches is 0.5', () => {
            const dims = get_custom_dimensions({
                unit: 'inch',
                size: {width: 6, height: 9},
                bleed: 0.125,
                spine: 0.5,
            })
            expect(dims.interior_margin.toFixed(1)).toBe('0.5')
        })

        test('custom margin overrides default', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 8,
                margin: 5,
            })
            expect(dims.interior_margin.toFixed(0)).toBe('5')
            expect(dims.cover_margin.toFixed(0)).toBe('5')
        })

        test('gutter defaults to 0', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 8,
            })
            expect(dims.interior_gutter.toFixed(0)).toBe('0')
        })

        test('custom gutter overrides default', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: {width: 148, height: 210},
                bleed: 3,
                spine: 8,
                gutter: 10,
            })
            expect(dims.interior_gutter.toFixed(0)).toBe('10')
        })
    })

    describe('dimension calculations', () => {

        // Use known values to verify math: 148x210mm, 3mm bleed, 5mm margin, 8mm spine
        const dims = get_custom_dimensions({
            unit: 'mm',
            size: {width: 148, height: 210},
            bleed: 3,
            spine: 8,
            margin: 5,
        })

        test('interior total includes bleed on both sides', () => {
            // 148 + 3*2 = 154
            expect(dims.interior_total_width.toFixed(0)).toBe('154')
            // 210 + 3*2 = 216
            expect(dims.interior_total_height.toFixed(0)).toBe('216')
        })

        test('interior safe area subtracts margin and gutter', () => {
            // 148 - 5*2 - 0 (gutter) = 138
            expect(dims.interior_safe_width.toFixed(0)).toBe('138')
            // 210 - 5*2 = 200
            expect(dims.interior_safe_height.toFixed(0)).toBe('200')
        })

        test('cover trim is two faces plus spine', () => {
            // 148*2 + 8 = 304
            expect(dims.cover_trim_width.toFixed(0)).toBe('304')
            expect(dims.cover_trim_height.toFixed(0)).toBe('210')
        })

        test('cover total includes bleed on all sides', () => {
            // 304 + 3*2 = 310 (no flaps)
            expect(dims.cover_total_width.toFixed(0)).toBe('310')
            // 210 + 3*2 = 216
            expect(dims.cover_total_height.toFixed(0)).toBe('216')
        })

        test('no overhang, no flaps', () => {
            expect(dims.cover_face_width.toFixed(0)).toBe('148')
            expect(dims.cover_has_flaps).toBe(false)
        })
    })

    describe('numbers format', () => {

        test('numbers: number returns JS numbers', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: 'a5',
                bleed: 3,
                spine: 8,
                numbers: 'number',
            })
            expect(typeof dims.interior_trim_width).toBe('number')
            expect(typeof dims.cover_region_front.x).toBe('number')
        })

        test('numbers: string returns strings', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: 'a5',
                bleed: 3,
                spine: 8,
                numbers: 'string',
            })
            expect(typeof dims.interior_trim_width).toBe('string')
        })

        test('default returns Big instances', () => {
            const dims = get_custom_dimensions({
                unit: 'mm',
                size: 'a5',
                bleed: 3,
                spine: 8,
            })
            expect(dims.interior_trim_width).toBeInstanceOf(Big)
        })
    })
})
