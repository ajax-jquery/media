const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path target sesuai dengan struktur direktori kamu
const TARGET_PATH = path.resolve(__dirname, '../undangan/functions/config.js');

function updateConfigByTag() {
  try {
    console.log('Mengecek tag dan perubahan direktori lokal...');

    // 1. Ambil Git Tag terbaru dari repository lokal
    // Jika belum pernah ada tag, otomatis menggunakan 'v1.0.0'
    let latestTag = 'v1.0.0';
    try {
      latestTag = execSync('git describe --tags --abbrev=0').toString().trim();
    } catch (e) {
      console.log('Belum ada tag yang ditemukan, menggunakan default: v1.0.0');
    }
    console.log(`Tag terbaru: ${latestTag}`);

    // 2. Deteksi file/folder apa saja yang berubah di commit terakhir
    // Menggunakan git diff dari HEAD sebelumnya ke HEAD saat ini
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD').toString().trim().split('\n');
    
    const isTema00Changed = changedFiles.some(file => file.startsWith('tema00/'));
    const isTema01Changed = changedFiles.some(file => file.startsWith('tema01/'));

    // 3. Baca config.js yang sudah ada agar data tema yang TIDAK berubah tetap aman
    let currentConfig = {};
    if (fs.existsSync(TARGET_PATH)) {
      // Meng-import objek config yang sudah ada
      currentConfig = require(TARGET_PATH);
    } else {
      // Jika file belum ada, inisialisasi dengan data kosong
      currentConfig = { tema00: "", tema01: "" };
    }

    // 4. Perbarui nilai tag JIKA folder tersebut mengalami perubahan
    let isUpdated = false;
    if (isTema00Changed) {
      currentConfig["tema00"] = latestTag;
      console.log('-> Update terdeteksi pada tema00. Menerapkan tag...');
      isUpdated = true;
    }
    if (isTema01Changed) {
      currentConfig["tema01"] = latestTag;
      console.log('-> Update terdeteksi pada tema01. Menerapkan tag...');
      isUpdated = true;
    }

    if (!isUpdated) {
      console.log('Tidak ada perubahan pada folder tema00 atau tema01 di commit terakhir.');
      return; // Berhenti jika tidak ada folder tema yang berubah
    }

    // 5. Tulis ulang file config.js
    let fileContent = 'module.exports = {\n';
    for (const [key, value] of Object.entries(currentConfig)) {
      fileContent += `  "${key}": "${value}",\n`;
    }
    fileContent += '};\n';

    fs.writeFileSync(TARGET_PATH, fileContent, 'utf8');
    console.log(`Berhasil! File ${TARGET_PATH} telah diperbarui dengan Tag.`);

  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
  }
}

updateConfigByTag();