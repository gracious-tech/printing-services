// AI-generated

import {describe, test, expect} from 'vitest'
import Big from 'big.js'
import {inch_to_mm, mm_to_inch, convert_unit} from '../src/utils.js'


describe('inch_to_mm', () => {

    test('converts 1 inch to 25.4mm', () => {
        expect(inch_to_mm('1').toFixed(1)).toBe('25.4')
    })

    test('converts 0.125 inch to 3.175mm', () => {
        expect(inch_to_mm('0.125').toFixed(3)).toBe('3.175')
    })

    test('converts 6 inches to 152.4mm', () => {
        expect(inch_to_mm('6').toFixed(1)).toBe('152.4')
    })

    test('accepts Big instance', () => {
        expect(inch_to_mm(Big('2.5')).toFixed(2)).toBe('63.50')
    })
})


describe('mm_to_inch', () => {

    test('converts 25.4mm to 1 inch', () => {
        expect(mm_to_inch('25.4').toFixed(4)).toBe('1.0000')
    })

    test('converts 152.4mm to 6 inches', () => {
        expect(mm_to_inch('152.4').toFixed(4)).toBe('6.0000')
    })

    test('converts 210mm (A5 width) correctly', () => {
        // 210 / 25.4 = 8.26771653543...
        expect(mm_to_inch('210').toFixed(4)).toBe('8.2677')
    })

    test('accepts Big instance', () => {
        expect(mm_to_inch(Big('50.8')).toFixed(4)).toBe('2.0000')
    })
})


describe('convert_unit', () => {

    test('returns same value when units match (inch to inch)', () => {
        const result = convert_unit('6', 'inch', 'inch')
        expect(result.toFixed(1)).toBe('6.0')
    })

    test('returns same value when units match (mm to mm)', () => {
        const result = convert_unit('210', 'mm', 'mm')
        expect(result.toFixed(0)).toBe('210')
    })

    test('converts mm to inch', () => {
        const result = convert_unit('25.4', 'mm', 'inch')
        expect(result.toFixed(4)).toBe('1.0000')
    })

    test('converts inch to mm', () => {
        const result = convert_unit('1', 'inch', 'mm')
        expect(result.toFixed(1)).toBe('25.4')
    })

    test('round-trip conversion preserves value', () => {
        const original = Big('6.5')
        const mm = convert_unit(original, 'inch', 'mm')
        const back = convert_unit(mm, 'mm', 'inch')
        expect(back.toFixed(10)).toBe('6.5000000000')
    })
})
