async function includePartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(file);
    const html = await res.text();
    el.innerHTML = html;
    el.dispatchEvent(new CustomEvent("partialLoaded"));
  } catch (e) {
    console.error(`Error loading ${file}`, e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  includePartial("include-header", "./assets/partials/header.html");
  includePartial("include-footer", "./assets/partials/footer.html");

  let loaded = { header: false, footer: false };

  document
    .getElementById("include-header")
    .addEventListener("partialLoaded", () => {
      loaded.header = true;
      checkAllLoaded();
    });

  document
    .getElementById("include-footer")
    .addEventListener("partialLoaded", () => {
      loaded.footer = true;
      checkAllLoaded();
    });

  function checkAllLoaded() {
    if (loaded.header && loaded.footer) {
      const scripts = ["./assets/js/site-config.js", "./assets/js/script.js"];
      let loadedCount = 0;
      scripts.forEach(src => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => {
          loadedCount++;
          if (loadedCount === scripts.length && typeof setupGoTopButton === 'function') {
            setupGoTopButton();
          }
        };
        document.body.appendChild(s);
      });
    }
  }
});
