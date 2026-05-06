
import Big from 'big.js'
import {UnitType} from './types.js'


// Convert inches to millimetres
export function inch_to_mm(inch:string|Big){
    return Big(inch).times('25.4')
}


// Convert millimetres to inches
export function mm_to_inch(mm:string|Big){
    return Big(mm).div('25.4')
}


// Convert to new unit if different from old unit
export function convert_unit(amount:Big|string, old_unit:UnitType, new_unit:UnitType):Big {
    if (new_unit === old_unit)
        return Big(amount)
    return old_unit === 'mm' ? mm_to_inch(amount) : inch_to_mm(amount)
}
