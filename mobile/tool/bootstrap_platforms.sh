#!/usr/bin/env bash
set -euo pipefail
flutter create . --platforms=android,ios --org com.lumogestao
flutter pub get
printf '\nScaffold gerado. Agora aplique as permissões descritas em tool/PLATFORM_SETUP.md.\n'
