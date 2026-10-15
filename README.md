# Dashboard Percobaan (Google Sheets sebagai database)

## Struktur
- index.html, css/, js/  -> website (buka dengan Live Server di VS Code)
- backend/Code.gs        -> kode Apps Script (tempel di Google Sheet)
- database.xlsx          -> template spreadsheet (import ke Google Sheets)

## Langkah
1. Buka sheets.new -> File > Import > Upload > database.xlsx -> "Replace spreadsheet".
   Pastikan ada tab bernama "Data".
2. Extensions > Apps Script -> hapus kode bawaan -> tempel isi backend/Code.gs -> Save.
3. Deploy > New deployment > Web app. Execute as: Me, Who has access: Anyone. Deploy, salin URL (/exec).
4. Buka js/config.js, ganti API_URL dengan URL tadi.
5. Di VS Code: klik kanan index.html > Open with Live Server.

## Catatan
- Setelah mengubah Code.gs: Deploy > Manage deployments > Edit > New version.
- Kategori di dropdown diatur di js/config.js (KATEGORI).
