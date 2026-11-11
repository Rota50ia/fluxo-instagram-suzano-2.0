# Fluxo para Instagram — estado atual

**Atualizado em:** 11 de novembro de 2026.
**Próxima fase:** múltiplas publicações e gatilhos com painel conectado ao servidor.

## Em funcionamento

O usuário confirmou um teste real completo: no `@suzanoexpress`, um novo comentário contendo `QUERO` no [post definido](https://www.instagram.com/p/DfnKnp0hNOM/) gerou automaticamente um direct com a mensagem e o link `https://4-aulas-gratuitas.suzanoexpress.com.br` corretos.

A execução confirmada na sessão usa Meta Instagram Login, um webhook HTTPS, serviço `fluxo-instagram` no EasyPanel da VPS Hostinger e o volume `/data`. O identificador do post é `18093869495691947` e o identificador da conta observado no webhook e no campo `user_id` é `17841407777954952`. O estado atual em um momento futuro deve ser reconferido; não foi feito monitoramento contínuo depois da confirmação do usuário.

A correspondência ignora caixa, acentuação e pontuação e identifica palavras inteiras em frases. `Quero!` e `eu quero` correspondem; `euquero` e `queria` não. O texto `não quero` também corresponde porque o sistema não interpreta a intenção.

## Limitações atuais

- Uma regra real: a palavra `QUERO` está fixa no processador; conta, publicação e mensagem vêm do ambiente do serviço.
- O painel local no Mac permite simulações e cadastro local, mas não está conectado à VPS e não gerencia regras reais.
- O ativador `auto` usa a data de chegada do webhook. Comentários antigos cujos eventos chegarem atrasados podem ser considerados novos.
- O serviço não possui painel remoto, alerta automático de falhas nem uma política de retenção implementada. A existência de backup operacional do volume ainda não foi comprovada.
- O corpo dos eventos é armazenado no servidor e pode conter dados pessoais; mantenha acesso restrito e defina retenção e backups adequados.
- Erros de envio e resultados incertos não são repetidos automaticamente. Uma ação incerta pode ter sido entregue e exige conferência.

## O que construir a seguir

Permitir múltiplas regras reais, cada uma com publicação, gatilho, mensagem, link, status e possibilidade de pausa, através de painel seguro conectado ao banco do servidor. Migrar e preservar a automação existente, evitar respostas duplicadas e não depender de editar variáveis de ambiente para cada post. Os detalhes estão no [Manual de construção](MANUAL-DE-CONSTRUCAO.md) e no [handoff](HANDOFF.md).

## Painel local

Para abrir a prévia local: execute `node servidor.cjs` na pasta do projeto com Node.js 24 e acesse `http://127.0.0.1:8765`. O banco `dados/fluxo.sqlite` não é o banco remoto. O utilitário do Chaves do macOS pode ser recriado com `swiftc chaves.swift -o dados/fluxo-chaves`. Não exponha o painel local à internet.

## Evidências verificadas nesta revisão

- Testes locais do motor, processador e controle de ativação passaram em 11/11/2026 com dados fictícios.
- O endpoint público respondeu HTTP 403 a um GET sem token, comportamento esperado para uma verificação não autenticada; isso não demonstra que directs estejam sendo enviados no momento da consulta.
- O repositório remoto `main` apontava para o commit de código `15581eb` antes das atualizações documentais. A VPS não foi acessada diretamente nesta revisão.

Veja também: [Integração](INTEGRACAO-COMENTARIOS.md), [Operação](OPERACAO-DA-AUTOMACAO.md) e [VPS Hostinger](HOSPEDAGEM-HOSTINGER.md).
