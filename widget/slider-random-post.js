(function() {
  /* ================= KONFIGURASI DASAR ================= */
  const NO_IMAGE = 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const CREDIT_TEXT = "created by: www.vanramein.blog";

  /* ================= FUNGSI VALIDASI CREDIT (HIDDEN) ================= */
  function disableSlider(box, reason) {
    if (!box || box.dataset.vrDisabled) return;
    box.dataset.vrDisabled = "1";
    box.innerHTML = "";
  }

  function placeCredit(box) {
    if (!box) return;
    if (!box.nextElementSibling || !box.nextElementSibling.classList.contains("vr-credit")) {
      const c = document.createElement("div");
      c.className = "vr-credit";
      c.innerHTML = `<a href="https://www.vanramein.blog" target="_blank" rel="nofollow">${CREDIT_TEXT}</a>`;
      c.style.cssText = "font-size:0px; height:0px; opacity:0; pointer-events:none; visibility:hidden; display:block;";
      box.after(c);
    }
  }

  function validateCredit(box) {
    if (!box || box.dataset.vrDisabled) return;
    const credit = box.nextElementSibling;
    if (!credit || !credit.classList.contains("vr-credit")) {
      setTimeout(() => {
        const recheck = box.nextElementSibling;
        if (!recheck || !recheck.classList.contains("vr-credit")) disableSlider(box, "credit removed");
      }, 800);
      return;
    }
    if (credit.textContent.trim().toLowerCase() !== CREDIT_TEXT) disableSlider(box, "credit edited");
  }

  /* ================= CORE ENGINE ================= */
  function initSliderBox(box) {
    placeCredit(box);

    const cfg = JSON.parse(box.dataset.config || "{}");
    const blogUrl = cfg.blogUrl || location.origin;
    const max = cfg.numPosts || 5;
    const interval = cfg.interval || 5000;

    box.style.cssText = "position:relative; overflow:hidden; border-radius:12px; background:transparent !important;";

    box.innerHTML = `
      <div class='slider' style="width:100%; display:block; background:transparent !important;"></div>
      <button class='prev' style="position:absolute; left:12px; top:50%; transform:translateY(-50%); z-index:10; border-radius:50%; width:32px; height:32px; border:none; background:rgba(255,255,255,0.8); cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.1); font-size:14px;">&#10094;</button>
      <button class='next' style="position:absolute; right:12px; top:50%; transform:translateY(-50%); z-index:10; border-radius:50%; width:32px; height:32px; border:none; background:rgba(255,255,255,0.8); cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.1); font-size:14px;">&#10095;</button>
      <div class='slideI' style="width:100% !important; display:flex !important; justify-content:center !important; align-items:center !important; background:transparent !important; padding:10px 0 !important; border:none !important; box-shadow:none !important; margin:0 !important; min-height:8px !important;"></div>
    `;

    let index = 1, timer;

    function render(json) {
      const entries = json.feed.entry || [];
      const slider = box.querySelector(".slider");
      const dotsContainer = box.querySelector(".slideI");
      let html = "", d = "";
      
      const isMobile = window.innerWidth <= 480;
      const ratio = isMobile ? "75%" : "45%";
      const titleSize = isMobile ? "0.95em" : "1.15em"; // Judul lebih kecil di mobile

      entries.forEach((e, i) => {
        const title = e.title.$t;
        const link = e.link.find(l => l.rel === "alternate").href;
        const img = e.media$thumbnail ? e.media$thumbnail.url.replace("s72-c", "s1600") : NO_IMAGE;
        const label = e.category ? e.category[0].term : "Update";

        html += `
        <div class='item' style="display:none; position:relative; width:100%;">
          <div class='category' style="position:absolute; top:15px; right:15px; z-index:5;">
            <a href='${blogUrl}/search/label/${encodeURIComponent(label)}' style="background:#fff; color:#333; padding:4px 10px; border-radius:15px; font-size:11px; font-weight:bold; text-decoration:none; box-shadow:0 3px 8px rgba(0,0,0,0.1); display:inline-block; font-family:sans-serif;">${label}</a>
          </div>
          <div class='img' style="background-image:url('${img}'); padding-top:${ratio}; background-size:cover; background-position:center; width:100%; border-radius:12px;"></div>
          <a class='cap' href='${link}' style="position:absolute; left:0; bottom:0; right:0; padding:40px 15px 15px; background:linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); color:#fff; text-decoration:none; font-size:${titleSize}; font-weight:600; font-family:sans-serif; border-radius: 0 0 12px 12px; line-height:1.4;">${title}</a>
        </div>`;
        d += `<span class='i' data-i='${i + 1}'></span>`;
      });

      slider.innerHTML = html;
      dotsContainer.innerHTML = d;
      
      const show = (n) => {
        const slides = box.querySelectorAll(".item");
        const dots = box.querySelectorAll(".i");
        if (n > slides.length) index = 1;
        if (n < 1) index = slides.length;

        slides.forEach(s => s.style.display = "none");
        dots.forEach(dot => {
          // Dots diperkecil lagi ke 5px
          dot.style.cssText = "width:2px !important; height:2px !important; border-radius:50% !important; background:rgba(0,0,0,0.15) !important; display:inline-block !important; margin:0 4px !important; cursor:pointer !important; transition:all .3s ease !important; border:none !important;";
        });

        if (slides[index - 1]) {
          slides[index - 1].style.display = "block";
          // Lebar dots aktif juga disesuaikan agar proporsional
          dots[index - 1].style.width = "16px";
          dots[index - 1].style.borderRadius = "5px";
          dots[index - 1].style.background = "#f89000"; 
        }
      };

      const start = () => {
        show(index);
        if(timer) clearInterval(timer);
        timer = setInterval(() => show(index += 1), interval);
        box.querySelector(".prev").onclick = () => { clearInterval(timer); show(index -= 1); timer = setInterval(() => show(index += 1), interval); };
        box.querySelector(".next").onclick = () => { clearInterval(timer); show(index += 1); timer = setInterval(() => show(index += 1), interval); };
        box.querySelectorAll(".i").forEach(dot => {
          dot.onclick = () => { clearInterval(timer); show(index = parseInt(dot.dataset.i)); timer = setInterval(() => show(index += 1), interval); };
        });
      };
      start();
    }

    const cb = "vrSlider" + Math.random().toString(36).slice(2);
    window[cb] = render;
    const s = document.createElement("script");
    s.src = `${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${cb}`;
    document.head.appendChild(s);
  }

  function boot() {
    const targets = document.querySelectorAll(".slideB");
    targets.forEach(initSliderBox);
    const observer = new MutationObserver(() => { targets.forEach(validateCredit); });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
