const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const ALLOWED_DOMAINS = ["hi.inviee.id","library.eltemplate.vip", "undanganhub.com","walimatul.id","web.galeriundanganofficial.com","lovelisseinvitation.my.id","zehaninv.id","rawcdn.githack.com"];////[cite: 3]
const IMAGE_EXTENSIONS = [];////[cite: 3]

// Contoh HTML yang berisi gambar, CSS, JS, font, audio, hingga video
const htmlContent = `
<style>				@font-face {
					font-family: 'newyork';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/6864Newyork.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/6864Newyork.woff') format('woff');
					   font-display: auto;
				}

				.newyork{font-family: 'newyork' !important;}

						@font-face {
					font-family: 'edensor-free';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/6521Edensor-free.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/6521Edensor-free.woff') format('woff');
					   font-display: auto;
				}

				.edensor-free{font-family: 'edensor-free' !important;}

						@font-face {
					font-family: 'over-thingking';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/62Over-thingking.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/62Over-thingking.woff') format('woff');
					   font-display: auto;
				}

				.over-thingking{font-family: 'over-thingking' !important;}

						@font-face {
					font-family: 'mogan';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/9471Mogan.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/9471Mogan.woff') format('woff');
					   font-display: auto;
				}

				.mogan{font-family: 'mogan' !important;}

						@font-face {
					font-family: 'vensfolk';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/7592Vensfolk.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/7592Vensfolk.woff') format('woff');
					   font-display: auto;
				}

				.vensfolk{font-family: 'vensfolk' !important;}

						@font-face {
					font-family: 'vogate';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/2096Vogate.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/2096Vogate.woff') format('woff');
					   font-display: auto;
				}

				.vogate{font-family: 'vogate' !important;}

						@font-face {
					font-family: 'delon';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/9529Delon.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/9529Delon.woff') format('woff');
					   font-display: auto;
				}

				.delon{font-family: 'delon' !important;}

						@font-face {
					font-family: 'achava';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/6699Achava.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/6699Achava.woff') format('woff');
					   font-display: auto;
				}

				.achava{font-family: 'achava' !important;}

						@font-face {
					font-family: 'capella';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/7375Capella.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/7375Capella.woff') format('woff');
					   font-display: auto;
				}

				.capella{font-family: 'capella' !important;}

						@font-face {
					font-family: 'gadish';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/767Gadish.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/767Gadish.woff') format('woff');
					   font-display: auto;
				}

				.gadish{font-family: 'gadish' !important;}

						@font-face {
					font-family: 'history';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/632History.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/632History.woff') format('woff');
					   font-display: auto;
				}

				.history{font-family: 'history' !important;}

						@font-face {
					font-family: 'qagetto';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/4192Qagetto.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/4192Qagetto.woff') format('woff');
					   font-display: auto;
				}

				.qagetto{font-family: 'qagetto' !important;}

						@font-face {
					font-family: 'queen-rogette';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/4535Queen-Rogette.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/4535Queen-Rogette.woff') format('woff');
					   font-display: auto;
				}

				.queen-rogette{font-family: 'queen-rogette' !important;}

						@font-face {
					font-family: 'romland';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/1951ROMLAND.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/1951ROMLAND.woff') format('woff');
					   font-display: auto;
				}

				.romland{font-family: 'romland' !important;}

						@font-face {
					font-family: 'starsight';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/3233Starsight.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/3233Starsight.woff') format('woff');
					   font-display: auto;
				}

				.starsight{font-family: 'starsight' !important;}

						@font-face {
					font-family: 'gabyan';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/9462Gabyan.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/9462Gabyan.woff') format('woff');
					   font-display: auto;
				}

				.gabyan{font-family: 'gabyan' !important;}

						@font-face {
					font-family: 'analogue';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/3106Analogue.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/3106Analogue.woff') format('woff');
					   font-display: auto;
				}

				.analogue{font-family: 'analogue' !important;}

						@font-face {
					font-family: 'fugi';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/5760Fugi.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/5760Fugi.woff') format('woff');
					   font-display: auto;
				}

				.fugi{font-family: 'fugi' !important;}

						@font-face {
					font-family: 'ginger';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/3902Ginger.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/3902Ginger.woff') format('woff');
					   font-display: auto;
				}

				.ginger{font-family: 'ginger' !important;}

						@font-face {
					font-family: 'granola';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/2843Granola.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/2843Granola.woff') format('woff');
					   font-display: auto;
				}

				.granola{font-family: 'granola' !important;}

						@font-face {
					font-family: 'grande';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/4497Grande.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/4497Grande.woff') format('woff');
					   font-display: auto;
				}

				.grande{font-family: 'grande' !important;}

						@font-face {
					font-family: 'sugar';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/6436Sugar.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/6436Sugar.woff') format('woff');
					   font-display: auto;
				}

				.sugar{font-family: 'sugar' !important;}

						@font-face {
					font-family: 'ginkgo';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/571Ginkgo.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/571Ginkgo.woff') format('woff');
					   font-display: auto;
				}

				.ginkgo{font-family: 'ginkgo' !important;}

						@font-face {
					font-family: 'calista';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/3667Calista.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/3667Calista.woff') format('woff');
					   font-display: auto;
				}

				.calista{font-family: 'calista' !important;}

						@font-face {
					font-family: 'satisfy';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/3203Satisfy.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/3203Satisfy.woff') format('woff');
					   font-display: auto;
				}

				.satisfy{font-family: 'satisfy' !important;}

						@font-face {
					font-family: 'ginger-modern';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/4990Ginger-Modern.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/4990Ginger-Modern.woff') format('woff');
					   font-display: auto;
				}

				.ginger-modern{font-family: 'ginger-modern' !important;}

						@font-face {
					font-family: 'south-amsterdam';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/1625South-Amsterdam.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/1625South-Amsterdam.woff') format('woff');
					   font-display: auto;
				}

				.south-amsterdam{font-family: 'south-amsterdam' !important;}

						@font-face {
					font-family: 'girly-style';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/681Girly-Style.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/681Girly-Style.woff') format('woff');
					   font-display: auto;
				}

				.girly-style{font-family: 'girly-style' !important;}

						@font-face {
					font-family: 'just-sunday-bold';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/9179Just-Sunday-Bold.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/9179Just-Sunday-Bold.woff') format('woff');
					   font-display: auto;
				}

				.just-sunday-bold{font-family: 'just-sunday-bold' !important;}

						@font-face {
					font-family: 'just-sunday';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/8131Just-Sunday.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/8131Just-Sunday.woff') format('woff');
					   font-display: auto;
				}

				.just-sunday{font-family: 'just-sunday' !important;}

						@font-face {
					font-family: 'gardenisa';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/9685Gardenisa.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/9685Gardenisa.woff') format('woff');
					   font-display: auto;
				}

				.gardenisa{font-family: 'gardenisa' !important;}

						@font-face {
					font-family: 'bartes-malaga';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/1233Bartes-Malaga.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/1233Bartes-Malaga.woff') format('woff');
					   font-display: auto;
				}

				.bartes-malaga{font-family: 'bartes-malaga' !important;}

						@font-face {
					font-family: 'geraldo-island';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/8814Geraldo-Island.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/8814Geraldo-Island.woff') format('woff');
					   font-display: auto;
				}

				.geraldo-island{font-family: 'geraldo-island' !important;}

						@font-face {
					font-family: 'scholastica';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/9370Scholastica.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/9370Scholastica.woff') format('woff');
					   font-display: auto;
				}

				.scholastica{font-family: 'scholastica' !important;}

						@font-face {
					font-family: 'charlotte-southern';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/3822Charlotte-Southern.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/3822Charlotte-Southern.woff') format('woff');
					   font-display: auto;
				}

				.charlotte-southern{font-family: 'charlotte-southern' !important;}

						@font-face {
					font-family: 'giava';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/702Giava.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/702Giava.woff') format('woff');
					   font-display: auto;
				}

				.giava{font-family: 'giava' !important;}

						@font-face {
					font-family: 'kuinca';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/4398KUINCA.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/4398KUINCA.woff') format('woff');
					   font-display: auto;
				}

				.kuinca{font-family: 'kuinca' !important;}

						@font-face {
					font-family: 'migrand';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/1147Migrand.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/1147Migrand.woff') format('woff');
					   font-display: auto;
				}

				.migrand{font-family: 'migrand' !important;}

						@font-face {
					font-family: 'modern-chengo';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/5765Modern-Chengo.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/5765Modern-Chengo.woff') format('woff');
					   font-display: auto;
				}

				.modern-chengo{font-family: 'modern-chengo' !important;}

						@font-face {
					font-family: 'gosten';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/6197Gosten.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/6197Gosten.woff') format('woff');
					   font-display: auto;
				}

				.gosten{font-family: 'gosten' !important;}

						@font-face {
					font-family: 'balmond';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/8560Balmond.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/8560Balmond.woff') format('woff');
					   font-display: auto;
				}

				.balmond{font-family: 'balmond' !important;}

						@font-face {
					font-family: 'balmond-outline';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/8435Balmond-Outline.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/8435Balmond-Outline.woff') format('woff');
					   font-display: auto;
				}

				.balmond-outline{font-family: 'balmond-outline' !important;}

						@font-face {
					font-family: 'delmone';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/9483DELMONE.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/9483DELMONE.woff') format('woff');
					   font-display: auto;
				}

				.delmone{font-family: 'delmone' !important;}

						@font-face {
					font-family: 'milenial';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/7697Milenial.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/7697Milenial.woff') format('woff');
					   font-display: auto;
				}

				.milenial{font-family: 'milenial' !important;}

						@font-face {
					font-family: 'rolate';
					src: url('https://hi.inviee.id/wp-content/uploads/useanyfont/8919ROLATE.woff2') format('woff2'),
						url('https://hi.inviee.id/wp-content/uploads/useanyfont/8919ROLATE.woff') format('woff');
					   font-display: auto;
				}

				.rolate{font-family: 'rolate' !important;}

		</style>
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