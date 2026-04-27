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

    // --- GELİŞMİŞ PUANLAMA MOTORU ---
const academicWords = ["theory", "analysis", "significant", "approach", "data", "research", "process", "context", "concept", "evidence", "hypothesis", "consistent", "indicate", "period", "policy", "source", "factor"];

function analyzeText() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return alert("Lütfen metin girin.");

    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0).length;
    
    // 1. Cümle Başına Düşen Ortalama Kelime (Akademik metinlerde bu sayı yüksektir)
    const avgSentenceLength = sentences > 0 ? wordCount / sentences : wordCount;
    
    // 2. Bağlaç Kontrolü (Genişletilmiş liste)
    const connectors = ["however", "furthermore", "nevertheless", "consequently", "whereas", "nonetheless", "therefore", "in addition", "moreover", "alternatively"];
    let conjCount = 0;
    connectors.forEach(c => { if (text.toLowerCase().includes(c)) conjCount++; });

    // 3. Akademik Kelime Yoğunluğu
    let academicMatch = 0;
    academicWords.forEach(w => { if (text.toLowerCase().includes(w)) academicMatch++; });

    // --- YENİ FORMÜL ---
    // Cümle uzunluğu (max 40p) + Bağlaçlar (max 30p) + Kelime Havuzu (max 30p)
    const sentenceScore = Math.min(40, avgSentenceLength * 1.5);
    const connectorScore = Math.min(30, conjCount * 10);
    const vocabScore = Math.min(30, academicMatch * 5);
    
    const finalScore = Math.floor(sentenceScore + connectorScore + vocabScore);

    // Ekrana Yazdır
    document.getElementById('academicScore').innerText = "%" + finalScore;
    document.getElementById('academicProgress').style.width = finalScore + "%";
    
    // CEFR Tahmini
    let cefr = "A2/B1";
    if (finalScore > 50 || avgSentenceLength > 18) cefr = "B2";
    if (finalScore > 75 && avgSentenceLength > 22) cefr = "C1/C2";
    document.getElementById('cefrLevel').innerText = cefr;

    // Diğer işlemler...
    document.getElementById('readTime').innerText = Math.max(1, Math.ceil(wordCount / 150));
    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('highlightedText').innerText = text;
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

let isSpeaking = false; // Ses çalıyor mu?
let isPaused = false;   // Duraklatıldı mı?

function handleTTS() {
    const text = document.getElementById('textInput').value.trim();
    const btn = document.getElementById('ttsBtn');

    if (!text) return alert("Okunacak metin bulunamadı.");

    // 1. Eğer hiç başlamadıysa veya tamamen bittiyse (YENİDEN BAŞLAT)
    if (!window.speechSynthesis.speaking || (window.speechSynthesis.speaking && !isSpeaking)) {
        window.speechSynthesis.cancel(); // Ne olur ne olmaz sıfırla
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;

        utterance.onstart = () => {
            isSpeaking = true;
            btn.innerText = "⏸️ Duraklat";
        };

        utterance.onend = () => {
            isSpeaking = false;
            isPaused = false;
            btn.innerText = "🔊 Sesli Oku";
        };

        window.speechSynthesis.speak(utterance);
    } 
    // 2. Eğer şu an okuyorsa (DURAKLAT)
    else if (isSpeaking && !isPaused) {
        window.speechSynthesis.pause();
        isPaused = true;
        btn.innerText = "▶️ Devam Et";
    } 
    // 3. Eğer duraklatılmışsa (DEVAM ET)
    else if (isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        btn.innerText = "⏸️ Duraklat";
    }
}

// Tamamen durdurmak ve sıfırlamak için (Opsiyonel Stop butonu için)
function stopTTS() {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    isPaused = false;
    document.getElementById('ttsBtn').innerText = "🔊 Sesli Oku";
}

window.addEventListener('DOMContentLoaded', () => {
    loadRandomArticle();
    const st = localStorage.getItem('theme');
    if (st) document.documentElement.setAttribute('data-theme', st);
});


// Geri bildirim

// --- GERİ BİLDİRİM FORMU (Yönlendirmesiz Gönderim) ---
document.getElementById("feedbackForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Sayfanın Formspree'ye gitmesini engeller

    const status = document.getElementById("formStatus");
    const btn = document.getElementById("feedbackBtn");
    const input = document.getElementById("feedbackInput");
    
    // Senin Formspree linkin
    const formUrl = "https://formspree.io/f/mnjlyrro"; 

    // Arayüzü güncelle (Gönderiliyor hissi)
    btn.disabled = true;
    btn.innerText = "Gönderiliyor...";
    status.style.display = "none";

    try {
        const response = await fetch(formUrl, {
            method: "POST",
            body: new FormData(this),
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            status.innerText = "✅ Mesajınız iletildi, teşekkürler!";
            status.style.color = "var(--accent)";
            status.style.display = "block";
            this.reset(); // Kutuyu temizle
        } else {
            status.innerText = "❌ Bir hata oluştu, tekrar deneyin.";
            status.style.color = "#ef4444";
            status.style.display = "block";
        }
    } catch (error) {
        status.innerText = "🌐 Bağlantı hatası!";
        status.style.display = "block";
    } finally {
        btn.disabled = false;
        btn.innerText = "Gönder";
        // 4 saniye sonra başarı mesajını gizle
        setTimeout(() => { status.style.display = "none"; }, 4000);
    }
});


// https://formspree.io/f/mnjlyrro