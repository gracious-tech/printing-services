
import Big from 'big.js'
import {GenSizeInput, ServiceConfigSize, SizeId, UnitType} from './types.js'
import {convert_unit} from './utils.js'


// Standard sizes that should be in their native unit
const SIZES:Record<SizeId, {name:string, unit:UnitType, width:Big, height:Big}> = {
    pocket_book: {
        name: "Pocket Book",
        unit: 'inch',
        width: Big('4.25'),
        height: Big('6.875'),
    },
    novella: {
        name: "Novella",
        unit: 'inch',
        width: Big('5'),
        height: Big('8'),
    },
    b_format: {
        name: "B-Format",
        unit: 'mm',
        width: Big('128.5'),
        height: Big('198.4'),
    },
    x_novella_wider: {
        name: "5.25\" x 8\"",
        unit: 'inch',
        width: Big('5.25'),
        height: Big('8'),
    },
    digest: {
        name: "Digest",
        unit: 'inch',
        width: Big('5.5'),
        height: Big('8.5'),
    },
    a5: {
        name: "A5",
        unit: 'mm',
        width: Big('148'),
        height: Big('210'),
    },
    a5_landscape: {
        name: "A5 Landscape",
        unit: 'mm',
        width: Big('210'),
        height: Big('148'),
    },
    us_trade: {
        name: "US Trade",
        unit: 'inch',
        width: Big('6'),
        height: Big('9'),
    },
    royal: {
        name: "Royal",
        unit: 'mm',
        width: Big('156'),
        height: Big('233.9'),
    },
    x_royal_larger: {
        name: "6.69\" x 9.61\"",
        unit: 'inch',
        width: Big('6.69'),
        height: Big('9.61'),
    },
    executive: {
        name: "Executive",
        unit: 'inch',
        width: Big('7'),
        height: Big('10'),
    },
    crown_quarto: {
        name: "Crown Quarto",
        unit: 'mm',
        width: Big('189'),
        height: Big('246.1'),
    },
    x_crown_quarto_similar: {
        name: "7.5\" x 9.25\"",
        unit: 'inch',
        width: Big('7.5'),
        height: Big('9.25'),
    },
    x_executive_wider: {
        name: "8\" x 10\"",
        unit: 'inch',
        width: Big('8'),
        height: Big('10'),
    },
    x_landscape: {
        name: "8.25\" x 6\"",
        unit: 'inch',
        width: Big('8.25'),
        height: Big('6'),
    },
    x_square_smaller: {
        name: "8.25\" x 8.25\"",
        unit: 'inch',
        width: Big('8.25'),
        height: Big('8.25'),
    },
    small_square: {
        name: "Small Square",
        unit: 'inch',
        width: Big('7.5'),
        height: Big('7.5'),
    },
    a4: {
        name: "A4",
        unit: 'mm',
        width: Big('210'),
        height: Big('297'),
    },
    square: {
        name: "Square",
        unit: 'inch',
        width: Big('8.5'),
        height: Big('8.5'),
    },
    us_letter: {
        name: "US Letter",
        unit: 'inch',
        width: Big('8.5'),
        height: Big('11'),
    },
    x_us_letter_narrower: {
        name: "8.25\" x 11\"",
        unit: 'inch',
        width: Big('8.25'),
        height: Big('11'),
    },
    small_landscape: {
        name: "Small Landscape",
        unit: 'inch',
        width: Big('9'),
        height: Big('7'),
    },
    us_letter_landscape: {
        name: "US Letter Landscape",
        unit: 'inch',
        width: Big('11'),
        height: Big('8.5'),
    },
    a4_landscape: {
        name: "A4 Landscape",
        unit: 'mm',
        width: Big('297'),
        height: Big('210'),
    },
}


// Generate sizes for a service by specifying which ones to include
export function generate_sizes(unit:UnitType, include:Partial<Record<SizeId, GenSizeInput>>)
        :Partial<Record<SizeId, ServiceConfigSize>>{
    const sizes:Partial<Record<SizeId, ServiceConfigSize>> = {}
    for (const id of Object.keys(include) as SizeId[]){
        const size_spec = SIZES[id]
        sizes[id] = {
            name: size_spec.name,
            // Convert dimensions from the size's native unit to the requested unit
            width: convert_unit(size_spec.width, size_spec.unit, unit),
            height: convert_unit(size_spec.height, size_spec.unit, unit),
            expense: include[id]!.expense ?? 1,
            excluded_bindings: include[id]!.excluded_bindings ?? [],
        }
    }
    return sizes
}
