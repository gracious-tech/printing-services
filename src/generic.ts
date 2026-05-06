
import Big from 'big.js'
import {convert_unit} from './utils.js'

import type {PaperTypeId, InkTypeId, BindingTypeId, GetSizesArgs, GetSizesItem, GetBindingTypesArgs, GetBindingTypesItem, GetPaperTypesArgs, GetPaperTypesItem, GetInkTypesArgs, GetInkTypesItem, GetCoverTypesArgs, GetCoverTypesItem, GetDimensionsArgs, GetDimensionsResult, ServiceConfig, ServicePublic, CalcArgs, CoverTypeId, ServiceConfigCoverType} from './types.js'


// Creates a PrintingService from service-specific config
export function create_service(c:ServiceConfig):ServicePublic {

    function get_sizes({binding_type, unit=c.unit}:GetSizesArgs={}):GetSizesItem[]{
        return Object.entries(c.sizes)
            .filter(([id, size]) => !binding_type || !size.excluded_bindings.includes(binding_type))
            .map(([id, size]) => ({
                id,
                name: size.name,
                expense: size.expense,
                width: convert_unit(size.width, c.unit, unit),
                height: convert_unit(size.height, c.unit, unit),
                unit,
            }))
            .sort((a, b) => a.width.cmp(b.width) || a.height.cmp(b.height))
    }

    function get_binding_types({pages, size, ink_type, paper_type}:GetBindingTypesArgs={}):GetBindingTypesItem[]{
        return Object.entries(c.binding_types)
            .filter(([id, props]) => {
                // Exclude bindings not available for selected size
                if (size && size in c.sizes){
                    if (c.sizes[size]!.excluded_bindings.includes(id as BindingTypeId)){
                        return false
                    }
                }
                // Exclude bindings outside page range
                if (pages){
                    if (pages < props.min_pages || pages > props.max_pages){
                        return false
                    }
                }
                // Forward: binding excludes certain ink/paper types
                if (ink_type && props.excluded_ink_types?.includes(ink_type))
                    return false
                if (paper_type && props.excluded_paper_types?.includes(paper_type))
                    return false
                return true
            })
            .map(([id, props]) => ({
                id,
                name: props.name,
                expense: props.expense,
            }))
            .sort((a, b) => a.expense - b.expense)
    }

    // List available ink types
    function get_ink_types({binding_type, paper_type}:GetInkTypesArgs={}):GetInkTypesItem[]{
        return Object.entries(c.ink_types)
            .filter(([id, props]) => {
                // Forward: ink excludes certain paper types
                if (paper_type && props.excluded_paper_types?.includes(paper_type))
                    return false
                // Reverse: binding excludes certain ink types
                if (binding_type && c.binding_types[binding_type]
                        ?.excluded_ink_types?.includes(id as InkTypeId))
                    return false
                return true
            })
            .map(([id, props]) => ({
                id,
                name: props.name,
                expense: props.expense,
            }))
            .sort((a, b) => a.expense - b.expense)
    }

    // List available paper types
    function get_paper_types({binding_type, ink_type}:GetPaperTypesArgs={}):GetPaperTypesItem[]{
        return Object.entries(c.paper_types)
            .filter(([id]) => {
                // Reverse: binding excludes certain paper types
                const pid = id as PaperTypeId
                if (binding_type
                        && c.binding_types[binding_type]?.excluded_paper_types?.includes(pid))
                    return false
                // Reverse: ink excludes certain paper types
                if (ink_type && c.ink_types[ink_type]?.excluded_paper_types?.includes(pid))
                    return false
                return true
            })
            .map(([id, props]) => ({
                id,
                name: props.name,
                expense: props.expense,
            }))
            .sort((a, b) => a.expense - b.expense)
    }

    // List available cover types (independent of other options)
    function get_cover_types():GetCoverTypesItem[]{
        return Object.entries(c.cover_types)
            .map(([id, props]) => ({
                id,
                name: props.name,
                expense: props.expense,
            }))
            .sort((a, b) => a.expense - b.expense)
    }

    function get_dimensions(args:GetDimensionsArgs):GetDimensionsResult{

        // Get size props from size arg
        let width:Big
        let height:Big
        if (typeof args.size === 'string'){
            // Get size props from hard-coded size
            const size_props = c.sizes[args.size]
            if (!size_props){
                throw new Error(`Invalid size id: ${args.size}`)
            }
            width = size_props.width
            height = size_props.height
        } else {
            // Size props supplied by caller (ensure converted to service's native unit)
            width = convert_unit(Big(args.size.width), args.size.unit, c.unit)
            height = convert_unit(Big(args.size.height), args.size.unit, c.unit)
        }

        // These args are available to all calc functions
        const calc_args:CalcArgs = {
            size: {width, height},
            pages: args.pages,
            binding_type: args.binding_type,
            ink_type: args.ink_type,
            paper_type: args.paper_type,
        }

        // Interior parts
        const interior_bleed = c.calc_interior_bleed(calc_args)
        const interior_margin = c.calc_interior_margin(calc_args)
        const interior_gutter = c.calc_interior_gutter(calc_args)

        // Cover parts
        const cover_bleed = c.calc_cover_bleed(calc_args)
        const cover_margin = c.calc_cover_margin(calc_args)
        const cover_spine = c.calc_cover_spine(calc_args)
        const cover_spine_margin = c.calc_cover_spine_margin(calc_args)
        const cover_flap = c.calc_cover_flap(calc_args)
        const cover_overhang_width = c.calc_cover_overhang_width(calc_args)
        const cover_overhang_height = c.calc_cover_overhang_height(calc_args)

        // Interior totals
        const interior_trim_width = width
        const interior_trim_height = height
        const interior_safe_width =
            interior_trim_width.minus(interior_margin.times(2)).minus(interior_gutter)
        const interior_safe_height = interior_trim_height.minus(interior_margin.times(2))
        // When outer-only, bleed is on 3 edges (top, bottom, outer) not inner edge
        const interior_total_width = interior_trim_width.plus(
            interior_bleed.times(c.calc_interior_bleed_outer_only ? 1 : 2))
        const interior_total_height = interior_trim_height.plus(interior_bleed.times(2))

        // Cover totals
        const cover_face_width = interior_trim_width.plus(cover_overhang_width)
        const cover_face_height = interior_trim_height.plus(cover_overhang_height)
        const cover_trim_width = cover_face_width.times(2).plus(cover_spine)
        const cover_trim_height = cover_face_height
        const cover_safe_width = cover_face_width.minus(cover_margin.times(2))
        const cover_safe_height = cover_face_height.minus(cover_margin.times(2))
        const cover_total_width = cover_trim_width.plus(cover_bleed.plus(cover_flap).times(2))
        const cover_total_height = cover_trim_height.plus(cover_bleed.times(2))

        // X positions within the full cover document
        const cover_x_back = cover_bleed.plus(cover_flap)
        const cover_x_spine = cover_x_back.plus(cover_face_width)
        const cover_x_front = cover_x_spine.plus(cover_spine)

        // How many more pages needed to ensure interior a multiple of 4 if cover pages included
        const interior_blank_pages = (4 - (args.pages + 2) % 4) % 4

        const result_unit = args.unit ?? c.unit
        function convert(amount:Big|string){
            return convert_unit(amount, c.unit, result_unit)
        }

        return {
            unit: result_unit,

            interior_bleed: convert(interior_bleed),
            interior_margin: convert(interior_margin),
            interior_gutter: convert(interior_gutter),

            interior_safe_width: convert(interior_safe_width),
            interior_safe_height: convert(interior_safe_height),
            interior_trim_width: convert(interior_trim_width),
            interior_trim_height: convert(interior_trim_height),
            interior_total_width: convert(interior_total_width),
            interior_total_height: convert(interior_total_height),

            cover_bleed: convert(cover_bleed),
            cover_margin: convert(cover_margin),
            cover_spine: convert(cover_spine),
            cover_spine_margin: convert(cover_spine_margin),

            cover_face_width: convert(cover_face_width),
            cover_face_height: convert(cover_face_height),
            cover_safe_width: convert(cover_safe_width),
            cover_safe_height: convert(cover_safe_height),
            cover_trim_width: convert(cover_trim_width),
            cover_trim_height: convert(cover_trim_height),
            cover_total_width: convert(cover_total_width),
            cover_total_height: convert(cover_total_height),

            cover_region_back: {
                x: convert(cover_x_back),
                y: convert(cover_bleed),
                w: convert(cover_face_width),
                h: convert(cover_face_height),
            },
            cover_region_spine: {
                x: convert(cover_x_spine),
                y: convert(cover_bleed),
                w: convert(cover_spine),
                h: convert(cover_face_height),
            },
            cover_region_front: {
                x: convert(cover_x_front),
                y: convert(cover_bleed),
                w: convert(cover_face_width),
                h: convert(cover_face_height),
            },

            interior_includes_cover: c.interior_includes_cover,
            interior_blank_pages: c.interior_includes_cover ? interior_blank_pages : 0,
            interior_has_bleed: c.calc_interior_bleed_outer_only
                ? 'outer-only' : interior_bleed.gt(0),
            cover_has_bleed: cover_bleed.gt(0),
            cover_has_spine: cover_spine.gt(0),
            cover_has_spine_text: c.calc_cover_spine_text(calc_args),
            cover_has_flaps: cover_flap.gt(0),
        }
    }

    return {
        id: c.id,
        name: c.name,
        countries: c.countries,
        quality: c.quality,
        expense: c.expense,
        get_sizes,
        get_binding_types,
        get_ink_types,
        get_paper_types,
        get_cover_types,
        get_dimensions,
        interior_calc_requires_binding: c.interior_calc_requires_binding,
        cover_calc_requires_binding: c.cover_calc_requires_binding,
        cover_calc_requires_paper: c.cover_calc_requires_paper,
        cover_calc_requires_ink: c.cover_calc_requires_ink,
        url_website: c.url_website,
        url_guide: c.url_guide,
        url_pricing: c.url_pricing,
        raw: c,
    }
}


// Shortcut for specifying glossy/matte cover options when no cost difference
export const GLOSSY_MATTE_COVER_TYPES:Partial<Record<CoverTypeId, ServiceConfigCoverType>> = {
    glossy: {
        name: "Glossy",
        expense: 1,
    },
    matte: {
        name: "Matte",
        expense: 1,
    },
}


// Shortcut for specifying calc properties for stitch-only services that include cover in interior
export function generate_simple_inline_cover_options({bleed, margin}:{bleed:string, margin:string}){
    return {
        interior_includes_cover: true,
        interior_calc_requires_binding: false,
        cover_calc_requires_binding: false,
        cover_calc_requires_ink: false,
        cover_calc_requires_paper: false,

        calc_interior_bleed: () => Big(bleed),
        calc_interior_bleed_outer_only: false,
        calc_interior_margin: () => Big(margin),
        calc_interior_gutter: () => Big('0'),

        calc_cover_bleed: () => Big(bleed),
        calc_cover_margin: () => Big(margin),
        calc_cover_spine: () => Big(0),
        calc_cover_spine_margin: () => Big(0),
        calc_cover_spine_text: () => false,
        calc_cover_flap: () => Big(0),
        calc_cover_overhang_width: () => Big(0),
        calc_cover_overhang_height: () => Big(0),
    }
}
