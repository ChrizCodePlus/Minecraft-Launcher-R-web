(()=>{
  'use strict';
  const $=(selector,context=document)=>context.querySelector(selector);
  const $$=(selector,context=document)=>Array.from(context.querySelectorAll(selector));

  const header=$('.site-header');
  const mobile=$('.mobile-toggle');
  mobile?.addEventListener('click',()=>{
    const open=header.classList.toggle('menu-open');
    mobile.setAttribute('aria-expanded',String(open));
  });

  $$('.nav-trigger').forEach(button=>button.addEventListener('click',event=>{
    event.stopPropagation();
    const group=button.closest('.nav-group');
    $$('.nav-group').forEach(item=>item!==group&&item.classList.remove('open'));
    group?.classList.toggle('open');
  }));
  document.addEventListener('click',()=>$$('.nav-group').forEach(item=>item.classList.remove('open')));
  $$('.dropdown').forEach(menu=>menu.addEventListener('click',event=>event.stopPropagation()));
  $$('.dropdown a').forEach(link=>link.addEventListener('click',()=>header?.classList.remove('menu-open')));

  // YouTube needs an HTTP(S) origin for reliable embedded playback.
  // On local file previews, show a lightweight clean poster instead of an error screen.
  const youtubeFrame=$('[data-youtube-src]');
  const localPoster=$('.video-local-poster');
  if(youtubeFrame){
    if(location.protocol==='http:'||location.protocol==='https:'){
      youtubeFrame.src=youtubeFrame.dataset.youtubeSrc;
      localPoster?.setAttribute('hidden','');
    }else{
      youtubeFrame.hidden=true;
      localPoster?.removeAttribute('hidden');
    }
  }

  async function rotateGroup(name,direction){
    const group=$(`[data-rotating-group="${name}"]`);
    if(!group||group.dataset.animating==='true')return;
    const cards=Array.from(group.children);
    if(cards.length<2)return;
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reducedMotion){direction>0?group.append(cards[0]):group.prepend(cards[cards.length-1]);return;}
    group.dataset.animating='true';
    group.style.pointerEvents='none';
    const firstPositions=new Map(cards.map(card=>[card,card.getBoundingClientRect()]));
    const wrappingCard=direction>0?cards[0]:cards[cards.length-1];
    direction>0?group.append(wrappingCard):group.prepend(wrappingCard);
    const animations=cards.map(card=>{
      const first=firstPositions.get(card),last=card.getBoundingClientRect();
      const dx=first.left-last.left,dy=first.top-last.top;
      if(card===wrappingCard){
        return card.animate([
          {transform:`translate(${dx}px,${dy}px)`,opacity:1},
          {transform:`translate(${dx*.62}px,${dy*.62}px)`,opacity:0,offset:.43},
          {transform:'translate(0,0)',opacity:0,offset:.44},
          {transform:'translate(0,0)',opacity:1}
        ],{duration:400,easing:'cubic-bezier(.2,.75,.25,1)'});
      }
      return card.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:400,easing:'cubic-bezier(.2,.75,.25,1)'});
    });
    await Promise.allSettled(animations.map(animation=>animation.finished));
    delete group.dataset.animating;
    group.style.pointerEvents='';
  }
  $$('[data-rotate]').forEach(button=>button.addEventListener('click',()=>rotateGroup(button.dataset.rotate,Number(button.dataset.direction))));


  let lastFocus=null;
  const openModal=id=>{
    const modal=document.getElementById(id);
    if(!modal)return;
    lastFocus=document.activeElement;
    modal.hidden=false;
    document.body.style.overflow='hidden';
    $('.modal-close',modal)?.focus();
  };
  const closeModal=modal=>{
    if(!modal)return;
    modal.hidden=true;
    document.body.style.overflow='';
    lastFocus?.focus?.();
  };
  $$('[data-modal-open]').forEach(control=>control.addEventListener('click',()=>openModal(control.dataset.modalOpen)));
  $$('[data-modal-close]').forEach(control=>control.addEventListener('click',()=>closeModal(control.closest('.modal'))));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')$$('.modal:not([hidden])').forEach(closeModal);
  });

  const tabs=$$('[data-changelog-tab]');
  const panels=$$('.changelog-panel');
  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    tabs.forEach(item=>{
      const active=item===tab;
      item.classList.toggle('active',active);
      item.setAttribute('aria-selected',String(active));
    });
    panels.forEach(panel=>{
      const active=panel.id===tab.dataset.changelogTab;
      panel.classList.toggle('active',active);
      panel.hidden=!active;
    });
  }));
})();
