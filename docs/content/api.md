---
title: API Reference
---

# API reference

## Functions

### `get_service(id: string): ServicePublic | undefined`

Get a single service by its ID. Returns `undefined` if not found.

```ts
import {get_service} from 'printing-services'

const kdp = get_service('kdp')
```

Available IDs: `kdp`, `lulu`, `officeworks`, `vistaprint-au`, `ctrlprint`


### `list_services(country?: string): ServicePublic[]`

Get all services, optionally filtered by country code (e.g. `'au'`). Services with `countries: null` are considered global and always included.

```ts
import {list_services} from 'printing-services'

// All services
const all = list_services()

// Only services available in Australia (includes global ones)
const au = list_services('au')
```


## ServicePublic

Each service object has these properties and methods:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `countries` | `string[] \| null` | Country codes, or `null` if global |
| `quality` | `number` | Quality rating (1=low, 2=medium, 3=high) |
| `expense` | `ExpenseRatings` | Cost ratings for common configurations |
| `interior_calc_requires_binding` | `boolean` | Whether binding type affects interior dimension calculations |
| `cover_calc_requires_binding` | `boolean` | Whether binding type affects cover dimension calculations |
| `cover_calc_requires_paper` | `boolean` | Whether paper type affects cover dimension calculations |
| `cover_calc_requires_ink` | `boolean` | Whether ink type affects cover dimension calculations |
| `url_website` | `string` | Service homepage |
| `url_guide` | `string` | Artwork/specification guide |
| `url_pricing` | `string` | Pricing page |
| `raw` | `ServiceConfig` | Internal config (advanced use only) |

### Service methods

#### `get_sizes({binding_type?, unit?}): GetSizesItem[]`

List available trim sizes, optionally filtered by binding type.

#### `get_binding_types({pages?, size?, ink_type?, paper_type?}): GetBindingTypesItem[]`

List available binding types, optionally filtered by other selections.

#### `get_ink_types({binding_type?, paper_type?}): GetInkTypesItem[]`

List available ink types, optionally filtered by binding or paper.

#### `get_paper_types({binding_type?, ink_type?}): GetPaperTypesItem[]`

List available paper types, optionally filtered by binding or ink.

#### `get_cover_types(): GetCoverTypesItem[]`

List available cover finishes (e.g. glossy, matte).

#### `get_dimensions(args): GetDimensionsResult`

Calculate all dimensions for a specific book configuration. This is the main method.

```ts
const dims = kdp.get_dimensions({
    size: 'us_trade',       // SizeId or CustomSize
    pages: 300,             // Total interior page count
    binding_type: 'paperback',
    paper_type: 'white',    // Optional for some services
    ink_type: 'bw',         // Optional for some services
    unit: 'inch',           // Optional, defaults to service's native unit
})
```

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `size` | `SizeId \| CustomSize` | Yes | A known size ID or custom `{unit, width, height}` |
| `pages` | `number` | Yes | Total interior page count (not sheets) |
| `binding_type` | `BindingTypeId` | Yes | Binding type ID |
| `paper_type` | `PaperTypeId` | Depends | Required when `cover_calc_requires_paper` is true |
| `ink_type` | `InkTypeId` | Depends | Required when `cover_calc_requires_ink` is true |
| `unit` | `UnitType` | No | Output unit (`'inch'` or `'mm'`). Defaults to service's native unit |

### CustomSize

```ts
interface CustomSize {
    unit: UnitType
    width: number | string | Big
    height: number | string | Big
}
```

Use instead of a `SizeId` when the service supports custom trim sizes.


## GetDimensionsResult

All numeric values are `Big` instances (from the `big.js` library) for precision. Call `.toNumber()` or `.toString()` to convert.


### Metadata

| Property | Type | Description |
|----------|------|-------------|
| `unit` | `'inch' \| 'mm'` | Unit of all dimensions in the result |
| `interior_includes_cover` | `boolean` | Whether the interior PDF should include cover pages (common for stitch-bound booklets from general printers) |
| `interior_blank_pages` | `number` | Number of blank pages to insert before the back cover when `interior_includes_cover` is true, to ensure the page count is a multiple of 4 |
| `interior_has_bleed` | `boolean \| 'outer-only'` | Whether interior pages have bleed. `'outer-only'` means bleed is only on the three outer edges (top, bottom, fore-edge) and NOT on the spine/gutter edge |
| `cover_has_bleed` | `boolean` | Whether the cover has bleed |
| `cover_has_spine` | `boolean` | Whether the cover has a spine area (false for coil/stitch bindings) |
| `cover_has_spine_text` | `boolean` | Whether the spine is wide enough for text (typically 80+ pages) |
| `cover_has_flaps` | `boolean` | Whether the cover includes dust jacket flaps |


### Interior dimensions

These describe a single interior page.

| Property | Description |
|----------|-------------|
| `interior_bleed` | Bleed amount extending beyond the trim edge. Content in this area may be cut off |
| `interior_margin` | Minimum safe margin inset from trim on all sides. Important content should not enter this area |
| `interior_gutter` | Additional margin for the inner/spine edge, on top of the regular margin. Compensates for pages curving into the binding on thick books |
| `interior_trim_width` | Final page width after trimming (the "finished" size) |
| `interior_trim_height` | Final page height after trimming |
| `interior_safe_width` | Width of the safe content area: `trim_width - margin*2 - gutter` |
| `interior_safe_height` | Height of the safe content area: `trim_height - margin*2` |
| `interior_total_width` | Full page width including bleed. If `interior_has_bleed` is `'outer-only'`, bleed is added to one side only |
| `interior_total_height` | Full page height including bleed (top and bottom) |

**Relationship:** `total > trim > safe`


### Cover dimensions

These describe the full cover spread (back + spine + front as a single document).

| Property | Description |
|----------|-------------|
| `cover_bleed` | Bleed extending beyond cover trim on all edges. For hardcovers this is the "wrap" that folds around the board |
| `cover_margin` | Safe margin inset from the face trim edge. For hardcovers this may represent the hinge area |
| `cover_spine` | Width of the spine strip between back and front covers |
| `cover_spine_margin` | Safe margin inset from spine edges. Text on spine should be within this |
| `cover_face_width` | Width of one cover face (front or back). Equals interior trim width plus any overhang for hardcovers |
| `cover_face_height` | Height of one cover face. Equals interior trim height plus any overhang for hardcovers |
| `cover_safe_width` | Safe content width per face: `face_width - margin*2` |
| `cover_safe_height` | Safe content height per face: `face_height - margin*2` |
| `cover_trim_width` | Full cover trim width: `face_width*2 + spine` |
| `cover_trim_height` | Cover trim height (same as `face_height`) |
| `cover_total_width` | Full document width: `trim_width + (bleed + flap)*2` |
| `cover_total_height` | Full document height: `trim_height + bleed*2` |

**Relationship:**

```
┌──────────────────────────────────────────────────────────┐
│ bleed                                                    │
│ ┌──────────────────┬───────┬──────────────────┐          │
│ │ back face        │ spine │ front face       │          │
│ │                  │       │                  │          │
│ │  ┌────────────┐  │       │  ┌────────────┐  │          │
│ │  │ safe area  │  │       │  │ safe area  │  │          │
│ │  └────────────┘  │       │  └────────────┘  │          │
│ │                  │       │                  │          │
│ └──────────────────┴───────┴──────────────────┘          │
│                                                     flap │
└──────────────────────────────────────────────────────────┘
```


### Cover regions

Regions describe the position and size of each cover face within the full document. Coordinates are relative to the top-left of the full document (which includes bleed and flaps), but the regions themselves represent only the visible face areas.

| Property | Type | Description |
|----------|------|-------------|
| `cover_region_back` | `Region` | Position of the back cover face within the full document |
| `cover_region_spine` | `Region` | Position of the spine within the full document |
| `cover_region_front` | `Region` | Position of the front cover face within the full document |

Each `Region` has `{x, y, w, h}` — the top-left origin and dimensions of that section, measured from the top-left corner of the full cover document.
