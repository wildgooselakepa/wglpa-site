(() => {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('main-nav');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const from = document.getElementById('f-email').value.trim();
    const lines = [document.getElementById('f-msg').value.trim()];
    if (document.getElementById('f-sub').checked) lines.push('', 'Please add me to the lake news and event reminder list.');
    lines.push('', `From: ${name} (${from})`);
    location.href = 'mailto:protection.association@wildgooselake.org?subject=' + encodeURIComponent('Website message from ' + name) + '&body=' + encodeURIComponent(lines.join('\n'));
  });
  const openReports = () => { const r = document.getElementById('reports'); if (r && location.hash === '#reports') r.open = true; };
  window.addEventListener('hashchange', openReports); openReports();
  // Old one-page links (for example wildgooselake.org/#join) go to the section's new page.
  const moved = {"living": "lake.html", "facts": "lake.html", "history": "lake.html", "fishing": "lake.html", "cranes": "lake.html", "hunting": "lake.html", "safety": "lake.html", "stewardship": "lake.html", "about": "association.html", "board": "association.html", "documents": "association.html", "contact": "association.html", "subscribe": "association.html", "contact-form": "association.html", "f-name": "association.html", "f-email": "association.html", "f-msg": "association.html", "f-sub": "association.html", "form-note": "association.html", "studies": "studies.html", "reports": "studies.html", "assessment": "assessment.html", "fundraising": "fundraising.html", "neighbor-fund": "fundraising.html", "give": "fundraising.html", "join": "membership.html", "member-login": "membership.html", "partners": "partners.html", "community-partners": "partners.html", "news": "news.html", "events": "news.html", "links": "links.html"};
  const h = location.hash.slice(1);
  if (h && !document.getElementById(h) && moved[h]) location.replace(moved[h] + '#' + h);
})();
