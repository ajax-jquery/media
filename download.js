const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const ALLOWED_DOMAINS = ["assets.weddingsaas.id","walimatul.id","web.galeriundanganofficial.com","lovelisseinvitation.my.id","zehaninv.id"];////[cite: 3]
const IMAGE_EXTENSIONS = [];////[cite: 3]

// Contoh HTML yang berisi gambar, CSS, JS, font, audio, hingga video
const htmlContent = `
<link rel='stylesheet' id='jet-engine-frontend-css' href='https://zehaninv.id/wp-content/plugins/jet-engine/assets/css/frontend.css?ver=3.8.13.2' media='all' />
<link rel='stylesheet' id='uaf_client_css-css' href='https://zehaninv.id/wp-content/uploads/useanyfont/uaf.css?ver=1783082060' media='all' />
<link rel='stylesheet' id='wdp-core-css' href='https://zehaninv.id/wp-content/plugins/weddingpress-copy-text/assets/wdp.css?ver=1768228484' media='all' />
<link rel='stylesheet' id='wds-elementor-css' href='https://zehaninv.id/wp-content/plugins/weddingsaas-pro/assets/css/wds-elementor.css?ver=2.10.2' media='all' />
<link rel='stylesheet' id='saic_style-css' href='https://zehaninv.id/wp-content/plugins/weddingsaas-pro/assets/plugins/custom/commentpress/saic_style.css?ver=2.10.2' media='screen' />
<link rel='stylesheet' id='eae-css-css' href='https://zehaninv.id/wp-content/plugins/addon-elements-for-elementor-page-builder/assets/css/eae.min.css?ver=1.14.5' media='all' />
<link rel='stylesheet' id='eae-peel-css-css' href='https://zehaninv.id/wp-content/plugins/addon-elements-for-elementor-page-builder/assets/lib/peel/peel.css?ver=1.14.5' media='all' />
<link rel='stylesheet' id='vegas-css-css' href='https://zehaninv.id/wp-content/plugins/addon-elements-for-elementor-page-builder/assets/lib/vegas/vegas.min.css?ver=2.4.0' media='all' />
<link rel='stylesheet' id='wds-reset-css' href='https://zehaninv.id/wp-content/themes/weddingsaas-wp/assets/css/reset.css?ver=2.0.11' media='all' />
<link rel='stylesheet' id='elementor-frontend-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/css/frontend.min.css?ver=4.1.4' media='all' /><link rel='stylesheet' id='widget-heading-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/css/widget-heading.min.css?ver=4.1.4' media='all' />
<link rel='stylesheet' id='widget-icon-box-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/css/widget-icon-box.min.css?ver=4.1.4' media='all' />
<link rel='stylesheet' id='e-animation-fadeInUp-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInUp.min.css?ver=4.1.4' media='all' />
<link rel='stylesheet' id='e-popup-css' href='https://zehaninv.id/wp-content/plugins/elementor-pro/assets/css/conditionals/popup.min.css?ver=4.1.1' media='all' />
<link rel='stylesheet' id='e-animation-zoomIn-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/animations/styles/zoomIn.min.css?ver=4.1.4' media='all' />
<link rel='stylesheet' id='e-sticky-css' href='https://zehaninv.id/wp-content/plugins/elementor-pro/assets/css/modules/sticky.min.css?ver=4.1.1' media='all' />
<link rel='stylesheet' id='widget-image-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/css/widget-image.min.css?ver=4.1.4' media='all' />
<link rel='stylesheet' id='widget-spacer-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/css/widget-spacer.min.css?ver=4.1.4' media='all' />
<link rel='stylesheet' id='e-animation-fadeInDown-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInDown.min.css?ver=4.1.4' media='all' />
<link rel='stylesheet' id='widget-countdown-css' href='https://zehaninv.id/wp-content/plugins/elementor-pro/assets/css/widget-countdown.min.css?ver=4.1.1' media='all' />
<link rel='stylesheet' id='swiper-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css?ver=8.4.5' media='all' />
<link rel='stylesheet' id='e-swiper-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/css/conditionals/e-swiper.min.css?ver=4.1.4' media='all' />
<link rel='stylesheet' id='widget-divider-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/css/widget-divider.min.css?ver=4.1.4' media='all' />
<link rel='stylesheet' id='jet-elements-css' href='https://zehaninv.id/wp-content/plugins/jet-elements/assets/css/jet-elements.css?ver=2.9.1.2' media='all' />
<link rel='stylesheet' id='jet-timeline-css' href='https://zehaninv.id/wp-content/plugins/jet-elements/assets/css/addons/jet-timeline.css?ver=2.9.1.2' media='all' />
<link rel='stylesheet' id='jet-timeline-skin-css' href='https://zehaninv.id/wp-content/plugins/jet-elements/assets/css/skin/jet-timeline.css?ver=2.9.1.2' media='all' />
<link rel='stylesheet' id='elementor-icons-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css?ver=5.50.0' media='all' />
<link rel='stylesheet' id='elementor-post-36267-css' href='https://zehaninv.id/wp-content/uploads/elementor/css/post-36267.css?ver=1787192197' media='all' />
<link rel='stylesheet' id='font-awesome-5-all-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css?ver=1.0' media='all' />
<link rel='stylesheet' id='font-awesome-4-shim-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min.css?ver=1.0' media='all' />
<link rel='stylesheet' id='elementor-post-36315-css' href='https://zehaninv.id/wp-content/uploads/elementor/css/post-36315.css?ver=1787192197' media='all' />
<link rel='stylesheet' id='elementor-post-4412-css' href='https://zehaninv.id/wp-content/uploads/elementor/css/post-4412.css?ver=1787201663' media='all' /><link rel='stylesheet' id='elementor-gf-local-roboto-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/roboto.css?ver=1767583701' media='all' />
<link rel='stylesheet' id='elementor-gf-local-robotoslab-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/robotoslab.css?ver=1767583703' media='all' />
<link rel='stylesheet' id='elementor-gf-local-ubuntu-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/ubuntu.css?ver=1767583705' media='all' />
<link rel='stylesheet' id='elementor-gf-local-cormorantgaramond-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/cormorantgaramond.css?ver=1767583774' media='all' />
<link rel='stylesheet' id='elementor-gf-local-pinyonscript-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/pinyonscript.css?ver=1767583708' media='all' />
<link rel='stylesheet' id='elementor-gf-local-forum-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/forum.css?ver=1767583853' media='all' />
<link rel='stylesheet' id='elementor-gf-local-aboreto-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/aboreto.css?ver=1767583715' media='all' />
<link rel='stylesheet' id='elementor-gf-local-caudex-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/caudex.css?ver=1767583707' media='all' />
<link rel='stylesheet' id='elementor-gf-local-literata-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/literata.css?ver=1767583739' media='all' />
<link rel='stylesheet' id='elementor-gf-local-lora-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/lora.css?ver=1767583729' media='all' />
<link rel='stylesheet' id='elementor-gf-local-allison-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/allison.css?ver=1767584662' media='all' />
<link rel='stylesheet' id='elementor-gf-local-acme-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/acme.css?ver=1767583715' media='all' />
<link rel='stylesheet' id='elementor-gf-local-clickerscript-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/clickerscript.css?ver=1767583715' media='all' />
<link rel='stylesheet' id='elementor-gf-local-lusitana-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/lusitana.css?ver=1767583705' media='all' />
<link rel='stylesheet' id='elementor-gf-local-poppins-css' href='https://zehaninv.id/wp-content/uploads/elementor/google-fonts/css/poppins.css?ver=1767583721' media='all' />
<link rel='stylesheet' id='elementor-icons-shared-0-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/font-awesome/css/fontawesome.min.css?ver=5.15.3' media='all' />
<link rel='stylesheet' id='elementor-icons-fa-solid-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/font-awesome/css/solid.min.css?ver=5.15.3' media='all' />
<link rel='stylesheet' id='elementor-icons-fa-regular-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/font-awesome/css/regular.min.css?ver=5.15.3' media='all' />
<link rel='stylesheet' id='elementor-icons-fa-brands-css' href='https://zehaninv.id/wp-content/plugins/elementor/assets/lib/font-awesome/css/brands.min.css?ver=5.15.3' media='all' /><script id="jquery-core-js" src="https://lovelisseinvitation.my.id/wp-includes/js/jquery/jquery.min.js?ver=3.7.1"></script>
<script id="jquery-migrate-js" src="https://lovelisseinvitation.my.id/wp-includes/js/jquery/jquery-migrate.min.js?ver=3.4.1"></script>
<script id="eae-iconHelper-js" src="https://zehaninv.id/wp-content/plugins/addon-elements-for-elementor-page-builder/assets/js/iconHelper.js?ver=1.0"></script>
<link rel="https://api.w.org/" href="https://lovelisseinvitation.my.id/wp-json/" /><link rel="alternate" title="JSON" type="application/json" href="https://lovelisseinvitation.my.id/wp-json/wp/v2/posts/50627" /><style class="wp-fonts-local">
@font-face{font-family:against;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/866Against.woff2') format('woff2');}
@font-face{font-family:agraham;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/5812Agraham.woff2') format('woff2');}
@font-face{font-family:argue;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/2806Argue.woff2') format('woff2');}
@font-face{font-family:montecarlo;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/3517Montecarlo.woff2') format('woff2');}
@font-face{font-family:shelleys;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/6075Shelleys.woff2') format('woff2');}
@font-face{font-family:manstein;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/1030Manstein.woff2') format('woff2');}
@font-face{font-family:decotype-thuluth;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/5736DecoType-Thuluth.woff2') format('woff2');}
@font-face{font-family:balorune;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/7733Balorune.woff2') format('woff2');}
@font-face{font-family:brittany-signature;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/1605Brittany-Signature.woff2') format('woff2');}
@font-face{font-family:evelins;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/4324Evelins.woff2') format('woff2');}
@font-face{font-family:gallient;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/6490Gallient.woff2') format('woff2');}
@font-face{font-family:hagmolya;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/4213Hagmolya.woff2') format('woff2');}
@font-face{font-family:histeagin;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/7197histeagin.woff2') format('woff2');}
@font-face{font-family:newyork;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/3718Newyork.woff2') format('woff2');}
@font-face{font-family:philosopher;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/9774Philosopher.woff2') format('woff2');}
@font-face{font-family:pinyon-script;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/5769Pinyon-script.woff2') format('woff2');}
@font-face{font-family:saudagar;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/8165Saudagar.woff2') format('woff2');}
@font-face{font-family:calibri;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/1334Calibri.woff2') format('woff2');}
@font-face{font-family:tan-mon-cheri;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/5991TAN-MON-CHERI.woff2') format('woff2');}
@font-face{font-family:garlicha;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/3790garlicha.woff2') format('woff2');}
@font-face{font-family:garlicha;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/6035Garlicha.woff2') format('woff2');}
@font-face{font-family:garlicha;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/2208garlicha.woff2') format('woff2');}
@font-face{font-family:photograph;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/7674photograph.woff2') format('woff2');}
@font-face{font-family:aston-script;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/6980Aston-Script.woff2') format('woff2');}
@font-face{font-family:hatolie;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/2807Hatolie.woff2') format('woff2');}
@font-face{font-family:new-york;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/4970New-york.woff2') format('woff2');}
@font-face{font-family:amiri;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/8269Amiri.woff2') format('woff2');}
@font-face{font-family:analogue;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/8471Analogue.woff2') format('woff2');}
@font-face{font-family:andrea-bellarosa;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/4377Andrea-Bellarosa.woff2') format('woff2');}
@font-face{font-family:iskry;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/2674Iskry.woff2') format('woff2');}
@font-face{font-family:ivymode;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/8711IvyMode.woff2') format('woff2');}
@font-face{font-family:mesheddisplay;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/8802MeshedDisplay.woff2') format('woff2');}
@font-face{font-family:qene-g;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/5245Qene-G.woff2') format('woff2');}
@font-face{font-family:shelleyandantebt;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/2625ShelleyAndanteBT.woff2') format('woff2');}
@font-face{font-family:silent-caroline;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/7143Silent-Caroline.woff2') format('woff2');}
@font-face{font-family:aphroditeslimpro;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/4352AphroditeSlimPro.woff2') format('woff2');}
@font-face{font-family:italianno;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/5638Italianno.woff2') format('woff2');}
@font-face{font-family:le-jour-script;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/1036Le-Jour-Script.woff2') format('woff2');}
@font-face{font-family:diwani-letter;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/9428Diwani-Letter.woff2') format('woff2');}
@font-face{font-family:kingred;font-style:normal;font-weight:400;font-display:fallback;src:url('https://zehaninv.id/wp-content/uploads/useanyfont/4666Kingred.woff2') format('woff2');}
</style>
<script id="elementor-pro-frontend-js" src="https://zehaninv.id/wp-content/plugins/elementor-pro/assets/js/frontend.min.js?ver=4.1.1"></script>
<script id="pro-elements-handlers-js" src="https://zehaninv.id/wp-content/plugins/elementor-pro/assets/js/elements-handlers.min.js?ver=4.1.1"></script><script id="pys-js" defer src="https://zehaninv.id/wp-content/plugins/pixelyoursite/dist/scripts/public.js?ver=11.2.1"></script>
<script id="elementor-pro-webpack-runtime-js" src="https://zehaninv.id/wp-content/plugins/elementor-pro/assets/js/webpack-pro.runtime.min.js?ver=4.1.1"></script>
<script id="wp-hooks-js" src="https://lovelisseinvitation.my.id/wp-includes/js/dist/hooks.min.js?ver=f0f188028580e8dc1255"></script>
<script id="wp-i18n-js" src="https://lovelisseinvitation.my.id/wp-includes/js/dist/i18n.min.js?ver=1dfe7db3940c23ea9216"></script>
<script id="perfmatters-lazy-load-js" async src="https://zehaninv.id/wp-content/plugins/perfmatters/js/lazyload.min.js?ver=2.6.6"></script>
<script id="jquery-bind-first-js" defer src="https://zehaninv.id/wp-content/plugins/pixelyoursite/dist/scripts/jquery.bind-first-0.2.3.min.js?ver=0.2.3"></script>
<script id="js-cookie-pys-js" defer src="https://zehaninv.id/wp-content/plugins/pixelyoursite/dist/scripts/js.cookie-2.1.3.min.js?ver=2.1.3"></script>
<script id="js-tld-js" defer src="https://zehaninv.id/wp-content/plugins/pixelyoursite/dist/scripts/tld.min.js?ver=2.3.1"></script>
<script id="jet-elements-js" src="https://zehaninv.id/wp-content/plugins/jet-elements/assets/js/jet-elements.min.js?ver=2.9.1.2"></script>
<script id="jet-timeline-js" src="https://zehaninv.id/wp-content/plugins/jet-elements/assets/js/addons/jet-timeline.min.js?ver=2.9.1.2"></script>
<script id="wds-audio-js" src="https://zehaninv.id/wp-content/plugins/weddingsaas-pro/assets/js/wds-elementor-audio.js?ver=2.10.2"></script>
<script id="font-awesome-4-shim-js" src="https://zehaninv.id/wp-content/plugins/elementor/assets/lib/font-awesome/js/v4-shims.min.js?ver=1.0"></script>
<script id="elementor-frontend-js" src="https://zehaninv.id/wp-content/plugins/elementor/assets/js/frontend.min.js?ver=4.1.4"></script>
<script id="e-sticky-js" src="https://zehaninv.id/wp-content/plugins/elementor-pro/assets/lib/sticky/jquery.sticky.min.js?ver=4.1.1"></script>
<script id="swiper-js" src="https://zehaninv.id/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js?ver=8.4.5"></script>
<script id="jet-tween-js-js" src="https://zehaninv.id/wp-content/plugins/jet-elements/assets/js/lib/tweenjs/tweenjs.min.js?ver=2.0.2"></script>
<script id="eae-main-js" src="https://zehaninv.id/wp-content/plugins/addon-elements-for-elementor-page-builder/assets/js/eae.min.js?ver=1.14.5"></script>
<script id="eae-index-js" src="https://zehaninv.id/wp-content/plugins/addon-elements-for-elementor-page-builder/build/index.min.js?ver=1.14.5"></script>
<script id="eae-particles-js" src="https://zehaninv.id/wp-content/plugins/addon-elements-for-elementor-page-builder/assets/js/particles.min.js?ver=2.0.0"></script>
<script id="vegas-js" src="https://zehaninv.id/wp-content/plugins/addon-elements-for-elementor-page-builder/assets/lib/vegas/vegas.min.js?ver=2.4.0"></script>
<script id="elementor-webpack-runtime-js" src="https://zehaninv.id/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js?ver=4.1.4"></script>
<script id="elementor-frontend-modules-js" src="https://zehaninv.id/wp-content/plugins/elementor/assets/js/frontend-modules.min.js?ver=4.1.4"></script>
<script id="jquery-ui-core-js-before">
jQuery.uiBackCompat = true;
//# sourceURL=jquery-ui-core-js-before
</script>
<script id="jquery-ui-core-js" src="https://lovelisseinvitation.my.id/wp-includes/js/jquery/ui/core.min.js?ver=1.14.2"></script>
<script id="fme-jquery-mask-min-js" src="https://zehaninv.id/wp-content/plugins/extensions-for-elementor-form/assets/js/inputmask/jquery.mask.min.js?ver=1788271847"></script>
<script id="fme-otherform-mask-js" src="https://zehaninv.id/wp-content/plugins/extensions-for-elementor-form/assets/js/inputmask/otherform-mask.js?ver=1788271847"></script>
<script id="saic_library-js" src="https://zehaninv.id/wp-content/plugins/weddingsaas-pro/assets/plugins/custom/commentpress/saic_lib.js?ver=2.10.2"></script>
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