const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const ALLOWED_DOMAINS = ["assets.weddingsaas.id","walimatul.id","web.galeriundanganofficial.com","cdnjs.cloudflare.com","cdn.jsdelivr.net"]; //[cite: 1]
const IMAGE_EXTENSIONS = []; //[cite: 1]
// Contoh HTML yang berisi gambar, CSS, JS, font, audio, hingga video
const htmlContent = `
<!-- CSS (Tag Link) -->
<link rel="stylesheet" href="https://walimatul.id/wp-includes/css/dist/block-library/style.min.css?ver=7.1">
<link rel="stylesheet" href="https://walimatul.id/wp-includes/css/dashicons.min.css?ver=7.1">
<link rel="stylesheet" href="https://walimatul.id/wp-includes/css/editor.min.css?ver=7.1">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/jetformbuilder/modules/wysiwyg/assets/build/wysiwyg.css?ver=ec5ee578c1142cfd608f">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/weddingsaas-pro/assets/css/wds-elementor.css?ver=2.10.2">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/weddingsaas-pro/assets/plugins/custom/commentpress/saic_style.css?ver=2.10.2">
<link rel="stylesheet" href="https://walimatul.id/wp-content/themes/hello-elementor/style.css?ver=7.1">
<link rel="stylesheet" href="https://walimatul.id/wp-content/themes/walimatul-id/style.css?ver=7.1">
<link rel="stylesheet" href="https://walimatul.id/wp-content/themes/hello-elementor/assets/css/reset.css?ver=3.4.9">
<link rel="stylesheet" href="https://walimatul.id/wp-content/themes/hello-elementor/assets/css/theme.css?ver=3.4.9">
<link rel="stylesheet" href="https://walimatul.id/wp-content/themes/hello-elementor/assets/css/header-footer.css?ver=3.4.9">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/frontend.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/css/post-6.css?ver=1787906916">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/jetformbuilder/modules/option-field/assets/build/select.css?ver=23f0a66d9ec9a070c2dd">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/jetformbuilder/modules/option-field/assets/build/checkbox.css?ver=0a3ef3c1811be5626bbd">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/jetformbuilder/modules/option-field/assets/build/radio.css?ver=1526c067231cd47c97eb">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/jetformbuilder/modules/advanced-choices/assets/build/main.css?ver=ffb76854f41cac80abe5">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/jetformbuilder/modules/switcher/assets/build/switcher.css?ver=7c291d04aeede881ef68">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/jetformbuilder/modules/multi-gateway/assets/build/multi-gateway.css?ver=47bf27f09045105a3c5d">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/widget-image.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor-pro/assets/css/widget-nav-menu.min.css?ver=4.2.2">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/widget-social-icons.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/conditionals/apple-webkit.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/widget-heading.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/widget-icon-list.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css?ver=8.4.5">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/conditionals/e-swiper.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor-pro/assets/css/widget-gallery.min.css?ver=4.2.2">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/lib/e-gallery/css/e-gallery.min.css?ver=1.2.0">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor-pro/assets/css/conditionals/transitions.min.css?ver=4.2.2">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor-pro/assets/css/modules/sticky.min.css?ver=4.2.2">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/lib/animations/styles/zoomIn.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor-pro/assets/css/widget-lottie.min.css?ver=4.2.2">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/widget-spacer.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor-pro/assets/css/widget-countdown.min.css?ver=4.2.2">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/widget-icon-box.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/widget-google_maps.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/widget-video.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/css/widget-divider.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInUp.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInDown.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/lib/animations/styles/e-animation-grow.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/plugins/elementor/assets/lib/animations/styles/fadeIn.min.css?ver=4.2.3">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/css/post-2469.css?ver=1787906916">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/css/post-2473.css?ver=1787906916">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/css/post-4965.css?ver=1787906980">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/google-fonts/css/cormorant.css?ver=1742706129">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/google-fonts/css/jost.css?ver=1745253778">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/google-fonts/css/outfit.css?ver=1742664699">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/google-fonts/css/poppins.css?ver=1742715068">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/google-fonts/css/cormorantgaramond.css?ver=1751688916">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/google-fonts/css/pinyonscript.css?ver=1742716065">
<link rel="stylesheet" href="https://walimatul.id/wp-content/uploads/elementor/google-fonts/css/quicksand.css?ver=1751779396">

<!-- JavaScript (Tag Script) -->
<script src="https://walimatul.id/wp-includes/js/jquery/jquery.min.js?ver=3.7.1"></script>
<script src="https://walimatul.id/wp-includes/js/jquery/jquery-migrate.min.js?ver=3.4.1"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor/assets/lib/font-awesome/js/v4-shims.min.js?ver=4.2.3"></script>
<script src="https://walimatul.id/wp-content/plugins/weddingsaas-pro/assets/plugins/custom/commentpress/saic_lib.js?ver=2.10.2"></script>
<script src="https://walimatul.id/wp-content/plugins/weddingsaas-pro/assets/js/wds-rsvp.js?ver=2.10.2"></script>
<script src="https://walimatul.id/wp-content/themes/hello-elementor/assets/js/hello-frontend.js?ver=3.4.9"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js?ver=4.2.3"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor/assets/js/frontend-modules.min.js?ver=4.2.3"></script>
<script src="https://walimatul.id/wp-includes/js/jquery/ui/core.min.js?ver=1.14.2"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor/assets/js/frontend.min.js?ver=4.2.3"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor-pro/assets/lib/smartmenus/jquery.smartmenus.min.js?ver=1.2.1"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js?ver=8.4.5"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor/assets/lib/e-gallery/js/e-gallery.min.js?ver=1.2.0"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor-pro/assets/lib/sticky/jquery.sticky.min.js?ver=4.2.2"></script>
<script src="https://walimatul.id/wp-content/plugins/weddingsaas-pro/assets/js/wds-elementor-audio.js?ver=2.10.2"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor-pro/assets/lib/lottie/lottie.min.js?ver=5.6.6"></script>
<script src="https://walimatul.id/wp-content/plugins/google-site-kit/dist/assets/js/googlesitekit-events-provider-content-events-33078016c5e1e9f07c35.js"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor-pro/assets/js/webpack-pro.runtime.min.js?ver=4.2.2"></script>
<script src="https://walimatul.id/wp-includes/js/dist/hooks.min.js?ver=f0f188028580e8dc1255"></script>
<script src="https://walimatul.id/wp-includes/js/dist/i18n.min.js?ver=1dfe7db3940c23ea9216"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor-pro/assets/js/frontend.min.js?ver=4.2.2"></script>
<script src="https://walimatul.id/wp-content/plugins/elementor-pro/assets/js/elements-handlers.min.js?ver=4.2.2"></script>
<script src="https://walimatul.id/wp-includes/js/wp-emoji-release.min.js?ver=7.1"></script>

<!-- Gambar (Tag Img) -->
<img src="https://walimatul.id/wp-content/uploads/2026/05/Garden-05-Couple-2.webp" alt="">
<img src="https://walimatul.id/wp-content/uploads/2026/05/Garden-05-Couple-1.webp" alt="">
<img src="https://walimatul.id/wp-content/uploads/2026/05/Garden-05-Bouquet-1.webp" alt="">
<img src="https://walimatul.id/wp-content/uploads/2026/04/chip-atm-1-2-4.webp" alt="">
<!-- Catatan: Anda memberikan link couple 1 dan couple 2 dua kali di akhir daftar, saya sertakan tagnya sesuai daftar yang Anda berikan -->
<img src="https://walimatul.id/wp-content/uploads/2026/05/Garden-05-Couple-1.webp" alt="">
<img src="https://walimatul.id/wp-content/uploads/2026/05/Garden-05-Couple-2.webp" alt="">

<!-- Audio (Tag Audio) -->
<audio src="https://walimatul.id/wp-content/uploads/2026/04/Joe-Hisaishi-Merry-Go-Round-of-Life-from-Howls-Moving-Castle-1.mp3" controls></audio>

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

