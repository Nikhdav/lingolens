// Veri Havuzu: TOEFL, YDS, YDT ve YÖKDİL odaklı genişletilmiş veritabanı
const dataBank = {
    // Kültürel ve Fonksiyonel Karşılıklar
    idioms: {
        "piece of cake": "Tereyağından kıl çeker gibi (Çok kolay)",
        "break a leg": "Şeytanın bacağını kır / Başarılar",
        "under the weather": "Halsiz / Keyifsiz",
        "beat around the bush": "Lafı dolandırmak / Sadede gelmemek",
        "hit the books": "İneklemek / Derslere asılmak",
        "call it a day": "Paydos etmek / Günü noktalamak",
        "on the tip of my tongue": "Dilimin ucunda",
        "once in a blue moon": "Kırk yılda bir",
        "take with a grain of salt": "İhtiyatla karşılamak / Şüpheyle yaklaşmak",
        "get out of hand": "Çığrından çıkmak / Kontrolden kaçmak",
        "keep an eye on": "Göz kulak olmak",
        "make ends meet": "Ay sonunu getirmek / Ucu ucuna yetirmek"
    },
    
    // Sınavlarda en çok puan kaybettiren ileri düzey yapılar
    grammarRules: [
        { name: "Inversion", regex: /(Not only|Never|Hardly|Seldom|Only if|No sooner|At no time|Rarely)\s+(\w+)\s+(do|does|did|have|has|is|are|am|had)/gi },
        { name: "Causative", regex: /(have|get|had|got)\s+([\w\s]+)\s+(done|to do|do|v3)/gi },
        { name: "Conditionals", regex: /(If|Unless|Provided that|As long as|In case|Supposing|But for)\s+([^,.?!]*)/gi },
        { name: "Parallelism", regex: /(neither|either|both|not only)\s+([\w\s]+)\s+(nor|or|and|but also)/gi },
        { name: "Subjunctive", regex: /(suggest|recommend|insist|demand|vital|essential|important)\s+(that)\s+(\w+)\s+(be|do|have|go)/gi }
    ],

    // TOEFL ve YDS/YDT'de en sık çıkan akademik anahtar kelimeler
    academicKeywords: [
        // Bağlaçlar (Zıtlık & Sebep-Sonuç)
        "nevertheless", "nonetheless", "furthermore", "moreover", "consequently", "hence", "thus",
        "notwithstanding", "on the contrary", "conversely", "accordingly", "whereas",
        // Akademik Fiiller ve Sıfatlar
        "ambiguous", "reluctance", "phenomenon", "vulnerable", "comprehensive", "undermine",
        "scrutinize", "adversity", "coherent", "facilitate", "fluctuate", "implement",
        "inevitable", "obsolete", "profound", "resilient", "skeptical", "subtle",
        "sustain", "vague", "empirical", "prevalent", "paradigm", "preconception",
        "bias", "mitigate", "deteriorate", "allocate", "advocate", "attribute"
    ]
};

function analyzeText() {
    const input = document.getElementById('textInput').value;
    if (!input) return alert("Lütfen bir metin girin.");

    let processedText = input;

    // 1. Deyim ve Kültürel Analiz (Bağlamsal Çeviri)
    for (let idiom in dataBank.idioms) {
        const regex = new RegExp(idiom, "gi");
        processedText = processedText.replace(regex, `<span class="tag idiom" title="${dataBank.idioms[idiom]}">$&</span>`);
    }

    // 2. Gramer Röntgeni (İleri Düzey Yapılar)
    dataBank.grammarRules.forEach(rule => {
        processedText = processedText.replace(rule.regex, (match) => {
            return `<span class="tag ${rule.name.toLowerCase() === 'inversion' ? 'inversion' : 'grammar'}" title="${rule.name} Yapısı Analiz Edildi">${match}</span>`;
        });
    });

    // Sonuçları ekrana bas
    document.getElementById('highlightedText').innerHTML = processedText;
    buildVocabTable(input);
    document.getElementById('resultArea').classList.remove('hidden');
}

function buildVocabTable(text) {
    const words = text.toLowerCase().match(/\b(\w+)\b/g);
    const tbody = document.getElementById('vocabBody');
    tbody.innerHTML = "";

    if (!words) return;

    // Metindeki akademik kelimeleri bul ve frekansına göre listele
    const uniqueWords = [...new Set(words)];
    const foundKeywords = uniqueWords.filter(w => dataBank.academicKeywords.includes(w));

    foundKeywords.forEach(word => {
        const startIndex = text.toLowerCase().indexOf(word);
        const snippet = text.substring(Math.max(0, startIndex - 20), Math.min(text.length, startIndex + word.length + 20));
        
        const row = `<tr>
            <td><strong>${word}</strong></td>
            <td>"...${snippet}..."</td>
            <td><span style="color:${word.length > 8 ? '#e67e22' : '#27ae60'}">Akademik Seviye</span></td>
        </tr>`;
        tbody.innerHTML += row;
    });
}
// Sayfa yüklendiğinde hafızadaki temayı kontrol et
window.onload = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateToggleButton(savedTheme);
};

// Gelişmiş Analiz Fonksiyonu
function performAdvancedAnalysis(text) {
    const words = text.split(/\s+/).length;
    
    // 1. Okuma Süresi Hesapla (Ortalama 200 kelime/dk)
    document.getElementById('readTime').innerText = Math.ceil(words / 200);

    // 2. Zorluk Seviyesi Tahmini (Basit bir algoritma: Uzun kelime oranı)
    const longWords = text.split(/\s+/).filter(word => word.length > 7).length;
    const ratio = (longWords / words) * 100;
    
    let level = "A2 - Başlangıç";
    if (ratio > 10) level = "B2 - Orta Üstü";
    if (ratio > 20) level = "C1 - İleri Seviye";
    
    document.getElementById('difficultyLevel').innerText = level;
    document.getElementById('academicScore').innerText = `%${Math.min(100, Math.round(ratio * 2))}`;
}

function updateExamTimer() {
    // 2026 YDT Tahmini Tarihi (ÖSYM takvimine göre güncellenebilir)
    // Örn: 14 Haziran 2026
    const examDate = new Date("June 21, 2026 10:15:00").getTime();
    const now = new Date().getTime();
    const diff = examDate - now;

    // Milisaniyeyi güne çevirme
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const displayElement = document.getElementById('daysLeft');
    
    if (days > 0) {
        displayElement.innerText = days;
    } else if (days === 0) {
        displayElement.innerText = "BUGÜN!";
    } else {
        displayElement.innerText = "Sınav Tamamlandı";
    }
}

// 2. Web Speech API ile Sesli Okuma
function speakText() {
    const text = document.getElementById('textInput').value;
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Biraz daha yavaş ve anlaşılır
    window.speechSynthesis.speak(utterance);
}

// 3. Basit Paylaşım Özelliği (URL kopyalama)
function shareAnalysis() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("Bağlantı kopyalandı! Arkadaşlarınızla paylaşabilirsiniz.");
    });
}

// Sayfa açıldığında çalıştır
updateExamTimer();

// Sesli okuma ve hız ayarı

function speakWithSettings() {
    const text = document.getElementById('textInput').value;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // YDT/YDS öğrencileri için ideal hız: 0.8 (Biraz yavaş ve tane tane)
    utterance.rate = 0.8; 
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    
    // Eğer konuşma devam ediyorsa durdur (Üst üste binmesin)
    if (synth.speaking) {
        synth.cancel();
        return;
    }
    
    synth.speak(utterance);
}


// Dinamik Quiz Oluşturucu
function generateQuiz() {
    const vocab = dataBank.academicKeywords;
    const text = document.getElementById('textInput').value.toLowerCase();
    const found = vocab.filter(w => text.includes(w)).slice(0, 5);
    
    let quizHTML = "";
    found.forEach((word, index) => {
        quizHTML += `<p>${index + 1}. Metinde geçen "<strong>.......</strong>" kelimesi, akademik sınavlarda sıkça sorulur. (İpucu: ${word[0]}...)</p>`;
    });

    document.getElementById('quizContent').innerHTML = quizHTML || "Quiz oluşturmak için yeterli akademik kelime bulunamadı.";
    document.getElementById('quizArea').classList.remove('hidden');
}

// PDF Aktarma (Basit sürüm: Yazdırma penceresi tetikleme)
function exportToPDF() {
    window.print();
}

// analyzeText fonksiyonunun sonuna performAdvancedAnalysis(input); eklemeyi unutma!


function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Seçimi kaydet
    updateToggleButton(newTheme);
}

function updateToggleButton(theme) {
    const btn = document.getElementById('themeToggle');
    btn.innerText = theme === 'dark' ? '☀️ Aydınlık Mod' : '🌙 Karanlık Mod';
}


// 1. Kelime Bulutu Oluşturucu
function generateWordCloud(text) {
    const cloudContainer = document.getElementById('wordCloud');
    cloudContainer.innerHTML = "";
    
    // Kelimeleri temizle ve say (3 harften uzun olanlar)
    const words = text.toLowerCase().match(/\b(\w{4,})\b/g);
    if (!words) return;

    const counts = {};
    words.forEach(w => counts[w] = (counts[w] || 0) + 1);

    // En çok geçen 20 kelimeyi al
    const sortedWords = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    sortedWords.forEach(([word, count]) => {
        const span = document.createElement('span');
        span.className = 'cloud-word';
        // Frekansa göre font büyüklüğü ayarla (14px - 40px arası)
        span.style.fontSize = `${Math.min(40, 14 + (count * 5))}px`;
        span.style.opacity = Math.min(1, 0.4 + (count * 0.2));
        span.innerText = word;
        cloudContainer.appendChild(span);
    });

    document.getElementById('wordCloudArea').classList.remove('hidden');
}

var form = document.getElementById("feedbackForm");
    
async function handleSubmit(event) {
  event.preventDefault();
  var status = document.getElementById("my-form-status");
  var data = new FormData(event.target);
  
  fetch(event.target.action, {
    method: form.method,
    body: data,
    headers: {
        'Accept': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      status.innerHTML = "✅ Teşekkürler! Mesajın başarıyla bana ulaştı.";
      status.style.color = "#27ae60";
      form.reset();
    } else {
      response.json().then(data => {
        if (Object.hasOwn(data, 'errors')) {
          status.innerHTML = data["errors"].map(error => error["message"]).join(", ");
        } else {
          status.innerHTML = "❌ Bir hata oluştu, lütfen tekrar dene.";
        }
      })
    }
  }).catch(error => {
    status.innerHTML = "❌ Gönderilemedi, internet bağlantını kontrol et.";
  });
}
form.addEventListener("submit", handleSubmit)
// analyzeText fonksiyonunun sonuna generateWordCloud(input); satırını ekle.



function clearAll() {
    document.getElementById('textInput').value = "";
    document.getElementById('resultArea').classList.add('hidden');
}