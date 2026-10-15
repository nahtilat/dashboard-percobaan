// Semua komunikasi dengan Google Sheets (lewat Apps Script) ada di sini.

async function apiGet() {
  const res = await fetch(API_URL);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Gagal membaca data');
  return json.data;
}

async function apiPost(payload) {
  // text/plain supaya browser tidak mengirim preflight CORS (Apps Script tidak mendukungnya)
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Gagal menyimpan data');
  return json;
}

const api = {
  list:   ()     => apiGet(),
  add:    (d)    => apiPost({ action: 'add', ...d }),
  update: (d)    => apiPost({ action: 'update', ...d }),
  remove: (id)   => apiPost({ action: 'delete', id })
};
