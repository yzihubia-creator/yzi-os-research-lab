YZI OS — VISUAL BRANDBOOK v1
Artefato de revisao visual PRE-CODIGO. Apenas para VER a cara do YZI OS antes de implementar.
Nao e implementacao de produto. Nao contem React, Next, Tailwind, rota, banco ou Supabase.

==================================================
COMO ABRIR
==================================================

1) HTML (recomendado para revisao em tela)
   - De dois cliques em:  index.html
   - Ou arraste index.html para o navegador (Chrome/Edge).
   - Funciona offline. Nao precisa de internet, servidor ou build.
   - Sao 15 pranchas, role a pagina de cima para baixo.

2) PDF (recomendado para apresentar / arquivar)
   - Abra:  brandbook-yzi-os-v1.pdf
   - 15 pranchas em A4 paisagem, fundo escuro preservado.
   - Cada prancha ocupa uma pagina inteira, sem corte.
   - Abre em qualquer leitor de PDF, offline.

3) PREVIEWS PNG (uma imagem por prancha, identicas as paginas do PDF)
   - Pasta:  previews/
       01-cover.png
       02-manifesto.png
       03-brand-essence.png
       04-visual-mood.png
       05-color-system.png
       06-typography.png
       07-ui-elements.png
       08-operational-components.png
       09-yzihub-surface.png        (prancha mais importante)
       10-dashboard-analysis.png
       11-credits-budget-roi.png
       12-yzi-chat.png
       13-authorization-trust.png
       14-do-dont.png
       15-visual-review-gate.png

==================================================
COMO REVISAR (perguntas de aprovacao)
==================================================

Olhe a prancha 09 (First YZIHUB Surface) e a prancha 15 (Visual Review Gate).
Pranchas criticas: 09, 11 (Credits/Budget/ROI), 12 (YZI Chat), 13 (Authorization & Trust), 10 (Dashboard).

   - Parece YZI OS, e nao qualquer SaaS?
   - Parece mesa de decisao operacional / cabine de comando?
   - A YZI aparece presente e discreta, sem virar chatbot?
   - O YZI Chat e campo livre / workspace agent, e nao FAQ de suporte?
   - Da para entender o proximo passo?
   - A autorizacao esta clara antes da execucao?
   - O Audit Drawer mostra rastro de confianca?
   - Financeiro mostra plano, creditos, midia e ROI separados, com rastro e sem garantia?
   - O dashboard esta subordinado a operacao (prancha 10)?
   - NAO tem cara de CRM / TailAdmin / card wall / KPI wall / chat de suporte?

Se algo parecer generico, marque para corrigir ANTES de qualquer codigo.

==================================================
REGERAR PDF / PNG (opcional, se editar o HTML)
==================================================

PDF (Chrome headless):
   chrome --headless=new --no-pdf-header-footer --no-margins
          --print-to-pdf="brandbook-yzi-os-v1.pdf" "file:///<caminho>/index.html"

PNG de uma prancha (usa o helper ?only=<id>, ex.: p09):
   chrome --headless=new --force-device-scale-factor=2 --window-size=1123,794
          --screenshot="previews/09-yzihub-surface.png" "file:///<caminho>/index.html?only=p09"

Observacao 1: o parametro ?only=<id> so existe para exportar PNG de uma prancha.
No uso normal (index.html sem parametro) as 15 pranchas aparecem em sequencia.

Observacao 2 (fit-to-page): as pranchas mais densas (05, 07, 08, 09, 10, 11, 12)
excedem a altura A4 e por isso recebem uma reducao proporcional SO na impressao
(regra `zoom` no bloco @media print do styles.css). Isso preserva o layout
aprovado e garante que nada seja cortado no PDF. Os PNGs finais sao gerados a
partir do mesmo layout de impressao, ficando identicos as paginas do PDF.

==================================================
PRINCIPIO
==================================================

NAO CODAR SEM VER.
Decisao + acao continua. A YZI nao conversa por conversar. A YZI trabalha.
