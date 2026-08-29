const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const ALLOWED_DOMAINS = ["assets.weddingsaas.id","walimatul.id","web.galeriundanganofficial.com","cdnjs.cloudflare.com","cdn.jsdelivr.net"]; //[cite: 1]
const IMAGE_EXTENSIONS = []; //[cite: 1]
// Contoh HTML yang berisi gambar, CSS, JS, font, audio, hingga video
const htmlContent = `
<!-- Versi ukuran penuh (864w) -->
<img fetchpriority="high" decoding="async" width="864" height="512" src="https://web.galeriundanganofficial.com/wp-content/uploads/2025/02/CARD.jpg" class="attachment-large size-large wp-image-62" alt="" sizes="(max-width: 800px) 100vw, 800px" />

<!-- Versi ukuran kecil (300w) -->
<img fetchpriority="high" decoding="async" width="300" height="178" src="https://web.galeriundanganofficial.com/wp-content/uploads/2025/02/CARD-300x178.jpg" class="attachment-large size-large wp-image-62" alt="" sizes="(max-width: 800px) 100vw, 800px" />

<!-- Versi ukuran sedang (768w) -->
<img fetchpriority="high" decoding="async" width="768" height="455" src="https://web.galeriundanganofficial.com/wp-content/uploads/2025/02/CARD-768x455.jpg" class="attachment-large size-large wp-image-62" alt="" sizes="(max-width: 800px) 100vw, 800px" />
<!-- CSS (Tag Link) -->
<link rel="stylesheet" href="https://web.galeriundanganofficial.com/wp-content/plugins/elementor/assets/css/widget-counter.min.css?ver=3.27.1">
<link rel="stylesheet" href="https://web.galeriundanganofficial.com/wp-content/plugins/elementor/assets/css/widget-icon-box.min.css?ver=3.27.1">
<link rel="stylesheet" href="https://web.galeriundanganofficial.com/wp-content/plugins/elementor/assets/lib/animations/styles/e-animation-grow.min.css?ver=3.27.1">

<!-- Gambar (Tag Img) -->
<img src="https://web.galeriundanganofficial.com/wp-content/uploads/2025/02/CARD.jpg" alt="">
<img src="https://web.galeriundanganofficial.com/wp-content/uploads/2025/02/cHIP.png" alt="">
<img src="https://web.galeriundanganofficial.com/wp-content/uploads/2025/02/background-8-1.jpg" alt="">
<img src="https://web.galeriundanganofficial.com/wp-content/uploads/2025/03/17580-scaled-1.jpg" alt="">
<img src="https://web.galeriundanganofficial.com/wp-content/uploads/2025/02/CARD.jpg" alt="">

<!-- JavaScript (Tag Script) -->
<script src="https://web.galeriundanganofficial.com/wp-content/plugins/elementor/assets/lib/jquery-numerator/jquery-numerator.min.js?ver=0.2.1"></script>

<!-- Font (Tag Link Preload) -->
<link rel="preload" href="https://web.galeriundanganofficial.com/wp-content/uploads/useanyfont/5663robertson.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="https://web.galeriundanganofficial.com/wp-content/uploads/useanyfont/5663robertson.woff" as="font" type="font/woff" crossorigin>

<!-- Audio (.mp3) -->
<audio src="https://web.galeriundanganofficial.com/wp-content/uploads/2025/03/Matthew-Ifield-I-Think-They-Call-This-Love-Cover.mp3" controls></audio>

`;

// Fungsi untuk mengunduh file (mendukung file besar via streaming)[cite: 1]
const downloadFile = (fileUrl, outputPath) => {
    return new Promise((resolve, reject) => {
        const protocol = fileUrl.startsWith('https') ? https : http; //[cite: 1]

        protocol.get(fileUrl, (response) => {
            // Tangani redirect (status 301/302)[cite: 1]
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                const redirectUrl = new URL(response.headers.location, fileUrl).href; //[cite: 1]
                return downloadFile(redirectUrl, outputPath).then(resolve).catch(reject); //[cite: 1]
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Gagal mengunduh: ${fileUrl} (Status: ${response.statusCode})`)); //[cite: 1]
                return;
            }

            // Buat direktori tujuan jika belum ada[cite: 1]
            const dir = path.dirname(outputPath.split("?")[0]); //[cite: 1]
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true }); //[cite: 1]
            }

            const fileStream = fs.createWriteStream(outputPath); //[cite: 1]
            response.pipe(fileStream); //[cite: 1]

            fileStream.on('finish', () => {
                fileStream.close(); //[cite: 1]
                console.log(`-> Berhasil Disimpan: ${outputPath}`); //[cite: 1]
                resolve(); //[cite: 1]
            });

            fileStream.on('error', (err) => {
                fs.unlink(outputPath, () => {}); // Hapus file jika gagal/korup[cite: 1]
                reject(err); //[cite: 1]
            });
        }).on('error', (err) => {
            reject(err); //[cite: 1]
        });
    });
};

async function processAssets() {



    // Regex untuk mendeteksi atribut src, href, atau poster di berbagai tag[cite: 1]
    const regex = /\b(?:href|src|value|poster)=['"]([^'"]+)['"]/g; //[cite: 1]
    let match; //[cite: 1]
    const links = new Set(); //[cite: 1]

    // Daftar domain yang diizinkan[cite: 1]
    
    
    // Daftar ekstensi gambar yang DILARANG[cite: 1]
    

    while ((match = regex.exec(htmlContent)) !== null) { //[cite: 1]
        const rawUrl = match[1]; //[cite: 1]
        
        if (!rawUrl || rawUrl.startsWith('#') || rawUrl.startsWith('javascript:')) { //[cite: 1]
            continue; //[cite: 1]
        }

        try {
            const absoluteUrl = new URL(rawUrl); //[cite: 1]

            // --- FILTER DOMAIN ---
            // Cek apakah hostname dari URL termasuk dalam daftar ALLOWED_DOMAINS[cite: 1]
            if (!ALLOWED_DOMAINS.includes(absoluteUrl.hostname)) { //[cite: 1]
                continue; //[cite: 1]
            }

            // --- FILTER LARANG URL GAMBAR ---
            // Ambil ekstensi file dari pathname (mengabaikan query string seperti ?v=1)[cite: 1]
            const ext = path.extname(absoluteUrl.pathname).toLowerCase(); //[cite: 1]
            
            // JIKA ekstensi TERMASUK gambar, maka LEWATI (Larang Gambar)[cite: 1]
            if (IMAGE_EXTENSIONS.includes(ext)) { //[cite: 1]
                continue; //[cite: 1]
            }

            links.add(absoluteUrl.href); //[cite: 1]
        } catch (e) {
            console.error(`URL tidak valid: ${rawUrl}`); //[cite: 1]
        }
    }

    const uniqueLinks = Array.from(links); //[cite: 1]
    console.log(`Ditemukan ${uniqueLinks.length} aset dari domain yang diizinkan (selain gambar). Memulai proses unduh...\n`); //[cite: 1]

    for (const link of uniqueLinks) { //[cite: 1]
        try {
            const parsedUrl = new URL(link); //[cite: 1]
            const relativePath = parsedUrl.pathname.replace(/^\/+/, ''); //[cite: 1]
            
            if (!relativePath) continue; //[cite: 1]

            // --- MODIFIKASI: BUAT FOLDER DARI NAMA DOMAIN ---
            // Ubah misal 'web.galeriundanganofficial.com' menjadi 'web-galeriundanganofficial-com'
            const domainFolder = parsedUrl.hostname.replace(/\./g, '-');
            
            // Masukkan nama folder domain ke dalam struktur destinasi file
            const outputPath = path.join(process.cwd(), domainFolder, relativePath);

            console.log(`Mengunduh: ${link}`); //[cite: 1]
            await downloadFile(link, outputPath); //[cite: 1]
        } catch (error) {
            console.error(`Error pada link ${link}:`, error.message); //[cite: 1]
        }
        console.log('-----------------------------------'); //[cite: 1]
    }

    console.log('Semua proses unduh selesai!'); //[cite: 1]
}

processAssets(); //[cite: 1]



const fetchOptions = {
  "headers": {
    "accept": "text/css,*/*;q=0.1",
    "accept-language": "id,en;q=0.9",
    "priority": "u=4",
    "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "style",
    "sec-fetch-mode": "no-cors",
    "sec-fetch-site": "same-site",
    "cookie": "__stripe_mid=b5dee904-ec43-4940-b2a2-9757707209d912dfcf; __stripe_sid=25e99ef8-26f2-428f-bb6d-cf8bdf934021b67382; ph_phc_vqJhC8Gur3e5hySKKsNdlhHsHeDna2K1fxalCezayql_posthog=%7B%22%24device_id%22%3A%2201a0301b-1d7a-76bc-a844-b89c60dd4961%22%2C%22distinct_id%22%3A%2212066571%22%2C%22%24sesid%22%3A%5B1787513998954%2C%2201a0301b-20c3-7838-abf5-3fa514714650%22%2C1787513479361%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%2C%22u%22%3A%22https%3A%2F%2Ffontawesome.com%2Fdownload%22%7D%7D",
    "Referer": "https://fontawesome.com/"
  },
  "body": null,
  "method": "GET"
};

// Hanya daftar CSS saja. Font akan dicari secara dinamis!
const cssUrls = [
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/fontawesome.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/solid.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/duotone-thin.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/mosaic-solid.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/sharp-light.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/slab-press-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/whiteboard-semibold.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/utility-duo-semibold.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/notdog-solid.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/etch-solid.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/slab-press-duo-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/pixel-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/sharp-duotone-light.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/duotone-light.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/graphite-thin.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/vellum-solid.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/slab-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/slab-duo-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/thin.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/brands.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/jelly-duo-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/utility-fill-semibold.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/light.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/sharp-solid.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/jelly-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/sharp-duotone-solid.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/utility-semibold.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/duotone.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/notdog-duo-solid.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/sharp-thin.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/sharp-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/thumbprint-light.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/jelly-fill-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/duotone-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/chisel-regular.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/sharp-duotone-thin.css",
  "https://site-assets.fontawesome.com/releases/v7.3.1/css/sharp-duotone-regular.css"
];

async function main() {
  let combinedCSS = "";
  const fontUrls = new Set(); // Menyimpan URL font agar tidak duplikat
  let cssTargetFolder = "";

  try {
    console.log("=== TAHAP 1: Mengunduh CSS & Mendeteksi Font ===");
    
    for (const url of cssUrls) {
      console.log(`Mengunduh: ${url}`);
      const response = await fetch(url, fetchOptions);
      if (!response.ok) throw new Error(`Gagal! Status: ${response.status}`);

      // Ambil isinya sebagai teks
      const cssContent = await response.text();

      // Buat path penyimpanan CSS individu (opsional tapi bagus untuk kerapian)
      const parsedUrl = new URL(url);
      const hostFolder = parsedUrl.hostname.replace(/\./g, '-'); 
      const urlPath = parsedUrl.pathname; 
      const fullLocalPath = path.join(__dirname, hostFolder, urlPath);
      const dirPath = path.dirname(fullLocalPath);
      
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(fullLocalPath, cssContent);

      // Simpan path folder CSS untuk lokasi file all.css nanti
      if (!cssTargetFolder) cssTargetFolder = dirPath;

      // Gabungkan isi CSS
      combinedCSS += `/* --- Bagian dari file: ${path.basename(fullLocalPath)} --- */\n`;
      combinedCSS += cssContent.replace("/*!","/*") + "\n\n";

      // Deteksi URL Font di dalam CSS ini
      const urlRegex = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
      let match;
      while ((match = urlRegex.exec(cssContent)) !== null) {
        const assetUrl = match[2];
        
        // Lewati jika format base64
        if (assetUrl.startsWith('data:')) continue;

        // Jadikan URL absolut (menggabungkan relative path font dengan link CSS)
        const absoluteUrl = new URL(assetUrl, url).href;
        fontUrls.add(absoluteUrl);
      }
    }

    console.log("\n=== TAHAP 2: Membuat file all.css ===");
    if (combinedCSS && cssTargetFolder) {
      const allCssPath = path.join(cssTargetFolder, 'all.css');
      fs.writeFileSync(allCssPath, combinedCSS);
      console.log(`Berhasil! File gabungan disimpan di: ${allCssPath}`);
    }

    console.log(`\n=== TAHAP 3: Mengunduh Aset Font (${fontUrls.size} file terdeteksi) ===`);
    for (const fontUrl of fontUrls) {
      console.log(`Mengunduh font: ${fontUrl}`);
      const res = await fetch(fontUrl, fetchOptions);
      
      if (!res.ok) {
        console.error(` -> [Gagal] Status HTTP: ${res.status}`);
        continue;
      }

      // Format path font
      const pUrl = new URL(fontUrl);
      const hFolder = pUrl.hostname.replace(/\./g, '-');
      // Gunakan pathname agar bersih dari query parameters (seperti ?v=7.3.1)
      const uPath = pUrl.pathname; 
      
      const fontLocalPath = path.join(__dirname, hFolder, uPath);
      const fontDirPath = path.dirname(fontLocalPath);

      if (!fs.existsSync(fontDirPath)) fs.mkdirSync(fontDirPath, { recursive: true });

      // Simpan font
      const arrayBuffer = await res.arrayBuffer();
      fs.writeFileSync(fontLocalPath, Buffer.from(arrayBuffer));
      console.log(` -> Tersimpan: ${fontLocalPath}`);
    }

    console.log("\nSELESAI! Seluruh CSS terunduh, digabungkan, dan font pendukungnya otomatis diposisikan dengan benar.");

  } catch (error) {
    console.error("\n[FATAL ERROR]:", error.message);
  }
}

