# Stern Review: The Economics of Climate Change

The Stern Review on the Economics of Climate Change, an independent review led by Sir Nicholas Stern for the Chancellor of the Exchequer and the Prime Minister, published by HM Treasury on 30 October 2006. It found that "the benefits of strong, early action considerably outweigh the costs" of climate change, estimated the cost of stabilising greenhouse gases at around 1% of GDP a year, and called climate change "the greatest and widest-ranging market failure ever seen". Served on [Reports that Matter](https://reportsthatmatter.org/reports/uk-stern-review).

## Scope

The **Executive Summary (full)** only, so far (27 PDF pages, folioed i-xxvii), as the report id `uk-stern-review`. It is the Review's own account of its argument and conclusions, and the part most readers cite. The full report (a Table of Contents, the Summary of Conclusions, Preface, Introduction, six Parts in 27 chapters, a Postscript and technical annexes: about 55 PDFs and 700 pages on HM Treasury's site) is the next set of units of this same id, to be added as further volumes in `ingest.ts`. The short (4-page) executive summary and the Summary of Conclusions are separate documents and out of scope for now.

## Source

`archive/stern-review-executive-summary.pdf`: HM Treasury's "pre-publication edition" of the Executive Summary (full), as published on hm-treasury.gov.uk on 30 October 2006 (first at `/media/8AC/F7/Executive_Summary.pdf`, later at `/d/Executive_Summary.pdf`). 317,419 bytes, SHA-256 `992ad24f46cd9d5be4078f42652417df86de9411242a29a257eefd073a077474`. HM Treasury's site of the time is held by the UK Government Web Archive; that archive refuses scripted downloads, so the file was taken from the Wayback Machine's capture of 23 October 2008 (`web.archive.org/web/20081023104149id_/http://www.hm-treasury.gov.uk/d/Executive_Summary.pdf`). See `datapackage.json`.

## Materials

Checked 2026-11-08 (stage 1 of the preparation pipeline, reportsthatmatter-gqsy.9).

| Need | Source | Role |
| --- | --- | --- |
| Words | The PDF's text layer, SHA-256 `992ad24f…7474` | canonical, citation target |
| Blocks and headings | The same PDF's layout (faces and sizes): one heading ("Executive Summary"), key findings in bold italic | PDF |
| Notes | The PDF's five footnotes (pp.iii, v, vi) | PDF |
| Page anchors | The printed roman folios, i (PDF p.1) to xxvii (PDF p.27) | PDF |
| Provenance | HM Treasury's report page (UK Government Web Archive; Wayback) | datapackage |
| Reference | None: no other edition of the text exists to score against | waived (scoring) |
| Rejected | Cambridge University Press's book edition (2007, ISBN 0-521-70080-9): a separate, commercially published edition | not used |

Sourcing checklist:

1. How the PDF was made: Microsoft Word ("Executive Summary Final Edit 271006"), PScript5 and Acrobat Distiller 5.0 (Windows), created 27 October 2006. Arial and Tahoma (bullets in Symbol). Born-digital; untagged, no structure tree; A4, single column. Every page prints its roman folio.
2. Other renditions: HM Treasury published one PDF of the full executive summary; the Wayback Machine holds one version of it (one digest) from November 2006 to May 2013, at both of its URLs.
3. Official HTML: none. HM Treasury's report page lists PDFs only.
4. EPUB: none official (Cambridge University Press's ebook is its own edition).
5. Wikisource: none found.
6. Court documents: not applicable.
7. US congressional: not applicable.
8. Originals: HM Treasury; the printed book from Cambridge University Press.

Versions: one PDF version. HM Treasury called the web edition "pre-publication"; the Cambridge University Press book (January 2007) and the later web pages added a Postscript to the full report, which is not part of the executive summary.

Layout notes: running head "STERN REVIEW: The Economics of Climate Change" on every page (Arial Bold, navy); the roman folio at the foot; key findings in bold italic at the body size; five figures in shaded boxes with a title, a caption and a "Source:" line, four of them charts whose labels are live text (Figures 1-4, PDF pp.4, 5, 12, 15) and one an image (Figure 5, p.20); five footnotes at the page foot, each number on its own line above the note.

## Licence

Text of the report: Crown copyright, reused under the Open Government Licence v3.0. Our markup, processing and editorial additions: CC BY 4.0. Code: MIT. Evidence, caveats and the full statement are in [LICENSE](LICENSE); the MIT text is in [LICENSE-MIT](LICENSE-MIT).

## Build

`ingest.ts` declares how the report is turned into Markdown, with the passes it composes (each with the page that needed it). Rebuild from the site repo with `pnpm ingest run uk-stern-review`. `golden.yaml` holds eight pages read off the page images; two are known failures, each with a bead (see PROCESSING.md). Needs `@rtm/ingest` v0.33.0.
