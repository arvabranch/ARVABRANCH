(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const toggle = $(".nav__toggle");
  const menu = $("#mobile-menu");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    nav.classList.toggle("scrolled", open || window.scrollY > 10);
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Hero word rotator ---------- */
  const words = ["software a la medida", "automatizaciones", "bots con IA", "webs que cobran solas"];
  const rotator = $("#rotator");
  let wi = 0;
  if (!reduceMotion) {
    setInterval(() => {
      rotator.classList.add("out");
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        rotator.textContent = words[wi];
        rotator.classList.remove("out");
      }, 350);
    }, 2800);
  }

  /* ---------- Reveal on scroll ---------- */
  const groups = new Map();
  $$(".reveal").forEach((el) => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0;
    el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
    groups.set(parent, i + 1);
  });
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Counters ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = Number(el.dataset.count);
      const pre = el.dataset.prefix ? el.dataset.prefix.replace("&lt;", "<") : "";
      const suf = el.dataset.suffix || "";
      const start = performance.now();
      const dur = reduceMotion ? 1 : 1400;
      const tick = (t) => {
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(target * eased) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Card spotlight + tilt ---------- */
  const fine = window.matchMedia("(pointer: fine)").matches;
  $$("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      if (fine && !reduceMotion) {
        card.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * 4}deg) rotateY(${(x - 0.5) * 4}deg) translateY(-4px)`;
      }
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  /* ---------- Hero branches canvas ---------- */
  const canvas = $("#branches");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  let tips = [];
  const palette = [[52, 245, 197], [59, 178, 246], [167, 139, 250]];
  const isLight = () => window.matchMedia("(prefers-color-scheme: light)").matches;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const colorAt = (x) => {
    const t = Math.max(0, Math.min(1, x / W)) * 2;
    const i = Math.min(Math.floor(t), 1);
    const f = t - i;
    const a = palette[i], b = palette[i + 1];
    return a.map((v, k) => Math.round(v + (b[k] - v) * f));
  };

  const spawn = (x, y, angle, depth = 0, width = 2) => {
    if (tips.length > 140) return;
    tips.push({ x, y, angle, depth, width, life: 60 + Math.random() * 90, speed: 1.4 + Math.random() * 1.2 });
  };

  const seed = () => {
    const n = W < 700 ? 3 : 6;
    for (let i = 0; i < n; i++) {
      spawn(W * (0.05 + Math.random() * 0.9), H + 5, -Math.PI / 2 + (Math.random() - 0.5) * 0.6, 0, 2.4);
    }
  };

  let last = 0;
  const frame = (t) => {
    // fade old strokes to keep trails soft
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.018)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    const alpha = isLight() ? 0.5 : 0.65;
    const next = [];
    for (const p of tips) {
      const nx = p.x + Math.cos(p.angle) * p.speed;
      const ny = p.y + Math.sin(p.angle) * p.speed;
      const [r, g, b] = colorAt(p.x);
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = p.width;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny;
      p.angle += (Math.random() - 0.5) * 0.08;
      p.life -= 1;

      if (p.life <= 0) {
        // node glow
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.shadowColor = `rgb(${r},${g},${b})`;
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1.6, p.width * 1.1), 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (p.depth < 5 && p.y > -20) {
          const spread = 0.35 + Math.random() * 0.35;
          const w = Math.max(0.6, p.width * 0.72);
          next.push({ ...p, angle: p.angle - spread, depth: p.depth + 1, width: w, life: 40 + Math.random() * 70 });
          if (Math.random() > 0.2) next.push({ ...p, angle: p.angle + spread, depth: p.depth + 1, width: w, life: 40 + Math.random() * 70 });
        }
      } else if (p.x > -50 && p.x < W + 50 && p.y > -50) {
        next.push(p);
      }
    }
    tips = next.slice(0, 160);
    if (t - last > 1600 || tips.length === 0) { seed(); last = t; }
    requestAnimationFrame(frame);
  };

  if (!reduceMotion) {
    resize();
    window.addEventListener("resize", resize);
    const hero = $(".hero");
    let lastSpawn = 0;
    hero.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - lastSpawn < 140) return;
      lastSpawn = now;
      const r = canvas.getBoundingClientRect();
      spawn(e.clientX - r.left, e.clientY - r.top, Math.random() * Math.PI * 2, 2, 1.4);
    });
    seed();
    requestAnimationFrame(frame);
  }

  /* ---------- Booking demo ---------- */
  const booking = $("#booking");
  const daysEl = $(".days", booking);
  const slotsEl = $(".slots", booking);
  const toPay = $("#to-pay");
  const stepDots = $$(".steps i", booking);
  const monthLabel = $("#month-label");
  const dayFmt = new Intl.DateTimeFormat("es", { weekday: "short" });
  const monthFmt = new Intl.DateTimeFormat("es", { month: "long" });
  const longFmt = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" });
  const hours = ["9:00", "10:00", "11:30", "1:00", "2:30", "3:30", "4:30", "6:00"];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  let sel = { day: null, slot: null };

  const showStep = (n) => {
    $$(".booking__step", booking).forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
    stepDots.forEach((d, i) => d.classList.toggle("on", i < n));
  };

  const renderSlots = (date) => {
    slotsEl.innerHTML = "";
    hours.forEach((h, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.textContent = h + (i < 3 ? " am" : " pm");
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", "false");
      // deterministic "busy" slots per day
      if ((date.getDate() * 7 + i * 3) % 5 === 0) b.disabled = true;
      b.addEventListener("click", () => {
        $$(".slot", slotsEl).forEach((s) => s.setAttribute("aria-selected", "false"));
        b.setAttribute("aria-selected", "true");
        sel.slot = b.textContent;
        toPay.disabled = false;
      });
      slotsEl.appendChild(b);
    });
  };

  const renderDays = () => {
    daysEl.innerHTML = "";
    const base = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "day";
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", "false");
      b.innerHTML = `<small>${dayFmt.format(d).replace(".", "")}</small><b>${d.getDate()}</b>`;
      b.setAttribute("aria-label", longFmt.format(d));
      if (d.getDay() === 0) b.disabled = true;
      b.addEventListener("click", () => selectDay(b, d));
      daysEl.appendChild(b);
    }
    const first = $(".day:not(:disabled)", daysEl);
    const firstDate = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1 + $$(".day", daysEl).indexOf(first));
    selectDay(first, firstDate);
  };

  const selectDay = (btn, date) => {
    $$(".day", daysEl).forEach((d) => d.setAttribute("aria-selected", "false"));
    btn.setAttribute("aria-selected", "true");
    sel = { day: date, slot: null };
    toPay.disabled = true;
    monthLabel.textContent = cap(monthFmt.format(date));
    renderSlots(date);
  };

  toPay.addEventListener("click", () => {
    $("#sum-date").textContent = `${cap(longFmt.format(sel.day))} · ${sel.slot}`;
    showStep(2);
  });
  $("#back").addEventListener("click", () => showStep(1));
  $("#pay").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    btn.classList.add("loading");
    btn.disabled = true;
    setTimeout(() => {
      btn.classList.remove("loading");
      btn.disabled = false;
      $("#done-text").textContent = `${cap(longFmt.format(sel.day))} a las ${sel.slot}. Te enviamos la confirmación por correo y WhatsApp.`;
      showStep(3);
    }, 1400);
  });
  $("#restart").addEventListener("click", () => { renderDays(); showStep(1); });
  renderDays();

  /* ---------- Bot demo ---------- */
  const chat = $("#chat");
  const quick = $("#quick");
  const status = $("#bot-status");
  const flows = {
    start: {
      bot: ["¡Hola! 👋 Soy el asistente de ARVABRANCH.", "¿En qué te puedo ayudar hoy?"],
      options: [["Quiero un bot", "bot"], ["Agendar una cita", "cita"], ["¿Cuánto cuesta?", "precio"]],
    },
    bot: {
      bot: ["¡Genial! Creamos bots para WhatsApp, Instagram y tu web 🤖", "Pueden responder preguntas, tomar pedidos, agendar citas y cobrar. ¿Qué te gustaría automatizar?"],
      options: [["Atención al cliente", "lead"], ["Ventas y pedidos", "lead"], ["Volver al inicio", "start"]],
    },
    cita: {
      bot: ["Perfecto 📅 Tengo disponible una asesoría gratuita de 30 min.", "¿Qué horario te queda mejor?"],
      options: [["Mañana en la mañana", "agendado"], ["Mañana en la tarde", "agendado"]],
    },
    agendado: {
      bot: ["¡Listo! ✅ Tu asesoría quedó agendada.", "Te llegará un recordatorio una hora antes. ¿Algo más?"],
      options: [["Ver precios", "precio"], ["Eso es todo, gracias", "fin"]],
    },
    precio: {
      bot: ["Cada proyecto se cotiza según su alcance, sin sorpresas 💬", "Una web con agenda y pagos es el punto de partida más accesible. ¿Quieres una cotización?"],
      options: [["Sí, cotizar", "lead"], ["Agendar una cita", "cita"]],
    },
    lead: {
      bot: ["¡Excelente elección! 🚀", "Déjanos tus datos en el formulario de contacto y un experto te escribe en menos de 24 h."],
      options: [["Ir al formulario", "#contacto"], ["Volver al inicio", "start"]],
    },
    fin: {
      bot: ["¡Con gusto! Que tengas un excelente día 🌱"],
      options: [["Reiniciar conversación", "start"]],
    },
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
  const add = (text, who) => {
    const m = document.createElement("div");
    m.className = `msg msg--${who}`;
    m.textContent = text;
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
    return m;
  };

  let busy = false;
  const run = async (key) => {
    if (key.startsWith("#")) { document.querySelector(key).scrollIntoView({ behavior: "smooth" }); return; }
    busy = true;
    quick.innerHTML = "";
    const node = flows[key];
    for (const line of node.bot) {
      status.textContent = "escribiendo…";
      const t = document.createElement("div");
      t.className = "msg msg--bot typing";
      t.innerHTML = "<i></i><i></i><i></i>";
      chat.appendChild(t);
      chat.scrollTop = chat.scrollHeight;
      await sleep(600 + line.length * 12);
      t.remove();
      add(line, "bot");
    }
    status.textContent = "en línea";
    node.options.forEach(([label, next]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => {
        if (busy) return;
        if (!next.startsWith("#")) add(label, "user");
        run(next);
      });
      quick.appendChild(b);
    });
    busy = false;
  };

  const botIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { run("start"); botIO.disconnect(); }
  }, { threshold: 0.4 });
  botIO.observe($("#bot"));

  /* ---------- Contact form ---------- */
  const form = $("#contact-form");
  const formStatus = $("#form-status");
  const nameEl = $("#name");
  const emailEl = $("#email");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    nameEl.classList.toggle("invalid", !name);
    emailEl.classList.toggle("invalid", !okEmail);
    if (!name || !okEmail) {
      formStatus.className = "form__status err";
      formStatus.textContent = "Revisa tu nombre y correo, por favor.";
      return;
    }
    const services = $$('input[name="service"]:checked', form).map((i) => i.value).join(", ") || "Sin especificar";
    const body = `Nombre: ${name}\nCorreo: ${email}\nServicios: ${services}\n\n${$("#msg").value.trim()}`;
    window.location.href = `mailto:hola@arvabranch.com?subject=${encodeURIComponent("Nuevo proyecto — " + name)}&body=${encodeURIComponent(body)}`;
    formStatus.className = "form__status";
    formStatus.textContent = "¡Gracias! Abrimos tu correo para enviar el mensaje.";
  });

  /* ---------- Interactive Showcase Proyectos ---------- */
  // 1. Filtros
  const filterBtns = $$(".proj-filter");
  const projectCards = $$(".project-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const filter = btn.dataset.filter;
      projectCards.forEach((card) => {
        const cat = card.dataset.category || "";
        const match = filter === "all" || cat.includes(filter);
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  // 2. Mockup 1: Ana Faber Luxury Selector
  const luxSvcs = $$(".mock-lux__svc");
  const luxTotal = $("#lux-total");
  const luxTime = $("#lux-time");
  const luxSlots = $("#lux-slots");
  luxSvcs.forEach((btn) => {
    btn.addEventListener("click", () => {
      luxSvcs.forEach((b) => {
        b.classList.remove("is-selected");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-checked", "true");
      if (luxTotal) luxTotal.textContent = btn.dataset.price;
      if (luxTime) luxTime.textContent = `⏱ Duración: ${btn.dataset.time}`;
      if (luxSlots) luxSlots.textContent = `● ${btn.dataset.slots}`;
    });
  });

  // 3. Mockup 2: Dra. Ana Faber Treatments Switcher
  const medTabs = $$(".mock-med__tab");
  const medList = $("#med-list");
  const treatmentsData = {
    facial: [
      "✨ Armonización Facial",
      "✨ Toxina Botulínica (Botox)",
      "✨ Perfilamiento de Labios",
      "✨ Rinomodelación"
    ],
    corporal: [
      "⚡ Depilación Láser 4D Vellux",
      "⚡ Lipopapada con Enzimas",
      "⚡ Endoláser Corporal",
      "⚡ Tensamax & Reafirmación"
    ],
    rejuvenecimiento: [
      "🌿 Bioestimuladores de Colágeno",
      "🌿 Plasma Rico en Plaquetas (PRP)",
      "🌿 Peeling Químico Clínico",
      "🌿 Exosomas & Skinbooster"
    ]
  };
  medTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      medTabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      const cat = tab.dataset.cat;
      const items = treatmentsData[cat] || treatmentsData.facial;
      if (medList) {
        medList.innerHTML = items.map((i) => `<span class="mock-med__item">${i}</span>`).join("");
      }
    });
  });

  // 4. Mockup 3: Bertha Upegui Emotion Picker
  const thEmotions = $$(".mock-th__emo");
  const thMsg = $("#th-msg");
  const emotionResponses = {
    ansiedad: `"Aprender a regular tu respiración, pausar y comprender lo que tu mente experimenta es un camino que transitamos juntos."`,
    cansancio: `"La sobrecarga emocional y el agotamiento mental tienen solución. Date el permiso de descansar y pedir apoyo."`,
    tristeza: `"No tienes que sostenerlo todo a solas. Hay un espacio cálido, sin juicio y confidencial esperándote."`,
    confusion: `"Si no sabes bien qué sientes o hacia dónde avanzar, ordenar las piezas juntos en sesión es el primer paso."`,
    bien: `"El crecimiento personal y el autoconocimiento también se potencian cuando te sientes bien y buscas plenitud."`
  };
  thEmotions.forEach((btn) => {
    btn.addEventListener("click", () => {
      thEmotions.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");
      const emo = btn.dataset.emo;
      if (thMsg && emotionResponses[emo]) {
        thMsg.style.opacity = "0";
        setTimeout(() => {
          thMsg.textContent = emotionResponses[emo];
          thMsg.style.opacity = "1";
        }, 120);
      }
    });
  });

  // Control de vista: Imagen Real vs Simulador Interactivo
  $$(".browser-mockup").forEach((mockup) => {
    const switches = $$(".mock-switch", mockup);
    const views = $$(".browser-mockup__view", mockup);
    switches.forEach((sw) => {
      sw.addEventListener("click", () => {
        const targetView = sw.dataset.view;
        switches.forEach((s) => {
          s.classList.remove("is-active");
          s.setAttribute("aria-selected", "false");
        });
        sw.classList.add("is-active");
        sw.setAttribute("aria-selected", "true");
        views.forEach((v) => {
          const isMatch = v.classList.contains(`browser-mockup__view--${targetView}`);
          v.classList.toggle("is-active", isMatch);
        });
      });
    });
  });

  // 5. Modal Ficha Técnica
  const modal = $("#proj-modal");
  const modalContent = $("#modal-content");
  const modalClose = $("#modal-close");
  const modalBackdrop = $("#modal-backdrop");

  const projectSheets = {
    anafaberluxury: {
      title: "Ana Faber Luxury",
      lead: "Página web con sistema de agendamiento 24/7 y confirmación directa",
      client: "Ana Faber Luxury (Cali, Colombia) · Sector Belleza & Spa",
      img: "assets/projects/anafaberluxury_preview.png",
      challenge: "Coordinar citas manualmente por WhatsApp causaba demoras en responder y pérdida de clientes en horas no laborales.",
      solution: "Implementamos una agenda interactiva en tiempo real donde las clientas seleccionan servicio y turno en 3 pasos con confirmación automática.",
      results: "100% de reservas autogestionadas por el cliente, 0 llamadas perdidas en fin de semana y una agenda que se llena sola.",
      url: "https://dranafaberluxury.nbmates.com"
    },
    dranafaber: {
      title: "Dra. Ana Cristina Faber",
      lead: "Web médica institucional y posicionamiento de marca de alta gama",
      client: "Dra. Ana Cristina Faber (Cali, Colombia) · Medicina Estética & Antiaging",
      img: "assets/projects/dranafaber_preview.png",
      challenge: "La clínica requería proyectar máxima reputación científica, diferenciarse de centros empíricos y educar al paciente antes de llegar a consulta.",
      solution: "Construimos un portal institucional de alta gama con catálogo médico completo de más de 25 tratamientos y comparativa clínica de resultados reales.",
      results: "Incremento directo en la confianza del paciente previo a la consulta y una presentación exclusiva acorde a una práctica médica premium.",
      url: "https://dranafaber.nbmates.com/inicio"
    },
    berthaupegui: {
      title: "Bertha Upegui Galofre",
      lead: "Plataforma de psicoterapia online con cobro internacional en USD",
      client: "Psi. Bertha Cecilia Upegui (Atención Global en Español) · Salud Mental",
      img: "assets/projects/berthaupegui_preview.png",
      challenge: "Con pacientes en diversos países, coordinar husos horarios y recibir transferencias generaba confusiones de agenda y trabas cambiarias.",
      solution: "Desarrollamos una experiencia cálida con ajuste automático de zona horaria según el país del paciente y cobro seguro en dólares con tarjeta.",
      results: "Pacientes en más de 10 países atendidos sin errores de horario y pagos recibidos al instante sin intermediarios bancarios.",
      url: "https://berthaupegui.arvabranch.com"
    }
  };

  const openModal = (projId) => {
    const data = projectSheets[projId];
    if (!data || !modal || !modalContent) return;
    modalContent.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-sheet__head">
          <span class="proj-tag proj-tag--accent">${data.client}</span>
          <h3 id="modal-title">${data.title}</h3>
          <p>${data.lead}</p>
        </div>

        <div class="modal-sheet__img-preview" style="border-radius: 14px; overflow: hidden; border: 1px solid var(--separator); max-height: 220px;">
          <img src="${data.img}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover; object-position: top; display: block;" />
        </div>

        <div class="modal-sheet__section">
          <h4>El Reto</h4>
          <p>${data.challenge}</p>
        </div>

        <div class="modal-sheet__section">
          <h4>Solución ARVABRANCH</h4>
          <p>${data.solution}</p>
        </div>

        <div class="modal-sheet__section">
          <h4>Resultados Clave</h4>
          <p>${data.results}</p>
        </div>

        <div class="modal-sheet__footer">
          <a href="${data.url}" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
            Visitar sitio en vivo
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
      </div>
    `;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  $$(".open-modal-btn").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.project));
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });
})();
