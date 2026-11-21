import { readTheme, saveTheme } from "./theme";
import { Badge, Panel, Empty, Modal } from "./components";
import EntryForm from "./EntryForm";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Factory,
  Package,
  ClipboardList,
  ChartNoAxesCombined,
  Truck,
  Sparkles,
  Plus,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Download,
  Menu,
  CircleHelp,
  Check,
  Wallet,
  TrendingUp,
  Clock,
  CircleAlert,
  Boxes,
  Send,
  Settings2,
  Moon,
  Sun,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ZONES,
  TINTS,
  ORD,
  ORD_ACT,
  PAYL,
  TRUCKS,
  TSTAT,
  TACT,
  EQUIP,
  PAY,
} from "./data";
import {
  initialState,
  number,
  money,
  quote,
  unitCost,
  todayLabel,
  dueLabel,
  advanceTrip,
} from "./model";
const views = {
  dashboard: [
    "Boshqaruv paneli",
    LayoutDashboard,
    "Zavodingizdagi barcha jarayonlar — bir joyda.",
  ],
  production: [
    "Ishlab chiqarish",
    Factory,
    "Kunlik reja, mahsulotlar va ishlab chiqarish nazorati.",
  ],
  warehouse: [
    "Ombor",
    Package,
    "Xomashyo zaxiralari va kirim-chiqim harakati.",
  ],
  orders: [
    "Buyurtmalar",
    ClipboardList,
    "Har bir buyurtma — qabul qilishdan yetkazishgacha.",
  ],
  finance: [
    "Moliya",
    ChartNoAxesCombined,
    "Moliyaviy natijalar va xarajatlar tahlili.",
  ],
  delivery: [
    "Yetkazib berish",
    Truck,
    "Transport, haydovchilar va reyslar nazorati.",
  ],
  assistant: [
    "AI yordamchi",
    Sparkles,
    "Zavod ma’lumotlari bo‘yicha tezkor javoblar.",
  ],
};
const KEY = "xiva-beton-react-v1";
export default function App() {
  const [theme, setTheme] = useState(readTheme);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
  };
  const [state, setState] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      return s &&
        ["products", "materials", "orders", "trips", "journal"].every((k) =>
          Array.isArray(s[k]),
        )
        ? s
        : initialState();
    } catch {
      return initialState();
    }
  });
  const [page, setPage] = useState(() =>
    views[location.hash.slice(1)] ? location.hash.slice(1) : "dashboard",
  );
  const [menu, setMenu] = useState(false),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [period, setPeriod] = useState("week"),
    [notifications, setNotifications] = useState(false);
  const [messages, setMessages] = useState([
      {
        role: "bot",
        text: "Assalomu alaykum! Buyurtmalar, ombor, ishlab chiqarish yoki moliya haqida so‘rang. Men demo ma’lumotlaridan tayyor javob beraman.",
      },
    ]),
    [question, setQuestion] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      setToast(
        "Brauzer xotirasi to‘ldi. O‘zgarishlar faqat shu sessiyada saqlanadi.",
      );
    }
  }, [state]);
  useEffect(() => {
    const fn = () => {
      setPage(
        views[location.hash.slice(1)] ? location.hash.slice(1) : "dashboard",
      );
      setSearch("");
      setFilter("all");
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const go = (p) => {
    location.hash = p;
    setMenu(false);
    setNotifications(false);
  };
  const { products, materials, orders, trips, journal } = state;
  const alerts = materials.filter((m) => m.stock < m.min * 1.25),
    late = orders.filter((o) => o.due < 0 && o.st < 4),
    open = orders.filter((o) => o.st < 4);
  const total = (o) =>
    quote(
      products.find((p) => p.id === o.pid),
      o.qty,
      o.tint,
      o.zone,
    ).total;
  const receivable = orders.reduce(
    (s, o) => s + total(o) * (o.pay === "paid" ? 0 : o.pay === "adv" ? 0.5 : 1),
    0,
  );
  const madeValue = products.reduce((s, p) => s + p.made * p.price, 0),
    planValue = products.reduce((s, p) => s + p.plan * p.price, 0),
    progress = Math.round((madeValue / planValue) * 100);
  const expense =
    products.reduce(
      (s, p) =>
        s +
        (p.made + p.brak) *
          materials.reduce((a, m) => a + (p.r[m.id] / m.per) * m.price, 0),
      0,
    ) + 26400000;
  const revenue = 168400000;
  const count = period === "day" ? 1 : period === "week" ? 7 : 30;
  const chart = Array.from(
    { length: period === "day" ? 6 : count },
    (_, i) => ({
      name: period === "day" ? `${8 + i}:00` : `${i + 1}`,
      Tushum:
        period === "day"
          ? [14, 27, 33, 44, 36, 14][i]
          : i === count - 1
            ? 168.4
            : 220 + ((i * 37 + 23) % 90),
      Xarajat:
        period === "day"
          ? ([12, 18, 19, 22, 21, 8][i] * expense) / 1e8
          : i === count - 1
            ? expense / 1e6
            : 185 + ((i * 29 + 17) % 65),
    }),
  );
  const revSum = chart.reduce((s, x) => s + x.Tushum * 1e6, 0),
    expSum = chart.reduce((s, x) => s + x.Xarajat * 1e6, 0);
  const save = (next, msg) => {
    setState(next);
    setModal(null);
    setToast(msg);
  };
  function advanceOrder(o) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((x) =>
        x.id === o.id ? { ...x, st: Math.min(4, x.st + 1) } : x,
      ),
      trips: s.trips.map((t) =>
        t.order === o.id && o.st === 3 ? { ...t, st: 3 } : t,
      ),
    }));
    setToast("Buyurtma holati yangilandi");
  }
  function exportReport() {
    const rows = [
      ["Ko‘rsatkich", "Qiymat"],
      ["Davr", period],
      ["Tushum", revSum],
      ["Xarajat", expSum],
      ["Foyda", revSum - expSum],
      ["Debitor qarzdorlik", receivable],
      [],
      ["Buyurtma", "Mijoz", "Mahsulot", "Miqdor", "Jami", "Holat"],
      ...orders.map((o) => [
        o.id,
        o.cust,
        products.find((p) => p.id === o.pid).short,
        o.qty,
        total(o),
        ORD[o.st],
      ]),
    ];
    const blob = new Blob(
      [
        "\uFEFF" +
          rows
            .map((r) =>
              r
                .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
                .join(","),
            )
            .join("\n"),
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "xiva-beton-hisobot.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("Hisobot yuklab olindi");
  }
  function ask(q) {
    if (!q.trim()) return;
    let answer;
    if (/ombor|xomashyo|sement|zaxira/i.test(q))
      answer = materials
        .map(
          (m) =>
            `${m.name}: ${number(m.stock)} ${m.unit}${m.stock < m.min ? " — minimal zaxiradan past" : ""}`,
        )
        .join("\n");
    else if (/buyurtma|mijoz/i.test(q))
      answer = `${open.length} ta faol buyurtma mavjud. ${late.length} tasi muddatidan kechikkan. Debitor qarzdorlik: ${money(receivable)} so‘m.`;
    else if (/ishlab|reja|mahsulot/i.test(q))
      answer =
        `Bugungi reja ${progress}% bajarilgan (mahsulot qiymati bo‘yicha).\n` +
        products
          .map((p) => `${p.short}: ${p.made} / ${p.plan} ${p.unit}`)
          .join("\n");
    else if (/foyda|moliya|tushum|xarajat/i.test(q))
      answer = `Demo hisob-kitobi: bugungi tushum ${money(revenue)} so‘m, xarajat ${money(expense)} so‘m, foyda ${money(revenue - expense)} so‘m.`;
    else if (/mashina|reys|yetkaz/i.test(q))
      answer = `${trips.filter((t) => t.st === 2).length} ta reys yo‘lda. ${trips.filter((t) => t.st === 1).length} ta mashina yuklanmoqda. ${trips.filter((t) => t.st === 3).length} ta reys yetkazilgan.`;
    else
      answer =
        "Bu mahalliy demo yordamchi. Ombor, buyurtmalar, ishlab chiqarish, yetkazib berish yoki bugungi foyda haqida so‘rashingiz mumkin.";
    setMessages((m) => [
      ...m,
      { role: "user", text: q },
      { role: "bot", text: answer },
    ]);
    setQuestion("");
  }
  const orderRows = (list, compact = false) => (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>BUYURTMA / MIJOZ</th>
            <th>MAHSULOT</th>
            <th>SUMMA</th>
            <th>MUDDAT</th>
            <th>HOLAT</th>
            {!compact && (
              <>
                <th>TO‘LOV</th>
                <th>AMAL</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {list.map((o) => (
            <tr key={o.id}>
              <td>
                <button
                  className="order-link"
                  onClick={() => setModal({ type: "detail", order: o.id })}
                >
                  #{o.id} <span>{o.cust}</span>
                </button>
              </td>
              <td>
                {products.find((p) => p.id === o.pid).short}
                <small>
                  {number(o.qty)} {products.find((p) => p.id === o.pid).unit}
                </small>
              </td>
              <td className="strong">
                {money(total(o))}
                <small>so‘m</small>
              </td>
              <td>
                <span className={o.due < 0 && o.st < 4 ? "text-red" : ""}>
                  {dueLabel(o.due)}
                </span>
              </td>
              <td>
                <Badge
                  tone={["neutral", "blue", "amber", "purple", "green"][o.st]}
                >
                  {ORD[o.st]}
                </Badge>
              </td>
              {!compact && (
                <>
                  <td>
                    <button
                      className="payment"
                      title="To‘lov holatini o‘zgartirish"
                      onClick={() => {
                        setState((s) => ({
                          ...s,
                          orders: s.orders.map((x) =>
                            x.id === o.id
                              ? {
                                  ...x,
                                  pay: {
                                    none: "adv",
                                    adv: "paid",
                                    paid: "none",
                                  }[x.pay],
                                }
                              : x,
                          ),
                        }));
                        setToast("To‘lov holati yangilandi");
                      }}
                    >
                      <Badge
                        tone={
                          o.pay === "paid"
                            ? "green"
                            : o.pay === "adv"
                              ? "amber"
                              : "neutral"
                        }
                      >
                        {PAYL[o.pay]}
                      </Badge>
                    </button>
                  </td>
                  <td>
                    {o.st < 4 ? (
                      <button
                        className="small-button"
                        onClick={() => advanceOrder(o)}
                      >
                        {ORD_ACT[o.st]}
                      </button>
                    ) : (
                      <Check size={16} className="text-green" />
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && <Empty />}
    </div>
  );
  const stats = (items) => (
    <div className="stats">
      {items.map(([label, value, unit, detail, Icon], i) => (
        <div className="stat" key={label}>
          <div className="stat-top">
            <span>{label}</span>
            <span className={"stat-icon s" + i}>
              <Icon size={16} />
            </span>
          </div>
          <div className="stat-value">
            {value}
            <span>{unit}</span>
          </div>
          <div className="stat-foot">{detail}</div>
        </div>
      ))}
    </div>
  );
  const chartPanel = (
    <Panel
      title="Tushum va xarajat"
      sub={
        period === "day"
          ? "Bugun, soatlar bo‘yicha"
          : "Namunaviy tarix · mln so‘m"
      }
      action={
        <div className="segmented">
          {[
            ["day", "Bugun"],
            ["week", "7 kun"],
            ["month", "30 kun"],
          ].map(([k, l]) => (
            <button
              className={period === k ? "active" : ""}
              key={k}
              onClick={() => setPeriod(k)}
            >
              {l}
            </button>
          ))}
        </div>
      }
    >
      <div className="chart-summary">
        <div>
          <span className="legend green" /> Tushum <b>{money(revSum)}</b>
        </div>
        <div>
          <span className="legend pale" /> Xarajat <b>{money(expSum)}</b>
        </div>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chart}
            margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--chart-grid)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--chart-label)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--chart-label)", fontSize: 12 }}
            />
            <Tooltip
              formatter={(v) => [number(v) + " mln so‘m"]}
              contentStyle={{ borderRadius: 12, borderColor: "var(--line)", background: "var(--tooltip-bg)", color: "var(--tooltip-text)" }}
            />
            <Area
              type="monotone"
              dataKey="Xarajat"
              stroke="#9cacc5"
              strokeDasharray="5 5"
              fill="transparent"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Tushum"
              stroke={theme === "dark" ? "#60a5fa" : "#2563eb"}
              fill="url(#fill)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
  const stockList = (
    <div className="stock-list">
      {materials.map((m) => (
        <div key={m.id} className="stock-row">
          <div className={"material-icon " + m.id}>
            <Boxes size={16} />
          </div>
          <div className="stock-body">
            <div>
              <b>{m.name}</b>
              <span>
                {number(m.stock)} <small>{m.unit}</small>
              </span>
            </div>
            <div className="progress">
              <i
                style={{
                  width: Math.min(100, (m.stock / (m.min * 2)) * 100) + "%",
                  background: m.stock < m.min ? "#e29c4b" : undefined,
                }}
              />
            </div>
            <div className="stock-meta">
              <span>
                Min. {m.min} {m.unit}
              </span>
              <span className={m.stock < m.min ? "text-orange" : ""}>
                {m.stock < m.min
                  ? "Zaxira kam"
                  : `${number(m.stock / m.avg)} kunga yetadi`}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="app">
      <button
        className={"backdrop " + (menu ? "show" : "")}
        onClick={() => setMenu(false)}
        aria-label="Menyuni yopish"
      />
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <a className="brand" href="#dashboard">
          <span className="brand-mark">
            <Boxes size={22} />
          </span>
          <span>
            XIVA BETON<small>BOSHQARUV PLATFORMASI</small>
          </span>
        </a>
        <div className="workspace">
          <div className="workspace-icon">
            <Factory size={16} />
          </div>
          <div>
            <b>Xiva zavodi</b>
            <small>Xorazm, O‘zbekiston</small>
          </div>
          <ChevronDown size={13} />
        </div>
        <div className="nav-label">ASOSIY MENYU</div>
        <nav>
          {Object.entries(views).map(([key, [label, Icon]]) => (
            <button
              key={key}
              onClick={() => go(key)}
              className={page === key ? "nav-item active" : "nav-item"}
              aria-current={page === key ? "page" : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
              {key === "orders" && <em>{open.length}</em>}
              {key === "warehouse" && alerts.length > 0 && (
                <em className="nav-alert">{alerts.length}</em>
              )}
              {key === "assistant" && <span className="ai-label">DEMO</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <span className="demo-dot" /> Demo rejimi
            <p>O‘zgarishlar shu brauzerda saqlanadi.</p>
          </div>
          <button
            className="support"
            onClick={() => setModal({ type: "help" })}
          >
            <CircleHelp size={16} /> Yordam va ma’lumot
          </button>
          <div className="profile">
            <div className="avatar">AR</div>
            <div>
              <b>Administrator</b>
              <small>Zavod boshqaruvchisi</small>
            </div>
            <Settings2 size={15} />
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Menyuni ochish"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <span>Xiva zavodi</span>
            <ChevronRight size={12} />
            <b>{views[page][0]}</b>
          </div>
          <div className="top-actions">
            <button className="icon-button theme-toggle" onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}
              title={theme === 'dark' ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className="local-indicator">
              <span /> Mahalliy demo
            </span>
            <button
              className="icon-button notification-button"
              aria-label="Bildirishnomalar"
              aria-expanded={notifications}
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={16} />
              {alerts.length + late.length > 0 && <i />}
            </button>
            <div className="avatar small">AR</div>
          </div>
          {notifications && (
            <div className="notifications">
              <h3>Bildirishnomalar</h3>
              {alerts.map((m) => (
                <button key={m.id} onClick={() => go("warehouse")}>
                  <CircleAlert size={16} />
                  <span>
                    {m.name} zaxirasini to‘ldiring
                    <small>
                      {number(m.stock)} {m.unit} qoldi
                    </small>
                  </span>
                </button>
              ))}
              {late.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    go("orders");
                    setModal({ type: "detail", order: o.id });
                  }}
                >
                  <Clock size={16} />
                  <span>
                    #{o.id} buyurtma kechikmoqda<small>{o.cust}</small>
                  </span>
                </button>
              ))}
              {!alerts.length && !late.length && (
                <p>Yangi bildirishnoma yo‘q.</p>
              )}
            </div>
          )}
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "dashboard"
                  ? "XUSH KELIBSIZ, ADMINISTRATOR"
                  : "XIVA BETON · BOSHQARUV"}
              </div>
              <h1>{views[page][0]}</h1>
              <p>{views[page][2]}</p>
            </div>
            <div className="heading-actions">
              <button className="button" onClick={exportReport}>
                <Download size={15} /> Hisobot
              </button>
              <button
                className="button primary"
                onClick={() =>
                  setModal({
                    type:
                      page === "production"
                        ? "batch"
                        : page === "warehouse"
                          ? "stock"
                          : "order",
                  })
                }
              >
                <Plus size={16} />
                {page === "production"
                  ? "Partiya qo‘shish"
                  : page === "warehouse"
                    ? "Kirim qo‘shish"
                    : "Yangi buyurtma"}
              </button>
            </div>
          </div>
          {page === "dashboard" && (
            <>
              <div className="overview-line">
                <span>
                  <span className="live-dot" /> Bugungi umumiy holat
                </span>
                <span>{todayLabel()}</span>
              </div>
              {stats([
                [
                  "Bugungi tushum",
                  money(revenue),
                  "so‘m",
                  <>
                    <TrendingUp size={12} /> Demo kunlik tushum
                  </>,
                  Wallet,
                ],
                [
                  "Sof foyda",
                  money(revenue - expense),
                  "so‘m",
                  `${number(((revenue - expense) / revenue) * 100)}% foyda marjasi`,
                  ChartNoAxesCombined,
                ],
                [
                  "Faol buyurtmalar",
                  open.length,
                  "ta",
                  `${orders.filter((o) => o.st === 0).length} ta yangi buyurtma`,
                  ClipboardList,
                ],
                [
                  "Ishlab chiqarish",
                  progress,
                  "%",
                  `Bugungi rejaning bajarilishi`,
                  Factory,
                ],
              ])}
              <div className="dashboard-grid">
                {chartPanel}
                <Panel
                  title="Bugungi ishlab chiqarish"
                  sub="Reja bajarilishi · qiymat bo‘yicha"
                  action={<Factory size={16} className="muted" />}
                >
                  <div
                    className="production-ring"
                    style={{ "--progress": Math.min(progress, 100) + "%" }}
                  >
                    <div>
                      <strong>
                        {progress}
                        <span>%</span>
                      </strong>
                      <small>reja bajarildi</small>
                    </div>
                  </div>
                  <div className="production-totals">
                    {[
                      ["m²", "Plitalar"],
                      ["m³", "Beton"],
                      ["dona", "Blok va bordyur"],
                    ].map(([unit, label]) => (
                      <div key={unit}>
                        <b>
                          {number(
                            products
                              .filter((p) => p.unit === unit)
                              .reduce((s, p) => s + p.made, 0),
                          )}
                          <small>{unit}</small>
                        </b>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="panel-link"
                    onClick={() => go("production")}
                  >
                    Ishlab chiqarishni ko‘rish <ChevronRight size={14} />
                  </button>
                </Panel>
                <Panel
                  title="So‘nggi buyurtmalar"
                  sub={`${open.length} ta buyurtma jarayonda`}
                  action={
                    <button
                      className="text-button"
                      onClick={() => go("orders")}
                    >
                      Barchasini ko‘rish
                    </button>
                  }
                >
                  {orderRows(orders.slice(0, 5), true)}
                </Panel>
                <Panel
                  title="Xomashyo zaxirasi"
                  action={
                    <button
                      className="text-button"
                      onClick={() => go("warehouse")}
                    >
                      Ombor
                    </button>
                  }
                >
                  {stockList}
                </Panel>
              </div>
              {(alerts.length > 0 || late.length > 0) && (
                <div className="attention">
                  <div className="attention-icon">
                    <CircleAlert size={17} />
                  </div>
                  <div>
                    <b>E’tiboringiz kerak</b>
                    <p>
                      {alerts.length} turdagi xomashyo zaxirasi kamaygan.{" "}
                      {late.length} ta buyurtma yetkazib berishni kutmoqda.
                    </p>
                  </div>
                  <button
                    onClick={() => go(alerts.length ? "warehouse" : "delivery")}
                  >
                    Batafsil <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
          {page === "orders" && (
            <>
              {stats([
                [
                  "Jami buyurtmalar",
                  orders.length,
                  "ta",
                  "Barcha mijozlar",
                  ClipboardList,
                ],
                ["Jarayonda", open.length, "ta", "Faol buyurtmalar", Clock],
                [
                  "Yetkazilgan",
                  orders.filter((o) => o.st === 4).length,
                  "ta",
                  "Yakunlangan buyurtmalar",
                  Check,
                ],
                [
                  "Debitor qarzdorlik",
                  money(receivable),
                  "so‘m",
                  "Avans 50% hisobida",
                  Wallet,
                ],
              ])}
              <Panel
                title="Buyurtmalar ro‘yxati"
                action={
                  <label className="search">
                    <Search size={15} />
                    <input
                      aria-label="Buyurtma qidirish"
                      placeholder="Mijoz yoki buyurtma raqami..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                }
              >
                <div className="tabs">
                  {[
                    ["all", "Barchasi"],
                    ...ORD.map((x, i) => [String(i), x]),
                  ].map(([id, label]) => (
                    <button
                      className={filter === id ? "selected" : ""}
                      key={id}
                      onClick={() => setFilter(id)}
                    >
                      {label}
                      <span>
                        {
                          orders.filter((o) => id === "all" || o.st === +id)
                            .length
                        }
                      </span>
                    </button>
                  ))}
                </div>
                {orderRows(
                  orders.filter(
                    (o) =>
                      (filter === "all" || o.st === +filter) &&
                      `${o.id} ${o.cust}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                  ),
                )}
              </Panel>
            </>
          )}
          {page === "production" && (
            <>
              <div className="product-grid">
                {products.map((p) => (
                  <div className="panel product-card" key={p.id}>
                    <div className="product-card-top">
                      <div className="product-symbol">
                        <Boxes size={20} />
                      </div>
                      <Badge tone={p.made >= p.plan ? "green" : "blue"}>
                        {p.made >= p.plan ? "Bajarildi" : "Jarayonda"}
                      </Badge>
                    </div>
                    <h3>{p.short}</h3>
                    <p>{p.name}</p>
                    <div className="product-numbers">
                      <strong>
                        {number(p.made)} <small>{p.unit}</small>
                      </strong>
                      <span>Reja: {p.plan}</span>
                    </div>
                    <div className="progress">
                      <i
                        style={{
                          width: Math.min(100, (p.made / p.plan) * 100) + "%",
                        }}
                      />
                    </div>
                    <div className="stock-meta">
                      <span>
                        {Math.round((p.made / p.plan) * 100)}% bajarildi
                      </span>
                      <span>
                        Brak: {p.brak} {p.unit}
                      </span>
                    </div>
                    <button
                      className="button"
                      onClick={() => setModal({ type: "batch", pid: p.id })}
                    >
                      <Plus size={14} /> Partiya qayd etish
                    </button>
                  </div>
                ))}
              </div>
              <Panel title="Uskunalar holati" sub="Namunaviy holatlar">
                <div className="equipment-grid">
                  {EQUIP.map((e) => (
                    <div className="equipment" key={e.n}>
                      <Factory size={17} />
                      <div>
                        <b>{e.n}</b>
                        <small>{e.d}</small>
                      </div>
                      <Badge tone={e.c === "good" ? "green" : "amber"}>
                        {e.s}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}
          {page === "warehouse" && (
            <>
              <div className="inventory-grid">
                {materials.map((m) => (
                  <div className="stat" key={m.id}>
                    <div className="stat-top">
                      <span>{m.name}</span>
                      <Package size={16} />
                    </div>
                    <div className="stat-value">
                      {number(m.stock)} <span>{m.unit}</span>
                    </div>
                    <Badge tone={m.stock < m.min ? "amber" : "green"}>
                      {m.stock < m.min ? "Zaxira kam" : "Yetarli"}
                    </Badge>
                    <p className="muted">
                      Minimum: {m.min} {m.unit} · {number(m.stock / m.avg)}{" "}
                      kunlik
                    </p>
                    <button
                      className="text-button"
                      onClick={() => setModal({ type: "stock", mid: m.id })}
                    >
                      Kirim qo‘shish
                    </button>
                  </div>
                ))}
              </div>
              <Panel
                title="Kirim-chiqim jurnali"
                sub="Xomashyo harakati tarixi"
                action={
                  <select
                    aria-label="Harakat turi"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">Barcha harakatlar</option>
                    <option value="in">Kirim</option>
                    <option value="out">Chiqim</option>
                  </select>
                }
              >
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>VAQT</th>
                        <th>XOMASHYO</th>
                        <th>TURI</th>
                        <th>MIQDOR</th>
                        <th>IZOH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journal
                        .filter((j) => filter === "all" || j.k === filter)
                        .map((j, i) => (
                          <tr key={i}>
                            <td>{j.t}</td>
                            <td className="strong">
                              {materials.find((m) => m.id === j.m).name}
                            </td>
                            <td>
                              <Badge tone={j.k === "in" ? "green" : "amber"}>
                                {j.k === "in" ? "Kirim" : "Chiqim"}
                              </Badge>
                            </td>
                            <td className={j.k === "in" ? "text-green" : ""}>
                              {j.k === "in" ? "+" : "−"}
                              {number(j.q)}{" "}
                              {materials.find((m) => m.id === j.m).unit}
                            </td>
                            <td>{j.note}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          )}
          {page === "finance" && (
            <>
              {stats([
                [
                  "Davr tushumi",
                  money(revSum),
                  "so‘m",
                  "Tanlangan davr bo‘yicha",
                  Wallet,
                ],
                [
                  "Jami xarajat",
                  money(expSum),
                  "so‘m",
                  "Tanlangan davr bo‘yicha",
                  ChartNoAxesCombined,
                ],
                [
                  "Sof foyda",
                  money(revSum - expSum),
                  "so‘m",
                  `${number(((revSum - expSum) / revSum) * 100)}% marja`,
                  TrendingUp,
                ],
                [
                  "Debitor qarzdorlik",
                  money(receivable),
                  "so‘m",
                  "To‘lanishi kutilmoqda",
                  Clock,
                ],
              ])}
              <div className="finance-grid">
                {chartPanel}
                <Panel
                  title="Xarajatlar tarkibi"
                  sub="Bugungi ishlab chiqarish asosida"
                >
                  {[
                    ["Xomashyo", expense - 26400000],
                    ["Ish haqi", 11300000],
                    ["Elektr va gaz", 6500000],
                    ["Yoqilg‘i", 4600000],
                    ["Ta’mirlash va boshqa", 4000000],
                  ].map(([l, v]) => (
                    <div className="expense-row" key={l}>
                      <div>
                        <span>{l}</span>
                        <b>{money(v)}</b>
                      </div>
                      <div className="progress">
                        <i style={{ width: (v / expense) * 100 + "%" }} />
                      </div>
                    </div>
                  ))}
                </Panel>
              </div>
              <Panel
                title="Mahsulot rentabelligi"
                sub="Har bir birlik uchun hisob-kitob"
              >
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>MAHSULOT</th>
                        <th>TANNARX</th>
                        <th>SOTUV NARXI</th>
                        <th>FOYDA</th>
                        <th>MARJA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td className="strong">
                            {p.short}
                            <small>1 {p.unit} uchun</small>
                          </td>
                          <td>{number(unitCost(p, materials))} so‘m</td>
                          <td>{number(p.price)} so‘m</td>
                          <td className="text-green">
                            {number(p.price - unitCost(p, materials))} so‘m
                          </td>
                          <td>
                            <Badge tone="green">
                              {number(
                                (1 - unitCost(p, materials) / p.price) * 100,
                              )}
                              %
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel title="Ishchilar oyligi" sub="Oylik ish haqi fondi">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>BO‘LIM</th>
                        <th>XODIMLAR</th>
                        <th>OYLIK FOND</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PAY.map((p) => (
                        <tr key={p.dep}>
                          <td>{p.dep}</td>
                          <td>{p.n} kishi</td>
                          <td>{number(p.sum)} so‘m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          )}
          {page === "delivery" && (
            <>
              <div className="fleet-grid">
                {TRUCKS.map((t) => {
                  const tr = trips.find((r) => r.truck === t.n && r.st < 3);
                  return (
                    <div className="panel truck-card" key={t.n}>
                      <div className="product-card-top">
                        <div className="truck-icon">
                          <Truck size={20} />
                        </div>
                        <Badge
                          tone={t.service ? "amber" : tr ? "blue" : "green"}
                        >
                          {t.service ? "Ta’mirda" : tr ? TSTAT[tr.st] : "Bo‘sh"}
                        </Badge>
                      </div>
                      <h3>{t.name}</h3>
                      <p>{t.driver}</p>
                      <div className="truck-load">
                        {tr ? (
                          <>
                            <b>
                              #{tr.order} · {tr.load}
                            </b>
                            <small>
                              {orders.find((o) => o.id === tr.order)?.cust}
                            </small>
                          </>
                        ) : (
                          <span>
                            {t.service
                              ? "Texnik xizmat ko‘rsatilmoqda"
                              : "Yangi reysga tayyor"}
                          </span>
                        )}
                      </div>
                      {tr && (
                        <button
                          className="button"
                          onClick={() => {
                            setState((s) => advanceTrip(s, tr.id));
                            setToast("Reys holati yangilandi");
                          }}
                        >
                          {TACT[tr.st]}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <Panel title="Reyslar tarixi">
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>REYS</th>
                        <th>MASHINA</th>
                        <th>BUYURTMA</th>
                        <th>YUK</th>
                        <th>HOLAT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map((t) => (
                        <tr key={t.id}>
                          <td>#{t.id}</td>
                          <td>{TRUCKS.find((x) => x.n === t.truck).name}</td>
                          <td>#{t.order}</td>
                          <td>{t.load}</td>
                          <td>
                            <Badge tone={t.st === 3 ? "green" : "blue"}>
                              {TSTAT[t.st]}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel title="Yetkazilishi kutilayotgan buyurtmalar">
                {orderRows(open, true)}
              </Panel>
            </>
          )}
          {page === "assistant" && (
            <div className="assistant-panel">
              <div className="assistant-intro">
                <span>
                  <Sparkles size={22} />
                </span>
                <h2>Sizning zavod yordamchingiz</h2>
                <p>Ma’lumotlarga asoslangan javoblar, bir necha soniyada.</p>
                <Badge tone="amber">Demo · AI xizmatiga ulanmagan</Badge>
              </div>
              <div className="chat" aria-live="polite">
                {messages.map((m, i) => (
                  <div key={i} className={"message " + m.role}>
                    {m.role === "bot" && <Sparkles size={16} />}
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="suggestions">
                {[
                  "Bugungi foyda qancha?",
                  "Omborda nima kam?",
                  "Buyurtmalar holati",
                  "Ishlab chiqarish rejasi",
                ].map((q) => (
                  <button key={q} onClick={() => ask(q)}>
                    {q}
                  </button>
                ))}
              </div>
              <form
                className="chat-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(question);
                }}
              >
                <input
                  aria-label="Yordamchiga savol"
                  placeholder="Zavodingiz haqida savol bering..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <button className="button primary" disabled={!question.trim()}>
                  <Send size={16} /> Yuborish
                </button>
              </form>
            </div>
          )}
          <footer>
            <span>© {new Date().getFullYear()} Xiva Beton</span>
            <span>Biznesingiz uchun mustahkam poydevor.</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
      {modal && (
        <Modal
          title={
            {
              order: "Yangi buyurtma",
              batch: "Partiya qayd etish",
              stock: "Omborga kirim",
              detail: "Buyurtma tafsilotlari",
              help: "Platforma haqida",
            }[modal.type]
          }
          close={() => setModal(null)}
        >
          {["order", "batch", "stock"].includes(modal.type) ? (
            <EntryForm
              type={modal.type}
              state={state}
              preset={modal}
              save={save}
              close={() => setModal(null)}
            />
          ) : modal.type === "detail" ? (
            (() => {
              const o = orders.find((o) => o.id === modal.order),
                p = products.find((p) => p.id === o.pid),
                q = quote(p, o.qty, o.tint, o.zone);
              return (
                <div className="detail">
                  <Badge tone="blue">
                    #{o.id} · {ORD[o.st]}
                  </Badge>
                  <h3>{o.cust}</h3>
                  <p>{p.name}</p>
                  <dl>
                    {[
                      ["Miqdor", `${o.qty} ${p.unit}`],
                      ["Rang", TINTS[o.tint].n],
                      ["Manzil", ZONES[o.zone].n],
                      ["Muddat", dueLabel(o.due)],
                      ["Mahsulot narxi", number(q.base) + " so‘m"],
                      ["Chegirma", q.discount * 100 + "%"],
                      ["Yetkazish", number(q.fee) + " so‘m"],
                      ["Jami", number(q.total) + " so‘m"],
                      ["To‘lov", PAYL[o.pay]],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {o.st < 4 && (
                    <button
                      className="button primary"
                      onClick={() => advanceOrder(o)}
                    >
                      {ORD_ACT[o.st]}
                    </button>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="detail">
              <p>
                Bu Xiva Beton platformasining interaktiv frontend demosidir.
                Buyurtma, partiya va ombor kirimlarini qo‘shishingiz, to‘lov va
                yetkazish holatlarini yangilashingiz mumkin.
              </p>
              <p>
                Ma’lumotlar shu brauzerning localStorage xotirasida saqlanadi.
                Server, haqiqiy to‘lov yoki AI ulanishi mavjud emas. Tarixiy
                moliyaviy ko‘rsatkichlar namunaviy.
              </p>
              <button
                className="button"
                onClick={() => setModal({ type: "help", confirm: true })}
              >
                Demo ma’lumotlarini tiklash
              </button>
              {modal.confirm && (
                <div className="reset-confirm">
                  <p>
                    Barcha mahalliy o‘zgarishlar o‘chiriladi. Davom etasizmi?
                  </p>
                  <button
                    className="button danger"
                    onClick={() =>
                      save(initialState(), "Demo ma’lumotlari tiklandi")
                    }
                  >
                    Ha, tiklash
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
