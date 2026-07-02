import { redirect } from "next/navigation";

// A vertical YZI IMOB abre direto no Estúdio Comercial nesta fase. Rota base
// só evita um beco sem saída (404) em /cockpit/yzi-imob.
export default function YziImobIndexPage() {
  redirect("/cockpit/yzi-imob/studio");
}
