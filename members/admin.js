(() => {
  const BASE = String(window.WGLPA_BALLOT_URL || '').replace(/\/+$/, '');
  const $ = id => document.getElementById(id);
  const KEYS = ['bylaws', 'president', 'vicepresident', 'secretary', 'treasurer'];
  let key = sessionStorage.getItem('wglpa-admin') || '';
  let state = null;

  const say = (text, ok = true) => { const m = $('a-msg'); m.textContent = text; m.hidden = !text; m.classList.toggle('ok', ok); if (text) m.scrollIntoView({ block: 'nearest' }); };

  async function api(path, opts = {}) {
    if (!/^https?:/.test(BASE)) return { ok: false, error: 'The ballot box address is not set yet (ballot-config.js).' };
    try {
      const r = await fetch(BASE + path, { ...opts, headers: { Authorization: 'Bearer ' + key, ...(opts.headers || {}) } });
      if ((r.headers.get('Content-Type') || '').includes('text/csv')) return { ok: r.ok, blob: await r.blob() };
      return await r.json();
    } catch (e) { return { ok: false, error: 'Could not reach the ballot box. Check your connection and try again.' }; }
  }
  const post = (path, body, type = 'application/json') => api(path, { method: 'POST', headers: { 'Content-Type': type }, body: type === 'application/json' ? JSON.stringify(body) : body });

  function show(s) {
    state = s;
    const closes = new Date(new Date(s.closes) - 1).toLocaleDateString('en-US', { timeZone: 'America/Detroit', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    $('a-state').textContent = s.open ? `Voting is open. It closes on its own at the end of ${closes} (Michigan time).` : 'Voting is closed. Members cannot sign in or vote.';
    $('a-toggle').textContent = s.open ? 'Close voting' : 'Reopen voting';
    $('a-toggle').disabled = !s.open && new Date() >= new Date(s.closes);
    const stats = [['Owners voted', `${s.ownersVoted} of ${s.owners}`], ['Votes counted', `${s.votesCounted} of ${s.possibleVotes}`], ['Emails on list', s.emails]];
    $('a-stats').replaceChildren(...stats.map(([t, v]) => { const d = document.createElement('div'); d.innerHTML = '<dt></dt><dd></dd>'; d.firstChild.textContent = t; d.lastChild.textContent = v; return d; }));
    $('a-results').replaceChildren(...s.results.map(r => { const tr = document.createElement('tr'); [r.question, r.yes, r.no, r.result].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td); }); return tr; }));
  }

  async function refresh() {
    const r = await api('/admin/status');
    if (!r.ok) { signout(r.error); return false; }
    show(r);
    const v = await api('/admin/voters.csv');
    if (v.ok && v.blob) {
      const names = [...new Set((await v.blob.text()).split(/\r?\n/).slice(1).map(l => (l.match(/^[^,]*,("(?:[^"]|"")*"|[^,]*)/) || [])[1]).filter(Boolean).map(x => x.replace(/^"|"$/g, '').replace(/""/g, '"')))];
      $('owners').replaceChildren(...names.map(n => { const o = document.createElement('option'); o.value = n; return o; }));
    }
    return true;
  }

  function signout(err) {
    key = ''; sessionStorage.removeItem('wglpa-admin');
    $('a-main').hidden = true; $('a-login').hidden = false;
    const m = $('a-msg-login'); m.textContent = err || ''; m.hidden = !err;
  }

  async function download(path, name) {
    const r = await api(path);
    if (!r.ok || !r.blob) return say(r.error || 'Download failed.', false);
    const a = document.createElement('a'); a.href = URL.createObjectURL(r.blob); a.download = name;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  $('a-signin').addEventListener('submit', async e => {
    e.preventDefault();
    key = $('a-key').value.trim();
    if (!key) return;
    if (await refresh()) {
      sessionStorage.setItem('wglpa-admin', key);
      $('a-login').hidden = true; $('a-main').hidden = false; $('a-key').value = '';
    }
  });
  $('a-signout').addEventListener('click', () => signout());
  $('a-refresh').addEventListener('click', async () => { say(''); await refresh(); });
  $('a-dl-results').addEventListener('click', () => download('/admin/results.csv', 'wglpa-results.csv'));
  $('a-dl-voters').addEventListener('click', () => download('/admin/voters.csv', 'wglpa-voters.csv'));

  $('a-toggle').addEventListener('click', async () => {
    const open = !state.open;
    if (!confirm(open ? 'Reopen voting for members?' : 'Close voting now? Members will not be able to vote until you reopen it.')) return;
    const r = await post('/admin/open', { open });
    if (!r.ok) return say(r.error, false);
    show(r); say(r.open ? 'Voting is open.' : 'Voting is closed.');
  });

  $('a-upload').addEventListener('submit', async e => {
    e.preventDefault();
    const f = $('a-file').files[0];
    if (!f) return say('Choose the CSV file first.', false);
    const r = await post('/admin/voters', await f.text(), 'text/csv');
    if (!r.ok) return say(r.error, false);
    $('a-file').value = ''; await refresh();
    say(`Voter list loaded: ${r.loaded} email addresses for ${r.owners} owners.`);
  });

  $('a-paper').addEventListener('submit', async e => {
    e.preventDefault();
    const owner = $('p-owner').value.trim();
    const votes = {};
    for (const k of KEYS) { const c = document.querySelector(`input[name="p-${k}"]:checked`); if (c) votes[k] = c.value; }
    if (!owner) return say('Enter the owner name.', false);
    if (Object.keys(votes).length < KEYS.length) return say('Choose Yes or No for all five questions, as marked on the paper ballot.', false);
    const summary = KEYS.map(k => `${k === 'vicepresident' ? 'Vice President' : k[0].toUpperCase() + k.slice(1)}: ${votes[k]}`).join('\n');
    if (!confirm(`Record this paper ballot for ${owner}?\n\n${summary}\n\nThis can't be changed afterward.`)) return;
    const r = await post('/admin/paper', { owner, properties: $('p-props').value, votes });
    if (!r.ok) return say(r.error, false);
    e.target.reset(); show(r);
    say(`Paper ballot recorded for ${owner} (${r.recorded} ${r.recorded === 1 ? 'vote' : 'votes'}).`);
  });

  $('a-reset').addEventListener('submit', async e => {
    e.preventDefault();
    if ($('a-confirm').value.trim() !== 'DELETE') return say('Type DELETE in the box to confirm.', false);
    if (!confirm('Delete every vote recorded so far? This cannot be undone.')) return;
    const r = await post('/admin/reset', { confirm: 'DELETE' });
    if (!r.ok) return say(r.error, false);
    $('a-confirm').value = ''; show(r); say('All votes were deleted. The voter list was kept.');
  });

  if (key) refresh().then(ok => { if (ok) { $('a-login').hidden = true; $('a-main').hidden = false; } });
})();
