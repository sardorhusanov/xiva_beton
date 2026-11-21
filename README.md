# Xiva Beton

React + Vite frontend for factory management. Application source lives in [`project/`](project/README.md).

```bash
cd project
npm install
npm run dev
```

## Vercel

The existing Vercel project is linked at the repository root. `vercel.json` installs and builds the React app in `project/` and serves only `project/dist`.

Keep the Vercel Root Directory at the repository root. To deploy to production from this directory:

```bash
npx vercel --prod
```

The former standalone HTML demos have been removed. All application data stays in the browser; there is no backend.
