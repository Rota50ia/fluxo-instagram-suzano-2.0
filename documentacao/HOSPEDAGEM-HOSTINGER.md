# Hospedagem na VPS Hostinger

**Atualizado em:** 11 de novembro de 2026.

## Implantação confirmada na sessão

O usuário administra uma VPS Hostinger pelo EasyPanel. O projeto `suzanoblog` já continha serviços do blog e de conhecimento; nele foi criado o serviço separado `fluxo-instagram`. Preserve os serviços preexistentes e seus dados.

- Fonte: repositório privado `Rota50ia/fluxo-instagram-suzano-2.0`, branch `main`.
- Build: `Dockerfile` do projeto. O uso de Nixpacks falhou por não corresponder a este serviço.
- Proxy: hostname público do EasyPanel com HTTPS, encaminhando para a porta interna `8766` por HTTP.
- Persistência: volume `fluxo-dados`, montado em `/data`; banco `/data/eventos.sqlite`.
- Runtime: imagem Node.js 24; o contêiner executa o receptor, não o painel local.
- Configuração e credenciais: variáveis de ambiente do serviço no EasyPanel, não versionadas.

O usuário relatou uma implantação bem-sucedida e confirmou teste real automático. Em nova sessão, conferir status, logs, versão e volume antes de qualquer mudança. O teste externo GET sem token retornou 403 em 11/11/2026, como esperado; não é um teste completo da automação.

## Rotina e cuidados

O EasyPanel pode implantar automaticamente quando o GitHub recebe push. Faça mudanças em branch isolada, confirme o comportamento do auto deploy e planeje testes e rollback antes de atualizar a branch usada pelo serviço. Não reinicie, reinstale ou remova outros serviços, nem altere DNS ou volumes existentes sem avaliação.

O volume persiste dados entre recriações do contêiner, mas isso **não confirma que haja backup**. Configurar e testar backup e restauração é uma pendência. Restringir acesso à VPS, estabelecer política de retenção para o corpo dos eventos e monitorar erros e expiração do token também são pendências.

A caixa de segredos do Mac não é sincronizada automaticamente com a VPS. Nunca envie variáveis secretas por chat ou as inclua em código, arquivos de build, histórico de comandos ou capturas. O webhook público e o futuro painel administrativo devem ter fronteiras de acesso separadas.

Para comandos de status e pausa, consulte [Operação](OPERACAO-DA-AUTOMACAO.md). Para o plano de evolução, consulte o [manual](MANUAL-DE-CONSTRUCAO.md).
