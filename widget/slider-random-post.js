<script>
(function(){

  const sliders=document.querySelectorAll(".slideB");

  sliders.forEach(box=>{

    /* ===== STRUCTURE (dots keluar container) ===== */
    box.innerHTML=`
      <div class='slider'></div>
      <button class='prev'>&#10094;</button>
      <button class='next'>&#10095;</button>
    `;

    const dotsWrap=document.createElement("div");
    dotsWrap.className="slideI";
    box.after(dotsWrap);

    const slider=box.querySelector(".slider");

    /* ===== AMBIL POST BLOGGER ===== */
    const src=box.getAttribute("data-label")||"";
    const max=parseInt(box.getAttribute("data-no"))||5;

    fetch(`/feeds/posts/default/-/${src}?alt=json&max-results=${max}`)
    .then(r=>r.json())
    .then(data=>render(data.entry||[]));

    /* ===== RENDER ===== */
    function render(posts){

      posts.forEach((post,i)=>{

        let title=post.title.$t;
        let link=post.link.find(l=>l.rel=="alternate").href;
        let img=(post.media$thumbnail)?
          post.media$thumbnail.url.replace("s72-c","s1600"):
          "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-placeholder";

        const item=document.createElement("div");
        item.className="item";
        if(i===0)item.style.display="block";

        item.innerHTML=`
          <a class="img" href="${link}" style="background-image:url('${img}')"></a>
          <a class="cap" href="${link}">${title}</a>
        `;

        slider.appendChild(item);

        const dot=document.createElement("span");
        dot.className="i"+(i===0?" active":"");
        dot.onclick=()=>show(i);
        dotsWrap.appendChild(dot);

      });

      init();
    }

    /* ===== CONTROL ===== */
    let index=0,auto;

    function show(n){
      const items=slider.querySelectorAll(".item");
      const dots=dotsWrap.querySelectorAll(".i");

      if(n>=items.length)n=0;
      if(n<0)n=items.length-1;
      index=n;

      items.forEach(i=>i.style.display="none");
      dots.forEach(d=>d.classList.remove("active"));

      items[index].style.display="block";
      dots[index].classList.add("active");
    }

    function init(){
      const prev=box.querySelector(".prev");
      const next=box.querySelector(".next");

      prev.onclick=()=>{show(index-1);reset();}
      next.onclick=()=>{show(index+1);reset();}

      auto=setInterval(()=>show(index+1),5000);
    }

    function reset(){
      clearInterval(auto);
      auto=setInterval(()=>show(index+1),5000);
    }

  });

})();
</script>
