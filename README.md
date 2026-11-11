# Fluxo para Instagram

Ferramenta própria para organizar e, futuramente, automatizar interações nos perfis de Instagram do Edilson. O projeto contém um painel local e um receptor de webhook experimental.

## Estado atual

- O painel local cadastra perfis, cria regras e simula interações; suas regras são armazenadas no computador.
- A conta `@suzanoexpress` teve seu acesso básico à API da Meta verificado.
- O receptor de webhook valida o desafio e a assinatura e armazena entregas em um banco local. **Ele ainda não processa os eventos nem envia respostas.**
- O painel não está conectado ao receptor hospedado. A implantação e os testes reais ainda precisam ser concluídos.

## Executar a prévia local

Com Node.js 24 instalado, execute `node servidor.cjs` e acesse <http://127.0.0.1:8765>. Para testar o painel, execute `node verificar.cjs`.

A opção de guardar o token no Chaves é específica do macOS e usa o auxiliar compilado com `swiftc chaves.swift -o dados/fluxo-chaves`. Esse armazenamento é local e não transfere o token para a VPS.

## EasyPanel

O `Dockerfile` prepara somente o receptor experimental. Antes de colocá-lo em funcionamento, configure HTTPS, persistência, os segredos necessários e as demais medidas descritas na documentação. Não exponha o painel local e nunca registre tokens ou segredos no repositório. A imagem ainda precisa ser construída e testada no ambiente de destino.

Leia [Estado do projeto](documentacao/ESTADO-DO-PROJETO.md) e [VPS na Hostinger](documentacao/HOSPEDAGEM-HOSTINGER.md) para os próximos passos.
