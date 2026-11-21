import test from "node:test";
import assert from "node:assert/strict";
import { initialState, quote, recordBatch, advanceTrip } from "./model.js";
test("pricing applies tint, volume discount and truck capacity", () => {
  const p = initialState().products[0];
  const q = quote(p, 1200, "red", "xiva");
  assert.equal(q.discount, 0.05);
  assert.equal(q.count, 5);
  assert.equal(q.fee, 750000);
  assert.equal(q.total, 78000 * 1.08 * 1200 * 0.95 + 750000);
});
test("concrete delivery uses mixer capacity and ignores tint", () => {
  const p = initialState().products.find((p) => p.id === "b300");
  assert.equal(quote(p, 48, "red", "xiva").count, 6);
  assert.equal(quote(p, 48, "red", "xiva").base, p.price * 48);
});
test("batch consumes materials including waste and preserves prior state", () => {
  const s = initialState();
  const n = recordBatch(s, "t30", 10, 2, "1-smena");
  assert.equal(n.products[0].made, 328);
  assert.equal(n.products[0].brak, 11);
  assert.equal(n.materials[0].stock, 310 - (12 * 14) / 1000);
  assert.equal(n.journal.length, s.journal.length + 4);
  assert.equal(s.materials[0].stock, 310);
});
test("insufficient stock and invalid quantities are rejected", () => {
  assert.throws(() => recordBatch(initialState(), "t30", 1e8, 0, "1"));
  assert.throws(() => recordBatch(initialState(), "t30", -1, 0, "1"));
  assert.throws(() => recordBatch(initialState(), "brd", 0.5, 0, "1"));
});
test("order is delivered only when all its trips finish", () => {
  let s = initialState();
  s = advanceTrip(s, 1);
  assert.equal(s.orders.find((o) => o.id === 1052).st, 3);
  s = advanceTrip(s, 2);
  s = advanceTrip(s, 2);
  assert.equal(s.orders.find((o) => o.id === 1052).st, 4);
});
