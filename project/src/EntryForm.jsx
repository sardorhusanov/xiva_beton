import { useState } from "react";
import { Check } from "lucide-react";
import { Field } from "./components";
import { ZONES, TINTS } from "./data";
import { quote, number, recordBatch, dueLabel } from "./model";
export default function EntryForm({ type, state, preset, save, close }) {
  const [pid, setPid] = useState(preset.pid || state.products[0].id),
    [mid, setMid] = useState(preset.mid || state.materials[0].id),
    [qty, setQty] = useState(""),
    [waste, setWaste] = useState("0"),
    [tint, setTint] = useState("gray"),
    [zone, setZone] = useState("xiva"),
    [error, setError] = useState("");
  const p = state.products.find((p) => p.id === pid),
    m = state.materials.find((m) => m.id === mid),
    q = quote(p, Number(qty) || 0, tint, zone);
  function submit(e) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget),
      n = Number(qty);
    try {
      if (!Number.isFinite(n) || n <= 0)
        throw Error("Miqdor 0 dan katta bo‘lishi kerak.");
      if (type === "order") {
        if (!f.get("customer").trim()) throw Error("Mijoz nomini kiriting.");
        if (p.unit === "dona" && !Number.isInteger(n))
          throw Error("Dona uchun butun son kiriting.");
        const order = {
          id: Math.max(0, ...state.orders.map((o) => o.id)) + 1,
          cust: f.get("customer").trim(),
          pid,
          qty: n,
          tint: p.tint ? tint : "gray",
          zone,
          due: Number(f.get("due")),
          st: 0,
          pay: f.get("pay"),
        };
        save(
          { ...state, orders: [order, ...state.orders] },
          "Buyurtma #" + order.id + " yaratildi",
        );
      } else if (type === "batch") {
        save(
          recordBatch(state, pid, n, Number(waste), f.get("shift")),
          "Partiya saqlandi. Ombor qoldig‘i yangilandi.",
        );
      } else {
        save(
          {
            ...state,
            materials: state.materials.map((x) =>
              x.id === mid ? { ...x, stock: x.stock + n } : x,
            ),
            journal: [
              {
                t: new Date().toLocaleTimeString("uz-UZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                m: mid,
                k: "in",
                q: n,
                note: f.get("supplier").trim() || m.sup,
              },
              ...state.journal,
            ],
          },
          "Omborga kirim saqlandi",
        );
      }
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <form className="entry-form" onSubmit={submit}>
      {type === "order" && (
        <Field label="Mijoz nomi">
          <input
            name="customer"
            required
            placeholder="Korxona yoki mijoz nomi"
            autoFocus
          />
        </Field>
      )}
      {type === "stock" ? (
        <Field label="Xomashyo">
          <select value={mid} onChange={(e) => setMid(e.target.value)}>
            {state.materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <Field label="Mahsulot">
          <select
            value={pid}
            onChange={(e) => {
              setPid(e.target.value);
              setTint("gray");
            }}
          >
            {state.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <div className="form-grid">
        <Field label={`Miqdor (${type === "stock" ? m.unit : p.unit})`}>
          <input
            type="number"
            min="0.01"
            step={type !== "stock" && p.unit === "dona" ? "1" : "0.01"}
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
          />
        </Field>
        {type === "batch" ? (
          <Field label={`Brak (${p.unit})`}>
            <input
              type="number"
              min="0"
              step={p.unit === "dona" ? "1" : "0.01"}
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              required
            />
          </Field>
        ) : (
          type === "order" && (
            <Field label="Rang">
              <select
                disabled={!p.tint}
                value={tint}
                onChange={(e) => setTint(e.target.value)}
              >
                {Object.entries(TINTS).map(([k, v]) => (
                  <option value={k} key={k}>
                    {v.n}
                  </option>
                ))}
              </select>
            </Field>
          )
        )}
      </div>
      {type === "stock" && (
        <Field label="Yetkazib beruvchi">
          <input key={mid} name="supplier" defaultValue={m.sup} required />
        </Field>
      )}
      {type === "batch" && (
        <>
          <Field label="Smena">
            <select name="shift">
              <option>1-smena</option>
              <option>2-smena</option>
              <option>3-smena</option>
            </select>
          </Field>
          <div className="quote">
            <b>Xomashyo sarfi (brak bilan)</b>
            {state.materials
              .filter((m) => p.r[m.id] > 0)
              .map((m) => (
                <div key={m.id}>
                  <span>{m.name}</span>
                  <strong>
                    {number(
                      (((Number(qty) || 0) + (Number(waste) || 0)) *
                        p.r[m.id]) /
                        m.per,
                    )}{" "}
                    {m.unit}
                  </strong>
                </div>
              ))}
          </div>
        </>
      )}
      {type === "order" && (
        <>
          <Field label="Yetkazib berish hududi">
            <select value={zone} onChange={(e) => setZone(e.target.value)}>
              {Object.entries(ZONES).map(([k, v]) => (
                <option value={k} key={k}>
                  {v.n}
                </option>
              ))}
            </select>
          </Field>
          <div className="form-grid">
            <Field label="Muddat">
              <select name="due">
                {[0, 1, 2, 3, 5, 7, 14].map((n) => (
                  <option key={n} value={n}>
                    {dueLabel(n)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="To‘lov">
              <select name="pay">
                <option value="none">To‘lanmagan</option>
                <option value="adv">Avans (50%)</option>
                <option value="paid">To‘langan</option>
              </select>
            </Field>
          </div>
          <div className="quote">
            <div>
              <span>Mahsulotlar</span>
              <strong>{number(q.base)} so‘m</strong>
            </div>
            <div>
              <span>Chegirma ({q.discount * 100}%)</span>
              <strong>−{number(q.base * q.discount)} so‘m</strong>
            </div>
            <div>
              <span>Yetkazish ({q.count} reys)</span>
              <strong>{number(q.fee)} so‘m</strong>
            </div>
            <div className="quote-total">
              <span>Jami summa</span>
              <strong>{number(q.total)} so‘m</strong>
            </div>
          </div>
        </>
      )}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="button" onClick={close}>
          Bekor qilish
        </button>
        <button className="button primary" type="submit">
          <Check size={15} /> Saqlash
        </button>
      </div>
    </form>
  );
}
