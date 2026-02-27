(function(){

/* ================= CREDIT LOCK ================= */
const CREDIT_NAME = "www.vanramein.blog";
const CREDIT_HASH = btoa(CREDIT_NAME);

function creditCheck(container){
  let c = document.createElement("a");
  c.href = "https://" + CREDIT_NAME;
  c.style.display = "none";
  c.dataset.vr = CREDIT_HASH;
  container.appendChild(c);

  setTimeout(()=>{
    if(!container.querySelector('[data-vr="'+CREDIT_HASH+'"]')){
      container.innerHTML = "";
      console.warn("VanRamein Slider: credit removed");
      return false;
    }
  },1200);
  return true;
}

/* ================= CORE ================= */
document.querySelectorAll(".slideB").forEach(function(box){

  if(!creditCheck(box)) return;

  const cfg = JSON.parse(box.dataset.config || "{}");

  const blogUrl = cfg.blogUrl || location.origin;
  const max = cfg.numPosts || 5;
  const interval = cfg.interval || 5000;
  const noImage = 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  box.innerHTML = `
    <div class='slider'></div>
    <button class='prev'>&#10094;</button>
    <button class='next'>&#10095;</button>
    <div class='slideI'></div>
  `;

  let slideIndex = 1;
  let timer;

  function getLabel(entry){
    if(!entry.category) return "Update";
    return entry.category[0].term;
  }

  function render(json){
    const entries = json.feed.entry || [];
    const slider = box.querySelector(".slider");
    const dots = box.querySelector(".slideI");

    let html="", d="";

    entries.forEach((e,i)=>{
      let title = e.title.$t;
      let link = e.link.find(l=>l.rel==="alternate").href;
      let thumb = e.media$thumbnail ? e.media$thumbnail.url.replace('s72-c','s1600') : noImage;
      let label = getLabel(e);

      html+=`
<div class='item'>
  <a class='img' href='${link}' style='background-image:url(${thumb})'>
    <span class='category'>
      <span class='button'>${label}</span>
    </span>
  </a>
  <a class='cap' href='${link}'>${title}</a>
</div>`;

      d+=`<span class='i' data-i='${i+1}'></span>`;
    });

    slider.innerHTML=html;
    dots.innerHTML=d;

    init();
  }

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
  }

  const s=document.createElement("script");
  s.src=`${blogUrl}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=vrSlider${Math.random().toString(36).substr(2,5)}`;

  const callbackName=s.src.match(/callback=(.*?)$/)[1];
  window[callbackName]=render;

  document.head.appendChild(s);

});

})();
