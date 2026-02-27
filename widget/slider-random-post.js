(function(){

const CREDIT="www.vanramein.blog";
const DEFAULT_MAX=5;
const DEFAULT_INTERVAL=5000;

/* ---------- wait element exist ---------- */
function ready(fn){
  if(document.readyState!="loading") fn();
  else document.addEventListener("DOMContentLoaded",fn);
}

/* ---------- build structure ---------- */
function normalize(box){

  if(!box.querySelector(".slider")){
    box.innerHTML=`
      <div class="slider"></div>
      <button class="prev">&#10094;</button>
      <button class="next">&#10095;</button>
      <div class="slideI"></div>
      <small class="vr-credit">created by: ${CREDIT}</small>
    `;
  }

  if(!box.innerHTML.toLowerCase().includes(CREDIT)){
    box.remove();
    return false;
  }

  return true;
}

/* ---------- engine ---------- */
function init(box){

  if(!normalize(box)) return;

  const slider=box.querySelector(".slider");
  const dots=box.querySelector(".slideI");
  const max=parseInt(box.dataset.max)||DEFAULT_MAX;
  const interval=parseInt(box.dataset.interval)||DEFAULT_INTERVAL;
  const labelRaw=box.dataset.label||"";
  const label=encodeURIComponent(labelRaw.trim());

  const cb="vr_cb_"+Math.random().toString(36).slice(2);

  window[cb]=function(json){

    if(!json.feed||!json.feed.entry){box.style.display="none";return;}

    let html="",dot="";

    json.feed.entry.slice(0,max).forEach((p,i)=>{

      const title=p.title.$t;
      const link=p.link.find(l=>l.rel=="alternate").href;

      let img="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      if(p.media$thumbnail) img=p.media$thumbnail.url.replace("s72-c","s1600");

      let labelName="Blogger";
      if(p.category&&p.category.length) labelName=p.category[0].term;

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

    let index=1;
    const items=box.querySelectorAll(".item");
    const d=box.querySelectorAll(".i");

    function show(n){
      if(n>items.length) index=1;
      if(n<1) index=items.length;
      items.forEach(e=>e.style.display="none");
      d.forEach(e=>e.classList.remove("active"));
      items[index-1].style.display="block";
      d[index-1].classList.add("active");
    }

    box.querySelector(".prev").onclick=()=>show(--index);
    box.querySelector(".next").onclick=()=>show(++index);
    d.forEach(el=>el.onclick=()=>show(index=parseInt(el.dataset.i)));

    show(index);
    setInterval(()=>show(++index),interval);
  };

  const blog=location.origin;
  let url;

  if(!labelRaw||labelRaw=="recent")
    url=`${blog}/feeds/posts/default?alt=json-in-script&max-results=${max}&callback=${cb}`;
  else
    url=`${blog}/feeds/posts/default/-/${label}?alt=json-in-script&max-results=${max}&callback=${cb}`;

  const s=document.createElement("script");
  s.src=url;
  document.body.appendChild(s);
}

/* ---------- boot ---------- */
ready(()=>{
  document.querySelectorAll(".slideB").forEach(init);
});

})();
