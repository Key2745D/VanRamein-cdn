//VanRamein Random Post Slider - Stable Engine
//File: /widget/slider-random-post.js

(function(){

/* ================= WAIT CONFIG ================= */
function waitVanrameinConfig(start){
  let retry=0;
  const timer=setInterval(()=>{
    if(window.wcSliderRandom && window.wcSliderRandom.sharedBy){
      clearInterval(timer);
      start();
    }
    if(retry++>200){
      clearInterval(timer);
      console.warn("VanRamein Slider blocked: config not found");
    }
  },50);
}

waitVanrameinConfig(function(){

/* ================= CREDIT VALIDATOR ================= */
if(window.wcSliderRandom.sharedBy !== "www.vanramein.blog"){
  console.warn("VanRamein Slider blocked: credit removed");
  return;
}

/* ================= READY ================= */
function ready(fn){
  document.readyState!="loading"?fn():document.addEventListener("DOMContentLoaded",fn);
}

/* ================= FETCH BLOGGER JSONP ================= */
function fetchPosts(cb){

  const amount = window.wcSliderRandom.amount || 5;
  const url = (window.wcSliderRandom.feeds || "https://www.vanramein.blog")
      + "/feeds/posts/default?alt=json-in-script&max-results="+amount+"&callback=vanrameinSliderFeed";

  window.vanrameinSliderFeed=function(json){
    if(!json.feed || !json.feed.entry){
      console.warn("VanRamein Slider: empty feed");
      return;
    }
    cb(json.feed.entry);
  };

  const s=document.createElement("script");
  s.src=url;
  document.body.appendChild(s);
}

/* ================= BUILD HTML ================= */
function build(container,posts){

  let html='<div class="slider">';

  posts.forEach(p=>{

    // link
    let link="#";
    if(p.link){
      let alt=p.link.find(l=>l.rel==="alternate");
      if(alt) link=alt.href;
    }

    // title
    let title=(p.title && p.title.$t)?p.title.$t:"No title";

    // image safe
    let img="";
    if(p.media$thumbnail && p.media$thumbnail.url){
      img=p.media$thumbnail.url.replace("s72-c","s1600");
    }else if(p.content && p.content.$t){
      let m=p.content.$t.match(/<img.+src="([^"]+)"/);
      if(m) img=m[1];
    }
    if(!img) img=window.wcSliderRandom.noImage||"";

    // label
    let label="";
    if(p.category && p.category.length){
      label=p.category[0].term;
    }

    html+=`<a class="item" href="${link}">
      <div class="img" style="background-image:url('${img}')"></div>
      <div class="cap">
        ${label?`<span class="category">${label}</span>`:""}
        ${title}
      </div>
    </a>`;
  });

  html+='</div><div class="slideI"></div>';
  container.innerHTML=html;
}

/* ================= ENGINE ================= */
function engine(container){

  const items=[...container.querySelectorAll('.item')];
  if(!items.length) return;

  const dots=container.querySelector('.slideI');
  let i=0;

  items.forEach(()=>dots.innerHTML+='<span class="i"></span>');
  const di=[...dots.children];

  function show(n){
    items.forEach(el=>el.style.display='none');
    di.forEach(el=>el.classList.remove('active'));
    items[n].style.display='block';
    di[n].classList.add('active');
  }

  function next(){ i=(i+1)%items.length; show(i); }
  function prev(){ i=(i-1+items.length)%items.length; show(i); }

  show(i);

  // auto slide
  if(window.wcSliderRandom.auto==='true'){
    setInterval(next,parseInt(window.wcSliderRandom.duration||3000));
  }

  // swipe
  if(window.wcSliderRandom.swipe==='true'){
    let sx=0;
    container.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
    container.addEventListener('touchend',e=>{
      let dx=e.changedTouches[0].clientX-sx;
      if(Math.abs(dx)>40) dx>0?prev():next();
    },{passive:true});
  }
}

/* ================= START ================= */
ready(()=>{
  const box=document.querySelector('.vanrameinslider');
  if(!box) return;

  fetchPosts(posts=>{
    build(box,posts);
    engine(box);
  });
});

}); // end wait config
})();
