#!/usr/bin/env node

// Code for outputing results for the example in the README

import Big from 'big.js'
const {get_service} = await import('./dist/index.js')

const kdp = get_service('kdp')

const dims = kdp.get_dimensions({
    size: 'us_trade',
    pages: 300,
    binding_type: 'paperback',
    paper_type: 'white',
    ink_type: 'bw',
    unit: 'inch',
})

// Output Big instances as Big('value') using toFixed()
Big.prototype.toJSON = function() { return "Big('" + this.toFixed() + "')" }

// Print as JS, not JSON
console.log(JSON.stringify(dims, null, 4).replaceAll('"', ''))
