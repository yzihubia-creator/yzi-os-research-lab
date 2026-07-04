# YZI IMOB — Product Operating Surface v1

Mapa da Operating Surface oficial do YZI IMOB. Documento estratégico-operacional. Não representa Runtime, Context Builder ou execução — representa a camada que o gestor usa diariamente para operar o negócio.

## Princípio central

A Operating Surface não é o Runtime. O Runtime raciocina e prepara — e é **invisível ao gestor**: nenhum módulo expõe intent router, workflow, tool, contexto ou qualquer vocabulário de runtime. A Operating Surface é onde o gestor vê o estado do negócio, recebe a leitura da YZI e decide. Continua `yzi-imob-ux-ui-operating-system-map-v0.1.md`: **imóvel como ativo operacional central**; a **YZI como entidade operacional** (uma presença que trabalha, prepara e recomenda — não um chatbot nem uma lista de features); nunca CRM genérico; decisão sensível sempre com autorização humana; toda tela é orientada por **decisão**, nunca por tecnologia.

Regra de origem de toda capability e todo módulo: a primeira pergunta é sempre **"qual problema operacional do gestor isto resolve?"** — nunca "qual funcionalidade isto implementa". Superfície ou capability que não responde a essa pergunta não entra no produto.

## Módulos

Cada módulo segue o formato: **Objetivo · Capabilities · Informações mostradas · Decisões YZI · Nunca mostrar**.

### Home — Operating Briefing
**Objetivo:** o **briefing operacional** do gestor — a YZI abre o dia dizendo como o negócio está, o que ela já preparou e qual é a prioridade agora. Não é dashboard de métricas. **Capabilities:** síntese cruzada de imóveis, atendimento, tráfego, pipeline; priorização de ação.
**Informações:** estado vivo do tenant; próximas ações; pendências de autorização; sinais recentes do Radar. **Decisões YZI:** qual a prioridade do dia; o que aguarda autorização; o que está travado.
**Nunca mostrar:** parede de KPIs; gráfico decorativo; métrica sem ação; lista de tarefas sem razão.

### Imóveis
**Objetivo:** organizar o ativo central — cada imóvel como unidade comercial completa, não registro de cadastro. **Capabilities:** cadastro/edição; organização de mídia; pasta comercial; conexão com site/silo; status de publicação/campanha.
**Informações:** estado do imóvel (cadastrado, em preparo, publicado, em campanha, vendido/perdido); o que falta para avançar; histórico de decisões. **Decisões YZI:** o que falta para publicar; se está pronto para campanha; se um imóvel parado deve reativar, repensar ou encerrar.
**Nunca mostrar:** planilha sem contexto comercial; campo técnico de banco; imóvel como linha de tabela genérica.

### Clientes
**Objetivo:** contexto do lead/cliente ligado a imóvel ou negociação — não é base de contatos. **Capabilities:** histórico de interação; ligação cliente ↔ imóveis de interesse; qualificação e estágio.
**Informações:** quem é, com quais imóveis interagiu, estágio, última interação relevante. **Decisões YZI:** se está pronto para próxima etapa (visita, proposta, follow-up); se esfriou e precisa reativação.
**Nunca mostrar:** contatos soltos sem imóvel/negociação; dado sem tenant boundary; histórico bruto de mensagens sem síntese.

### Atendimento
**Objetivo:** conversa e qualificação em andamento — canal onde a YZI atende e escala ao humano quando necessário. **Capabilities:** visão de conversas ativas (WhatsApp e outros); qualificação automática; resposta sugerida; escalonamento ao corretor.
**Informações:** conversas e estágio; o que a YZI já respondeu; o que espera decisão humana. **Decisões YZI:** quando escalar; qual resposta enviar; se o lead avança no funil.
**Nunca mostrar:** inbox genérico sem qualificação; mensagem automática sem rastro; conversa sem vínculo a imóvel/cliente.

### Creative Studio
**Objetivo:** produção de conteúdo e criativos por imóvel — não é editor de design genérico. **Capabilities:** geração de copy/criativos/briefing por imóvel; fila de aprovação; conexão com Tráfego.
**Informações:** o que foi gerado, para qual imóvel, em que estado (rascunho, aguardando aprovação, aprovado, em uso). **Decisões YZI:** aprovar, ajustar ou descartar antes de ir ao ar; o que está pronto para virar campanha.
**Nunca mostrar:** editor livre sem vínculo a imóvel; criativo publicado sem aprovação registrada; biblioteca de assets solta.

### Tráfego
**Objetivo:** desempenho e estado das campanhas por imóvel — leitura, não gerenciador de anúncios cru. **Capabilities:** performance por campanha/imóvel/canal; recomendação de escalar/pausar/ajustar; orçamento autorizado.
**Informações:** o que está no ar, por imóvel, com resultado; onde há vazamento ou oportunidade. **Decisões YZI:** escalar, pausar ou ajustar campanha; realocar orçamento.
**Nunca mostrar:** números crus de plataforma sem leitura; painel de métricas sem recomendação; alteração de orçamento sem autorização humana.

### Radar
**Objetivo:** onde existe oportunidade ou risco antes de virar problema ou ser perdido. **Capabilities:** leitura de sinais cruzados (imóvel parado, lead esfriando, campanha performando, cliente pronto); priorização.
**Informações:** sinais detectados; por que importam; para onde apontam (imóvel, cliente, campanha). **Decisões YZI:** vale agir nesse sinal agora, e como.
**Nunca mostrar:** feed genérico sem priorização; sinal sem explicação; grid de cards soltos tipo Google Trends.

### Operação
**Objetivo:** funcionamento técnico-operacional — conexões, tokens, integrações, saúde da operação. **Capabilities:** status das conexões por categoria de provider (mensageria, campanhas, agenda, geração criativa, radar de mercado, armazenamento — os providers concretos são detalhe de implementação); estado de conexão por tenant; log relevante ao gestor.
**Informações:** o que está conectado e funcionando; o que está pendente/quebrado; o que depende do gestor. **Decisões YZI:** o que reconectar ou reautorizar; o que está bloqueando a operação.
**Nunca mostrar:** log técnico bruto; credencial ou token real na tela; service role ou dado sensível de infraestrutura; DevOps genérico desconectado do negócio.

### Configurações
**Objetivo:** parametrizar tenant, equipe e permissões — não é operação viva. **Capabilities:** gestão de membros e papéis; parâmetros do tenant; limites de autorização por papel.
**Informações:** quem participa e com qual papel; configuração do tenant; limites de autorização ativos. **Decisões YZI:** nenhuma decisão operacional — apenas contexto para o gestor decidir.
**Nunca mostrar:** ação operacional escondida em configuração; permissão alterada sem confirmação explícita; dado de outro tenant.

## Regra transversal

Todo módulo mostra: estado atual; próxima ação; o que a YZI já preparou; o que depende de autorização humana; tenant boundary respeitado; estado honesto sem dado inventado.

## Escopo

Não cria telas, código ou CRUD. Não altera Runtime nem Context Builder. É apenas o mapa do produto para orientar as próximas unidades.
