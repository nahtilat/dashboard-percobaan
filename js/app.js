const $ = id => document.getElementById(id);
let allData = [], lastHash = '', chart = null, editingId = null;

// ---------- Status ----------
function setStatus(text, cls = '') { const s = $('status'); s.textContent = text; s.className = cls; }

// ---------- Ambil data (dipanggil berkala) ----------
async function refresh() {
  try {
    const data = await api.list();
    const hash = JSON.stringify(data);
    if (hash !== lastHash) { lastHash = hash; allData = data; render(); }
    setStatus('Live • update terakhir ' + new Date().toLocaleTimeString('id-ID'), 'live');
  } catch (e) {
    console.error(e);
    setStatus('Gagal terhubung', 'err');
  }
}

// ---------- Tampilan ----------
function fmtDate(v) {
  const d = new Date(v);
  return isNaN(d) ? '' : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function filtered() {
  const q = $('search').value.trim().toLowerCase();
  const k = $('filter').value;
  return allData.filter(r =>
    (!q || String(r.nama).toLowerCase().includes(q)) && (!k || r.kategori === k));
}

function render() {
  // statistik
  const sum = allData.reduce((a, r) => a + Number(r.jumlah || 0), 0);
  const byCat = {};
  allData.forEach(r => byCat[r.kategori] = (byCat[r.kategori] || 0) + Number(r.jumlah || 0));
  $('sCount').textContent = allData.length;
  $('sSum').textContent = sum.toLocaleString('id-ID');
  $('sCat').textContent = Object.keys(byCat).length;
  $('sAvg').textContent = allData.length ? Math.round(sum / allData.length).toLocaleString('id-ID') : 0;

  // tabel
  const rows = filtered();
  const tbody = $('rows');
  tbody.innerHTML = '';
  $('empty').hidden = rows.length > 0;
  rows.forEach(r => {
    const tr = document.createElement('tr');
    [r.nama, r.kategori, Number(r.jumlah).toLocaleString('id-ID'), fmtDate(r.tanggal)].forEach(t => {
      const td = document.createElement('td'); td.textContent = t; tr.appendChild(td);
    });
    const act = document.createElement('td'); act.className = 'act';
    const bEdit = btn('Ubah', 'ghost small', () => openEdit(r));
    const bDel  = btn('Hapus', 'del small', () => onDelete(r, bDel));
    act.append(bEdit, bDel); tr.appendChild(act);
    tbody.appendChild(tr);
  });

  // grafik
  const labels = Object.keys(byCat), values = Object.values(byCat);
  if (chart) { chart.data.labels = labels; chart.data.datasets[0].data = values; chart.update(); }
  else {
    chart = new Chart($('chart'), {
      type: 'bar',
      data: { labels, datasets: [{ data: values, backgroundColor: '#2563eb', borderRadius: 6 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
}

function btn(text, cls, onclick) {
  const b = document.createElement('button');
  b.textContent = text; b.className = cls; b.onclick = onclick; return b;
}

// ---------- Aksi ----------
async function run(button, fn) {
  if (button) button.disabled = true;
  setStatus('Menyimpan…');
  try { await fn(); await refresh(); }
  catch (e) { alert(e.message); setStatus('Gagal menyimpan', 'err'); }
  finally { if (button) button.disabled = false; }
}

$('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  run(form.querySelector('button'), async () => {
    await api.add({ nama: $('fNama').value.trim(), kategori: $('fKategori').value, jumlah: $('fJumlah').value });
    form.reset();
  });
});

function onDelete(r, button) {
  if (confirm(`Hapus "${r.nama}"?`)) run(button, () => api.remove(r.id));
}

function openEdit(r) {
  editingId = r.id;
  $('eNama').value = r.nama; $('eKategori').value = r.kategori; $('eJumlah').value = r.jumlah;
  $('editDialog').showModal();
}
$('eCancel').onclick = () => $('editDialog').close();
$('editForm').addEventListener('submit', () => {
  run(null, () => api.update({
    id: editingId, nama: $('eNama').value.trim(), kategori: $('eKategori').value, jumlah: $('eJumlah').value
  }));
});

$('search').addEventListener('input', render);
$('filter').addEventListener('change', render);

// ---------- Mulai ----------
[$('fKategori'), $('eKategori'), $('filter')].forEach(el =>
  KATEGORI.forEach(k => el.add(new Option(k, k))));

if (API_URL.startsWith('PASTE_')) {
  $('note').style.display = 'block';
  setStatus('API_URL belum diisi', 'err');
} else {
  refresh();
  setInterval(refresh, REFRESH_MS);
}
