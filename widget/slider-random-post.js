(function(){

/* ========= WAIT CONFIG ========= */
function waitConfig(cb){
 let t=setInterval(()=>{
  if(window.wcSliderRandom){clearInterval(t);cb();}
 },50);
}

waitConfig(start);

/* ========= START ========= */
function start(){

const cfg=window.wcSliderRandom;
if(!cfg.feeds) return console.warn("Slider: feeds missing");

/* ========= CREATE CONTAINER ========= */
let box=document.querySelector(".vanramein-slider");
if(!box){
 box=document.createElement("div");
 box.className="vanramein-slider";
 document.body.appendChild(box);
}

/* ========= BASIC STYLE AUTO ========= */
if(!document.getElementById("vr-slider-style")){
 const s=document.createElement("style");
 s.id="vr-slider-style";
 s.textContent=`
 .vanramein-slider{position:relative;overflow:hidden}
 .vr-item{display:none;position:relative}
 .vr-img{display:block;padding-top:56%;background-size:cover;background-position:center}
 .vr-cap{position:absolute;left:0;right:0;bottom:0;padding:20px;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.7))}
 .vr-label{position:absolute;top:10px;right:10px;background:#fff;color:#000;padding:4px 10px;border-radius:20px;font-size:12px}
 .vr-dots{text-align:center;margin-top:6px}
 .vr-dots span{display:inline-block;width:6px;height:6px;background:#ccc;margin:0 3px;border-radius:10px}
 .vr-dots .a{width:18px;background:#f89000}
 `;
 document.head.appendChild(s);
}

/* ========= HELPERS ========= */
function getLabel(e){
 if(!e.link) return "";
 let l=e.link.find(x=>x.href && x.href.includes("/search/label/"));
 if(!l) return "";
 return decodeURIComponent(l.href.split("/search/label/")[1].split("?")[0]);
}

function getImg(e){
 if(e.media$thumbnail?.url) return e.media$thumbnail.url.replace("s72-c","s1600");
 if(e.content?.$t){
   let m=e.content.$t.match(/<img[^>]+src="([^"]+)"/i);
   if(m) return m[1];
 }
 return cfg.noImage||"";
}

/* ========= JSONP ========= */
window.vrSliderFeed=function(json){

 if(!json.feed || !json.feed.entry){
  box.innerHTML="";return;
 }

 let html='<div class="vr-wrap">';
 json.feed.entry.forEach((e,i)=>{
  let title=e.title.$t;
  let link=e.link.find(l=>l.rel==="alternate").href;
  let img=getImg(e);
  let label=getLabel(e);

  html+=`
  <a class="vr-item" href="${link}">
   ${label?`<span class="vr-label">${label}</span>`:""}
   <span class="vr-img" style="background-image:url('${img}')"></span>
   <span class="vr-cap">${title}</span>
  </a>`;
 });

 html+='</div><div class="vr-dots"></div>';
 box.innerHTML=html;

 init();
};

/* ========= LOAD FEED ========= */
const s=document.createElement("script");
s.src=`${cfg.feeds}/feeds/posts/default?alt=json-in-script&max-results=${cfg.amount||5}&callback=vrSliderFeed`;
document.body.appendChild(s);

/* ========= ENGINE ========= */
function init(){
 const items=[...box.querySelectorAll(".vr-item")];
 const dots=box.querySelector(".vr-dots");
 let i=0;

 items.forEach(()=>dots.innerHTML+="<span></span>");
 const di=[...dots.children];

 function show(n){
  items.forEach(e=>e.style.display="none");
  di.forEach(e=>e.classList.remove("a"));
  items[n].style.display="block";
  di[n].classList.add("a");
 }

 function next(){i=(i+1)%items.length;show(i);}
 show(0);

 if(cfg.auto==="true")
  setInterval(next,parseInt(cfg.duration||4000));
}

}

})();
