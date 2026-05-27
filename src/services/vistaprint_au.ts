
import {create_service, generate_simple_inline_cover_options} from '../generic.js'
import {generate_sizes} from '../sizes.js'


export default create_service({
    id: 'vistaprint_au',
    name: "VistaPrint Australia",
    countries: ['au'],
    quality: 1,

    expense: {
        booklet: null,
        booklet_100: null,
        booklet_color: 5,  // $25.99 AUD
        booklet_color_100: 1,  // $4.93 AUD
        paperback: null,
        paperback_100: null,
        paperback_color: null,
        hardcover: null,
        hardcover_color: null,
    },

    unit: 'mm',
    sizes: generate_sizes('mm', {
        a5: {
            expense: 1,
        },
        a5_landscape: {
            expense: 1,
        },
        a4: {
            expense: 4,
        },
        a4_landscape: {
            expense: 4,
        },
    }),
    binding_types: {
        paperback_stitch: {
            name: "Booklet",
            min_pages: 8 - 2,  // Less 2 as cover included
            max_pages: 64 - 2,
            expense: 1,
        },
    },
    ink_types: {
        color: {
            name: "Colour",
            expense: 1,
        },
    },
    paper_types: {
        white: {
            name: "White",
            expense: 1,
        },
    },
    cover_types: {
        glossy_paper: {
            name: "Standard",
            expense: 1,
        },
        glossy: {
            name: "Premium",
            expense: 3,
        },
    },

    ...generate_simple_inline_cover_options({unit: 'mm', bleed: '3', margin: '3'}),

    url_website: 'https://www.vistaprint.com.au/marketing-materials/booklets',
    url_guide: 'https://www.vistaprint.com.au/legal/terms-and-conditions/booklet-guidelines.pdf',
    url_pricing: 'https://www.vistaprint.com.au/marketing-materials/booklets',
})
