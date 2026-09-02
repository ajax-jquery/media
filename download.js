const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const ALLOWED_DOMAINS = ["library.eltemplate.vip", "undanganhub.com","walimatul.id","web.galeriundanganofficial.com","lovelisseinvitation.my.id","zehaninv.id","rawcdn.githack.com"];////[cite: 3]
const IMAGE_EXTENSIONS = [];////[cite: 3]

// Contoh HTML yang berisi gambar, CSS, JS, font, audio, hingga video
const htmlContent = `


<div class="grid-container" id="gallery"><div class="card"><img src="https://rawcdn.githack.com/ajax-jquery/undanganhub-assets/1f22576063e9e4ff84eb89eb969177ac701a5208/sampel/cover/blue-serenade-basic.png" alt="blue-serenade-basic.png" loading="lazy"><div class="btn-container"><button class="btn-copy">Salin Link</button></div></div><div class="card"><img src="https://rawcdn.githack.com/ajax-jquery/undanganhub-assets/1f22576063e9e4ff84eb89eb969177ac701a5208/sampel/cover/blue-serenade.png" alt="blue-serenade.png" loading="lazy"><div class="btn-container"><button class="btn-copy">Salin Link</button></div></div><div class="card"><img src="https://rawcdn.githack.com/ajax-jquery/undanganhub-assets/1f22576063e9e4ff84eb89eb969177ac701a5208/sampel/cover/bugis-rojos-2026.png" alt="bugis-rojos-2026.png" loading="lazy"><div class="btn-container"><button class="btn-copy">Salin Link</button></div></div><div class="card"><img src="https://rawcdn.githack.com/ajax-jquery/undanganhub-assets/1f22576063e9e4ff84eb89eb969177ac701a5208/sampel/cover/flora-green.png" alt="flora-green.png" loading="lazy"><div class="btn-container"><button class="btn-copy">Salin Link</button></div></div><div class="card"><img src="https://rawcdn.githack.com/ajax-jquery/undanganhub-assets/1f22576063e9e4ff84eb89eb969177ac701a5208/sampel/cover/galactic-ruins.png" alt="galactic-ruins.png" loading="lazy"><div class="btn-container"><button class="btn-copy">Salin Link</button></div></div><div class="card"><img src="https://rawcdn.githack.com/ajax-jquery/undanganhub-assets/1f22576063e9e4ff84eb89eb969177ac701a5208/sampel/cover/gold-2026.png" alt="gold-2026.png" loading="lazy"><div class="btn-container"><button class="btn-copy">Salin Link</button></div></div><div class="card"><img src="https://rawcdn.githack.com/ajax-jquery/undanganhub-assets/1f22576063e9e4ff84eb89eb969177ac701a5208/sampel/cover/jawa-red.png" alt="jawa-red.png" loading="lazy"><div class="btn-container"><button class="btn-copy">Salin Link</button></div></div><div class="card"><img src="https://rawcdn.githack.com/ajax-jquery/undanganhub-assets/1f22576063e9e4ff84eb89eb969177ac701a5208/sampel/cover/obsidian-elegance.png" alt="obsidian-elegance.png" loading="lazy"><div class="btn-container"><button class="btn-copy">Salin Link</button></div></div><div class="card"><img src="https://rawcdn.githack.com/ajax-jquery/undanganhub-assets/1f22576063e9e4ff84eb89eb969177ac701a5208/sampel/cover/suci-2026.png" alt="suci-2026.png" loading="lazy"><div class="btn-container"><button class="btn-copy">Salin Link</button></div></div></div>

`;

// Fungsi untuk mengunduh file (mendukung file besar via streaming)//[cite: 3]
const downloadFile = (fileUrl, outputPath) => {
    return new Promise((resolve, reject) => {
        const protocol = fileUrl.startsWith('https') ? https : http;////[cite: 3]

        protocol.get(fileUrl, (response) => {
            // Tangani redirect (status 301/302)//[cite: 3]
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                const redirectUrl = new URL(response.headers.location, fileUrl).href;////[cite: 3]
                return downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);////[cite: 3]
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Gagal mengunduh: ${fileUrl} (Status: ${response.statusCode})`));////[cite: 3]
                return;
            }

            // Buat direktori tujuan jika belum ada//[cite: 3]
            const dir = path.dirname(outputPath.split("?")[0]);////[cite: 3]
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });////[cite: 3]
            }

            const fileStream = fs.createWriteStream(outputPath);////[cite: 3]
            response.pipe(fileStream);//[cite: 3]

            fileStream.on('finish', () => {
                fileStream.close();//[cite: 3]
                console.log(`-> Berhasil Disimpan: ${outputPath}`);//////[cite: 3]
                resolve();//[cite: 3]
            });

            fileStream.on('error', (err) => {
                fs.unlink(outputPath, () => {}); // Hapus file jika gagal/korup//[cite: 3]
                reject(err);//[cite: 3]
            });
        }).on('error', (err) => {
            reject(err);//[cite: 3]
        });
    });
};

async function processAssets() {
    // Regex BARU: Mendeteksi atribut href, src, value, poster DAN url(...) di CSS/Style
    // Menangkap link di dalam tanda kutip tunggal, ganda, atau tanpa kutip (untuk url())
    const regex = /(?:(?:href|src|value|poster)=['"]([^'"]+)['"])|(?:url\(['"]?([^'"\)]+)['"]?\))/g; 
    let match;//[cite: 3]
    const links = new Set();//[cite: 3]

    while ((match = regex.exec(htmlContent)) !== null) {//[cite: 3]
        // match[1] akan menangkap URL dari href/src/value/poster
        // match[2] akan menangkap URL dari dalam url()
        const rawUrl = match[1] || match[2]; 
        
        if (!rawUrl || rawUrl.startsWith('#') || rawUrl.startsWith('javascript:') || rawUrl.startsWith('data:')) { 
            continue;//[cite: 3]
        }

        try {
            const absoluteUrl = new URL(rawUrl);//[cite: 3]

            // --- FILTER DOMAIN ---
            // Cek apakah hostname dari URL termasuk dalam daftar ALLOWED_DOMAINS//[cite: 3]
            if (!ALLOWED_DOMAINS.includes(absoluteUrl.hostname)) {//[cite: 3]
                continue;//[cite: 3]
            }

            // --- FILTER LARANG URL GAMBAR ---
            // Ambil ekstensi file dari pathname (mengabaikan query string seperti ?v=1)//[cite: 3]
            const ext = path.extname(absoluteUrl.pathname).toLowerCase();//[cite: 3]
            
            // JIKA ekstensi TERMASUK gambar, maka LEWATI (Larang Gambar)//[cite: 3]
            if (IMAGE_EXTENSIONS.includes(ext)) {//[cite: 3]
                continue;//[cite: 3]
            }

            links.add(absoluteUrl.href);//[cite: 3]
        } catch (e) {
            console.error(`URL tidak valid: ${rawUrl}`);//[cite: 3]
        }
    }

    const uniqueLinks = Array.from(links);//[cite: 3]
    console.log(`Ditemukan ${uniqueLinks.length} aset dari domain yang diizinkan (selain gambar). Memulai proses unduh...\n`);//[cite: 3]

    for (const link of uniqueLinks) {
        try {
            const parsedUrl = new URL(link);
            let relativePath = parsedUrl.pathname.replace(/^\/+/, '');
            
            // 1. Jika URL hanya berupa nama domain (path kosong)
            if (!relativePath) {
                relativePath = 'index.html';
            } 
            // 2. Jika URL tidak memiliki ekstensi (mencegah error ENOTDIR)
            // path.extname akan mengembalikan string kosong '' jika tidak ada ekstensi seperti .jpg, .css
            else if (path.extname(relativePath) === '') {
                // Hilangkan garis miring di akhir (jika ada), lalu tambahkan /index.html
                relativePath = relativePath.replace(/\/$/, '') + '/index.html';
            }

            // --- BUAT FOLDER DARI NAMA DOMAIN ---
            const domainFolder = parsedUrl.hostname.replace(/\./g, '-');
            const outputPath = path.join(process.cwd(), domainFolder, relativePath);

            console.log(`Mengunduh: ${link}`);
            await downloadFile(link, outputPath);
        } catch (error) {
            console.error(`Error pada link ${link}:`, error.message);
        }
        console.log('-----------------------------------');
    }

    console.log('Semua proses unduh selesai!');//[cite: 3]
}

processAssets();//[cite: 3]