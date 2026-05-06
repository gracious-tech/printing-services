
// All sizes are in INCH!

import Big from 'big.js'
import {create_service, GLOSSY_MATTE_COVER_TYPES} from '../generic.js'
import {generate_sizes} from '../sizes.js'
import type {ServiceConfigBindingType, BindingTypeId, CalcArgs, InkTypeId, ServiceConfigInkType, PaperTypeId, ServiceConfigPaperType} from '../types.js'


const SIZES = generate_sizes('inch', {
    pocket_book: {
        expense: 1,
        excluded_bindings: ['hardcover_jacket'],
    },
    novella: {
        expense: 1,
        excluded_bindings: ['hardcover_jacket'],
    },
    digest: {
        expense: 1,
        excluded_bindings: [],
    },
    a5: {
        expense: 1,
        excluded_bindings: [],
    },
    us_trade: {
        expense: 1,
        excluded_bindings: [],
    },
    // 6x9inch or less is least expensive ($6.41 for 100 pages)
    // More than 6x9inch is more expensive ($7.85 for 100 pages)
    // But only those two price categories, size otherwise doesn't affect price
    royal: {
        expense: 4,
        excluded_bindings: [],
    },
    executive: {
        expense: 4,
        excluded_bindings: ['hardcover_jacket'],
    },
    crown_quarto: {
        expense: 4,
        excluded_bindings: ['hardcover_jacket'],
    },
    small_square: {
        expense: 4,
        excluded_bindings: ['hardcover_jacket'],
    },
    a4: {
        expense: 4,
        excluded_bindings: [],
    },
    square: {
        expense: 4,
        excluded_bindings: ['hardcover_jacket'],
    },
    us_letter: {
        expense: 4,
        excluded_bindings: [],
    },
    small_landscape: {
        expense: 4,
        excluded_bindings: ['hardcover_jacket', 'paperback_stitch'],
    },
    us_letter_landscape: {
        expense: 4,
        excluded_bindings: ['hardcover_jacket', 'paperback_stitch'],
    },
    a4_landscape: {
        expense: 4,
        excluded_bindings: ['hardcover_jacket', 'paperback_stitch'],
    },
})


const BINDINGS:Partial<Record<BindingTypeId, ServiceConfigBindingType>> = {
    paperback: {
        name: "Paperback Perfect Bound",
        min_pages: 32,
        max_pages: 800,
        expense: 1,  // $4.49  Prices for 48 page book
    },
    paperback_coil: {
        name: "Paperback Coil Bound",
        min_pages: 2,
        max_pages: 470,
        expense: 4,  // $9.85
    },
    paperback_stitch: {
        name: "Paperback Saddle Stitch",
        min_pages: 4,
        max_pages: 48,
        expense: 2,  // $6.68
        excluded_ink_types: ['color'],
    },
    hardcover: {
        name: "Hardcover Case Wrap",
        min_pages: 24,
        max_pages: 800,
        expense: 8,  // $16.77
    },
    hardcover_jacket: {
        name: "Hardcover Linen Wrap",
        min_pages: 24,
        max_pages: 800,
        expense: 10,  // $21.38
    },
}


const INK:Partial<Record<InkTypeId, ServiceConfigInkType>> = {
    bw: {
        name: "Standard Black & White",
        expense: 1,  // 7.85
    },
    bw_premium: {
        name: "Premium Black & White",
        expense: 3,  // 12.10
    },
    color: {
        name: "Standard Color",
        expense: 4,  // 15.10
        excluded_paper_types: ['cream'],
    },
    color_premium: {
        name: "Premium Color",
        expense: 10,  // 33.30
        excluded_paper_types: ['cream'],
    },
}


const PAPER:Partial<Record<PaperTypeId, ServiceConfigPaperType>> = {
    cream: {
        name: "Cream - Uncoated 60#",
        expense: 1,  // 7.85
    },
    white: {
        name: "White - Uncoated 60#",
        expense: 1,  // 7.85
    },
    white_coated: {
        name: "White - Coated 80#",
        expense: 3,  // 8.40
    },
}


// Gutter to be ADDED to inner page margin
export function calc_interior_gutter({binding_type, pages}:CalcArgs):Big{
    if (binding_type === 'paperback_coil' || binding_type === 'paperback_stitch')
        return Big(0)
    if (pages <= 60)
        return Big(0)
    if (pages <= 150)
        return Big('0.125')
    if (pages <= 400)
        return Big('0.5')
    if (pages <= 600)
        return Big('0.625')
    return Big('0.75')
}


const SPINE_WIDTH_HARDCOVER:[number, number, Big][] = [
    [24, 84, Big('0.25')],
    [85, 140, Big('0.5')],
    [141, 168, Big('0.625')],
    [169, 194, Big('0.688')],
    [195, 222, Big('0.75')],
    [223, 250, Big('0.813')],
    [251, 278, Big('0.875')],
    [279, 306, Big('0.938')],
    [307, 334, Big('1')],
    [335, 360, Big('1.063')],
    [361, 388, Big('1.125')],
    [389, 416, Big('1.188')],
    [417, 444, Big('1.25')],
    [445, 472, Big('1.313')],
    [473, 500, Big('1.375')],
    [501, 528, Big('1.438')],
    [529, 556, Big('1.5')],
    [557, 582, Big('1.563')],
    [583, 610, Big('1.625')],
    [611, 638, Big('1.688')],
    [639, 666, Big('1.75')],
    [667, 694, Big('1.813')],
    [695, 722, Big('1.875')],
    [723, 750, Big('1.938')],
    [751, 778, Big('2')],
    [779, 799, Big('2.063')],
    [800, 800, Big('2.125')],
]


// NOTE GSM doesn't appear to affect spine width for Lulu (must just be the density of paper only)
export function calc_cover_spine({binding_type, pages}:CalcArgs):Big{
    if (binding_type === 'hardcover' || binding_type === 'hardcover_jacket'){
        for (const [min_pages, max_pages, width] of SPINE_WIDTH_HARDCOVER){
            if (min_pages <= pages && pages <= max_pages){
                return width
            }
        }
    }
    if (binding_type === 'paperback'){
        return Big(pages).div(444).plus(0.06)
    }
    return Big(0)
}


export function calc_cover_bleed({binding_type}:CalcArgs):Big{
    if (binding_type === 'hardcover'){
        return Big('0.625')
    } else if (binding_type === 'hardcover_jacket'){
        return Big('0.25')
    }
    return Big('0.125')
}


export function calc_cover_margin({binding_type}:CalcArgs):Big{
    if (binding_type === 'hardcover'){
        return Big('0.625')
    }
    return Big('0.5')  // Also same for hardcover_jacket
}


// This is amount larger than interior trim (so don't double for both sides like bleed)
export function calc_cover_overhang_width({binding_type}:CalcArgs):Big{
    if (binding_type === 'hardcover'){
        return Big('0.25')  // Only overhangs one side (right)
    } else if (binding_type === 'hardcover_jacket'){
        return Big('0.25')
    }
    return Big(0)
}


export function calc_cover_overhang_height({binding_type}:CalcArgs):Big{
    if (binding_type === 'hardcover'){
        return Big('0.5')
    } else if (binding_type === 'hardcover_jacket'){
        return Big('0.25')  // Half the overhang right side gets
    }
    return Big(0)
}


// For simplicity, this is the whole additional width of one flap (incl. live area, fold margin)
//     So this should be added to left bleed and right bleed to get the total document width
// This supports producing covers with dust jacket but ignores any content the flaps might have
export function calc_cover_flap({binding_type}:CalcArgs):Big{
    if (binding_type !== 'hardcover_jacket'){
        return Big(0)
    }
    const flap_live_area = '2.25'
    const flap_margin = '0.5'
    const fold_safety_margin = '0.25'
    return Big(flap_live_area).plus(flap_margin).plus(flap_margin).plus(fold_safety_margin)
}


// Service instance for Lulu
export default create_service({
    id: 'lulu',
    name: "Lulu",
    countries: null,
    quality: 3,

    expense: {
        booklet: 2,  // $6.02 AUD
        booklet_100: 2,  // $5.72 AUD
        booklet_color: 3,  // $9.92 AUD
        booklet_color_100: 3,  // $9.42 AUD
        paperback: 4,  // $14.37 AUD
        paperback_100: 4,  // $13.65 AUD
        paperback_color: 9,  // $63.06 AUD
        hardcover: 6,  // $27.14 AUD
        hardcover_color: 9,  // $75.83 AUD
    },

    unit: 'inch',
    sizes: SIZES,
    binding_types: BINDINGS,
    paper_types: PAPER,
    ink_types: INK,
    cover_types: GLOSSY_MATTE_COVER_TYPES,

    interior_includes_cover: false,
    interior_calc_requires_binding: true,
    cover_calc_requires_binding: true,
    cover_calc_requires_ink: false,
    cover_calc_requires_paper: false,

    calc_interior_bleed: () => Big('0.125'),
    calc_interior_bleed_outer_only: false,
    calc_interior_margin: () => Big('0.5'),
    calc_interior_gutter,

    calc_cover_bleed,
    calc_cover_margin,
    calc_cover_spine,
    calc_cover_spine_margin: () => Big('0.125'),
    calc_cover_spine_text: ({pages}) => pages >= 82,
    calc_cover_flap,
    calc_cover_overhang_width,
    calc_cover_overhang_height,

    url_website: 'https://www.lulu.com',
    url_guide: 'https://assets.lulu.com/media/guides/en/lulu-book-creation-guide.pdf',
    url_pricing: 'https://www.lulu.com/pricing',
})
