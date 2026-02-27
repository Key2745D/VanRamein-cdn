/* VanRamein Blogger Cross Feed Slider */
(function(){

if(!window.wcSliderRandom) return;

const FEED = wcSliderRandom.feeds.replace(/\/$/,'');
const LIMIT = wcSliderRandom.amount || 5;
const NOIMG = wcSliderRandom.noImage;

function ready(fn){
 document.readyState!="loading"?fn():document.addEventListener("DOMContentLoaded",fn);
}

function render(json){

 const box = document.querySelector(".vanramein-slider");
 if(!box) return;

 let html='';
 let dots='';

 const entries = json.feed.entry || [];

 entries.forEach((post,i)=>{

   const title = post.title.$t;

   const link = post.link.find(l=>l.rel==="alternate").href;

   let img = NOIMG;
   if(post.media$thumbnail)
     img = post.media$thumbnail.url.replace("s72-c","s1600");

   /* ===== AMBIL LABEL ASLI ===== */
   let labelName="Artikel";
   let labelUrl=link;

   if(post.category && post.category.length){
      labelName = post.category[0].term;
      labelUrl = FEED+"/search/label/"+encodeURIComponent(labelName);
   }

   html+=`
   <div class="item">
     <div class="category">
       <a class="button" href="${labelUrl}">${labelName}</a>
     </div>
     <a class="img" href="${link}" style="background-image:url(${img})"></a>
     <a class="cap" href="${link}">${title}</a>
   </div>`;

   dots+=`<span class="i" onclick="vrSlide(${i+1})"></span>`;
 });

 box.innerHTML=html;
 document.querySelector(".vr-dots").innerHTML=dots;

 startSlider();
}

let index=1;

window.vrSlide=function(n){show(index=n)}
window.vrNext=function(n){show(index+=n)}

function show(n){
 const slides=document.querySelectorAll(".vanramein-slider .item");
 const dots=document.querySelectorAll(".vr-dots .i");

 if(!slides.length) return;

 if(n>slides.length) index=1;
 if(n<1) index=slides.length;

 slides.forEach(s=>s.style.display="none");
 dots.forEach(d=>d.classList.remove("active"));

 slides[index-1].style.display="block";
 dots[index-1].classList.add("active");
}

function startSlider(){
 show(index);
 if(wcSliderRandom.auto==="true")
   setInterval(()=>vrNext(1),wcSliderRandom.duration||4000);
}

ready(()=>{
 const s=document.createElement("script");
 s.src=`${FEED}/feeds/posts/default?alt=json-in-script&max-results=${LIMIT}&callback=render`;
 document.body.appendChild(s);
});

})();
