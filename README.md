# Fluxo para Instagram

Ferramenta própria para automatizar interações nos perfis de Instagram de Edilson. Uma regra real de comentário → direct foi implantada e testada no `@suzanoexpress`; o usuário confirmou o funcionamento automático em 11/11/2026.

A implementação atual atende **uma publicação e o gatilho `QUERO` por vez**. O painel no Mac é uma simulação e não administra o serviço real na VPS. A próxima etapa é permitir várias postagens e gatilhos em um painel seguro, preservando a automação existente.

- [Handoff para a próxima sessão](documentacao/HANDOFF.md)
- [Manual de construção](documentacao/MANUAL-DE-CONSTRUCAO.md)
- [Estado atual e limitações](documentacao/ESTADO-DO-PROJETO.md)
- [Operação e pausa](documentacao/OPERACAO-DA-AUTOMACAO.md)
- [Índice da documentação](documentacao/README.md)

Para abrir a prévia no Mac, execute `node servidor.cjs` com Node.js 24 e acesse `http://127.0.0.1:8765`. Essa interface salva dados locais e não altera regras da VPS.

O serviço real usa EasyPanel, a API da Meta e um volume persistente. Tokens, chaves, bancos, eventos e segredos não pertencem ao repositório. Push no repositório pode disparar implantação automática; leia a documentação antes de alterar a branch de produção.
