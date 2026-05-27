
// All sizes are in INCH!

import Big from 'big.js'
import {create_service, GLOSSY_MATTE_COVER_TYPES} from '../generic.js'
import {generate_sizes} from '../sizes.js'

import type {ServiceConfigBindingType, ServiceConfigPaperType, ServiceConfigInkType, BindingTypeId,
    PaperTypeId, InkTypeId, CalcArgs} from '../types.js'


const SIZES = generate_sizes('inch', {
    // Small (100page = $2.30)
    novella: {
        expense: 1,
        excluded_bindings: ['hardcover'],
    },
    b_format: {
        expense: 1,
        excluded_bindings: ['hardcover'],
    },
    x_novella_wider: {
        expense: 1,
        excluded_bindings: ['hardcover'],
    },
    digest: {
        expense: 1,
        excluded_bindings: [],
    },
    us_trade: {
        expense: 1,
        excluded_bindings: [],
    },

    // Large (100page = $2.84)
    royal: {
        expense: 3,
        excluded_bindings: [],
    },
    x_royal_larger: {
        expense: 3,
        excluded_bindings: ['hardcover'],
    },
    executive: {
        expense: 3,
        excluded_bindings: [],
    },
    crown_quarto: {
        expense: 3,
        excluded_bindings: ['hardcover'],
    },
    x_crown_quarto_similar: {
        expense: 3,
        excluded_bindings: ['hardcover'],
    },
    x_executive_wider: {
        expense: 3,
        excluded_bindings: ['hardcover'],
    },
    x_landscape: {
        expense: 3,
        excluded_bindings: ['hardcover'],
    },
    x_square_smaller: {
        expense: 3,
        excluded_bindings: ['hardcover'],
    },
    square: {
        expense: 3,
        excluded_bindings: ['hardcover'],
    },
    us_letter: {
        expense: 3,
        excluded_bindings: ['hardcover'],
    },
    a4: {
        expense: 3,
        excluded_bindings: ['hardcover'],
    },

    // Hardcover-only large
    x_us_letter_narrower: {
        expense: 3,
        excluded_bindings: ['paperback'],
    },
})


const BINDINGS:Partial<Record<BindingTypeId, ServiceConfigBindingType>> = {
    paperback: {
        name: "Paperback",
        expense: 1,  // 108 page black ink = $2.30 USD
        min_pages: 24,  // 72 for standard color
            // Since users can still use premium, not adding to logic to avoid complexity
        max_pages: 828,  // Less for large trims, cream paper, standard color
            // Too complex to add to logic and users unlikely to choose such expensive combinations
    },
    hardcover: {
        name: "Hardcover",
        expense: 6,  // 108 page black ink = $6.80 USD (~ x3)
        min_pages: 75,
        max_pages: 550,
        excluded_ink_types: ['color'],  // Can use color_premium though
    },
}


const INK_TYPES:Partial<Record<InkTypeId, ServiceConfigInkType>> = {
    bw: {
        name: "Black & white interior",
        expense: 1,  // 1.20 USD 100 pages
    },
    color: {
        name: "Standard color interior",
        expense: 5,  // 2.55 USD 100 pages
        excluded_paper_types: ['cream'],
    },
    color_premium: {
        name: "Premium color interior",
        expense: 10,  // 6.50 USD 100 pages
        excluded_paper_types: ['cream'],
    },
}


const PAPER_TYPES:Partial<Record<PaperTypeId, ServiceConfigPaperType>> = {
    white: {
        name: "White paper",
        expense: 1,
    },
    cream: {
        name: "Cream paper",
        expense: 1,
    },
}


// Get gutter value that KDP specifies which includes the margin (removed during call below)
export function calc_gutter_kdp_amount(pages:number):Big{
    if (pages <= 150)
        return Big('0.375')
    if (pages <= 300)
        return Big('0.5')
    if (pages <= 500)
        return Big('0.625')
    if (pages <= 700)
        return Big('0.75')
    return Big('0.875')
}


export function calc_depth({pages, binding_type, paper_type, ink_type}:CalcArgs):Big{

    // Work out page thickness
    let page_thickness = '0.002252'
    if (paper_type === 'cream'){
        page_thickness = '0.0025'
    } else if (ink_type === 'color_premium'){
        page_thickness = '0.002347'
    }
    const interior_thickness = Big(page_thickness).times(pages)

    // Account for binding difference
    const hc_add = '0.189'  // Manually verified using official calculator
    return binding_type === 'paperback' ? interior_thickness : interior_thickness.plus(hc_add)
}


export function calc_cover_barcode({binding_type}:CalcArgs){
    // These margins are calculated relative to the face edge (ignores usual safe margin)
    let margin_right = Big('0.25')
    let margin_bottom = Big('0.125').plus('0.25')
    if (binding_type === 'hardcover'){
        margin_right = Big('0.394').plus('0.25')
        margin_bottom = Big('0.125').plus('0.375')
    }
    return {
        w: Big('2'),
        h: Big('1.2'),
        margin_right,
        margin_bottom,
    }
}


export default create_service({
    id: 'kdp',
    name: "Kindle Direct Publishing",
    countries: null,
    quality: 2,

    expense: {
        booklet: null,
        booklet_100: null,
        booklet_color: null,
        booklet_color_100: null,
        paperback: 3,  // $9.02 AUD
        paperback_100: 3,  // No bulk discount
        paperback_color: 6,  // $27.92 AUD
        hardcover: 5,  // $18.50 AUD (based on exchange rate)
        hardcover_color: 8,  // $50.30 AUD (based on exchange rate)
    },

    unit: 'inch',
    sizes: SIZES,
    binding_types: BINDINGS,
    ink_types: INK_TYPES,
    paper_types: PAPER_TYPES,
    cover_types: GLOSSY_MATTE_COVER_TYPES,

    interior_includes_cover: false,
    interior_calc_requires_binding: false,  // Both bindings require gutter
    cover_calc_requires_binding: true,
    cover_calc_requires_ink: true,
    cover_calc_requires_paper: true,

    calc_depth,

    calc_interior_bleed: () => Big('0.125'),
    calc_interior_bleed_outer_only: true,
    // WARN KDP sometimes includes bleed when talking about the margin, so ignore that
    calc_interior_margin: () => Big('0.25'),
    // Since KDP includes margin in gutter value, must remove it to be consistent
    calc_interior_gutter: ({pages}) => calc_gutter_kdp_amount(pages).minus('0.25'),

    // For hardcover: bleed is the "wrap"
    calc_cover_bleed: ({binding_type}) => Big(binding_type === 'paperback' ? '0.125' : '0.591'),
    // For hardcover: setting margin as "hinge" margin for all sides for simplicity
    calc_cover_margin: ({binding_type}) => Big(binding_type === 'paperback' ? '0.125' : '0.394'),
    calc_cover_spine: calc_depth,
    calc_cover_spine_margin: () => Big('0.0625'),
    calc_cover_spine_text: ({pages}) => pages > 79,
    calc_cover_flap: () => Big(0),
    calc_cover_overhang_width: ({binding_type}) => Big(binding_type === 'paperback' ? 0 : '0.197'),
    calc_cover_overhang_height: ({binding_type}) => Big(binding_type === 'paperback' ? 0 : '0.236'),
    calc_cover_barcode,

    url_website: 'https://kdp.amazon.com',
    url_guide: 'https://kdp.amazon.com/cover-calculator',
    url_pricing: 'https://kdp.amazon.com/en_US/help/topic/G201834340',
})
