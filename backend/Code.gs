/**
 * BACKEND: Google Apps Script
 * Mengubah Google Spreadsheet menjadi API sederhana (baca, tambah, ubah, hapus).
 *
 * Sheet bernama "Data" dengan header di baris 1:
 * id | nama | kategori | jumlah | tanggal
 */

const SHEET_NAME = 'Data';

function getSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// BACA semua data -> dipanggil website lewat fetch(GET)
function doGet() {
  const values = getSheet_().getDataRange().getValues();
  const headers = values.shift();
  const rows = values
    .filter(r => r[0] !== '')
    .map(r => {
      const o = {};
      headers.forEach((h, i) => (o[h] = r[i]));
      return o;
    });
  return json_({ ok: true, data: rows });
}

// TAMBAH / UBAH / HAPUS -> dipanggil website lewat fetch(POST)
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    if (body.action === 'add') {
      sheet.appendRow([
        Utilities.getUuid(),
        body.nama,
        body.kategori,
        Number(body.jumlah),
        new Date()
      ]);
      return json_({ ok: true });
    }

    // cari baris berdasarkan id (kolom A)
    const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().flat();
    const rowIndex = ids.indexOf(body.id) + 1; // +1 karena index mulai 0
    if (rowIndex < 2) return json_({ ok: false, error: 'ID tidak ditemukan' });

    if (body.action === 'update') {
      sheet.getRange(rowIndex, 2, 1, 3).setValues([[
        body.nama, body.kategori, Number(body.jumlah)
      ]]);
      return json_({ ok: true });
    }

    if (body.action === 'delete') {
      sheet.deleteRow(rowIndex);
      return json_({ ok: true });
    }

    return json_({ ok: false, error: 'Action tidak dikenal' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
