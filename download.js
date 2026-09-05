const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const ALLOWED_DOMAINS = ["hi.inviee.id","library.eltemplate.vip", "undanganhub.com","walimatul.id","web.galeriundanganofficial.com","lovelisseinvitation.my.id","zehaninv.id","rawcdn.githack.com"];////[cite: 3]
const IMAGE_EXTENSIONS = [];////[cite: 3]

// Contoh HTML yang berisi gambar, CSS, JS, font, audio, hingga video
const htmlContent = `

<!-- CSS Links -->
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/css/modules/bdt-uikit.css?ver=3.15.1">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/css/modules/ep-helper.css?ver=3.2.1.5">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/jet-engine/assets/css/frontend.css?ver=3.8.14.3">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/eltemplate/public/css/eltemplate-public.css?ver=2.0.0">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/useanyfont/uaf.css?ver=1787245120">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/css/exad-styles.min.css?ver=7.0.4">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/css/new-icon.min.css?ver=3.2.1.5">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/themes/weddingsaas-wp/assets/css/reset.css?ver=2.1.0">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/css/wdp-copy-widget.css?ver=3.2.1.5">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/eveent/assets/css/ev-rsvp-style.css?ver=2.4.4">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/eveent/assets/css/ewf-barcode-style.css?ver=1780897927">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css?ver=5.53.0">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/css/post-1235.css?ver=1788409522">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/eltemplate/includes/widgets/css/frontend.css?ver=1">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/css/wdp.css?ver=3.2.1.5">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/css/guest-book.css?ver=3.2.1.5">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/css/post-287617.css?ver=1788409609">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/google-fonts/css/roboto.css?ver=1745682165">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/google-fonts/css/robotoslab.css?ver=1745682166">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/google-fonts/css/playfairdisplay.css?ver=1745682189">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/google-fonts/css/opensans.css?ver=1745686640">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/google-fonts/css/vidaloka.css?ver=1745686640">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/google-fonts/css/prata.css?ver=1745686641">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/google-fonts/css/cormorantinfant.css?ver=1745682187">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/eltemplate/includes/widgets/css/style.css?ver=1.0">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/eltemplate/includes/widgets/css/widget-image-box.min.css?ver=1.0">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/eltemplate/includes/widgets/css/widget-icon-box.min.css?ver=1.0">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/eltemplate/includes/widgets/css/widget-spacer.css?ver=1.0">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/plugins/eltemplate/includes/widgets/css/widget-video.css?ver=1.0">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/css/post-147102.css?ver=1788409524">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/google-fonts/css/dmsans.css?ver=1745682169">
<link rel="stylesheet" href="https://hi.inviee.id/wp-content/uploads/elementor/google-fonts/css/publicsans.css?ver=1745682170">

<!-- JavaScript Files -->
<script src="https://hi.inviee.id/wp-content/plugins/eltemplate/public/js/eltemplate-public.js?ver=2.0.0"></script>
<script src="https://hi.inviee.id/wp-includes/js/dist/vendor/react.min.js?ver=18.3.1.1"></script>
<script src="https://hi.inviee.id/wp-includes/js/dist/vendor/react-dom.min.js?ver=18.3.1.1"></script>
<script src="https://hi.inviee.id/wp-includes/js/dist/escape-html.min.js?ver=3f093e5cca67aa0f8b56"></script>
<script src="https://hi.inviee.id/wp-includes/js/dist/element.min.js?ver=15ba804677f72a8db97b"></script>
<script src="https://hi.inviee.id/wp-content/plugins/eltemplate/admin/js/license.min.js?ver=2.0.0"></script>
<script src="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/js/wdp-swiper.min.js"></script>
<script src="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/js/qr-code.js"></script>
<script src="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/js/exad-scripts.min.js?ver=3.2.1.5"></script>
<script src="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/js/license.min.js?ver=3.2.1.5"></script>
<script src="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/js/wdp-copy-widget.js?ver=3.2.1.5"></script>
<script src="https://hi.inviee.id/wp-content/plugins/eveent/assets/js/ev-rsvp-handler.js?ver=1780897927"></script>
<script src="https://hi.inviee.id/wp-content/plugins/eveent/assets/js/ewf-barcode-handler.js?ver=1780897927"></script>
<script src="https://hi.inviee.id/wp-content/plugins/eveent/assets/js/ewf-download-handler.js?ver=2.4.4"></script>
<script src="https://hi.inviee.id/wp-content/plugins/eltemplate/includes/widgets/js/widget-video.js?ver=2.0.0"></script>
<script src="https://hi.inviee.id/wp-content/plugins/eltemplate/includes/widgets/js/script.js?ver=1.0"></script>
<script src="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/js/modules/bdt-uikit.js?ver=3.15.1"></script>
<script src="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/js/wdp.min.js?ver=3.2.1.5"></script>
<script src="https://hi.inviee.id/wp-content/plugins/weddingpress/assets/js/guest-form.js?ver=3.2.1.5"></script>

<!-- Images -->
<img src="https://hi.inviee.id/wp-content/uploads/2026/07/Velvet-Garden-Icon.webp" alt="">
<img src="https://hi.inviee.id/wp-content/uploads/2026/03/bunga-tema-2-HvOzRp.webp" alt="">
<img src="https://hi.inviee.id/wp-content/uploads/2026/07/Velvet-Garden-Bunga.webp" alt="">
<img src="https://hi.inviee.id/wp-content/uploads/2024/12/chip-atm1.webp" alt="">
<img src="https://hi.inviee.id/wp-content/uploads/2026/07/Velvet-Garden-Icon.webp" alt="">
<img src="https://hi.inviee.id/wp-content/uploads/2026/03/bunga-tema-2-HvOzRp.webp" alt="">

<!-- JSON / Lottie Files -->
<link rel="preload" href="https://hi.inviee.id/wp-content/uploads/2024/08/lottie-mouse-black.json" as="fetch" type="application/json">

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