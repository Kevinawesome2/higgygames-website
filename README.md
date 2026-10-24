# HiggyGames website

A single-page static site for HiggyGames LLC promoting Disc-yphus. No build step, no framework: plain HTML, CSS, and a small script.

```
index.html          the whole page (Home / Games / About / Contact / footer)
css/style.css       styles and palette (edit the :root variables to retheme)
js/main.js          sticky nav, mobile menu, reveal animations, contact form
assets/images/      hero background, game card, share image, favicon
assets/fonts/       self-hosted Fredoka + Nunito (variable woff2, Latin)
privacy.html        privacy policy, linked from the footer and the contact form
assets/videos/      (empty) drop hero.mp4 here when you have a trailer
```

## Preview locally

Any static server works. From this folder:

```
python -m http.server 8080
```

Then open http://localhost:8080. Opening `index.html` directly from disk also works. Fonts are self-hosted in `assets/fonts/` (no Google requests, for GDPR).

## Things to fill in

Search `index.html` for `EDIT ME`. Each one is a placeholder:

- Steam store URL (hero button, game card icon, footer icon)
- Social links in the footer. Any link left as `#` is hidden automatically.
- `og:url` and `og:image` in the `<head>` once the domain is live, so link previews resolve.
- Founder name, role, and portrait in the About section.
- Cloudflare Turnstile site key on the contact form (see the next section).

## Contact form and spam

The Contact section deliberately shows no email address. Scrapers harvest `mailto:` links, so the only way in is the form, which posts to Formspree and lands in the studio inbox from there. The form endpoint is the `action` attribute on `<form id="contactForm">` in `index.html`.

Spam protection, in three layers:

- A honeypot field named `_gotcha`, hidden from people but filled in by naive bots. Formspree silently discards any submission where it has a value.
- Formspree's own server-side spam filtering. Anything it flags shows up under the Spam tab in the Formspree dashboard rather than in your inbox.
- Cloudflare Turnstile, a free CAPTCHA that verifies most visitors without a puzzle. The widget sits just above the Send button in `index.html`. `main.js` only loads the Turnstile script once a real site key is in place, so the form keeps working while the key is still the placeholder.

To set Turnstile up for the first time, or to rotate the keys, do the steps in this order so the form is never left rejecting everything:

1. In the Cloudflare dashboard, open Turnstile, add a widget for `higgygames.com` (Managed mode), and copy the Site Key and Secret Key.
2. In `index.html`, paste the Site Key into the `data-sitekey` attribute of the `cf-turnstile` div (search for `EDIT ME`). The site key is public and fine to commit. The secret key never goes in the repo.
3. Commit and push, and confirm the widget shows on the live site.
4. In the Formspree form settings, enable CAPTCHA, choose Cloudflare Turnstile, and paste the Secret Key. From this point Formspree rejects any submission without a valid Turnstile token.

## Adding the trailer

1. Export an MP4 (H.264, 1920x1080 or 1280x720, no audio track needed, ideally under 8 MB).
2. Save it as `assets/videos/hero.mp4`.
3. In `index.html`, uncomment the `<video>` block inside `.hero__media`.

The poster image and the drifting screenshot stay as a fallback for slow connections and reduced-motion users.

## Hosting with your Squarespace domain

Squarespace hosts domains, but this site is plain files, so host the files somewhere free and point the domain at them. GitHub Pages is the simplest.

### 1. Put the site on GitHub Pages

1. Create a GitHub repository (for example `higgygames-site`) and push this folder to it.
2. In the repo, open Settings, then Pages. Under Build and deployment set Source to "Deploy from a branch", pick `main` and `/ (root)`, and save.
3. Still on the Pages screen, enter your domain (for example `higgygames.com`) under Custom domain and save. GitHub creates a `CNAME` file in the repo.
4. Tick "Enforce HTTPS" once it becomes available (it can take up to an hour after DNS is set).

### 2. Point the Squarespace domain at GitHub

In Squarespace go to Domains, pick the domain, then DNS settings, and add these records:

| Type  | Host | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | `<your-github-username>.github.io` |

Delete any existing Squarespace A or CNAME records for `@` and `www` that point at Squarespace's own servers, otherwise they take precedence. DNS usually updates within an hour, occasionally up to 24.

Netlify and Cloudflare Pages work the same way: drag the folder in, then point the domain at the address they give you.

## After editing CSS or JS

GitHub Pages tells browsers to cache files for 10 minutes, so a normal refresh can keep showing the old stylesheet. Bump the version number on the two tags in `index.html` whenever you change `style.css` or `main.js`:

```
<link rel="stylesheet" href="css/style.css?v=3">
<script src="js/main.js?v=3"></script>
```

Any new number works. Browsers see a new address and fetch a fresh copy. If you forget, a hard refresh (Ctrl+Shift+R) shows the latest version.

## Updating the site

Edit the files, commit, push. GitHub Pages redeploys in about a minute.
