# Wild Goose Lake Protection Association website

Static site for https://wildgooselake.org, served by GitHub Pages from the `main` branch.

- The site is a set of static pages that share `assets/site.css` and `assets/site.js`:
  `index.html` (home), `lake.html`, `association.html`, `studies.html`, `assessment.html`,
  `fundraising.html`, `membership.html`, `partners.html`, `news.html` and `links.html`.
- The header, menu and footer are repeated in every page; change them in all pages together.
- `assets/img/` holds the photos. They are illustrative stand-ins; replace them with real photos of the lake.
- Old one-page links such as `/#join` are forwarded to the right page by `assets/site.js`.
- `CNAME` sets the custom domain.

Text highlighted in yellow on the page is a placeholder that still needs real details.

## Members area

`members/index.html` is password-protected with StatiCrypt: the page content is encrypted and
only opens with the members password. The readable source is kept privately, outside this
public repository. To change the content or the password, re-encrypt the source and replace
`members/index.html`.
