(function(){

/* ================= BASIC ================= */
const NO_IMAGE='data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const CREDIT_TEXT="created by: www.vanramein.blog";

/* ================= CORE FUNCTIONS ================= */
// ... (fungsi disableSlider, placeCredit, validateCredit tetap sama) ...
function disableSlider(box,reason){if(!box||box.dataset.vrDisabled)return;box.dataset.vrDisabled="1";box.innerHTML="";console.warn("VanRamein Slider:",reason)}
function placeCredit(box){if(!box)return;if(!box.nextElementSibling||!box.nextElementSibling.classList.contains("vr-credit")){const c=document.createElement("div");c.className="vr-credit";c.innerHTML='<a href="https://www.vanramein.blog" target="_blank" rel="nofollow">created by: www.vanramein.blog</a>';c.style.cssText="font-size:11px;text-align:right;margin-top:6px;opacity:.7";box.after(c)}}
function validateCredit(box){if(!box||box.dataset.vrDisabled)return;const credit=box.nextElementSibling;if(!credit||!credit.classList.contains("vr-credit")){setTimeout(()=>{const recheck=box.nextElementSibling;if(!recheck||!recheck.classList.contains("vr-credit")){disableSlider(box,"credit removed")}},800);return}if(credit.textContent.trim().toLowerCase()!==CREDIT_TEXT){disableSlider(box,"credit edited")}}
const observer=new MutationObserver(()=>{document.querySelectorAll(".slideB").forEach(validateCredit)});
observer.observe(document.body,{childList:true,subtree:true});

/* ================= MAIN ================= */
function initSliderBox(box){
  placeCredit(box);

  const cfg=JSON.parse(box.dataset.config||"{}");
  const blogUrl=cfg.blogUrl||location.origin;
  const max=cfg.numPosts||5;
  const interval=cfg.interval||5000;

  box.innerHTML=`
    <div class='slider'></div>
    <button class='prev'>&#10094;</button>
    <button class='next'>&#10095;</button>
    <div class='slideI'></div>
  `;

  const sliderRoot = box.querySelector('.slider');
  sliderRoot.style.cssText="width:100%;max-width:100%;margin:0;padding:0;display:block;box-sizing:border-box;";

  let index=1,timer;

  function getRatio(){
    const w=window.innerWidth;
    if(w<=480) return "75%";
    if(w<=768) return "60%";
    const r=getComputedStyle(document.documentElement).getPropertyValue('--sliderRatio');
    return r && r.trim()!=="" ? r : "45%";
  }

  function getLabel(e){ return e.category?e.category[0].term:"Update"; }

  function render(json){
    const entries=json.feed.entry||[];
    const slider=box.querySelector(".slider");
    const dots=box.querySelector(".slideI");
    let html="",d="";
    const ratio=getRatio();

    entries.forEach((e,i)=>{
      const title=e.title.$t;
      const link=e.link.find(l=>l.rel==="alternate").href;
      const img=e.media$thumbnail?e.media$thumbnail.url.replace("s72-c","s1600"):NO_IMAGE;
      const label=getLabel(e);

      html+=`
      <div class='item' style="width:100%;display:none;">
        <div class='img' style="background-image:url('${img}');position:relative;display:block;width:100%;padding-top:${ratio};background-position:center;background-size:cover;background-repeat:no-repeat;border-radius:var(--sliderBd-radius);">
          <div class='category'><a class='button' href='${blogUrl}/search/label/${encodeURIComponent(label)}'>${label}</a></div>
          <a class='cap' href='${link}'>${title}</a>
        </div>
      </div>`;
      d+=`<span class='i' data-i='${i+1}'></span>`;
    });

    slider.innerHTML=html;
    dots.innerHTML=d;
    start();
  }

  function show(n){
    const slides=box.querySelectorAll(".item");
    const dots=box.querySelectorAll(".i");

    if(n>slides.length) index=1;
    if(n<1) index=slides.length;

    slides.forEach(s=>s.style.display="none");
    
    /* ===== FIX DOTS ANIMATION ===== */
    dots.forEach(dot => {
      dot.classList.remove("active");
      dot.style.cssText = "width:8px; height:8px; border-radius:50%; background:rgba(0,0,0,0.15); display:inline-block; margin:0 3px; cursor:pointer; transition:all .3s ease;";
    });

    if(slides[index-1]){
      slides[index-1].style.display="block";
      dots[index-1].classList.add("active");
      // Paksa style active menjadi orange lonjong
      dots[index-1].style.width = "22px";
      dots[index-1].style.borderRadius = "10px";
      dots[index-1].style.background = "var(--indicator, #f89000)";
    }
  }

  function next(n){ show(index+=n); }

  function start(){
    show(index);
    timer=setInterval(()=>next(1),interval);
    box.querySelector(".prev").onclick=()=>next(-1);
    box.querySelector(".next").onclick=()=>next(1);
    box.querySelectorAll(".i").forEach(dot=>{
      dot.onclick=()=> {
        clearInterval(timer);
        show(index=parseInt(dot.dataset.i));
        timer=setInterval(()=>next(1),interval);
      };
    });

    /* ===== FIX CONTAINER INDICATOR ===== */
    const indicator = box.querySelector('.slideI');
    indicator.style.cssText="width:100%; display:flex; justify-content:center; align-items:center; background:transparent; padding:15px 0; margin:0; box-shadow:none; border:none;";
  }

  const cb="vrSlider"+Math.random().toString(36).slice(2);
  window[cb]=render;
  const s=document.createElement("script");
  s.src=`${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${cb}`;
  document.head.appendChild(s);
}

function boot(){ document.querySelectorAll(".slideB").forEach(initSliderBox); }
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
