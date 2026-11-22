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

## Online Board ballot

`members/vote.html` is the online ballot: members sign in with their email address and the shared
member password, and vote for the first Board of Directors. The Bylaws are not on this ballot; they go to the members after legal review. Single-nominee offices are Yes/No; offices with several candidates
(President, Vice President, Secretary, Member at Large) are choose-one. Nominee names are set in `OFFICERS` in `members/vote.js`, the paper form in
`members/admin.html`, and `QUESTIONS` in the Worker; all three must match.
Votes are stored by a Cloudflare Worker with a D1 database (code kept outside this repository). The member email list and
the password live only there, never in this repository; the master voter list is kept in Proton Sheets and uploaded as CSV.
Paste the Worker URL into `members/ballot-config.js`. `members/admin.html` is the Secretary's page (admin key required)
for loading the voter list, following turnout, recording paper ballots, opening or closing voting and downloading results.
