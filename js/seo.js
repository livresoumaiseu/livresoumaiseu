(function () {
  // ===== Configurações do site (ajuste conforme necessário) =====
  const site = {
    name: "Livre Sou",
    url: "https://livresou.com.br",     // sem barra no final
    author: "Gabriel Cossare Bragion",
    twitter: "@GabrielBragion",
    logo: "/imgs/logo.png",              // pode ser relativo
    defaultImage: "/imgs/default.png"    // fallback para og/twitter
  };

  // ===== Helpers =====
  const $ = (sel) => document.querySelector(sel);

  function absUrl(u) {
    if (!u) return "";
    try {
      // Garante URL absoluta a partir do baseURI da página
      return new URL(u, document.baseURI || window.location.href).href;
    } catch {
      return u;
    }
  }

  function normCanonical(u) {
    try {
      const url = new URL(u, document.baseURI || window.location.href);
      // Canonical sem fragmento e sem query string
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

  // ===== Coleta de dados da página =====
  const rawTitle = document.title && document.title.trim();
  const metaDesc = $('meta[name="description"]')?.getAttribute("content")?.trim();
  const metaDate = $('meta[name="date"]')?.getAttribute("content")?.trim();
  const metaOgImg = $('meta[property="og:image"]')?.getAttribute("content")?.trim();

  const page = {
    title: rawTitle || site.name,
    description: metaDesc || "Educação financeira para sua liberdade.",
    // URL atual:
    url: window.location.href,
    // Imagem preferencial: og:image > default
    image: absUrl(metaOgImg || site.defaultImage),
    // Data (se existir vira 'article'), caso contrário tratamos como 'website/webpage'
    date: metaDate || ""
  };

  const isArticle = Boolean(page.date);

  // ===== SEO básico =====
  setMeta("description", page.description);
  setMeta("author", site.author);
  // opcional: robots default
  if (!$('meta[name="robots"]')) setMeta("robots", "index,follow");

  // ===== Open Graph =====
  setMeta("og:type", isArticle ? "article" : "website", "property");
  setMeta("og:locale", "pt_BR", "property");
  setMeta("og:site_name", site.name, "property");
  setMeta("og:title", page.title, "property");
  setMeta("og:description", page.description, "property");
  setMeta("og:url", page.url, "property");
  setMeta("og:image", page.image, "property");

  // Se quiser (opcional): largura/altura da imagem
  // setMeta("og:image:width", "1200", "property");
  // setMeta("og:image:height", "630", "property");

  if (isArticle) {
    // Se houver uma meta de última modificação, usamos; senão, a published
    const lastMod = $('meta[name="lastmod"]')?.getAttribute("content")?.trim();
    setMeta("article:published_time", page.date, "property");
    if (lastMod) setMeta("article:modified_time", lastMod, "property");
  }

  // ===== Twitter Cards =====
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", page.title);
  setMeta("twitter:description", page.description);
  setMeta("twitter:image", page.image);
  setMeta("twitter:site", site.twitter);
  setMeta("twitter:creator", site.twitter);

  // ===== Canonical =====
  const canonicalHref = normCanonical(page.url);
  setOrCreateLink("canonical", canonicalHref);

  // ===== JSON-LD (Schema.org) =====
  // Remove antigo se existir para evitar duplicação
  const oldLd = document.getElementById("seo-jsonld");
  if (oldLd) oldLd.remove();

  let ld;
  if (isArticle) {
    ld = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": canonicalHref,
      "headline": page.title,
      "author": { "@type": "Person", "name": site.author },
      "publisher": {
        "@type": "Organization",
        "name": site.name,
        "logo": { "@type": "ImageObject", "url": absUrl(site.logo) }
      },
      "datePublished": page.date,
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
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
})();
