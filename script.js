/**
 * LingoLens - script.js
 * Karakter sınırı hatası (500 chars) için parçalı çeviri desteği eklendi.
 */

// 1. MAKALE YÜKLEYİCİ (Aynı kalıyor)
async function loadRandomArticle() {
    const textElement = document.getElementById('dailyArticleText');
    const linkElement = document.getElementById('dailyArticleLink');
    if (!textElement || !linkElement) return;

    const sourceChoice = Math.floor(Math.random() * 2);
    try {
        if (sourceChoice === 0) {
            const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
            const data = await res.json();
            textElement.innerHTML = `<small style="color:var(--accent)">Wiki Focus</small><br>${data.title}`;
            linkElement.href = data.content_urls.desktop.page;
        } else {
            const topics = ["biology", "psychology", "environment", "history"];
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const res = await fetch(`https://export.arxiv.org/api/query?search_query=all:${topic}&max_results=5`);
            const xml = await res.text();
            const entries = new DOMParser().parseFromString(xml, "text/xml").getElementsByTagName("entry");
            const entry = entries[Math.floor(Math.random() * entries.length)];
            textElement.innerHTML = `<small style="color:var(--accent)">arXiv Academic</small><br>${entry.getElementsByTagName("title")[0].textContent.substring(0, 65)}...`;
            linkElement.href = entry.getElementsByTagName("id")[0].textContent;
        }
        linkElement.innerText = "İncele →";
    } catch (e) {
        textElement.innerText = "Akademik Haberler";
        linkElement.href = "https://www.nature.com";
    }
}

// 2. GELİŞMİŞ ÇEVİRİ (500 Karakter Sınırını Aşan Çözüm)
async function translateText(text) {
    const el = document.getElementById('translatedText');
    if (!el) return;
    el.innerText = "Çeviriliyor (Büyük metinler parçalanıyor)...";

    // Metni ~450 karakterlik parçalara böl
    const chunks = text.match(/.{1,450}(\s|$)/g) || [text];
    let translatedFull = "";

    try {
        for (let chunk of chunks) {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|tr`);
            const data = await res.json();
            if (data.responseData) {
                translatedFull += data.responseData.translatedText + " ";
            }
        }
        el.innerText = translatedFull || "Çeviri yapılamadı.";
    } catch (e) { 
        el.innerText = "Bağlantı hatası veya limit aşıldı."; 
    }
}

// 3. ANALİZ VE RÖNTGEN
function analyzeText() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return alert("Lütfen metin girin.");

    const words = text.split(/\s+/).length;
    const connectors = ["however", "furthermore", "nevertheless", "consequently", "whereas", "nonetheless", "notwithstanding"];
    let conjCount = 0;
    connectors.forEach(c => { if (text.toLowerCase().includes(c)) conjCount++; });

    // Seviye ve İstatistik
    document.getElementById('cefrLevel').innerText = conjCount > 1 || words > 100 ? "B2/C1" : "A2/B1";
    document.getElementById('readTime').innerText = Math.max(1, Math.ceil(words / 150));
    
    // Akademik Skor
    const score = Math.min(100, (conjCount * 20) + (words / 10));
    document.getElementById('academicScore').innerText = "%" + Math.floor(score);
    document.getElementById('academicProgress').style.width = score + "%";

    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('highlightedText').innerText = text;
    
    // Çeviriyi Başlat
    translateText(text);
}

// 4. GRAMER TEŞHİS
function detectGrammar() {
    const text = document.getElementById('textInput').value.toLowerCase();
    const list = document.getElementById('grammarList');
    list.innerHTML = "";
    const rules = [
        {k: "have been", n: "Pres. Perf. Continuous"},
        {k: "only if", n: "Inversion (Devrik)"},
        {k: "provided that", n: "Conditional (Koşul)"},
        {k: "had been", n: "Past Perfect"}
    ];
    let found = false;
    rules.forEach(r => {
        if (text.includes(r.k)) {
            const li = document.createElement('li');
            li.innerText = "Tespit: " + r.n;
            list.appendChild(li);
            found = true;
        }
    });
    if (!found) list.innerHTML = "<li>Ağır yapı bulunamadı.</li>";
    document.getElementById('grammarAlert').classList.remove('hidden');
}

// 5. TEMA VE YARDIMCILAR
function toggleTheme() {
    const h = document.documentElement;
    const t = h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    h.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    const i = document.querySelector('.mode-icon');
    if (i) i.innerText = t === 'dark' ? "☀️" : "🌙";
}

function clearText() {
    document.getElementById('textInput').value = "";
    ["resultArea", "grammarAlert"].forEach(id => document.getElementById(id).classList.add('hidden'));
}

function speakWithSettings() {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(document.getElementById('textInput').value);
    u.lang = 'en-US'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
}

window.addEventListener('DOMContentLoaded', () => {
    loadRandomArticle();
    const st = localStorage.getItem('theme');
    if (st) document.documentElement.setAttribute('data-theme', st);
});

// https://formspree.io/f/mnjlyrro