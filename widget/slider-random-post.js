(function() {
  /* ================= KONFIGURASI DASAR ================= */
  const NO_IMAGE = 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const CREDIT_TEXT = "created by: www.vanramein.blog";

  /* ================= FUNGSI VALIDASI CREDIT ================= */
  function disableSlider(box, reason) {
    if (!box || box.dataset.vrDisabled) return;
    box.dataset.vrDisabled = "1";
    box.innerHTML = "";
    console.warn("Slider Disabled:", reason);
  }

  function placeCredit(box) {
    if (!box) return;
    if (!box.nextElementSibling || !box.nextElementSibling.classList.contains("vr-credit")) {
      const c = document.createElement("div");
      c.className = "vr-credit";
      c.innerHTML = `<a href="https://www.vanramein.blog" target="_blank" rel="nofollow">${CREDIT_TEXT}</a>`;
      c.style.cssText = "font-size:10px;text-align:right;margin-top:4px;opacity:.5;font-family:sans-serif;";
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
    if (credit.textContent.trim().toLowerCase() !== CREDIT_TEXT) {
      disableSlider(box, "credit edited");
    }
  }

  /* ================= CORE ENGINE ================= */
  function initSliderBox(box) {
    placeCredit(box);

    const cfg = JSON.parse(box.dataset.config || "{}");
    const blogUrl = cfg.blogUrl || location.origin;
    const max = cfg.numPosts || 5;
    const interval = cfg.interval || 5000;

    // Paksa container utama transparan
    box.style.cssText = "position:relative; overflow:hidden; border-radius:12px; background:transparent !important; box-shadow:none !important; border:none !important;";

    box.innerHTML = `
      <div class='slider' style="width:100%; display:block; background:transparent !important;"></div>
      <button class='prev' style="position:absolute; left:15px; top:50%; transform:translateY(-50%); z-index:10; border-radius:50%; width:38px; height:38px; border:none; background:rgba(255,255,255,0.8); cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.1); font-size:18px;">&#10094;</button>
      <button class='next' style="position:absolute; right:15px; top:50%; transform:translateY(-50%); z-index:10; border-radius:50%; width:38px; height:38px; border:none; background:rgba(255,255,255,0.8); cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.1); font-size:18px;">&#10095;</button>
      <div class='slideI' style="width:100% !important; display:flex !important; justify-content:center !important; align-items:center !important; background:transparent !important; padding:15px 0 !important; border:none !important; box-shadow:none !important; margin:0 !important; min-height:10px !important;"></div>
    `;

    let index = 1, timer;

    function render(json) {
      const entries = json.feed.entry || [];
      const slider = box.querySelector(".slider");
      const dotsContainer = box.querySelector(".slideI");
      let html = "", d = "";
      const ratio = window.innerWidth <= 480 ? "75%" : "45%";

      entries.forEach((e, i) => {
        const title = e.title.$t;
        const link = e.link.find(l => l.rel === "alternate").href;
        const img = e.media$thumbnail ? e.media$thumbnail.url.replace("s72-c", "s1600") : NO_IMAGE;
        const label = e.category ? e.category[0].term : "Blogger";

        html += `
        <div class='item' style="display:none; position:relative; width:100%; background:transparent !important;">
          <div class='category' style="position:absolute; top:20px; right:20px; z-index:5;">
            <a href='${blogUrl}/search/label/${encodeURIComponent(label)}' style="background:#fff; color:#333; padding:5px 15px; border-radius:20px; font-size:12px; font-weight:bold; text-decoration:none; box-shadow:0 4px 10px rgba(0,0,0,0.15); display:inline-block; font-family:sans-serif;">${label}</a>
          </div>
          <div class='img' style="background-image:url('${img}'); padding-top:${ratio}; background-size:cover; background-position:center; width:100%; border-radius:12px;"></div>
          <a class='cap' href='${link}' style="position:absolute; left:0; bottom:0; right:0; padding:50px 25px 25px; background:linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); color:#fff; text-decoration:none; font-size:1.2em; font-weight:600; font-family:sans-serif; border-radius: 0 0 12px 12px;">${title}</a>
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
          dot.style.cssText = "width:7px !important; height:7px !important; border-radius:50% !important; background:rgba(0,0,0,0.2) !important; display:inline-block !important; margin:0 5px !important; cursor:pointer !important; transition:all .3s ease !important; border:none !important; box-shadow:none !important;";
        });

        if (slides[index - 1]) {
          slides[index - 1].style.display = "block";
          dots[index - 1].style.width = "24px";
          dots[index - 1].style.borderRadius = "10px";
          dots[index - 1].style.background = "#f89000"; // Orange Lonjong
        }
      };

      const start = () => {
        show(index);
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
