(function() {
  const NO_IMAGE = 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const CREDIT_TEXT = "created by: www.vanramein.blog";

  function disableSlider(box) { if(!box)return; box.innerHTML=""; box.dataset.vrDisabled="1"; }

  function placeCredit(box) {
    if (!box || (box.nextElementSibling && box.nextElementSibling.classList.contains("vr-credit"))) return;
    const c = document.createElement("div");
    c.className = "vr-credit";
    c.innerHTML = `<a href="https://www.vanramein.blog" target="_blank" rel="nofollow">${CREDIT_TEXT}</a>`;
    c.style.cssText = "font-size:0px; height:0px; opacity:0; visibility:hidden; display:block;";
    box.after(c);
  }

  function validateCredit(box) {
    const credit = box.nextElementSibling;
    if (!credit || !credit.classList.contains("vr-credit") || credit.textContent.trim().toLowerCase() !== CREDIT_TEXT) {
      disableSlider(box);
    }
  }

  function initSliderBox(box) {
    placeCredit(box);
    const cfg = JSON.parse(box.dataset.config || "{}");
    const blogUrl = cfg.blogUrl || location.origin;
    const max = cfg.numPosts || 5;
    const interval = cfg.interval || 5000;

    box.style.cssText = "position:relative; overflow:hidden; border-radius:12px; background:transparent !important;";

    const metaCb = "vrMeta" + Math.random().toString(36).slice(2);
    window[metaCb] = function(json) {
      const total = parseInt(json.feed.openSearch$totalResults.$t);
      const start = Math.floor(Math.random() * Math.max(1, total - max)) + 1;
      fetchPosts(start);
    };

    const sMeta = document.createElement("script");
    sMeta.src = `${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=0&callback=${metaCb}`;
    document.head.appendChild(sMeta);

    function fetchPosts(start) {
      const mainCb = "vrMain" + Math.random().toString(36).slice(2);
      window[mainCb] = render;
      const sMain = document.createElement("script");
      sMain.src = `${blogUrl}/feeds/posts/default?alt=json-in-script&start-index=${start}&max-results=${max}&callback=${mainCb}`;
      document.head.appendChild(sMain);
    }

    function render(json) {
      const entries = json.feed.entry || [];
      const isMobile = window.innerWidth <= 480;
      
      // KUNCI RASIO: Tetap persegi panjang (55%) di semua perangkat
      const ratio = "55%"; 
      const titleSize = isMobile ? "0.9rem" : "1.1rem";

      let html = `<div class='slider' style='width:100%;'>`, dots = "";

      entries.forEach((e, i) => {
        const title = e.title.$t;
        const link = e.link.find(l => l.rel === "alternate").href;
        const img = e.media$thumbnail ? e.media$thumbnail.url.replace("s72-c", "s1600") : NO_IMAGE;
        const label = e.category ? e.category[0].term : "Update";

        html += `
        <div class='item' style='display:none; position:relative;'>
          <div style='position:absolute; top:12px; right:12px; z-index:5;'>
            <span style='background:#fff; color:#333; padding:3px 8px; border-radius:10px; font-size:10px; font-weight:700; box-shadow:0 2px 6px rgba(0,0,0,0.15); font-family:sans-serif;'>${label}</span>
          </div>
          <div style="background:url('${img}') center/cover no-repeat; width:100%; padding-top:${ratio}; border-radius:12px;"></div>
          <a href='${link}' style='position:absolute; bottom:0; left:0; right:0; padding:35px 12px 12px; background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%); color:#fff; text-decoration:none; font-family:sans-serif; font-size:${titleSize}; font-weight:600; line-height:1.3; border-radius:0 0 12px 12px;'>${title}</a>
        </div>`;
        dots += `<span class='dot' data-i='${i+1}'></span>`;
      });

      box.innerHTML = html + `</div>
        <button class='p' style='position:absolute; left:8px; top:50%; transform:translateY(-50%); z-index:10; border:none; background:rgba(255,255,255,0.7); width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:10px;'>&#10094;</button>
        <button class='n' style='position:absolute; right:8px; top:50%; transform:translateY(-50%); z-index:10; border:none; background:rgba(255,255,255,0.7); width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:10px;'>&#10095;</button>
        <div class='slideI' style='display:flex; justify-content:center; align-items:center; padding:10px 0; background:transparent !important; border:none !important;'>${dots}</div>`;

      let idx = 1, timer;
      const slides = box.querySelectorAll(".item");
      const dts = box.querySelectorAll(".dot");

      const show = (n) => {
        if (n > slides.length) idx = 1; else if (n < 1) idx = slides.length; else idx = n;
        slides.forEach(s => s.style.display = "none");
        dts.forEach(d => d.style.cssText = "width:2px; height:2px; background:rgba(0,0,0,0.15); margin:0 3px; border-radius:50%; display:inline-block; transition:0.3s; cursor:pointer;");
        
        if(slides[idx-1]) {
          slides[idx-1].style.display = "block";
          dts[idx-1].style.width = "14px";
          dts[idx-1].style.borderRadius = "4px";
          dts[idx-1].style.background = "#f89000";
        }
      };

      const play = () => { if(timer) clearInterval(timer); timer = setInterval(() => show(idx + 1), interval); };
      const stop = () => clearInterval(timer);

      box.querySelector(".p").onclick = () => { stop(); show(idx - 1); play(); };
      box.querySelector(".n").onclick = () => { stop(); show(idx + 1); play(); };
      dts.forEach(d => d.onclick = () => { stop(); show(parseInt(d.dataset.i)); play(); });

      show(1); play();
    }
  }

  function boot() { 
    const b = document.querySelectorAll(".slideB"); 
    b.forEach(initSliderBox);
    new MutationObserver(() => b.forEach(validateCredit)).observe(document.body, {childList:true, subtree:true});
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
