gsap.registerPlugin(ScrollTrigger);

// --- 1. THREE.JS KURULUMU ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 800;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 150;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2, // Senin mükemmel bulduğun 0.2 boyutu korundu
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;
    renderer.render(scene, camera);
}
animate();

// --- 2. GSAP SCROLL-TELLING ---

// MOBİL İÇİN FIRTINA DERİNLİĞİ AYARI
// PC ise z: -10'a kadar dal, mobil ise z: 20'de kal (Karlar çok büyümesin)
const targetZ = window.innerWidth < 768 ? 20 : -10;

const heroTl = gsap.timeline({
    scrollTrigger: {
        trigger: "#hero-section",
        start: "top top",
        end: "+=150%",
        scrub: 1,
        pin: true
    }
});

heroTl.to(camera.position, { z: targetZ, ease: "power1.inOut" }, 0)
    .to(".greeting-content", { opacity: 0, scale: 0.8, duration: 0.5 }, 0)
    .to(".transition-text", { opacity: 1, scale: 1.1, duration: 0.5 }, 0.4)
    .to(".transition-text", { opacity: 0, scale: 1.2, duration: 0.5 }, 1)
    .to("#canvas-container", { opacity: 0, duration: 0.5 }, 1);

// Çizgi Animasyonu
gsap.to(".timeline-progress", {
    height: "100%",
    ease: "none",
    scrollTrigger: {
        trigger: ".timeline-container",
        start: "top center",
        end: "bottom center",
        scrub: 0.5
    }
});

// Zarf Animasyonları
const envelopes = gsap.utils.toArray('.envelope-wrapper');

envelopes.forEach((wrapper) => {
    ScrollTrigger.create({
        trigger: wrapper,
        start: "center center+=10%",
        end: "bottom top",
        onEnter: () => {
            wrapper.classList.add('active');
            wrapper.querySelector('.envelope').classList.add('open');
        },
        onLeaveBack: () => {
            wrapper.classList.remove('active');
            wrapper.querySelector('.envelope').classList.remove('open');
        }
    });
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ScrollTrigger.refresh(); // Ekran döndürmede GSAP'ı yenile
});
// --- BÖLÜM 2'DEN BÖLÜM 3'E UZAY/DERİNLİK GEÇİŞİ ---
// Kullanıcı 3. bölüme yaklaştığında, 2. bölümdeki zarflar ve çizgi kameraya doğru büyüyerek karanlıkta kaybolur.
gsap.to(".notes-section", {
    scale: 1.3,
    opacity: 0,
    ease: "power1.inOut",
    scrollTrigger: {
        trigger: "#dark-romance-section",
        start: "top 80%", // 3. bölüm ekrana alttan %20 girdiğinde başla
        end: "top 20%",   // Tepeye yaklaştığında tamamen kaybolsun
        scrub: true
    }
});

// --- YAZILARIN İÇİNDEN IŞIK GEÇMESİ (SHIMMER) VE FİGÜRLER ---
const romanceSteps = gsap.utils.toArray('.romance-step');

romanceSteps.forEach((step) => {
    const text = step.querySelector('.shimmer-text');
    const aura = step.querySelector('.romantic-aura');
    const sparkle = step.querySelector('.sparkle');

    // 1. Yazının içindeki ışığın soldan sağa kayması
    gsap.fromTo(text,
        { backgroundPosition: "200% center" }, // Işık yazının sağında, henüz girmedi
        {
            backgroundPosition: "-200% center",  // Işık yazıyı yalayıp sola geçti
            ease: "none",
            scrollTrigger: {
                trigger: step,
                start: "top 75%", // Yazı ekrana girdiğinde ışık başlar
                end: "bottom 25%", // Kaydırdıkça ışık devam eder
                scrub: true
            }
        }
    );

    // 2. Romantik halelerin (aura) ve yıldızların/kalplerin karanlıktan usulca belirmesi
    gsap.fromTo([aura, sparkle],
        { opacity: 0, scale: 0.5, y: 30 },
        {
            opacity: 1, scale: 1, y: 0,
            scrollTrigger: {
                trigger: step,
                start: "top 85%",
                end: "center center",
                scrub: true
            }
        }
    );
});
// --- 1. KALP SCROLL GEÇİŞİ (PİNLEME) ---
const transitionTl = gsap.timeline({
    scrollTrigger: {
        trigger: "#heart-transition-wrap",
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 1
    }
});

transitionTl.to(".scrolling-heart", {
    scale: 120, // Kalp ekranı yutar
    opacity: 0.5,
    ease: "power2.inOut"
}, 0)
    .to(".why-title", {
        opacity: 1,
        scale: 1.1,
        duration: 0.5
    }, 0.5);

// --- 2. HAFİF CANVAS (PARILTI) ---
const sCanvas = document.getElementById('subtle-canvas');
const sCtx = sCanvas.getContext('2d');
let dots = [];

function initCanvas() {
    sCanvas.width = sCanvas.offsetWidth;
    sCanvas.height = sCanvas.offsetHeight;
}
window.addEventListener('resize', initCanvas);
initCanvas();

class Dot {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * sCanvas.width;
        this.y = sCanvas.height + 10;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 0.5 + 0.2;
        this.alpha = Math.random() * 0.5;
    }
    update() {
        this.y -= this.speed;
        if (this.y < -10) this.reset();
    }
    draw() {
        sCtx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        sCtx.beginPath();
        sCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        sCtx.fill();
    }
}

for (let i = 0; i < 30; i++) dots.push(new Dot());

function animDots() {
    sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
    dots.forEach(d => { d.update(); d.draw(); });
    requestAnimationFrame(animDots);
}
animDots();

// --- 3. KART ETKİLEŞİMİ ---
document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('is-flipped');
    });
});

// Giriş animasyonu (Kartlar dökülürken)
gsap.from(".flip-card", {
    scrollTrigger: {
        trigger: "#why-you-section",
        start: "top 70%"
    },
    y: 50,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: "back.out(1.5)"
});
// --- BÖLÜM 5: MODERN ZARF TOGGLE (AÇ/KAPAT) ---
const finalNoteCard = document.getElementById('finalNoteCard');

if (finalNoteCard) {
    finalNoteCard.addEventListener('click', () => {
        // Class varsa siler (kapatır), yoksa ekler (açar). 
        // pointer-events kısıtlaması olmadığı için sorunsuz açılıp kapanır.
        finalNoteCard.classList.toggle('is-open');
    });
}

// BÖLÜM 4'TEN BÖLÜM 5'E GEÇİŞ (SCROLL EFEKTİ - İsteğe bağlı)
// Kartlardan bu son karanlık ekrana usulca geçmek için
gsap.from("#final-note-section", {
    scrollTrigger: {
        trigger: "#final-note-section",
        start: "top 80%",
    },
    opacity: 0,
    duration: 1.5,
    ease: "power2.out"
});
// --- BÖLÜM 6: KAR TANESİ CANVAS EFEKTİ ---
const snowCanvas = document.getElementById('snow-canvas');
const snowCtx = snowCanvas.getContext('2d');
let snowflakes = [];

function resizeSnowCanvas() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = document.getElementById('snowflake-section').offsetHeight;
}
window.addEventListener('resize', resizeSnowCanvas);
resizeSnowCanvas(); // İlk yüklemede boyutlandır

class Snowflake {
    constructor() {
        this.x = Math.random() * snowCanvas.width;
        this.y = Math.random() * snowCanvas.height;
        this.radius = Math.random() * 3 + 1; // Kar tanesi boyutu
        this.speedX = Math.random() * 1 - 0.5; // Sağa sola hafif savrulma
        this.speedY = Math.random() * 2 + 0.5; // Düşüş hızı
        this.opacity = Math.random() * 0.5 + 0.3;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Ekranda aşağıdan çıkarsa yukarıdan tekrar başlat
        if (this.y > snowCanvas.height) {
            this.y = -10;
            this.x = Math.random() * snowCanvas.width;
        }
    }
    draw() {
        snowCtx.beginPath();
        snowCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        snowCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        snowCtx.shadowBlur = 5;
        snowCtx.shadowColor = "#ffffff";
        snowCtx.fill();
    }
}

// 100 adet kar tanesi oluştur
for (let i = 0; i < 100; i++) {
    snowflakes.push(new Snowflake());
}

function animateSnow() {
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    snowflakes.forEach(flake => {
        flake.update();
        flake.draw();
    });
    requestAnimationFrame(animateSnow);
}
animateSnow();

// --- BÖLÜM 6: GSAP SCROLL ANİMASYONLARI ---
// Yazıların eğlenceli ve şık bir şekilde gelmesi
gsap.from(".playful-text", {
    scrollTrigger: {
        trigger: "#snowflake-section",
        start: "top 75%"
    },
    y: 30,
    opacity: 0,
    duration: 1,
    stagger: 0.3, // Biri gelsin, az sonra diğeri gelsin
    ease: "power2.out"
});

gsap.from(".snow-title", {
    scrollTrigger: {
        trigger: ".snow-intro-wrapper",
        start: "top 60%"
    },
    scale: 0.8,
    opacity: 0,
    duration: 1.2,
    ease: "back.out(1.5)"
});

// Buzdan kartların sırayla yukarı doğru dökülmesi
gsap.from(".ice-card", {
    scrollTrigger: {
        trigger: ".ice-cards-grid",
        start: "top 80%"
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2, // Sırayla şık şık düşsünler
    ease: "power2.out"
});
// ==========================================
// --- 7. DİLEK FENERLERİ (BUTON) ---
// ==========================================
const wishBtn = document.getElementById('wishBtn');
const lanternsContainer = document.getElementById('lanterns-container');

if (wishBtn && lanternsContainer) {
    const handleWish = (e) => {
        if (e.type === 'touchstart') e.preventDefault();
        createLantern();
        wishBtn.classList.add('active');
        setTimeout(() => wishBtn.classList.remove('active'), 200);
    };
    wishBtn.addEventListener('click', handleWish);
    wishBtn.addEventListener('touchstart', handleWish);
}

function createLantern() {
    const lantern = document.createElement('div');
    lantern.classList.add('lantern');
    const startX = Math.random() * window.innerWidth;
    lantern.style.left = `${startX}px`;
    const scale = Math.random() * 0.5 + 0.8;
    lantern.style.transform = `scale(${scale})`;
    const duration = Math.random() * 4 + 4;
    lantern.style.animationDuration = `${duration}s`;
    lanternsContainer.appendChild(lantern);
    setTimeout(() => { if (lantern.parentNode) lantern.parentNode.removeChild(lantern); }, duration * 1000);
}