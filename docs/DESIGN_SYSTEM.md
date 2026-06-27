# Studfy — Tasarım Sistemi (DESIGN_SYSTEM.md)

> **AI-Native Öğrenme İşletim Sistemi için tek doğruluk kaynağı.**
> Bu doküman, bir frontend ekibinin temayı doğrudan implemente edebilmesi için somut token değerleri, `:root`/`.dark` CSS değişken blokları, `tailwind.config` snippet'leri ve shadcn/ui temelli bileşen kataloğu içerir.

| | |
|---|---|
| **Sürüm** | 1.0 |
| **Stack** | Next.js 15 (App Router, RSC) · Tailwind CSS · shadcn/ui + Radix · Tiptap · KaTeX |
| **Erişilebilirlik** | WCAG 2.1 AA |
| **Tema** | Dark-first + Light · sistem temasını izler |
| **Tasarım ethos'u** | *Maksimum işlevsellik, sıfır karmaşa.* |

---

## İçindekiler
1. [Tasarım İlkeleri & Marka](#1-tasarım-i̇lkeleri--marka)
2. [Design Tokens](#2-design-tokens)
3. [Tipografi Sistemi](#3-tipografi-sistemi)
4. [Renk & Tema](#4-renk--tema)
5. [Bileşen Kataloğu](#5-bileşen-kataloğu)
6. [Layout & Grid](#6-layout--grid)
7. [Etkileşim & Hareket](#7-etkileşim--hareket)
8. [İkonografi & İllüstrasyon](#8-i̇konografi--i̇llüstrasyon)
9. [Erişilebilirlik (a11y)](#9-erişilebilirlik-a11y)
10. [İçerik & Mikrocopy Yönergeleri](#10-i̇çerik--mikrocopy-yönergeleri)

---

## 1. Tasarım İlkeleri & Marka

### 1.1 Ethos
**"Maksimum işlevsellik, sıfır karmaşa."** Studfy onlarca ağır AI aracını (OCR, STT, RAG, test üretimi, spaced repetition) tek bir akışkan yüzeyde toplar — ama kullanıcı asla bir kontrol paneli kalabalığıyla karşılaşmaz. Arayüz, gücünü saklar; ortaya çıktığında da bağlama uygun çıkar.

Dört referansın sentezi:
- **Linear'ın yoğunluğu** → bilgi yoğun ama nefes alan, klavye-öncelikli, hızlı.
- **Notion'un sıcaklığı** → yumuşak yüzeyler, davetkâr boşluk, blok temelli düzen.
- **Apple'ın nefesi** → cömert whitespace, sakin hiyerarşi, ölçülü hareket.
- **Perplexity'nin token-stream hissi** → cevaplar token-token akar; bekleme bir "yükleniyor" değil, canlı bir düşünme deneyimidir.

### 1.2 Marka Sesi (Voice & Tone)
| Özellik | Açıklama | Örnek |
|---|---|---|
| **Net** | Jargonsuz, doğrudan. | "Dosyan hazır." (✓) — "İşlem başarıyla tamamlandı." (✗) |
| **Sıcak ama profesyonel** | Arkadaşça, asla çocuksu değil. | "Selam Elif 👋 Bugün 24 kart seni bekliyor." |
| **Güven veren** | AI iddialarını kaynağa bağlar. | "Türev.pdf · s.14 · ¶3'e göre…" |
| **Cesaretlendiren** | Hatayı öğrenme fırsatı olarak çerçeveler. | "Bu sefer olmadı — şuradan tekrar bakalım." |

Detaylı ton kuralları için → [Bölüm 10](#10-i̇çerik--mikrocopy-yönergeleri).

### 1.3 "Sıfır Karmaşa" Kuralları (zorunlu)
1. **Progressive disclosure varsayılan.** Gelişmiş ayarlar, ikincil eylemler `⌘K` veya "…" (overflow) arkasında durur. Birincil ekranda yalnızca bir sonraki adım görünür.
2. **Ekran başına tek birincil eylem.** Her ekranda görsel olarak baskın yalnızca bir `primary` buton olur.
3. **Komut tabanlı navigasyon.** Her özelliğe `⌘K` Command Palette'ten erişilebilir olmalı; menü derinliği 2 seviyeyi geçmez.
4. **Boşluk bir özelliktir.** Sıkıştırmak yerine grupla; ilişkisiz öğeleri ayırmak için boşluk kullan, çizgi değil.
5. **Renk anlam taşır.** Vurgu rengi (indigo) yalnızca etkileşim ve marka için; semantik renkler yalnızca durum için. Dekoratif renk yok.
6. **Hareket bilgi verir.** Animasyon yalnızca durum değişimini, mekânsal ilişkiyi veya akışı iletmek içindir. Süs animasyonu yok.
7. **Asla boş ekran.** Her boş durum bir sonraki eylemi önerir (bkz. `EmptyState`).
8. **Kaynaksız AI iddiası yok.** AI tarafından üretilen her metin, bir `CitationChip` ile kaynağa bağlanabilmeli.

---

## 2. Design Tokens

Token'lar üç katmanda yaşar:
- **Primitive (ham) tokenlar:** Ölçekteki ham değerler (`--indigo-500: 239 84% 67%`). Doğrudan UI'da kullanılmaz.
- **Semantic (anlamsal) tokenlar:** Role bağlı (`--background`, `--primary`, `--destructive`). UI bunları kullanır. shadcn/ui konvansiyonuyla uyumlu.
- **Component tokenları:** Gerektiğinde bileşene özel (`--sidebar-background`).

> **Renk formatı:** Tüm renkler **HSL kanal değerleri** olarak saklanır (`H S% L%`, `hsl()` sarmalı olmadan). Bu, Tailwind/shadcn'in `hsl(var(--token) / <alpha-value>)` opaklık modifiye desenini mümkün kılar.

### 2.1 Primitive renk ölçekleri

#### Neutral (Zinc) — gri iskelet
| Token | HSL | Hex (~) |
|---|---|---|
| `--zinc-50`  | `240 5% 96%`  | `#f4f4f5` |
| `--zinc-100` | `240 5% 90%`  | `#e4e4e7` |
| `--zinc-200` | `240 4% 82%`  | `#d4d4d8` |
| `--zinc-300` | `240 4% 70%`  | `#a1a1aa` |
| `--zinc-400` | `240 4% 55%`  | `#8b8b94` |
| `--zinc-500` | `240 4% 46%`  | `#71717a` |
| `--zinc-600` | `240 5% 34%`  | `#52525b` |
| `--zinc-700` | `240 5% 26%`  | `#3f3f46` |
| `--zinc-800` | `240 4% 16%`  | `#27272a` |
| `--zinc-850` | `240 5% 12%`  | `#1c1c1f` |
| `--zinc-900` | `240 6% 10%`  | `#18181b` |
| `--zinc-950` | `240 8% 6%`   | `#0c0c0e` |

#### Indigo — birincil vurgu (accent)
| Token | HSL | Hex (~) |
|---|---|---|
| `--indigo-50`  | `226 100% 97%` | `#eef2ff` |
| `--indigo-100` | `226 100% 94%` | `#e0e7ff` |
| `--indigo-200` | `228 96% 89%`  | `#c7d2fe` |
| `--indigo-300` | `230 94% 82%`  | `#a5b4fc` |
| `--indigo-400` | `234 89% 74%`  | `#818cf8` |
| `--indigo-500` | `239 84% 67%`  | `#6366f1` |
| `--indigo-600` | `243 75% 59%`  | `#4f46e5` |
| `--indigo-700` | `245 58% 51%`  | `#4338ca` |
| `--indigo-800` | `244 55% 41%`  | `#3730a3` |
| `--indigo-900` | `242 47% 34%`  | `#312e81` |

#### Violet — ikincil vurgu (gradientler, AI vurgusu)
| Token | HSL | Hex (~) |
|---|---|---|
| `--violet-400` | `255 92% 76%` | `#a78bfa` |
| `--violet-500` | `258 90% 66%` | `#8b5cf6` |
| `--violet-600` | `262 83% 58%` | `#7c3aed` |

> **AI brand gradient:** `linear-gradient(135deg, hsl(var(--indigo-500)), hsl(var(--violet-500)))` — yalnızca AI üretimi / "büyülü" anları işaretlemek için (token-stream başlığı, Command Palette AI ipucu, Podcast üret butonu glow).

#### Semantik renk ailesi
| Aile | 500 (HSL) | Hex | Kullanım |
|---|---|---|---|
| **Success** | `142 71% 45%` | `#22c55e` | Hazır, doğru cevap, onay |
| **Warning** | `38 92% 50%`  | `#f59e0b` | Düşük güven, kota uyarısı |
| **Danger**  | `0 72% 51%`   | `#dc2626` | Hata, yanlış cevap, sil |
| **Info**    | `217 91% 60%` | `#3b82f6` | İpucu, nötr bilgilendirme |

Her ailenin `*-soft` (arka plan tonu) ve `*-fg` (üzerine yazı) varyantları aşağıdaki `:root` bloklarında tanımlıdır.

### 2.2 `:root` (Light) ve `.dark` semantic token blokları

```css
/* globals.css */
@layer base {
  :root {
    /* — Yüzeyler (Light = nötr beyaz/zinc) — */
    --background:            0 0% 100%;        /* #ffffff */
    --foreground:            240 6% 10%;       /* zinc-900 */
    --card:                  0 0% 100%;
    --card-foreground:       240 6% 10%;
    --popover:               0 0% 100%;
    --popover-foreground:    240 6% 10%;
    --surface-1:             240 5% 98%;       /* hafif yükseltilmiş panel */
    --surface-2:             240 5% 96%;       /* zinc-50 */

    /* — Marka / vurgu — */
    --primary:               243 75% 59%;      /* indigo-600 */
    --primary-foreground:    0 0% 100%;
    --primary-hover:         245 58% 51%;      /* indigo-700 */
    --accent:                226 100% 97%;     /* indigo-50, soft hover yüzeyi */
    --accent-foreground:     243 75% 59%;

    /* — İkincil / sessiz — */
    --secondary:             240 5% 96%;
    --secondary-foreground:  240 5% 26%;
    --muted:                 240 5% 96%;
    --muted-foreground:      240 4% 46%;       /* zinc-500 */

    /* — Kenarlık, input, ring — */
    --border:                240 6% 90%;       /* zinc-100/200 arası */
    --input:                 240 6% 90%;
    --ring:                  243 75% 59%;      /* odak halkası = primary */

    /* — Semantik durum — */
    --success:        142 71% 45%;  --success-foreground: 0 0% 100%;
    --success-soft:   142 60% 94%;  --success-fg:         142 72% 29%;
    --warning:        38 92% 50%;   --warning-foreground: 38 95% 12%;
    --warning-soft:   38 92% 95%;   --warning-fg:         32 81% 29%;
    --destructive:    0 72% 51%;    --destructive-foreground: 0 0% 100%;
    --danger-soft:    0 86% 96%;    --danger-fg:          0 70% 35%;
    --info:           217 91% 60%;  --info-foreground:    0 0% 100%;
    --info-soft:      217 91% 95%;  --info-fg:            217 80% 34%;

    /* — Dosya işleme durumları (FileCard) — */
    --status-queued:     240 4% 46%;   /* zinc-500  */
    --status-extracting: 217 91% 60%;  /* info      */
    --status-embedding:  258 90% 66%;  /* violet    */
    --status-ready:      142 71% 45%;  /* success   */
    --status-failed:     0 72% 51%;    /* danger    */

    /* — Bileşen tokenları — */
    --sidebar-background:   240 5% 98%;
    --sidebar-foreground:   240 5% 26%;
    --sidebar-border:       240 6% 90%;
    --sidebar-accent:       226 100% 97%;
    --tabbar-background:    0 0% 100%;
    --tab-active:           0 0% 100%;
    --tab-inactive-fg:      240 4% 46%;
    --citation:             243 75% 59%;
    --code-bg:              240 5% 96%;

    /* — Radius — */
    --radius:               0.625rem;          /* 10px temel */

    /* — Elevation (light) — */
    --shadow-color:         240 6% 10%;
  }

  .dark {
    /* — Yüzeyler (Dark-first, zinc tabanlı) — */
    --background:            240 8% 6%;         /* zinc-950, ana zemin */
    --foreground:            240 5% 90%;        /* zinc-100 */
    --card:                  240 6% 10%;        /* zinc-900 */
    --card-foreground:       240 5% 90%;
    --popover:              240 5% 12%;         /* zinc-850, palette/menü */
    --popover-foreground:    240 5% 90%;
    --surface-1:             240 6% 10%;        /* panel */
    --surface-2:             240 5% 12%;        /* yükseltilmiş panel */

    /* — Marka / vurgu (dark'ta bir adım açık) — */
    --primary:               234 89% 74%;       /* indigo-400 — dark zeminde AA */
    --primary-foreground:    240 8% 6%;
    --primary-hover:         230 94% 82%;       /* indigo-300 */
    --accent:                243 47% 18%;       /* derin indigo soft yüzey */
    --accent-foreground:     230 94% 82%;

    /* — İkincil / sessiz — */
    --secondary:             240 5% 14%;
    --secondary-foreground:  240 5% 84%;
    --muted:                 240 5% 14%;
    --muted-foreground:      240 4% 60%;        /* zinc-400, dark'ta AA için yükseltildi */

    /* — Kenarlık, input, ring — */
    --border:                240 5% 18%;        /* ince, düşük kontrast ayraç */
    --input:                 240 5% 20%;
    --ring:                  234 89% 74%;

    /* — Semantik durum (dark'ta ayarlı) — */
    --success:        142 69% 58%;  --success-foreground: 240 8% 6%;
    --success-soft:   142 40% 16%;  --success-fg:         142 64% 70%;
    --warning:        38 95% 60%;   --warning-foreground: 38 95% 8%;
    --warning-soft:   38 60% 16%;   --warning-fg:         38 92% 70%;
    --destructive:    0 72% 58%;    --destructive-foreground: 0 0% 100%;
    --danger-soft:    0 50% 18%;    --danger-fg:          0 88% 78%;
    --info:           217 91% 66%;  --info-foreground:    240 8% 6%;
    --info-soft:      217 50% 18%;  --info-fg:            217 91% 78%;

    /* — Dosya işleme durumları — */
    --status-queued:     240 4% 60%;
    --status-extracting: 217 91% 66%;
    --status-embedding:  255 92% 76%;
    --status-ready:      142 69% 58%;
    --status-failed:     0 72% 58%;

    /* — Bileşen tokenları — */
    --sidebar-background:   240 8% 5%;          /* ana zeminden bir tık koyu */
    --sidebar-foreground:   240 5% 78%;
    --sidebar-border:       240 5% 14%;
    --sidebar-accent:       243 47% 18%;
    --tabbar-background:    240 8% 6%;
    --tab-active:           240 6% 10%;
    --tab-inactive-fg:      240 4% 55%;
    --citation:             234 89% 74%;
    --code-bg:              240 6% 12%;

    --shadow-color:         240 30% 2%;
  }
}
```

### 2.3 Spacing ölçeği

4px taban grid. Tailwind'in varsayılan ölçeğini koruruz; kritik adımlar:

| Token | Değer | Kullanım |
|---|---|---|
| `space-0.5` | 2px  | hairline ayrım, ikon-yazı mikro boşluk |
| `space-1`   | 4px  | en küçük iç boşluk |
| `space-1.5` | 6px  | chip iç boşluk |
| `space-2`   | 8px  | ikon-yazı boşluğu, kompakt padding |
| `space-3`   | 12px | input dikey padding, liste satır boşluğu |
| `space-4`   | 16px | **temel ritim birimi** — kart padding, bölüm içi |
| `space-5`   | 20px | |
| `space-6`   | 24px | kart padding (geniş), bölümler arası |
| `space-8`   | 32px | büyük bölüm ayrımı |
| `space-12`  | 48px | sayfa dikey ritmi |
| `space-16`  | 64px | hero / boş durum üst boşluk |

**Kural:** Boşluklar 4'ün katı olmalı (`2px` hairline istisna). Dikey ritim 8px gridine oturur.

### 2.4 Radius ölçeği

```
--radius: 0.625rem;  /* 10px */
```
| Token | Hesap | Değer | Kullanım |
|---|---|---|---|
| `rounded-sm` | `calc(var(--radius) - 4px)` | 6px  | chip, badge, küçük input |
| `rounded-md` | `calc(var(--radius) - 2px)` | 8px  | buton, input, select |
| `rounded-lg` | `var(--radius)`             | 10px | kart, dialog, popover |
| `rounded-xl` | `calc(var(--radius) + 4px)` | 14px | büyük kart, sheet, modal |
| `rounded-2xl`| `calc(var(--radius) + 8px)` | 18px | hero kapsayıcı, yükleme dropzone |
| `rounded-full` | `9999px` | — | avatar, ProgressRing, pill, ikon-buton |

### 2.5 Tipografi ölçeği

| Rol | Token | Boyut / Satır yüksekliği | Ağırlık | Letter-spacing |
|---|---|---|---|---|
| Display | `text-display` | 36px / 40px | 700 | -0.02em |
| H1 | `text-3xl` | 30px / 36px | 600 | -0.02em |
| H2 | `text-2xl` | 24px / 32px | 600 | -0.015em |
| H3 | `text-xl`  | 20px / 28px | 600 | -0.01em |
| H4 | `text-lg`  | 18px / 28px | 600 | normal |
| Body (varsayılan) | `text-base` | 15px / 24px | 400 | normal |
| Body-sm | `text-sm` | 13px / 20px | 400 | normal |
| Caption / meta | `text-xs` | 12px / 16px | 500 | normal |
| Micro (etiket) | `text-2xs` | 11px / 14px | 600 | 0.04em (UPPERCASE label) |
| Akademik okuma (serif) | `text-reading` | 18px / 30px | 400 | normal |
| Mono (kod/formül) | `text-code` | 13px / 20px | 450 | normal |

> **Not:** Varsayılan body 15px'tir (Linear yoğunluğu için 16px'ten bir tık küçük, ama 14px'ten okunaklı). Akademik katman serif + 18px ile uzun okuma konforu sağlar.

### 2.6 Font aileleri
| Token | Font stack | Kullanım |
|---|---|---|
| `--font-sans` | `'Inter', -apple-system, 'Segoe UI', sans-serif` | Tüm UI |
| `--font-serif` | `'Source Serif 4', Georgia, 'Times New Roman', serif` | Akademik derinlik katmanı, uzun okuma |
| `--font-mono` | `'JetBrains Mono', 'SFMono-Regular', Menlo, monospace` | Kod, inline formül çevresi, KaTeX fallback, locator |

`next/font` ile yüklenir; `font-display: swap`, latin + latin-ext subset (Türkçe karakterler için **latin-ext zorunlu**).

### 2.7 Shadow / Elevation

Dark-first için gölgeler düşük opaklıkta; ışık ayrımı çoğunlukla yüzey rengi farkıyla yapılır (gölge ikincil).

```css
:root {
  --elevation-0: none;
  --elevation-1: 0 1px 2px 0 hsl(var(--shadow-color) / 0.06);
  --elevation-2: 0 2px 4px -1px hsl(var(--shadow-color) / 0.08),
                 0 1px 2px -1px hsl(var(--shadow-color) / 0.06);
  --elevation-3: 0 8px 16px -4px hsl(var(--shadow-color) / 0.10),
                 0 2px 4px -2px hsl(var(--shadow-color) / 0.06);
  --elevation-4: 0 16px 32px -8px hsl(var(--shadow-color) / 0.14),
                 0 4px 8px -4px hsl(var(--shadow-color) / 0.08);
  --glow-primary: 0 0 0 1px hsl(var(--primary) / 0.25),
                  0 4px 20px -2px hsl(var(--primary) / 0.35);
}
.dark {
  --elevation-1: 0 1px 2px 0 hsl(var(--shadow-color) / 0.4);
  --elevation-2: 0 2px 6px -1px hsl(var(--shadow-color) / 0.5);
  --elevation-3: 0 8px 24px -4px hsl(var(--shadow-color) / 0.6);
  --elevation-4: 0 16px 40px -8px hsl(var(--shadow-color) / 0.7);
}
```

| Elevation | Kullanım |
|---|---|
| 0 | Gömülü, zemin |
| 1 | Kart, FileCard (resting) |
| 2 | Dropdown, Tooltip, hover'da kart |
| 3 | Popover, Combobox, Toast |
| 4 | Dialog, Sheet, Command Palette |
| `glow-primary` | AI/birincil odak vurgusu (Podcast üret, streaming aktif) |

### 2.8 Z-index katmanları

```css
--z-base:        0;
--z-sticky:      10;   /* yapışkan başlıklar, tab bar */
--z-dropdown:    20;   /* select, combobox menü */
--z-sidebar:     30;   /* mobil drawer */
--z-overlay:     40;   /* dialog/sheet arka karartma */
--z-modal:       50;   /* dialog, sheet */
--z-popover:     60;   /* tooltip, popover (modal üstünde olabilir) */
--z-command:     70;   /* ⌘K Command Palette — her şeyin üstünde */
--z-toast:       80;   /* bildirimler */
--z-max:         9999; /* a11y skip-link, debug */
```

### 2.9 Motion token'ları

```css
--duration-instant: 75ms;   /* anlık state flip (checkbox) */
--duration-fast:    150ms;  /* hover, küçük geçiş */
--duration-base:    200ms;  /* varsayılan — çoğu geçiş */
--duration-slow:    250ms;  /* panel/sheet giriş-çıkış */
--duration-slower:  350ms;  /* sayfa düzeyi, büyük layout */

--ease-out:     cubic-bezier(0.16, 1, 0.3, 1);     /* varsayılan — giriş, açılma */
--ease-in-out:  cubic-bezier(0.65, 0, 0.35, 1);    /* simetrik hareket */
--ease-in:      cubic-bezier(0.4, 0, 1, 1);         /* çıkış, kaybolma */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);  /* hafif zıplama (toast, badge) */
```

**Kural:** Etkileşim geçişleri 150–250ms arası, `ease-out` varsayılan. 350ms'i yalnızca büyük layout değişimleri aşabilir. Bkz. [Bölüm 7](#7-etkileşim--hareket).

### 2.10 Breakpoint'ler

| Token | min-width | Hedef | Davranış |
|---|---|---|---|
| `sm`  | 640px  | Büyük telefon | Tek kolon, sidebar drawer |
| `md`  | 768px  | Tablet | Sidebar collapse-icon, context panel gizli |
| `lg`  | 1024px | Laptop | Sidebar + içerik; context panel toggle ile |
| `xl`  | 1280px | Masaüstü | **Üçlü kolon** tam açık (explorer + viewer + AI panel) |
| `2xl` | 1536px | Geniş monitör | Maks içerik genişliği `--content-max: 1600px`, kenar boşlukları büyür |

### 2.11 `tailwind.config.ts` — `theme.extend` snippet

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1600px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "surface-1": "hsl(var(--surface-1))",
        "surface-2": "hsl(var(--surface-2))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          soft: "hsl(var(--success-soft))",
          fg: "hsl(var(--success-fg))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          soft: "hsl(var(--warning-soft))",
          fg: "hsl(var(--warning-fg))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          soft: "hsl(var(--danger-soft))",
          fg: "hsl(var(--danger-fg))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          soft: "hsl(var(--info-soft))",
          fg: "hsl(var(--info-fg))",
        },
        status: {
          queued: "hsl(var(--status-queued))",
          extracting: "hsl(var(--status-extracting))",
          embedding: "hsl(var(--status-embedding))",
          ready: "hsl(var(--status-ready))",
          failed: "hsl(var(--status-failed))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          accent: "hsl(var(--sidebar-accent))",
        },
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.04em", fontWeight: "600" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.015em" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
        display: ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        reading: ["1.125rem", { lineHeight: "1.875rem" }],
        code: ["0.8125rem", { lineHeight: "1.25rem" }],
      },
      boxShadow: {
        "elevation-1": "var(--elevation-1)",
        "elevation-2": "var(--elevation-2)",
        "elevation-3": "var(--elevation-3)",
        "elevation-4": "var(--elevation-4)",
        "glow-primary": "var(--glow-primary)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        instant: "75ms", fast: "150ms", base: "200ms", slow: "250ms", slower: "350ms",
      },
      zIndex: {
        sticky: "10", dropdown: "20", sidebar: "30", overlay: "40",
        modal: "50", popover: "60", command: "70", toast: "80",
      },
      maxWidth: { content: "1600px", reading: "68ch", prose: "75ch" },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-in-right": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        "caret-blink": { "0%,70%,100%": { opacity: "1" }, "20%,50%": { opacity: "0" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "ring-progress": { from: { strokeDashoffset: "var(--ring-circumference)" }, to: { strokeDashoffset: "var(--ring-offset)" } },
      },
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.16,1,0.3,1)",
        "slide-up": "slide-up 250ms cubic-bezier(0.16,1,0.3,1)",
        "slide-in-right": "slide-in-right 250ms cubic-bezier(0.16,1,0.3,1)",
        "caret-blink": "caret-blink 1s steps(1) infinite",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
```

---

## 3. Tipografi Sistemi

### 3.1 Üç bağlam, üç font
Studfy'da metin üç farklı bağlamda yaşar ve her birinin kendi fontu ve ritmi vardır:

1. **UI metni (Inter, sans):** Tüm arayüz — etiketler, butonlar, navigasyon, meta. Yoğun, net, 15px taban. Letter-spacing başlıklarda negatif (sıkı, modern his).
2. **Akademik okuma (Source Serif 4, serif):** Yalnızca "📚 Akademik Derinlik" katmanı ve uzun türetilmiş içerik. 18px / 30px satır yüksekliği, satır uzunluğu `max-w-reading` (≈68ch). Serif, uzun okumada konfor ve "kitap" hissi verir; Notion'un sıcaklığını taşır.
3. **Mono (JetBrains Mono):** Kod blokları, inline kod, kaynak `locator` (`s.14 · ¶3`), formül çevresi ve KaTeX'in metin fallback'i.

### 3.2 Type ramp (uygulama)
```tsx
<h1 className="text-3xl font-semibold text-foreground">Çalışma Alanım</h1>
<h2 className="text-2xl font-semibold">Türev</h2>
<p className="text-base text-foreground">Standart arayüz metni.</p>
<p className="text-sm text-muted-foreground">İkincil / yardımcı bilgi.</p>
<span className="text-2xs uppercase text-muted-foreground">DURUM</span>

{/* Akademik katman */}
<article className="font-serif text-reading max-w-reading text-foreground">
  Uzun akademik anlatım metni…
</article>

{/* Mono */}
<code className="font-mono text-code rounded-sm bg-[hsl(var(--code-bg))] px-1.5 py-0.5">
  source_chunk_id
</code>
```

### 3.3 Kullanım kuralları
- **Bir ekranda en fazla 3 type seviyesi** aktif olsun (hiyerarşi netliği).
- Body metinde **asla** 600+ ağırlık kullanma; vurgu için `text-foreground` vs `text-muted-foreground` renk kontrastı yeterli.
- Başlıklarda **semibold (600)** standarttır; 700 yalnızca `display` ve marka anlarında.
- Satır uzunluğu okunabilir metinde **45–75 karakter** arası (`max-w-reading` / `max-w-prose`).
- Türkçe karakterler (ı, İ, ğ, ş, ç, ö, ü) için **latin-ext subset zorunlu**; `İ`/`ı` büyük-küçük dönüşümünde `lang="tr"` özniteliği `<html>` üzerinde olmalı (CSS `text-transform: uppercase` doğru çalışsın).

### 3.4 KaTeX stillemesi
Matematik formülleri **KaTeX** ile render edilir (`katex/dist/katex.min.css` import edilir).

- **Inline formül** (`$...$`): satır içi akışla hizalı, `font-size: 1em`, çevre metinle aynı renk (`currentColor`).
- **Blok formül** (`$$...$$`): ortalanmış, üst/alt `space-4` boşluk, yatay taşmada `overflow-x: auto`.
- **Tema uyumu:** KaTeX varsayılan siyah render eder; dark mode için override zorunlu:

```css
.katex { color: hsl(var(--foreground)); font-size: 1.05em; }
.katex-display { margin: 1rem 0; overflow-x: auto; overflow-y: hidden; padding: 0.25rem 0; }
.katex-display > .katex { color: hsl(var(--foreground)); }
/* Vurgulanan formül (test sorusunda atıf) */
.katex-highlight { background: hsl(var(--warning-soft)); border-radius: var(--radius-sm); padding: 0 .2em; }
```
- Akademik katmanda formüller serif gövde içinde yaşadığından, KaTeX'in kendi (KaTeX_Main) fontu korunur — gövde fontuyla çakışmaz. Yalnızca renk token'a bağlanır.

---

## 4. Renk & Tema

### 4.1 Dark-first stratejisi
Studfy **karanlık modu varsayılan** kabul eder (uzun çalışma seanslarında göz konforu, "odak" hissi). Light mode tam eşdeğer kalitede ikinci sınıf değildir. Her iki tema da `next-themes` ile `class` stratejisinde yönetilir; ilk yüklemede sistem temasını izler, kullanıcı seçimi `localStorage`'da kalır.

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
```
> `disableTransitionOnChange` — tema geçişinde tüm sayfanın renk-flash'ını önler (ani değil, ama animasyonsuz net geçiş).

### 4.2 Yüzey katmanlama (elevation by surface)
Renkle derinlik dark mode'da gölgeyle değil **yüzey rengi farkıyla** kurulur:

| Katman | Light | Dark | Kullanım |
|---|---|---|---|
| Zemin (background) | `#ffffff` | `zinc-950` | Ana app zemini |
| Sidebar | `surface-1` | `zinc-950` − bir tık | Navigasyon |
| Kart / panel | `card` (#fff) | `zinc-900` | İçerik blokları |
| Yükseltilmiş (popover/menü) | `#fff` + gölge | `zinc-850` | Dropdown, palette |

**Kural:** Üst üste binen yüzeyler bir adım açılır (dark) veya gölge kazanır (light). İki bitişik yüzey aynı renkse aralarına `border` koy.

### 4.3 Vurgu kısıtlaması (accent restraint)
İndigo, dikkat ekonomisinin para birimidir; israf edilmez.
- **Yalnızca:** birincil butonlar, aktif nav öğesi, odak halkası (ring), seçili durum, link, `CitationChip`, AI marka anları.
- **Asla:** geniş arka plan dolgusu, dekoratif şeritler, ikon renklendirme (ikonlar `muted-foreground` veya `foreground`).
- Bir ekranda indigo dolu yüzey oranı **%10'u geçmemeli** (göz, birincil eyleme anında kilitlensin).
- `violet`/AI gradienti yalnızca AI üretimi anları işaretler (Podcast üret, streaming başlığı). Genel UI'da kullanılmaz.

### 4.4 Semantik renk kullanımı
- Durum renkleri **yalnızca durum** içindir; marka/dekorasyon değil.
- Her durum **renkten bağımsız** ikincil sinyal taşımalı (ikon + metin) — renk körlüğü güvencesi (bkz. [Bölüm 9](#9-erişilebilirlik-a11y)).
- `*-soft` arka plan + `*-fg` yazı kombinasyonu badge/banner için; `DEFAULT` + `*-foreground` dolu butonlar için.

```tsx
{/* Doğru cevap bandı */}
<div className="flex items-center gap-2 rounded-md bg-success-soft px-3 py-2 text-success-fg">
  <CheckCircle2 className="size-4" /> <span className="text-sm font-medium">Doğru cevap: A</span>
</div>
```

### 4.5 Kontrast (WCAG 2.1 AA)
- Normal metin (< 18px) ≥ **4.5:1**; büyük metin (≥ 18px bold / 24px) ≥ **3:1**.
- UI bileşen kenarları, ikon-buton sınırları, odak göstergesi ≥ **3:1**.
- `muted-foreground` token değerleri **her iki temada AA'yı geçecek şekilde** ayarlandı (dark'ta `zinc-400`, light'ta `zinc-500`). Daha açık gri kullanma.
- Birincil buton metni (`primary-foreground`) primary üzerinde AA: light'ta beyaz/indigo-600 = 4.6:1 ✓; dark'ta `zinc-950`/indigo-400 = 8.9:1 ✓.
- Devre dışı (disabled) durumlar AA'dan muaftır ama yine de okunur kalmalı (`opacity-50` + `cursor-not-allowed`).

---

## 5. Bileşen Kataloğu

Tüm bileşenler **shadcn/ui + Radix primitives** temelli; `cn()` (clsx + tailwind-merge) ile sınıf birleştirme, `cva` ile varyant yönetimi. Her bileşen `forwardRef`, `asChild` (Radix Slot) ve `data-*` durum öznitelikleri destekler.

> **Ortak a11y kuralları (hepsine uygulanır):** görünür `:focus-visible` ring (`ring-2 ring-ring ring-offset-2 ring-offset-background`); klavyeyle tam erişim; etkileşimli ikonlarda `aria-label`; durum değişimleri `aria-live` ile duyurulur.

### 5.1 Button
**Amaç:** Birincil eylem tetikleyici.
**Varyantlar (`variant`):** `primary` · `secondary` · `outline` · `ghost` · `destructive` · `link` · `ai` (gradient + glow, yalnızca AI eylemleri).
**Boyutlar (`size`):** `sm` (h-8) · `default` (h-9) · `lg` (h-10) · `icon` (kare, h-9).
**Durumlar:** default, hover, active (`scale-[0.98]`), focus-visible, disabled (`opacity-50`), `loading` (spinner + metin kalır, buton genişliği sabit, `aria-busy`).

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
  "transition-[colors,transform] duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-elevation-1",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
        ai: "bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--violet-500)))] text-white shadow-glow-primary hover:opacity-95",
      },
      size: { sm: "h-8 px-3", default: "h-9 px-4", lg: "h-10 px-6", icon: "size-9" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);
```
**a11y:** `icon` boyutunda `aria-label` zorunlu; `loading` durumunda `disabled` + `aria-busy="true"`.

### 5.2 Input / Textarea
**Amaç:** Tek/çok satırlı metin girişi.
**Props:** `error?`, `leftIcon?`, `rightSlot?` (Input); `autoResize?` (Textarea, min/max satır).
**Durumlar:** default, focus (ring + border-primary), error (`border-destructive` + alt yardım metni `text-destructive`), disabled, readonly.
```tsx
<input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm
  placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-ring focus-visible:border-primary disabled:opacity-50
  aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30" />
```
**a11y:** `<label>` ile bağlı (`htmlFor`/`id`); hata metni `aria-describedby` ile; `aria-invalid` error'da.

### 5.3 Select / Combobox
**Amaç:** Select = sabit liste seçimi (Radix Select); Combobox = aranabilir/filtrelenebilir (cmdk + Popover).
**Props:** `options`, `value`, `onValueChange`, `searchable` (Combobox), `multiple?`, `placeholder`.
**Durumlar:** kapalı, açık (menü `z-dropdown`, `slide-up`), seçili (✓ + `bg-accent`), boş arama sonucu (`EmptyState` mini).
**a11y:** Radix tam klavye (↑↓ gezinme, Enter seç, Esc kapat, type-ahead); `role="listbox"`/`option`; aktif öğe `aria-selected`.

### 5.4 Dialog / Sheet
**Amaç:** Dialog = merkez modal (onay, kısa form); Sheet = kenardan kayan panel (detay, ayarlar).
**Props:** `open`, `onOpenChange`, `side` (Sheet: top/right/bottom/left).
**Durumlar:** kapalı, açılıyor (`fade-in` overlay + `slide-up`/`slide-in-right` içerik), açık, kapanıyor.
**Elevation:** `elevation-4`, overlay `bg-background/70 backdrop-blur-sm` (`z-overlay`), içerik `z-modal`.
**a11y:** **Focus trap** (Radix), açılışta ilk odaklanabilir öğeye focus, Esc kapatır, kapanışta focus tetikleyiciye döner; `role="dialog"` + `aria-labelledby`/`aria-describedby`. Sheet'te `aria-modal="true"`.

### 5.5 Tabs
**Amaç:** İçerik bölümleri arası geçiş — Workspace katman sekmeleri (⚡/📚/🧸), doküman sekmeleri (Görüntü/Özet/Test/Kart).
**Varyantlar:** `underline` (alt çizgi, varsayılan), `pill` (segmented control).
**Durumlar:** inactive (`text-muted-foreground`), active (`text-foreground` + alt indigo çizgi/dolu pill), hover, focus, disabled.
**Hareket:** Aktif gösterge `layoutId` (Framer Motion) ile kayar — 200ms `ease-out`.
**a11y:** Radix Tabs (← → gezinme, Home/End); `role="tablist"`; `aria-selected`; içerik `role="tabpanel"`.

### 5.6 Card
**Amaç:** İçerik kapsayıcı (Dashboard widget'ları, FileCard tabanı).
**Anatomi:** `CardHeader` (title + description + action slot) / `CardContent` / `CardFooter`.
**Varyantlar:** `default`, `interactive` (hover'da `elevation-2` + `border-primary/30`, `cursor-pointer`), `ghost` (kenarlıksız).
```tsx
<div className="rounded-lg border border-border bg-card text-card-foreground shadow-elevation-1
  transition-shadow duration-base hover:shadow-elevation-2" />
```
**a11y:** Tıklanabilir kart `<button>`/`<a>` sarmalı veya `role="button"` + `tabIndex={0}` + Enter/Space handler.

### 5.7 Tooltip
**Amaç:** Kısa, opsiyonel açıklama (ikon-buton etiketi, kısaltılmış metin).
**Props:** `content`, `side`, `delayDuration` (varsayılan 300ms).
**Durumlar:** gizli, görünür (`fade-in` + 4px offset), kısa metin (max-w-xs).
**a11y:** Radix Tooltip; **klavye odağıyla da açılır**; ama tooltip kritik bilgi taşıyamaz (yalnızca yardımcı). İkon-buton zaten `aria-label` taşır.

### 5.8 Toast
**Amaç:** Geçici, kesintisiz bildirim ("Dosya hazır", "Karta eklendi", hata).
**Varyantlar:** `default`, `success`, `warning`, `destructive`, `loading` (kalıcı, işlem bitince güncellenir → optimistic upload).
**Props:** `title`, `description?`, `action?` ("Geri al"), `duration` (varsayılan 5s; loading = ∞).
**Konum:** sağ-alt, `z-toast`, stacking; giriş `slide-up` + `spring`.
**a11y:** `role="status"` (default) / `role="alert"` (destructive); `aria-live="polite"`/`"assertive"`; otomatik kapanma ekran okuyucuyu engellemez; "Geri al" klavyeyle erişilebilir.

### 5.9 Command Palette (⌘K)
**Amaç:** Uygulamanın sinir merkezi — aç, ara, üret, git, çalıştır. "Sıfır karmaşa"nın motoru.
**Teknoloji:** `cmdk` + Dialog. `⌘K` / `Ctrl+K` ile her yerden açılır.
**Anatomi:** arama input'u (üstte, autofocus) → gruplu sonuç listesi (Eylemler / Dosyalar / Konular / AI) → footer ipuçları (↑↓ gezin, ↵ seç, esc kapat).
**Durumlar:** boş (son/önerilen eylemler), yazılıyor (fuzzy filtre, anlık), AI modu (sorgu → `ai` gradient ipucu + token-stream cevap), sonuç yok (`EmptyState`).
**Elevation:** `z-command` (her şeyin üstünde), `elevation-4`, `bg-popover`, geniş radius (`rounded-xl`).
**a11y:** Tam klavye; `role="combobox"` + `aria-expanded`; aktif öğe `aria-activedescendant`; focus trap; Esc kapatır; ekran okuyucuya sonuç sayısı `aria-live` ile.

### 5.10 Sidebar
**Amaç:** Birincil navigasyon — Dashboard, Çalışma (klasör ağacı), Keşfet, Tekrar, Analitik, Yükle.
**Varyantlar:** `expanded` (240px, ikon + etiket), `collapsed` (56px, yalnız ikon + tooltip), `mobile-drawer` (overlay, `z-sidebar`).
**Durumlar:** nav öğesi default / hover (`bg-sidebar-accent`) / active (indigo metin + sol 2px indigo şerit) / focus; klasör ağacı expand/collapse (chevron rotate 200ms).
**Davranış:** `lg` altında collapse-icon; `md` altında drawer. Genişlik kullanıcı tercihi olarak saklanır.
**a11y:** `<nav aria-label="Ana navigasyon">`; aktif öğe `aria-current="page"`; klasör ağacı `role="tree"`/`treeitem` + `aria-expanded`; collapsed modda etiket `aria-label` / tooltip ile korunur.

### 5.11 TabBar
**Amaç:** Workspace'in çoklu açık panelleri ([Türev.pdf] [Test] [Sohbet] [+]) — tarayıcı sekmesi metaforu.
**Props:** `tabs[]` (id, title, icon, dirty?, closable), `activeId`, `onReorder` (drag), `onClose`.
**Durumlar:** active (`bg-tab-active`, üst 2px indigo) / inactive (`text-tab-inactive-fg`) / hover (kapatma × belirir) / dirty (kaydedilmemiş = nokta) / sürükleniyor (reorder).
**Davranış:** Yatay scroll + taşmada overflow menüsü; `⌘W` aktif sekmeyi kapatır; `⌘1..9` n. sekmeye gider; orta-tık kapatır.
**a11y:** `role="tablist"`; her sekme `role="tab"` + `aria-selected`; kapatma butonu ayrı `aria-label="Sekmeyi kapat"`; ok tuşlarıyla gezinme.

### 5.12 FileCard
**Amaç:** Yüklenen bir dosyayı ve **işleme durumunu** temsil eder. Optimistic UI'nin yüzü.
**Props:** `name`, `modality` (document/image/handwriting/audio/video), `status`, `progress?`, `meta` (boyut, sayfa/süre), `onOpen`, `onRetry`.
**İşleme durumları (zorunlu görsel dil):**

| Durum | İkon / Görsel | Renk token | Etiket |
|---|---|---|---|
| `queued` | saat / sıra | `status-queued` | "Sırada" |
| `extracting` | dönen + dosya ikon | `status-extracting` | "Çıkarılıyor…" |
| `embedding` | nabız/parıltı | `status-embedding` (violet) | "İşleniyor…" |
| `ready` | ✓ check | `status-ready` | "Hazır" |
| `failed` | ⚠ + Tekrar dene | `status-failed` | "Başarısız" |

- `queued→extracting→embedding` aşamalarında üstte ince **indeterminate progress bar** (shimmer) veya yüzde bilinen ise `ProgressRing`.
- `ready`'de hafif `success` parıltısı (bir kez, 250ms) + tıklanabilir hale gelir.
- `failed`'de `destructive` kenarlık + "Tekrar dene" butonu + hata sebebi tooltip.
- Durum WebSocket ile canlı güncellenir; geçişler `fade`/renk geçişi ile yumuşar.
**a11y:** Durum yalnız renkle değil **ikon + metin** ile; canlı durum değişimi `aria-live="polite"`; kart `role="article"` veya `<button>` (ready ise).

### 5.13 CitationChip
**Amaç:** AI cevabını / test sorusunu kaynağa bağlayan tıklanabilir çip. Sıfır-halüsinasyon kültürünün görünür kanıtı.
**Props:** `source` (dosya adı), `locator` (`s.14 · ¶3` / `14:32`), `onClick` (viewer'ı ilgili konuma götür + highlight).
**Görünüm:** küçük pill, `indigo` ince kenarlık + `accent` zemin, kaynak ikonu (📄/🎙/✍) + mono locator.
**Durumlar:** default, hover (dolu indigo soft), active (tıklanınca hedef highlight pulse), inline (metin akışında) / blok (kaynak listesinde).
```tsx
<button className="inline-flex items-center gap-1 rounded-sm border border-primary/30 bg-accent
  px-1.5 py-0.5 text-2xs font-medium text-accent-foreground hover:bg-primary/10 transition-colors">
  <FileText className="size-3" /> <span className="font-mono">Türev.pdf · s.14</span>
</button>
```
**a11y:** `<button>`, `aria-label="Kaynağı aç: Türev.pdf sayfa 14"`; hedefe scroll'da odak yönetimi (highlight'a focus + `aria-live` duyuru).

### 5.14 ChatBubble
**Amaç:** Asistan sohbet mesajı (kullanıcı / AI).
**Varyantlar:** `user` (sağ, `secondary` dolu, kompakt) · `assistant` (sol, kenarlıksız, tam genişlik, markdown + KaTeX + citations).
**Durumlar:** `streaming` (token-token akış + yanıp sönen caret `caret-blink`), `complete`, `error` (yeniden dene), `tool` (retrieval/"kaynaklar aranıyor" mikro-durumu).
**İçerik:** assistant mesajları sonunda `CitationChip` listesi; kod blokları mono + kopyala; "Beğen / Beğenme / Kopyala / Yeniden üret" hover aksiyonları.
**a11y:** mesaj listesi `aria-live="polite"` (akış sırasında throttled duyuru, her token değil); rol etiketi ekran okuyucu için ("Asistan:"); kod blokları `<pre>` semantiği.

### 5.15 QuizOption
**Amaç:** Çoktan seçmeli test şıkkı (A–E).
**Props:** `label` (A/B…), `content`, `state`, `onSelect`, `disabled`.
**Durumlar:** `idle` / `hover` / `selected` (indigo kenar + accent zemin) / `correct` (success kenar + ✓, cevaplandıktan sonra) / `incorrect` (destructive kenar + ✕) / `revealed-correct` (kullanıcı yanlışken doğruyu vurgula) / `disabled`.
- Cevaptan sonra animasyonlu reveal (200ms); doğru/yanlış ikon + renk + **metin** birlikte (renk körlüğü güvencesi).
**a11y:** `role="radio"` grup içinde (`radiogroup`), tek seçim; `A`–`E` harfleriyle de seçilebilir (keyboard shortcut); `aria-checked`; sonuç `aria-live` ile duyurulur (ör. "Yanlış. Doğru cevap A.").

### 5.16 Flashcard
**Amaç:** Spaced repetition tekrar kartı (ön/arka, cloze).
**Props:** `front`, `back`, `cloze?`, `source?` (CitationChip), `onRate` (1 Tekrar / 2 Zor / 3 İyi / 4 Kolay).
**Durumlar:** `front` (soru), `flipped` (cevap + 4 derecelendirme butonu), `cloze` (boşluklu), `leech-warning` (sık yanlış uyarı banner'ı).
**Hareket:** 3D flip (`rotateY`, 300ms `ease-in-out`); `reduced-motion`'da flip yerine crossfade.
**Klavye:** `Space`/`Enter` çevir; `1–4` derecelendir; `→` sonraki kart.
**a11y:** flip durumu `aria-live`; derecelendirme butonları açık etiketli; renk + etiket birlikte (yeşil "Kolay" + metin).

### 5.17 Waveform / AudioPlayer
**Amaç:** Ses/transkript çalar — zaman damgalı segmente tıkla-git, derin link hedefi.
**Props:** `src`, `segments[]` (start/end/text), `onSeek`, `playbackRate` (0.75×–2×), `activeSegment`.
**Anatomi:** dalga formu (canvas, aktif konuma kadar dolu indigo) + oynat/duraklat + hız + segment listesi (tıkla → seek + highlight).
**Durumlar:** loading (skeleton dalga), playing, paused, buffering, segment-active (highlight + auto-scroll).
**Entegrasyon:** Arama sonucundan "14:32"ye derin link → ilgili segmente seek + scroll.
**a11y:** `<audio>` native kontrol fallback; özel kontroller `aria-label` + klavye (Space oynat/duraklat, ← → 5sn); aktif segment `aria-current`; transkript metni seçilebilir/okunabilir.

### 5.18 ProgressRing
**Amaç:** Dairesel ilerleme — dosya işleme yüzdesi, konu mastery skoru, sınav süresi.
**Props:** `value` (0–100), `size`, `strokeWidth`, `label?`, `color` (token; mastery'de değere göre danger→warning→success geçişi).
**Durumlar:** determinate (yüzde), indeterminate (dönen ark, işleme), complete (success + ✓ merkez).
**Hareket:** `strokeDashoffset` geçişi 250ms `ease-out`; indeterminate sürekli dönüş (reduced-motion'da durağan + yüzde metni).
**a11y:** `role="progressbar"` + `aria-valuenow/min/max`; merkez sayı metni; yalnızca renge bağımlı değil (sayı + arc).

### 5.19 Skeleton
**Amaç:** Yükleme placeholder'ı — içerik düzenini önceden çizerek layout shift'i (CLS) önler.
**Varyantlar:** `text` (satır), `circle` (avatar), `rect` (kart/görsel), `waveform`.
**Görünüm:** `bg-muted` + soldan sağa `shimmer` (1.5s); köşe radius içerikle eşleşir.
**Kural:** Gerçek içeriğin **boyut ve düzeniyle birebir** eşleşmeli (atlama olmasın). `reduced-motion`'da shimmer yerine statik `bg-muted`.
**a11y:** `aria-hidden="true"` (dekoratif); kapsayan bölge `aria-busy="true"`.

### 5.20 EmptyState
**Amaç:** Boş listede yön verir — "asla boş ekran" kuralı.
**Anatomi:** ince ikon/illüstrasyon (Lucide, `muted-foreground`) + başlık + 1 cümle açıklama + birincil eylem (CTA).
**Varyantlar:** `first-run` (ilk yükleme daveti — büyük dropzone), `no-results` (arama), `error` (yeniden dene), `all-done` (tekrar bitti — pozitif).
```tsx
<div className="flex flex-col items-center gap-3 py-16 text-center">
  <UploadCloud className="size-10 text-muted-foreground" />
  <h3 className="text-lg font-semibold">Henüz dosya yok</h3>
  <p className="max-w-sm text-sm text-muted-foreground">PDF, fotoğraf, ses veya YouTube linki bırak — saniyeler içinde çalışmaya hazır olsun.</p>
  <Button variant="primary"><Plus className="size-4" /> İlk dosyanı yükle</Button>
</div>
```
**a11y:** başlık `<h2>`/`<h3>` doğru hiyerarşi; ikon `aria-hidden`; CTA net etiketli.

---

## 6. Layout & Grid

### 6.1 App Shell
```
┌──────────────────────────────────────────────────────────────────────┐
│  (⌘K Command Palette — overlay, her yerden)                          │
├──────────┬───────────────────────────────────────────────┬───────────┤
│ SIDEBAR  │  TAB BAR  [Türev.pdf] [Test] [Sohbet] [+]      │  CONTEXT  │
│ 240px    ├───────────────────────────────────────────────┤  PANEL    │
│ (56px    │                                                │  320px    │
│ collapsed)│            CONTENT (aktif sekme)               │  (toggle) │
│          │                                                │  • Katman │
│          │                                                │  • Atıflar│
│          ├───────────────────────────────────────────────┤  • Öneri  │
│          │  ◂ işleme kuyruğu durum şeridi (sticky bottom) │           │
└──────────┴───────────────────────────────────────────────┴───────────┘
```

| Bölge | Genişlik | Davranış |
|---|---|---|
| **Sidebar** | 240px / 56px collapsed | `<lg` drawer; genişlik kullanıcı tercihi |
| **TabBar** | esnek | yapışkan üst (`z-sticky`), overflow scroll |
| **Content** | `1fr` (min 0) | merkez; `max-w-content` 2xl'de |
| **Context Panel** | 320px | `<xl` toggle ile gizli; `<md` Sheet olarak açılır |
| **Status şeridi** | tam | sticky alt, işleme kuyruğu (compact) |

CSS Grid iskelet:
```tsx
<div className="grid h-dvh grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr] overflow-hidden">
  <Sidebar className="row-span-2" />
  <TabBar />
  <main className="overflow-auto" />
  <ContextPanel className="row-span-2 hidden xl:block" />
</div>
```

### 6.2 Spacing ritmi
- **Dikey ritim:** bölümler arası `space-6` (24px), grup içi `space-4` (16px), satırlar `space-3` (12px).
- **Kart iç padding:** kompakt `space-4`, geniş `space-6`.
- **Sayfa kenar boşluğu (gutter):** `space-4` (mobil) → `space-6` (tablet) → `space-8` (masaüstü).
- **Okuma genişliği:** akademik içerik `max-w-reading` (≈68ch) ile ortalanır.

### 6.3 Responsive davranış
| Breakpoint | Layout |
|---|---|
| `< sm` | Tek kolon; sidebar drawer; context panel = Sheet; TabBar → swipe |
| `sm–md` | Tek içerik kolonu; sidebar collapse-icon |
| `md–lg` | Sidebar + içerik; context panel gizli (toggle) |
| `lg–xl` | Sidebar + içerik + context panel (toggle ile) |
| `≥ xl` | **Üçlü kolon** tam: explorer + viewer + AI panel |
| `≥ 2xl` | Maks genişlik sabit (1600px), kenar boşlukları büyür |

### 6.4 Yoğunluk (density)
Linear yoğunluğu hedeflenir ama nefes korunur:
- Liste satırı yüksekliği **36px** (kompakt) / **44px** (rahat, dokunmatik) — kullanıcı ayarı.
- Dokunmatik hedef minimum **44×44px** (mobil); masaüstü tık hedefi min **32px**.
- Varsayılan body 15px; "kompakt mod" toggle'ı 14px'e indirir (uzun listeler/tablolar).

---

## 7. Etkileşim & Hareket

### 7.1 Hareket ilkeleri
1. **Amaçlı:** Her animasyon durum, mekânsal ilişki veya akış iletir. Süs yok.
2. **Hızlı:** 150–250ms varsayılan; kullanıcı asla animasyon bitmesini "beklemez". Layout düzeyi en fazla 350ms.
3. **`ease-out` öncelikli:** Giriş/açılma hızlı başlar, yumuşak durur (doğal, çevik his).
4. **Tutarlı:** Aynı tip geçiş her yerde aynı süre/easing.
5. **Kesintilenebilir:** Animasyon, kullanıcı etkileşimini bloklamaz; yeni eylem mevcut animasyonu yarıda devralır.

### 7.2 Token-stream (streaming UI) — imza deneyimi
AI cevapları **token-token akar** (Perplexity hissi). Bu Studfy'ın imza etkileşimidir:
- Cevap kelime/token geldikçe ekrana eklenir; sonda **yanıp sönen caret** (`animate-caret-blink`).
- Akış sırasında üstte ince **AI gradient** ince çizgi (üretiliyor sinyali).
- Markdown/KaTeX **progressive render** — tam bloklar tamamlandıkça biçimlenir (yarım formül titremez).
- `CitationChip`'ler akış bitiminde belirir (`fade-in`, staggered).
- Otomatik en-alta-kaydırma; kullanıcı yukarı kaydırırsa durur ("yeni mesajlar" rozeti).
- Token akışı ekran okuyucuya **throttled** duyurulur (her token değil; ~her cümle, `aria-live="polite"`).

### 7.3 Optimistic UI
Ağır işlemler (upload, embedding, test üretimi) optimistic:
- **Upload:** dosya kartı **anında** `queued` durumunda görünür; arka plan kuyruğu (BullMQ) işler; durum WebSocket ile `queued→extracting→embedding→ready` canlı güncellenir.
- **Flashcard derecelendirme / not kaydı:** anında UI'da yansır, arka planda persist; hata olursa `Toast` + geri alma.
- Başarısızlıkta state geri sarılır + açıklayıcı hata + "Tekrar dene".

### 7.4 Skeletons vs Spinner
- **İçerik yükleme:** Skeleton (layout'u önceden çiz, CLS=0). Tercih edilen.
- **Eylem bekleme (buton):** inline spinner (buton genişliği sabit).
- **Belirsiz kısa bekleme (< 500ms):** hiçbir gösterge (flash önle).
- **İşleme (dosya):** `ProgressRing` (yüzde varsa) / indeterminate bar (yoksa).

### 7.5 Mikro-etkileşimler
| Öğe | Hareket |
|---|---|
| Buton press | `scale-[0.98]`, 75ms |
| Kart hover | `elevation-1 → elevation-2`, 200ms |
| Tab geçiş | aktif gösterge kayar (`layoutId`), 200ms |
| Toast giriş | `slide-up` + `spring` |
| Flashcard flip | 3D `rotateY`, 300ms `ease-in-out` |
| FileCard → ready | tek seferlik success parıltısı, 250ms |
| CitationChip tık | hedef highlight pulse, 400ms |
| Dialog/Sheet | overlay `fade-in` + içerik `slide-up`/`slide-in-right`, 250ms |

### 7.6 Reduced-motion (zorunlu)
`prefers-reduced-motion: reduce` aktifse:
- Tüm geçiş/animasyon süreleri **~0.01ms**'e iner (anında durum değişimi).
- Flip → crossfade; shimmer → statik; token-stream → akış korunur ama caret yanıp sönmesi durur (gösterilen metin atlamaz).
- Otomatik kaydırma "smooth" yerine "auto".

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. İkonografi & İllüstrasyon

### 8.1 İkon sistemi — Lucide
- **Kütüphane:** `lucide-react` (tek tutarlı set; shadcn varsayılanı).
- **Boyut:** `size-4` (16px) inline/buton · `size-5` (20px) nav · `size-3` (12px) chip · `size-6` (24px) başlık.
- **Stroke:** 1.5px varsayılan (`strokeWidth={1.5}` — ince, modern, Linear hissi); UI'da 2px değil.
- **Renk:** `currentColor` — varsayılan `text-muted-foreground`, aktif/önemli `text-foreground`. İkonlar **renklendirilmez** (semantik durum istisnaları hariç).
- **Hizalama:** ikon + metin `gap-2`, dikey optik ortalı (`items-center`).

### 8.2 Anahtar ikon eşlemeleri
| Bağlam | Lucide ikonu |
|---|---|
| Dashboard | `LayoutDashboard` |
| Çalışma / klasör | `Folder` / `FolderOpen` |
| Keşfet / arama | `Search` / `Compass` |
| Tekrar (flashcard) | `Layers` / `RotateCcw` |
| Analitik | `BarChart3` |
| Yükle | `UploadCloud` |
| Doküman | `FileText` · Görsel `Image` · El yazısı `PenLine` · Ses `AudioLines` · Video `Video` |
| AI / asistan | `Sparkles` (AI marka ikonu) |
| Kaynak/atıf | `Quote` / `FileText` |
| Podcast/dinle | `Headphones` / `Play` |
| Command Palette | `Command` |
| Başarı/hata/uyarı | `CheckCircle2` / `XCircle` / `AlertTriangle` |

### 8.3 İllüstrasyon
- **Minimal, çizgisel.** Yalnızca boş durumlar ve onboarding'de. Lucide tarzı stroke ile uyumlu, tek renk (`muted-foreground`) veya çok hafif AI gradient.
- Hacimli, renkli, "stock" illüstrasyon **kullanılmaz** (sıfır karmaşa).
- AI marka anlarında ince gradient parıltı (`Sparkles` + glow) yeterli — abartısız.
- Avatar/emoji: kişisel sıcaklık için seçili yerlerde (selamlama 👋, katman ikonları ⚡📚🧸) — dekoratif `aria-hidden`.

---

## 9. Erişilebilirlik (a11y)

Hedef: **WCAG 2.1 AA**, tam klavye, ekran okuyucu uyumu, renk-bağımsız durum.

### 9.1 AA kontrol listesi
- [ ] Metin kontrastı ≥ 4.5:1 (normal), ≥ 3:1 (büyük); UI/ikon kenarları ≥ 3:1.
- [ ] Her etkileşimli öğe klavyeyle erişilebilir, **mantıklı tab sırası**.
- [ ] Görünür `:focus-visible` göstergesi (≥ 3:1 kontrast, `ring-2 ring-ring ring-offset-2`).
- [ ] Tüm görseller `alt`; dekoratif olanlar `aria-hidden`/`alt=""`.
- [ ] Form alanları `<label>` ile bağlı; hata `aria-invalid` + `aria-describedby`.
- [ ] Durum renkten bağımsız (ikon + metin); FileCard/QuizOption/badge bunu uygular.
- [ ] Dinamik içerik `aria-live` ile duyurulur (Toast, streaming, durum geçişleri).
- [ ] Modal/Sheet/Palette'te **focus trap** + Esc + odak iadesi.
- [ ] `prefers-reduced-motion` desteklenir.
- [ ] Sayfa düzeyinde **skip-link** ("İçeriğe atla"), landmark roller (`<nav>`, `<main>`, `<aside>`).
- [ ] `<html lang="tr">`; dil değişen bölümlerde `lang` özniteliği.
- [ ] Zoom %200'e kadar yatay scroll olmadan kullanılabilir; metin reflow.
- [ ] Dokunmatik hedef ≥ 44×44px (mobil).

### 9.2 Tam klavye haritası
| Kısayol | Eylem |
|---|---|
| `⌘K` / `Ctrl+K` | Command Palette aç/kapat |
| `⌘N` / `Ctrl+N` | Yeni not |
| `⌘U` / `Ctrl+U` | Dosya yükle (dropzone aç) |
| `⌘F` / `Ctrl+F` | Aktif dokümanda ara |
| `⌘/` / `Ctrl+/` | Sohbete odaklan (AI panel) |
| `⌘B` / `Ctrl+B` | Sidebar aç/kapat |
| `⌘.` / `Ctrl+.` | Context panel aç/kapat |
| `⌘W` / `Ctrl+W` | Aktif sekmeyi kapat |
| `⌘1`–`⌘9` | n. sekmeye git |
| `⌘\` / `Ctrl+\` | Sonraki sekme |
| `⌘,` / `Ctrl+,` | Ayarlar |
| `?` | Klavye kısayolları cetveli |
| `Esc` | Modal/menü/palette kapat, odak iade |
| `Tab` / `Shift+Tab` | İleri/geri odak |
| `↑ ↓` | Liste/menü/palette gezinme |
| `← →` | Tab/segment/ses 5sn gezinme |
| **Test:** `A`–`E` | Şık seç · `Enter` onayla · `→` sonraki soru · `M` işaretle |
| **Flashcard:** `Space` | Kartı çevir · `1`–`4` derecelendir (Tekrar/Zor/İyi/Kolay) · `→` sonraki |
| **Ses:** `Space` | Oynat/duraklat · `← →` 5sn · `↑ ↓` ses · `Shift+. / ,` hız |

> Tüm kısayollar `?` ile açılan cetvelde listelenir ve Command Palette'te aranabilir.

### 9.3 Odak yönetimi
- **Focus trap:** Dialog, Sheet, Command Palette içinde odak döner; arka plan `inert`/`aria-hidden`.
- **Odak iadesi:** Overlay kapanınca odak, açan tetikleyiciye döner.
- **Açılış odağı:** Palette → arama input'u; Dialog → ilk anlamlı öğe (başlık değil, ilk input/buton); destructive onayda **iptal** odaklı (kazara onay önle).
- **Derin link odağı:** CitationChip tıklanınca hedef segment/sayfa highlight'ına programatik focus + `aria-live` duyuru.
- **Roving tabindex:** TabBar, Sidebar ağacı, QuizOption grubu, Flashcard derecelendirme → grup tek tab durağı, ok tuşlarıyla içi gezilir.

### 9.4 Ekran okuyucu
- Anlamsal HTML öncelikli (`<button>`, `<nav>`, `<main>`, `<h1-6>` doğru hiyerarşi).
- Landmark roller + `aria-label` (birden çok aynı landmark varsa).
- Streaming cevaplar **throttled** `aria-live="polite"` (token spam'i değil, cümle/blok düzeyi).
- Toast: bilgi `role="status"`, hata `role="alert"`.
- İkon-butonlar `aria-label` zorunlu; dekoratif ikon `aria-hidden`.
- Tablolar/grafikler için metin alternatifi (mastery ısı haritası → erişilebilir veri tablosu/özet).

### 9.5 Renk-bağımsız durum (zorunlu)
Renk **hiçbir zaman tek sinyal değildir**:
- FileCard durumu: renk **+ ikon + metin etiketi**.
- QuizOption doğru/yanlış: renk **+ ✓/✕ ikon + metin** ("Doğru cevap: A").
- Mastery: renk **+ yüzde sayısı + arc**.
- Flashcard derecelendirme: renk **+ etiket** ("Kolay").
- Linkler: renk **+ hover altı çizgi** (gövde metni içinde).

---

## 10. İçerik & Mikrocopy Yönergeleri (Türkçe ton)

### 10.1 Genel ton
- **Sade ve net.** Kısa cümle, aktif çatı. "Dosyan hazır." > "Dosyanız başarıyla işlenmiştir."
- **Samimi ama profesyonel.** İkinci tekil şahıs ("yükle", "başlayalım"), sıcak ama abartısız. Emoji ölçülü ve anlamlı (selamlama, katman ikonları); cümle sonu süs emoji yok.
- **Cesaretlendirici.** Hatayı suçlamaz; yön gösterir. "Bu sefer olmadı — şuradan tekrar bakalım."
- **Dürüst & güven veren.** AI sınırlarını saklamaz: "Kaynaklarında bu bilgi yok." Asla uydurmaz.
- **Türkçe öncelik.** Arayüz Türkçe; teknik terimler (PDF, AI, OCR, embedding) İngilizce kalabilir ama kullanıcıya dönük metinde sadeleştirilir ("işleniyor", "işaretlenenler").

### 10.2 Yazım kuralları
- **Büyük/küçük harf:** Cümle düzeni (sentence case) — başlıklar dahil. "Yeni not oluştur" ✓, "Yeni Not Oluştur" ✗. (`text-2xs` UPPERCASE etiketler hariç.)
- **Noktalama:** Buton/etiket sonunda nokta yok; tam cümlelik açıklama/toast'ta nokta var.
- **Sayılar:** Türkçe biçim (ondalık virgül: "%42,5"); tarih/saat yerel ("27 Haz, 14:32").
- **Kısalık:** Buton metni 1–3 kelime; tooltip tek satır; toast başlığı ≤ 5 kelime.

### 10.3 Eylem etiketleri (fiil-öncelikli)
| ✓ Kullan | ✗ Kaçın |
|---|---|
| Yükle | Dosya Yükleme İşlemi |
| Test oluştur | Yeni Bir Test Oluşturmak İçin Tıklayın |
| Kaynağı aç | Görüntüle |
| Karta ekle | Ekle |
| Tekrar dene | Yeniden Deneyiniz |
| Vazgeç | İptal Et |

### 10.4 Durum & geri bildirim mesajları
| Durum | Metin |
|---|---|
| Yükleniyor | "İşleniyor… birkaç saniye." |
| Hazır (toast) | "Türev.pdf hazır." + [Aç] |
| Boş (ilk) | "Henüz dosya yok. İlk dosyanı bırak, gerisini biz hallederiz." |
| Boş (arama) | "Bununla eşleşen bir şey bulamadık. Başka kelimelerle dene." |
| AI kaynaksız | "Kaynaklarında bu bilgi yok — emin olmak için yeni bir dosya yükleyebilirsin." |
| Hata | "Bir şeyler ters gitti. Tekrar deneyelim mi?" + [Tekrar dene] |
| Test yanlış | "Bu sefer olmadı. Doğru cevap: A — şu kaynağa bir göz at:" |
| Tekrar bitti | "Bugünlük tamam! 24 kartı tekrarladın. 👏" |
| Kota uyarısı | "Aylık AI kotanın %90'ındasın. İşler biraz yavaşlayabilir." |
| Silme onayı | "Bu dosyayı silmek üzeresin. Geri alınamaz." + [Vazgeç] [Sil] |

### 10.5 Mikrocopy ilkeleri
1. **Kullanıcının kelimeleriyle konuş** ("deneme sınavı", "defter fotoğrafı"), sistem jargonu değil ("artifact", "ingestion").
2. **Faydayı söyle, mekanizmayı değil:** "Saniyeler içinde çalışmaya hazır" > "Embedding pipeline çalışıyor".
3. **Hata = sonraki adım.** Her hata mesajı bir çözüm/eylem içerir.
4. **Yükü hafiflet.** Bekleme metinleri sakin ve insani ("birkaç saniye", "neredeyse hazır").
5. **Atıf görünür.** AI cevaplarında kaynak dili tutarlı: "[Dosya] · s.[X] · ¶[Y]" / "[Dosya] · [dk:sn]".

---

> **Sürüm notu (v1.0):** Bu doküman PRD §7 (UI/UX) ile uyumlu Foundation tasarım sistemidir. Token değerleri ve bileşen sözleşmeleri implementasyon için bağlayıcıdır. Değişiklikler `docs/adr/` altında ADR ile kayda geçirilmelidir. Yeni bileşenler bu katalog formatına (amaç · props/varyant · durum · a11y) uymalıdır.
