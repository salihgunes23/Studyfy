import { CheckCircle2, FileSearch, XCircle } from 'lucide-react';

export function TestEngine() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <FileSearch className="h-3.5 w-3.5 text-accent" /> Bağlamsal & kaynaklı
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Yapay zeka <span className="text-gradient">uydurmaz</span>, kaynak gösterir.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Test motoru, internetin genel bilgisinden değil yalnızca senin yüklediğin
            dökümanlardan soru üretir. Yanlış yaptığında cevabı söylemekle kalmaz; dökümandaki
            tam yeri gösterir ve eksik kaldığın yeri o an yeniden anlatır.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              'Çoktan seçmeli (YKS formatı), Doğru/Yanlış, Boşluk doldurma, Eşleştirme, Açık uçlu',
              'Her soru bir kaynak parçasına bağlıdır — doğrulanmadan gösterilmez',
              'Yanlışlar otomatik flashcard’a dönüşür',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <p className="text-xs text-muted-foreground">Trigonometri Denemesi · Soru 7/20</p>
          <p className="mt-3 font-medium">sin(2x) ifadesinin açılımı nedir?</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-accent" /> A) 2·sinx·cosx
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-400/5 px-3 py-2 text-muted-foreground">
              <XCircle className="h-4 w-4 text-red-400" /> B) sin²x − cos²x
            </div>
            <div className="rounded-lg border border-border px-3 py-2 text-muted-foreground">
              C) 1 − 2sin²x
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs">
            <p className="font-medium text-foreground">📄 Kaynak: Türev.pdf · s.14 · ¶3</p>
            <p className="mt-1 text-muted-foreground">
              sin(2x) = 2·sinx·cosx çift açı formülüdür. Hatırlatma: çift açı formülleri…
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
