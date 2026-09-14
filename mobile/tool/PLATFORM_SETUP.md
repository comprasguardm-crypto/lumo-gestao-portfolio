# Configuração Android/iOS — Lumo Gestão Mobile

O pacote original não continha o scaffold nativo. Gere em uma máquina com Flutter SDK:

```bash
flutter create . --platforms=android,ios --org com.lumogestao
flutter pub get
```

Ou execute `./tool/bootstrap_platforms.sh`.

## Android — `android/app/src/main/AndroidManifest.xml`

Dentro de `<manifest>`, antes de `<application>`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Não é necessária localização em segundo plano.

## iOS — `ios/Runner/Info.plist`

Dentro de `<dict>`:

```xml
<key>NSCameraUsageDescription</key>
<string>O Lumo usa a câmera frontal para registrar a selfie da marcação de ponto.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>O Lumo usa sua localização durante a marcação de ponto para validar o local autorizado pela empresa.</string>
```

## Configuração do backend no build

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://SEU-PROJETO.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
  --dart-define=PASSWORD_RESET_REDIRECT_URL=https://SEU-DOMINIO-LUMO.com/set-password
```

A URL de senha deve estar autorizada nas Redirect URLs do Supabase Auth.

## Validação antes de distribuição

```bash
flutter pub get
dart format .
flutter analyze
flutter test
flutter build apk
```
