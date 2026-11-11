# Hospedagem do Fluxo na HostGator

**Atualizado em:** 11 de novembro de 2026

O usuário informou que tem cPanel na HostGator e uma VPS na Hostinger. Consulte [VPS na Hostinger](HOSPEDAGEM-HOSTINGER.md) para o planejamento atual.

## Compatibilidade a confirmar

A [tabela oficial de compatibilidade da HostGator](https://suporte.hostgator.com.br/hc/pt-br/articles/30811116692115-Quais-s%C3%A3o-as-compatibilidades-da-HostGator) indica que Node.js está disponível nos servidores VPS e dedicados, mas não nos planos compartilhados listados. A instalação e as versões disponíveis dependem do ambiente contratado. A versão atual do receptor usa `node:sqlite` e foi criada com Node.js 24; isso precisa ser validado no servidor antes de qualquer publicação.

Se for hospedagem compartilhada, avaliar alternativas compatíveis com o plano, incluindo adaptação do receptor; não recomendar uma contratação antes de examinar o ambiente e as necessidades do usuário. Se for VPS, verificar a configuração existente e o domínio, sem alterar ou reinstalar componentes em uso.

## Cuidados para a implementação

- O painel local e o arquivo de banco não devem ser expostos publicamente.
- O Chaves do macOS é local e não ficará disponível automaticamente no servidor; um mecanismo seguro de segredos para a hospedagem precisará ser definido.
- O receptor é experimental e ainda não processa eventos nem envia respostas. Antes de colocá-lo em produção, concluir a implementação, verificar os detalhes da assinatura da Meta para a integração escolhida e executar testes reais controlados.
- Não solicitar senhas, tokens ou chaves em mensagens. Não alterar DNS, servidores, serviços existentes ou publicar sem antes preparar uma configuração concreta e revisável.
