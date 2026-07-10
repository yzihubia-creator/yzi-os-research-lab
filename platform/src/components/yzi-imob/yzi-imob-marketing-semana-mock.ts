import type { YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import {
  marketingMedia,
  type MarketingMedia,
} from "@/components/yzi-imob/yzi-imob-marketing-kit";
import { propertyDemoAssetSrc } from "@/lib/yzi-imob/demo-media/property-demo-assets";

// Semana de exemplo do módulo Marketing (Revisar Semana v0).
// Tudo aqui é mock declarado: nada é gerado, agendado ou publicado.
// Os formatos seguem o contrato real de mídia do Marketing Kit:
// 4:5 (1080×1350), 1:1 (1080×1080), 9:16 (1080×1920), 1.91:1 (1200×628).

export type SemanaItemFormato = "Reel" | "Story" | "Carrossel" | "Feed" | "Link";

export type SemanaItem = {
  id: string;
  titulo: string;
  formato: SemanaItemFormato;
  media: MarketingMedia;
  canal: string;
  diaHorario: string;
  objetivo: string;
  porQue: string;
  dependeDeVoce?: string;
  publicacaoManual?: boolean;
  imovel?: { id: string; nome: string };
  creditos: number;
  palette: [YziImobRole, YziImobRole];
  headline: string;
  supportingText: string;
  badges: string[];
  imageSrc?: string;
};

export const MOCK_SEMANA_LABEL = "Semana de exemplo · 13–19 jul";

export const MOCK_SEMANA_CREDITOS_MES = 40;

export const MOCK_SEMANA_ITENS: SemanaItem[] = [
  {
    id: "semana_item_01",
    titulo: "Vídeo do Apartamento Altiplano",
    formato: "Feed",
    media: marketingMedia("feed-1x1", { mimeType: "video/mp4", durationSeconds: 18 }),
    canal: "Instagram",
    diaHorario: "terça · 18h",
    objetivo: "Gerar visitas para o Altiplano",
    porQue: "Vídeos de imóveis com varanda foram os que mais geraram contato no seu perfil.",
    imovel: { id: "property_altiplano_001", nome: "Apartamento Altiplano" },
    creditos: 6,
    palette: ["primary", "cyan"],
    headline: "Vista alta, rotina leve",
    supportingText: "Feito com as fotos reais do imóvel. Movimento e trilha entram na versão final.",
    badges: ["Fotos reais do imóvel", "Agende sua visita"],
    imageSrc: propertyDemoAssetSrc("story"),
  },
  {
    id: "semana_item_02",
    titulo: "Carrossel: por que o bairro Altiplano valoriza",
    formato: "Carrossel",
    media: marketingMedia("feed-4x5"),
    canal: "Instagram",
    diaHorario: "quarta · 18h",
    objetivo: "Mostrar que você conhece a cidade",
    porQue: "Seus seguidores engajam o dobro quando o assunto é bairro, não imóvel.",
    creditos: 3,
    palette: ["cyan", "coldGreen"],
    headline: "O bairro que mais valorizou no ano",
    supportingText: "5 cartelas com dados do bairro e fechamento com a sua marca.",
    badges: ["Conteúdo de cidade", "5 cartelas"],
    imageSrc: propertyDemoAssetSrc("carousel"),
  },
  {
    id: "semana_item_03",
    titulo: "Vídeo seu: financiamento sem mistério",
    formato: "Reel",
    media: marketingMedia("reel-9x16", { mimeType: "video/mp4", durationSeconds: 60 }),
    canal: "Instagram e Facebook",
    diaHorario: "quinta · 19h",
    objetivo: "Construir sua autoridade",
    porQue: "Faz 3 semanas que o seu perfil só publica imóvel. Gente confia em gente.",
    dependeDeVoce: "Gravar 60 segundos no celular. O roteiro está pronto — eu edito, legendo e assino.",
    creditos: 2,
    palette: ["lilac", "primary"],
    headline: "Financiamento sem mistério",
    supportingText: "Você fala, a YZI edita. Roteiro de 60 segundos pronto para gravar.",
    badges: ["Você grava, eu edito", "Roteiro pronto"],
  },
  {
    id: "semana_item_04",
    titulo: "Story com enquete: morar perto do mar",
    formato: "Story",
    media: marketingMedia("story-9x16"),
    canal: "Instagram",
    diaHorario: "sexta · 12h",
    objetivo: "Aquecer a audiência para o fim de semana",
    porQue: "Enquetes simples são o formato com mais respostas no seu perfil.",
    publicacaoManual: true,
    creditos: 1,
    palette: ["cyan", "lilac"],
    headline: "Praia ou centro?",
    supportingText: "Story com enquete pronta. O Instagram só deixa publicar este formato pelo seu celular.",
    badges: ["Enquete", "Sai pelo seu celular"],
    imageSrc: propertyDemoAssetSrc("story"),
  },
  {
    id: "semana_item_05",
    titulo: "Post institucional: quem cuida do seu imóvel",
    formato: "Link",
    media: marketingMedia("paisagem-1.91x1"),
    canal: "Facebook",
    diaHorario: "segunda · 11h",
    objetivo: "Apresentar a imobiliária para novos seguidores",
    porQue: "Seu Facebook está sem publicação institucional há um mês.",
    creditos: 2,
    palette: ["primary", "coldGreen"],
    headline: "Gente que cuida do seu patrimônio",
    supportingText: "Arte com a sua equipe e a sua marca, no tom que você aprovou.",
    badges: ["Institucional", "Sua marca"],
    imageSrc: propertyDemoAssetSrc("living"),
  },
  {
    id: "semana_item_06",
    titulo: "Carrossel: 4 erros de quem anuncia sozinho",
    formato: "Carrossel",
    media: marketingMedia("feed-4x5"),
    canal: "Instagram",
    diaHorario: "sábado · 10h",
    objetivo: "Atrair proprietários que querem anunciar",
    porQue: "Conteúdo para proprietário é a sua maior lacuna — e é de onde vem captação.",
    creditos: 3,
    palette: ["coldGreen", "cyan"],
    headline: "4 erros de quem anuncia sozinho",
    supportingText: "Fala com o proprietário, não com o comprador. Fecha convidando para uma avaliação.",
    badges: ["Captação", "Avaliação gratuita"],
    imageSrc: propertyDemoAssetSrc("drone"),
  },
];
