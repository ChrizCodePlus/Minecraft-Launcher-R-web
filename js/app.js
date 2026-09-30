(()=>{
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const header=$('.site-header'), mobile=$('.mobile-toggle');
  mobile?.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');mobile.setAttribute('aria-expanded',String(open));});
  $$('.nav-trigger').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const group=btn.closest('.nav-group');$$('.nav-group').forEach(item=>item!==group&&item.classList.remove('open'));group.classList.toggle('open');}));
  document.addEventListener('click',()=>$$('.nav-group').forEach(item=>item.classList.remove('open')));
  $$('.dropdown').forEach(item=>item.addEventListener('click',e=>e.stopPropagation()));

  function initPeekCarousel(root){
    const slides=$$('.peek-slide',root), dots=$('.peek-dots',root); let index=0;
    const render=()=>{
      const total=slides.length;
      slides.forEach((slide,i)=>{
        const rel=(i-index+total)%total;
        slide.classList.remove('is-active','is-prev','is-next','is-far');
        if(rel===0) slide.classList.add('is-active');
        else if(rel===1) slide.classList.add('is-next');
        else if(rel===total-1) slide.classList.add('is-prev');
        else slide.classList.add('is-far');
        slide.setAttribute('aria-hidden',rel===0?'false':'true');
      });
      $$('button',dots).forEach((button,i)=>button.classList.toggle('active',i===index));
    };
    dots.innerHTML='';
    slides.forEach((_,i)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Ir al elemento ${i+1}`);button.addEventListener('click',()=>{index=i;render();});dots.append(button);});
    $('.prev',root)?.addEventListener('click',()=>{index=(index-1+slides.length)%slides.length;render();});
    $('.next',root)?.addEventListener('click',()=>{index=(index+1)%slides.length;render();});
    render();
  }
  $$('[data-peek-carousel]').forEach(initPeekCarousel);

  const downloadRoot=$('[data-download-carousel]'), downloadTrack=$('.download-track',downloadRoot); let platform=0;
  function setPlatform(value){platform=(value+2)%2;downloadTrack.style.transform=`translateX(-${platform*100}%)`;$$('[data-platform-button]').forEach((button,i)=>button.classList.toggle('active',i===platform));}
  $('.prev',downloadRoot)?.addEventListener('click',()=>setPlatform(platform-1));
  $('.next',downloadRoot)?.addEventListener('click',()=>setPlatform(platform+1));
  $$('[data-platform-button]').forEach(button=>button.addEventListener('click',()=>setPlatform(Number(button.dataset.platformButton))));
  $$('[data-download-slide]').forEach(link=>link.addEventListener('click',()=>setPlatform(Number(link.dataset.downloadSlide))));

  async function rotateGroup(name,direction){
    const group=$(`[data-rotating-group="${name}"]`);
    if(!group||group.dataset.animating==='true')return;

    const cards=[...group.children];
    if(cards.length<2)return;

    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reducedMotion){
      direction>0?group.append(cards[0]):group.prepend(cards[cards.length-1]);
      return;
    }

    group.dataset.animating='true';
    group.style.pointerEvents='none';

    const firstPositions=new Map(cards.map(card=>[card,card.getBoundingClientRect()]));
    const wrappingCard=direction>0?cards[0]:cards[cards.length-1];

    direction>0?group.append(wrappingCard):group.prepend(wrappingCard);

    const animations=cards.map(card=>{
      const first=firstPositions.get(card);
      const last=card.getBoundingClientRect();
      const dx=first.left-last.left;
      const dy=first.top-last.top;

      if(card===wrappingCard){
        return card.animate([
          {transform:`translate(${dx}px,${dy}px)`,opacity:1},
          {transform:`translate(${dx*.62}px,${dy*.62}px)`,opacity:0,offset:.43},
          {transform:'translate(0,0)',opacity:0,offset:.44},
          {transform:'translate(0,0)',opacity:1}
        ],{
          duration:420,
          easing:'cubic-bezier(.2,.75,.25,1)'
        });
      }

      return card.animate([
        {transform:`translate(${dx}px,${dy}px)`},
        {transform:'translate(0,0)'}
      ],{
        duration:420,
        easing:'cubic-bezier(.2,.75,.25,1)'
      });
    });

    await Promise.allSettled(animations.map(animation=>animation.finished));
    delete group.dataset.animating;
    group.style.pointerEvents='';
  }

  $$('[data-rotate]').forEach(button=>button.addEventListener('click',()=>{
    rotateGroup(button.dataset.rotate,Number(button.dataset.direction));
  }));

  let lastFocus=null;
  function openModal(id){const modal=document.getElementById(id);if(!modal)return;lastFocus=document.activeElement;modal.hidden=false;document.body.style.overflow='hidden';$('.modal-close',modal)?.focus();}
  function closeModal(modal){if(!modal)return;modal.hidden=true;document.body.style.overflow='';lastFocus?.focus?.();}
  $$('[data-modal-open]').forEach(button=>button.addEventListener('click',()=>openModal(button.dataset.modalOpen)));
  $$('[data-modal-close]').forEach(button=>button.addEventListener('click',()=>closeModal(button.closest('.modal'))));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')$$('.modal:not([hidden])').forEach(closeModal);});


  function ensureAboutDescription(){
    const modal=document.getElementById('about-modal');
    const panel=modal?.querySelector('.about-panel,.modal-panel');
    if(!panel)return;

    const fullText=panel.textContent||'';
    if(fullText.includes('No pretende sustituir al launcher oficial')&&fullText.includes('launch-mcremaster.netlify.app'))return;

    if(!document.getElementById('about-full-description-styles')){
      const style=document.createElement('style');
      style.id='about-full-description-styles';
      style.textContent=`
        .about-full-description{
          max-width:920px;
          margin:22px auto 24px;
          padding:20px 22px;
          color:#252321;
          background:#fff;
          border:2px solid #343230;
          border-left:7px solid #3c8f2d;
          box-shadow:6px 6px 0 rgba(47,43,40,.18);
          text-align:left;
          font-family:Arial,sans-serif;
          font-size:15px;
          line-height:1.65;
        }
        .about-full-description p{margin:0}
        .about-full-description p+p{margin-top:13px}
        .about-full-description a{
          color:#267d20;
          font-weight:700;
          text-decoration:underline;
          text-underline-offset:3px;
          overflow-wrap:anywhere;
        }
        @media(max-width:700px){
          .about-full-description{
            margin:18px 0 22px;
            padding:17px;
            font-size:14px;
            box-shadow:4px 4px 0 rgba(47,43,40,.18);
          }
        }
      `;
      document.head.append(style);
    }

    const description=document.createElement('section');
    description.className='about-full-description';
    description.setAttribute('aria-label','Descripcion completa del proyecto');
    description.innerHTML=`
      <p>Minecraft Launcher Remastered es un proyecto independiente creado para ofrecer una experiencia cómoda, confiable y visualmente cuidada a la comunidad. No pretende sustituir al launcher oficial ni distribuir, vender o proporcionar contenido de Minecraft. Su objetivo es fomentar el uso y la compra legítima del juego mediante los canales oficiales de Minecraft.</p>
      <p>La única página oficial de este proyecto es <a href="https://launch-mcremaster.netlify.app" target="_blank" rel="noopener">launch-mcremaster.netlify.app</a>. La página oficial de Minecraft es <a href="https://www.minecraft.net/es-es" target="_blank" rel="noopener">minecraft.net</a>. Cualquier descarga, noticia o enlace externo mostrado por el launcher debe proceder de sus servicios oficiales o de plataformas reconocidas como Modrinth.</p>
    `;

    const cards=panel.querySelector('.about-features,.about-grid,.about-cards,.about-benefits,.feature-grid');
    const author=panel.querySelector('.about-author');
    const notice=panel.querySelector('.about-notice');

    if(cards)cards.before(description);
    else if(author)author.before(description);
    else if(notice)notice.before(description);
    else{
      const intro=panel.querySelector('.about-lead,.modal-lead,.about-intro');
      if(intro)intro.after(description);
      else panel.append(description);
    }
  }
  ensureAboutDescription();

  const toast=$('.toast');let toastTimer;
  function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;toastTimer=setTimeout(()=>toast.hidden=true,3200);}
  $$('[data-pending-link]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();showToast('El enlace de GitHub se añadira en la siguiente modificacion.');}));
})();
