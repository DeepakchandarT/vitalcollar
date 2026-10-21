const sheetReceiver = 'https://script.google.com/macros/s/AKfycbwS_XupTwhr1nZcBN5Kl3L4559Zndvlp7MVKlcXSxlgQ1qHyImDsugCb5eoeCkv6Cyl/exec';

export async function POST(request) {
  let lead;
  try {
    const raw = await request.text();
    if (raw.length > 20000) return Response.json({ ok: false, error: 'Submission is too large.' }, { status: 413 });
    lead = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: 'Invalid submission.' }, { status: 400 });
  }

  if (!lead || typeof lead !== 'object' || Array.isArray(lead) ||
      !String(lead.full_name || '').trim() || !String(lead.contact_number || '').trim() ||
      lead.enquiry_consent !== true) {
    return Response.json({ ok: false, error: 'Name, contact number and consent are required.' }, { status: 400 });
  }
  const number = String(lead.contact_number).trim();
  if (!/^[+()\d\s-]{7,18}$/.test(number) || number.replace(/\D/g, '').length < 7) {
    return Response.json({ ok: false, error: 'Enter a valid contact number.' }, { status: 400 });
  }

  const submissionId = String(lead.submission_id || crypto.randomUUID()).slice(0, 100);
  const details = [
    ['Profession', lead.profession], ['City', lead.city],
    ['Training location', lead.training_location], ['Session length', lead.session_length],
    ['Movement concern', lead.movement_limitation]
  ].filter(([, value]) => value != null && String(value).trim())
    .map(([label, value]) => `${label}: ${String(value).trim().slice(0, 150)}`);

  // The existing Apps Script writes into the legacy Fitness Leads columns.
  // Store newer intake details in its free-text joining_reason column as well.
  const payload = {
    ...lead,
    submission_id: submissionId,
    full_name: String(lead.full_name).trim().replace(/^([=+\-@])/, "'$1"),
    // The Apps Script uses appendRow; the apostrophe keeps +country codes as text.
    contact_number: `'${number}`,
    submitted_at: new Date().toISOString(),
    joining_reason: details.join(' | '),
    primary_goal: String(lead.primary_goal || '').replace(/^([=+\-@])/, "'$1"),
    source: lead.source || 'fitness_plan_checkin'
  };

  try {
    const response = await fetch(sheetReceiver, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000)
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true || result.saved !== true || result.submission_id !== submissionId) {
      console.error('FebFit lead receiver did not confirm save', response.status, result.error || 'unconfirmed');
      return Response.json({ ok: false, error: 'Your enquiry could not be saved. Please try again.' }, { status: 502 });
    }
    return Response.json({ ok: true, saved: true, submission_id: submissionId });
  } catch (error) {
    console.error('FebFit lead receiver unavailable', error.message);
    return Response.json({ ok: false, error: 'Your enquiry could not be saved. Please try again.' }, { status: 502 });
  }
}
