# Lumo Gestão — Mobile

Aplicativo Flutter do colaborador do Lumo Gestão.

## Funcionalidades

- Autenticação com Supabase Auth
- Sessão persistente e recuperação de senha
- Vínculo do usuário ao colaborador
- Registro de ponto
- Captura de selfie no fluxo de marcação
- Validação de localização e precisão do GPS
- Histórico de jornada
- Solicitações e acompanhamento de férias
- Documentos privados com URL temporária assinada
- Banco de horas
- Comunicados e notificações
- Perfil e alteração de senha

## Configuração

As variáveis públicas são informadas no build:

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://SEU-PROJETO.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUBSTITUA_AQUI \
  --dart-define=PASSWORD_RESET_REDIRECT_URL=https://SEU-DOMINIO.com/set-password
```

Nunca inclua `service_role`, secret keys ou segredos de provedores no aplicativo.

## Executar localmente

```bash
flutter pub get
flutter run
```

## Qualidade

Antes de publicar uma nova versão:

```bash
dart format .
flutter analyze
flutter test
```

## Estrutura

```text
lib/core/       configuração, rede e tema
lib/models/     modelos da aplicação
lib/screens/    telas e fluxos
lib/services/   regras de integração e acesso a dados
lib/widgets/    componentes reutilizáveis
```

## Segurança

- Configuração do backend fornecida por variáveis de build.
- Sessões armazenadas localmente apenas para autenticação do usuário.
- Acesso a dados protegido pelo backend e políticas de banco.
- Documentos privados acessados por URLs assinadas temporárias.
