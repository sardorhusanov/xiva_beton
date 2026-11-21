# Xiva Beton — React frontend

A React + Vite implementation of the original Uzbek factory management demo. No backend is required.

## Run locally

```bash
cd project
npm install
npm run dev
```

Open the URL printed by Vite. To produce a static build, run `npm run build`; output is in `dist/`. Use `npm run preview` to preview that build.

## Included

- Dashboard with financial charts, production progress, inventory warnings and recent orders.
- Orders with search, stage filters, detail dialogs, automatic pricing, volume discounts, transport calculation, payment and status updates.
- Production batches that validate stock and deduct raw materials, including waste.
- Inventory receipts and movement history.
- Finance periods, product margins, payroll and CSV export.
- Delivery stages synchronized with associated orders.
- A clearly labeled, rule-based demo assistant using current browser data.
- Responsive navigation, native accessible dialogs and browser-local persistence.

All records are demo data. Changes are saved in this browser under `xiva-beton-react-v1` in localStorage; no data is sent to a server. The help dialog provides a confirmed reset. Historical finance figures and equipment statuses are illustrative; order payments use unpaid, 50% advance, or fully paid states. Due dates follow the original demo's relative-day model.

## Structure

- `src/App.jsx`: React views and application state.
- `src/components.jsx`: reusable panels, badges, fields and accessible dialogs.
- `src/EntryForm.jsx`: validated order, production and stock forms.
- `src/data.js`: original product, inventory, order, fleet and payroll seeds.
- `src/model.js`: pricing, batch and delivery transitions; pure functions for future API integration.
- `src/styles.css`: responsive application styling.

## Validation

```bash
npm test
npm run build
```

For browser regression checks, start `npm run dev` and then run `npx playwright test`. Chromium must be installed (`npx playwright install chromium`).

## Vercel

The repository-root `vercel.json` configures installation with `npm ci --prefix project`, building with `npm run build --prefix project`, and output from `project/dist`. Keep the hosting Root Directory at the repository root. Deploy from that directory with `npx vercel --prod` to use the existing linked project.

Hash navigation works on static hosts without rewrite rules. The former root HTML demos have been removed.
