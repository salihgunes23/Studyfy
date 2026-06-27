# Güvenlik Politikası

> Bu dosya **güvenlik açığı bildirim politikasıdır**. Detaylı tehdit modeli ve
> güvenlik mimarisi için [docs/SECURITY.md](docs/SECURITY.md) dosyasına bakın.

## Desteklenen Sürümler

| Sürüm | Destek |
|-------|--------|
| 0.x   | ✅ Aktif geliştirme |

## Güvenlik Açığı Bildirme

Studfy, kullanıcıların hassas çalışma verilerini barındırdığı için güvenliği
ciddiye alıyoruz. Bir güvenlik açığı bulduysanız:

1. **Açığı herkese açık (public) issue olarak AÇMAYIN.**
2. **security@studfy.app** adresine e-posta gönderin veya GitHub'ın
   **Private Vulnerability Reporting** özelliğini kullanın.
3. Şunları ekleyin: açıklama, etkilenen bileşen, yeniden üretme adımları,
   olası etki ve (varsa) düzeltme önerisi.

## Süreç & SLA

- **24 saat** içinde alındı teyidi.
- **72 saat** içinde ilk değerlendirme ve önem derecesi.
- Düzeltme yayınlandıktan sonra, izninizle katkınız onurlandırılır (credit).
- Sorumlu açıklama (responsible disclosure) ilkelerine uyulur.

## Kapsam

Kapsamda: kimlik doğrulama, çok-kiracılı izolasyon (cross-tenant veri sızıntısı),
dosya yükleme, RAG/LLM guardrail atlatma, şifreleme, API yetkilendirme.

Lütfen test ederken gerçek kullanıcı verilerine erişmeyin ve hizmet
kesintisine (DoS) yol açacak testlerden kaçının.
