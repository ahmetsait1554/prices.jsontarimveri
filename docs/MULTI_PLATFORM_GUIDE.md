# Çok Platformlu Kurulum Rehberi (Web, Mobil, Masaüstü)

Bu proje tek bir veri katmanı üzerinden çalışır. Web, Capacitor/Expo (mobil) ve Tauri/Electron (masaüstü) sürümleri aynı Supabase projesine bağlanır.

## 1. Mimari

| Katman | Konum | Görevi |
| --- | --- | --- |
| Yapılandırma | `src/api/config.ts` | `VITE_` ortam değişkenlerini okur, eksikse hata verir |
| İstemci | `src/api/client.ts` | Edge Function çağrıları (`callEdgeFunction`) ve tablo ekleme (`insertRow`) |
| Servisler | `src/services/*` | Veriye özgü mantık; ham `fetch` yerine `@/api/client` kullanır |
| Edge Functions | `supabase/functions/*` | Sunucu tarafı işler, dış API anahtarları burada |
| Ortak CORS | `supabase/functions/_shared/cors.ts` | Tüm Edge Function yanıtlarında aynı başlıklar |

Yeni bir veri kaynağı eklerken `fetch` çağrısını doğrudan yazmayın; `src/api/client.ts` üzerinden gidin. Böylece adres, anahtar ve hata biçimi tek yerde kalır.

## 2. Ortam Değişkenleri

Kök dizindeki `.env.example` dosyasını `.env` olarak kopyalayın.

| Değişken | Nerede | Açıklama |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | İstemci (`.env`) | Proje adresi. `VITE_API_URL` olarak da düşünülebilir; bu projede ayrı bir API adresi yoktur, tüm çağrılar bu adrese gider. |
| `VITE_SUPABASE_ANON_KEY` | İstemci (`.env`) | Herkese açık anon anahtarı. Güvenlik RLS politikalarıyla sağlanır. |
| `OPENAI_API_KEY` | Edge Function Secrets | AI analizi için |
| `RESEND_API_KEY` | Edge Function Secrets | Reklam formu e-posta bildirimi için |
| `SUPABASE_SERVICE_ROLE_KEY` | Sadece sunucu | Asla istemciye veya `.env` dosyasına konmaz |

Kural: `VITE_` ile başlayan değer uygulama paketinin içinde herkese görünür. Gizli anahtarlar yalnızca Edge Function Secrets içinde tutulur.

## 3. CORS ve İstek Kökenleri

Edge Functions tüm yanıtlarda `Access-Control-Allow-Origin: *` döndürür. Kimlik doğrulama çerez değil, `Authorization: Bearer` başlığıyla yapıldığı için bu güvenlidir. Aşağıdaki kökenler otomatik kabul edilir:

| Platform | Köken |
| --- | --- |
| Web (geliştirme) | `http://localhost:5173` |
| Capacitor iOS | `capacitor://localhost` |
| Capacitor Android | `https://localhost` |
| Tauri macOS/Linux | `tauri://localhost` |
| Tauri Windows | `https://tauri.localhost` |
| Expo | `http://localhost:8081` veya `exp://` |

Yeni bir Edge Function yazarken `import { corsHeaders } from "../_shared/cors.ts";` kullanın ve OPTIONS isteğine aynı başlıklarla yanıt verin.

## 4. Yeni Platforma Kopyalama Adımları

1. Projeyi kopyalayın ve `.env.example` dosyasından `.env` oluşturun.
2. Değerleri Supabase panelinden girin: Project Settings > API (URL ve anon key).
3. Bağımlılıkları kurun ve web sürümünü derleyin.
4. Capacitor için: web çıktısını `dist` klasöründen senkronize edin (Capacitor'ın `webDir` ayarı `dist` olmalı).
5. Tauri için: `tauri.conf.json` içinde geliştirme adresini Vite sunucusuna yönlendirin ve `dist` klasörünü kullanın.
6. Sunucu tarafı gizli anahtarlar Supabase panelinde Edge Functions > Secrets bölümünden eklenir.
7. Yeni bir Supabase projesine geçerseniz tabloları ve RLS politikalarını yeniden uygulamanız gerekir.

## 5. Kontrol Listesi

- [ ] `.env` dosyası var ve `.gitignore` içinde
- [ ] `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` dolu
- [ ] Edge Function Secrets içinde `OPENAI_API_KEY` ve `RESEND_API_KEY` tanımlı
- [ ] Her yeni tablo için RLS açık
- [ ] Mobil ve masaüstü kökenleri yukarıdaki tabloda
