export const CATEGORIES = [
  { name: "Bedsheets", icon: "bed" },
  { name: "Towels", icon: "bath" },
  { name: "Pillow Covers", icon: "cube" },
  { name: "Duvet Covers", icon: "box" },
  { name: "Blankets", icon: "package" },
  { name: "Rugs", icon: "layout-grid" },
];

export const INITIAL_STOCK = {};
CATEGORIES.forEach((c) => { INITIAL_STOCK[c.name] = { total: 0, clean: 0, atLaundry: 0, lost: 0 }; });

export function computeTotals(stock) {
  let t = 0, r = 0, l = 0, lo = 0;
  Object.values(stock).forEach((s) => { t += s.total || 0; r += s.clean || 0; l += s.atLaundry || 0; lo += s.lost || 0; });
  return { total: t, ready: r, laundry: l, lost: lo };
}
