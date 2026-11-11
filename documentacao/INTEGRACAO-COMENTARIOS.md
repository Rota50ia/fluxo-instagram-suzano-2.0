# Integração de comentários — estado atual

**Atualizado em:** 11 de novembro de 2026. Consulte [Handoff](HANDOFF.md) para retomar o trabalho e [Manual de construção](MANUAL-DE-CONSTRUCAO.md) para a arquitetura completa.

## Fluxo confirmado

A Meta notificou o webhook sobre um comentário real no post do `@suzanoexpress`. Uma tentativa direcionada retornou `enviada` e o usuário confirmou o recebimento do direct. Em seguida, a regra geral foi ativada e o usuário confirmou que outro comentário novo gerou automaticamente a mensagem e o link corretos.

O fluxo usa a API oficial: o servidor recebe uma entrega assinada, grava o corpo, identifica o comentário e o post, compara a palavra `QUERO`, registra uma ação única por conta e comentário e envia uma resposta privada associada ao ID do comentário. O usuário confirmou o sucesso desse cenário; não há evidência de testes abrangentes em todas as condições da Meta.

- Conta de evento e `user_id` observado: `17841407777954952`.
- Post: `https://www.instagram.com/p/DfnKnp0hNOM/`, mídia `18093869495691947`.
- Oferta: `https://4-aulas-gratuitas.suzanoexpress.com.br`.
- Ambiente: projeto `suzanoblog`, serviço `fluxo-instagram`, EasyPanel em VPS Hostinger.
- URL de callback: `https://suzanoblog-fluxo-instagram.7lvlou.easypanel.host/webhook`.

## Regras de correspondência

A normalização remove diferenças de caixa, sinais de acentuação e pontuação e exige o termo como palavra inteira. Aceita `QUERO`, `Quero!` e `eu quero`; não aceita `queria` ou `euquero`. Não há análise de intenção: `não quero` também é uma correspondência. O serviço ignora comentários da própria conta e exige a conta e a mídia configuradas.

Hoje há apenas **uma conta, uma publicação e uma resposta** para o fluxo real. A palavra `QUERO` está fixa em `processador.cjs`. A versão local do painel usa outro banco e não sincroniza configurações com a VPS. Várias regras reais são a próxima fase, não uma capacidade já disponível.

## Webhook e fila

A verificação inicial usa `hub.verify_token`; as entregas POST são verificadas com HMAC SHA-256 sobre o corpo bruto. O servidor aceita somente o objeto Instagram e salva a entrega válida antes de responder. Corpos exatamente iguais são deduplicados por hash. Para as ações, a chave `(conta, comentario)` impede criar duas ações para o mesmo comentário. O processador usa SQLite persistente em `/data/eventos.sqlite`.

Os estados incluem `pendente`, `enviando`, `enviada`, `falhou`, `incerta` e `ignorada_antes_ativacao`. Um erro de rede ou uma interrupção durante envio pode deixar resultado incerto: **não reenvie cegamente**. A API pode ter aceitado o direct mesmo que o serviço não tenha recebido a resposta. Não há recuperação automática completa nem alerta de falhas.

## Ativação e variáveis

As seguintes variáveis devem ser configuradas somente no ambiente protegido do EasyPanel; os valores de credenciais jamais devem entrar neste documento, no Git, nos logs ou no chat.

| Variável | Função |
| --- | --- |
| `FLUXO_WEBHOOK_VERIFY_TOKEN` | Segredo criado pelo operador para a verificação inicial do callback. |
| `FLUXO_WEBHOOK_APP_SECRET` | Chave do aplicativo usada para conferir a assinatura das entregas. |
| `FLUXO_INSTAGRAM_TOKEN` | Token de acesso da conta usado na API da Meta. |
| `FLUXO_INSTAGRAM_ID` | Conta autorizada para receber e enviar eventos. |
| `FLUXO_PUBLICACAO_ID` | Mídia autorizada para a regra atual. |
| `FLUXO_MENSAGEM` | Texto a ser enviado ao comentarista. |
| `FLUXO_REGRA_ATIVA` | `sim` habilita o planejamento da regra; `nao` desabilita. |
| `FLUXO_ENVIO_ATIVO` | `sim` habilita o envio; `nao` desabilita. |
| `FLUXO_ATIVACAO_APOS` | Em `auto`, marca a ativação no banco; também aceita data UTC ISO com milissegundos. |
| `FLUXO_TESTE_ENVIO`, `FLUXO_TESTE_COMENTARIO_ID` | Modo de teste direcionado; mantenha desligado fora de testes expressamente autorizados. |

Em `auto`, a primeira inicialização com regra e envio ativos marca a hora, ignora ações pendentes anteriores da conta e considera apenas entregas recebidas após o marco. O marco persiste em reinícios. Após uma pausa aplicada corretamente e posterior reativação, é criado um novo marco. Esse filtro é baseado no **recebimento do webhook**, não prova que o comentário foi criado após a ativação. Mantenha uma única réplica até que a concorrência seja revista.

## Verificação e restrições

O usuário escolheu não responder ao histórico anterior. Os dois comentários antigos foram informados como pertencentes aos próprios perfis de teste. Um teste da Meta após a troca das credenciais foi registrado no servidor. O usuário informou que a chave do app e o token de verificação expostos em captura foram substituídos; não reproduza os valores anteriores.

A Meta exibiu que a análise do aplicativo podia ser pulada para uso nas próprias empresas e informou requisitos de publicação. A disponibilidade real para outros usuários, escopos de permissão, duração do token, limites e regras de mensagens devem ser conferidos na [documentação oficial da Meta](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api) quando forem usados; não extrapole o teste executado para todos os cenários.

Consulte [Operação da automação](OPERACAO-DA-AUTOMACAO.md) para status e pausa. O modo de teste direcionado é uma ferramenta para situações pontuais, não um modo de operação contínuo. Para a nova fase, veja os critérios de migração e testes no [manual](MANUAL-DE-CONSTRUCAO.md).
