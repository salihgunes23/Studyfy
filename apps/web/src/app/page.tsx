/**
 * Geçici landing — gerçek Dashboard/Workspace ekranları docs/DESIGN_SYSTEM.md ve
 * docs/PRD.md (bölüm 7: UI/UX) doğrultusunda inşa edilecek.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6">
      <div className="space-y-4">
        <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          v0.1 · Foundation
        </span>
        <h1 className="text-4xl font-semibold tracking-tight">
          Studfy — AI-Native Öğrenme İşletim Sistemi
        </h1>
        <p className="text-lg text-muted-foreground">
          Ne yüklersen yükle: PDF, taranmış el yazısı, amfi ses kaydı, YouTube dersi. Studfy
          onu saniyeler içinde anlaşılabilir, sorgulanabilir, test edilebilir ve dinlenebilir
          bilgiye çevirir. Sıfır halüsinasyon: yapay zeka yalnızca senin verinden konuşur.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        {[
          'Anything-to-Data yükleme',
          'Akıllı tasnif & semantik bağ',
          '3 katmanlı anlatım + podcast',
          'Sıfır-halüsinasyon test motoru',
          'Vektör arama (RAG)',
          'FSRS aralıklı tekrar',
        ].map((f) => (
          <div key={f} className="rounded-lg border border-border bg-muted/30 p-3">
            {f}
          </div>
        ))}
      </div>
    </main>
  );
}
