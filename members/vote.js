(() => {
  // Paste the Google Apps Script web app URL (ends in /exec) here.
  const ENDPOINT = 'PASTE_WEB_APP_URL_HERE';

  // Board officer ballot. Put each nominee's name in "nominee" once the slate is set.
  // A blank name shows "Nominee to be announced" in yellow.
  const OFFICERS = [
    { key: 'president', office: 'President', nominee: '', email: 'president.pa@wildgooselake.org',
      duties: "Presides at meetings, is the association's single point of contact with Washtenaw County, Lyndon Township and the lake-management contractors, and signs documents the Board approves." },
    { key: 'vicepresident', office: 'Vice President', nominee: '', email: 'vicepresident.pa@wildgooselake.org',
      duties: 'Acts for the President when the President is absent.' },
    { key: 'secretary', office: 'Secretary', nominee: '', email: 'secretary.pa@wildgooselake.org',
      duties: 'Keeps the minutes and the member contact list, gives meeting notices, and posts notices, minutes and documents on this website.' },
    { key: 'treasurer', office: 'Treasurer', nominee: '', email: 'treasurer.pa@wildgooselake.org',
      duties: "Receives gifts and sends acknowledgments, pays approved bills, keeps the books and a separate account for each fund, makes the association's member-approved contribution to the County project, files the State annual report, and gives a written financial report at the annual meeting." }
  ];
  const QUESTIONS = [{ key: 'bylaws', label: 'Bylaws' }, ...OFFICERS.map(o => ({ key: o.key, label: o.office }))];

  const $ = id => document.getElementById(id);
  const steps = document.querySelectorAll('.steps li');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  $('officers').innerHTML = OFFICERS.map((o, i) => {
    const who = o.nominee ? esc(o.nominee) : '<em class="ph">Nominee to be announced</em>';
    const name = o.nominee ? esc(o.nominee) : 'the nominee';
    return `<fieldset class="q">
      <legend><span class="q-n">${i + 2}</span> ${esc(o.office)}: ${who}</legend>
      <p class="duties">${esc(o.duties)} <a class="email" href="mailto:${o.email}">${o.email}</a></p>
      <label class="choice"><input type="radio" name="${o.key}" value="yes"> <span>Yes, elect ${name} as ${esc(o.office)}</span></label>
      <label class="choice"><input type="radio" name="${o.key}" value="no"> <span>No</span></label>
    </fieldset>`;
  }).join('');
  let creds = null;

  const show = n => {
    ['1', '2', '3', 'done'].forEach(k => { $('step-' + k).hidden = k !== String(n); });
    steps.forEach(li => {
      const s = Number(li.dataset.step), cur = n === 'done' ? 4 : Number(n);
      li.classList.toggle('on', s === cur);
      li.classList.toggle('done', s < cur);
    });
    const h = $('step-' + n).querySelector('h2');
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    $('ballot').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const say = (id, text, ok) => { const m = $(id); m.textContent = text; m.hidden = !text; m.classList.toggle('ok', !!ok); };

  const call = async body => {
    if (ENDPOINT.startsWith('PASTE')) return { ok: false, error: 'Online voting is not open yet.' };
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
      return await r.json();
    } catch (e) {
      return { ok: false, error: 'We could not reach the ballot box. Check your connection and try again.' };
    }
  };

  $('signin').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('email').value.trim(), password = $('password').value;
    if (!email || !password) return say('msg-1', 'Please enter your email address and the member password.');
    const btn = e.submitter || e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Checking…';
    say('msg-1', '');
    const res = await call({ action: 'signin', email, password });
    btn.disabled = false; btn.textContent = 'Sign in';
    if (res.ok) { creds = { email, password }; show(2); }
    else if (res.voted) { $('done-text').textContent = res.error + ' Thank you for taking part.'; $('step-done').querySelector('h2').textContent = 'Your property has voted'; show('done'); }
    else say('msg-1', res.error);
  });

  $('reviewed').addEventListener('change', e => { $('to-vote').disabled = !e.target.checked; });
  $('to-vote').addEventListener('click', () => show(3));
  $('back').addEventListener('click', () => show(2));

  $('voteform').addEventListener('submit', async e => {
    e.preventDefault();
    const votes = {}, missing = [];
    QUESTIONS.forEach(q => {
      const pick = document.querySelector(`input[name="${q.key}"]:checked`);
      if (pick) votes[q.key] = pick.value; else missing.push(q.label);
    });
    if (missing.length) return say('msg-3', 'Please choose Yes or No on every question. Still to answer: ' + missing.join(', ') + '.');
    const summary = QUESTIONS.map(q => `${q.label}: ${votes[q.key].toUpperCase()}`).join('\n');
    if (!confirm('Submit your ballot?\n\n' + summary + "\n\nYou can't change it after you submit.")) return;
    const btn = $('submit-vote'); btn.disabled = true; btn.textContent = 'Submitting…';
    say('msg-3', '');
    const res = await call({ action: 'vote', email: creds.email, password: creds.password, votes });
    btn.disabled = false; btn.textContent = 'Submit my vote';
    if (res.ok) { creds = null; show('done'); }
    else say('msg-3', res.error);
  });
})();
