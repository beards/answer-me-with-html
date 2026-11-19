// The reading width of the doc template, in px. Page CSS reads --am-doc-max; `.am-doc` falls back to the default when the page
// does not set it, so a page rendered without the `doc_width` setting is byte-identical to one from before the setting existed.
// The maximum is the sheet template's own width (`.am-sheet` in base.css), so a doc page can be as wide as a board.

export const DOC_WIDTH = Object.freeze({ min: 640, max: 1680, step: 4, default: 916 });

export function readDocWidth(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && n >= DOC_WIDTH.min && n <= DOC_WIDTH.max ? n : DOC_WIDTH.default;
}
