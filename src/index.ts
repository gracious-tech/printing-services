
import lulu from './services/lulu.js'
import kdp from './services/kdp.js'
import officeworks from './services/officeworks.js'
import vistaprint_au from './services/vistaprint_au.js'
import ctrlprint from './services/ctrlprint.js'

import type {ServicePublic} from './types.js'

export type * from './types.js'
export {get_common_sizes} from './generic.js'


// WARN make sure these are named the same as their ids
const SERVICES = {lulu, kdp, officeworks, vistaprint_au, ctrlprint}


// Get a service by id
export function get_service(id:keyof typeof SERVICES):ServicePublic {
    return SERVICES[id]
}


// Get all services, optionally filtered by country
export function list_services(country?:string):ServicePublic[] {
    return Object.values(SERVICES)
        .filter(s => !country || s.countries === null || s.countries.includes(country))
}
