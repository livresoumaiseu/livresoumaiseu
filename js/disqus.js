function initDisqus(containerId, identifier = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Cria a div necessária para o Disqus
  const disqusDiv = document.createElement("div");
  disqusDiv.id = "disqus_thread";
  container.appendChild(disqusDiv);

  // Configurações dinâmicas do Disqus
  window.disqus_config = function () {
    this.page.url = window.location.href; // URL atual
    this.page.identifier = identifier || document.title; // ID único
  };

  // Evita carregar o script mais de uma vez
  if (window.DISQUS) {
    window.DISQUS.reset({
      reload: true,
      config: function () {
        this.page.url = window.location.href;
        this.page.identifier = identifier || document.title;
      }
    });
  } else {
    // Carrega o script do Disqus
    const d = document, s = d.createElement("script");
    s.src = "https://livresou-com-br.disqus.com/embed.js";
    s.setAttribute("data-timestamp", +new Date());
    (d.head || d.body).appendChild(s);
  }
}
