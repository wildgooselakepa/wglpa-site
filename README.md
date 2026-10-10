# Wild Goose Lake Protection Association website

Static site for https://wildgooselake.org, served by GitHub Pages from the `main` branch.

- `index.html` is the whole site (HTML and CSS in one file).
- `CNAME` sets the custom domain.

Text highlighted in yellow on the page is a placeholder that still needs real details.

## Members area

`members/index.html` is password-protected with StatiCrypt: the page content is encrypted and
only opens with the members password. The readable source is kept privately, outside this
public repository. To change the content or the password, re-encrypt the source and replace
`members/index.html`.
