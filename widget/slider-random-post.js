(function(){

/* ================= CONFIG DEFAULT ================= */
const NO_IMAGE = 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const SIGNATURE = "dmFucmFtZWlu"; // base64 vanramein

/* ================= CREDIT LOCK (STABLE) ================= */

function injectCredit(container){

  const credit = document.createElement("div");
  credit.className = "vr-credit";
  credit.innerHTML = `<a href="https://www.vanramein.blog" target="_blank" rel="nofollow">created by: www.vanramein.blog</a>`;
  credit.style.cssText="font-size:11px;text-align:right;margin-top:6px;opacity:.7";

  container.insertAdjacentElement("afterend",credit);

  // signature pada container (bukan child)
  container.dataset.vr = SIGNATURE;

  monitor(container);
}

function monitor(container){

  setInterval(()=>{

    if(!document.body.contains(container)){
      disable(container,"container removed");
      return;
    }

    if(container.dataset.vr !== SIGNATURE){
      disable(container,"signature removed");
      return;
    }

    const credit = container.nextElementSibling;
    if(!credit || !credit.classList.contains("vr-credit")){
      disable(container,"credit removed");
      return;
    }

  },2000);
}

function disable(container,reason){
  container.innerHTML="";
  console.warn("VanRamein Slider disabled:",reason);
}

/* ================= MAIN ================= */

document.querySelectorAll(".slideB").forEach(function(box){

  injectCredit(box);

  const cfg = JSON.parse(box.dataset.config || "{}");
  const blogUrl = cfg.blogUrl || location.origin;
  const max = cfg.numPosts || 5;
  const interval = cfg.interval || 5000;

  box.innerHTML = `
    <div class='slider'></div>
    <button class='prev'>&#10094;</button>
    <button class='next'>&#10095;</button>
    <div class='slideI'></div>
  `;

  let slideIndex = 1;
  let timer;

/* ---------- ambil label ---------- */
function getLabel(entry){
  if(!entry.category) return "Update";
  return entry.category[0].term;
}

/* ---------- render ---------- */
function render(json){

  const entries = json.feed.entry || [];
  const slider = box.querySelector(".slider");
  const dots = box.querySelector(".slideI");

  let html="",d="";

  entries.forEach((e,i)=>{

    let title = e.title.$t;
    let link = e.link.find(l=>l.rel==="alternate").href;
    let thumb = e.media$thumbnail ? e.media$thumbnail.url.replace('s72-c','s1600') : NO_IMAGE;
    let label = getLabel(e);

    html+=`
    <div class='item'>
      <a class='img' href='${link}' style='background-image:url(${thumb})'>
        <span class='category'><span class='button'>${label}</span></span>
      </a>
      <a class='cap' href='${link}'>${title}</a>
    </div>`;

    d+=`<span class='i' data-i='${i+1}'></span>`;
  });

  slider.innerHTML=html;
  dots.innerHTML=d;

  init();
}

/* ---------- slider ---------- */

function show(n){

  const slides=box.querySelectorAll(".item");
  const dots=box.querySelectorAll(".i");

  if(n>slides.length) slideIndex=1;
  if(n<1) slideIndex=slides.length;

  slides.forEach(s=>s.style.display="none");
  dots.forEach(x=>x.classList.remove("active"));

  if(slides[slideIndex-1]){
    slides[slideIndex-1].style.display="block";
    dots[slideIndex-1].classList.add("active");
  }
}

function next(n){ show(slideIndex+=n); }

function init(){

  show(slideIndex);

  timer=setInterval(()=>next(1),interval);

  box.querySelector(".prev").onclick=()=>next(-1);
  box.querySelector(".next").onclick=()=>next(1);

  box.querySelectorAll(".i").forEach(dot=>{
    dot.onclick=()=>show(slideIndex=parseInt(dot.dataset.i));
  });

  // klik label → halaman label
  box.querySelectorAll(".category").forEach(el=>{
    el.onclick=(e)=>{
      e.preventDefault();
      location.href = blogUrl + "/search/label/" + encodeURIComponent(el.textContent.trim());
    };
  });
}

/* ---------- JSONP ---------- */

const callback="vrSlider"+Math.random().toString(36).substr(2,5);
window[callback]=render;

const s=document.createElement("script");
s.src=`${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${callback}`;
document.head.appendChild(s);

});

})();
