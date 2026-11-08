import { pipeline, quoteInset, romanFolios, runningFurniture, typographicHeadings, type BodyPass, type SourcePass } from "@rtm/ingest";

/**
 * The labels, axes and legends of the report's charts are live text in the PDF (the charts were drawn in Word and
 * Excel and set in Arial, the body's own family, so `figureFaces` cannot tell them apart). Left in, each chart read
 * as a run of fragments ("EMISSIONS Industry (14%) Other energy Power related (5%) (24%)", PDF p.4; Figure 2's
 * impacts table, PDF p.5). The figures themselves are not reproduced: each one's title, its caption paragraph and
 * its "Source:" line stay, and the drawn words between them go. Each chart is found by the printed lines either side
 * of it; a page whose anchors are missing throws, so a changed text layer cannot silently drop body text.
 * Figure 5 (PDF p.20) is an image with no text layer and needs nothing.
 */
const FIGURES: ReadonlyArray<{ pdfIndex: number; after: RegExp; before: RegExp }> = [
  // Figure 1, greenhouse-gas emissions in 2000 by source (a pie chart).
  { pdfIndex: 4, after: /^\s*Figure 1 Greenhouse-gas emissions in 2000, by source\s*$/, before: /^\s*Source:\s+Prepared by Stern Review/ },
  // Figure 2, stabilisation levels and temperature ranges (the probability bars and the impacts table), up to the
  // page's footnotes 2-4, which its caption cites.
  { pdfIndex: 5, after: /This figure shows potential changes based on current scientific literature\.\s*$/, before: /^2\s*$/ },
  // Figure 3, illustrative emissions paths to 550ppm (axis values and legend).
  { pdfIndex: 12, after: /the rate of cuts is reduced from 2\.5%\/yr to 1\.5%\/yr\.\s*$/, before: /^\s*Source:\s+Reproduced by the Stern Review/ },
  // Figure 4, model cost projections (a scatter plot's axes and legend), under its two-line title.
  { pdfIndex: 15, after: /^\s*Costs of CO2 reductions as a fraction of world GDP against level of reduction\s*$/, before: /^\s*Source:\s+Barker, T\./ },
];

const figureLabels: SourcePass = {
  name: "figureLabels",
  stage: "source",
  run(lines, at) {
    if (at.volume !== 1) return lines;
    const figure = FIGURES.find((f) => f.pdfIndex === at.pdfIndex);
    if (!figure) return lines;
    const start = lines.findIndex((line) => figure.after.test(line));
    const end = lines.findIndex((line, i) => i > start && figure.before.test(line));
    if (start < 0 || end < 0) throw new Error(`figureLabels: anchors not found on PDF p.${at.pdfIndex}`);
    // A blank line on each side, so the caption above and the source line below stay paragraphs of their own.
    return [...lines.slice(0, start + 1), "", ...lines.slice(end)];
  },
};

/**
 * Figure 2's title is set on the line directly above its caption paragraph with no space between (PDF p.5), so the
 * two read as one paragraph. A blank line after the title keeps the title its own paragraph, as on the other figures.
 */
const figureTitleBreak: SourcePass = {
  name: "figureTitleBreak",
  stage: "source",
  run(lines, at) {
    if (at.volume !== 1 || at.pdfIndex !== 5) return lines;
    const i = lines.findIndex((line) => /^\s*Figure 2 Stabilisation levels and probability ranges for temperature increases\s*$/.test(line));
    if (i < 0) throw new Error("figureTitleBreak: Figure 2's title not found on PDF p.5");
    return [...lines.slice(0, i + 1), "", ...lines.slice(i + 1)];
  },
};

/**
 * The note markers, set where the PDF prints them. Four of the five are small raised digits that the text layer runs
 * into the word before ("(ppm) CO2 1", PDF p.3; "the IPCC 20012", "study3", "studies4" in Figure 2's caption, p.5),
 * and the raised-digit linker (`layoutMarkers`) cannot be used: this report sets every "CO2e" with a raised 2 as well,
 * and on p.5 it took the "2" of "750ppm CO2e" for note 2 ("CO[^2]e"). So each marker is set here by its printed
 * words, and nothing else is linked by the layout. Note 5 ("fifty years or so.5", p.6) is linked by the text reading.
 * A marker whose words are missing throws.
 */
const MARKERS: ReadonlyArray<{ pdfIndex: number; from: string; to: string }> = [
  { pdfIndex: 3, from: "(ppm) CO2 1,", to: "(ppm) CO2[^1]," },
  { pdfIndex: 5, from: "IPCC 20012 and", to: "IPCC 2001[^2] and" },
  { pdfIndex: 5, from: "ensemble study3.", to: "ensemble study[^3]." },
  { pdfIndex: 5, from: "recent studies4.", to: "recent studies[^4]." },
];

const noteMarkers: SourcePass = {
  name: "noteMarkers",
  stage: "source",
  run(lines, at) {
    if (at.volume !== 1) return lines;
    let out = lines;
    for (const m of MARKERS.filter((x) => x.pdfIndex === at.pdfIndex)) {
      const i = out.findIndex((line) => line.includes(m.from));
      if (i < 0) throw new Error(`noteMarkers: "${m.from}" not found on PDF p.${at.pdfIndex}`);
      out = out.map((line, j) => (j === i ? line.replace(m.from, m.to) : line));
    }
    return out;
  },
};

/**
 * The report's key findings are set in bold italic at the body's size, each a paragraph of its own above the
 * paragraphs that argue it ("The scientific evidence points to increasing risks of serious, irreversible impacts
 * ...", PDF p.3; 27 of them, pp.1-27). They are the summary's own summary, so the emphasis is kept: each run of
 * consecutive bold-italic layout lines is wrapped in `***` (Markdown bold italic) at its first and last text line.
 * Found by the layout's face, matched to the text line by its opening characters (whitespace ignored, since the
 * text layer sets "CO2e" with spaces the layout does not). Paragraph ids ignore the asterisks, so they do not move.
 */
const KEY_FINDING_FACE = "Arial,BoldItalic|16|#000000|b|i";
const keyFindings: BodyPass = {
  name: "keyFindings",
  stage: "body",
  run(lines, context, at) {
    const layout = context?.layout;
    if (!layout || !at) return lines;
    const squash = (text: string) => text.replace(/\s+/g, "");
    const page = layout.lines(at.volume, at.pdfIndex);
    // Runs of consecutive bold-italic lines, in reading order.
    const runs: string[][] = [];
    let open: string[] | null = null;
    for (const line of page) {
      if (line.font === KEY_FINDING_FACE && squash(line.text)) {
        if (!open) runs.push((open = []));
        open.push(squash(line.text));
      } else open = null;
    }
    if (!runs.length) return lines;
    const out = [...lines];
    let from = 0;
    const find = (want: string, start: number) => {
      const head = want.slice(0, 24);
      for (let i = start; i < out.length; i++) if (squash(out[i]).startsWith(head)) return i;
      return -1;
    };
    for (const run of runs) {
      const first = find(run[0], from);
      const last = run.length === 1 ? first : find(run[run.length - 1], first + 1);
      if (first < 0 || last < 0) throw new Error(`keyFindings: a bold-italic finding not found on PDF p.${at.pdfIndex}`);
      out[first] = out[first].replace(/^(\s*)(\S)/, "$1***$2");
      out[last] = out[last].replace(/\s*$/, "***");
      from = last + 1;
    }
    return out;
  },
};

/**
 * How this report is built. Owned by the report: every decision that shaped its text is named here.
 *
 * The source is HM Treasury's pre-publication web edition of the Executive Summary (full), 30 October 2006:
 * a born-digital, untagged Word-to-Distiller PDF, 27 A4 pages, single column, folioed i-xxvii, Arial 11pt
 * body (layout key 16). See README.md for the source and scope.
 */
export default pipeline({
  id: "uk-stern-review",
  title: "Stern Review: The Economics of Climate Change: Executive Summary",
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
    figureLabels,
    figureTitleBreak,
    noteMarkers,
    // Every page is headed "STERN REVIEW: The Economics of Climate Change" (bold navy, PDF p.1 onwards).
    runningFurniture(),
    keyFindings,
    // Every page is folioed in lower-case roman, i (PDF p.1) to xxvii (PDF p.27).
    romanFolios(),
    // The bulleted lists on PDF pp.6, 8 and 21-22 are set further in (the bullet at 7 columns, the text hanging at
    // 12) than those on pp.1-2, 7 and 12 (3 and 7), and the sustained-indent rule read them as quotations. The
    // report has no inset quotations, so the threshold is raised past the deeper lists.
    quoteInset(14),
    // The one heading the report prints: "Executive Summary" (PDF p.1), Arial Bold 13pt navy (layout key 18), the
    // running head's face, which runningFurniture has already taken off every page. Its key findings, set in bold
    // italic at the body's size ("The scientific evidence points to increasing risks...", p.3), are paragraphs:
    // the report sets them as lead sentences of the text, not as headings.
    typographicHeadings({ faces: [["Arial,Bold|18|#000065|b"]], firstLevel: 2 }),
  ],
});
