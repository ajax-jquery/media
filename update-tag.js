const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path target sesuai dengan struktur direktori kamu
const TARGET_PATH = path.resolve(__dirname, '../undangan/functions/config.js');

function updateConfigByTag() {
  try {
    console.log('Mengecek tag dan perubahan direktori lokal...');

    // 1. Ambil Git Tag terbaru dari repository lokal
    let latestTag = 'v1.0.0';
    try {
      latestTag = execSync('git describe --tags --abbrev=0').toString().trim();
    } catch (e) {
      console.log('Belum ada tag yang ditemukan, menggunakan default: v1.0.0');
    }
    console.log(`Tag terbaru: ${latestTag}`);

    // 2. Deteksi file/folder apa saja yang berubah di commit terakhir
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD').toString().trim().split('\n');
    
    // 3. Deteksi otomatis folder "tema" yang berubah menggunakan Regex
    const changedThemes = new Set();
    changedFiles.forEach(file => {
      // Mencocokkan awalan "tema" yang diikuti angka (misal: tema00, tema03)
      const match = file.match(/^(tema\d+)\//); 
      if (match) {
        changedThemes.add(match[1]);
      }
    });

    if (changedThemes.size === 0) {
      console.log('Tidak ada perubahan pada folder tema di commit terakhir.');
      return; // Berhenti jika tidak ada folder tema yang berubah
    }

    // 4. Baca config.js yang sudah ada
    let currentConfig = {};
    if (fs.existsSync(TARGET_PATH)) {
      currentConfig = require(TARGET_PATH);
    }

    // 5. Perbarui nilai tag secara dinamis hanya untuk tema yang berubah
    changedThemes.forEach(tema => {
      currentConfig[tema] = latestTag;
      console.log(`-> Update terdeteksi pada ${tema}. Menerapkan tag...`);
    });

    // 6. Tulis ulang file config.js (diurutkan berdasarkan abjad agar rapi)
    let fileContent = 'module.exports = {\n';
    Object.keys(currentConfig).sort().forEach(key => {
      fileContent += `  "${key}": "${currentConfig[key]}",\n`;
    });
    fileContent += '};\n';

    fs.writeFileSync(TARGET_PATH, fileContent, 'utf8');
    console.log(`Berhasil! File ${TARGET_PATH} telah diperbarui dengan Tag.`);

  } catch (error) {
    console.error('Terjadi kesalahan:', error.message);
  }
}

updateConfigByTag();