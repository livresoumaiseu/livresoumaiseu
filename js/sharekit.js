function initShareKit(scope) {
  scope = scope || document;

  const rawUrl   = window.location.href;
  const rawTitle = document.title || 'Veja isto';
  const pageUrl  = encodeURIComponent(rawUrl);
  const pageTitle= encodeURIComponent(rawTitle);

  const q = (sel) => scope.querySelector(sel);

  // Seleciona botões
  const el = {
    email:    q('[data-sk="email"]'),
    whatsapp: q('[data-sk="whatsapp"]'),
    facebook: q('[data-sk="facebook"]'),
    twitter:  q('[data-sk="twitter"]'),
    linkedin: q('[data-sk="linkedin"]'),
    copy:     q('[data-sk="copy"]'),
    native:   q('[data-sk="native"]')
  };

  // Define hrefs
  if (el.email)    el.email.href    = `mailto:?subject=${pageTitle}&body=${pageTitle}%0A${pageUrl}`;
  if (el.whatsapp) el.whatsapp.href = `https://wa.me/?text=${pageTitle}%20-%20${pageUrl}`;
  if (el.facebook) el.facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
  if (el.twitter)  el.twitter.href  = `https://twitter.com/intent/tweet?text=${pageTitle}&url=${pageUrl}`;
  if (el.linkedin) el.linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;

  // Copiar link
  if (el.copy) {
    el.copy.addEventListener('click', function(e){
      e.preventDefault();
      const btn = this;
      const done = () => {
        btn.textContent = '✅ Copiado!';
        setTimeout(() => btn.textContent = '📋 Copiar link', 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(rawUrl).then(done);
      } else {
        const ta = document.createElement('textarea');
        ta.value = rawUrl;
        document.body.appendChild(ta);
        ta.select(); try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

  // Web Share API
  if (el.native && navigator.share) {
    el.native.hidden = false;
    el.native.addEventListener('click', function(e){
      e.preventDefault();
      navigator.share({ title: rawTitle, text: rawTitle, url: rawUrl });
    });
  }
}
