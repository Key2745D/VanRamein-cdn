(function(){

/* ================= BASIC ================= */

const NO_IMAGE='data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const CREDIT_TEXT="created by: www.vanramein.blog";

/* ================= CREDIT GUARD (GLOBAL) ================= */

function placeCredit(box){
  if(!box.nextElementSibling || !box.nextElementSibling.classList.contains("vr-credit")){
    const c=document.createElement("div");
    c.className="vr-credit";
    c.innerHTML='<a href="https://www.vanramein.blog" target="_blank" rel="nofollow">created by: www.vanramein.blog</a>';
    c.style.cssText="font-size:11px;text-align:right;margin-top:6px;opacity:.7";
    box.after(c);
  }
}

function disableSlider(box,reason){
  box.innerHTML="";
  console.warn("VanRamein Slider:",reason);
}

/* observer stabil blogger ajax */
const observer=new MutationObserver(()=>{
  document.querySelectorAll(".slideB").forEach(box=>{
    const credit=box.nextElementSibling;

    if(!credit || !credit.classList.contains("vr-credit")){
      disableSlider(box,"credit removed");
      return;
    }

    if(credit.textContent.trim().toLowerCase()!==CREDIT_TEXT){
      disableSlider(box,"credit edited");
    }
  });
});
observer.observe(document.documentElement,{childList:true,subtree:true});

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

  let index=1,timer;

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

  entries.forEach((e,i)=>{

    const title=e.title.$t;
    const link=e.link.find(l=>l.rel==="alternate").href;
    const img=e.media$thumbnail?e.media$thumbnail.url.replace("s72-c","s1600"):NO_IMAGE;
    const label=getLabel(e);

    html+=`
    <div class='item'>
      <a class='img' href='${link}' style='background-image:url(${img})'>
        <span class='category'><span class='button'>${label}</span></span>
      </a>
      <a class='cap' href='${link}'>${title}</a>
    </div>`;

    d+=`<span class='i' data-i='${i+1}'></span>`;
  });

  slider.innerHTML=html;
  dots.innerHTML=d;

  start();
}

/* ===== slide logic ===== */

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

  box.querySelectorAll(".category").forEach(el=>{
    el.onclick=e=>{
      e.preventDefault();
      location.href=blogUrl+"/search/label/"+encodeURIComponent(el.textContent.trim());
    };
  });
}

/* ===== jsonp ===== */

const cb="vrSlider"+Math.random().toString(36).slice(2);
window[cb]=render;

const s=document.createElement("script");
s.src=`${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${cb}`;
document.head.appendChild(s);

}

/* init semua slider di halaman */
function boot(){
  document.querySelectorAll(".slideB").forEach(initSliderBox);
}

if(document.readyState==="loading")
  document.addEventListener("DOMContentLoaded",boot);
else
  boot();

})();
