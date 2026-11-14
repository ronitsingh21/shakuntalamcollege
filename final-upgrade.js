/* Public navigation and carousel behavior. */
(()=>{
function header(){
    const tickerMessages=['ADMISSION NOTICE FOR SESSION 2026-27 | B.ED','SPOT ROUND ADMISSION NOTICE FOR SESSION 2026-27 | D.EL.ED','ADMISSION OPEN FOR SESSION 2026-27 | BBA & BCA'];
    const tickerGroup=tickerMessages.map(message=>`<a href="#/notices">${message.replace('&','&amp;')}</a>`).join('');
    return `<div class="topbar admission-ticker" aria-label="Admission notices"><div class="admission-track">${tickerGroup}${tickerGroup}</div></div>
    <div class="contact-strip"><div class="container"><span class="contact-location"><svg class="contact-pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/></svg><span class="contact-location-text">Sasaram, Bihar | Devi Shakuntalam Pratishthan</span></span><span class="contact-phone">☎&nbsp; 9470014145 &nbsp;|&nbsp; 9939205777</span></div></div>
    <header class="nav final-nav"><div class="container final-nav-wrap"><div class="nav-brand-row"><a class="reference-brand-lockup" href="#/" aria-label="Shakuntalam College home"><img src="assets/optimized/shakuntalam-brand-lockup.png" alt="Shakuntalam Institute of Teachers Education — Shakuntalam College, established 2015" width="1800" height="440" decoding="async"></a><button class="hamb" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobileMenu" onclick="toggleMobile()"><span class="hamb-icon" aria-hidden="true"><i></i><i></i><i></i></span></button><div class="nav-actions"><a class="btn btn-gold" href="#/admissions">Apply Now</a></div></div>
    <div class="nav-menu-row"><nav class="links final-links" aria-label="Main navigation">
      <div class="nav-drop nav-structured"><a href="#/about">About Us <b>⌄</b></a><div class="drop-menu"><a href="#/about">About</a><a href="#/mission">Mission &amp; Values</a><a href="#/leadership/governing-body">Governing Body</a><a href="#/leadership/secretary">Secretary Desk</a><a href="#/leadership/principal">Principle Desk</a></div></div>
      <div class="nav-drop nav-structured"><a href="#/admissions">Admission <b>⌄</b></a><div class="drop-menu"><a href="#/admission-policy">Policy</a><a href="#/course-eligibility">Course &amp; Eligibility</a><a href="#/forms-brochure">Forms &amp; Brochure</a><a href="#/fee-structure">Fee Structure</a><a href="#/admission-links">Link</a></div></div>
      <div class="nav-drop nav-structured academics-drop"><a href="#/academics">Academics <b>⌄</b></a><div class="drop-menu"><a href="#/departments">Courses</a><a href="#/syllabus">Syllabus</a><a href="#/examination">Examination</a><a href="#/academic-calendar">Academic Calendar</a></div></div>
      <div class="nav-drop nav-structured"><a href="#/administration">Administration <b>⌄</b></a><div class="drop-menu"><a href="#/leadership">Leadership</a><a href="#/centre-cell">Centre &amp; Cells</a><a href="#/faculty">List of Faculty</a><a href="#/notices">Notice</a><a href="#/contact">Contact</a></div></div>
      <div class="nav-drop nav-structured"><a href="#/information">Information <b>⌄</b></a><div class="drop-menu"><a href="#/information/audit-report">Audit Report</a><a href="#/information/annual-report">Annual Report</a><a href="#/information/institutional-certificates">Institutional Certificates</a><a href="#/information/university-affiliation">University Affiliation</a></div></div>
      <div class="nav-drop nav-structured"><a href="#/disclosure">Disclosure <b>⌄</b></a><div class="drop-menu"><a href="#/add-information">Add. Information</a><a href="#/disclosure/fixed-deposits">Fixed Deposits</a><a href="#/disclosure/affidavits">Affidavits</a><a href="#/admission-policy">Admission Policy</a><a href="#/disclosure/building-land-documents">Building/Land Documents</a></div></div>
      <div class="nav-drop nav-structured"><a href="#/accreditation">Accreditation <b>⌄</b></a><div class="drop-menu"><a href="#/accreditation/naac">NAAC</a><a href="#/iqac">IQAC</a><a href="#/accreditation/iiqa">IIQA</a></div></div>
      <div class="nav-drop nav-structured"><a href="#/facilities">Facilities <b>⌄</b></a><div class="drop-menu"><a href="#/facilities/library">Library</a><a href="#/facilities/itc-resource-computer-lab">ITC Resource/ Computer Lab</a><a href="#/facilities/psychology-laboratory">Psychology Laboratory</a><a href="#/facilities/science-lab">Science Lab</a><a href="#/facilities/cafeteria">Cafeteria</a><a href="#/facilities/conference-hall">Conference Hall</a><a href="#/facilities/sports-facilities">Sports Facilities</a></div></div>
      <div class="nav-drop nav-structured"><a href="#/students-zone">Student Zone <b>⌄</b></a><div class="drop-menu"><a href="#/events">Events</a><a href="#/gallery">Gallery</a><a href="#/examination">Examination</a><a href="#/notices">Notice</a><a href="#/centre-cell">Committee &amp; Cell</a><a href="#/alumni">Alumni</a><a href="#/nss">NSS</a></div></div>
      <a class="nav-contact-button" href="#/contact">Contact</a>
    </nav></div></div>
    <nav class="mobile-menu" id="mobileMenu" aria-label="Mobile navigation">
      <div class="mobile-nav-group"><div class="mobile-nav-row"><a class="mobile-menu-link" href="#/about">About Us</a><button type="button" class="mobile-dropdown-toggle" aria-label="Show About Us options" aria-expanded="false" aria-controls="mobileSub-about" onclick="toggleMobileDropdown('about')"></button></div><div class="mobile-submenu" id="mobileSub-about" hidden><a href="#/about">About</a><a href="#/mission">Mission &amp; Values</a><a href="#/leadership/governing-body">Governing Body</a><a href="#/leadership/secretary">Secretary Desk</a><a href="#/leadership/principal">Principle Desk</a></div></div>
      <div class="mobile-nav-group"><div class="mobile-nav-row"><a class="mobile-menu-link" href="#/admissions">Admission</a><button type="button" class="mobile-dropdown-toggle" aria-label="Show Admission options" aria-expanded="false" aria-controls="mobileSub-admission" onclick="toggleMobileDropdown('admission')"></button></div><div class="mobile-submenu" id="mobileSub-admission" hidden><a href="#/admission-policy">Policy</a><a href="#/course-eligibility">Course &amp; Eligibility</a><a href="#/forms-brochure">Forms &amp; Brochure</a><a href="#/fee-structure">Fee Structure</a><a href="#/admission-links">Link</a></div></div>
      <div class="mobile-nav-group"><div class="mobile-nav-row"><a class="mobile-menu-link" href="#/academics">Academics</a><button type="button" class="mobile-dropdown-toggle" aria-label="Show Academics options" aria-expanded="false" aria-controls="mobileSub-academics" onclick="toggleMobileDropdown('academics')"></button></div><div class="mobile-submenu" id="mobileSub-academics" hidden><a href="#/departments">Courses</a><a href="#/syllabus">Syllabus</a><a href="#/examination">Examination</a><a href="#/academic-calendar">Academic Calendar</a></div></div>
      <div class="mobile-nav-group"><div class="mobile-nav-row"><a class="mobile-menu-link" href="#/administration">Administration</a><button type="button" class="mobile-dropdown-toggle" aria-label="Show Administration options" aria-expanded="false" aria-controls="mobileSub-administration" onclick="toggleMobileDropdown('administration')"></button></div><div class="mobile-submenu" id="mobileSub-administration" hidden><a href="#/leadership">Leadership</a><a href="#/centre-cell">Centre &amp; Cells</a><a href="#/faculty">List of Faculty</a><a href="#/notices">Notice</a><a href="#/contact">Contact</a></div></div>
      <div class="mobile-nav-group"><div class="mobile-nav-row"><a class="mobile-menu-link" href="#/information">Information</a><button type="button" class="mobile-dropdown-toggle" aria-label="Show Information options" aria-expanded="false" aria-controls="mobileSub-information" onclick="toggleMobileDropdown('information')"></button></div><div class="mobile-submenu" id="mobileSub-information" hidden><a href="#/information/audit-report">Audit Report</a><a href="#/information/annual-report">Annual Report</a><a href="#/information/institutional-certificates">Institutional Certificates</a><a href="#/information/university-affiliation">University Affiliation</a></div></div>
      <div class="mobile-nav-group"><div class="mobile-nav-row"><a class="mobile-menu-link" href="#/disclosure">Disclosure</a><button type="button" class="mobile-dropdown-toggle" aria-label="Show Disclosure options" aria-expanded="false" aria-controls="mobileSub-disclosure" onclick="toggleMobileDropdown('disclosure')"></button></div><div class="mobile-submenu" id="mobileSub-disclosure" hidden><a href="#/add-information">Add. Information</a><a href="#/disclosure/fixed-deposits">Fixed Deposits</a><a href="#/disclosure/affidavits">Affidavits</a><a href="#/admission-policy">Admission Policy</a><a href="#/disclosure/building-land-documents">Building/Land Documents</a></div></div>
      <div class="mobile-nav-group"><div class="mobile-nav-row"><a class="mobile-menu-link" href="#/accreditation">Accreditation</a><button type="button" class="mobile-dropdown-toggle" aria-label="Show Accreditation options" aria-expanded="false" aria-controls="mobileSub-accreditation" onclick="toggleMobileDropdown('accreditation')"></button></div><div class="mobile-submenu" id="mobileSub-accreditation" hidden><a href="#/accreditation/naac">NAAC</a><a href="#/iqac">IQAC</a><a href="#/accreditation/iiqa">IIQA</a></div></div>
      <div class="mobile-nav-group"><div class="mobile-nav-row"><a class="mobile-menu-link" href="#/facilities">Facilities</a><button type="button" class="mobile-dropdown-toggle" aria-label="Show Facilities options" aria-expanded="false" aria-controls="mobileSub-facilities" onclick="toggleMobileDropdown('facilities')"></button></div><div class="mobile-submenu" id="mobileSub-facilities" hidden><a href="#/facilities/library">Library</a><a href="#/facilities/itc-resource-computer-lab">ITC Resource/ Computer Lab</a><a href="#/facilities/psychology-laboratory">Psychology Laboratory</a><a href="#/facilities/science-lab">Science Lab</a><a href="#/facilities/cafeteria">Cafeteria</a><a href="#/facilities/conference-hall">Conference Hall</a><a href="#/facilities/sports-facilities">Sports Facilities</a></div></div>
      <div class="mobile-nav-group"><div class="mobile-nav-row"><a class="mobile-menu-link" href="#/students-zone">Student Zone</a><button type="button" class="mobile-dropdown-toggle" aria-label="Show Student Zone options" aria-expanded="false" aria-controls="mobileSub-student-zone" onclick="toggleMobileDropdown('student-zone')"></button></div><div class="mobile-submenu" id="mobileSub-student-zone" hidden><a href="#/events">Events</a><a href="#/gallery">Gallery</a><a href="#/examination">Examination</a><a href="#/notices">Notice</a><a href="#/centre-cell">Committee &amp; Cell</a><a href="#/alumni">Alumni</a><a href="#/nss">NSS</a></div></div>
      <a class="mobile-menu-link" href="#/contact">Contact</a>
    </nav></header>`;
  }
  window.header=header;
  const carouselStates=new WeakMap();
  let activeStates=[];
  function slidesFor(frame){
    if(frame.matches('[data-hero-stage]'))return HERO_SLIDES||[];
    const key=frame.dataset.homeCarousel||'';
    if(key==='classroom')return EXPERIENCE_SLIDES||[];
    return PURPOSE_SLIDES||[];
  }
  function paintDots(frame,index){
    const dots=frame.querySelectorAll('.hero-dot,.home-carousel-dot');
    dots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
  }
  function stateFor(frame){return carouselStates.get(frame)}
  function requestSlide(frame,index,direction){
    const state=stateFor(frame);if(!state||!state.slides.length)return;
    const target=(index+state.slides.length)%state.slides.length;
    state.requestedIndex=target;
    if(target===state.index&&!state.animating)return;
    const src=state.slides[target];
    state.animating=true;
    window.animatePublicCarousel(frame,state.image,src.image,src.title,direction,loaded=>{
      state.animating=frame.dataset.carouselAnimating==='true';
      if(loaded){state.index=target;state.image=frame.querySelector('img')||state.image;paintDots(frame,target)}
      else if(!state.animating)state.requestedIndex=state.index;
    });
  }
  function step(frame,direction){const state=stateFor(frame);if(state)requestSlide(frame,(state.requestedIndex??state.index)+direction,direction)}
  window.nextHeroSlideV7=direction=>{const frame=document.querySelector('[data-hero-stage]');if(frame)step(frame,Number(direction)||1)};
  window.showHeroSlideV7=index=>{const frame=document.querySelector('[data-hero-stage]');if(frame)requestSlide(frame,Number(index),Number(index)>=((stateFor(frame)?.index)||0)?1:-1)};
  window.stepHomeImageCarousel=(key,direction)=>{const frame=[...document.querySelectorAll('[data-home-carousel]')].find(item=>item.dataset.homeCarousel===key);if(frame)step(frame,Number(direction)||1)};
  window.showHomeImageSlide=(key,index,direction=1)=>{const frame=[...document.querySelectorAll('[data-home-carousel]')].find(item=>item.dataset.homeCarousel===key);if(frame)requestSlide(frame,Number(index),Number(direction)||1)};
  function startPublicCarousels(){
    activeStates.forEach(state=>{clearInterval(state.timer);state.abort.abort()});activeStates=[];
    const frames=[...document.querySelectorAll('[data-hero-stage],[data-home-carousel]')];
    frames.forEach(frame=>{
      const slides=slidesFor(frame).filter(item=>item?.image);const image=frame.querySelector('img');if(!image||!slides.length)return;
      let index=slides.findIndex(item=>new URL(item.image,document.baseURI).href===(image.currentSrc||image.src));if(index<0)index=0;
      const state={frame,image,slides,index,requestedIndex:index,animating:false,paused:false,timer:null,abort:new AbortController()};
      carouselStates.set(frame,state);activeStates.push(state);paintDots(frame,index);
      const schedule=()=>{clearInterval(state.timer);if(!state.paused&&slides.length>1)state.timer=setInterval(()=>step(frame,1),4000)};
      frame.addEventListener('pointerenter',()=>{state.paused=true;clearInterval(state.timer)},{signal:state.abort.signal});
      frame.addEventListener('pointerleave',()=>{state.paused=false;schedule()},{signal:state.abort.signal});
      frame.addEventListener('focusin',()=>{state.paused=true;clearInterval(state.timer)},{signal:state.abort.signal});
      frame.addEventListener('focusout',event=>{if(!frame.contains(event.relatedTarget)){state.paused=false;schedule()}},{signal:state.abort.signal});
      frame.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(frame,event.key==='ArrowRight'?1:-1)}},{signal:state.abort.signal});
      schedule();
    });
  }
  window.startPublicCarousels=startPublicCarousels;
  const transitions=new WeakMap();
  async function animateOnce(frame,image,src,alt,direction){
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(reduce){image.src=src;image.alt=alt||image.alt;return true}
    let incoming=null,enter=null,exit=null;
    const decode=target=>target.decode?target.decode():new Promise((resolve,reject)=>{target.onload=resolve;target.onerror=reject});
    try{
      incoming=new Image();incoming.alt=alt||'';incoming.decoding='async';incoming.src=src;await decode(incoming);
      const frameBox=frame.getBoundingClientRect(),imageBox=image.getBoundingClientRect();
      incoming.className='carousel-slide-overlay';
      Object.assign(incoming.style,{top:`${imageBox.top-frameBox.top}px`,left:`${imageBox.left-frameBox.left}px`,width:`${imageBox.width}px`,height:`${imageBox.height}px`,objectFit:getComputedStyle(image).objectFit,objectPosition:getComputedStyle(image).objectPosition,borderRadius:getComputedStyle(image).borderRadius,willChange:'transform',transform:`translateX(${direction>0?100:-100}%)`});
      frame.appendChild(incoming);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const offset=direction>0?100:-100,easing='cubic-bezier(.22,.61,.36,1)',duration=850;
      enter=incoming.animate([{transform:`translateX(${offset}%)`},{transform:'translateX(0)'}],{duration,easing,fill:'forwards'});
      exit=image.animate([{transform:'translateX(0)'},{transform:`translateX(${-offset}%)`}],{duration,easing,fill:'forwards'});
      await Promise.all([enter.finished,exit.finished]);
      for(const attribute of image.attributes){
        if(!['src','srcset','style','class','id','alt'].includes(attribute.name))incoming.setAttribute(attribute.name,attribute.value);
      }
      incoming.id=image.id;incoming.className=image.className;incoming.alt=alt||image.alt;incoming.style.cssText='';
      enter.cancel();exit.cancel();image.replaceWith(incoming);incoming=null;return true;
    }catch(error){enter?.cancel();exit?.cancel();incoming?.remove();console.warn('Carousel image failed to load:',src,error);return false}
  }
  window.animatePublicCarousel=(frame,image,src,alt='',direction=1,onDone)=>{
    if(!frame||!image||!src){onDone?.(false);return}
    let state=transitions.get(frame);
    const request={frame,image,src,alt,direction,onDone};
    if(state){state.queue.push(request);return}
    state={queue:[]};transitions.set(frame,state);
    const run=async current=>{
      frame.dataset.carouselAnimating='true';
      const activeImage=frame.querySelector('img')||current.image;
      const loaded=(activeImage.currentSrc||activeImage.src)===new URL(current.src,document.baseURI).href?true:await animateOnce(frame,activeImage,current.src,current.alt,current.direction);
      const next=state.queue.shift();
      if(next){current.onDone?.(loaded);run(next);return}
      transitions.delete(frame);frame.dataset.carouselAnimating='false';current.onDone?.(loaded);
    };
    run(request);
  };
  let swipeStart=null;
  document.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'||event.target.closest?.('button,a,input,select,textarea'))return;const frame=event.target.closest?.('[data-hero-stage],[data-home-carousel]');if(frame)swipeStart={frame,x:event.clientX,y:event.clientY}},{passive:true,capture:true});
  document.addEventListener('pointerup',event=>{const start=swipeStart;swipeStart=null;if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)<40||Math.abs(dx)<Math.abs(dy)*1.2)return;step(start.frame,dx<0?1:-1)},{passive:true,capture:true});
  document.addEventListener('pointercancel',()=>{swipeStart=null},{passive:true,capture:true});
})();
