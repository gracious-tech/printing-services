
export type UnitType = 'inch'|'mm'

// All known binding IDs across all services
export type BindingTypeId =
    | 'paperback'
    | 'paperback_coil'
    | 'paperback_wire'
    | 'paperback_stitch'
    | 'hardcover'
    | 'hardcover_jacket'

// All known paper type IDs across all services
export type PaperTypeId =
    | 'cream'  // Whatever the standard gsm is
    | 'white'  // Whatever the standard gsm is
    | 'white_coated'
    | 'white_coated_denser'

// All known ink type IDs across all services
export type InkTypeId =
    | 'bw'
    | 'bw_premium'
    | 'color'
    | 'color_premium'

// All known cover type IDs across all services
export type CoverTypeId =
    | 'glossy'
    | 'glossy_paper'  // Same thickness as interior pages
    | 'matte'

// All known size IDs across all services
export type SizeId =
    | 'pocket_book'
    | 'novella'
    | 'b_format'
    | 'x_novella_wider'
    | 'digest'
    | 'a5'
    | 'a5_landscape'
    | 'us_trade'
    | 'royal'
    | 'x_royal_larger'
    | 'executive'
    | 'crown_quarto'
    | 'x_crown_quarto_similar'
    | 'x_executive_wider'
    | 'x_landscape'
    | 'x_square_smaller'
    | 'small_square'
    | 'a4'
    | 'square'
    | 'us_letter'
    | 'x_us_letter_narrower'
    | 'small_landscape'
    | 'us_letter_landscape'
    | 'a4_landscape'

export interface ExpenseRatings {
    // Expense rating based on following ranks in AUD
    // 1 = 0-5, 2 = 5-8, 3 = 8-12, 4 = 12-18, 5 = 18-26
    // 6 = 26-36, 7 = 36-48, 8 = 48-62, 9 = 62-80, 10 = 80+
    booklet:number|null  // 24 pages, US Trade or A5
    booklet_100:number|null
    booklet_color:number|null  // All are premium color since standard not always available
    booklet_color_100:number|null
    paperback:number|null  // 300 pages, US Trade
    paperback_100:number|null
    paperback_color:number|null
    hardcover:number|null  // 300 pages, US Trade
    hardcover_color:number|null
}

export interface ServicePublic {
    id:string
    name:string
    countries:null|string[]
    quality:number
    expense:ExpenseRatings
    get_sizes(args:GetSizesArgs & {numbers:'number'}):GetSizesItem<number>[]
    get_sizes(args:GetSizesArgs & {numbers:'string'}):GetSizesItem<string>[]
    get_sizes(args?:GetSizesArgs):GetSizesItem[]
    get_binding_types:(args?:GetBindingTypesArgs) => GetBindingTypesItem[]
    get_ink_types:(args?:GetInkTypesArgs) => GetInkTypesItem[]
    get_paper_types:(args?:GetPaperTypesArgs) => GetPaperTypesItem[]
    get_cover_types:(args?:GetCoverTypesArgs) => GetCoverTypesItem[]
    get_dimensions(args:GetDimensionsArgs & {numbers:'number'}):GetDimensionsResult<number>
    get_dimensions(args:GetDimensionsArgs & {numbers:'string'}):GetDimensionsResult<string>
    get_dimensions(args:GetDimensionsArgs):GetDimensionsResult
    interior_calc_requires_binding:boolean
    cover_calc_requires_binding:boolean
    cover_calc_requires_paper:boolean
    cover_calc_requires_ink:boolean
    url_website:string
    url_guide:string
    url_pricing:string
    raw:ServiceConfig
}

export interface GetSizesArgs {
    binding_type?:BindingTypeId
    unit?:UnitType
    all?:boolean
    numbers?:'Big'|'string'|'number'
}


export interface GetSizesItem<N = Big> {
    id:string
    name:string
    expense:number
    width:N
    height:N
    unit:UnitType
    valid:boolean
}

export interface GetBindingTypesArgs {
    pages?:number
    size?:SizeId  // Not allowed to pass custom size here, unlike GetDimensionsArgs
    paper_type?:PaperTypeId
    ink_type?:InkTypeId
    all?:boolean
}

export interface GetBindingTypesItem {
    id:string
    name:string
    expense:number
    valid:boolean
}

export interface GetPaperTypesArgs {
    binding_type?:BindingTypeId
    ink_type?:InkTypeId
    all?:boolean
}

export interface GetPaperTypesItem {
    id:string
    name:string
    expense:number
    valid:boolean
}

export interface GetInkTypesArgs {
    binding_type?:BindingTypeId
    paper_type?:PaperTypeId
    all?:boolean
}

export interface GetInkTypesItem {
    id:string
    name:string
    expense:number
    valid:boolean
}

export interface GetCoverTypesArgs {
    all?:boolean
}

export interface GetCoverTypesItem {
    id:string
    name:string
    expense:number
    valid:boolean
}

export interface CustomSize {
    unit:UnitType
    width:number|string|Big
    height:number|string|Big
}

export interface GetDimensionsArgs {
    size:SizeId|CustomSize
    pages:number
    binding_type:BindingTypeId
    paper_type?:PaperTypeId
    ink_type?:InkTypeId
    unit?:UnitType
    numbers?:'Big'|'string'|'number'
}

export interface Region<N = Big> {
    x:N  // From left
    y:N  // From bottom
    w:N
    h:N
}

export interface GetDimensionsResult<N = Big> {
    unit:UnitType

    interior_bleed:N
    interior_margin:N
    interior_gutter:N

    interior_safe_width:N
    interior_safe_height:N
    interior_trim_width:N
    interior_trim_height:N
    interior_total_width:N
    interior_total_height:N

    cover_bleed:N
    cover_margin:N
    cover_spine:N
    cover_spine_margin:N

    cover_face_width:N
    cover_face_height:N
    cover_safe_width:N
    cover_safe_height:N
    cover_trim_width:N
    cover_trim_height:N
    cover_total_width:N
    cover_total_height:N

    cover_region_back:Region<N>
    cover_region_spine:Region<N>
    cover_region_front:Region<N>
    cover_region_barcode:Region<N>

    interior_includes_cover:boolean
    interior_blank_pages:number  // Num pages to add before backcover when `interior_has_cover` true
    interior_has_bleed:boolean|'outer-only'
    cover_has_bleed:boolean
    cover_has_spine:boolean
    cover_has_spine_text:boolean
    cover_has_flaps:boolean

    depth:N
}


export interface CalcArgs {
    size:{width:Big, height:Big}
    pages:number
    binding_type:BindingTypeId
    ink_type:InkTypeId|undefined
    paper_type:PaperTypeId|undefined
}

export interface GenSizeInput {
    expense?:number
    excluded_bindings?:BindingTypeId[]
}


// ServiceConfigs
// These configs exclude options that come after in sequence
//     Size -> Binding -> Ink -> Paper
//     E.g. If a paper and binding can't go together, it's specified in the binding only
//     Then other logic will reverse the check as needed
// Cover type is never dependent on other options since uncommon and simplifies things

export interface ServiceConfigSize {
    name:string
    expense:number
    width:Big
    height:Big
    excluded_bindings:BindingTypeId[]
}

export interface ServiceConfigBindingType {
    name:string
    expense:number
    min_pages:number
    max_pages:number
    excluded_ink_types?:InkTypeId[]
    excluded_paper_types?:PaperTypeId[]
}

export interface ServiceConfigInkType {
    name:string
    expense:number
    excluded_paper_types?:PaperTypeId[]
}

export interface ServiceConfigPaperType {
    name:string
    expense:number
}

export interface ServiceConfigCoverType {
    name:string
    expense:number
}

export interface ServiceConfigBarcode {
    w:Big
    h:Big
    margin_right?:Big  // If different to standard cover_margin
    margin_bottom?:Big  // If different to standard cover_margin
}

export interface ServiceConfig {
    id:string
    name:string
    countries:null|string[]  // null for global
    quality:number  // 1=low (officeworks), 2=medium (kdp), 3=high (lulu)
    expense:ExpenseRatings

    unit:UnitType
    sizes:Partial<Record<SizeId, ServiceConfigSize>>

    binding_types:Partial<Record<BindingTypeId, ServiceConfigBindingType>>
    ink_types:Partial<Record<InkTypeId, ServiceConfigInkType>>
    paper_types:Partial<Record<PaperTypeId, ServiceConfigPaperType>>
    cover_types:Partial<Record<CoverTypeId, ServiceConfigCoverType>>

    interior_includes_cover:boolean
    interior_calc_requires_binding:boolean
    cover_calc_requires_binding:boolean
    cover_calc_requires_paper:boolean
    cover_calc_requires_ink:boolean

    calc_depth(args:CalcArgs):Big

    calc_interior_bleed(args:CalcArgs):Big
    calc_interior_bleed_outer_only:boolean
    calc_interior_margin(args:CalcArgs):Big
    calc_interior_gutter(args:CalcArgs):Big

    calc_cover_bleed(args:CalcArgs):Big
    calc_cover_margin(args:CalcArgs):Big
    calc_cover_spine(args:CalcArgs):Big
    calc_cover_spine_margin(args:CalcArgs):Big
    calc_cover_spine_text(args:CalcArgs):boolean
    calc_cover_flap(args:CalcArgs):Big
    calc_cover_overhang_width(args:CalcArgs):Big
    calc_cover_overhang_height(args:CalcArgs):Big
    calc_cover_barcode(args:CalcArgs):ServiceConfigBarcode|undefined

    url_website:string
    url_guide:string
    url_pricing:string
}


export interface GetCommonSizesArgs {
    unit?:UnitType
    numbers?:'Big'|'string'|'number'
}

export interface GetCommonSizesItem<N = Big> {
    id:string
    name:string
    width:N
    height:N
    unit:UnitType
}

export interface GetCustomDimensionsArgs {
    // These are essential for knowing the document size
    unit:UnitType  // This is required so it's clear what unit bleed/spine/etc is
    size:SizeId|Omit<CustomSize, 'unit'>  // Unit not allowed to avoid confusion with above
    bleed:number|string|Big
    spine:number|string|Big
    // These are not essential
    margin?:number|string|Big
    gutter?:number|string|Big
    numbers?:'Big'|'string'|'number'
}
