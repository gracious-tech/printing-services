
import Big from 'big.js'
import {create_service} from '../generic.js'
import {generate_sizes} from '../sizes.js'
import type {ServiceConfigBindingType, BindingTypeId, CalcArgs, InkTypeId, ServiceConfigInkType, PaperTypeId, ServiceConfigPaperType, CoverTypeId, ServiceConfigCoverType} from '../types.js'


const SIZES = generate_sizes('mm', {
    a5: {
        expense: 1,  // $7.58 (100 quantity price)
    },
    a5_landscape: {
        expense: 1,  // $7.58 (100 quantity price)
        excluded_bindings: ['paperback_coil'],
    },
    a4: {
        expense: 3,  // $10.27 (100 quantity price)
    },
    a4_landscape: {
        expense: 5,  // $12.66 (100 quantity price)
        excluded_bindings: ['paperback_coil'],
    },
})


const BINDINGS:Partial<Record<BindingTypeId, ServiceConfigBindingType>> = {
    paperback: {
        name: "Perfect Bound",
        min_pages: 40,
        max_pages: 100,
        expense: 5,  // $10.27 (100 quantity price)
        excluded_paper_types: ['white'],
    },
    paperback_wire: {
        name: "Wire Bound",
        min_pages: 16,
        max_pages: 200,
        expense: 3,  // $8.13 (100 quantity price)
        excluded_paper_types: ['white_coated', 'white_coated_denser'],
    },
    paperback_coil: {
        name: "Spiral Bound",
        min_pages: 16,
        max_pages: 200,
        expense: 3,  // $8.13 (100 quantity price)
        excluded_paper_types: ['white_coated', 'white_coated_denser'],
    },
    paperback_stitch: {
        name: "Saddle Stitch",
        min_pages: 8,
        max_pages: 48,
        expense: 1,  // $6.80 (100 quantity price)
        excluded_paper_types: ['white'],
    },
}


const INK:Partial<Record<InkTypeId, ServiceConfigInkType>> = {
    color: {
        name: "Color",
        expense: 1,
    },
}


const PAPER:Partial<Record<PaperTypeId, ServiceConfigPaperType>> = {
    white: {
        name: "80gsm Supreme Laser",
        expense: 1,  // No other choice when it is used
    },
    white_coated: {
        name: "128gsm Sovereign Silk",
        expense: 4,  // $3.51 (not sure why this one is more when less dense...)
    },
    white_coated_denser: {
        name: "150gsm Sovereign Silk",
        expense: 1,  // $2.23
    },
}


const COVERS:Partial<Record<CoverTypeId, ServiceConfigCoverType>> = {
    // There are other options but depends on binding and paper type, which is too complex
    // Option below is available for all combinations
    matte: {
        name: "250gsm Sovereign Silk",
        expense: 1,
    },
}


// Spine widths for perfect bound, from ctrlPrint artwork guidelines
const SPINE_128GSM:[number, string][] = [
    [44, '3.5'], [54, '4'], [62, '4.5'], [70, '5'], [78, '5.5'],
    [86, '6'], [94, '6.5'], [100, '7'],
]
const SPINE_150GSM:[number, string][] = [
    [46, '4'], [52, '4.5'], [60, '5'], [66, '5.5'], [74, '6'],
    [82, '6.5'], [88, '7'], [96, '7.5'], [100, '8'],
]

function calc_cover_spine({binding_type, paper_type, pages}:CalcArgs):Big {
    if (binding_type !== 'paperback') {
        return Big(0)
    }
    const table = paper_type === 'white_coated' ? SPINE_128GSM : SPINE_150GSM
    for (const [max_pages, width] of table) {
        if (pages <= max_pages) {
            return Big(width)
        }
    }
    return Big(table[table.length - 1]![1])
}


export default create_service({
    id: 'ctrlprint',
    name: "ctrlPrint",
    countries: ['au'],
    quality: 2,

    expense: {
        booklet: null,
        booklet_100: null,
        booklet_color: 7,  // $40 AUD
        booklet_color_100: 1,  // $2.23 AUD
        paperback: null,
        paperback_100: null,
        paperback_color: null,  // Does have perfect bind but not more than 100 pages
        hardcover: null,
        hardcover_color: null,
    },

    unit: 'mm',
    sizes: SIZES,
    binding_types: BINDINGS,
    paper_types: PAPER,
    ink_types: INK,
    cover_types: COVERS,

    interior_includes_cover: false,  // TODO Verify if false for all bindings
    interior_calc_requires_binding: true,
    cover_calc_requires_binding: true,
    cover_calc_requires_ink: false,
    cover_calc_requires_paper: true,

    calc_interior_bleed: () => Big('3'),
    calc_interior_bleed_outer_only: false,
    calc_interior_margin: () => Big('5'),
    calc_interior_gutter: ({binding_type}) => Big(binding_type === 'paperback_stitch' ? 0 : 10),

    calc_cover_bleed: () => Big('3'),
    calc_cover_margin: () => Big('5'),
    calc_cover_spine,
    calc_cover_spine_margin: () => Big(0),
    calc_cover_spine_text: () => false,  // Max pages is 100 so unlikely to be suitable
    calc_cover_flap: () => Big(0),
    calc_cover_overhang_width: () => Big(0),
    calc_cover_overhang_height: () => Big(0),

    url_website: 'https://ctrlprint.com.au/',
    url_guide: 'https://ctrlprint.com.au/wp-content/uploads/2025/01/Artwork-Guidelines-Ctrl-Print.pdf',
    url_pricing: 'https://ctrlprint.com.au/product/perfect-bound-portrait-booklets/',
})
