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
})();
