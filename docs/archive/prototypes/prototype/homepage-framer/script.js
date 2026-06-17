/* ============================================================
   YZI OS — Homepage Framer-like (protótipo visual) · v0.2
   Tudo aqui é simulado: nenhum dado real, nenhuma integração.
   ============================================================ */

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE_POINTER = window.matchMedia("(pointer: fine)").matches;

/* ------------------------------------------------------------
   VÍDEO DO HERO — fallback se nenhuma fonte carregar
   (local video/hero.mp4 ausente + placeholder remoto offline)
   ------------------------------------------------------------ */
(function () {
  const video = document.getElementById("heroVideo");
  const hero = document.querySelector(".hero");
  if (!video || !hero) return;

  const lastSource = video.querySelector("source:last-of-type");
  if (lastSource) {
    lastSource.addEventListener("error", () => hero.classList.add("no-video"));
  }
  video.addEventListener("error", () => hero.classList.add("no-video"));

  // Com reduced motion, congela o vídeo no primeiro frame
  if (REDUCED) {
    video.removeAttribute("autoplay");
    video.pause();
  }
})();

/* ------------------------------------------------------------
   GLOW DO CURSOR + BOTÕES MAGNÉTICOS (apenas pointer fine)
   ------------------------------------------------------------ */
if (FINE_POINTER && !REDUCED) {
  const glow = document.getElementById("cursorGlow");
  let gx = 0, gy = 0, tx = 0, ty = 0, glowOn = false;

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!glowOn) { glow.style.opacity = "1"; glowOn = true; }
  }, { passive: true });

  (function glowLoop() {
    gx += (tx - gx) * 0.08;
    gy += (ty - gy) * 0.08;
    glow.style.left = gx + "px";
    glow.style.top = gy + "px";
    requestAnimationFrame(glowLoop);
  })();

  document.querySelectorAll(".magnetic").forEach((el) => {
    const strength = 0.28;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

/* ------------------------------------------------------------
   TILT 3D nos cards de estágio (apenas pointer fine)
   ------------------------------------------------------------ */
if (FINE_POINTER && !REDUCED) {
  document.querySelectorAll(".tilt").forEach((card) => {
    // Transição curta durante o movimento (resposta imediata),
    // longa apenas no retorno ao repouso.
    card.addEventListener("pointerenter", () => {
      card.style.transition = "transform 0.12s ease-out, border-color 0.5s, box-shadow 0.5s";
    });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 7;
      const ry = (px - 0.5) * 9;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.setProperty("--gx", px * 100 + "%");
      card.style.setProperty("--gy", py * 100 + "%");
    });
    card.addEventListener("pointerleave", () => {
      card.style.transition = "";
      card.style.transform = "";
    });
  });
}

/* ------------------------------------------------------------
   SCROLL: barra de progresso + reveals
   ------------------------------------------------------------ */
const progress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
}, { passive: true });

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.12 });
document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));

/* ------------------------------------------------------------
   MARQUEE — duplica o conteúdo para loop contínuo
   ------------------------------------------------------------ */
(function () {
  const track = document.getElementById("marqueeTrack");
  if (track) track.innerHTML += track.innerHTML;
})();

/* ------------------------------------------------------------
   FEED VIVO — ciclo operacional simulado da YZI
   ------------------------------------------------------------ */
(function () {
  const feed = document.getElementById("liveFeed");
  const counterEl = document.getElementById("recoveredCounter");
  if (!feed) return;

  const ICONS = {
    risk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
    prep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    recov: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12A10 10 0 1 1 12 2"/><path d="m9 11 3 3L22 4"/></svg>',
    learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 5V3"/><path d="M12 21v-2"/><path d="M5 12H3"/><path d="M21 12h-2"/><path d="m7 7-1.5-1.5"/><path d="m18.5 5.5-1.5 1.5"/><path d="m7 17-1.5 1.5"/><path d="m18.5 18.5-1.5-1.5"/></svg>',
  };

  // Roteiro do ciclo (loop). approve: true cria botão de aprovação.
  const SCRIPT = [
    { k: "risk",  txt: "Orçamento sem resposta há 3 dias — sinal esfriando", meta: "OPP-0347 · <b>R$ 4.800</b> em risco" },
    { k: "prep",  txt: "Retomada preparada e pronta para sua aprovação", meta: "OPP-0347 · 1 toque para aprovar", approve: true },
    { k: "recov", txt: "Cliente respondeu — proposta reaberta", meta: "<b>+ R$ 2.300</b> de volta à mesa", gain: 2300 },
    { k: "learn", txt: "Padrão registrado: follow-up em 48h converte 2,1× mais", meta: "memória operacional atualizada" },
    { k: "risk",  txt: "Carrinho de alto valor abandonado no checkout", meta: "OPP-0351 · <b>R$ 1.940</b> em risco" },
    { k: "prep",  txt: "Oferta de retomada preparada com desconto controlado", meta: "OPP-0351 · aguardando aprovação", approve: true },
    { k: "recov", txt: "Compra concluída após retomada", meta: "<b>+ R$ 1.940</b> recuperados", gain: 1940 },
    { k: "learn", txt: "Janela ideal de retomada deste perfil: 6 horas", meta: "memória operacional atualizada" },
    { k: "risk",  txt: "Cliente recorrente sem pedido há 40 dias", meta: "OPP-0358 · churn provável" },
    { k: "prep",  txt: "Reativação personalizada pronta para revisão", meta: "OPP-0358 · aguardando aprovação", approve: true },
    { k: "recov", txt: "Pedido novo registrado — cliente reativado", meta: "<b>+ R$ 3.150</b> recuperados", gain: 3150 },
  ];

  const MAX_ITEMS = 5;
  let idx = 0;
  let recovered = 12480;

  function fmt(n) {
    return n.toLocaleString("pt-BR");
  }

  function clock() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function bumpCounter(gain) {
    const start = recovered;
    recovered += gain;
    if (REDUCED) { counterEl.textContent = fmt(recovered); return; }
    const t0 = performance.now(), dur = 900;
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      counterEl.textContent = fmt(Math.round(start + gain * eased));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  function addItem(ev) {
    const el = document.createElement("div");
    el.className = "feed-item k-" + ev.k;
    el.innerHTML =
      '<div class="feed-icon">' + ICONS[ev.k] + "</div>" +
      '<div class="feed-body"><div class="txt">' + ev.txt + '</div><div class="meta">' + ev.meta + "</div></div>" +
      (ev.approve
        ? '<button class="feed-approve">Aprovar</button>'
        : '<span class="feed-time">' + clock() + "</span>");
    feed.appendChild(el);

    const btn = el.querySelector(".feed-approve");
    if (btn) {
      btn.addEventListener("click", () => {
        btn.textContent = "Aprovado ✓";
        btn.style.background = "var(--ink-0)";
        btn.style.color = "var(--bg-0)";
        btn.disabled = true;
      });
    }

    // Mantém o painel enxuto
    if (feed.children.length > MAX_ITEMS) {
      const first = feed.firstElementChild;
      if (REDUCED) {
        first.remove();
      } else {
        first.classList.add("leaving");
        setTimeout(() => first.remove(), 480);
      }
    }
  }

  function next() {
    const ev = SCRIPT[idx % SCRIPT.length];
    addItem(ev);
    if (ev.gain) setTimeout(() => bumpCounter(ev.gain), 600);
    idx++;
    const delay = REDUCED ? 4200 : 2600 + Math.random() * 1600;
    setTimeout(next, delay);
  }

  // Semeia os 3 primeiros itens imediatamente para o painel nunca abrir vazio
  for (let i = 0; i < 3; i++) addItem(SCRIPT[idx++]);
  setTimeout(next, 2400);
})();

/* ------------------------------------------------------------
   CONSOLE — primeira sessão simulada com efeito de digitação
   ------------------------------------------------------------ */
(function () {
  const input = document.getElementById("consoleInput");
  const btn = document.getElementById("consoleSend");
  const reply = document.getElementById("consoleReply");
  if (!btn) return;

  const RESPONSES = [
    "Entendi. Primeira pergunta: hoje, quem responde um pedido de orçamento que chega fora do horário comercial? É exatamente aí que costumo encontrar o primeiro vazamento.",
    "Certo. Me diga uma coisa: quanto tempo, em média, um cliente espera por um follow-up depois de demonstrar interesse? Se a resposta for \"depende\", já temos por onde começar.",
    "Anotado. Em negócios assim, o vazamento mais comum está entre o primeiro contato e a proposta. Quer que eu olhe esse trecho primeiro?",
  ];
  let ri = 0;
  let typing = false;

  function typeReply(text) {
    typing = true;
    reply.innerHTML = '<span class="caret"></span>';
    if (REDUCED) {
      reply.textContent = text + " (resposta simulada)";
      typing = false;
      return;
    }
    let i = 0;
    (function step() {
      i += 1 + Math.floor(Math.random() * 2);
      const shown = text.slice(0, i);
      reply.innerHTML = shown.replace(/\n/g, "<br>") + '<span class="caret"></span>';
      if (i < text.length) {
        setTimeout(step, 18 + Math.random() * 26);
      } else {
        reply.innerHTML = shown + ' <span style="color: var(--ink-3); font-size: 12px;">— resposta simulada</span>';
        typing = false;
      }
    })();
  }

  function send() {
    if (typing || btn.disabled) return;
    const orig = btn.textContent;
    btn.textContent = "YZI pensando…";
    btn.disabled = true;
    setTimeout(() => {
      typeReply(RESPONSES[ri % RESPONSES.length]);
      ri++;
      btn.textContent = orig;
      btn.disabled = false;
      input.value = "";
      input.placeholder = "Responda à YZI…";
    }, 900);
  }

  btn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });
})();

/* ------------------------------------------------------------
   FLUXO — acende passo a passo em loop
   ------------------------------------------------------------ */
(function () {
  const steps = document.querySelectorAll("#flow .flow-step");
  if (!steps.length) return;
  let i = 0;
  steps[0].classList.add("lit");
  setInterval(() => {
    steps.forEach((s) => s.classList.remove("lit"));
    i = (i + 1) % steps.length;
    steps[i].classList.add("lit");
  }, 1800);
})();
