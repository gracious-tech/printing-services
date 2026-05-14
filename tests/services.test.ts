// AI-generated

import {describe, test, expect} from 'vitest'
import {get_service, list_services} from '../src/index.js'


describe('get_service', () => {

    test('returns service by id', () => {
        const kdp = get_service('kdp')
        expect(kdp.id).toBe('kdp')
        expect(kdp.name).toBe('Kindle Direct Publishing')
    })

    test('each service has matching id', () => {
        const ids = ['kdp', 'lulu', 'officeworks', 'vistaprint_au', 'ctrlprint'] as const
        for (const id of ids) {
            expect(get_service(id).id).toBe(id)
        }
    })
})


describe('list_services', () => {

    test('returns all services when no country filter', () => {
        const all = list_services()
        expect(all.length).toBe(5)
    })

    test('filters by country and includes global services', () => {
        const au = list_services('au')
        const au_ids = au.map(s => s.id).sort()
        // KDP and Lulu are global (countries: null), the rest are au-only
        expect(au_ids).toContain('kdp')
        expect(au_ids).toContain('lulu')
        expect(au_ids).toContain('officeworks')
        expect(au_ids).toContain('vistaprint_au')
        expect(au_ids).toContain('ctrlprint')
    })

    test('excludes non-matching country services', () => {
        const us = list_services('us')
        const us_ids = us.map(s => s.id)
        // Only global services (KDP, Lulu) should be included
        expect(us_ids).toContain('kdp')
        expect(us_ids).toContain('lulu')
        expect(us_ids).not.toContain('officeworks')
        expect(us_ids).not.toContain('vistaprint_au')
        expect(us_ids).not.toContain('ctrlprint')
    })
})


describe('service method filtering', () => {

    // Use ctrlPrint as it has the most binding/paper/size constraints
    const ctrlprint = get_service('ctrlprint')

    describe('get_sizes', () => {

        test('returns all sizes with no filter', () => {
            const sizes = ctrlprint.get_sizes()
            expect(sizes.length).toBe(4)
            expect(sizes.every(s => s.valid)).toBe(true)
        })

        test('filters invalid sizes by binding type', () => {
            // paperback_coil excludes a5_landscape and a4_landscape
            const sizes = ctrlprint.get_sizes({binding_type: 'paperback_coil'})
            const ids = sizes.map(s => s.id)
            expect(ids).toContain('a5')
            expect(ids).toContain('a4')
            expect(ids).not.toContain('a5_landscape')
            expect(ids).not.toContain('a4_landscape')
        })

        test('all: true includes invalid sizes with valid=false', () => {
            const sizes = ctrlprint.get_sizes({binding_type: 'paperback_coil', all: true})
            const landscape = sizes.find(s => s.id === 'a5_landscape')
            expect(landscape).toBeDefined()
            expect(landscape!.valid).toBe(false)
        })

        test('converts unit when requested', () => {
            // ctrlPrint is mm-based, request inches
            const sizes_mm = ctrlprint.get_sizes()
            const sizes_inch = ctrlprint.get_sizes({unit: 'inch'})
            const a5_mm = sizes_mm.find(s => s.id === 'a5')!
            const a5_inch = sizes_inch.find(s => s.id === 'a5')!
            expect(a5_mm.width.toFixed(0)).toBe('148')
            expect(a5_inch.width.toFixed(4)).toBe('5.8268')
        })

        test('numbers: number returns JS numbers', () => {
            const sizes = ctrlprint.get_sizes({numbers: 'number'})
            expect(typeof sizes[0]!.width).toBe('number')
        })

        test('throws on invalid binding type', () => {
            expect(() => ctrlprint.get_sizes({binding_type: 'hardcover' as never}))
                .toThrow('Invalid id')
        })

        test('sorted by width then height', () => {
            const sizes = ctrlprint.get_sizes()
            for (let i = 1; i < sizes.length; i++) {
                const prev = sizes[i - 1]!
                const curr = sizes[i]!
                const width_cmp = Number(prev.width) - Number(curr.width)
                expect(width_cmp <= 0).toBe(true)
            }
        })
    })

    describe('get_binding_types', () => {

        test('returns all binding types with no filter', () => {
            const bindings = ctrlprint.get_binding_types()
            expect(bindings.length).toBe(4)
        })

        test('filters by page count', () => {
            // paperback requires 40-100 pages, stitch 8-48, wire/coil 16-200
            const bindings = ctrlprint.get_binding_types({pages: 10})
            const ids = bindings.map(b => b.id)
            expect(ids).not.toContain('paperback')  // min 40
            expect(ids).toContain('paperback_stitch')
        })

        test('filters by size exclusion', () => {
            // a5_landscape excludes paperback_coil
            const bindings = ctrlprint.get_binding_types({size: 'a5_landscape'})
            const ids = bindings.map(b => b.id)
            expect(ids).not.toContain('paperback_coil')
        })

        test('all: true includes invalid with valid=false', () => {
            const bindings = ctrlprint.get_binding_types({pages: 10, all: true})
            const paperback = bindings.find(b => b.id === 'paperback')
            expect(paperback).toBeDefined()
            expect(paperback!.valid).toBe(false)
        })

        test('sorted by expense', () => {
            const bindings = ctrlprint.get_binding_types()
            for (let i = 1; i < bindings.length; i++) {
                expect(bindings[i - 1]!.expense <= bindings[i]!.expense).toBe(true)
            }
        })
    })

    describe('get_paper_types', () => {

        test('filters by binding exclusion', () => {
            // paperback excludes 'white', wire/coil excludes coated types
            const paper_pb = ctrlprint.get_paper_types({binding_type: 'paperback'})
            const paper_wire = ctrlprint.get_paper_types({binding_type: 'paperback_wire'})
            expect(paper_pb.map(p => p.id)).not.toContain('white')
            expect(paper_wire.map(p => p.id)).toContain('white')
            expect(paper_wire.map(p => p.id)).not.toContain('white_coated')
        })
    })

    describe('get_cover_types', () => {

        test('returns cover types', () => {
            const covers = ctrlprint.get_cover_types()
            expect(covers.length).toBe(1)
            expect(covers[0]!.id).toBe('matte')
        })
    })

    describe('get_dimensions validation', () => {

        test('throws on invalid size id', () => {
            expect(() => ctrlprint.get_dimensions({
                size: 'nonexistent' as never,
                pages: 40,
                binding_type: 'paperback',
                paper_type: 'white_coated',
            })).toThrow()
        })

        test('throws on invalid binding type', () => {
            expect(() => ctrlprint.get_dimensions({
                size: 'a5',
                pages: 40,
                binding_type: 'hardcover' as never,
                paper_type: 'white_coated',
            })).toThrow('Invalid id')
        })
    })
})
