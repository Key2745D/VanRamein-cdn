//VanRamein Random Post Slider - Clean Engine
//Credit: www.vanramein.blog

(function(){

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

if(window.wcSliderRandom.sharedBy !== "www.vanramein.blog"){
  console.warn("VanRamein Slider blocked: credit removed");
  return;
}

(function(){

  const REQUIRED_CREDIT="www.vanramein.blog";
  if(!window.wcSliderRandom || window.wcSliderRandom.sharedBy!==REQUIRED_CREDIT){
    console.warn("VanRamein Slider blocked: credit removed");
    return;
  }

  // ===== WAIT DOM =====
  function ready(fn){
    document.readyState!="loading"?fn():document.addEventListener("DOMContentLoaded",fn);
  }

  // ===== FETCH BLOGGER VIA JSONP (ANTI CORS) =====
  function fetchPosts(cb){
    const amount = window.wcSliderRandom.amount || 5;
    const base   = window.wcSliderRandom.feeds.replace(/\/$/,"");

    const url =
      base +
      "/feeds/posts/default?alt=json-in-script&max-results=" +
      amount +
      "&callback=vanrameinSliderFeed";

    window.vanrameinSliderFeed=function(json){
      if(!json || !json.feed || !json.feed.entry){
        console.warn("VanRamein Slider: empty feed");
        return;
      }
      cb(json.feed.entry);
    };

    const s=document.createElement("script");
    s.src=url;
    document.body.appendChild(s);
  }

  // ===== BUILD HTML =====
  function getThumb(p){
    try{
      return p.media$thumbnail.url.replace("s72-c","s1600");
    }catch(e){
      return window.wcSliderRandom.noImage || "";
    }
  }

  function getLink(p){
    for(let i=0;i<p.link.length;i++)
      if(p.link[i].rel==="alternate") return p.link[i].href;
    return "#";
  }

  function build(container,posts){
    let html='<div class="slider">';

    posts.forEach(p=>{
      const img   = getThumb(p);
      const link  = getLink(p);
      const title = (p.title && p.title.$t) ? p.title.$t : "No title";

      html+=`<a class="item" href="${link}">
        <div class="img" style="background-image:url('${img}')"></div>
        <div class="cap">${title}</div>
      </a>`;
    });

    html+='</div><div class="slideI"></div>';
    container.innerHTML=html;
  }

  // ===== ENGINE =====
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
    show(i);

    if(window.wcSliderRandom.auto==='true')
      setInterval(next,parseInt(window.wcSliderRandom.duration||3000));

    if(window.wcSliderRandom.swipe==='true'){
      let sx=0;
      container.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
      container.addEventListener('touchend',e=>{
        let dx=e.changedTouches[0].clientX-sx;
        if(Math.abs(dx)>40) dx>0?i--:i++;
        if(i<0)i=items.length-1;
        if(i>=items.length)i=0;
        show(i);
      },{passive:true});
    }
  }

  // ===== START =====
  ready(()=>{
    const box=document.querySelector('.vanrameinslider');
    if(!box) return;

    fetchPosts(posts=>{
      build(box,posts);
      engine(box);
    });
  });

})();
});
})();
