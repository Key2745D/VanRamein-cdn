(function(){

  const sliders=document.querySelectorAll(".slideB");

  sliders.forEach((box,uid)=>{

    /* struktur */
    box.innerHTML=`
      <div class="slider"></div>
      <button class="prev">&#10094;</button>
      <button class="next">&#10095;</button>
    `;

    const dots=document.createElement("div");
    dots.className="slideI";
    box.after(dots);

    const slider=box.querySelector(".slider");

    const label=box.getAttribute("data-label")||"";
    const max=box.getAttribute("data-no")||5;

    /* ===== JSONP CALLBACK UNIQUE ===== */
    const cb="sliderFeed_"+uid+Date.now();

    window[cb]=function(data){

      const posts=data.feed.entry||[];

      posts.forEach((post,i)=>{

        const title=post.title.$t;
        const link=post.link.find(l=>l.rel=="alternate").href;

        let img="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-placeholder";
        if(post.media$thumbnail)
          img=post.media$thumbnail.url.replace(/s72-c/,"s1600");

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
        dots.appendChild(dot);

      });

      init();
    };

    /* inject script blogger feed */
    const s=document.createElement("script");
    s.src=`/feeds/posts/default/-/${label}?alt=json-in-script&max-results=${max}&callback=${cb}`;
    document.body.appendChild(s);

    /* ===== control ===== */
    let index=0,auto;

    function show(n){
      const items=slider.querySelectorAll(".item");
      const d=dots.querySelectorAll(".i");

      if(!items.length)return;

      if(n>=items.length)n=0;
      if(n<0)n=items.length-1;
      index=n;

      items.forEach(i=>i.style.display="none");
      d.forEach(x=>x.classList.remove("active"));

      items[index].style.display="block";
      d[index].classList.add("active");
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
