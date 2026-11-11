# Handoff — Fluxo para Instagram

**Data do fechamento:** 11 de novembro de 2026
**Responsável:** Edilson Morais
**Próxima sessão:** construir o gerenciamento de várias publicações e gatilhos.
**Estado confirmado na conversa:** uma automação real está ativa e o usuário confirmou que um novo comentário acionou o direct correto.

## Retomada rápida

1. Leia este arquivo, [Estado do projeto](ESTADO-DO-PROJETO.md) e [Manual de construção](MANUAL-DE-CONSTRUCAO.md).
2. Verifique a situação real antes de alterar qualquer coisa: `git status --short --branch`, histórico da implantação do EasyPanel e, se houver acesso apropriado, o resumo `node /app/status-acoes.cjs` no contêiner. Não peça nem imprima credenciais.
3. Trabalhe em uma branch separada, sem interromper a regra existente. Projete o armazenamento das novas regras no servidor, migre a regra atual com segurança e conecte um painel administrativo autenticado. Detalhes e critérios estão no manual.
4. Teste múltiplas publicações, múltiplos gatilhos, isolamento, migração, eventos duplicados, pausa, reinício, falhas e segurança. Prepare a implantação e a reversão; preserve os dados e o volume existente.
5. Valide o comportamento real com teste controlado e usuário autorizado. A entrega futura só estará concluída quando for possível criar e gerenciar mais de uma automação real sem quebrar a existente.

## O que já foi entregue

- Uma automação real no perfil **@suzanoexpress**, limitada ao [post selecionado](https://www.instagram.com/p/DfnKnp0hNOM/), ID de mídia `18093869495691947`.
- Comentários com a palavra `QUERO`, inclusive `Quero!` e `eu quero`, acionam uma resposta privada com o link das quatro aulas. Correspondência não interpreta intenção: `não quero` também corresponde; `queria` e `euquero` não correspondem.
- A Meta reconheceu o webhook, recebeu-se um evento real do post, um envio direcionado foi aceito pela API e o usuário confirmou o recebimento. Após ativar a automação, o usuário confirmou um novo teste inteiramente automático com mensagem e link corretos.
- A ativação utiliza `FLUXO_ATIVACAO_APOS=auto`; o marco considera a chegada ao servidor, não necessariamente a data de criação do comentário. O usuário optou por novas entregas e informou que os dois comentários antigos de teste eram de seus próprios perfis.
- O fluxo real usa a VPS Hostinger, EasyPanel, projeto `suzanoblog`, serviço `fluxo-instagram`, proxy HTTPS e volume `fluxo-dados` montado em `/data`. O usuário informou que publicou o app da Meta e ativou a assinatura da conta.

## Limitação central a resolver

**O servidor real aceita hoje uma única conta, uma publicação e uma mensagem via variáveis de ambiente; a palavra `QUERO` está fixa no código.** O painel local salva dados em outro banco no Mac, apenas simula e não controla a VPS. Alterar nele, ou alterar o ID de mídia no EasyPanel, não cria uma segunda automação real.

O usuário quer, para cada nova postagem, escolher um gatilho e uma mensagem/link próprios, mantendo as anteriores. Precisa de criação, edição, listagem, ativação e pausa por regra, com interface simples. Não presumir que várias contas, directs, respostas múltiplas ou um SaaS para clientes já foram solicitados como escopo obrigatório.

## Identificadores e infraestrutura

- Conta: `@suzanoexpress`; `entry.id`/`user_id` da API observado: `17841407777954952`. O campo `id` retornado por `/me` pode ser diferente; não trocá-los por suposição.
- Repositório privado: `https://github.com/Rota50ia/fluxo-instagram-suzano-2.0`, branch de origem `main`; fonte conferida no encerramento: commit de código `15581eb`.
- Callback atualmente informado na Meta: `https://suzanoblog-fluxo-instagram.7lvlou.easypanel.host/webhook`, encaminhado pelo EasyPanel à porta interna `8766`.
- Banco remoto atual: `/data/eventos.sqlite`, com entregas, ações e controle da ativação. O banco local `dados/fluxo.sqlite` é independente e ignorado pelo Git.
- O GitHub pode disparar implantação automática no EasyPanel. Qualquer push em uma branch pode acionar o webhook do repositório; confirme o comportamento antes de alterar código remoto. Preserve a regra atual e prepare rollback.

## Decisões, riscos e limites

- O projeto é de uso dos próprios perfis do usuário. A Meta informou na tela que a análise do app pode ser dispensada para as próprias empresas, mas confirme os requisitos atuais e os limites efetivos antes de ampliar o uso.
- Credenciais foram exibidas em uma captura durante a sessão; o usuário informou que redefiniu a chave do app e substituiu o token de verificação. Um teste posterior chegou ao servidor. Não reutilizar, reproduzir ou registrar valores de capturas antigas.
- Tokens e segredos ficam no Chaves do Mac e/ou no ambiente privado do EasyPanel. Não copiar para documentos, Git, comandos exibidos, imagens, logs ou mensagens.
- Não há painel remoto de gestão, alerta automático, política de retenção de dados ou backup do volume comprovado. Tratar como pendências, sem afirmar que existem.
- A captura de eventos guarda o corpo bruto; proteger os dados, definir retenção e acesso. Há campos da Meta além de `comments` assinados; não desativá-los nem alterar integrações existentes sem verificar impactos.
- Ações `enviando`, `incerta` e falhas não devem ser reenviadas cegamente. Uma confirmação perdida pode corresponder a um direct entregue. Há uma única réplica como premissa de operação; verificar no EasyPanel.
- O teste automático foi confirmado pelo usuário em 11/11/2026; a disponibilidade atual e o estado exato da VPS precisam ser reconferidos. O GET público sem token retornou 403, esperado para o handshake sem credencial, e não comprova envio de mensagens.

## Arquivos essenciais

- `/Users/edilsonmorais/instagram-automacoes/webhook.cjs`: HTTP, verificação da Meta, banco e agendamento.
- `/Users/edilsonmorais/instagram-automacoes/processador.cjs`: fila, deduplicação de ações e envio.
- `/Users/edilsonmorais/instagram-automacoes/motor-regras.cjs`: normalização, interpretação e seleção da regra.
- `/Users/edilsonmorais/instagram-automacoes/controle-ativacao.cjs`: marco de ativação persistido.
- `/Users/edilsonmorais/instagram-automacoes/servidor.cjs`, `index.html`, `app.js`: painel local de simulação.
- `/Users/edilsonmorais/instagram-automacoes/documentacao/MANUAL-DE-CONSTRUCAO.md`: arquitetura, operação, testes e plano para a próxima fase.
- `/Users/edilsonmorais/instagram-automacoes/documentacao/OPERACAO-DA-AUTOMACAO.md`: status e pausa do serviço real.

## Pedidos ao próximo agente

Não tratar a integração real como inexistente nem a prévia local como um painel em produção. Primeiro ler o estado existente e preservar o volume e o comportamento da regra ativa. O usuário prefere execução autônoma, português brasileiro correto e comunicação simples. Não ativar novas respostas reais sem um teste controlado e aprovação para implantação quando necessária.

## Situação documental e Git ao encerrar

Os documentos de 11/11 foram atualizados em um commit separado. O último commit com alteração funcional antes da atualização documental era `15581eb`. O EasyPanel pode implantar automaticamente após alterações no GitHub; ao retomar, confira `git status --short --branch`, o histórico e a versão implantada antes de criar outra branch ou sincronizar.
