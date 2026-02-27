(function(){

/* ================= CONFIG DEFAULT ================= */
const DEFAULT = {
  max:5,
  interval:5000,
  credit:"www.vanramein.blog"
};

/* ================= CREDIT LOCK ================= */
function hasCredit(box){
  return (box.innerHTML||"").toLowerCase().includes(DEFAULT.credit);
}

function disable(box){
  box.innerHTML="";
  box.style.display="none";
}

/* ================= SLIDER ENGINE ================= */
function startSlider(box){

  if(!hasCredit(box)){
    disable(box);
    return;
  }

  const max = parseInt(box.dataset.max)||DEFAULT.max;
  const interval = parseInt(box.dataset.interval)||DEFAULT.interval;
  const labelRaw = box.dataset.label || "";
  const label = encodeURIComponent(labelRaw.trim());

  const slider = box.querySelector(".slider");
  const dots = box.querySelector(".slideI");

  let index=1, timer;

  /* render */
  window["vanramein_render_"+Math.random().toString(36).slice(2)] = function(json){

    if(!json || !json.feed || !json.feed.entry){
      box.style.display="none";
      return;
    }

    let html="", dot="";

    json.feed.entry.slice(0,max).forEach((post,i)=>{

      const title = post.title.$t;
      const link = post.link.find(l=>l.rel==="alternate").href;

      let img="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      if(post.media$thumbnail){
        img=post.media$thumbnail.url.replace("s72-c","s1600");
      }

      let labelName="Blogger";
      if(post.category && post.category.length){
        labelName=post.category[0].term;
      }

      html+=`
      <div class="item">
        <div class="img" style="background-image:url('${img}')">
          <div class="category">
            <a class="button" href="/search/label/${encodeURIComponent(labelName)}">${labelName}</a>
          </div>
          <a class="cap" href="${link}">${title}</a>
        </div>
      </div>`;

      dot+=`<span class="i" data-i="${i+1}"></span>`;
    });

    slider.innerHTML=html;
    dots.innerHTML=dot;

    const items=box.querySelectorAll(".item");
    const d=box.querySelectorAll(".i");

    function show(n){
      if(n>items.length)index=1;
      if(n<1)index=items.length;

      items.forEach(el=>el.style.display="none");
      d.forEach(el=>el.classList.remove("active"));

      items[index-1].style.display="block";
      d[index-1].classList.add("active");
    }

    function next(){ show(++index); }

    box.querySelector(".prev").onclick=()=>show(--index);
    box.querySelector(".next").onclick=()=>show(++index);
    d.forEach(el=>el.onclick=()=>show(index=parseInt(el.dataset.i)));

    show(index);
    timer=setInterval(next,interval);
  };

  /* build feed url safely */
  const cb = Object.keys(window).find(k=>k.startsWith("vanramein_render_"));
  const blog = location.origin;

let url;
if(!labelRaw || labelRaw==="recent"){
  url=`${blog}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${cb}`;
}else{
  url=`${blog}/feeds/posts/default/-/${label}?alt=json-in-script&max-results=${max}&callback=${cb}`;
}

  const s=document.createElement("script");
  s.src=url;
  s.onerror=()=>box.style.display="none";
  document.body.appendChild(s);
}

/* ================= AUTO INIT ================= */
function init(){
  document.querySelectorAll(".slideB").forEach(startSlider);
}

if(document.readyState==="complete") init();
else window.addEventListener("load",init);

})();
