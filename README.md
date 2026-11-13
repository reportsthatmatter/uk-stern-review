# Stern Review: The Economics of Climate Change

The Stern Review on the Economics of Climate Change, an independent review led by Sir Nicholas Stern for the Chancellor of the Exchequer and the Prime Minister, published by HM Treasury on 30 October 2006. It found that "the benefits of strong, early action considerably outweigh the costs" of climate change, estimated the cost of stabilising greenhouse gases at around 1% of GDP a year, and called climate change "the greatest and widest-ranging market failure ever seen". Served on [Reports that Matter](https://reportsthatmatter.org/reports/uk-stern-review).

## Scope

One report id, `uk-stern-review`, built up unit by unit as further volumes in `ingest.ts`, in the order of the Review's own table of contents (`Table_of_Contents.pdf`: Executive Summary i-xxvii; Preface and Acknowledgements i; Introduction iv; Summary of Conclusions vi; then Parts I-VI with their chapters, arabic pages 1-575, and the acronyms list).

- **Unit 1 (live 2026-11-08):** the Executive Summary (full), 27 pages.
- **Unit 2 (2026-11-12, reportsthatmatter-gqsy.9.2, batch 1):** the Preface and Acknowledgements, the Introduction, the Summary of Conclusions, the introductions to Parts I-III, and the most-cited chapters: 2 (economics, ethics and discounting), 6 (economic modelling of impacts: the "5-20% of GDP"), 9 and 10 (the costs of cutting emissions: "around 1% of GDP") and 13 (the stabilisation goal). 122 pages.
- **Later batches:** the remaining chapters (1, 3-5, 7, 8, 11, 12, 14-27) in table-of-contents order, the Postscript, the Chapter 2 technical annex and annexes 7a-7g. The table of contents itself (one page) and the short executive summary are not ingested: the site builds its own contents, and the short summary repeats the Executive Summary.

## Source

HM Treasury's web edition, one PDF per part, from its report page `stern_review_report.htm` (held by the UK Government Web Archive, which refuses scripted downloads; every file here is the Wayback Machine's capture). `datapackage.json` lists each file with its size, SHA-256, original URL and the capture it was taken from.

`archive/stern-review-executive-summary.pdf`: the "pre-publication edition" of the Executive Summary (full), as published on 30 October 2006 (first at `/media/8AC/F7/Executive_Summary.pdf`, later at `/d/Executive_Summary.pdf`). 317,419 bytes, SHA-256 `992ad24f46cd9d5be4078f42652417df86de9411242a29a257eefd073a077474`, from the capture of 23 October 2008.

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

Versions (Executive Summary): one PDF version. HM Treasury called the web edition "pre-publication"; the Cambridge University Press book (January 2007) and the later web pages added a Postscript to the full report, which is not part of the executive summary.

Layout notes: running head "STERN REVIEW: The Economics of Climate Change" on every page (Arial Bold, navy); the roman folio at the foot; key findings in bold italic at the body size; five figures in shaded boxes with a title, a caption and a "Source:" line, four of them charts whose labels are live text (Figures 1-4, PDF pp.4, 5, 12, 15) and one an image (Figure 5, p.20); five footnotes at the page foot, each number on its own line above the note.

### Versions of the full report's files (checked 2026-11-12)

HM Treasury published the chapter PDFs twice. The first set (made 26-27 October 2006, Word to Distiller 5.0, mostly untagged) sat under `/media/8A?/../`; in January 2007 it was replaced under `/d/` by a reissue (made 8 and 18 January 2007 with PDFMaker, tagged), which the site served until 2013. Word-level diffs of the two show corrections, not revisions: Chapter 10 "feasibl,e" to "feasible", a note "GWP should read GDP" under Figure 10.1, Introduction "collection" to "collective", added names in the Acknowledgements, hyphenation ("greenhouse-gas" to "greenhouse gas"). **We use the January 2007 reissue wherever one exists** (Preface, Introduction, Chapters 2, 6, 9, 10, 13, Part III introduction): it is HM Treasury's corrected text of the same edition, and the one the Review's own site carried longest. The Executive Summary, Summary of Conclusions, Table of Contents and Part I and II introductions have a single digest in every capture from 2006 to 2013. For Chapter 9 only the reissue was found in the Wayback Machine. The reissues' tag trees hold paragraphs, lists and table cells but no headings or notes, so they are not a structure source; the PDF pipeline reads every volume.

Layout notes (full report): body Arial 10.5pt; page head "PART II: The Impacts of Climate Change on Growth and Development" (Arial bold navy), page foot "STERN REVIEW: The Economics of Climate Change" with the folio on the same line; chapter titles ("6 Economic modelling of climate-change impacts") and numbered sections ("6.1 Introduction") in bold navy; a "Key Messages" box at each chapter's head; key findings in bold italic; footnotes at the page foot, numbered from 1 in each chapter, markers as raised digits (as is the 2 of every CO2); charts drawn with live-text labels in smaller Arial or Times New Roman; tables in a smaller Arial or in the body's face; equations (Chapter 6, Box 6.3) in Times New Roman and Symbol.

## Licence

Text of the report: Crown copyright, reused under the Open Government Licence v3.0. Our markup, processing and editorial additions: CC BY 4.0. Code: MIT. Evidence, caveats and the full statement are in [LICENSE](LICENSE); the MIT text is in [LICENSE-MIT](LICENSE-MIT).

## Build

`ingest.ts` declares how the report is turned into Markdown, with the passes it composes (each with the page that needed it). Rebuild from the site repo with `pnpm ingest run uk-stern-review`. `golden.yaml` holds sixteen pages read off the page images (eight in the Executive Summary, eight in the later volumes); two are known failures, each with a bead (see PROCESSING.md). Needs `@rtm/ingest` v0.34.0.
