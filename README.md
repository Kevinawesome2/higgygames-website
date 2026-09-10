# HiggyGames website

A single-page static site for HiggyGames LLC promoting Disc-yphus. No build step, no framework: plain HTML, CSS, and a small script.

```
index.html          the whole page (Home / Games / About / Contact / footer)
css/style.css       styles and palette (edit the :root variables to retheme)
js/main.js          sticky nav, mobile menu, reveal animations, contact form
assets/images/      hero background, game card, share image, favicon
assets/videos/      (empty) drop hero.mp4 here when you have a trailer
```

## Preview locally

Any static server works. From this folder:

```
python -m http.server 8080
```

Then open http://localhost:8080. Opening `index.html` directly from disk also works, minus the fonts if you're offline.

## Things to fill in

Search `index.html` for `EDIT ME`. Each one is a placeholder:

- Steam store URL (hero button, game card icon, footer icon)
- Social links in the footer. Any link left as `#` is hidden automatically.
- Contact email (`mailto:` link in the Contact section)
- Formspree endpoint on the contact form. Until you replace `YOUR_FORM_ID`, submitting the form opens the visitor's email app with the message pre-filled instead.
- `og:url` and `og:image` in the `<head>` once the domain is live, so link previews resolve.
- Founder name, role, and portrait in the About section.

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

## Updating the site

Edit the files, commit, push. GitHub Pages redeploys in about a minute.
