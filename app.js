const tabs = [...document.querySelectorAll('[data-program-button]')];
const panels = [...document.querySelectorAll('[data-program-panel]')];
const interest = document.getElementById('interest-select');
const form = document.getElementById('interest-form');
const status = document.getElementById('form-status');
const submitButton = form.querySelector('[type="submit"]');
const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbwS_XupTwhr1nZcBN5Kl3L4559Zndvlp7MVKlcXSxlgQ1qHyImDsugCb5eoeCkv6Cyl/exec';

function selectProgram(program, updateUrl = false) {
  if (!['fitness', 'mindfulness'].includes(program)) return;
  tabs.forEach(tab => {
    const active = tab.dataset.programButton === program;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-pressed', String(active));
  });
  panels.forEach(panel => { panel.hidden = panel.dataset.programPanel !== program; });
  if (updateUrl) history.replaceState(null, '', '#' + program);
}

tabs.forEach(tab => tab.addEventListener('click', () => selectProgram(tab.dataset.programButton, true)));
document.querySelectorAll('[data-interest]').forEach(link => link.addEventListener('click', () => {
  interest.value = link.dataset.interest === 'fitness' ? 'Fitness & movement' : 'Mindfulness & recovery';
}));
if (location.hash === '#mindfulness') selectProgram('mindfulness');
window.addEventListener('hashchange', () => {
  if (location.hash === '#fitness' || location.hash === '#mindfulness') selectProgram(location.hash.slice(1));
});
document.getElementById('year').textContent = new Date().getFullYear();

form.addEventListener('submit', async event => {
  event.preventDefault();
  status.textContent = '';
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  const payload = {
    submission_id: globalThis.crypto?.randomUUID?.() || `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    submitted_at: new Date().toISOString(),
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    contact_number: values.contact_number.trim(),
    primary_goal: values.primary_goal,
    coaching_type: values.coaching_type,
    biggest_challenge: values.biggest_challenge.trim(),
    joining_reason: 'FebFit Wellness website enquiry'
  };
  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  try {
    // The existing Apps Script accepts JSON in e.postData.contents. Its cross-origin
    // response is opaque to the browser, so this verifies delivery to the endpoint,
    // not the final spreadsheet write.
    await fetch(googleSheetsUrl, {
      method: 'POST', mode: 'no-cors', keepalive: true,
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify(payload)
    });
    form.hidden = true;
    document.getElementById('thank-you').hidden = false;
    document.getElementById('thank-you').focus?.();
    form.reset();
  } catch (error) {
    status.textContent = 'We could not send your details. Check your connection and try again.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send my details';
  }
});
document.getElementById('new-enquiry').addEventListener('click', () => {
  document.getElementById('thank-you').hidden = true;
  form.hidden = false;
  form.querySelector('input').focus();
});
