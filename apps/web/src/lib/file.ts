import type { DocKind } from './types';

export interface ReadResult {
  kind: DocKind;
  mimeType: string;
  data: string;
}

const TEXT_EXT = ['.txt', '.md', '.csv'];

function hasExt(name: string, exts: string[]): boolean {
  const lower = name.toLowerCase();
  return exts.some((e) => lower.endsWith(e));
}

/** Cihazdan seçilen dosyayı okunabilir veriye çevirir (galeri/dosyalar). */
export function readFile(file: File): Promise<ReadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Dosya okunamadı'));

    const isText = file.type.startsWith('text/') || hasExt(file.name, TEXT_EXT);
    const isPdf = file.type === 'application/pdf' || hasExt(file.name, ['.pdf']);

    if (isText) {
      reader.onload = () =>
        resolve({ kind: 'text', mimeType: 'text/plain', data: String(reader.result ?? '') });
      reader.readAsText(file);
      return;
    }

    reader.onload = () => {
      const result = String(reader.result ?? '');
      const comma = result.indexOf(',');
      const base64 = comma >= 0 ? result.slice(comma + 1) : result;
      resolve({
        kind: isPdf ? 'pdf' : 'image',
        mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        data: base64,
      });
    };
    reader.readAsDataURL(file);
  });
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.abs(Math.floor((1 + Math.sin(performance.now())) * 1e9)).toString(36);
}

export function prettyBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
