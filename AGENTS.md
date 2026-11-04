# Workspace Rules – Yumak Pop (Mobile Game)

## 🛠️ iOS & Android Derleme ve App Store Connect Hafızası (Sıfır EAS Kotası)

1. **Runner & SDK Seçimi (`ITMS-90725` Zorunluluğu)**:
   - GitHub Actions iOS derlemelerinde **daima `runs-on: macos-15`** (Xcode 26.3 / `iphoneos26.2` SDK / Swift 6.3) kullanılmalıdır.
   - `macos-14` (Xcode 16.2 / `iOS 18.2 SDK`) **ASLA kullanılmamalıdır**; Apple App Store Connect iOS 18.2 SDK ile üretilen paketleri `ITMS-90725` (*"All iOS and iPadOS apps must be built with the iOS 26 SDK or later"*) hatasıyla reddeder.

2. **Tek Platform & Tek Archive Kuralı**:
   - Her `push` işleminde `build-android` tekrar çalıştırılmaz (`if: github.event_name == 'workflow_dispatch' && inputs.target != 'ios-only'`).
   - Gereksiz Simulator derlemesi yapılmaz; tek bir `xcodebuild archive` ile hem imzasız `.ipa` hem de `xcodebuild -exportArchive` üzerinden App Store imzalı `.ipa` üretilir.

3. **CocoaPods & Xcode Manual App Store İmzalama (`pbxproj` Ayrımı)**:
   - `xcodebuild archive` komutuna komut satırından `PROVISIONING_PROFILE_SPECIFIER` veya `CODE_SIGN_STYLE=Manual` verilmez (aksi halde Pod hedefleri `does not support provisioning profiles` hatasıyla patlar).
   - `pod install` sonrasında `scripts/patch-ios-swift.js`:
     - `ios/Pods/Pods.xcodeproj/project.pbxproj` içindeki tüm hedeflerde `CODE_SIGNING_ALLOWED = NO; CODE_SIGNING_REQUIRED = NO; CODE_SIGN_IDENTITY = ""; PROVISIONING_PROFILE_SPECIFIER = "";` ayarlar.
     - `ios/YumakPop.xcodeproj/project.pbxproj` içindeki ana uygulama hedefinde `CODE_SIGN_STYLE = Manual; CODE_SIGN_IDENTITY = "Apple Distribution"; DEVELOPMENT_TEAM = B3XB34782X; PROVISIONING_PROFILE_SPECIFIER = "<UUID>";` ayarlar.
     - `expo-modules-jsi/apple/scripts/build-xcframework.sh` içindeki `xcodebuild` çağrısına `CODE_SIGNING_ALLOWED=NO` ekler.

4. **App Store Connect Otomatik Yükleme ve Doğrulama**:
   - `app.json` içindeki `expo.ios.buildNumber`, her çalışmada `GITHUB_RUN_NUMBER` ile otomatik artırılır.
   - GitHub Actions adımında alt Python sürecine aktarılan `SIGN_DIR` gibi değişkenler mutlaka `export SIGN_DIR=...` ile tanımlanır.
   - `xcrun altool --upload-app` tamamlandıktan sonra App Store Connect API (`/v1/apps/6829707682/buildUploads`) üzerinden yüklemenin `ITMS-*` hatası almadan `COMPLETE` / `VALID` durumuna geçtiği doğrulanır.

5. **Swift Toolchain Uyumluluğu (`scripts/patch-ios-swift.js`)**:
   - `isSwift60Or61()` kontrolü ile Xcode 26 (`Swift 6.2+`) ortamında yalnızca `swift-tools-version: 6.0`, `JavaScriptObject.swift` pointer cast, `build-xcframework.sh` `CODE_SIGNING_ALLOWED=NO` ve `pbxproj` imzalama adımları çalıştırılır; Swift 6.0'a özgü diğer 12 yama yalnızca Xcode 16 (`Swift 6.0`) ortamında devreye girer.

## 🎨 Tasarım ve Karakter Standartları
- Bobbin'in yüzü ve maskot kimliği (`assets/images/mascot.png`) sabittir. Kostüm veya eşya eklemelerinde karakterin yüzü asla değiştirilmez.
- Yeni özellikler kullanıcı istemedikçe ayrı bir test laboratuvarına gömülmez, doğrudan oyun akışına ve ana menüye entegre edilir.
- Arka plan üzerine 2D PNG etiketler yapıştırılmaz; mekanlar tek parça 3D stop-motion diorama olarak sunulur.
