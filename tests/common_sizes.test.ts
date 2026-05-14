// AI-generated

import {describe, test, expect} from 'vitest'
import Big from 'big.js'
import {get_common_sizes} from '../src/generic.js'


describe('get_common_sizes', () => {

    test('returns all standard sizes', () => {
        const sizes = get_common_sizes()
        expect(sizes.length).toBe(24)
    })

    test('each size has required properties', () => {
        const sizes = get_common_sizes()
        for (const size of sizes) {
            expect(size.id).toBeDefined()
            expect(size.name).toBeDefined()
            expect(size.width).toBeDefined()
            expect(size.height).toBeDefined()
            expect(size.unit).toMatch(/^(inch|mm)$/)
        }
    })

    test('defaults to each size native unit', () => {
        const sizes = get_common_sizes()
        // A5 is natively mm, should stay mm
        const a5 = sizes.find(s => s.id === 'a5')!
        expect(a5.unit).toBe('mm')
        expect(a5.width.toFixed(0)).toBe('148')
        expect(a5.height.toFixed(0)).toBe('210')
        // US Trade is natively inch, should stay inch
        const us_trade = sizes.find(s => s.id === 'us_trade')!
        expect(us_trade.unit).toBe('inch')
        expect(us_trade.width.toFixed(0)).toBe('6')
        expect(us_trade.height.toFixed(0)).toBe('9')
    })

    test('converts all sizes to requested unit', () => {
        const sizes = get_common_sizes({unit: 'mm'})
        // All should now be mm
        for (const size of sizes) {
            expect(size.unit).toBe('mm')
        }
        // US Trade 6x9 inch should be ~152.4 x 228.6 mm
        const us_trade = sizes.find(s => s.id === 'us_trade')!
        expect(us_trade.width.toFixed(1)).toBe('152.4')
        expect(us_trade.height.toFixed(1)).toBe('228.6')
    })

    test('sorted by width then height', () => {
        const sizes = get_common_sizes({unit: 'mm'})
        for (let i = 1; i < sizes.length; i++) {
            const prev_w = Big(sizes[i - 1]!.width)
            const curr_w = Big(sizes[i]!.width)
            if (prev_w.eq(curr_w)) {
                expect(Big(sizes[i - 1]!.height).lte(Big(sizes[i]!.height))).toBe(true)
            } else {
                expect(prev_w.lt(curr_w)).toBe(true)
            }
        }
    })

    test('numbers: number returns JS numbers', () => {
        const sizes = get_common_sizes({numbers: 'number'})
        expect(typeof sizes[0]!.width).toBe('number')
        expect(typeof sizes[0]!.height).toBe('number')
    })

    test('numbers: string returns strings', () => {
        const sizes = get_common_sizes({numbers: 'string'})
        expect(typeof sizes[0]!.width).toBe('string')
        expect(typeof sizes[0]!.height).toBe('string')
    })

    test('default returns Big instances', () => {
        const sizes = get_common_sizes()
        expect(sizes[0]!.width).toBeInstanceOf(Big)
    })
})
