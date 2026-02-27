/*
VanRamein Random Post Slider - Clean Engine
Domain: www.vanramein.blog
File: /widget/slider-random-post.js
*/

(function(){
  /* ================= DOMAIN VALIDATION ================= */
  const ROOT_DOMAIN = "www.vanramein.blog";
  if(location.hostname !== ROOT_DOMAIN && !location.hostname.endsWith(".vanramein.blog")){
    console.warn("VanRamein Slider blocked on:", location.hostname);
    return;
  }

  /* ================= LIGHT OBFUSCATION ================= */
  const _s=[
    "querySelector","appendChild","createElement","innerHTML",
    "addEventListener","classList","contains","length",
    "https://www.vanramein.blog/feeds/posts/default?alt=json&max-results=",
    "media$thumbnail","url","title","$t","entry"
  ];
  const $=(i)=>_s[i];

  /* ================= WAIT DOM ================= */
  function ready(fn){
    document.readyState!="loading"?fn():document.addEventListener("DOMContentLoaded",fn);
  }

  /* ================= FETCH POSTS ================= */
  function fetchPosts(cb){
    const amount=(window.wcSliderRandom?.amount)||5;
    fetch(_s[8]+amount)
      .then(r=>r.json())
      .then(j=>cb(j.feed[$(12)]))
      .catch(e=>console.warn("Slider fetch fail",e));
  }

  /* ================= BUILD HTML ================= */
  function build(container,posts){
    let html='<div class="slider">';
    posts.forEach(p=>{
      let img=p[$(9)]?p[$(9)][$(11)].replace("s72-c","s1600"):(window.wcSliderRandom?.noImage||"");
      let link=p.link.find(l=>l.rel==='alternate').href;
      let title=p[$(10)][$(11)];
      html+=`<a class="item" href="${link}">
        <div class="img" style="background-image:url('${img}')"></div>
        <div class="cap">${title}</div>
      </a>`;
    });
    html+='</div><div class="slideI"></div>';
    container[$(3)]=html;
  }

  /* ================= SLIDER ENGINE ================= */
  function engine(container){
    const items=[...container.querySelectorAll('.item')];
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

    if(window.wcSliderRandom?.auto==='true')
      setInterval(next,parseInt(window.wcSliderRandom?.duration||3000));

    /* swipe */
    if(window.wcSliderRandom?.swipe==='true'){
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

  /* ================= START ================= */
  ready(()=>{
    const box=document.querySelector('.vanrameinslider');
    if(!box) return;
    fetchPosts(posts=>{
      build(box,posts);
      engine(box);
    });
  });
})();

/* ================= HTML CONTAINER =================
<div class='slideB vanrameinslider'></div>
*/

/* ================= REQUIRED GLOBAL CONFIG =================
const wcSliderRandom = {
  amount:'5',
  duration:'3000',
  auto:'true',
  swipe:'true'
}
*/
