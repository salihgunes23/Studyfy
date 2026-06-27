const LAYERS = [
  {
    badge: '⚡ Hızlı Bakış',
    title: 'Sınavdan 10 dakika önce',
    desc: 'Hayati noktaları madde madde, en fazla 15 satırda. Son tekrar için birebir.',
    sample: ['Türev = anlık değişim oranı', 'Çarpım kuralı: (uv)′ = u′v + uv′', 'Zincir kuralı kritik'],
  },
  {
    badge: '📚 Akademik Derinlik',
    title: 'Tüm detay, terim ve formüller',
    desc: 'Konuyu akademik dille, formülleri ve kaynak atıflarıyla eksiksiz açıklar.',
    sample: ['Limit tanımı ile türevin formal ispatı', 'L’Hôpital kuralı uygulamaları', 'Kaynak: s.14 ¶3'],
  },
  {
    badge: '🧸 Analojik Anlatım',
    title: 'Bana 5 yaşındaymışım gibi anlat',
    desc: 'Soyut kavramları günlük hayattan benzetmeler ve hikâyelerle sıfırdan kurar.',
    sample: ['Türev = arabanın hız göstergesi', 'Hız, yolun "o anki" değişimi', 'Korkutucu formül yok!'],
  },
];

export function LayersSection() {
  return (
    <section id="katmanlar" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Aynı konu, <span className="text-gradient">üç farklı derinlik</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Her dosya için üç anlatım katmanı aynı anda üretilir. Hangisi sana uygunsa onu seç.
        </p>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {LAYERS.map((l) => (
          <div key={l.badge} className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <span className="inline-flex w-fit rounded-lg bg-muted px-3 py-1 text-sm font-medium">
              {l.badge}
            </span>
            <h3 className="mt-4 font-semibold">{l.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{l.desc}</p>
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {l.sample.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-accent">›</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
