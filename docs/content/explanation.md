---
title: Explanation
---

# Explanation of calculations
Notes about various aspects of printing and how this module handles them.

## Expense
Many items have an expense property which is a relative cost of the option expressed as a number between 1-10. Costs fluctuate and differ by region, so there's no point in given exact amounts. Instead the relative number allows easy comparison with other options. The number could be represented in a UI in the following ways:

 * Sorting by expense
 * Labelling lowest as "Cheapest" and highest as "Most expensive"
 * 1-2 "$", 3-4 "$$", 5-6 "$$$", 7-8 "$$$$", 9-10 "$$$$$"
 * Having a stronger color of text the higher the number
 * Warning user that 5+ is more expensive


## Margin
The margin does not need to be strictly adhered to. The recommended minimum margin for each service is included in dimensions, but varies greatly. For example, Lulu's recommended margin is double KDP's. A margin of 0.5" (13 mm) is a good default.


## Gutter
This module calculates the gutter as an additional margin for the inner edge of pages, so the total margin of the inner edge is the regular margin + gutter value. This is unlike some services that include the regular margin in the gutter amount.


## Interior bleed
You do not need bleed on interior pages unless you have at least one image that goes to the very edge of a page. Bleed for interior pages is optional in KDP and Lulu will add it automatically if you don't have it. So you can ignore it if you don't need it. In which case you should ignore the interior_total properties and just use the interior_trim properties for the page size.

If you do need interior bleed then be careful because services like Lulu expect the bleed to be on every side of a page, where as KDP expects it to NOT be included for inner edges (spine edges). If the value of `interior_has_bleed` is "outer-only" then the total page width will only be increased by one addition of bleed (one side only). So for PDFs for KDP you would need to only add bleed to the outer edge, alternating left/right side for each page.


## Wrap
For hardcovers, to simplify things, the "wrap" is just considered to be the same as "bleed". In KDP for example, hardcovers have a wrap instead of a bleed, that wraps around the edge of the hardcover. For cover creation purposes, it is the same as the bleed in that it should have a background and not contain anything important.


## Interior includes cover
General use printers usually won't allow a cover to be uploaded separately, it will simply be part of the interior PDF. This is the case when `interior_includes_cover` is true. When it is true, `interior_blank_pages` will tell you if you need to insert any blank pages at the end of your content to ensure the back cover page will actually be printed as the last page of the book (on the back).

These services will probably also print the first content page on the **back** of the front cover (unlike a paperback), and print the last page on the other side of the back cover. To avoid this, you can simply add a blank page to the start and end of your interior content.
