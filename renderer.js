// Renderer for Eye For IT — injects content from content.json into the page.
// Loads after the DOM; safe to run on every visit.
(function () {
  "use strict";

  async function loadContent() {
    try {
      const res = await fetch("/content.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("content.json not found");
      return await res.json();
    } catch (err) {
      console.warn("Renderer: could not load content.json — site may be serving statically without the CMS data.", err);
      return null;
    }
  }

  function setText(el, text) {
    if (text === undefined || text === null) return;
    el.textContent = text;
  }

  function setAttr(el, attr, value) {
    if (value) el.setAttribute(attr, value);
    else el.removeAttribute(attr);
  }

  function renderHero(data) {
    const h = data && data.hero;
    if (!h) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;

    // Heading is kept static in the HTML (with accent <span> styling).
    setText(hero.querySelector("#hero-subtitle"), h.subtitle || "");
    const btns = hero.querySelectorAll("#hero-button1, #hero-button2");
    if (btns[0]) setText(btns[0], h.button1 || "");
    if (btns[1]) setText(btns[1], h.button2 || "");
    setText(hero.querySelector("#hero-beta"), h.beta_line || "");

    // Customer review (5 stars + quote + author)
    const trusted = hero.querySelector("#hero-trusted");
    if (trusted) {
      const list = data && data.testimonials && data.testimonials.list;
      const t = list && list[0];
      if (t) {
        trusted.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:#ffb800;font-size:20px;">★★★★★</span>
            <span style="font-size:15px;font-weight:600;color:#fff;">5 out of 5 based on Multiple client reviews</span>
          </div>
          <span style="color:#a1a1a8;font-size:13px;">|</span>
          <span style="font-size:13px;color:#a1a1a8;">${t.quote}</span>
          <span style="font-weight:600;color:#fff;font-size:13px;">— ${t.author}</span>
        `;
      } else {
        trusted.innerHTML = "";
      }
    }
  }

  function renderServices(data) {
    const list = data && data.services && data.services.list;
    if (!Array.isArray(list)) return;
    const grid = document.querySelector(".services__grid");
    if (!grid) return;
    grid.innerHTML = list.map(s => `
      <article class="service-card">
        <h3><span class="service-card__icon" aria-hidden="true">${s.icon || "🛠️"}</span> ${s.title}</h3>
        <p>${s.description || ""}</p>
      </article>
    `).join("");
  }

  function renderWhy(data) {
    const list = data && data.why && data.why.list;
    if (!Array.isArray(list)) return;
    const grid = document.querySelector(".why__grid");
    if (!grid) return;
    grid.innerHTML = list.map(w => `
      <div class="why-item">
        <div class="why-item__icon">${w.icon || "📌"}</div>
        <div class="why-item__title">${w.title}</div>
        <div class="why-item__desc">${w.description || ""}</div>
      </div>
    `).join("");
  }

  function renderProcess(data) {
    const list = data && data.process && data.process.list;
    if (!Array.isArray(list)) return;
    const grid = document.querySelector(".process__steps");
    if (!grid) return;
    grid.innerHTML = list.map(p => `
      <div class="process-step">
        <h3>${p.title}</h3>
        <p>${p.description || ""}</p>
      </div>
    `).join("");
  }

  function renderTestimonials(data) {
    const list = data && data.testimonials && data.testimonials.list;
    if (!Array.isArray(list) || !list.length) return;
    const el = document.querySelector(".hero__trusted");
    if (!el) return;
    const t = list[0];
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:#ffb800;font-size:20px;">★★★★★</span>
        <span style="font-size:15px;font-weight:600;color:#fff;">5 out of 5 based on Multiple client reviews</span>
      </div>
      <span style="color:#a1a1a8;font-size:13px;">|</span>
      <span style="font-size:13px;color:#a1a1a8;">${t.quote}</span>
      <span style="font-weight:600;color:#fff;font-size:13px;">— ${t.author}</span>
    `;
  }

  function renderBlog(data) {
    const list = data && data.blog && data.blog.list;
    if (!Array.isArray(list)) return;
    const grid = document.querySelector(".blog__grid");
    if (!grid) return;
    grid.innerHTML = list.map(b => `
      <article class="blog-card">
        <h3>${b.title}</h3>
        <p>${b.excerpt}</p>
        <a href="${b.link}" style="color:var(--color-accent);font-weight:600;font-size:14px;">Read article →</a>
      </article>
    `).join("");
  }

  function renderContact(data) {
    const c = data && data.contact;
    if (!c) return;
    const heading = document.querySelector("#contact-heading");
    if (heading) setText(heading, c.heading);
    const intro = document.querySelector("#contact-intro");
    if (intro) setText(intro, c.intro);

    const email = document.querySelector("#contact-email a");
    if (email) setAttr(email, "href", `mailto:${c.email}`, c.email);

    const phone = document.querySelector("#contact-phone a");
    if (phone) {
      setText(phone, c.phone_display || "");
      setAttr(phone, "href", `tel:${c.phone_tel}`, c.phone_tel);
    }

    const map = document.querySelector("#contact-map a");
    if (map) setAttr(map, "href", c.map, c.map);
  }

  function renderFooter(data) {
    const f = data && data.footer;
    if (!f) return;
    const brand = document.querySelector("#footer-brand");
    if (brand) setText(brand, f.brand);

    const services = document.querySelector("#footer-services");
    if (services) {
      services.innerHTML = f.services.map(s => `<a href="#services">${s.service}</a>`).join("");
    }

    const links = document.querySelector("#footer-links");
    if (links) {
      links.innerHTML = f.links.map(l => `<a href="${l.url}">${l.label}</a>`).join("");
    }

    const copy = document.querySelector("#footer-copy");
    if (copy) setText(copy, f.copyright);
  }

  async function init() {
    const data = await loadContent();
    if (!data) return;
    renderHero(data);
    renderServices(data);
    renderWhy(data);
    renderProcess(data);
    renderTestimonials(data);
    renderBlog(data);
    renderContact(data);
    renderFooter(data);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
