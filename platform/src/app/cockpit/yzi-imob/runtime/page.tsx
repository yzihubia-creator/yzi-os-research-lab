import { redirect } from "next/navigation";

// A rota antiga de runtime nunca foi navegável no produto. Ela aponta agora
// para Sistema, que é a leitura de funcionamento da operação em linguagem
// humana — antes o destino era o Radar, que responde outra pergunta.
export default function YziImobRuntimePage() {
  redirect("/cockpit/yzi-imob/sistema");
}
