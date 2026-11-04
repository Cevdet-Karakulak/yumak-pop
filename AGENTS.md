# Workspace Rules – Yumak Pop (Mobile Game)

## 🛠️ iOS & Android Derleme Hafızası (Sıfır EAS Kotası)
1. **Xcode 16 (Apple Swift 6.0) Manifest & Compiler Düzeltmeleri**:
   - `Package.swift` içinde `swift-tools-version: 6.2` görüldüğünde derhal `6.0` seviyesine çekilmelidir.
   - `swiftLanguageModes: [.v6]` ExpoModulesJSI için zorunludur (C++ interop, Task.immediate ve consuming: etiketleri gerektirir). Asla [.v5]'e çekilmemeli; katı concurrency hatalarını önlemek için `unsafeFlags` içine `"-Xfrontend", "-strict-concurrency=minimal"` eklenmelidir.
   - Swift 6.0 manifest sözdiziminde argüman listesi sonundaki virgüller (`,\s*\)`) yasaktır (`unexpected ',' separator`).
   - `unsafeFlags` içindeki `"-Werror", "<WarningName>"` ikilileri (örn: `ImplicitStrongCapture`, `NoUsage`) Xcode 27 içindir; Swift 6.0 derleyici sürücüsü bunu `Driver threw unknown argument: '-Werror'` diyerek patlatır. Bunlar temizlenmelidir.
   - `RuntimeScheduler.h` içindeki `SWIFT_RETURNS_RETAINED` makrosu Swift 6.0 / Clang C++ derleyicisinde tanınmaz ve `expected ';' at end of declaration list` hatası verir. Bu makro temizlenmelidir.
   - `JavaScriptRef.swift` içindeki `, Escapable` ibaresi kaldırılmalıdır (`type 'Escapable' requires -enable-experimental-feature NonescapableTypes`).
   - `JavaScriptError.swift` içindeki `CppError` uzantısında `public var message` -> `var message` yapılarak library evolution ABI hatası önlenmelidir.
   - `JavaScriptActor.swift` dosyasındaki `runIsolated` ve `runIsolatedThrowing` fonksiyonları `nonisolated` yapılmalı ve parametreleri `() -> T` / `() throws -> T` olarak güncellenmelidir (`IsolatedRunner = (() -> T) -> T`); böylece `assumeIsolated` içinde ne actor izolasyon hatası ne de non-escaping generic dönüşüm hatası oluşur.
   - `JavaScriptRuntime.swift` içindeki bare-slash regex (`/^[a-zA-Z_$][a-zA-Z0-9_$]*$/`) Swift 5 modunda integer literal olarak yorumlanıp patlar (`'$' is not a valid digit in integer literal`); `range(of: ..., options: .regularExpression)` ile değiştirilmelidir.
   - `JavaScriptPromise.swift` ve `JavaScriptCallback.swift` içindeki `LongLivedState` sınıfından `@JavaScriptActor` kaldırılarak `nonisolated init()` eklenmeli; ayrıca `JavaScriptCallback.swift` içindeki yerel `@JavaScriptActor func call` fonksiyonları `@Sendable` yerel fonksiyon olamayacağı için `let call: @JavaScriptActor @Sendable (...) = { ... }` olarak yazılmalıdır.
   - `Task+immediate.swift` içindeki `Task.immediate` ve `Task(name:)` çağrıları iOS 26 SDK gerektirdiğinden Xcode 16 için `Task(priority: priority ?? .high, operation: operation)` olarak sadeleştirilmelidir.
   - `JavaScriptRuntime.swift` içindeki `vector.push_back(consuming: propNameId)` ve `expo.HostFunctionClosure(context, call, deallocate)` çağrıları Swift 6.0 C++ interop kısıtlamaları nedeniyle `HostObjectCallbacks::pushPropNameId` ve `HostFunctionClosure::make` C++ statik yardımcıları üzerinden çağrılmalıdır.
   - `JavaScriptObject.swift`, `JavaScriptArray.swift` ve `JavaScriptPromise.swift` içindeki `~Copyable` delegating `self.init(...)` çağrıları Swift 6.0 derleyici hatasını (`copy of noncopyable typed value. This is a compiler bug`) tetikler; doğrudan stored property atamalarına (`self.runtimeHandle = ...; self.pointee = ...`) açılmalıdır.
   - `JavaScriptRuntime.swift` ve `JavaScriptFunction.swift` içindeki closure parametrelerinde `consuming` sahipliği açıkça yazılmalı (`(arguments: consuming JavaScriptValuesBuffer) in`), `JavaScriptFunction.swift` içindeki stack pointer'ları `UncheckedSendable` ile sarmalanmalıdır.
   - `JavaScriptObject.swift` içinde Swift 6 actor veri yarışı için pointer UInt üzerinden cast edilmelidir.
   - `ExpoModulesCore` gibi önceden derlenmiş (`.tar.gz`) XCFramework'lerin `.swiftinterface` dosyalarındaki Swift 6.2/6.3 isolated conformance sözdizimi (`: @_Concurrency.MainActor `) Swift 6.0 derleyicisinde `unknown attribute '_Concurrency.MainActor'` hatası verir; `.tar.gz` arşivleri ve `Pods` içindeki `.swiftinterface` dosyalarından bu nitelik temizlenmelidir.
   - Bu adımlar `scripts/patch-ios-swift.js` içinde otomatik uygulanmalıdır.

2. **GitHub Actions ile EAS Kotasız Derleme**:
   - Android APK: `assembleRelease` + `apksigner` (Ubuntu runner).
   - iOS IPA: `xcodebuild` Release ARM64, `CODE_SIGNING_ALLOWED=NO`, `Payload/` -> `.ipa` (macOS runner).
   - Scheme ve workspace adı dinamik aranmalıdır (`find ios -name "*.xcworkspace"`).

## 🎨 Tasarım ve Karakter Standartları
- Bobbin'in yüzü ve maskot kimliği (`assets/images/mascot.png`) sabittir. Kostüm veya eşya eklemelerinde karakterin yüzü asla değiştirilmez.
- Yeni özellikler kullanıcı istemedikçe ayrı bir test laboratuvarına gömülmez, doğrudan oyun akışına ve ana menüye entegre edilir.
- Arka plan üzerine 2D PNG etiketler yapıştırılmaz; mekanlar tek parça 3D stop-motion diorama olarak sunulur.
