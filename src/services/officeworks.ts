
import {create_service, generate_simple_inline_cover_options} from '../generic.js'
import {generate_sizes} from '../sizes.js'


export default create_service({
    id: 'officeworks',
    name: "Officeworks",
    countries: ['au'],
    quality: 1,

    expense: {
        booklet: null,
        booklet_100: null,
        booklet_color: 4,  // $17.95 AUD (not worth it unless buying 50+)
        booklet_color_100: 2,  // $6.43 AUD
        paperback: null,
        paperback_100: null,
        paperback_color: null,
        hardcover: null,
        hardcover_color: null,
    },

    unit: 'mm',
    sizes: generate_sizes('mm', {
        a5: {
            expense: 1
        },
        a4: {
            expense: 4,
        },
    }),
    binding_types: {
        paperback_stitch: {
            name: "Premium Booklet",
            min_pages: 8 - 2,  // Less 2 as cover included
            max_pages: 48 - 2,
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
        glossy: {
            name: "Glossy",
            expense: 1,
        },
    },

    ...generate_simple_inline_cover_options({unit: 'mm', bleed: '5', margin: '5'}),

    url_website: 'https://www.officeworks.com.au/print-copy/p/premium-booklets-pcdhpbcp',
    url_guide: 'https://www.officeworks.com.au/print-copy/p/premium-booklets-pcdhpbcp',
    url_pricing: 'https://www.officeworks.com.au/print-copy/p/premium-booklets-pcdhpbcp',
})
