// bitwork-host: serves bitwork.dk/host/<app>/... from the Firebase Hosting
// site bitworkhost-<app> in Google Cloud project "bitworkhost".
// New app = new Firebase site named bitworkhost-<app>; this Worker never changes.
//
// Deployed as Cloudflare Worker "bitwork-host" (the Cloudflare account
// that holds bitwork.dk) on route "bitwork.dk/host*" in zone bitwork.dk. This file is a
// backup copy: redeploy it only if the Worker is missing or broken.
const PREFIX = '/host/';
const SITE_PREFIX = 'bitworkhost-';
const NAME = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith(PREFIX)) {
      return new Response('Not found', { status: 404 });
    }
    const rest = url.pathname.slice(PREFIX.length);
    const slash = rest.indexOf('/');
    const app = slash === -1 ? rest : rest.slice(0, slash);
    if (!NAME.test(app)) {
      return new Response('Not found', { status: 404 });
    }
    if (slash === -1) {
      // /host/gaucho -> /host/gaucho/ so the app's relative URLs resolve
      return Response.redirect(url.origin + PREFIX + app + '/' + url.search, 301);
    }
    const origin = 'https://' + SITE_PREFIX + app + '.web.app';
    const upstream = new URL(rest.slice(slash) + url.search, origin);

    const headers = new Headers(request.headers);
    headers.delete('host');
    const res = await fetch(upstream, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    // Keep redirects on bitwork.dk/host/<app>/ instead of leaking web.app URLs.
    const loc = res.headers.get('location');
    if (loc) {
      const out = new Response(res.body, res);
      const l = new URL(loc, origin);
      if (l.origin === origin) {
        out.headers.set('location', url.origin + PREFIX + app + l.pathname + l.search);
      }
      return out;
    }
    return res;
  },
};
