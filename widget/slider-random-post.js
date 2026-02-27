(function(){

/* ================= BASIC ================= */

const NO_IMAGE='data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const CREDIT_TEXT="created by: www.vanramein.blog";

/* ================= CREDIT ================= */

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

  const sliderRoot = box.querySelector('.slider');
  sliderRoot.style.position="relative";
  sliderRoot.style.width="100%";
  sliderRoot.style.margin="0";

/* ===== render ===== */

function render(json){

  const entries=json.feed.entry||[];
  const slider=box.querySelector(".slider");
  const dots=box.querySelector(".slideI");

  let html="",d="";

  entries.forEach((e,i)=>{

    const title=e.title.$t;
    const link=e.link.find(l=>l.rel==="alternate").href;
    const img=e.media$thumbnail?e.media$thumbnail.url.replace("s72-c","s1600"):NO_IMAGE;
    const label=e.category?e.category[0].term:"Update";

    html+=`
    <div class='item' style="position:absolute;inset:0;opacity:0;">
      <div class='img'
           style="
             background-image:url('${img}');
             width:100%;
             aspect-ratio:16/9;
             background-position:center;
             background-size:cover;
             background-repeat:no-repeat;
             border-radius:var(--sliderBd-radius);
             overflow:hidden;
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

  slider.querySelectorAll(".item").forEach(el=>{
    el.style.transition="opacity .5s ease";
  });

  start();
}

/* ===== slider ===== */

let index=1,timer;

function show(n){
  const slides=box.querySelectorAll(".item");
  const dots=box.querySelectorAll(".i");

  if(!slides.length) return;

  if(n>slides.length) index=1;
  if(n<1) index=slides.length;

  slides.forEach(s=>{
    s.style.opacity="0";
    s.style.pointerEvents="none";
  });

  dots.forEach(x=>x.classList.remove("active"));

  slides[index-1].style.opacity="1";
  slides[index-1].style.pointerEvents="auto";
  dots[index-1].classList.add("active");
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
