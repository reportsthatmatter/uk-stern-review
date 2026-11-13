import { writeFileSync } from "node:fs";
import { figureFaces, footnoteGap, footnoteRestarts, layoutMarkers, layoutPageJoins, pipeline, quoteInset, romanFolios, runningFurniture, typographicHeadings, type BodyPass, type LayoutLine, type SourcePass } from "@rtm/ingest";

/**
 * The volumes, in the order of the Review's own Table of Contents (its PDF, "Stern Review: The Economics of Climate
 * Change", 1 page): the Executive Summary (i-xxvii), the Preface and Acknowledgements (i), the Introduction (iv), the
 * Summary of Conclusions (vi), then the Parts, each opened by a one-page introduction, with their chapters (arabic
 * folios, 1-575, continuous through the Parts). HM Treasury published each as its own PDF; the chapters not yet
 * ingested are simply absent, and slot in at their place in this list. Passes find a volume by its file, never by its
 * index, so adding a volume moves nothing.
 */
const VOLUMES = [
  // Executive Summary (full), 27 pp, i-xxvii. Pre-publication edition, 27 October 2006 (one version only).
  { path: "archive/stern-review-executive-summary.pdf", sha256: "992ad24f46cd9d5be4078f42652417df86de9411242a29a257eefd073a077474" },
  // Preface and Acknowledgements, 3 pp, i-iii. HM Treasury's reissue of 8 January 2007 (see README, Versions).
  { path: "archive/stern-review-preface-and-acknowledgements.pdf", sha256: "910bc3b8b2df3a1a4b72dec1da9cead78ce5b66cc473a29d7f57b5a83be8e417" },
  // Introduction to the Review, 2 pp, iv-v. Reissue of 8 January 2007.
  { path: "archive/stern-review-introduction.pdf", sha256: "8dae7c3826d46dcdf2de620a184228eaeb0792597bda26d139836800b6a19b8d" },
  // Summary of Conclusions, 4 pp, vi-ix. 27 October 2006 (one version only).
  { path: "archive/stern-review-summary-of-conclusions.pdf", sha256: "f34bfebf82f50db6f35b726486492103309d1142234239d2d25488b794fc8158" },
  // Part I introduction, 1 p, 1. 27 October 2006 (one version only).
  { path: "archive/stern-review-part-1-introduction.pdf", sha256: "0d58a4f295168d6c7ba342d77f323b956441e7fa2802ee6fb9b721c5180e7a35" },
  // Chapter 1, The science of climate change, 21 pp, 2-22. Reissue of 18 January 2007 (the only one archived).
  { path: "archive/stern-review-chapter-01.pdf", sha256: "43b94244d01d5c453ada5e2bf7f1ee57119dbfd0d30ea289414dbd65445bcc0b" },
  // Chapter 2, Economics, ethics and climate change, 18 pp, 23-40. Reissue of 8 January 2007.
  { path: "archive/stern-review-chapter-02.pdf", sha256: "981b41d3315a9d31c4b83d7aa71d95c8c258ee0e7fb9738ffef9102f80b71943" },
  // Part II introduction, 1 p, 55. 27 October 2006 (one version only).
  { path: "archive/stern-review-part-2-introduction.pdf", sha256: "c0d803be78e363ed0c3e443cd5b32d27c87749ea12a936c053d5dbf8c9893e6d" },
  // Chapter 3, How climate change will affect people around the world, 36 pp, 56-91. Reissue of 18 January 2007.
  { path: "archive/stern-review-chapter-03.pdf", sha256: "fcae5a880237fe9cd792a826ffb734c29ddab2866a068fc2b1b8a0c1d8b09558" },
  // Chapter 4, Implications of climate change for development, 30 pp, 92-121. 28 October 2006 (the only one archived).
  { path: "archive/stern-review-chapter-04.pdf", sha256: "cd464a33614cf0bd6e1f3b19e30ed624e0a629ae6cd194cda52ebd3fda6b52dc" },
  // Chapter 5, Costs of climate change in developed countries, 21 pp, 122-142. Reissue of 8 January 2007.
  { path: "archive/stern-review-chapter-05.pdf", sha256: "1a3ec2f29f9a8296c792b1d0b61ee4c4248b84161de0c30e3727ac5fe149a43d" },
  // Chapter 6, Economic modelling of climate-change impacts, 25 pp, 143-167. Reissue of 8 January 2007.
  { path: "archive/stern-review-chapter-06.pdf", sha256: "98c9744456a060b430233e1637448452facecdce23b0f3c3d30523d9b5e96116" },
  // Part III introduction, 1 p, 168. Reissue of 18 January 2007.
  { path: "archive/stern-review-part-3-introduction.pdf", sha256: "02cddfdfd368cfe6885182337afa1c0ef55bb11820a25571bbcd79c3b4062b33" },
  // Chapter 7, Projecting the growth of greenhouse-gas emissions, with Annex 7A, 24 pp, 169-192. Reissue of 8 January 2007.
  { path: "archive/stern-review-chapter-07.pdf", sha256: "6a345f29718b79c1b7c0082e3660ad4c8b43c1ca7e5c4c252539a371dada8993" },
  // Chapter 8, The challenge of stabilisation, 18 pp, 193-210. Reissue of 18 January 2007.
  { path: "archive/stern-review-chapter-08.pdf", sha256: "49b7b893d4fc253279e080970dfbebec54cbdcdca25dc7aad56c5138681544b7" },
  // Chapter 9, Identifying the costs of mitigation, 28 pp, 211-238. Reissue of 18 January 2007 (the only one archived).
  { path: "archive/stern-review-chapter-09.pdf", sha256: "d4a55e6b0ae41c7d63e99f08f57ecb0274d56573df475f408e41d1914ec8119b" },
  // Chapter 10, Macroeconomic models of costs, 14 pp, 239-252. Reissue of 8 January 2007.
  { path: "archive/stern-review-chapter-10.pdf", sha256: "ca5aa33b1fde330f2dc907425e641db0c9cceb2e7d485e969c9c816e58fe2415" },
  // Chapter 13, Towards a goal for climate-change policy, 25 pp, 284-308. Reissue of 8 January 2007.
  { path: "archive/stern-review-chapter-13.pdf", sha256: "c643dd510e52d2db2e2db679799b0ae588dfc67241278b8c18fb279578fbec07" },
];

/** The 1-based volume index of a file in VOLUMES (what a pass sees as `at.volume`). */
const vol = (file: string): number => {
  const i = VOLUMES.findIndex((v) => v.path === `archive/${file}`);
  if (i < 0) throw new Error(`no volume archive/${file}`);
  return i + 1;
};
const ES = vol("stern-review-executive-summary.pdf");
/** The chapters: numbered sections, footnotes, charts and tables. */
const CHAPTERS = new Set(VOLUMES.map((v, i) => (/chapter-\d+\.pdf$/.test(v.path) ? i + 1 : 0)).filter(Boolean));

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
    if (at.volume !== ES) return lines;
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
    if (at.volume !== ES || at.pdfIndex !== 5) return lines;
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
const MARKERS: ReadonlyArray<{ file?: string; pdfIndex: number; from: string; to: string }> = [
  { pdfIndex: 3, from: "(ppm) CO2 1,", to: "(ppm) CO2[^1]," },
  { pdfIndex: 5, from: "IPCC 20012 and", to: "IPCC 2001[^2] and" },
  { pdfIndex: 5, from: "ensemble study3.", to: "ensemble study[^3]." },
  { pdfIndex: 5, from: "recent studies4.", to: "recent studies[^4]." },
  // The chapters' markers are linked from the layout (`layoutMarkers`), except where two notes are cited together
  // and their raised numbers run into one ("wealth.89", Chapter 6 p.149, notes 8 and 9; "world GDP1112", Chapter 10
  // p.246, notes 11 and 12), or the second of a pair stands apart from the first ("approach8 9.", Chapter 10
  // p.245): the layout reader takes a run as one number, and found no note 89 or 1112.
  { file: "stern-review-chapter-06.pdf", pdfIndex: 7, from: "inequality in wealth.89", to: "inequality in wealth.[^8][^9]" },
  { file: "stern-review-chapter-10.pdf", pdfIndex: 7, from: "multi-gas approach8 9.", to: "multi-gas approach[^8][^9]." },
  { file: "stern-review-chapter-10.pdf", pdfIndex: 8, from: "of world GDP1112.", to: "of world GDP[^11][^12]." },
  // Chapter 1 sets two markers after a degree sign, and the layout reader did not take them ("greater than 5°C 19 .",
  // p.9; "1.5°C. 21 Some", p.10).
  { file: "stern-review-chapter-01.pdf", pdfIndex: 8, from: "greater than 5°C 19 .", to: "greater than 5°C[^19]." },
  { file: "stern-review-chapter-01.pdf", pdfIndex: 9, from: "1.5°C. 21 Some", to: "1.5°C.[^21] Some" },
  // Chapter 8 sets three markers apart from their words: in Table 8.1's source line ("Ramaswamy et al. (2001) 8 and
  // ... the WRI CAIT database 9 .", p.198) and after a "CO2e" ("expressed in CO2e 10 .", p.199).
  { file: "stern-review-chapter-08.pdf", pdfIndex: 6, from: "(2001) 8 and emissions", to: "(2001)[^8] and emissions" },
  { file: "stern-review-chapter-08.pdf", pdfIndex: 6, from: "CAIT database 9 .", to: "CAIT database[^9]." },
  { file: "stern-review-chapter-08.pdf", pdfIndex: 7, from: "expressed in CO2e 10 .", to: "expressed in CO2e[^10]." },
  // Not a marker: Chapter 8's note 4 (p.197) runs onto a line that opens on the "9" of "3 – 9 GtCO2", set at the
  // notes' margin, which read as note 9's number and took the rest of note 4, and note 5, as its text. The line is
  // set in, as the note's other lines are.
];

/**
 * Markers set after the notes are read. A page whose only note marker is set by hand above (as text, before the
 * notes are read) offers no number to read its note by, and the note was read into the body (Chapter 7 p.187, note
 * 51, cited from "effectiveness51.", which the layout reader did not take). Here the printed digits stay for the
 * notes reading and are linked afterwards, from the body's lines.
 */
const LATE_MARKERS: ReadonlyArray<{ file: string; pdfIndex: number; from: string; to: string }> = [
  { file: "stern-review-chapter-07.pdf", pdfIndex: 19, from: "effectiveness51.", to: "effectiveness[^51]." },
];
const lateMarkers: BodyPass = {
  name: "lateMarkers",
  stage: "body",
  run(lines, _context, at) {
    if (!at) return lines;
    let out = lines;
    for (const m of LATE_MARKERS.filter((x) => vol(x.file) === at.volume && x.pdfIndex === at.pdfIndex)) {
      const i = out.findIndex((line) => line.includes(m.from));
      if (i < 0) throw new Error(`lateMarkers: "${m.from}" not found on ${m.file} PDF p.${m.pdfIndex}`);
      out = out.map((line, j) => (j === i ? line.replace(m.from, m.to) : line));
    }
    return out;
  },
};

/**
 * Lines set back on the line before them, where they run on. Chapter 8's note 4 (p.197) runs onto a line that opens
 * on the "9" of "3 – 9GtCO2", set at the notes' margin, which read as note 9's number and took the rest of note 4,
 * and note 5, as its text. A page whose lines are missing throws.
 */
const RUN_ON_LINES: ReadonlyArray<{ file: string; pdfIndex: number; line: RegExp }> = [
  { file: "stern-review-chapter-08.pdf", pdfIndex: 5, line: /^9GtCO2 per year by around 2150 - 2300/ },
  // Box 8.3's items (p.204): each one's last line, opening on a capital or a number, stood as a paragraph.
  { file: "stern-review-chapter-08.pdf", pdfIndex: 12, line: /^\s+125% increase in electricity demand\. The reduction in total fossil fuel related emissions\s*$/ },
  { file: "stern-review-chapter-08.pdf", pdfIndex: 12, line: /^\s+Brazil rose by 3\.1% pa over the same period\.\s*$/ },
  { file: "stern-review-chapter-08.pdf", pdfIndex: 12, line: /^\s+2\.2% over the same period\.\s*$/ },
  { file: "stern-review-chapter-08.pdf", pdfIndex: 12, line: /^\s+5\.2% per year\.\s*$/ },
];
const runOnLines: SourcePass = {
  name: "runOnLines",
  stage: "source",
  run(lines, at) {
    let out = lines;
    for (const r of RUN_ON_LINES.filter((x) => vol(x.file) === at.volume && x.pdfIndex === at.pdfIndex)) {
      const i = out.findIndex((line) => r.line.test(line));
      if (i < 1) throw new Error(`runOnLines: ${r.line} not found on ${r.file} PDF p.${r.pdfIndex}`);
      out = [...out.slice(0, i - 1), `${out[i - 1].trimEnd()} ${out[i].trim()}`, ...out.slice(i + 1)];
    }
    return out;
  },
};

const noteMarkers: SourcePass = {
  name: "noteMarkers",
  stage: "source",
  run(lines, at) {
    let out = lines;
    for (const m of MARKERS.filter((x) => vol(x.file ?? "stern-review-executive-summary.pdf") === at.volume && x.pdfIndex === at.pdfIndex)) {
      const i = out.findIndex((line) => line.includes(m.from));
      if (i < 0) throw new Error(`noteMarkers: "${m.from}" not found on volume ${at.volume} PDF p.${at.pdfIndex}`);
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
// The Executive Summary and the Summary of Conclusions set them at 11pt (layout 16); the chapters at their body's
// 10.5pt (15), Chapter 9 in a regular Arial with a bold-italic style rather than the bold-italic font.
const KEY_FINDING_FACES = new Set(["Arial,BoldItalic|16|#000000|b|i", "Arial,BoldItalic|15|#000000|b|i", "Arial|15|#000000|b|i"]);
const keyFindings: BodyPass = {
  name: "keyFindings",
  stage: "body",
  run(lines, context, at) {
    const layout = context?.layout;
    if (!layout || !at) return lines;
    const squash = (text: string) => text.replace(/\s+/g, "");
    // The January 2007 reissues draw some lines in pieces, out of order (a finding's first letter, "T", after the
    // rest of its line, Chapter 8 p.199): the pieces of one printed line are put back together, top to bottom.
    const page: { top: number; height: number; font: string; text: string }[] = [];
    for (const l of [...layout.lines(at.volume, at.pdfIndex)].sort((a, b) => a.top - b.top || a.left - b.left)) {
      const same = page.find((p) => p.font === l.font && Math.abs(p.top - l.top) <= 2);
      if (same) same.text += l.text;
      else page.push({ top: l.top, height: l.height, font: l.font, text: l.text });
    }
    page.sort((a, b) => a.top - b.top);
    // Runs of consecutive bold-italic lines, in reading order. A gap wider than a line and a half starts a new
    // run: Chapter 10 p.247 (PDF p.8) sets two findings one above the other ("Consequently, the average expected
    // cost ..." and "Potential co-benefits need to be considered."), which as one run left a stray `***` on each.
    const runs: string[][] = [];
    let open: string[] | null = null;
    let prev: (typeof page)[number] | null = null;
    for (const line of page) {
      if (KEY_FINDING_FACES.has(line.font) && squash(line.text)) {
        if (open && prev && line.top - prev.top > 1.6 * prev.height) open = null;
        if (!open) runs.push((open = []));
        open.push(squash(line.text));
        prev = line;
      } else open = null;
    }
    if (!runs.length) return lines;
    const out = [...lines];
    let from = 0;
    const find = (want: string, start: number) => {
      const head = want.slice(0, 24);
      for (let i = start; i < out.length; i++) if (squash(out[i]).startsWith(head)) return i;
      // The layout can set a line's first letter apart ("T" over "he rate of emissions cuts ...", Chapter 8 p.199),
      // so a finding not found by its opening is looked for a letter in.
      for (let i = start; i < out.length; i++) if (squash(out[i]).slice(1).startsWith(head)) return i;
      return -1;
    };
    for (const run of runs) {
      const first = find(run[0], from);
      const last = run.length === 1 ? first : find(run[run.length - 1], first + 1);
      if (first < 0 || last < 0) throw new Error(`keyFindings: a bold-italic finding ("${run[first < 0 ? 0 : run.length - 1].slice(0, 40)}") not found on ${VOLUMES[at.volume - 1].path} PDF p.${at.pdfIndex}`);
      out[first] = out[first].replace(/^(\s*)(\S)/, "$1***$2");
      out[last] = out[last].replace(/\s*$/, "***");
      from = last + 1;
    }
    return out;
  },
};

/**
 * The page foot of every volume after the Executive Summary sets the running title and the folio on one line
 * ("STERN REVIEW: The Economics of Climate Change      143", Chapter 6 p.1; "... 1", the one-page Part I
 * introduction), and the front matter heads its pages with the title alone ("STERN REVIEW: The Economics of Climate
 * Change", Introduction pp.iv-v). On a volume of one or two pages `runningFurniture` sees too few repeats to take
 * either off: the head stood as a heading over each page of the Introduction, and the Part introductions lost their
 * folio, so their pages had no anchor. The title is taken off and the folio left on its own line, where the folio
 * reading finds it. The Executive Summary is left to `runningFurniture`, as before.
 */
const RUNNING_TITLE = /^(\s*)STERN REVIEW:\s+The Economics of Climate Change(?:\s{2,}(\S+))?\s*$/;
// Chapter 5's reissue (8 January 2007) folios its pages 1-21, where the Review's table of contents (and the first
// edition) set the chapter at pp.122-142. They are numbered as printed (the site labels them 1-21, after Part I's
// 1-22), so a page reference matches the file; PROCESSING.md says so. Renumbered, the independent page-anchor check
// (which reads the printed folios) counted every one of its pages as unmarked.
const runningTitle: SourcePass = {
  name: "runningTitle",
  stage: "source",
  run(lines, at) {
    if (at.volume === ES) return lines;
    return lines.flatMap((line) => {
      const m = RUNNING_TITLE.exec(line);
      if (!m) return [line];
      return m[2] ? [`${" ".repeat(60)}${m[2]}`] : [];
    });
  },
};

/**
 * Chapter 2's note 10 (p.33) prints two raised ordinals, "the 18th century" and "the 20th century", and the text
 * layer lifts each "th" onto a line of its own above its words; the first one shared a line with the note's number
 * ("10   th"), so the note's opening line read as "Often called a 'Bayesian' approach ...", with no number, and the
 * note was read into the body. The note is set back as the page prints it. A page whose lines are missing throws.
 */
const CH2 = vol("stern-review-chapter-02.pdf");
const ordinalNote: SourcePass = {
  name: "ordinalNote",
  stage: "source",
  run(lines, at) {
    if (at.volume !== CH2 || at.pdfIndex !== 11) return lines;
    const i = lines.findIndex((line) => /^10\s+th\s*$/.test(line));
    const ok =
      i >= 0 &&
      /^\s*Often called a .Bayesian. approach, after Thomas Bayes, the 18 century mathematician\. However, the application\s*$/.test(lines[i + 1] ?? "") &&
      /^\s+th\s*$/.test(lines[i + 2] ?? "") &&
      /^of Bayes. ideas to a subjective theory of probability was made in the 20 century\. See Ramsey \(1931\)\.\s*$/.test(lines[i + 3] ?? "");
    if (!ok) throw new Error("ordinalNote: note 10's lines not found on Chapter 2 PDF p.11");
    const note = [
      `10 ${lines[i + 1].trim().replace("the 18 century", "the 18th century")}`,
      lines[i + 3].replace("the 20 century", "the 20th century"),
    ];
    return [...lines.slice(0, i), ...note, ...lines.slice(i + 4)];
  },
};

/**
 * Charts and tables the chapters set in the body's own face, which `chartsAndTables` cannot tell from prose: their
 * labels and rows came out as fragments between the paragraphs ("> Social cost of Marginal abatement carbon costs",
 * Figure 2.2, p.27; Table 6.1's rows, "High Market impacts 2.5 0.3 7.5 climate Market impacts + risk 6.9 0.9 16.5",
 * p.163). Each is found by the printed lines either side of it (`after` or `from`, and `before`), and the lines
 * between go; the title above and the "Source:" line below stay. Figure 6.5 (p.157) prints four charts in two
 * columns, and the text layer runs each pair of titles together ("Figure 6.5 a. Baseline-climate scenario, with
 * market impacts and the Figure 6.5b. High-climate scenario..."): its titles are set back one after the other, as
 * `insert`. A page whose anchors are missing throws, so a changed text layer cannot silently drop body text.
 */
type Region = { file: string; pdfIndex: number; after?: RegExp; from?: RegExp; before: RegExp; insert?: string[] };
const REGIONS: ReadonlyArray<Region> = [
  { file: "stern-review-chapter-02.pdf", pdfIndex: 5, after: /^\s*Figure 2\.2 How the path for the social cost of carbon drives the extent of abatement\s*$/, before: /^\s*This illustrates how important it is that the dynamics/ },
  { file: "stern-review-chapter-02.pdf", pdfIndex: 13, after: /^\s*term\s*$/, before: /^\s*The issues are represented schematically in Figure 2\.4/ },
  { file: "stern-review-chapter-06.pdf", pdfIndex: 4, after: /human system, there will be feedbacks between many links in the chain\.\s*$/, before: /^\s*Source: Hope \(2005\)\.\s*$/ },
  { file: "stern-review-chapter-06.pdf", pdfIndex: 8, after: /^\s*Figure 6\.3 Coverage of existing integrated assessment studies\.\s*$/, before: /^\s*Source: Watkiss, Downing et al\. \(2005\)\.\s*$/ },
  {
    file: "stern-review-chapter-06.pdf",
    pdfIndex: 15,
    from: /^\s*Figure 6\.5 a\. Baseline-climate scenario, with market impacts and the\s{3,}Figure 6\.5b\./,
    before: /^\s*Figure 6\.5a-d traces losses in income per capita/,
    insert: [
      "Figure 6.5 a. Baseline-climate scenario, with market impacts and the risk of catastrophe.",
      "Figure 6.5b. High-climate scenario, with market impacts and the risk of catastrophe.",
      "Figure 6.5c. High-climate scenario, with market impacts, the risk of catastrophe and non-market impacts.",
      "Figure 6.5d. Combined scenarios.",
    ],
  },
  { file: "stern-review-chapter-06.pdf", pdfIndex: 21, after: /^\s*and economic impacts\*\.\s*$/, before: /^\s*\*Utility discount rate = 0\.1% per annum/ },
  { file: "stern-review-chapter-09.pdf", pdfIndex: 9, after: /^\s*Table 9\.1\s+Non-fossil-fuel emissions and savings by sector\s*$/, before: /^\s*9\.5\s+Reducing the demand for carbon-intensive goods and services\s*$/ },
  { file: "stern-review-chapter-09.pdf", pdfIndex: 14, after: /^\s*alternative \(in 2015, 2025, 2050\)\s*$/, before: /^\s*Even in the near to medium term, the uncertainties are very large\./ },
  { file: "stern-review-chapter-09.pdf", pdfIndex: 20, after: /^\s*Figure 9\.3 Emissions scenarios\s*$/, before: /^\s*A combination of technologies, together with advances in efficiency, are needed to\s*$/ },
  { file: "stern-review-chapter-09.pdf", pdfIndex: 23, after: /^\s*Table 9\.2\s+Annual total costs of reducing fossil fuel emissions to 18 GtCO2 in 2050\s*$/, before: /^\s*The sensitivity of the cost estimates to different assumptions/ },
  { file: "stern-review-chapter-09.pdf", pdfIndex: 23, after: /^\s*emissions to 18 GtCO2 in 2050 \(costs expressed as % of world GDP\)\s*a?\s*$/, before: /^\s*Assumptions as to future oil and gas prices and rates of innovation/ },
  { file: "stern-review-chapter-09.pdf", pdfIndex: 25, after: /^\s*Box 9\.7\s+Sources of fossil fuel related emission savings in 2050\s*$/, before: /^\s*The bars in the diagram above show the composition/ },
  { file: "stern-review-chapter-10.pdf", pdfIndex: 5, after: /^\s*\(% point levels difference from base model run\)\s*$/, before: /^\s*Source: Barker et al\. 2006\s*$/ },
  { file: "stern-review-chapter-13.pdf", pdfIndex: 12, after: /^\s*proportion of gross world product, from PAGE2002\s*$/, before: /^\s*Source: Hope \(2003\)\s*$/ },
  { file: "stern-review-chapter-13.pdf", pdfIndex: 13, after: /^\s*a stabilisation goal \(discounted percentage of gross world output\), by discount rate used\s*$/, before: /^\s*Source: adapted from Edenhofer et al\. \(2006\)/ },
  { file: "stern-review-chapter-13.pdf", pdfIndex: 20, after: /^\s*reductions\s*$/, before: /^\s*Up to the long-run stabilisation goal, the social cost of carbon will rise/ },
  { file: "stern-review-chapter-13.pdf", pdfIndex: 14, after: /^\s*costs from relaxing a stabilisation goal \(% of gross world output in the relevant year\)\s*$/, before: /^\s*Source: Adapted from US CCSP Synthesis/ },
  // The second batch's charts and tables with no title and source on one page, which `figureRegions` cannot find:
  // Table 1.1's rows under its explanation (p.12), Box 3.2's table of the IPCC scenarios (p.61), Table 3.2 (p.71, to the page foot), Box 5.1's diagram of the
  // production function (p.124; its equation, set inside the diagram, is set back as printed), Figure 8.3's two
  // charts under its caption (p.203) and Box 8.4's table of capital lifetimes (p.205).
  { file: "stern-review-chapter-01.pdf", pdfIndex: 11, after: /temperature changes expected prior to equilibrium, for example in 2100, would be lower\.\s*$/, before: /^\s*However, these are conservative estimates of the expected warming/ },
  { file: "stern-review-chapter-03.pdf", pdfIndex: 6, after: /^\s*Summary characteristics of IPCC socio-economic scenarios \(numbers in brackets for 2100\)\s*$/, before: /^\s*Adaptation assumptions\. Clarity over adaptation/ },
  { file: "stern-review-chapter-03.pdf", pdfIndex: 16, after: /consequences for food production\. The combined effect of several factors could be very damaging\.\s*$/, before: /^\s{20,}71\s*$/ },
  { file: "stern-review-chapter-05.pdf", pdfIndex: 3, after: /environmental quality available in that year\.\s*$/, before: /^\s*Where Y is the output of the economy/, insert: ["Y (t) = F(K,L,E)"] },
  { file: "stern-review-chapter-08.pdf", pdfIndex: 11, after: /such high rates of temperature change\.\s*$/, before: /^\s*Source: redrawn from O.Neill and Oppenheimer/ },
  { file: "stern-review-chapter-08.pdf", pdfIndex: 13, after: /capital stock\. Examples are given below\.\s*$/, before: /^\s*Source: World Business Council/ },
];
const bodyFaceFigures: SourcePass = {
  name: "bodyFaceFigures",
  stage: "source",
  run(lines, at) {
    let out = lines;
    for (const r of REGIONS) {
      if (at.volume !== vol(r.file) || at.pdfIndex !== r.pdfIndex) continue;
      const anchor = (r.after ?? r.from)!;
      const start = out.findIndex((line) => anchor.test(line));
      const end = out.findIndex((line, i) => i > start && r.before.test(line));
      if (start < 0 || end < 0) throw new Error(`bodyFaceFigures: anchors not found on ${r.file} PDF p.${r.pdfIndex}`);
      const head = r.after ? out.slice(0, start + 1) : out.slice(0, start);
      const insert = (r.insert ?? []).flatMap((line) => ["", line]);
      // A blank line on each side, so the title above and the line below stay paragraphs of their own.
      out = [...head, ...insert, "", ...out.slice(end)];
    }
    return out;
  },
};

/**
 * The chapters from the second batch on draw their charts and set their tables in the body's own face, as Chapters
 * 2, 6, 9, 10 and 13 do (`bodyFaceFigures`), and far more of them: Chapters 1, 3-5, 7 and 8 have 45. Rather than
 * name each one, a figure or table is found by its own lines: its title ("Figure 3.2 Changes in runoff with five
 * different climate models", "Table 5.1 Temperature-driven changes in energy requirements ...": the word, a
 * chapter number and a capital, so "Table 7.1 abstracts from ..." in the body is not one) and the first "Source:"
 * or "Note:" line after it on the same page, with no other figure, table or box title between them. Between the
 * two, a block of lines (up to a blank line) that reads as prose stays: every line one run of words (no gap of
 * three spaces or more, which is how pdftotext sets a table's columns or a chart's labels side by side), the
 * longest at least 70 characters (a body line is about 95) and at least eight words in all. Every other line goes:
 * the chart's labels and the table's rows. A title or source line set out in columns is closed up. A figure with no
 * source line on its page is left as it reads. Tables are therefore not served, as before (their titles and
 * sources are); see PROCESSING.md. `FIGURE_REGION_DROPS` (an environment variable naming a file) lists every line
 * dropped, for review.
 */
const BATCH_ONE = new Set(["02", "06", "09", "10", "13"].map((n) => vol(`stern-review-chapter-${n}.pdf`)));
const REGION_VOLUMES = new Set([...CHAPTERS].filter((v) => !BATCH_ONE.has(v)));
const REGION_TITLE = /^\s*(?:Figure|Table)\s+\d{1,2}[A-Z]?\.\d{1,2}[a-z]?\s+(?:[A-Z‘’'“"(]|\d)/;
const ANY_TITLE = /^\s*(?:Figure|Table|Box)\s+\d{1,2}[A-Z]?\.\d{1,2}[a-z]?\s+(?:[A-Z‘’'“"(]|\d)/;
const REGION_END = /^\s*(?:Sources?|Notes?)\s*:/;
const SECTION_LINE = /^\s*\d{1,2}\.\d{1,2}\s{2,}\S/;
const prose = (block: string[]): boolean => {
  const text = block.map((l) => l.trim());
  if (text.some((t) => /\S\s{3,}\S/.test(t))) return false;
  return Math.max(...text.map((t) => t.length)) >= 70 && text.join(" ").split(/\s+/).length >= 8;
};
const regionDrops: string[] = [];
const figureRegions: SourcePass = {
  name: "figureRegions",
  stage: "source",
  run(lines, at) {
    if (!REGION_VOLUMES.has(at.volume)) return lines;
    const out = [...lines];
    const drop = new Set<number>();
    for (let start = 0; start < out.length; start++) {
      if (!REGION_TITLE.test(out[start])) continue;
      let end = -1;
      for (let i = start + 1; i < out.length; i++) {
        if (REGION_END.test(out[i])) { end = i; break; }
        if (ANY_TITLE.test(out[i]) || SECTION_LINE.test(out[i])) break;
      }
      if (end < 0) continue;
      out[start] = out[start].replace(/(\S)\s{3,}(?=\S)/g, "$1 ");
      out[end] = out[end].replace(/(\S)\s{3,}(?=\S)/g, "$1 ");
      // A title wrapped onto a second line, set directly under it as one run of words, is the title's.
      let i = start + 1;
      if (out[i]?.trim() && !/\S\s{3,}\S/.test(out[i].trim()) && out[i].trim().length < 70) i++;
      while (i < end) {
        if (!out[i].trim()) { i++; continue; }
        let j = i;
        while (j < end && out[j].trim()) j++;
        if (!prose(out.slice(i, j))) for (let k = i; k < j; k++) drop.add(k);
        i = j;
      }
      start = end;
    }
    if (!drop.size) return out;
    if (process.env.FIGURE_REGION_DROPS) regionDrops.push(`== ${VOLUMES[at.volume - 1].path} p.${at.pdfIndex}`, ...[...drop].sort((a, b) => a - b).map((k) => out[k]));
    if (process.env.FIGURE_REGION_DROPS) writeFileSync(process.env.FIGURE_REGION_DROPS, regionDrops.join("\n") + "\n");
    // A blank line where each dropped run was, so the lines either side stay paragraphs of their own.
    return out.flatMap((line, k) => (drop.has(k) ? (drop.has(k - 1) ? [] : [""]) : [line]));
  },
};

/**
 * A numbered section heading that runs to a second line ("7.5 The role of technology and efficiency in breaking the
 * link between growth and" over "emissions", p.183; "4.5 Impact of climate change on economic growth prospects and
 * implications for" over "incomes and health", p.107) was read as a heading of its first line, and its last words
 * as a paragraph. A heading line followed directly by a short line set in to its text's column is one heading:
 * the second line is set on the first. The second batch's chapters only.
 */
const SECTION_HEAD = /^(\s*)(\d{1,2}\.\d{1,2})(\s{2,})(\S.*)$/;
const wrappedHeadings: SourcePass = {
  name: "wrappedHeadings",
  stage: "source",
  run(lines, at) {
    if (!REGION_VOLUMES.has(at.volume)) return lines;
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const m = SECTION_HEAD.exec(lines[i]);
      const next = lines[i + 1] ?? "";
      const column = m ? m[1].length + m[2].length + m[3].length : -1;
      const indent = next.length - next.trimStart().length;
      if (m && next.trim() && Math.abs(indent - column) <= 3 && next.trim().length < 50 && !/[.:]$/.test(m[4].trim())) {
        out.push(`${lines[i].trimEnd()} ${next.trim()}`);
        i++;
        continue;
      }
      out.push(lines[i]);
    }
    return out;
  },
};

/**
 * Each Part's introduction (one page) opens on its title, centred over two lines ("Part II" / "Impacts of Climate
 * Change on Growth and Development", p.55). Centred lines of different widths sit at different indents, and the
 * text reading cut Part II's title into two paragraphs, which the heading reader could not find as one heading
 * (Parts I and III, whose lines happen to be read together, came out as headings). The two lines are set flush, so
 * every Part title reads as one.
 */
const PART_INTROS = new Set(VOLUMES.map((v, i) => (/part-\d+-introduction\.pdf$/.test(v.path) ? i + 1 : 0)).filter(Boolean));
const partTitles: SourcePass = {
  name: "partTitles",
  stage: "source",
  run(lines, at) {
    if (!PART_INTROS.has(at.volume)) return lines;
    const first = lines.findIndex((line) => /^\s*Part [IVX]+\s*$/.test(line));
    if (first < 0 || !lines[first + 1]?.trim()) throw new Error(`partTitles: no two-line Part title on volume ${at.volume}`);
    return lines.map((line, i) => (i === first || i === first + 1 ? line.trim() : line));
  },
};

/**
 * Chapter 6's key messages (p.143) set their list's bullets at the margin itself, with the item's text hanging at
 * a tab ("•       Second, some recent scientific evidence ..." over "        11% to 14% if non-market impacts are
 * included."). At the margin the bullet read as a word of the line above: the list ran into the paragraph
 * introducing it ("...three important factors: • First, including..."), and its wrapped lines were cut wherever
 * one opened on a number ("11% to 14%") or followed the end of a sentence ("Based on existing studies"). Each item
 * (its bullet's line and the wrapped lines at the text's column) is set on one line, after a blank line, so it
 * reads as a list item. Only that page: tried on every margin bullet, the same joining ran Figure 6.2's caption
 * and list into one paragraph (p.147) and cut Box 6.1's items (p.154); the bullets set in from the margin, the
 * commoner style, read correctly. Figure 6.2's caption list (p.147) is left as it reads, run into its paragraph.
 */
// Chapter 1's Box 1.4 (p.16; its bullets at the margin with the text one space on and the wrapped lines set in
// further, so a wrapped "- 4.5°C" read as an item of its own and the bullets stood as text) is the same style.
// Chapter 8's Box 8.3 (p.204) is too, but joined here its lines no longer matched the layout's and the page's
// opening paragraphs were lost; its three cut lines are set back by `runOnLines` instead.
const MARGIN_BULLET_PAGES = new Set([`${vol("stern-review-chapter-06.pdf")}:1`, `${vol("stern-review-chapter-01.pdf")}:15`]);
const MARGIN_BULLET = /^ ?•(\s+)\S/;
const marginBullets: SourcePass = {
  name: "marginBullets",
  stage: "source",
  run(lines, at) {
    if (!MARGIN_BULLET_PAGES.has(`${at.volume}:${at.pdfIndex}`)) return lines;
    const out: string[] = [];
    let column = -1;
    let bullet = -1;
    for (const line of lines) {
      const indent = line.length - line.trimStart().length;
      const m = MARGIN_BULLET.exec(line);
      // An item ends at a blank line.
      if (!line.trim()) column = bullet = -1;
      // A wrapped line is set in past the bullet, up to a little past the item's text (at it, Chapter 6; just past
      // it, Chapter 1 p.16).
      if (!m && column >= 0 && line.trim() && indent > bullet && indent <= column + 2) {
        out[out.length - 1] = `${out[out.length - 1].trimEnd()} ${line.trim()}`;
        continue;
      }
      column = m ? line.indexOf("•") + 1 + m[1].length : -1;
      bullet = m ? line.indexOf("•") : -1;
      if (m && out.length && out[out.length - 1].trim()) out.push("");
      out.push(line);
    }
    return out;
  },
};

/**
 * A list item carried over a page break arrives as a run of hanging lines at the head of the next page, and the
 * text reading cut that run at lines opening on a number or a bracket: "(output-weighted), and they reach 0.5 - 2%
 * of global GDP..." stood as a paragraph after the 'Tol' model's item (Chapter 6 p.148), and Chapter 10's item on
 * countries' abatement costs fell into three ("(1.2toe/$GDP ...", "840tc/$GDP ...", "Russia).", p.246). On p.246
 * the head's hanging lines (the first run of lines set in at the item's text column, up to a blank line) are set on
 * one line, so the carried text reads as one piece and joins its item. On p.148 the same join leaves the two lines
 * a paragraph of their own (the list item above is not rejoined), so that page is left as it reads.
 */
// Also Chapter 5 p.124: the Australia item's "...predicted to drop by" over "15% for a 1 – 2°C rise in temperature."
const CARRIED_ITEM_PAGES = new Set([`${vol("stern-review-chapter-10.pdf")}:8`, `${vol("stern-review-chapter-05.pdf")}:3`]);
const carriedItems: SourcePass = {
  name: "carriedItems",
  stage: "source",
  run(lines, at) {
    if (!CARRIED_ITEM_PAGES.has(`${at.volume}:${at.pdfIndex}`)) return lines;
    const indent = (line: string) => line.length - line.trimStart().length;
    // The page head ("PART II: ...") is the first line; the carried item is the first indented run after it.
    const start = lines.findIndex((line, i) => i > 0 && line.trim() && indent(line) >= 8);
    if (start < 0) throw new Error(`carriedItems: no hanging lines at the head of volume ${at.volume} PDF p.${at.pdfIndex}`);
    let end = start + 1;
    while (end < lines.length && lines[end].trim() && indent(lines[end]) === indent(lines[start])) end++;
    const joined = lines[start].trimEnd() + " " + lines.slice(start + 1, end).map((line) => line.trim()).join(" ");
    return [...lines.slice(0, start), joined.trimEnd(), ...lines.slice(end)];
  },
};

/**
 * Chapter 9's note 17 runs over from p.217 to p.218, where its last words, "energy-efficiency measures.", sit alone
 * above note 18 and were read as a paragraph of the body (`noteFaceRunOver` does not take them: they are not at the
 * foot of the body but in the notes' block). The line is taken off p.218 here, and corrections.yaml (c-0005) sets
 * the words back at the end of note 17, where the page prints them.
 */
const noteTail: SourcePass = {
  name: "noteTail",
  stage: "source",
  run(lines, at) {
    if (at.volume !== vol("stern-review-chapter-09.pdf") || at.pdfIndex !== 8) return lines;
    const i = lines.findIndex((line) => /^\s*energy-efficiency measures\.\s*$/.test(line));
    if (i < 0 || !/^\s*18\s*$/.test(lines[i + 1] ?? "")) throw new Error("noteTail: note 17's last line not found on Chapter 9 PDF p.8");
    return [...lines.slice(0, i), ...lines.slice(i + 1)];
  },
};

/**
 * Chapter 8 (the reissue of 18 January 2007) draws some of its lines in pieces, out of order: a line's first letters
 * after the rest of it ("It" / " is the total warming effect ...", "le" / "ss than 20% of current levels", p.199).
 * Read as they are, the passes that lay the text out again from the layout (a chart's labels cut out of the page, a
 * key finding found by its opening words) cut those words in two. The pieces of one printed line (the same face,
 * the same top, each starting where the last ends) are put back into one layout line before any pass reads it. The
 * text layer is untouched.
 */
const PIECED = new Set([vol("stern-review-chapter-08.pdf")]);
const layoutPieces: BodyPass = {
  name: "layoutPieces",
  stage: "body",
  run(lines, context, at) {
    const layout = context?.layout;
    if (!layout || !at || !PIECED.has(at.volume)) return lines;
    const page = layout.lines(at.volume, at.pdfIndex);
    for (let merged = true; merged; ) {
      merged = false;
      for (const b of page) {
        const a = page.find((x) => x !== b && x.font === b.font && Math.abs(x.top - b.top) <= 2 && b.left - x.right >= -2 && b.left - x.right < 8);
        // A word or two drawn inside another piece's span, as "to" in "8.5 Pathways to stabilisation" (p.199), is
        // set back at the space nearest its place.
        const within = a ? undefined : page.find((x) => x !== b && x.font === b.font && Math.abs(x.top - b.top) <= 2 && b.left > x.left && b.right <= x.right + 2 && b.text.trim().split(/\s+/).length <= 2);
        if (within && !within.raised.length && !b.raised.length) {
          const at = ((b.left - within.left) / within.width) * within.text.length;
          const spaces = [...within.text.matchAll(/ /g)].map((m) => m.index!);
          const cut = spaces.sort((x, y) => Math.abs(x - at) - Math.abs(y - at))[0];
          if (cut !== undefined) {
            Object.assign(within, { text: `${within.text.slice(0, cut + 1)}${b.text.trim()} ${within.text.slice(cut + 1)}` });
            page.splice(page.indexOf(b), 1);
            merged = true;
            break;
          }
        }
        if (!a) continue;
        const shift = a.text.length;
        Object.assign(a, { text: a.text + b.text, right: b.right, width: b.right - a.left, raised: [...a.raised, ...b.raised.map((r) => ({ ...r, offset: r.offset + shift }))] });
        page.splice(page.indexOf(b), 1);
        merged = true;
        break;
      }
    }
    page.forEach((l, i) => ((l as { index: number }).index = i));
    return lines;
  },
};

/**
 * The chapters draw their charts in Word and Excel with live-text labels (axis values, legends, data labels:
 * "MAC / SCC, / x0* GHG abatement in period 0", Figure 2.1, p.25; Figure 6.3's "Proportion of Model Runs", p.153),
 * set their tables in a smaller Arial (Table 13.1, p.289: "Advantages Disadvantages ... -Linked directly to the
 * consequences"), and set the equations of Chapter 6's boxes in Times New Roman and Symbol (p.155). Left in, each
 * came out as runs of fragments between the paragraphs. Neither the figures, the tables nor the equations are
 * reproduced: each one's title and its "Source:" line, which are set in the body's face, stay; every other line the
 * layout sets in a face the prose never uses goes. The prose faces, read off the face census of the five chapters:
 * Arial (or ArialMT) at 15 (the body, its bold lead sentences, italic, bold-italic findings, navy section headings),
 * 16 (Chapter 10's key messages, the chapter titles), 18 (the Part head), and 12 regular (the footnotes); Symbol at
 * the body's size for its bullets. Applied to the chapters only.
 */
const PROSE_FAMILIES = new Set(["Arial", "Arial,Bold", "Arial,Italic", "Arial,BoldItalic", "ArialMT", "Arial-BoldMT", "Arial-ItalicMT", "Arial-BoldItalicMT"]);
const isProse = (line: LayoutLine): boolean => {
  if (line.family === "SymbolMT") return line.size >= 15 && line.size <= 16;
  if (!PROSE_FAMILIES.has(line.family)) return false;
  if (line.size >= 15 && line.size <= 16) return true;
  if (line.size === 18) return true;
  return line.size === 12 && !line.bold && line.color === "#000000";
};
const DRAWN = "drawn";
const drawnFigures = figureFaces([DRAWN]);
const chartsAndTables: BodyPass = {
  name: "chartsAndTables",
  stage: "body",
  run(lines, context, at) {
    const layout = context?.layout;
    if (!layout || !at || !CHAPTERS.has(at.volume)) return lines;
    // figureFaces drops by family; each line's family is read here as "drawn" or its own, by its whole face.
    // A note marker or a CO2's "2" that the layout sets as a line of its own, beside the body line it belongs to
    // ("10" at the end of "...expressed in CO2e", Chapter 8 p.199), is the body's, not a chart's: taken for a
    // chart's label it set off the re-laying of the page's lines in the layout's order, which in the January 2007
    // reissues splits a line's first letters from the rest ("It" / "is the total warming effect", p.199).
    const beside = (l: LayoutLine, prose: LayoutLine[]) =>
      /^\s*\d{1,3}\s*$/.test(l.text) && prose.some((p) => Math.abs(p.top - l.top) <= 1.2 * p.height && l.left >= p.left - 2 && l.left <= p.right + 20);
    const page = (volume: number, pdfIndex: number) => {
      const p = layout.page(volume, pdfIndex);
      if (!p) return p;
      const prose = p.lines.filter(isProse);
      return { ...p, lines: p.lines.map((l) => (isProse(l) || beside(l, prose) ? l : { ...l, family: DRAWN })) };
    };
    return drawnFigures.run!(lines, { ...context, layout: { ...layout, page } as typeof layout }, at);
  },
};

/**
 * The Review sets the "2" of every "CO2", "CO2e" and "GtCO2e" (and the "4" of "CH4", the "2" of "N2O") as a small
 * raised digit, the same way it sets its note markers, so `layoutMarkers` took them for notes wherever a note of
 * that number sat on the page: "750ppm CO[^2]e" (Executive Summary p.v, the reason that volume sets its markers by
 * hand in `noteMarkers`), "measured in CO[^2] equivalent" (Chapter 9). A raised digit that completes a chemical
 * formula (the word before it is "CO", "GtCO", "CH", "N", "SF" with no space) is a subscript, not a marker: it is
 * taken out of the page's raised runs before the markers are read, and stays in the text as printed. The runs are
 * read from the layout `layoutMarkers` reads, so this runs as a body pass, page by page, before it.
 */
const FORMULA = /(?:^|[\s(\/–-])(?:[GMk]?t)?(?:CO|CH|N|SF|H)$/;
const chemicalSubscripts: BodyPass = {
  name: "chemicalSubscripts",
  stage: "body",
  run(lines, context, at) {
    const layout = context?.layout;
    if (!layout || !at) return lines;
    for (const line of layout.lines(at.volume, at.pdfIndex)) {
      const kept = line.raised.filter((run) => !(/^[1-6]$/.test(run.text) && FORMULA.test(line.text.slice(0, run.offset))));
      if (kept.length !== line.raised.length) (line as { raised: typeof line.raised }).raised = kept;
    }
    return lines;
  },
};

/**
 * The chapters' headings are read by face (`typographicHeadings` below), but two chapters break the pattern: Chapter
 * 10 sets three of its sections ("10.1 Introduction", p.239) and Chapter 9 its last ("9.10 Conclusion", p.234) in
 * the chapter title's 16px face, so they stood as chapters of their own; and Chapter 9's Box 9.6 titles its chart
 * ("Illustrative cost per unit of GHG abated for a specific technology", p.233) in the sections' navy, so it stood
 * as a section. In the chapters a navy line is a chapter title when it opens on the chapter's number alone ("10
 * Macroeconomic Models of Costs"), a section when it opens on a section number ("10.1") or is "References", and
 * otherwise not a heading. Each line's face is set so in the layout the heading reader reads; the text is untouched.
 */
const CHAPTER_FACE = "Arial,Bold|16|#000065|b";
const SECTION_FACE = "Arial,Bold|15|#000065|b";
const NAVY = new Set(["Arial,Bold|16|#000065|b", "Arial|16|#000065|b", "Arial,Bold|15|#000065|b", "Arial|15|#000065|b"]);
const chapterHeadingFaces: BodyPass = {
  name: "chapterHeadingFaces",
  stage: "body",
  run(lines, context, at) {
    const layout = context?.layout;
    if (!layout || !at || !CHAPTERS.has(at.volume)) return lines;
    const page = layout.lines(at.volume, at.pdfIndex);
    const faceOf = (text: string) =>
      /^\d{1,2}\s+\S/.test(text) ? CHAPTER_FACE : /^\d{1,2}\.\d{1,2}\s+\S/.test(text) || text === "References" ? SECTION_FACE : undefined;
    // A section heading's second line (`wrappedHeadings`) is set on its first in the layout too, so the heading
    // reader takes the whole heading.
    if (REGION_VOLUMES.has(at.volume))
      for (const head of page.filter((l) => NAVY.has(l.font) && /^\d{1,2}\.\d{1,2}\s+\S/.test(l.text.trim()))) {
        const next = page.find((l) => l.font === head.font && l.top > head.top && l.top - head.top <= 1.5 * head.height && l.left > head.left);
        if (!next || next.text.trim().length >= 50) continue;
        Object.assign(head, { text: `${head.text.trimEnd()} ${next.text.trim()}` });
        page.splice(page.indexOf(next), 1);
      }
    const navy = page.filter((line) => NAVY.has(line.font) && !/^STERN REVIEW:|^\d+$/.test(line.text.trim()));
    const numbered = navy.filter((line) => faceOf(line.text.trim()));
    for (const line of navy) {
      // A heading's last words can be a layout line of their own beside it ("9.7 Low-carbon" + "technologies", p.221).
      const beside = numbered.find((h) => h !== line && h.top === line.top);
      const font = faceOf(line.text.trim()) ?? (beside ? faceOf(beside.text.trim())! : "Arial,Bold|15|#000065|b|figure");
      if (font !== line.font) (line as { font: string }).font = font;
    }
    return lines;
  },
};

/**
 * The Preface (pp.i-iii, second numbering) sets its two parts, "Overall approach to the Review" and
 * "Acknowledgements", in the face of its own title, so all three read as top-level headings; the Preface's short
 * opening then folded, as a sliver, into the end of the Executive Summary's section. Its two parts are read one
 * level down (the chapter titles' face in the layout the heading reader reads), so the Preface is one section
 * with two subsections. The text is untouched.
 */
const PREFACE = vol("stern-review-preface-and-acknowledgements.pdf");
const prefaceParts: BodyPass = {
  name: "prefaceParts",
  stage: "body",
  run(lines, context, at) {
    const layout = context?.layout;
    if (!layout || !at || at.volume !== PREFACE) return lines;
    for (const line of layout.lines(at.volume, at.pdfIndex)) {
      if (line.font === "Arial,Bold|18|#000065|b" && /^(Overall approach to the Review|Acknowledgements)$/.test(line.text.trim()))
        (line as { font: string }).font = CHAPTER_FACE;
    }
    return lines;
  },
};

/**
 * How this report is built. Owned by the report: every decision that shaped its text is named here.
 *
 * The source is HM Treasury's web edition of the Review, 30 October 2006: one born-digital, untagged (or, for the
 * January 2007 reissues, tagged) Word-to-Distiller PDF per part, A4, single column, Arial body. The Executive
 * Summary (27 pp, i-xxvii, body layout key 16) was the first unit; the front matter, the Part I-III introductions
 * and Chapters 2, 6, 9, 10 and 13 (body layout key 15) the second. The passes above that name a volume or a page
 * apply there only; the rest apply to every volume, and the Executive Summary's text is unchanged by the later
 * volumes but for one line-end hyphen ("long-run", p.xxvii). See README.md for the source, versions and scope.
 */
export default pipeline({
  id: "uk-stern-review",
  title: "Stern Review: The Economics of Climate Change",
  authors: "Nicholas Stern (HM Treasury)",
  published_at: "30 October 2006",
  source_url: "https://webarchive.nationalarchives.gov.uk/ukgwa/20100407172811/http://www.hm-treasury.gov.uk/stern_review_report.htm",
  repo: ".",
  volumes: VOLUMES,
  passes: [
    figureLabels,
    figureTitleBreak,
    noteMarkers,
    runOnLines,
    runningTitle,
    ordinalNote,
    partTitles,
    marginBullets,
    carriedItems,
    noteTail,
    bodyFaceFigures,
    figureRegions,
    wrappedHeadings,
    layoutPieces,
    chartsAndTables,
    chemicalSubscripts,
    chapterHeadingFaces,
    prefaceParts,
    // Each chapter numbers its footnotes from 1 (Chapter 2's run 1-13 from p.23, Chapter 6's 1-45 from p.143), after
    // the Executive Summary's 1-5. A chapter's first page offers only its note 1 or 1-2 to read, and without this
    // their notes were read into the body until a page with three: Chapter 6 lost notes 1-7, Chapter 10 1-6.
    footnoteRestarts(),
    // A page whose only note sits below a gap, with no later note to corroborate it (Chapter 7 p.187, note 51, under
    // a key finding run over from p.186), had the note read into the body.
    footnoteGap(),
    // A paragraph or list item run over a page break joins when the layout says it runs on (no first-line indent,
    // same face): "...shows further that" / "institutions; the international economy..." (Chapter 2, pp.27-28);
    // the 'Tol' model's list item, "...increases in global mean temperature" over pp.147-148 (Chapter 6).
    layoutPageJoins(),
    // The chapters' note markers are small raised digits run into the word before ("are insufficient.1 The",
    // p.144): linked from the layout, to a note on the same page, in sequence.
    layoutMarkers(),
    lateMarkers,
    // Every page is headed "STERN REVIEW: The Economics of Climate Change" (bold navy, PDF p.1 onwards).
    runningFurniture(),
    keyFindings,
    // Every page is folioed in lower-case roman, i (PDF p.1) to xxvii (PDF p.27).
    romanFolios(),
    // The bulleted lists on PDF pp.6, 8 and 21-22 are set further in (the bullet at 7 columns, the text hanging at
    // 12) than those on pp.1-2, 7 and 12 (3 and 7), and the sustained-indent rule read them as quotations. The
    // report has no inset quotations, so the threshold is raised past the deeper lists.
    quoteInset(14),
    // Headings are set only by face. Level 2: the Executive Summary's one heading, the Preface's, the Summary of
    // Conclusions' and the Introduction's titles, and each Part's title on its introduction page ("Part I / Climate
    // Change – our approach", centred over two lines, p.1), all in 13pt bold navy (layout 18), in two navies and,
    // for Part III (p.168), a regular Arial set bold. Level 3: the chapter titles ("6 Economic modelling of
    // climate-change impacts", p.143, layout 16 navy). Level 4: the numbered sections and each chapter's References
    // ("6.1 Introduction", p.144, layout 15 navy). The page heads in the level-2 face ("STERN REVIEW: The Economics
    // of Climate Change", "PART II: The Impacts of Climate Change...") are furniture by now. The key findings, set
    // in bold italic at the body's size ("The scientific evidence points to increasing risks...", p.iii), and the
    // chapters' bold lead sentences and "Key Messages" (in black) are paragraphs, not headings.
    typographicHeadings({
      faces: [
        ["Arial,Bold|18|#000065|b", "Arial,Bold|18|#000080|b", "Arial|18|#000080|b"],
        ["Arial,Bold|16|#000065|b", "Arial|16|#000065|b"],
        ["Arial,Bold|15|#000065|b", "Arial|15|#000065|b"],
      ],
      firstLevel: 2,
    }),
  ],
});
