# Workspace Rules – Yumak Pop (Mobile Game)

## 🛠️ iOS & Android Derleme Hafızası (Sıfır EAS Kotası)
1. **Xcode 16 (Apple Swift 6.0) Manifest & Compiler Düzeltmeleri**:
   - `Package.swift` içinde `swift-tools-version: 6.2` görüldüğünde derhal `6.0` seviyesine çekilmelidir.
   - `swiftLanguageModes: [.v6]` -> `[.v5]` seviyesine çekilerek katı concurrency ve Sendable kilitlenmeleri önlenmelidir.
   - Swift 6.0 manifest sözdiziminde argüman listesi sonundaki virgüller (`,\s*\)`) yasaktır (`unexpected ',' separator`).
   - `unsafeFlags` içindeki `"-Werror", "<WarningName>"` ikilileri (örn: `ImplicitStrongCapture`, `NoUsage`) Xcode 27 içindir; Swift 6.0 derleyici sürücüsü bunu `Driver threw unknown argument: '-Werror'` diyerek patlatır. Bunlar temizlenmelidir.
   - `RuntimeScheduler.h` içindeki `SWIFT_RETURNS_RETAINED` makrosu Swift 6.0 / Clang C++ derleyicisinde tanınmaz ve `expected ';' at end of declaration list` hatası verir. Bu makro temizlenmelidir.
   - `JavaScriptRef.swift` içindeki `, Escapable` ibaresi kaldırılmalıdır (`type 'Escapable' requires -enable-experimental-feature NonescapableTypes`).
   - `JavaScriptError.swift` içindeki `CppError` uzantısında `public var message` -> `var message` yapılarak library evolution ABI hatası önlenmelidir.
   - `JavaScriptActor.swift` dosyasındaki `runIsolated` fonksiyonları `nonisolated` yapılmalıdır.
   - `JavaScriptObject.swift` içinde Swift 6 actor veri yarışı için pointer UInt üzerinden cast edilmelidir.
   - Bu adımlar `scripts/patch-ios-swift.js` içinde otomatik uygulanmalıdır.

2. **GitHub Actions ile EAS Kotasız Derleme**:
   - Android APK: `assembleRelease` + `apksigner` (Ubuntu runner).
   - iOS IPA: `xcodebuild` Release ARM64, `CODE_SIGNING_ALLOWED=NO`, `Payload/` -> `.ipa` (macOS runner).
   - Scheme ve workspace adı dinamik aranmalıdır (`find ios -name "*.xcworkspace"`).

## 🎨 Tasarım ve Karakter Standartları
- Bobbin'in yüzü ve maskot kimliği (`assets/images/mascot.png`) sabittir. Kostüm veya eşya eklemelerinde karakterin yüzü asla değiştirilmez.
- Yeni özellikler kullanıcı istemedikçe ayrı bir test laboratuvarına gömülmez, doğrudan oyun akışına ve ana menüye entegre edilir.
- Arka plan üzerine 2D PNG etiketler yapıştırılmaz; mekanlar tek parça 3D stop-motion diorama olarak sunulur.
