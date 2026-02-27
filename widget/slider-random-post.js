(function() {
  /* ================= CONFIG & CONSTANTS ================= */
  const NO_IMAGE = 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const CREDIT_TEXT = "created by: www.vanramein.blog";

  /* ================= UTILITY FUNCTIONS ================= */
  function disableSlider(box, reason) {
    if (!box || box.dataset.vrDisabled) return;
    box.dataset.vrDisabled = "1";
    box.innerHTML = "";
    console.warn("VanRamein Slider Disabled:", reason);
  }

  function placeCredit(box) {
    if (!box) return;
    if (!box.nextElementSibling || !box.nextElementSibling.classList.contains("vr-credit")) {
      const c = document.createElement("div");
      c.className = "vr-credit";
      c.innerHTML = '<a href="https://www.vanramein.blog" target="_blank" rel="nofollow">created by: www.vanramein.blog</a>';
      c.style.cssText = "font-size:11px;text-align:right;margin-top:6px;opacity:.7;font-family:sans-serif;";
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

  /* ================= CORE SLIDER ENGINE ================= */
  function initSliderBox(box) {
    placeCredit(box);

    const cfg = JSON.parse(box.dataset.config || "{}");
    const blogUrl = cfg.blogUrl || location.origin;
    const max = cfg.numPosts || 5;
    const interval = cfg.interval || 5000;

    // Reset Box Style
    box.style.position = "relative";
    box.style.overflow = "hidden";

    box.innerHTML = `
      <div class='slider' style="width:100%; display:block;"></div>
      <button class='prev' style="position:absolute; left:10px; top:50%; transform:translateY(-50%); z-index:10; border-radius:50%; width:35px; height:35px; border:none; background:rgba(255,255,255,0.7); cursor:pointer; display:flex; align-items:center; justify-content:center;">&#10094;</button>
      <button class='next' style="position:absolute; right:10px; top:50%; transform:translateY(-50%); z-index:10; border-radius:50%; width:35px; height:35px; border:none; background:rgba(255,255,255,0.7); cursor:pointer; display:flex; align-items:center; justify-content:center;">&#10095;</button>
      <div class='slideI' style="width:100%; display:flex; justify-content:center; align-items:center; background:transparent; padding:15px 0; border:none; box-shadow:none;"></div>
    `;

    let index = 1, timer;

    function getRatio() {
      const w = window.innerWidth;
      if (w <= 480) return "75%";
      return "45%";
    }

    function render(json) {
      const entries = json.feed.entry || [];
      const slider = box.querySelector(".slider");
      const dotsContainer = box.querySelector(".slideI");
      let html = "", d = "";
      const ratio = getRatio();

      entries.forEach((e, i) => {
        const title = e.title.$t;
        const link = e.link.find(l => l.rel === "alternate").href;
        const img = e.media$thumbnail ? e.media$thumbnail.url.replace("s72-c", "s1600") : NO_IMAGE;
        const label = e.category ? e.category[0].term : "Blogger";

        html += `
        <div class='item' style="display:none; position:relative; width:100%;">
          <div class='category' style="position:absolute; top:15px; right:15px; z-index:5;">
            <a class='button' href='#' style="background:#fff; color:#333; padding:4px 12px; border-radius:15px; font-size:12px; font-weight:bold; text-decoration:none; box-shadow:0 4px 10px rgba(0,0,0,0.1); display:inline-block;">${label}</a>
          </div>
          <div class='img' style="background-image:url('${img}'); padding-top:${ratio}; background-size:cover; background-position:center; width:100%; border-radius:var(--sliderBd-radius, 12px);"></div>
          <a class='cap' href='${link}' style="position:absolute; left:0; bottom:0; right:0; padding:40px 20px 20px; background:linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); color:#fff; text-decoration:none; font-size:1.1em; font-weight:600; border-radius: 0 0 var(--sliderBd-radius, 12px) var(--sliderBd-radius, 12px);">${title}</a>
        </div>`;
        d += `<span class='i' data-i='${i + 1}'></span>`;
      });

      slider.innerHTML = html;
      dotsContainer.innerHTML = d;
      start();
    }

    function show(n) {
      const slides = box.querySelectorAll(".item");
      const dots = box.querySelectorAll(".i");
      if (n > slides.length) index = 1;
      if (n < 1) index = slides.length;

      slides.forEach(s => s.style.display = "none");
      dots.forEach(dot => {
        dot.style.cssText = "width:8px; height:8px; border-radius:50%; background:rgba(0,0,0,0.15); display:inline-block; margin:0 4px; cursor:pointer; transition:all .3s ease;";
      });

      if (slides[index - 1]) {
        slides[index - 1].style.display = "block";
        dots[index - 1].style.width = "22px";
        dots[index - 1].style.borderRadius = "10px";
        dots[index - 1].style.background = "var(--indicator, #f89000)";
      }
    }

    function start() {
      show(index);
      timer = setInterval(() => show(index += 1), interval);

      box.querySelector(".prev").onclick = () => { clearInterval(timer); show(index -= 1); timer = setInterval(() => show(index += 1), interval); };
      box.querySelector(".next").onclick = () => { clearInterval(timer); show(index += 1); timer = setInterval(() => show(index += 1), interval); };

      box.querySelectorAll(".i").forEach(dot => {
        dot.onclick = () => {
          clearInterval(timer);
          show(index = parseInt(dot.dataset.i));
          timer = setInterval(() => show(index += 1), interval);
        };
      });
    }

    // JSONP Call
    const cb = "vrSlider" + Math.random().toString(36).slice(2);
    window[cb] = render;
    const s = document.createElement("script");
    s.src = `${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${cb}`;
    document.head.appendChild(s);
  }

  /* ================= BOOTSTRAP ================= */
  function boot() {
    const targets = document.querySelectorAll(".slideB");
    targets.forEach(initSliderBox);
    
    // Observer untuk validasi credit secara realtime
    const observer = new MutationObserver(() => {
      targets.forEach(validateCredit);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

})();
