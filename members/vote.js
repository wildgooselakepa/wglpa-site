(() => {
  // Paste the Google Apps Script web app URL (ends in /exec) here.
  const ENDPOINT = 'PASTE_WEB_APP_URL_HERE';

  const $ = id => document.getElementById(id);
  const steps = document.querySelectorAll('.steps li');
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
    const pick = document.querySelector('input[name="vote"]:checked');
    if (!pick) return say('msg-3', 'Please choose Yes or No.');
    const label = pick.value === 'yes' ? 'YES, ratify the Bylaws' : 'NO, do not ratify the Bylaws';
    if (!confirm('Submit your vote: ' + label + '?\n\nYou can\'t change it after you submit.')) return;
    const btn = $('submit-vote'); btn.disabled = true; btn.textContent = 'Submitting…';
    say('msg-3', '');
    const res = await call({ action: 'vote', email: creds.email, password: creds.password, vote: pick.value });
    btn.disabled = false; btn.textContent = 'Submit my vote';
    if (res.ok) { creds = null; show('done'); }
    else say('msg-3', res.error);
  });
})();
