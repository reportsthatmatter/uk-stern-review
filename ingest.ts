import { pipeline, romanFolios } from "@rtm/ingest";

/**
 * How this report is built. Owned by the report: every decision that shaped its text is named here.
 *
 * The source is HM Treasury's pre-publication web edition of the Executive Summary (full), 30 October 2006:
 * a born-digital, untagged Word-to-Distiller PDF, 27 A4 pages, single column, folioed i-xxvii.
 * See README.md for the source and scope.
 */
export default pipeline({
  id: "uk-stern-review",
  title: "Stern Review on the Economics of Climate Change",
  authors: "Nicholas Stern (HM Treasury)",
  published_at: "30 October 2006",
  source_url: "https://webarchive.nationalarchives.gov.uk/ukgwa/20100407172811/http://www.hm-treasury.gov.uk/stern_review_report.htm",
  repo: ".",
  volumes: [
    {
      path: "archive/stern-review-executive-summary.pdf",
      sha256: "992ad24f46cd9d5be4078f42652417df86de9411242a29a257eefd073a077474",
    },
  ],
  passes: [
    // Every page is folioed in lower-case roman, i (PDF p.1) to xxvii (PDF p.27).
    romanFolios(),
  ],
});
