import {
  BrainCircuit,
  FolderTree,
  Layers,
  Library,
  Search,
  ShieldCheck,
} from 'lucide-react';

const FEATURES = [
  {
    icon: FolderTree,
    title: 'Akıllı Tasnif',
    desc: 'Dosyayı bırak — yapay zeka dersi, konuyu ve alt başlığı tespit edip otomatik klasörler, ilgili notlar arasında bağ kurar.',
  },
  {
    icon: Layers,
    title: '3 Katmanlı Anlatım',
    desc: 'Her dosya için: Hızlı Bakış, Akademik Derinlik ve "5 yaşındaymışım gibi" analoji — üçü birden, anında.',
  },
  {
    icon: ShieldCheck,
    title: 'Sıfır-Halüsinasyon Test',
    desc: 'Sadece senin dökümanından soru. Yanlışta kaynağı gösterir: "PDF s.14, ¶3" der ve konuyu yeniden anlatır.',
  },
  {
    icon: Search,
    title: 'Semantik Arama (RAG)',
    desc: '"O grafik neredeydi?" diye sor — ilgili PDF sayfasını, el yazısı notu ve ses kaydının dakikasını saniyede bulur.',
  },
  {
    icon: BrainCircuit,
    title: 'Koç & Aralıklı Tekrar',
    desc: 'Zayıf noktanı analiz eder, proaktif yönlendirir; her dökümandan otomatik flashcard üretip FSRS ile karşına çıkarır.',
  },
  {
    icon: Library,
    title: 'Global Kütüphane',
    desc: 'Kaliteli özetlerini anonim veya isimle paylaş; başkalarının notlarını tek tıkla kendi yapay zekana ekle.',
  },
];

export function Features() {
  return (
    <section id="ozellikler" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Tek çatı altında, sınırsız işlevsellik
        </h2>
        <p className="mt-4 text-muted-foreground">
          Onlarca ağır araç; ama karmaşa yok. Her şeye tek bir akışkan çalışma alanından erişirsin.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-6 transition hover:border-accent/40 hover:shadow-lg"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-accent-foreground">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
