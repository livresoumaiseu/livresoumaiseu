
(function () {
  // ===== Configurações globais do site =====
  const site = {
    name: "Livre Sou",
    url: "https://livresou.com.br",       // domínio base sem barra final
    author: "Gabriel Cossare Bragion",
    authorUrl: "https://bragioncorp.com/", // URL do autor
    twitter: "@livresoumaiseu",
    logo: "/imgs/logo.png",               // caminho do logo
    defaultImage: "/imgs/default.png",    // fallback se a página não tiver imagem
    fbAppId: "1299627698215476"            // <-- substitua pelo ID real do Facebook App
  };

  // ===== Helpers =====
  const $ = (sel) => document.querySelector(sel);

  function absUrl(u) {
    if (!u) return "";
    try {
      return new URL(u, document.baseURI || window.location.href).href;
    } catch {
      return u;
    }
  }

  function normCanonical(u) {
    try {
      const url = new URL(u, document.baseURI || window.location.href);
      return url.origin + url.pathname.replace(/\/+$/, "") || url.origin + "/";
    } catch {
      return u;
    }
  }

  function setMeta(name, content, attr = "name") {
    if (!content) return;
    let tag = document.querySelector(`meta[${attr}="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function setOrCreateLink(rel, href) {
    if (!href) return;
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
  }

  // Converte string de data simples para ISO 8601 com timezone
  function toISOWithTZ(input) {
    const d = new Date(input);
    if (isNaN(d)) return "";
    const tz = -d.getTimezoneOffset();
    const sign = tz >= 0 ? "+" : "-";
    const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");
    return (
      d.getFullYear() + "-" +
      pad(d.getMonth() + 1) + "-" +
      pad(d.getDate()) + "T" +
      pad(d.getHours()) + ":" +
      pad(d.getMinutes()) + ":" +
      pad(d.getSeconds()) +
      sign + pad(tz / 60) + ":" + pad(tz % 60)
    );
  }

  // ===== Coleta de dados da página =====
  const rawTitle   = document.title && document.title.trim();
  const metaDesc   = $('meta[name="description"]')?.getAttribute("content")?.trim();
  const metaDate   = $('meta[name="date"]')?.getAttribute("content")?.trim();
  const metaLast   = $('meta[name="lastmod"]')?.getAttribute("content")?.trim();
  const metaOgImg  = $('meta[property="og:image"]')?.getAttribute("content")?.trim();

  const page = {
    title: rawTitle || site.name,
    description: metaDesc || "Educação financeira para sua liberdade.",
    url: window.location.href,
    image: absUrl(metaOgImg || site.defaultImage),
    datePublished: metaDate ? toISOWithTZ(metaDate) : "",
    dateModified: metaLast ? toISOWithTZ(metaLast) : toISOWithTZ(new Date())
  };

  const canonicalHref = normCanonical(page.url);
  const isArticle = Boolean(page.datePublished);

  // ===== SEO básico =====
  setMeta("description", page.description);
  setMeta("author", site.author);
  if (!$('meta[name="robots"]')) setMeta("robots", "index,follow");

  // ===== Open Graph (obrigatórios e extras) =====
  setMeta("og:url", canonicalHref, "property");
  setMeta("og:type", isArticle ? "article" : "website", "property");
  setMeta("og:title", page.title, "property");
  setMeta("og:description", page.description, "property");
  setMeta("og:image", page.image, "property");
  setMeta("og:locale", "pt_BR", "property");
  setMeta("og:site_name", site.name, "property");

  // Facebook App ID (obrigatório para Graph API)
  setMeta("fb:app_id", site.fbAppId, "property");

  if (isArticle) {
    setMeta("article:published_time", page.datePublished, "property");
    setMeta("article:modified_time", page.dateModified, "property");
  }

  // ===== Twitter Cards =====
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", page.title);
  setMeta("twitter:description", page.description);
  setMeta("twitter:image", page.image);
  setMeta("twitter:site", site.twitter);
  setMeta("twitter:creator", site.twitter);

  // ===== Canonical =====
  setOrCreateLink("canonical", canonicalHref);

  // ===== JSON-LD (Schema.org) =====
  const oldLd = document.getElementById("seo-jsonld");
  if (oldLd) oldLd.remove();

  let ld;
  if (isArticle) {
    ld = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": canonicalHref,
      "headline": page.title,
      "author": { "@type": "Person", "name": site.author, "url": site.authorUrl },
      "publisher": {
        "@type": "Organization",
        "name": site.name,
        "logo": { "@type": "ImageObject", "url": absUrl(site.logo) }
      },
      "datePublished": page.datePublished,
      "dateModified": page.dateModified,
      "description": page.description,
      "image": page.image
    };
  } else {
    ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": page.title,
      "url": canonicalHref,
      "description": page.description
    };
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "seo-jsonld";
  script.textContent = JSON.stringify(ld, null, 2);
  document.head.appendChild(script);
})();
