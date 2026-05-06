
# Printing Services

### [-> Documentation & Demo](https://printing-services.paper.bible)

Get book dimensions for popular printing services, such as bleed, safety margin, and spine width.

This is especially useful for generating covers which often require complex and specific measurements. Services/bindings are only included if they support bleed for at least the cover. This rules out many basic printing services, which don't require complex calculations anyway.

Unlike many other resources, these dimensions have been manually verified with official documentation from each service (i.e. no AI slop). Great care has been made to ensure everything is exact.


## Install

```sh
npm install printing-services
```

Works in browser, Node, and other runtimes. \
Only one dependency which is a tiny module for doing math in decimals for precision.


## Supported services

| Service | Availability | Bindings |
|---------|--------------|----------|
| [Kindle Direct Publishing](https://kdp.amazon.com) | Global | Paperback, Hardcover |
| [Lulu](https://www.lulu.com) | Global | Paperback Perfect Bound, Saddle Stitch, Coil Bound, Hardcover Case Wrap, Hardcover Linen Wrap |
| [ctrlPrint](https://ctrlprint.com.au/) | Australia | Saddle Stitch, Wire Bound, Spiral Bound, Perfect Bound |
| [Officeworks](https://www.officeworks.com.au/print-copy/p/premium-booklets-pcdhpbcp) | Australia | Premium Booklet |
| [VistaPrint Australia](https://www.vistaprint.com.au/marketing-materials/booklets) | Australia | Booklet |

(feel free to submit PRs for more, you can copy one of the existing service files to guide you)

## Usage

```ts
import {get_service, list_services} from 'printing-services'

// Get services
const services = list_services('us')
const kdp = get_service('kdp')

// List available options (each accepts optional filters)
const sizes = kdp.get_sizes()
const bindings = kdp.get_binding_types()
const ink_types = kdp.get_ink_types()
const paper_types = kdp.get_paper_types()
const cover_types = kdp.get_cover_types()

// Calculate dimensions for a book
const dimensions = kdp.get_dimensions({
    size: 'us_trade',
    pages: 300,
    binding_type: 'paperback',
    paper_type: 'white',
    ink_type: 'bw',
    unit: 'inch',  // Can be 'mm'
})
```


### Result of `get_dimensions` example above

Numeric values are decimal objects ([big.js](https://www.npmjs.com/package/big.js)) to avoid floating point imprecision in mm/inch math. Use `.toNumber()` or `.toFixed()` to convert them.

```js
const dimensions = {
    unit: 'inch',

    interior_bleed: Big('0.125'),
    interior_margin: Big('0.25'),
    interior_gutter: Big('0.25'),
    interior_safe_width: Big('5.25'),
    interior_safe_height: Big('8.5'),
    interior_trim_width: Big('6'),
    interior_trim_height: Big('9'),
    interior_total_width: Big('6.125'),
    interior_total_height: Big('9.25'),

    cover_bleed: Big('0.125'),
    cover_margin: Big('0.125'),
    cover_spine: Big('0.6756'),
    cover_spine_margin: Big('0.0625'),
    cover_face_width: Big('6'),
    cover_face_height: Big('9'),
    cover_safe_width: Big('5.75'),
    cover_safe_height: Big('8.75'),
    cover_trim_width: Big('12.6756'),
    cover_trim_height: Big('9'),
    cover_total_width: Big('12.9256'),
    cover_total_height: Big('9.25'),

    cover_region_back: {
        x: Big('0.125'),
        y: Big('0.125'),
        w: Big('6'),
        h: Big('9')
    },
    cover_region_spine: {
        x: Big('6.125'),
        y: Big('0.125'),
        w: Big('0.6756'),
        h: Big('9')
    },
    cover_region_front: {
        x: Big('6.8006'),
        y: Big('0.125'),
        w: Big('6'),
        h: Big('9')
    },

    interior_includes_cover: false,
    interior_blank_pages: 0,
    interior_has_bleed: 'outer-only',

    cover_has_bleed: true,
    cover_has_spine: true,
    cover_has_spine_text: true,
    cover_has_flaps: false
}
```
