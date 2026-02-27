aku sudah membckupnya yang suda jadi yang belum merubha atau memnggati dots nya
(function(){

/* ================= BASIC ================= */

const NO_IMAGE='data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const CREDIT_TEXT="created by: www.vanramein.blog";

/* ================= CORE FUNCTIONS ================= */

function disableSlider(box,reason){
  if(!box || box.dataset.vrDisabled) return;
  box.dataset.vrDisabled="1";
  box.innerHTML="";
  console.warn("VanRamein Slider:",reason);
}

function placeCredit(box){
  if(!box) return;
  if(!box.nextElementSibling || !box.nextElementSibling.classList.contains("vr-credit")){
    const c=document.createElement("div");
    c.className="vr-credit";
    c.innerHTML='<a href="https://www.vanramein.blog" target="_blank" rel="nofollow">created by: www.vanramein.blog</a>';
    c.style.cssText="font-size:11px;text-align:right;margin-top:6px;opacity:.7";
    box.after(c);
  }
}

function validateCredit(box){
  if(!box || box.dataset.vrDisabled) return;

  const credit=box.nextElementSibling;

  if(!credit || !credit.classList.contains("vr-credit")){
    setTimeout(()=>{
      const recheck=box.nextElementSibling;
      if(!recheck || !recheck.classList.contains("vr-credit")){
        disableSlider(box,"credit removed");
      }
    },800);
    return;
  }

  if(credit.textContent.trim().toLowerCase()!==CREDIT_TEXT){
    disableSlider(box,"credit edited");
  }
}

/* observer */
const observer=new MutationObserver(()=>{
  document.querySelectorAll(".slideB").forEach(validateCredit);
});
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

/* paksa slider bukan konten artikel */
const sliderRoot = box.querySelector('.slider');
sliderRoot.style.width="100%";
sliderRoot.style.maxWidth="100%";
sliderRoot.style.margin="0";
sliderRoot.style.padding="0";
sliderRoot.style.display="block";
sliderRoot.style.boxSizing="border-box";

  let index=1,timer;

/* ===== RESPONSIVE RATIO ===== */
function getRatio(){
  const w=window.innerWidth;
  if(w<=480) return "70%";
  if(w<=768) return "60%";
  const r=getComputedStyle(document.documentElement).getPropertyValue('--sliderRatio');
  return r && r.trim()!=="" ? r : "45%";
}

/* ===== label ===== */
function getLabel(e){
  return e.category?e.category[0].term:"Update";
}

/* ===== render ===== */
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
    <div class='item' style="width:100%;margin:0;padding:0;">
      <div class='img'
           style="
             background-image:url('${img}');
             position:relative;
             display:block;
             width:100%;
             padding-top:${ratio};
             background-position:center;
             background-size:cover;
             background-repeat:no-repeat;
             border-radius:var(--sliderBd-radius);
           ">
        <div class='category'>
          <a class='button' href='${blogUrl}/search/label/${encodeURIComponent(label)}'>${label}</a>
        </div>
        <a class='cap' href='${link}'>${title}</a>
      </div>
    </div>`;

    d+=`<span class='i' data-i='${i+1}'></span>`;
  });

  slider.innerHTML=html;
  dots.innerHTML=d;

  start();
}

/* ===== slider ===== */

function show(n){
  const slides=box.querySelectorAll(".item");
  const dots=box.querySelectorAll(".i");

  if(n>slides.length) index=1;
  if(n<1) index=slides.length;

  slides.forEach(s=>s.style.display="none");
  dots.forEach(x=>x.classList.remove("active"));

  if(slides[index-1]){
    slides[index-1].style.display="block";
    dots[index-1].classList.add("active");
  }
}

function next(n){ show(index+=n); }

function start(){

  show(index);
  timer=setInterval(()=>next(1),interval);

  box.querySelector(".prev").onclick=()=>next(-1);
  box.querySelector(".next").onclick=()=>next(1);

  box.querySelectorAll(".i").forEach(dot=>{
    dot.onclick=()=>show(index=parseInt(dot.dataset.i));
  });

/* ===== FIX BAR ABU INDICATOR ===== */
const indicator = box.querySelector('.slideI');
indicator.style.width="auto";
indicator.style.display="flex";
indicator.style.justifyContent="center";
indicator.style.alignItems="center";
indicator.style.background="transparent";
indicator.style.padding="10px 0";
indicator.style.margin="0";
indicator.style.boxShadow="none";
indicator.style.borderRadius="0";

}

/* ===== jsonp ===== */

const cb="vrSlider"+Math.random().toString(36).slice(2);
window[cb]=render;

const s=document.createElement("script");
s.src=`${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${cb}`;
document.head.appendChild(s);

}

/* boot */
function boot(){
  document.querySelectorAll(".slideB").forEach(initSliderBox);
}

if(document.readyState==="loading")
  document.addEventListener("DOMContentLoaded",boot);
else
  boot();

})();
