
import Big from 'big.js'
import {create_service} from './generic.js'
import {convert_unit} from './utils.js'

import type {GetCustomDimensionsArgs, GetDimensionsResult} from './types.js'
import {SIZES} from './sizes.js'


// Get dimensions by providing own values rather than selecting a service
export function get_custom_dimensions(args:GetCustomDimensionsArgs & {numbers:'number'}):GetDimensionsResult<number>
export function get_custom_dimensions(args:GetCustomDimensionsArgs & {numbers:'string'}):GetDimensionsResult<string>
export function get_custom_dimensions(args:GetCustomDimensionsArgs):GetDimensionsResult
export function get_custom_dimensions(args:GetCustomDimensionsArgs):GetDimensionsResult<unknown>{

    // Helper for converting hard-coded inch defaults to whatever unit should be
    function convert_inch(amount:string){
        return convert_unit(amount, 'inch', args.unit)
    }

    // NOTE Many of these properties are not needed as only get_dimensions() is used
    const service = create_service({
        id: 'custom',
        name: "Custom",
        countries: null,
        quality: 1,

        expense: {
            booklet: null,
            booklet_100: null,
            booklet_color: null,
            booklet_color_100: null,
            paperback: null,
            paperback_100: null,
            paperback_color: null,
            hardcover: null,
            hardcover_color: null,
        },

        unit: args.unit,
        sizes: {},
        binding_types: {
            // This is just needed to call get_dimensions without error
            paperback: {name: "Paperback", min_pages: 0, max_pages: Infinity, expense: 1},
        },
        paper_types: {},
        ink_types: {},
        cover_types: {},

        interior_includes_cover: false,
        interior_calc_requires_binding: false,
        cover_calc_requires_binding: false,
        cover_calc_requires_ink: false,
        cover_calc_requires_paper: false,

        calc_interior_bleed: () => Big(args.bleed),
        calc_interior_bleed_outer_only: false,
        calc_interior_margin: () => Big(args.margin ?? convert_inch('0.5')),
        calc_interior_gutter: () => Big(args.gutter ?? '0'),

        calc_cover_bleed: () => Big(args.bleed),
        calc_cover_margin: () => Big(args.margin ?? convert_inch('0.5')),
        calc_cover_spine: () => Big(args.spine),
        calc_cover_spine_margin: () => convert_inch('0.125'),
        calc_cover_spine_text: () => Big(args.spine).gte(convert_inch('0.18')),
        calc_cover_flap: () => Big(0),
        calc_cover_overhang_width: () => Big(0),
        calc_cover_overhang_height: () => Big(0),
        calc_cover_barcode: () => undefined,

        url_website: '',
        url_guide: '',
        url_pricing: '',
    })

    // Size ids must be converted as no sizes added and could introduce unit conversion bug
    let width:Big
    let height:Big
    if (typeof args.size === 'string'){
        const standard_size = SIZES[args.size]
        if (!standard_size){
            throw new Error(`Not a valid size id: ${args.size}`)
        }
        width = convert_unit(standard_size.width, standard_size.unit, args.unit)
        height = convert_unit(standard_size.height, standard_size.unit, args.unit)
    } else {
        width = Big(args.size.width)
        height = Big(args.size.height)
    }

    // NOTE size is the only arg that really matters
    return service.get_dimensions({
        size: {width, height, unit: args.unit},
        pages: 0,
        binding_type: 'paperback',
        unit: args.unit,  // Should default to service's unit which is same, but just in case
        numbers: args.numbers ?? 'Big',
    })
}
