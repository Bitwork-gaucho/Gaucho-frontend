---
name: bitwork-host
description: Host, deploy, update, list or remove simple web apps on the Bitwork host at bitwork.dk/host/<app>/ (Firebase Hosting in Google Cloud project "bitworkhost", routed by the Cloudflare Worker "bitwork-host"). Use whenever the user asks to host, publish, put online or deploy an app "on the host", "on bitwork", "under bitwork.dk/host", "as <name>", or asks which apps are hosted there.
---

# Bitwork host

Static web apps live at `https://bitwork.dk/host/<app>/`. Each app keeps its own
repository and deploys on its own.

```
bitwork.dk/host/<app>/...
  -> Cloudflare Worker "bitwork-host" (route bitwork.dk/host*, never edited per app)
  -> https://bitworkhost-<app>.web.app/...   (Firebase Hosting site)
     in Google Cloud project "bitworkhost" (Firebase on, billing OFF, free plan)
```

Adding an app = create one Firebase site + build the app for its subfolder +
deploy. No DNS or Cloudflare change is ever needed.

Helpers (paths relative to this skill's folder):
- `scripts/google-login.sh` — Google sign-in for gcloud/Firebase in a cloud session.
- `scripts/host.sh` — `list`, `create <app>`, `deploy`, `verify <app>`.
- `templates/firebase.json` — Firebase config for an app.
- `references/worker.js` — backup of the Cloudflare Worker.

## Fits / doesn't fit

Fits: static front-ends (Vite/React/Vue/Svelte SPAs, plain HTML) whose build
output is a folder of files. Apps may call outside APIs from the browser.

Doesn't fit: apps needing server code, Firebase Functions, or databases beyond
the free plan (the project has no billing — say so and suggest a separate
project). Apps that need logins or private data: all apps share the
`bitwork.dk` origin, so cookies and localStorage are shared between them; warn
the user.

## 1. Sign in to Google

```
bash scripts/google-login.sh status
```
If `SIGNED_OUT`: run `bash scripts/google-login.sh start`, send the user the
link as a clickable markdown link, ask them to open it, allow access and paste
the verification code back, then end the turn. On reply run
`bash scripts/google-login.sh code '<CODE>'`. The login lasts only for the
container. Run plain gcloud as `bash scripts/google-login.sh gcloud ...`
(the session's placeholder `CLOUDSDK_AUTH_ACCESS_TOKEN` otherwise overrides the
login). `host.sh` sets `GOOGLE_CLOUD_QUOTA_PROJECT=bitworkhost` for the
Firebase CLI itself.

## 2. Pick the name and create the site

- Name: lowercase letters, digits, hyphens, max 40, e.g. `todo`. Ask if the
  user did not give one; suggest the repo name.
- `bash scripts/host.sh list` — if the name is already taken, ask whether to
  update that app or pick another name. Updating an existing app skips to step 4.
- `bash scripts/host.sh create <app>` creates site `bitworkhost-<app>`.
  Site IDs are global across all of Firebase; if it is taken by someone else,
  choose another app name (the Worker relies on the `bitworkhost-<app>` rule).

## 3. Make the app work under /host/<app>/

The app is served from a subfolder, so every URL it builds must include it.
Keep the root build working (other hosting, local dev) by making the base a
build setting rather than hard-coding it.

**Vite** (`vite.config.*`):
```js
base: process.env.BASE_PATH || '/',
```
**React Router** (`BrowserRouter`/`createBrowserRouter`):
```jsx
<Router basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
```
Other routers: pass the same value as their base/basename option.

Then search the source for root-relative URLs and fix them:
- Files from `public/` referenced as `"/logo.png"` in JS/JSX →
  `` `${import.meta.env.BASE_URL}logo.png` ``. (`index.html` is rewritten by
  Vite automatically.)
- Plain `<a href="/page">` inside the app → router `<Link to="/page">`
  (`navigate('/page')` and `<Link>` are fine once basename is set).
- URLs built from `window.location.origin + '/...'` → insert
  `import.meta.env.BASE_URL`.
- `fetch('/api/...')` to the app's own origin will not work here — there is
  no backend.

Other tools: Create React App → `"homepage": "/host/<app>/"`; Next.js static
export → `basePath: '/host/<app>'`, `output: 'export'`, public dir `out`;
plain HTML → use relative paths (`./style.css`).

Add to the app's repo:
- `firebase.json` from `templates/firebase.json`, with `APPNAME` replaced and
  `public` set to the build folder (`dist`, `build`, `out`).
- `.firebaserc`: `{ "projects": { "default": "bitworkhost" } }`
- `.firebase/` in `.gitignore`.
- package.json scripts (Vite example):
  ```json
  "build:host": "BASE_PATH=/host/<app>/ vite build",
  "deploy:host": "npm run build:host && GOOGLE_CLOUD_QUOTA_PROJECT=bitworkhost npx -y firebase-tools@latest deploy --only hosting --project bitworkhost"
  ```

## 4. Build and test locally

```
npm run build:host
BASE_PATH=/host/<app>/ npx vite preview --port 4173   # serves /host/<app>/
```
Load `http://localhost:4173/host/<app>/` and a deep link (e.g.
`/host/<app>/some-page`) in Playwright: no 4xx responses, images load, internal
links stay under `/host/<app>/`. Fix before deploying.

## 5. Deploy and verify

From the app's repo root: `bash <skill>/scripts/host.sh deploy`.
Deploying changes a public website: do it when the user asked to host or
update the app; otherwise ask first.

Then `bash <skill>/scripts/host.sh verify <app>` — expect `200 text/html`. If
`bitwork.dk` is blocked by the session's network (proxy 403), propose adding
`bitwork.dk` to the environment's allowed hosts. Take a phone-width screenshot
of `https://bitwork.dk/host/<app>/` for the user.

Commit the config changes in the app's repo (per the repo's branch rules).

## Removing an app

Ask first — it takes the app offline.
```
GOOGLE_CLOUD_QUOTA_PROJECT=bitworkhost npx -y firebase-tools@latest hosting:disable --site bitworkhost-<app> --project bitworkhost
GOOGLE_CLOUD_QUOTA_PROJECT=bitworkhost npx -y firebase-tools@latest hosting:sites:delete bitworkhost-<app> --project bitworkhost --force
```

## If the Worker is missing or broken

Normally never touch Cloudflare. If `bitwork.dk/host/<app>/` returns a
Cloudflare error while `bitworkhost-<app>.web.app` works, check with the
Cloudflare MCP tools (the account that holds zone
`bitwork.dk`): Worker script `bitwork-host` and route `bitwork.dk/host*`.
Redeploy from `references/worker.js` only if it is missing or differs, and
tell the user. Never modify other Workers (e.g. `modstudio`) or other routes.
The connection needs scopes `zone.read`, `account-settings.read`,
`workers-scripts.write`, `workers-routes.write`.

## Limits

36 sites per Firebase project (one is the unused default site `bitworkhost`).
Free plan, shared across all apps: 10 GB stored, ~360 MB transfer/day. Each
deploy keeps old versions; roll back in the Firebase console
(Hosting → site → release history).
