import { P, M, ZONES, TINTS, orders, trips, journal } from "./data.js";
export const initialState = () =>
  structuredClone({ products: P, materials: M, orders, trips, journal });
export const number = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })
    .format(n)
    .replaceAll(",", " ");
export const money = (n) => number(n / 1e6) + " mln";
export function quote(p, qty, tint, zone) {
  const unit = p.price * (1 + (p.tint ? TINTS[tint].k : 0));
  const base = unit * qty,
    discount = base >= 80e6 ? 0.05 : base >= 30e6 ? 0.03 : 0;
  const count = Math.max(
    1,
    Math.ceil(
      p.perTrip
        ? qty / p.perTrip
        : ((p.r.cement + p.r.sand + p.r.gravel) * qty) / 20000,
    ),
  );
  const fee = count * ZONES[zone].fee;
  return { base, discount, count, fee, total: base * (1 - discount) + fee };
}
export const unitCost = (p, materials) =>
  materials.reduce(
    (s, m) => s + (p.r[m.id] / m.per) * m.price,
    p.labor + p.energy + p.other,
  );
export function recordBatch(state, pid, qty, waste, shift) {
  if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(waste) || waste < 0)
    throw Error("Miqdorlarni to‘g‘ri kiriting.");
  const p = state.products.find((p) => p.id === pid);
  if (p.unit === "dona" && (!Number.isInteger(qty) || !Number.isInteger(waste)))
    throw Error("Dona uchun butun son kiriting.");
  const usage = state.materials.map((m) => ({
    ...m,
    used: ((qty + waste) * p.r[m.id]) / m.per,
  }));
  const missing = usage.find((m) => m.used > m.stock);
  if (missing)
    throw Error(missing.name + " yetarli emas. Avval omborga kirim qiling.");
  return {
    ...state,
    products: state.products.map((x) =>
      x.id === pid ? { ...x, made: x.made + qty, brak: x.brak + waste } : x,
    ),
    materials: usage.map(({ used, ...m }) => ({ ...m, stock: m.stock - used })),
    journal: [
      ...usage
        .filter((m) => m.used > 0)
        .map((m) => ({
          t: new Date().toLocaleTimeString("uz-UZ", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          m: m.id,
          k: "out",
          q: m.used,
          note: shift + " · " + p.short,
        })),
      ...state.journal,
    ],
  };
}
export function advanceTrip(state, id) {
  const target = state.trips.find((t) => t.id === id);
  if (!target || target.st === 3) return state;
  const trips = state.trips.map((t) =>
    t.id === id ? { ...t, st: t.st + 1 } : t,
  );
  return {
    ...state,
    trips,
    orders: state.orders.map((o) =>
      o.id === target.order
        ? {
            ...o,
            st: trips.filter((t) => t.order === o.id).every((t) => t.st === 3)
              ? 4
              : target.st + 1 === 2
                ? Math.max(3, o.st)
                : o.st,
          }
        : o,
    ),
  };
}

export const dueLabel = (n) =>
  n === 0
    ? "Bugun"
    : n === 1
      ? "Ertaga"
      : n < 0
        ? `${-n} kun kechikkan`
        : `${n} kundan so‘ng`;
export function todayLabel() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: "Asia/Tashkent",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];
  return `${parts.day}-${months[Number(parts.month) - 1]}, ${parts.year}`;
}
