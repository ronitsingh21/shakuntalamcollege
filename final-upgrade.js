/* ================================================================
   SHAKUNTALAM COLLEGE — FINAL ACADEMIC ERP UI UPGRADE
   Adds hierarchy, gallery, profile administration, subject attendance,
   semester result workflow, photo avatars and fee-row removal.
   ================================================================ */
(function(){
  const TAXONOMY = [
    {id:'teacher-education', name:'Department of Teachers Education', courses:[
      {id:'bed',name:'B.Ed.',semesters:4},{id:'deled',name:'D.El.Ed.',semesters:4}
    ]},
    {id:'management', name:'Department of Management', courses:[
      {id:'bba',name:'BBA',semesters:6},{id:'bca',name:'BCA',semesters:6}
    ]},
    {id:'industrial-training', name:'Department of Industrial Training', courses:[
      {id:'electrician',name:'Electrician',semesters:4},{id:'fitter',name:'Fitter',semesters:4}
    ]}
  ];
  const deptForCourse = c => TAXONOMY.find(d=>d.courses.some(x=>x.name===c)) || TAXONOMY[1];
  const courseMeta = c => deptForCourse(c).courses.find(x=>x.name===c) || {id:slug(c),name:c,semesters:6};
  const deptName = c => deptForCourse(c).name;
  const semCount = c => courseMeta(c).semesters;
  function canonicalCourse(value){
    const key=String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
    if(!key)return '';
    const aliases={bed:'B.Ed.',bachelorofeducation:'B.Ed.',deled:'D.El.Ed.',diplomainelementaryeducation:'D.El.Ed.',bba:'BBA',bachelorofbusinessadministration:'BBA',bca:'BCA',bachelorofcomputerapplication:'BCA',bachelorofcomputerapplications:'BCA',electrician:'Electrician',fitter:'Fitter'};
    if(aliases[key])return aliases[key];
    if(key.includes('bachelorofeducation')||key.startsWith('bed'))return 'B.Ed.';
    if(key.includes('diplomainelementaryeducation')||key.startsWith('deled'))return 'D.El.Ed.';
    if(key.includes('bachelorofbusinessadministration')||key.startsWith('bba'))return 'BBA';
    if(key.includes('bachelorofcomputerapplication')||key.startsWith('bca'))return 'BCA';
    if(key.includes('electrician'))return 'Electrician';
    if(key.includes('fitter'))return 'Fitter';
    return TAXONOMY.flatMap(d=>d.courses).find(c=>c.name.toLowerCase().replace(/[^a-z0-9]/g,'')===key)?.name||'';
  }
  function studentCourse(s){
    for(const value of [s?.course,s?.courseName,s?.program,s?.courseTitle,s?.courseCode,s?.courseId,s?.trade]){const found=canonicalCourse(value);if(found)return found;}
    return '';
  }
  function studentSemester(s){
    for(const value of [s?.semester,s?.semesterName,s?.semesterNo,s?.semesterNumber,s?.currentSemester]){
      if(value===undefined||value===null||value==='')continue;
      const match=String(value).match(/\d+/);if(match)return Number(match[0]);
    }
    return 1;
  }
  const inCourseSemester=(student,course,semester)=>studentCourse(student)===canonicalCourse(course)&&studentSemester(student)===Number(semester);
  function effectiveSubjectsForCourse(course, sem){
    const d=db()||{};
    const map=d.subjectCatalog?.[course];
    const key=String(Number(sem)||1);
    if(map && Object.prototype.hasOwnProperty.call(map,key)) return Array.isArray(map[key]) ? map[key] : [];
    return subjectsForCourse(course);
  }
  const enc = v => encodeURIComponent(String(v));
  const dec = v => decodeURIComponent(String(v||''));
  const studentById = id => students().find(s=>s.id===id);
  const adminName = () => activeAdmin()?.name || currentUser()?.name || 'Administrator';

  function ensureFinal20260926(){
    const d=db()||{};
    d.students=Array.isArray(d.students)?d.students:[];
    d.teachers=Array.isArray(d.teachers)?d.teachers:[];
    /* Start the refreshed demo with an empty student/faculty roster. This is
       a one-time data migration, so accounts added by the admin afterward
       remain intact on later visits. */
    if(!d.emptyDemoRosterV1){d.students=[];d.teachers=[];d.emptyDemoRosterV1=true;try{const oldSession=JSON.parse(sessionStorage.getItem('shakuntalam_session')||'null');if(oldSession&&['student','teacher'].includes(oldSession.role))sessionStorage.removeItem('shakuntalam_session');}catch(_){}}
    d.gallery=Array.isArray(d.gallery)?d.gallery:[];
    d.profileAudit=Array.isArray(d.profileAudit)?d.profileAudit:[];
    d.subjectCatalog=d.subjectCatalog||{};
    d.site=d.site||{};
    d.site.ribbonText=typeof d.site.ribbonText==='string' ? d.site.ribbonText : 'ADMISSIONS 2026–27';
    d.site.heroSlides=Array.isArray(d.site.heroSlides)?d.site.heroSlides.filter(x=>x&&x.image):[];
    if(!d.site.heroSlides.length){d.site.heroSlides=[{image:d.site.heroImage||img.hero,title:'Academic Session 2026–27'},{image:img.campus,title:'Campus Life'},{image:img.class,title:'Learning & Practice'}];}
    d.site.heroImage=d.site.heroSlides[0].image;
    TAXONOMY.flatMap(dep=>dep.courses).forEach(c=>{
      d.subjectCatalog[c.name]=d.subjectCatalog[c.name]||{};
      for(let sem=1;sem<=c.semesters;sem++){
        const key=String(sem);
        if(!Object.prototype.hasOwnProperty.call(d.subjectCatalog[c.name],key)) d.subjectCatalog[c.name][key]=subjectsForCourse(c.name).slice();
      }
    });
    d.students.forEach((s,i)=>{
      /* Repair the original untouched demo seed: its old course and semester
         indexes were tied together, leaving nearly every course/semester empty.
         Do not remap records that an administrator has already edited. */
      const seedIndex=first.findIndex(name=>name===s.name);
      const isLegacySeed=seedIndex>=0&&s.id===`STU-2026${String(seedIndex+1).padStart(3,'0')}`&&s.course===depts[seedIndex%depts.length]&&Number(s.semester)===(seedIndex%6)+1;
      if(isLegacySeed)s.semester=Math.floor(seedIndex/depts.length)%6+1;
      const normalizedCourse=studentCourse(s); if(normalizedCourse)s.course=normalizedCourse;
      s.semester=Math.min(Math.max(studentSemester(s)||1,1),semCount(s.course));
      s.department=deptName(s.course);
      /* Keep the seeded demo student login usable after older builds marked
         the first demo record inactive. Existing admin-chosen inactive
         records remain untouched. */
      if(s.id==='STU-2026001' && s.username==='Aarav Kumar' && String(s.password)==='1001') s.status='Active';
      s.section=s.section||'A'; s.subjects=s.subjects||subjectsForCourse(s.course);
      s.photo=s.photo||''; s.sign=s.sign||'';
      s.studentId=s.studentId||s.id;
      s.email=s.email||`student${i+1}@demo.shakuntalam.edu`;
      s.phone=s.phone||''; s.dob=s.dob||''; s.fatherName=s.fatherName||''; s.motherName=s.motherName||'';
      s.results=s.results||{};
    });
    /* Older demo seeds marked every twelfth sample student inactive. Repair
       those untouched sample accounts once so the documented demo roster can
       sign in, while preserving any status changes made by an administrator. */
    if(!d.studentLoginRepairV1){
      d.students.forEach(s=>{
        const i=first.findIndex(name=>name===s.name);
        if(i>=0 && s.id===`STU-2026${String(i+1).padStart(3,'0')}` && s.username===s.name && String(s.password)===String(1001+i)) s.status='Active';
      });
      d.studentLoginRepairV1=true;
    }
    d.teachers.forEach((t,i)=>{
      t.department=t.department||teacherDepartment(t); t.photo=t.photo||''; t.sign=t.sign||''; t.email=t.email||''; t.phone=t.phone||''; t.dob=t.dob||''; t.designation=t.designation||'Faculty'; t.qualification=t.qualification||''; t.joiningDate=t.joiningDate||'';
      if(!Array.isArray(t.courses)||!t.courses.length){
        const dept=String(t.department||'').toLowerCase();
        t.courses=dept.includes('teacher')?['B.Ed.']:dept.includes('management')?(i%2?['BCA']:['BBA']):['Electrician'];
      }
    });
    d.admins=(d.admins||[]).map(a=>({...a,photo:a.photo||'',sign:a.sign||'',email:a.email||'',phone:a.phone||'',designation:a.designation||'Administrator',dob:a.dob||''}));
    if(!d.admins.length)d.admins=[{id:'ADM-001',name:'Super Administrator',username:'admin',password:'admin123',status:'Active',permissions:['all']}];
    d.gallery=d.gallery.map((g,i)=>({...g,id:g.id||`GAL-${Date.now()}-${i}`,date:g.date||todayKey(),month:g.month||new Date(g.date||Date.now()).toLocaleString('en-IN',{month:'long',year:'numeric'}),title:g.title||'Campus Photo',image:g.image||g.src||''}));
    saveDB(d);
  }
  ensureFinal20260926();

  /* Keep login feedback inside the sharp dialog (the page-level toast sits
     behind the login backdrop), and accept names, usernames or IDs reliably. */
  window.portalLogin=function(e){
    e.preventDefault();
    const rawUser=document.getElementById('loginUser')?.value||'';
    const user=rawUser.trim().replace(/\s+/g,' ').toLowerCase();
    const password=document.getElementById('loginPass')?.value.trim()||'';
    const matches=v=>String(v||'').trim().replace(/\s+/g,' ').toLowerCase()===user;
    let who=null;
    if(role==='student') who=students().find(x=>(matches(x.username)||matches(x.id)||matches(x.studentId)||matches(x.name))&&String(x.password??'').trim()===password);
    if(role==='teacher') who=teachers().find(x=>(matches(x.username)||matches(x.id))&&String(x.password??'').trim()===password);
    if(role==='admin') who=admins().find(x=>(matches(x.username)||matches(x.id))&&String(x.password??'').trim()===password);
    if(!who){showLoginError('We couldn’t find a matching account. Check your username and password, then try again.');return;}
    if(who.status==='Inactive'){showLoginError('This account is inactive. Please contact the college administrator.');return;}
    clearLoginError();setSession({role,...who});location.hash=`/portal/${role}`;closeLogin();
  };

  /* ---------- public header / navigation ---------- */
  function header(){const ribbon=escapeHtml(db()?.site?.ribbonText||'ADMISSIONS 2026–27');return `<div class="topbar admission-ticker" aria-label="${ribbon}"><div class="admission-track"><span>${ribbon}</span><span aria-hidden="true">${ribbon}</span><span aria-hidden="true">${ribbon}</span><span aria-hidden="true">${ribbon}</span><span aria-hidden="true">${ribbon}</span><span aria-hidden="true">${ribbon}</span><span aria-hidden="true">${ribbon}</span><span aria-hidden="true">${ribbon}</span></div></div><div class="contact-strip"><div class="container"><span>📍&nbsp; Sasaram, Bihar &nbsp;|&nbsp; Devi Shakuntalam Pratisthan</span><span>☎&nbsp; 9470014145 &nbsp;|&nbsp; 9939205777</span></div></div><header class="nav final-nav"><div class="container final-nav-wrap"><div class="nav-brand-row"><a class="brand brand-lockup" href="#/"><img class="brand-logo" src="${_finalLogo}" alt="Shakuntalam College logo"><span class="brand-copy"><strong>SHAKUNTALAM COLLEGE</strong><small>DEVI SHAKUNTALAM PRATHISHTHAN</small><em>ESTD 2009</em></span></a><div class="nav-actions"><a class="btn btn-gold" href="#/admissions">Apply Now</a><button class="btn btn-gold" onclick="openLogin()">Portal Login</button><button class="hamb" onclick="toggleMobile()">☰</button></div></div><div class="nav-menu-row"><nav class="links final-links"><a href="#/about">About</a><div class="nav-drop"><a href="#/admissions">Admission <b>⌄</b></a><div class="drop-menu"><a href="#/admissions">Apply Online</a><a href="#/admission-status">Application Status</a><a href="#/departments">Courses &amp; Eligibility</a><a href="#/payment">Fee Payment</a><a href="#/contact">Admission Help</a></div></div><div class="nav-drop academics-drop"><a href="#/academics">Academics <b>⌄</b></a><div class="drop-menu"><a class="has-submenu department-menu-trigger" href="#/departments" aria-haspopup="true">Departments <span>›</span></a><div class="drop-submenu department-flyout" role="menu"><div class="department-menu-row"><a class="department-row-trigger" href="#/department/teachers-education" aria-haspopup="true">Teachers Education <span>›</span></a><div class="department-course-flyout" role="menu"><a href="#/course/B.Ed.">B.Ed.</a><a href="#/course/D.El.Ed.">D.El.Ed.</a></div></div><div class="department-menu-row"><a class="department-row-trigger" href="#/department/management" aria-haspopup="true">Management <span>›</span></a><div class="department-course-flyout" role="menu"><a href="#/course/BBA">BBA</a><a href="#/course/BCA">BCA</a></div></div><div class="department-menu-row"><a class="department-row-trigger" href="#/department/industrial-training" aria-haspopup="true">Industrial Training <span>›</span></a><div class="department-course-flyout" role="menu"><a href="#/course/Electrician">Electrician</a><a href="#/course/Fitter">Fitter</a></div></div></div><a href="#/examination">Examination</a><a href="#/academics">Academic Calendar</a><a href="#/departments">Courses &amp; Eligibility</a></div></div><div class="nav-drop"><a href="#/administration">Administration <b>⌄</b></a><div class="drop-menu"><a href="#/leadership">Leadership</a><a href="#/administration">Administration</a><a href="#/centre-cell">Centre &amp; Cells</a><a href="#/faculty">Faculty</a><a href="#/contact">Contact</a></div></div><div class="nav-drop"><a href="#/students-zone">Students Zone <b>⌄</b></a><div class="drop-menu"><a href="#/admissions">Admission</a><a href="#/departments">Departments</a><a href="#/examination">Examination</a><a href="#/events">Events</a><a href="#/gallery">Gallery</a><a href="#/student-welfare">Student Welfare</a><a href="#/portal/student">Student Portal</a></div></div><a href="#/infrastructure">Infrastructure</a><a href="#/events">Events</a><a href="#/gallery">Gallery</a><a href="#/contact">Contact</a></nav></div></div><div class="mobile-menu" id="mobileMenu"><a href="#/about">About</a><a href="#/admissions">Admission</a><a href="#/academics">Academics</a><a href="#/departments">Departments</a><a href="#/administration">Administration</a><a href="#/centre-cell">Centre &amp; Cells</a><a href="#/examination">Examination</a><a href="#/notices">Notice</a><a href="#/infrastructure">Infrastructure</a><a href="#/events">Events</a><a href="#/gallery">Gallery</a><a href="#/students-zone">Students Zone</a><a href="#/contact">Contact</a></div></header>`}

  /* ---------- month-wise gallery ---------- */
  function gallery(){
    const d=db(), list=(d.gallery||[]).filter(g=>g.image); const groups={};
    list.forEach(g=>(groups[g.month||'Other']??=[]).push(g));
    const keys=Object.keys(groups).sort((a,b)=>String(b).localeCompare(String(a)));
    return page('Campus Gallery','College photographs organised month-wise for an easy visual record.',`<section class="section"><div class="container"><div class="gallery-intro card"><span class="kicker">Month-wise archive</span><h2>Shakuntalam College Gallery</h2><p class="muted">New photographs uploaded by the administrator are automatically grouped by month.</p></div>${keys.map(m=>`<div class="gallery-month"><div class="section-head"><div><span class="kicker">Photo archive</span><h2>${escapeHtml(m)}</h2></div><span class="pill">${groups[m].length} photo${groups[m].length>1?'s':''}</span></div><div class="gallery gallery-month-grid">${groups[m].map(g=>`<figure><img src="${g.image}" alt="${escapeHtml(g.title||'College photo')}"><figcaption><b>${escapeHtml(g.title||'Campus Photo')}</b><small>${escapeHtml(g.date||'')}</small></figcaption></figure>`).join('')}</div></div>`).join('')||'<div class="card empty">No gallery photographs have been uploaded yet.</div>'}</div></section>`);
  }

  /* ---------- portal sidebar / top avatar ---------- */
  function side(role,active){
    const groups=role==='admin'
      ? [['Overview',['dashboard']],['Academic',['students','teachers','results','attendance','subjects']],['Operations',['admissions','assignments','notices','events','gallery']],['Control',['website','payments','admins','profile','settings']]]
      : role==='teacher'
        ? [['Overview',['dashboard','profile']],['Academic',['students','attendance','results']],['Teaching',['assignments']]]
        : [['Overview',['dashboard','profile']],['Academic',['attendance','results','assignments']],['Services',['fees','notices']]];
    const u0=currentUser(), u=role==='teacher'?currentTeacher():role==='student'?studentById(u0?.id):activeAdmin();
    const avatar=u?.photo?`<img src="${u.photo}" alt="Profile photo">`:`<span class="avatar-initial">${escapeHtml((u?.name||'P').trim().charAt(0).toUpperCase())}</span>`;
    return `<aside class="side final-side blink-side"><div class="side-accent"></div><a class="brand portal-brand" href="#/"><span class="portal-mark"><img src="${_finalLogo}" alt="Shakuntalam College logo"></span><span class="brand-copy"><strong>SHAKUNTALAM</strong><small>COLLEGE</small><em>ESTD 2009</em></span></a><div class="side-user"><div class="side-user-avatar">${avatar}</div><div><b>${escapeHtml(u?.name||'Portal User')}</b><small>${role==='admin'?'Administrator':escapeHtml(u?.course||u?.department||role)}</small></div><span class="user-dot"></span></div><div class="side-scroll">${groups.map(([label,items])=>`<section class="side-group"><span class="side-group-label">${label}</span><nav>${items.map(i=>`<a class="${i===active?'active':''}" href="#/portal/${role}/${i}" aria-label="${titleCase(i)}"><span class="side-icon">${icon(i)}</span><span>${titleCase(i)}</span>${i===active?'<i class="active-dot"></i>':''}</a>`).join('')}</nav></section>`).join('')}</div><div class="side-bottom"><div class="side-clock"><span>${currentDateLabel()}</span><b id="portalClock">${new Date().toLocaleTimeString('en-IN')}</b></div><button class="btn side-signout" onclick="clearSession();location.hash='/'"><span>↪</span> Sign out</button></div></aside>`;
  }

  function adminStudentRoster(all){
    const rows=all.map(s=>`<tr data-student-search="${escapeHtml(`${s.name||''} ${s.id||''} ${studentCourse(s)||s.course||''} ${s.username||''}`).toLowerCase()}"><td><button class="student-name-link" onclick="showFinalStudentProfile(decodeURIComponent('${enc(s.id)}'))">${escapeHtml(s.name||'Unnamed student')}</button><small>${escapeHtml(s.username||'')}</small></td><td>${escapeHtml(studentCourse(s)||s.course||'Course not set')}</td><td>Semester ${studentSemester(s)}</td><td>${escapeHtml(s.id||'—')}</td><td><div class="row-actions"><button class="btn btn-ghost btn-sm" onclick="openFinalStudentEditor(decodeURIComponent('${enc(s.id)}'))">Edit</button><button class="btn btn-outline btn-sm" onclick="deleteFinalStudent(decodeURIComponent('${enc(s.id)}'))">Delete</button></div></td></tr>`).join('');
    return `<section class="card all-students-roster"><div class="hierarchy-head"><div><span class="kicker">Complete roster</span><h2>All Students</h2><p class="muted">Search the full student list or select a name to open the profile.</p></div><span class="pill">${all.length} records</span></div><div class="toolbar"><input type="search" placeholder="Search by name, ID, course or username" oninput="filterAdminStudentRoster(this.value)"><button class="btn btn-primary" onclick="openFinalStudentEditor()">＋ Add Student</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Course</th><th>Semester</th><th>Student ID</th><th>Actions</th></tr></thead><tbody id="adminStudentRosterBody">${rows||'<tr><td colspan="5" class="empty">No student records are available yet. Use Add Student to create the first record.</td></tr>'}</tbody></table></div></section>`;
  }
  function filterAdminStudentRoster(query){const q=String(query||'').trim().toLowerCase();document.querySelectorAll('#adminStudentRosterBody tr[data-student-search]').forEach(row=>{row.hidden=!row.dataset.studentSearch.includes(q)});}
  /* ---------- admin student hierarchy ---------- */
  function adminStudentsHierarchy(parts){
    const d=db(), all=d.students||[];
    if(parts.length===0){
      return `<div class="hierarchy-head"><div><span class="kicker">Student administration</span><h2>Students by Department</h2><p class="muted">Follow the exact academic structure: <b>Department → Course → Semester → Student Details</b>.</p></div><button class="btn btn-primary" onclick="openFinalStudentEditor()">＋ Add Student</button></div><div class="hierarchy-grid">${TAXONOMY.map(dep=>{const count=all.filter(s=>dep.courses.some(c=>c.name===studentCourse(s))).length;return `<a class="hierarchy-card dept-card" href="#/portal/admin/students/department/${enc(dep.id)}"><span class="hier-icon">🏛️</span><span class="kicker">Department</span><h3>${dep.name}</h3><strong>${count}</strong><small>Students →</small></a>`}).join('')}</div>${adminStudentRoster(all)}`;
    }
    if(parts[0]==='department'&&!parts[1])return adminStudentsHierarchy([]);
    if(parts[0]==='department'&&parts[1]&&parts.length===2){
      const dep=TAXONOMY.find(x=>x.id===dec(parts[1])); if(!dep)return adminStudentsHierarchy([]);
      return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/students">← Departments</a><span class="kicker">Department</span><h2>${dep.name}</h2></div><button class="btn btn-primary" onclick="openFinalStudentEditor('', '${escapeHtml(dep.name)}')">＋ Add Student</button></div><div class="hierarchy-grid course-grid">${dep.courses.map(c=>{const n=all.filter(s=>inCourseSemester(s,c.name,studentSemester(s))).length;return `<a class="hierarchy-card course-card-final" href="#/portal/admin/students/department/${enc(dep.id)}/course/${enc(c.id)}"><span class="hier-icon">🎓</span><span class="kicker">Course</span><h3>${c.name}</h3><strong>${n}</strong><small>${c.semesters} semesters · Open →</small></a>`}).join('')}</div>`;
    }
    if(parts[0]==='department'&&parts[2]==='course'&&parts[3]&&parts.length===4){
      const dep=TAXONOMY.find(x=>x.id===dec(parts[1])); const course=dep?.courses.find(x=>x.id===dec(parts[3])); if(!dep||!course)return adminStudentsHierarchy([]);
      return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/students/department/${enc(dep.id)}">← ${escapeHtml(dep.name)}</a><span class="kicker">Course</span><h2>${escapeHtml(course.name)}</h2><p class="muted">Choose a semester to open the student list.</p></div><button class="btn btn-primary" onclick="openFinalStudentEditor('', '${escapeHtml(dep.name)}','${escapeHtml(course.name)}')">＋ Add Student</button></div><div class="semester-grid-final">${Array.from({length:course.semesters},(_,i)=>i+1).map(s=>{const n=all.filter(x=>inCourseSemester(x,course.name,s)).length;return `<a class="semester-card-final" href="#/portal/admin/students/department/${enc(dep.id)}/course/${enc(course.id)}/semester/${s}"><span>SEMESTER ${s}</span><b>${n}</b><small>Students →</small></a>`}).join('')}</div>`;
    }
    if(parts[0]==='department'&&parts[2]==='course'&&parts[4]==='semester'&&parts[5]){
      const dep=TAXONOMY.find(x=>x.id===dec(parts[1])); const course=dep?.courses.find(x=>x.id===dec(parts[3])); const sem=Number(parts[5]); if(!dep||!course)return adminStudentsHierarchy([]);
      const list=all.filter(x=>inCourseSemester(x,course.name,sem)); const key=`${dep.id}|${course.id}|${sem}`;
      return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/students/department/${enc(dep.id)}/course/${enc(course.id)}">← ${course.name} semesters</a><span class="kicker">Student details</span><h2>${course.name} · Semester ${sem}</h2><p class="muted">${dep.name} · ${list.length} student${list.length!==1?'s':''}</p></div><button class="btn btn-primary" onclick="openFinalStudentEditor('','${escapeHtml(dep.name)}','${escapeHtml(course.name)}',${sem})">＋ Add Student</button></div><div class="table-wrap"><table class="table final-student-table"><thead><tr><th>Photo</th><th>Student</th><th>Student ID</th><th>Section</th><th>Contact</th><th>Attendance</th><th>Fees</th><th>Actions</th></tr></thead><tbody>${list.map(s=>`<tr><td>${s.photo?`<img class="table-avatar" src="${s.photo}" alt="">`:'👤'}</td><td><button class="student-name-link" onclick="showFinalStudentProfile(decodeURIComponent('${enc(s.id)}'))">${escapeHtml(s.name)}</button><small>${escapeHtml(s.username||'')}</small></td><td>${escapeHtml(s.id)}</td><td>${escapeHtml(s.section||'A')}</td><td>${escapeHtml(s.phone||'—')}<br>${escapeHtml(s.email||'—')}</td><td><b>${s.attendance||0}%</b><div><button class="mini-action" onclick="adminAdjustAttendance('${s.id}',1)">+</button><button class="mini-action" onclick="adminAdjustAttendance('${s.id}',-1)">−</button></div></td><td><span class="tag ${s.fees==='Paid'?'green':'orange'}">${escapeHtml(s.fees||'Due')}</span></td><td><div class="row-actions"><button class="btn btn-ghost btn-sm" onclick="openFinalStudentEditor('${s.id}')">Edit</button><button class="btn btn-outline btn-sm" onclick="deleteFinalStudent('${s.id}')">Delete</button></div></td></tr>`).join('')||'<tr><td colspan="8" class="empty">No students in this semester.</td></tr>'}</tbody></table></div><div class="hierarchy-key">Academic path: <b>${escapeHtml(dep.name)}</b> → <b>${escapeHtml(course.name)}</b> → <b>Semester ${sem}</b> → Student details</div><div class="modal" id="finalStudentModal"></div>`;
    }
    return adminStudentsHierarchy([]);
  }

  function openFinalStudentEditor(id='',department='',course='',semester=''){
    const d=db(), x=id?d.students.find(s=>s.id===id):null, dep=department||deptName(x?.course||course||'BBA'), crs=course||x?.course||'BBA', sem=semester||x?.semester||1;
    let modal=document.getElementById('finalStudentModal'); if(!modal){modal=document.createElement('div');modal.id='finalStudentModal';modal.className='modal';document.body.appendChild(modal)}
    modal.innerHTML=`<div class="modal-box admin-record-editor"><div class="modal-head"><div><span class="kicker">Student record</span><h2>${x?'Edit':'Add'} student</h2></div><button class="close" onclick="closeFinalStudentEditor()">×</button></div><form class="form" onsubmit="saveFinalStudent(event)"><input type="hidden" id="fsId" value="${escapeHtml(x?.id||'')}"><div class="form-grid"><label>Name<input id="fsName" value="${escapeHtml(x?.name||'')}" required></label><label>Department<select id="fsDept" onchange="refreshFinalCourseOptions()">${TAXONOMY.map(d=>`<option value="${d.id}" ${deptName(crs)===d.name?'selected':''}>${d.name}</option>`).join('')}</select></label></div><div class="form-grid"><label>Course<select id="fsCourse">${TAXONOMY.flatMap(d=>d.courses).map(c=>`<option value="${c.name}" ${crs===c.name?'selected':''}>${c.name}</option>`).join('')}</select></label><label>Semester<select id="fsSemester">${Array.from({length:6},(_,i)=>`<option value="${i+1}" ${Number(sem)===i+1?'selected':''}>Semester ${i+1}</option>`).join('')}</select></label></div><div class="form-grid"><label>Section<input id="fsSection" value="${escapeHtml(x?.section||'A')}"></label><label>DOB<input id="fsDob" type="date" value="${escapeHtml(x?.dob||'')}"></label></div><div class="form-grid"><label>Email<input id="fsEmail" type="email" value="${escapeHtml(x?.email||'')}"></label><label>Phone<input id="fsPhone" value="${escapeHtml(x?.phone||'')}"></label></div><div class="form-grid"><label>Father name<input id="fsFather" value="${escapeHtml(x?.fatherName||'')}"></label><label>Mother name<input id="fsMother" value="${escapeHtml(x?.motherName||'')}"></label></div><div class="form-grid"><label>Username<input id="fsUsername" value="${escapeHtml(x?.username||'')}" required></label><label>Password<input id="fsPassword" value="${escapeHtml(x?.password||'')}" required></label></div><div class="form-grid"><label>Photo<input id="fsPhoto" type="file" accept="image/*" onchange="readFinalImage(this,'studentPhoto')"><img id="studentPhotoPreview" class="profile-mini-img" src="${x?.photo||''}" style="${x?.photo?'':'display:none'}"></label><label>Signature<input id="fsSign" type="file" accept="image/*" onchange="readFinalImage(this,'studentSign')"><img id="studentSignPreview" class="profile-mini-img" src="${x?.sign||''}" style="${x?.sign?'':'display:none'}"></label></div><div class="form-grid"><label>Status<select id="fsStatus"><option ${x?.status!=='Inactive'?'selected':''}>Active</option><option ${x?.status==='Inactive'?'selected':''}>Inactive</option></select></label><label>Fees<select id="fsFees"><option ${x?.fees==='Paid'?'selected':''}>Paid</option><option ${x?.fees!=='Paid'?'selected':''}>Due</option></select></label></div><button class="btn btn-primary">Save Student</button></form></div>`; modal.classList.add('show');
  }
  function closeFinalStudentEditor(){document.getElementById('finalStudentModal')?.classList.remove('show')}
  function refreshFinalCourseOptions(){const dep=TAXONOMY.find(d=>d.id===document.getElementById('fsDept')?.value);if(!dep)return;const el=document.getElementById('fsCourse');el.innerHTML=dep.courses.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');}
  function readFinalImage(input,key){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{window[`_final_${key}`]=r.result;const p=document.getElementById(key==='studentPhoto'?'studentPhotoPreview':'studentSignPreview');if(p){p.src=r.result;p.style.display='block'}};r.readAsDataURL(f)}
  function saveFinalStudent(e){e.preventDefault();const d=db(),id=document.getElementById('fsId').value, existing=id?d.students.find(s=>s.id===id):null;const course=document.getElementById('fsCourse').value;const rec=existing||{id:`STU-${Date.now().toString().slice(-8)}`};rec.name=document.getElementById('fsName').value.trim();rec.department=deptName(course);rec.course=course;rec.semester=Math.min(Number(document.getElementById('fsSemester').value)||1,semCount(course));rec.section=document.getElementById('fsSection').value.trim()||'A';rec.dob=document.getElementById('fsDob').value;rec.email=document.getElementById('fsEmail').value.trim();rec.phone=document.getElementById('fsPhone').value.trim();rec.fatherName=document.getElementById('fsFather').value.trim();rec.motherName=document.getElementById('fsMother').value.trim();rec.username=document.getElementById('fsUsername').value.trim();rec.password=document.getElementById('fsPassword').value.trim();rec.status=document.getElementById('fsStatus').value;rec.fees=document.getElementById('fsFees').value;rec.studentId=rec.studentId||rec.id;rec.subjects=effectiveSubjectsForCourse(course,rec.semester);rec.attendance=Number(rec.attendance)||0;if(window._final_studentPhoto)rec.photo=window._final_studentPhoto;if(window._final_studentSign)rec.sign=window._final_studentSign;if(d.students.some(s=>s.id!==rec.id&&norm(s.username)===norm(rec.username))){toast('That student username is already in use.');return;}if(existing){d.profileAudit.push({id:'AUD-'+Date.now(),targetId:id,targetRole:'student',admin:adminName(),at:new Date().toISOString(),changes:'Student profile edited by administrator'});}else d.students.push(rec);saveDB(d);closeFinalStudentEditor();route();toast(existing?'Student profile updated.':'Student added successfully.');}
  function showFinalStudentProfile(id){
    const x=(db().students||[]).find(s=>String(s.id)===String(id));if(!x){toast('Student record could not be found.');return;}
    let modal=document.getElementById('finalStudentProfileModal');if(!modal){modal=document.createElement('div');modal.id='finalStudentProfileModal';modal.className='modal';document.body.appendChild(modal)}
    const field=(label,value)=>`<div class="profile-detail"><small>${label}</small><b>${escapeHtml(value||'—')}</b></div>`;
    const editAction=currentUser()?.role==='admin'?`<button class="btn btn-primary" onclick="document.getElementById('finalStudentProfileModal').classList.remove('show');openFinalStudentEditor(decodeURIComponent('${enc(x.id)}'))">Edit Student</button>`:'';
    modal.innerHTML=`<div class="modal-box student-profile-view"><div class="modal-head"><div><span class="kicker">Student profile</span><h2>${escapeHtml(x.name)}</h2></div><button class="close" onclick="document.getElementById('finalStudentProfileModal').classList.remove('show')">×</button></div><div class="student-profile-summary">${x.photo?`<img src="${x.photo}" alt="${escapeHtml(x.name)}">`:`<span>${escapeHtml((x.name||'S').charAt(0).toUpperCase())}</span>`}<div><b>${escapeHtml(x.id)}</b><small>${escapeHtml(studentCourse(x)||x.course||'Course not set')} · Semester ${studentSemester(x)}</small></div></div><div class="student-profile-grid">${field('Department',x.department||deptName(studentCourse(x)))}${field('Course',studentCourse(x)||x.course)}${field('Semester',`Semester ${studentSemester(x)}`)}${field('Section',x.section)}${field('Email',x.email)}${field('Phone',x.phone)}${field('Father name',x.fatherName)}${field('Mother name',x.motherName)}${field('Status',x.status||'Active')}${field('Fees',x.fees||'Due')}</div><div class="profile-view-actions"><button class="btn btn-outline" onclick="document.getElementById('finalStudentProfileModal').classList.remove('show')">Close</button>${editAction}</div></div>`;modal.classList.add('show');
  }
  function deleteFinalStudent(id){if(!confirm('Delete this student record?'))return;const d=db();d.students=d.students.filter(s=>s.id!==id);saveDB(d);route();toast('Student record deleted.');}

  /* ---------- admin teacher/admin profiles ---------- */
  function teacherAssignedCourses(t){
    const raw=Array.isArray(t?.courses)?t.courses.filter(Boolean):[];
    if(raw.length) return raw.filter(c=>TAXONOMY.some(d=>d.courses.some(x=>x.name===c)));
    return allowedCourses(t);
  }
  const teacherCoursesByDepartment=t=>{const raw=String(t?.department||'').toLowerCase().replace(/^department (of|for) /,'').trim();const dep=TAXONOMY.find(d=>{const name=d.name.toLowerCase().replace(/^department (of|for) /,'');const key=d.id.replace(/-/g,' ');return raw===name||raw===key||raw.includes(name)||raw.includes(key)||name.includes(raw)||key.includes(raw)});return raw&&dep?dep.courses.map(c=>c.name):teacherAssignedCourses(t)};
  function adminTeachersFinal(parts=[]){
    const all=teachers();
    if(parts.length===0){
      return `<div class="hierarchy-head"><div><span class="kicker">Faculty administration</span><h2>Teachers by Department</h2><p class="muted">Teachers are organized by their department. Each department view lists its faculty together.</p></div><button class="btn btn-primary" onclick="openFinalTeacherEditor()">＋ Add Teacher</button></div><div class="hierarchy-grid">${TAXONOMY.map(dep=>{const list=all.filter(t=>teacherCoursesByDepartment(t).some(c=>dep.courses.some(dc=>dc.name===c)));return `<a class="hierarchy-card dept-card" href="#/portal/admin/teachers/department/${enc(dep.id)}"><span class="hier-icon">♙</span><span class="kicker">Department</span><h3>${escapeHtml(dep.name)}</h3><strong>${list.length}</strong><small>Teachers →</small></a>`}).join('')}</div>`;
    }
    if(parts[0]==='department'&&parts[1]){
      const dep=TAXONOMY.find(x=>x.id===dec(parts[1]));if(!dep)return adminTeachersFinal([]);
      const list=all.filter(t=>teacherCoursesByDepartment(t).some(c=>dep.courses.some(dc=>dc.name===c)));
      const cards=list.map(t=>`<div class="card teacher-admin-card"><div class="profile-avatar small">${t.photo?`<img src="${t.photo}" alt="">`:'<span class="avatar-initial">'+escapeHtml((t.name||'T').charAt(0).toUpperCase())+'</span>'}</div><span class="pill">${escapeHtml(t.department||dep.name)}</span><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.designation||'Faculty')} · ${escapeHtml(t.qualification||'')}</p><p><b>Username:</b> ${escapeHtml(t.username)}</p><span class="tag ${t.status==='Active'?'green':'red'}">${escapeHtml(t.status||'Active')}</span><div class="row-actions" style="margin-top:12px"><button class="btn btn-ghost btn-sm" onclick="openFinalTeacherEditor('${escapeHtml(t.id)}')">Edit profile</button><button class="btn btn-outline btn-sm" onclick="toggleTeacher('${escapeHtml(t.id)}')">${t.status==='Active'?'Deactivate':'Activate'}</button><button class="btn btn-outline btn-sm" onclick="deleteFinalTeacher('${escapeHtml(t.id)}')">Delete</button></div></div>`).join('');
      return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/teachers">← Departments</a><span class="kicker">Faculty</span><h2>${escapeHtml(dep.name)}</h2><p class="muted">${list.length} teacher${list.length===1?'':'s'} in this department.</p></div><button class="btn btn-primary" onclick="openFinalTeacherEditor('','${escapeHtml(dep.name)}')">＋ Add Teacher</button></div><div class="cards">${cards||'<div class="card empty">No teachers are assigned to this department yet.</div>'}</div>`;
    }
    return adminTeachersFinal([]);
  }
  function openFinalTeacherEditor(id='',prefDept='',prefCourse=''){
    const d=db(),t=id?d.teachers.find(x=>x.id===id):null;let modal=document.getElementById('finalTeacherModal');if(!modal){modal=document.createElement('div');modal.id='finalTeacherModal';modal.className='modal';document.body.appendChild(modal);}
    const dep=t?.department||prefDept||'Teachers Education';
    const deptId=TAXONOMY.find(x=>dep.includes(x.name)||x.name.includes(dep))?.id||TAXONOMY[0].id;
    const assigned=teacherAssignedCourses(t||{department:dep});
    modal.innerHTML=`<div class="modal-box admin-record-editor faculty-record-editor"><div class="modal-head"><div><span class="kicker">Faculty profile</span><h2>${t?'Edit':'Add'} teacher</h2></div><button class="close" onclick="document.getElementById('finalTeacherModal').classList.remove('show')">×</button></div><form class="form" onsubmit="saveFinalTeacher(event)"><input type="hidden" id="ftId" value="${escapeHtml(t?.id||'')}"><div class="form-grid"><label>Name<input id="ftName" value="${escapeHtml(t?.name||'')}" required></label><label>Department<select id="ftDept">${TAXONOMY.map(d=>`<option value="${escapeHtml(d.name)}" ${d.id===deptId?'selected':''}>${escapeHtml(d.name)}</option>`).join('')}</select></label></div><label>Course assignment<select id="ftCourses" multiple required size="${Math.min(6,TAXONOMY.flatMap(d=>d.courses).length)}">${TAXONOMY.flatMap(d=>d.courses).map(c=>`<option value="${escapeHtml(c.name)}" ${(assigned.includes(c.name)||c.name===prefCourse)?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select><small class="muted">Hold Ctrl/Cmd to select more than one course.</small></label><div class="form-grid"><label>Designation<input id="ftDesignation" value="${escapeHtml(t?.designation||'Faculty')}"></label><label>Qualification<input id="ftQualification" value="${escapeHtml(t?.qualification||'')}"></label></div><div class="form-grid"><label>DOB<input id="ftDob" type="date" value="${escapeHtml(t?.dob||'')}"></label><label>Joining Date<input id="ftJoin" type="date" value="${escapeHtml(t?.joiningDate||'')}"></label></div><div class="form-grid"><label>Email<input id="ftEmail" value="${escapeHtml(t?.email||'')}"></label><label>Phone<input id="ftPhone" value="${escapeHtml(t?.phone||'')}"></label></div><div class="form-grid"><label>Username<input id="ftUsername" value="${escapeHtml(t?.username||'')}" required></label><label>Password<input id="ftPassword" value="${escapeHtml(t?.password||'')}" required></label></div><div class="form-grid"><label>Photo<input id="ftPhoto" type="file" accept="image/*" onchange="readFinalTeacherImage(this,'photo')"><img id="ftPhotoPreview" class="profile-mini-img" src="${t?.photo||''}" style="${t?.photo?'':'display:none'}"></label><label>Signature<input id="ftSign" type="file" accept="image/*" onchange="readFinalTeacherImage(this,'sign')"><img id="ftSignPreview" class="profile-mini-img" src="${t?.sign||''}" style="${t?.sign?'':'display:none'}"></label></div><button class="btn btn-primary">Save Teacher Profile</button></form></div>`;
    modal.classList.add('show');
  }
  function readFinalTeacherImage(input,key){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{window[`_final_teacher_${key}`]=r.result;const id=key==='photo'?'ftPhotoPreview':'ftSignPreview';const p=document.getElementById(id);if(p){p.src=r.result;p.style.display='block'}};r.readAsDataURL(f)}
  function saveFinalTeacher(e){
    e.preventDefault(); const d=db(),id=document.getElementById('ftId').value,old=id?d.teachers.find(t=>t.id===id):null;
    const t=old||{id:`TEA-${Date.now().toString().slice(-6)}`,status:'Active'}; const before=JSON.stringify({...t});
    t.name=document.getElementById('ftName').value.trim(); t.department=document.getElementById('ftDept').value;
    t.courses=[...document.getElementById('ftCourses').selectedOptions].map(o=>o.value);
    t.designation=document.getElementById('ftDesignation').value.trim(); t.qualification=document.getElementById('ftQualification').value.trim();
    t.dob=document.getElementById('ftDob').value; t.joiningDate=document.getElementById('ftJoin').value; t.email=document.getElementById('ftEmail').value.trim(); t.phone=document.getElementById('ftPhone').value.trim(); t.username=document.getElementById('ftUsername').value.trim(); t.password=document.getElementById('ftPassword').value.trim();
    if(window._final_teacher_photo)t.photo=window._final_teacher_photo; if(window._final_teacher_sign)t.sign=window._final_teacher_sign;
    if(d.teachers.some(x=>x.id!==t.id&&norm(x.username)===norm(t.username))){toast('That teacher username is already in use.');return;}
    if(!old)d.teachers.push(t); d.profileAudit=d.profileAudit||[]; d.profileAudit.push({id:'AUD-'+Date.now(),targetId:t.id,targetRole:'teacher',admin:adminName(),at:new Date().toISOString(),changes:before===JSON.stringify({...t})?'Profile created':'Profile changed by administrator'});
    saveDB(d); document.getElementById('finalTeacherModal')?.classList.remove('show'); route(); toast(old?'Teacher profile updated.':'Teacher added.');
  }
  function deleteFinalTeacher(id){if(!confirm('Delete this teacher account?'))return;const d=db();d.teachers=d.teachers.filter(t=>t.id!==id);d.profileAudit=(d.profileAudit||[]).filter(a=>!(a.targetId===id&&a.targetRole==='teacher'));saveDB(d);route();toast('Teacher account deleted.');}

  function teacherProfileV4(t){
    if(!t)return `<div class="card"><h2>Teacher account unavailable</h2><p class="muted">Ask the administrator to add or restore your teacher account.</p></div>`;
    const courses=teacherAssignedCourses(t);
    return `<div class="profile-shell"><div class="profile-hero"><div class="profile-avatar">${t.photo?`<img src="${t.photo}" alt="${escapeHtml(t.name)}">`:'👩‍🏫'}</div><div><span class="kicker">Faculty Profile</span><h2>${escapeHtml(t.name)}</h2><p>${escapeHtml(t.designation||'Faculty')} · ${escapeHtml(t.department||'Department')}</p></div></div><form class="profile-grid" onsubmit="saveTeacherSelfProfileFinal(event)"><input type="hidden" id="tpId" value="${escapeHtml(t.id)}"><label class="profile-field"><span class="pf-label">Name</span><input id="tpName" value="${escapeHtml(t.name||'')}" required></label><label class="profile-field"><span class="pf-label">Designation</span><input id="tpDesignation" value="${escapeHtml(t.designation||'Faculty')}"></label><label class="profile-field"><span class="pf-label">Qualification</span><input id="tpQualification" value="${escapeHtml(t.qualification||'')}"></label><label class="profile-field"><span class="pf-label">Date of birth</span><input id="tpDob" type="date" value="${escapeHtml(t.dob||'')}"></label><label class="profile-field"><span class="pf-label">Email</span><input id="tpEmail" type="email" value="${escapeHtml(t.email||'')}"></label><label class="profile-field"><span class="pf-label">Phone</span><input id="tpPhone" value="${escapeHtml(t.phone||'')}"></label><label class="profile-field"><span class="pf-label">Profile photo</span><input id="tpPhoto" type="file" accept="image/*" onchange="readTeacherSelfProfileImage(this)"><img id="tpPhotoPreview" class="profile-mini-img" src="${t.photo||''}" style="${t.photo?'':'display:none'}"></label><div class="profile-field"><span class="pf-label">Assigned courses</span><input value="${escapeHtml(courses.join(', ')||'No course assigned')}" disabled></div><div class="profile-actions"><button class="btn btn-primary">Save Profile</button></div></form></div>`;
  }
  function readTeacherSelfProfileImage(input){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{window._teacherSelfPhoto=r.result;const preview=document.getElementById('tpPhotoPreview');if(preview){preview.src=r.result;preview.style.display='block'}};r.readAsDataURL(f)}
  function saveTeacherSelfProfileFinal(e){e.preventDefault();const d=db(),id=document.getElementById('tpId').value,t=d.teachers.find(x=>x.id===id);if(!t){toast('Teacher account unavailable.');return;}t.name=document.getElementById('tpName').value.trim();t.designation=document.getElementById('tpDesignation').value.trim();t.qualification=document.getElementById('tpQualification').value.trim();t.dob=document.getElementById('tpDob').value;t.email=document.getElementById('tpEmail').value.trim();t.phone=document.getElementById('tpPhone').value.trim();if(window._teacherSelfPhoto)t.photo=window._teacherSelfPhoto;saveDB(d);setSession({...currentUser(),...t});route();toast('Teacher profile saved.');}

  function adminProfileFinal(){const a=activeAdmin()||admins()[0];return `<div class="profile-shell"><div class="profile-hero"><div class="profile-avatar">${a.photo?`<img src="${a.photo}" alt="">`:'⚙️'}</div><div><span class="kicker">Administrator Profile</span><h2>${escapeHtml(a.name||'Administrator')}</h2><p>${escapeHtml(a.designation||'Administrator')} · ${escapeHtml(a.username)}</p></div></div><form class="profile-grid" onsubmit="saveAdminProfileFinal(event)"><input type="hidden" id="afId" value="${a.id}"><label class="profile-field"><span class="pf-label"><i>👤</i>Name</span><input id="afName" value="${escapeHtml(a.name||'')}" required></label><label class="profile-field"><span class="pf-label"><i>💼</i>Designation</span><input id="afDesignation" value="${escapeHtml(a.designation||'Administrator')}"></label><label class="profile-field"><span class="pf-label"><i>✉️</i>Email</span><input id="afEmail" value="${escapeHtml(a.email||'')}"></label><label class="profile-field"><span class="pf-label"><i>📞</i>Phone</span><input id="afPhone" value="${escapeHtml(a.phone||'')}"></label><label class="profile-field"><span class="pf-label"><i>🔑</i>Username</span><input id="afUser" value="${escapeHtml(a.username||'')}"></label><label class="profile-field"><span class="pf-label"><i>🔒</i>Password</span><input id="afPass" value="${escapeHtml(a.password||'')}"></label><label class="profile-field"><span class="pf-label"><i>📷</i>Photo</span><input id="afPhoto" type="file" accept="image/*" onchange="readAdminFinalImage(this)"><img id="afPhotoPreview" class="profile-mini-img" src="${a.photo||''}" style="${a.photo?'':'display:none'}"></label><div class="profile-actions"><button class="btn btn-primary">Save Admin Profile</button></div></form></div>`}
  function readAdminFinalImage(input){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{window._final_admin_photo=r.result;const p=document.getElementById('afPhotoPreview');p.src=r.result;p.style.display='block'};r.readAsDataURL(f)}
  function saveAdminProfileFinal(e){e.preventDefault();const d=db(),id=document.getElementById('afId').value,a=d.admins.find(x=>x.id===id);if(!a)return;a.name=document.getElementById('afName').value.trim();a.designation=document.getElementById('afDesignation').value.trim();a.email=document.getElementById('afEmail').value.trim();a.phone=document.getElementById('afPhone').value.trim();a.username=document.getElementById('afUser').value.trim();a.password=document.getElementById('afPass').value.trim();if(window._final_admin_photo)a.photo=window._final_admin_photo;saveDB(d);setSession({...currentUser(),...a});route();toast('Administrator profile updated.');}

  /* ---------- teacher semester attendance landing ---------- */
  function teacherAttendanceFinal(parts){
    const t=currentTeacher(), allowed=teacherCoursesByDepartment(t), mine=students().filter(s=>allowed.includes(studentCourse(s)));
    if(parts.length===0){return `<div class="hierarchy-head"><div><span class="kicker">Attendance control</span><h2>Course-wise Attendance</h2><p class="muted">First choose a course, then a semester. Teachers can submit a subject only once; after submission it is locked for the teacher.</p></div></div><div class="hierarchy-grid course-grid">${allowed.map(c=>{const meta=courseMeta(c),n=mine.filter(s=>studentCourse(s)===c).length;return `<a class="hierarchy-card" href="#/portal/teacher/attendance/course/${enc(meta.id)}"><span class="hier-icon">📚</span><span class="kicker">Course</span><h3>${c}</h3><strong>${n}</strong><small>${meta.semesters} semesters · Open →</small></a>`}).join('')}</div>`}
    if(parts[0]==='course'&&parts[1]&&parts.length===2){const course=allowed.map(courseMeta).find(c=>c.id===dec(parts[1]));if(!course)return teacherAttendanceFinal([]);return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/teacher/attendance">← Courses</a><span class="kicker">Course</span><h2>${course.name}</h2><p class="muted">Choose a semester.</p></div></div><div class="semester-grid-final">${Array.from({length:course.semesters},(_,i)=>i+1).map(s=>{const n=mine.filter(x=>inCourseSemester(x,course.name,s)).length;return `<a class="semester-card-final" href="#/portal/teacher/attendance/course/${enc(course.id)}/semester/${s}"><span>SEMESTER ${s}</span><b>${n}</b><small>Students →</small></a>`}).join('')}</div>`}
    if(parts[0]==='course'&&parts[2]==='semester'&&parts[3]){const course=allowed.map(courseMeta).find(c=>c.id===dec(parts[1]));const sem=Number(parts[3]);if(!course)return teacherAttendanceFinal([]);const list=mine.filter(x=>inCourseSemester(x,course.name,sem));const subjects=[...new Set(list.flatMap(x=>effectiveSubjectsForCourse(course.name,sem)))];const sel=window._attendanceSubject&&subjects.includes(window._attendanceSubject)?window._attendanceSubject:(subjects[0]||'Core Subject');const d=db(),today=todayKey(),r=scopedAttendanceRecord(d,course.name,sem,sel),submitted=!!r.submitted,marked=list.filter(x=>['P','A'].includes(r.records?.[x.id])).length;const rows=list.map(x=>{const st=r.records?.[x.id]||'';const stats=studentSubjectStats(x)[sel]||{pct:0};return `<tr><td>${x.photo?`<img class="table-avatar" src="${x.photo}" alt="">`:'👤'}</td><td><button class="student-name-link" onclick="showFinalStudentProfile(decodeURIComponent('${enc(x.id)}'))">${escapeHtml(x.name)}</button><small>${escapeHtml(x.id)}</small></td><td>${escapeHtml(x.section||'A')}</td><td>${stats.pct}%</td><td><span class="att-state ${st==='P'?'present':st==='A'?'absent':st==='H'?'holiday':''}">${st||'Not marked'}</span></td><td><button class="att-action present" ${submitted?'disabled':''} onclick="setSubjectAttendance('${x.id}','${escapeHtml(sel)}','P');">Present</button><button class="att-action absent" ${submitted?'disabled':''} onclick="setSubjectAttendance('${x.id}','${escapeHtml(sel)}','A');">Absent</button></td></tr>`}).join('');return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/teacher/attendance/course/${enc(course.id)}">← ${course.name} semesters</a><span class="kicker">Academic attendance</span><h2>${course.name} · Semester ${sem}</h2><p class="muted">${escapeHtml(t?.department||'Department')} · ${list.length} students</p></div><div class="attendance-submit-actions"><button class="btn btn-outline" ${submitted?'disabled':''} onclick="markAllSubjectPresent()">✓ Mark All Present</button><button class="btn btn-primary" ${submitted||marked<list.length?'disabled':''} onclick="submitTeacherSubjectAttendance()">Submit Attendance</button></div></div><div class="attendance-controls-grid"><label>Subject<select onchange="window._attendanceSubject=this.value;route()">${subjects.map(s=>`<option ${s===sel?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></label><label>Day type<select onchange="setTeacherDayStatus(this.value)" ${submitted?'disabled':''}><option ${r.status==='Working Day'?'selected':''}>Working Day</option><option ${r.status==='Holiday'?'selected':''}>Holiday</option></select></label></div><div class="attendance-submit-status ${submitted?'submitted':''}">${submitted?'✓ Submitted and locked for this teacher.':`Mark all ${list.length} students for <b>${escapeHtml(sel)}</b>, then submit.`}</div><div class="attendance-legend"><span>🟢 Present</span><span>🔴 Absent</span><span>🟡 Working Day</span><span>🔵 Holiday</span></div><div class="table-wrap"><table class="table"><thead><tr><th>Photo</th><th>Student</th><th>Section</th><th>Subject %</th><th>Today</th><th>Mark</th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty">No students in this semester.</td></tr>'}</tbody></table></div>`}
    return teacherAttendanceFinal([]);
  }

  /* ---------- teacher result workflow: course → semester → students → subject marks ---------- */
  function teacherResultsFinal(parts){
    const t=currentTeacher(), allowed=teacherAssignedCourses(t), mine=students().filter(s=>allowed.includes(studentCourse(s)));
    if(parts.length===0)return `<div class="hierarchy-head"><div><span class="kicker">Marks & results</span><h2>Course-wise Result Management</h2><p class="muted">Choose course → semester → student academic record → subject-wise marks.</p></div></div><div class="hierarchy-grid course-grid">${allowed.map(c=>`<a class="hierarchy-card" href="#/portal/teacher/results/course/${enc(courseMeta(c).id)}"><span class="hier-icon">📖</span><span class="kicker">Course</span><h3>${c}</h3><strong>${mine.filter(s=>studentCourse(s)===c).length}</strong><small>Open course →</small></a>`).join('')}</div>`;
    const course=allowed.map(courseMeta).find(c=>c.id===dec(parts[1]));if(!course)return teacherResultsFinal([]);
    if(parts[0]==='course'&&parts.length===2)return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/teacher/results">← Courses</a><span class="kicker">Course</span><h2>${course.name}</h2><p class="muted">Select the semester for marks entry.</p></div></div><div class="semester-grid-final">${Array.from({length:course.semesters},(_,i)=>i+1).map(s=>`<a class="semester-card-final" href="#/portal/teacher/results/course/${enc(course.id)}/semester/${s}"><span>SEMESTER ${s}</span><b>${mine.filter(x=>inCourseSemester(x,course.name,s)).length}</b><small>Academic students →</small></a>`).join('')}</div>`;
    const sem=Number(parts[3]);if(parts[2]==='semester'&&parts.length===4){const list=mine.filter(x=>inCourseSemester(x,course.name,sem));return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/teacher/results/course/${enc(course.id)}">← Semesters</a><span class="kicker">Academic landing</span><h2>${course.name} · Semester ${sem}</h2><p class="muted">Select a student to enter subject-wise marks.</p></div></div><div class="academic-student-grid">${list.map(x=>`<a class="academic-student-card" href="#/portal/teacher/results/course/${enc(course.id)}/semester/${sem}/student/${enc(x.id)}"><div class="profile-avatar small">${x.photo?`<img src="${x.photo}" alt="">`:'👤'}</div><div><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.id)} · Section ${escapeHtml(x.section||'A')}</small><span>${(effectiveSubjectsForCourse(course.name,sem)).length} subjects</span></div><strong>→</strong></a>`).join('')||'<div class="card empty">No students in this semester.</div>'}</div>`;}
    const sid=parts[5];if(parts[4]==='student'&&sid){const x=studentById(dec(sid));if(!x)return teacherResultsFinal([]);const subs=effectiveSubjectsForCourse(x.course,sem), result=x.results=x.results||{};result['Sem'+sem]=result['Sem'+sem]||{subjects:{}};const r=result['Sem'+sem];return `<div class="result-editor"><div class="result-header"><div><a class="back-link" href="#/portal/teacher/results/course/${enc(course.id)}/semester/${sem}">← Semester students</a><span class="kicker">Subject-wise marks</span><h2>${escapeHtml(x.name)} · Semester ${sem}</h2><p class="muted">${escapeHtml(x.course)} · ${escapeHtml(x.id)}</p></div><span class="pill">${subs.length} subjects</span></div><form class="card" onsubmit="saveSubjectMarksFinal(event,'${escapeHtml(x.id)}',${sem})"><div class="marks-grid">${subs.map((sub,i)=>`<label><span>${escapeHtml(sub)}</span><input type="number" min="0" max="100" id="mark_${i}" value="${Number(r.subjects?.[sub]||0)}"><small>Marks out of 100</small></label>`).join('')}</div><button class="btn btn-primary">Save &amp; Publish Marks</button></form></div>`;}
    return teacherResultsFinal([]);
  }
  function saveSubjectMarksFinal(e,id,sem){e.preventDefault();const d=db(),x=d.students.find(s=>s.id===id);if(!x)return;const subs=effectiveSubjectsForCourse(x.course,sem);x.results=x.results||{};x.results['Sem'+sem]=x.results['Sem'+sem]||{subjects:{}};subs.forEach((s,i)=>x.results['Sem'+sem].subjects[s]=Math.max(0,Math.min(100,Number(document.getElementById(`mark_${i}`)?.value)||0)));const vals=Object.values(x.results['Sem'+sem].subjects),avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;x.results['Sem'+sem].average=Math.round(avg);x.results['Sem'+sem].Grade=avg>=80?'A+':avg>=70?'A':avg>=60?'B':avg>=50?'C':avg>=40?'D':'F';saveDB(d);route();toast('Subject-wise marks saved and published to the student result page.');}

  /* ---------- student results / attendance / profile ---------- */
  function studentResultsFinal(x){return `<div class="section-head"><div><span class="kicker">Academic records</span><h2>Semester-wise Results</h2><p class="muted">Each semester opens as a separate result page.</p></div></div><div class="result-sem-grid">${Array.from({length:semCount(x.course)},(_,i)=>i+1).map(s=>{const r=x.results?.['Sem'+s];return `<a class="result-sem-card" href="#/portal/student/result-${s}"><span>SEM ${s}</span><h3>Semester ${s}</h3><p>${r?.Grade?`Grade: ${escapeHtml(r.Grade)}`:'Result pending'}</p><b>Open Result →</b></a>`}).join('')}</div>`}
  function studentResultFinalPage(x,sem){const r=x.results?.['Sem'+sem]||{subjects:{},Grade:'Pending'};const subs=effectiveSubjectsForCourse(x.course,sem);return `<div class="result-page"><div class="result-header"><div><a class="back-link" href="#/portal/student/results">← All Semesters</a><span class="kicker">Academic Result</span><h2>${escapeHtml(x.course)} · Semester ${sem}</h2><p>${escapeHtml(x.name)} · ${escapeHtml(x.id)}</p></div><span class="pill">Grade ${escapeHtml(r.Grade||'Pending')}</span></div><div class="result-sheet"><div class="result-student"><b>Student</b><span>${escapeHtml(x.name)}</span><b>Course</b><span>${escapeHtml(x.course)}</span><b>Semester</b><span>${sem}</span><b>Average</b><span>${r.average??'—'}</span></div><table class="table"><thead><tr><th>Subject</th><th>Marks</th><th>Status</th></tr></thead><tbody>${subs.map(s=>{const m=r.subjects?.[s];return `<tr><td>${escapeHtml(s)}</td><td><b>${m??'—'}</b>/100</td><td>${m===undefined?'<span class="tag orange">Pending</span>':m>=40?'<span class="tag green">Pass</span>':'<span class="tag red">Needs improvement</span>'}</td></tr>`}).join('')}</tbody></table></div></div>`}
  function studentAttendanceFinal(x){const stats=studentSubjectStats(x), alerts=todaySubjectNotice(x);return `<div class="attendance-alert ${alerts.length?'show':''}">${alerts.length?`⚠️ <b>Absent today:</b> You are absent in ${alerts.map(escapeHtml).join(', ')}.`:'✓ No absence alert for today.'}</div><div class="section-head"><div><span class="kicker">Subject-wise Attendance</span><h2>Attendance by Subject</h2><p class="muted">Working days and holidays are excluded from the percentage calculation. Your teachers submit attendance subject-wise.</p></div></div><div class="subject-attendance-grid">${Object.entries(stats).map(([s,v])=>`<article class="subject-att-card"><div class="subject-icon">📚</div><div><h3>${escapeHtml(s)}</h3><p><span>Present <b>${v.p}</b></span><span>Absent <b>${v.a}</b></span></p><div class="progress"><i style="width:${v.pct}%"></i></div><strong>${v.pct}%</strong><small>${v.w} working-day entries · ${v.h} holiday entries</small></div></article>`).join('')}</div>`}
  function studentProfileFinal(x){const audits=(db().profileAudit||[]).filter(a=>a.targetId===x.id).slice(-5).reverse();return `<div class="profile-shell"><div class="profile-hero"><div class="profile-avatar">${x.photo?`<img src="${x.photo}" alt="">`:'👨‍🎓'}</div><div><span class="kicker">Student Profile</span><h2>${escapeHtml(x.name)}</h2><p>${escapeHtml(x.department||deptName(x.course))} · ${escapeHtml(x.course)} · Semester ${x.semester}</p></div></div><div class="profile-grid"><div class="profile-field"><span class="pf-label"><i>👤</i>Name</span><input value="${escapeHtml(x.name)}" disabled></div><div class="profile-field"><span class="pf-label"><i>🏛️</i>Department</span><input value="${escapeHtml(x.department||deptName(x.course))}" disabled></div><div class="profile-field"><span class="pf-label"><i>🎓</i>Course</span><input value="${escapeHtml(x.course)}" disabled></div><div class="profile-field"><span class="pf-label"><i>▣</i>Section</span><input value="${escapeHtml(x.section||'A')}" disabled></div><div class="profile-field"><span class="pf-label"><i>🎂</i>DOB</span><input value="${escapeHtml(x.dob||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>✉️</i>Email</span><input value="${escapeHtml(x.email||'')}" disabled></div><div class="profile-field wide"><span class="pf-label"><i>📚</i>Subjects enrolled for the semester</span><input value="${escapeHtml((x.subjects||[]).join(', '))}" disabled></div><div class="profile-field"><span class="pf-label"><i>📞</i>Phone</span><input value="${escapeHtml(x.phone||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>🔑</i>Username</span><input value="${escapeHtml(x.username||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>🔒</i>Password</span><input value="${escapeHtml(x.password||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>👨</i>Father Name</span><input value="${escapeHtml(x.fatherName||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>👩</i>Mother Name</span><input value="${escapeHtml(x.motherName||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>🆔</i>Student ID</span><input value="${escapeHtml(x.id)}" disabled></div><div class="profile-field"><span class="pf-label"><i>✍️</i>Signature</span>${x.sign?`<img class="profile-signature" src="${x.sign}" alt="Signature">`:'<span class="muted">Not uploaded</span>'}</div></div><div class="card"><span class="kicker">Profile change history</span><h3>Administrator updates</h3>${audits.map(a=>`<p class="audit-row"><b>${escapeHtml(a.admin)}</b> · ${new Date(a.at).toLocaleString('en-IN')}<br><small>${escapeHtml(a.changes||'Profile updated')}</small></p>`).join('')||'<p class="muted">No administrator profile changes recorded.</p>'}</div></div>`}


  function studentProfileFinal(x){const audits=(db().profileAudit||[]).filter(a=>a.targetId===x.id).slice(-5).reverse();return `<div class="profile-shell"><div class="profile-hero"><div class="profile-avatar">${x.photo?`<img src="${x.photo}" alt="">`:'👨‍🎓'}</div><div><span class="kicker">Student Profile</span><h2>${escapeHtml(x.name)}</h2><p>${escapeHtml(x.department||deptName(x.course))} · ${escapeHtml(x.course)} · Semester ${x.semester}</p></div></div><form class="profile-grid" onsubmit="saveFinalStudentSelf(event)"><input type="hidden" id="selfStudentId" value="${x.id}"><div class="profile-field"><span class="pf-label"><i>👤</i>Name</span><input value="${escapeHtml(x.name)}" disabled></div><div class="profile-field"><span class="pf-label"><i>🏛️</i>Department</span><input value="${escapeHtml(x.department||deptName(x.course))}" disabled></div><div class="profile-field"><span class="pf-label"><i>🎓</i>Course</span><input value="${escapeHtml(x.course)}" disabled></div><div class="profile-field"><span class="pf-label"><i>▣</i>Section</span><input value="${escapeHtml(x.section||'A')}" disabled></div><div class="profile-field"><span class="pf-label"><i>🎂</i>DOB</span><input value="${escapeHtml(x.dob||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>✉️</i>Email</span><input id="selfEmail" type="email" value="${escapeHtml(x.email||'')}"></div><div class="profile-field wide"><span class="pf-label"><i>📚</i>Subjects enrolled for the semester</span><input value="${escapeHtml((x.subjects||[]).join(', '))}" disabled></div><div class="profile-field"><span class="pf-label"><i>📞</i>Phone</span><input id="selfPhone" value="${escapeHtml(x.phone||'')}"></div><div class="profile-field"><span class="pf-label"><i>🔑</i>Username</span><input value="${escapeHtml(x.username||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>🔒</i>Password</span><input id="selfPassword" value="${escapeHtml(x.password||'')}"></div><div class="profile-field"><span class="pf-label"><i>👨</i>Father Name</span><input value="${escapeHtml(x.fatherName||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>👩</i>Mother Name</span><input value="${escapeHtml(x.motherName||'')}" disabled></div><div class="profile-field"><span class="pf-label"><i>🆔</i>Student ID</span><input value="${escapeHtml(x.id)}" disabled></div><label class="profile-field"><span class="pf-label"><i>📷</i>Profile / Login Photo</span><input id="selfPhoto" type="file" accept="image/*" onchange="readSelfStudentImage(this,'photo')"><img id="selfPhotoPreview" class="profile-mini-img" src="${x.photo||''}" style="${x.photo?'':'display:none'}"></label><label class="profile-field"><span class="pf-label"><i>✍️</i>Signature</span><input id="selfSign" type="file" accept="image/*" onchange="readSelfStudentImage(this,'sign')"><img id="selfSignPreview" class="profile-mini-img" src="${x.sign||''}" style="${x.sign?'':'display:none'}"></label><div class="profile-actions"><button class="btn btn-primary">Save My Profile</button></div></form><div class="card"><span class="kicker">Profile change history</span><h3>Administrator updates</h3>${audits.map(a=>`<p class="audit-row"><b>${escapeHtml(a.admin)}</b> · ${new Date(a.at).toLocaleString('en-IN')}<br><small>${escapeHtml(a.changes||'Profile updated')}</small></p>`).join('')||'<p class="muted">No administrator profile changes recorded.</p>'}</div></div>`}
  function readSelfStudentImage(input,key){const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{window[`_self_student_${key}`]=r.result;const p=document.getElementById(key==='photo'?'selfPhotoPreview':'selfSignPreview');if(p){p.src=r.result;p.style.display='block'}};r.readAsDataURL(f)}
  function saveFinalStudentSelf(e){e.preventDefault();const d=db(),id=document.getElementById('selfStudentId').value,x=d.students.find(s=>s.id===id);if(!x)return;x.email=document.getElementById('selfEmail').value.trim();x.phone=document.getElementById('selfPhone').value.trim();x.password=document.getElementById('selfPassword').value.trim();if(window._self_student_photo)x.photo=window._self_student_photo;if(window._self_student_sign)x.sign=window._self_student_sign;saveDB(d);setSession({...currentUser(),...x});route();toast('Student profile and login photo updated.');}
  /* ---------- fee table: paid rows disappear ---------- */
  function studentFeesFinal(x){const d=db(),paid=x.feeLedger||{},fees=semesterFees(x).filter(f=>f.sem<=semCount(x.course)),unpaid=fees.filter(f=>paid[f.sem]!=='Paid');return `<div class="fee-shell"><div class="fee-head"><div><span class="kicker">Academic Fee</span><h2>Semester-wise Fee Payment</h2><p class="muted">Paid semesters are automatically removed from the payable table.</p></div><div class="student-chip">${escapeHtml(x.course)} · Sem ${x.semester}</div></div><div class="fee-table"><div class="fee-row fee-header"><div>Select</div><div>Semester</div><div>Fee BreakUp</div><div>Payable</div><div>Status</div></div>${unpaid.map(f=>`<div class="fee-row" data-fee-sem="${f.sem}"><div><input class="fee-check" type="checkbox" data-sem="${f.sem}" data-amount="${f.amount}" onchange="updateFeeTotal()"></div><div><b>Semester ${f.sem}</b><small>Academic fee</small></div><div><button class="breakup-btn" onclick="toggleFeeBreakup(this,${f.sem},${f.amount})">Show Fee BreakUp</button><div class="fee-breakup-dropdown"><div>Tuition Fee <b>₹${Math.round(f.amount*.8).toLocaleString('en-IN')}</b></div><div>Development / Services <b>₹${Math.round(f.amount*.2).toLocaleString('en-IN')}</b></div></div></div><div>₹${f.amount.toLocaleString('en-IN')}</div><div><span class="tag orange">Payable</span></div></div>`).join('')||'<div class="empty">All currently configured semester fees have been paid.</div>'}<div class="fee-total"><span>Total selected</span><strong id="feeTotal">₹0</strong></div></div><div class="pay-action-row"><div><span>Total</span><strong id="feeTotal2">₹0</strong></div><button class="pay-now-btn" onclick="openStudentGatewayV3()">Pay Now</button></div><div class="card paid-history"><h3>Payment history</h3>${(d.payments||[]).filter(p=>p.studentId===x.id).slice(0,8).map(p=>`<div class="payment-history-row"><span><b>${escapeHtml(p.id)}</b><small>${new Date(p.date).toLocaleString('en-IN')}</small></span><span>${escapeHtml(p.method)}</span><strong>₹${Number(p.amount||0).toLocaleString('en-IN')}</strong><span class="tag green">${escapeHtml(p.status)}</span></div>`).join('')||'<p class="muted">No payments recorded yet.</p>'}</div></div><div class="modal" id="gatewayModal"><div class="gateway-box"><div class="gateway-top"><div><span class="kicker">Shakuntalam College</span><h2>Fee Payment Gateway</h2></div><button class="close" onclick="closeGateway()">×</button></div><div class="gateway-total">Total <strong id="gatewayTotal">₹0</strong></div><div id="gatewayBody"></div></div></div>`}
  function completeDemoPaymentFinal(method,e){if(e)e.preventDefault();const me=currentUser(),d=db(),amount=Number(String(document.getElementById('gatewayTotal')?.textContent||'0').replace(/[^0-9.]/g,'')),sems=window._selectedFeeSems||[],id='PAY-'+Date.now().toString().slice(-8),st=d.students.find(x=>x.id===me.id);d.payments=d.payments||[];d.payments.unshift({id,studentId:me.id,studentName:me.name,amount,method,status:'Success',date:new Date().toISOString(),semesters:sems.slice(),upi:d.paymentConfig?.upi||''});st.feeLedger=st.feeLedger||{};sems.forEach(s=>st.feeLedger[s]='Paid');st.fees=semesterFees(st).some(f=>st.feeLedger[f.sem]!=='Paid')?'Due':'Paid';saveDB(d);closeGateway();route();toast(`Payment successful. Receipt ${id} saved.`)}


  function adminPaymentsFinal(){const d=db(),cfg=d.paymentConfig||{},fees=cfg.semesterFees||{};return `<div class="dash-grid"><div class="metric"><b>${escapeHtml(cfg.upi||'shakuntalam@upi')}</b><small>Connected UPI</small></div><div class="metric"><b>${(d.payments||[]).length}</b><small>Transactions</small></div><div class="metric"><b>Editable</b><small>Course fees</small></div><div class="metric"><b>Live demo</b><small>Gateway mode</small></div></div><div class="feature-grid"><div class="card"><span class="kicker">Payment Gateway</span><h2>UPI & QR settings</h2><form class="form" onsubmit="savePaymentConfig(event)"><label>UPI address<input id="cfgUpi" value="${escapeHtml(cfg.upi||'shakuntalam@upi')}" required></label><label>Merchant name<input id="cfgMerchant" value="${escapeHtml(cfg.merchant||'Shakuntalam College')}"></label><label>QR image<input id="cfgQr" type="file" accept="image/*" onchange="previewPaymentQr(this)"></label>${cfg.qr?`<img class="payment-qr admin-qr" src="${cfg.qr}" alt="UPI QR">`:''}<button class="btn btn-primary">Save Payment Settings</button></form><p class="muted" style="margin-top:10px">Students will automatically use this UPI address and QR in the fee gateway.</p></div><div class="card"><span class="kicker">Payable Fees</span><h2>Edit amount by course & semester</h2><form class="form" onsubmit="saveFeeAmountsFinal(event)">${TAXONOMY.flatMap(d=>d.courses).map(c=>`<div class="fee-config-course"><b>${escapeHtml(c.name)}</b><div class="form-grid">${Array.from({length:c.semesters},(_,i)=>`<label>Sem ${i+1}<input type="number" min="0" id="finalfee_${slug(c.name)}_${i+1}" value="${Number((fees[c.name]||[])[i]||0)}"></label>`).join('')}</div></div>`).join('')}<button class="btn btn-primary">Save All Payable Fees</button></form></div></div><div class="card" style="margin-top:18px"><h2>Payment receipts</h2><div class="receipt-list">${(d.payments||[]).map(p=>`<div class="receipt-row"><div><b>${escapeHtml(p.id)}</b><span>${escapeHtml(p.studentName||p.studentId)}</span><small>${new Date(p.date).toLocaleString('en-IN')} · ${escapeHtml(p.method)}</small></div><strong>₹${Number(p.amount||0).toLocaleString('en-IN')}</strong><button class="btn btn-ghost" onclick="printReceipt('${p.id}')">Receipt</button></div>`).join('')||'<p class="muted">No payments yet.</p>'}</div></div>`}
  function saveFeeAmountsFinal(e){e.preventDefault();const d=db();d.paymentConfig=d.paymentConfig||{};d.paymentConfig.semesterFees=d.paymentConfig.semesterFees||{};TAXONOMY.flatMap(x=>x.courses).forEach(c=>{d.paymentConfig.semesterFees[c.name]=Array.from({length:c.semesters},(_,i)=>Number(document.getElementById(`finalfee_${slug(c.name)}_${i+1}`)?.value)||0)});saveDB(d);route();toast('Course-wise payable fee amounts updated.');}
  /* ---------- gallery administration ---------- */
  function adminGalleryFinal(){const list=db().gallery||[];return `<div class="hierarchy-head"><div><span class="kicker">Gallery management</span><h2>Month-wise Photo Gallery</h2><p class="muted">Upload photographs and they will be stored under their month automatically.</p></div></div><div class="card"><form class="form" onsubmit="saveGalleryPhotoFinal(event)"><div class="form-grid"><label>Photo title<input id="galTitle" placeholder="Event / campus photo" required></label><label>Photo date<input id="galDate" type="date" value="${todayKey()}" required></label></div><label>Photo<input id="galFile" type="file" accept="image/*" required></label><button class="btn btn-primary">＋ Add Photo to Gallery</button></form></div><div class="gallery-admin-grid">${list.slice().reverse().map(g=>`<figure class="gallery-admin-card"><img src="${g.image}" alt=""><figcaption><b>${escapeHtml(g.title)}</b><small>${escapeHtml(g.month)} · ${escapeHtml(g.date)}</small><button class="btn btn-outline btn-sm" onclick="deleteGalleryPhotoFinal('${g.id}')">Delete</button></figcaption></figure>`).join('')||'<div class="card empty">No photos uploaded yet.</div>'}</div>`}
  function saveGalleryPhotoFinal(e){e.preventDefault();const f=document.getElementById('galFile').files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{const d=db(),date=document.getElementById('galDate').value||todayKey(),month=new Date(date+'T12:00:00').toLocaleString('en-IN',{month:'long',year:'numeric'});d.gallery=d.gallery||[];d.gallery.push({id:'GAL-'+Date.now(),date,month,title:document.getElementById('galTitle').value.trim(),image:r.result});saveDB(d);route();toast('Photo saved in the month-wise gallery.')};r.readAsDataURL(f)}
  function deleteGalleryPhotoFinal(id){const d=db();d.gallery=(d.gallery||[]).filter(g=>g.id!==id);saveDB(d);route();toast('Gallery photo deleted.')}


  /* ---------- public examination hub: expanded multi-page section ---------- */
  function examinationFinal(){
    const cards=[
      ['01','Examination Calendar','Semester-wise examination dates, internal assessment windows and practical schedules.','/examination/calendar'],
      ['02','Examination Notices','Important examination circulars, instructions and last dates.','/examination/notices'],
      ['03','Admit Card','Student instructions and demo admit-card access point.','/examination/admit-card'],
      ['04','Internal Assessment','Internal tests, assignments, practicals and continuous assessment information.','/examination/internal-assessment'],
      ['05','Semester Examination','Theory and practical examination process, eligibility and conduct rules.','/examination/semester-exam'],
      ['06','Results','Semester result publication, marks and grade information.','/examination/results'],
      ['07','Revaluation & Scrutiny','Application information for revaluation, scrutiny and result correction.','/examination/revaluation'],
      ['08','Academic Regulations','Attendance, passing criteria, grading and examination regulations.','/examination/regulations'],
      ['09','Downloads','Examination forms, schedules, instructions and useful documents.','/examination/downloads']
    ];
    return page('Examination','A complete examination centre for schedules, notices, assessments, results and student services.',`<section class="section exam-hub"><div class="container"><div class="exam-intro card"><span class="kicker">Examination centre</span><h2>Everything related to examinations, in one place.</h2><p class="muted">Students, teachers and administrators can use these sections to publish and access examination information. The portal continues to handle semester results and subject-wise marks.</p></div><div class="exam-page-grid">${cards.map(c=>`<a class="exam-page-card" href="#${c[3]}"><span class="exam-page-no">${c[0]}</span><span><b>${escapeHtml(c[1])}</b><small>${escapeHtml(c[2])}</small></span><strong>→</strong></a>`).join('')}</div></div></section>`);
  }
  function examinationSubPage(kind){
    const data={
      calendar:['Examination Calendar','Semester-wise academic and examination timeline.',['Semester examination schedule','Publish theory and practical dates for each course and semester.'],['Internal assessment window','Display internal test, assignment and practical submission periods.'],['Important dates','Keep application, admit-card and result publication dates visible.']],
      notices:['Examination Notices','Important examination circulars and announcements.',['Latest circulars','Administrators can publish examination notices through the notice system.'],['Student instructions','Provide reporting time, permitted materials and examination-centre instructions.'],['Last dates','Highlight deadlines for forms, fees and examination-related applications.']],
      'admit-card':['Admit Card','Examination entry information and student admit-card access.',['Student verification','Admit-card details can be connected to the student profile in the production ERP.'],['Download & print','Provide a secure downloadable admit card after verification.'],['Corrections','Students can contact the examination office for approved corrections.']],
      'internal-assessment':['Internal Assessment','Continuous assessment, assignments, practicals and internal tests.',['Internal marks','Subject-wise internal marks can be maintained by authorised teachers.'],['Assignments','Assignment submissions can contribute to internal assessment where applicable.'],['Practical work','Practical and workshop performance can be recorded with the academic result.']],
      'semester-exam':['Semester Examination','Theory and practical examination process.',['Eligibility','Display approved attendance, fee and academic eligibility requirements.'],['Conduct','Publish examination-room, timing and discipline instructions.'],['Practical examinations','Maintain separate practical schedules and examiner information.']],
      results:['Results','Semester result publication and academic performance information.',['Semester results','Students can open each semester result from the student portal.'],['Marks & grades','Results can display subject-wise marks, status, average and grade.'],['Result verification','Administration can maintain a controlled result-publication workflow.']],
      revaluation:['Revaluation & Scrutiny','Information for revaluation, scrutiny and result correction.',['Application process','Publish the application procedure and required documents.'],['Deadlines','Show the last date and applicable examination-office instructions.'],['Status tracking','A production system can provide secure application status tracking.']],
      regulations:['Academic Regulations','Examination, grading and academic regulations.',['Passing criteria','Publish approved passing requirements and subject rules.'],['Attendance rules','Display the approved attendance eligibility criteria.'],['Grading system','Explain the institution-approved marks, grades and result classifications.']],
      downloads:['Examination Downloads','Forms, schedules and examination resources.',['Schedules','Download course-wise and semester-wise examination schedules.'],['Forms','Publish approved examination forms and applications.'],['Instructions','Provide student instructions, regulations and printable resources.']]
    };
    const x=data[kind]||data.calendar;
    return page(x[0],x[1],`<section class="section"><div class="container"><a class="back-link" href="#/examination">← Examination Centre</a><div class="exam-detail-grid">${x.slice(2).map((b,i)=>`<article class="card exam-detail-card"><span class="exam-detail-no">${String(i+1).padStart(2,'0')}</span><h2>${escapeHtml(b[0])}</h2><p class="muted">${escapeHtml(b[1])}</p></article>`).join('')}</div><div class="card exam-demo-note"><span class="kicker">Portal connection</span><h3>Connected academic workflow</h3><p class="muted">Teachers manage marks in the academic portal and students can view semester results. Administrators can control the published academic record.</p><a class="btn btn-primary" href="#/portal/student/results">Open Student Results</a></div></div></section>`);
  }

  /* ---------- portal content / admin routing ---------- */
  /* ---------- full local backup / restore ---------- */
  function backupAssetInventory(data){
    const found=[];
    const seen=new WeakSet();
    function walk(value,path){
      if(!value||typeof value!=='object')return;
      if(typeof value==='object'){
        if(seen.has(value))return;
        seen.add(value);
      }
      if(Array.isArray(value)){value.forEach((v,i)=>walk(v,`${path}[${i}]`));return;}
      Object.entries(value).forEach(([k,v])=>{
        const p=path?`${path}.${k}`:k;
        if(typeof v==='string' && /^data:(image|application|audio|video)\//i.test(v)){
          const m=v.match(/^data:([^;,]+)/i);found.push({path:p,mime:m?m[1]:'application/octet-stream',bytesApprox:Math.max(0,Math.floor((v.length*3)/4))});
        } else if(v&&typeof v==='object') walk(v,p);
      });
    }
    walk(data,'db');
    return found;
  }
  function exportBackupPackage(){
    const data=db();
    if(!data){toast('No local database found to back up.');return;}
    const backup={
      format:'shakuntalam-college-backup',
      version:1,
      exportedAt:new Date().toISOString(),
      storageKey:'shakuntalam_db',
      note:'Complete browser demo backup. Uploaded images, PDFs, signatures, QR codes and other files stored as data URLs are embedded inside the database object.',
      counts:{students:(data.students||[]).length,teachers:(data.teachers||[]).length,notices:(data.notices||[]).length,assignments:(data.assignments||[]).length,gallery:(data.gallery||[]).length,results:(data.results||[]).length,payments:(data.payments||[]).length,attendanceRecords:Object.keys(data.attendanceScoped||{}).length},
      uploadedFiles:backupAssetInventory(data),
      database:data
    };
    const blob=new Blob([JSON.stringify(backup)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`shakuntalam-college-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast(`Backup exported: ${backup.uploadedFiles.length} embedded uploaded file(s).`);
  }
  function restoreBackupFile(input){
    const file=input?.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const backup=JSON.parse(reader.result);
        if(backup?.format!=='shakuntalam-college-backup' || !backup.database || typeof backup.database!=='object') throw new Error('This is not a valid Shakuntalam College backup package.');
        const d=backup.database;
        if(!Array.isArray(d.students)||!Array.isArray(d.teachers)) throw new Error('Backup validation failed: students or teachers data is missing.');
        const counts=backup.counts||{};
        const msg=`Restore this backup?\n\nExported: ${backup.exportedAt||'Unknown'}\nStudents: ${d.students.length}\nTeachers: ${d.teachers.length}\nNotices: ${(d.notices||[]).length}\nAssignments: ${(d.assignments||[]).length}\nGallery: ${(d.gallery||[]).length}\nPayments: ${(d.payments||[]).length}\nAttendance records: ${Object.keys(d.attendanceScoped||{}).length}\n\nThis will replace the current browser database with the validated backup.`;
        if(!confirm(msg))return;
        /* Normalize/migrate the restored structure before saving, preserving all embedded uploads. */
        localStorage.setItem('shakuntalam_db',JSON.stringify(d));
        ensureFinal20260926();
        clearSession();
        toast(`Backup restored successfully (${counts.students??d.students.length} students).`);
        setTimeout(()=>{location.hash='/';route();},250);
      }catch(err){toast(err.message||'Could not restore this backup.');}
      input.value='';
    };
    reader.readAsText(file);
  }
  function savePortalRibbon(e){
    e.preventDefault();
    const d=db()||{}; d.site=d.site||{};
    const value=(document.getElementById('portalRibbonText')?.value||'').trim();
    if(!value){toast('Enter ribbon text before publishing.');return;}
    d.site.ribbonText=value.slice(0,120);
    saveDB(d); route(); toast('Homepage ribbon updated.');
  }
  function adminBackupSettings(){
    const d=db()||{}; const assets=backupAssetInventory(d);
    return `<div class="settings-shell">
      <div class="settings-hero"><div><span class="kicker">Control centre</span><h2>College settings</h2><p class="muted">Manage administrator data backups and restore points.</p></div><span class="settings-live-pill">● Live demo</span></div>
      <div class="feature-grid settings-feature-grid">
        <div class="card backup-card">
          <span class="kicker">Database safety</span><h2>Backup &amp; Restore</h2>
          <p class="muted">Export the complete browser database before moving devices or clearing browser storage. The backup includes students, teachers, attendance, results, fees/payments, notices, assignments, gallery content, website settings and uploaded files stored in the demo database.</p>
          <div class="backup-stats"><span><b>${(d.students||[]).length}</b> Students</span><span><b>${(d.teachers||[]).length}</b> Teachers</span><span><b>${(d.gallery||[]).length}</b> Gallery</span><span><b>${assets.length}</b> Uploaded files</span></div>
          <div class="backup-actions"><button class="btn btn-primary" onclick="exportBackupPackage()">⬇ Export Full Backup</button><label class="btn btn-outline backup-file-label">↥ Restore Backup<input type="file" accept="application/json,.json" onchange="restoreBackupFile(this)"></label></div>
          <small class="muted">Restore validates the backup before replacing the current local database. Always export a current backup before restoring another one.</small>
        </div>
      </div>
      <div class="card settings-preserve" style="margin-top:18px"><h3>What is preserved?</h3><div class="backup-preserve-grid"><span>✓ Students &amp; credentials</span><span>✓ Teacher profiles</span><span>✓ Attendance &amp; submissions</span><span>✓ Semester results &amp; marks</span><span>✓ Fees &amp; payment history</span><span>✓ Notices &amp; links</span><span>✓ Assignments &amp; uploaded files</span><span>✓ Month-wise gallery photos</span><span>✓ Website/editor settings</span><span>✓ Payment UPI &amp; QR</span></div></div>
    </div>`;
  }

  /* ---------- admin result hierarchy: Department → Course → Semester → Edit ---------- */
  function adminResultsFinal(parts){
    const all=db().students||[];
    if(parts.length===0) return `<div class="hierarchy-head"><div><span class="kicker">Result administration</span><h2>Results by Department</h2><p class="muted">Follow the exact structure: <b>Department → Course → Semester → Edit</b>.</p></div></div><div class="hierarchy-grid">${TAXONOMY.map(dep=>{const n=all.filter(s=>dep.courses.some(c=>c.name===s.course)).length;return `<a class="hierarchy-card dept-card" href="#/portal/admin/results/department/${enc(dep.id)}"><span class="hier-icon">▥</span><span class="kicker">Department</span><h3>${dep.name}</h3><strong>${n}</strong><small>Courses →</small></a>`}).join('')}</div>`;
    if(parts[0]==='department'&&parts[1]){
      const dep=TAXONOMY.find(x=>x.id===dec(parts[1])); if(!dep)return adminResultsFinal([]);
      if(parts.length===2) return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/results">← Departments</a><span class="kicker">Department</span><h2>${dep.name}</h2><p class="muted">Select a course to continue.</p></div></div><div class="hierarchy-grid course-grid">${dep.courses.map(c=>`<a class="hierarchy-card" href="#/portal/admin/results/department/${enc(dep.id)}/course/${enc(c.id)}"><span class="hier-icon">▤</span><span class="kicker">Course</span><h3>${c.name}</h3><strong>${all.filter(s=>studentCourse(s)===c.name).length}</strong><small>${c.semesters} semesters →</small></a>`).join('')}</div>`;
      const course=dep.courses.find(c=>c.id===dec(parts[3])); if(!course)return adminResultsFinal([]);
      if(parts.length===4) return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/results/department/${enc(dep.id)}">← ${dep.name}</a><span class="kicker">Course</span><h2>${course.name}</h2><p class="muted">Choose a semester to edit results.</p></div></div><div class="semester-grid-final">${Array.from({length:course.semesters},(_,i)=>i+1).map(sem=>`<a class="semester-card-final" href="#/portal/admin/results/department/${enc(dep.id)}/course/${enc(course.id)}/semester/${sem}"><span>SEMESTER ${sem}</span><b>${all.filter(x=>inCourseSemester(x,course.name,sem)).length}</b><small>Edit results →</small></a>`).join('')}</div>`;
      const sem=Number(parts[5]); if(parts[4]==='semester'&&sem){
        const list=all.filter(x=>x.course===course.name&&Number(x.semester)===sem), subs=effectiveSubjectsForCourse(course.name,sem);
        return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/results/department/${enc(dep.id)}/course/${enc(course.id)}">← ${course.name} semesters</a><span class="kicker">Result editing</span><h2>${course.name} · Semester ${sem}</h2><p class="muted">${dep.name} · Edit subject-wise marks for students in this semester.</p></div></div><div class="table-wrap"><table class="table admin-result-table"><thead><tr><th>Student</th><th>Student ID</th><th>Result status</th><th>Average</th><th>Grade</th><th>Action</th></tr></thead><tbody>${list.map(x=>{const r=x.results?.['Sem'+sem]||{},count=Object.keys(r.subjects||{}).length;return `<tr><td><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.course)} · Section ${escapeHtml(x.section||'A')}</small></td><td>${escapeHtml(x.id)}</td><td>${count}/${subs.length} subjects entered</td><td>${r.average??'—'}</td><td>${r.Grade?`<span class="tag ${r.Grade==='F'?'red':'green'}">${escapeHtml(r.Grade)}</span>`:'<span class="tag orange">Pending</span>'}</td><td><button class="btn btn-primary btn-sm" onclick="openAdminResultEditor('${escapeHtml(x.id)}',${sem})">Edit marks</button></td></tr>`}).join('')||'<tr><td colspan="6" class="empty">No students in this semester.</td></tr>'}</tbody></table></div><div class="hierarchy-key">Academic path: <b>${escapeHtml(dep.name)}</b> → <b>${escapeHtml(course.name)}</b> → <b>Semester ${sem}</b> → Edit</div><div class="modal" id="adminResultModal"></div>`;
      }
    }
    return adminResultsFinal([]);
  }
  function openAdminResultEditor(id,sem){
    const d=db(),x=d.students.find(s=>s.id===id); if(!x)return;
    const modal=document.getElementById('adminResultModal')||document.createElement('div'); modal.id='adminResultModal'; modal.className='modal'; if(!modal.parentNode)document.body.appendChild(modal);
    const subs=effectiveSubjectsForCourse(x.course,sem),r=x.results?.['Sem'+sem]||{subjects:{}};
    modal.innerHTML=`<div class="modal-box"><div class="modal-head"><div><span class="kicker">Administrator result editor</span><h2>${escapeHtml(x.name)} · Semester ${sem}</h2><p class="muted">${escapeHtml(x.course)} · ${escapeHtml(x.id)}</p></div><button class="close" onclick="document.getElementById('adminResultModal').classList.remove('show')">×</button></div><form class="form" onsubmit="saveAdminResult(event,'${escapeHtml(id)}',${sem})"><div class="marks-grid">${subs.map((sub,i)=>`<label><span>${escapeHtml(sub)}</span><input type="number" min="0" max="100" id="admin_mark_${i}" value="${Number(r.subjects?.[sub]??'')}"><small>Marks out of 100</small></label>`).join('')}</div><div class="row-actions"><button type="button" class="btn btn-outline" onclick="document.getElementById('adminResultModal').classList.remove('show')">Cancel</button><button class="btn btn-primary">Save &amp; Publish</button></div></form></div>`; modal.classList.add('show');
  }
  function saveAdminResult(e,id,sem){e.preventDefault();const d=db(),x=d.students.find(s=>s.id===id);if(!x)return;const subs=effectiveSubjectsForCourse(x.course,sem);x.results=x.results||{};x.results['Sem'+sem]=x.results['Sem'+sem]||{subjects:{}};const r=x.results['Sem'+sem];subs.forEach((sub,i)=>{const el=document.getElementById(`admin_mark_${i}`);if(el&&el.value!=='')r.subjects[sub]=Math.max(0,Math.min(100,Number(el.value)||0));});const vals=Object.values(r.subjects||{}).map(Number).filter(v=>Number.isFinite(v));r.average=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;r.Grade=vals.length?(r.average>=80?'A+':r.average>=70?'A':r.average>=60?'B':r.average>=50?'C':r.average>=40?'D':'F'):'Pending';r.updatedBy=adminName();r.updatedAt=new Date().toISOString();saveDB(d);document.getElementById('adminResultModal')?.classList.remove('show');route();toast('Semester result updated.');}

  /* ---------- admin subject hierarchy: Department → Course → Semester → Edit ---------- */
  function adminSubjectsFinal(parts){
    if(parts.length===0) return `<div class="hierarchy-head"><div><span class="kicker">Subject administration</span><h2>Subjects by Department</h2><p class="muted">Follow the exact structure: <b>Department → Course → Semester → Edit</b>.</p></div></div><div class="hierarchy-grid">${TAXONOMY.map(dep=>`<a class="hierarchy-card dept-card" href="#/portal/admin/subjects/department/${enc(dep.id)}"><span class="hier-icon">≡</span><span class="kicker">Department</span><h3>${dep.name}</h3><small>Courses →</small></a>`).join('')}</div>`;
    if(parts[0]==='department'&&parts[1]){
      const dep=TAXONOMY.find(x=>x.id===dec(parts[1]));if(!dep)return adminSubjectsFinal([]);
      if(parts.length===2)return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/subjects">← Departments</a><span class="kicker">Department</span><h2>${dep.name}</h2><p class="muted">Select a course to manage its semester subjects.</p></div></div><div class="hierarchy-grid course-grid">${dep.courses.map(c=>`<a class="hierarchy-card" href="#/portal/admin/subjects/department/${enc(dep.id)}/course/${enc(c.id)}"><span class="hier-icon">≡</span><span class="kicker">Course</span><h3>${c.name}</h3><small>${c.semesters} semesters →</small></a>`).join('')}</div>`;
      const course=dep.courses.find(c=>c.id===dec(parts[3]));if(!course)return adminSubjectsFinal([]);
      if(parts.length===4)return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/subjects/department/${enc(dep.id)}">← ${dep.name}</a><span class="kicker">Course</span><h2>${course.name}</h2><p class="muted">Choose a semester to edit subjects.</p></div></div><div class="semester-grid-final">${Array.from({length:course.semesters},(_,i)=>i+1).map(sem=>`<a class="semester-card-final" href="#/portal/admin/subjects/department/${enc(dep.id)}/course/${enc(course.id)}/semester/${sem}"><span>SEMESTER ${sem}</span><b>${effectiveSubjectsForCourse(course.name,sem).length}</b><small>Subjects · Edit →</small></a>`).join('')}</div>`;
      const sem=Number(parts[5]);if(parts[4]==='semester'&&sem){const subs=effectiveSubjectsForCourse(course.name,sem);return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/subjects/department/${enc(dep.id)}/course/${enc(course.id)}">← ${course.name} semesters</a><span class="kicker">Subject editor</span><h2>${course.name} · Semester ${sem}</h2><p class="muted">Add, remove or rename the subjects used for attendance and results.</p></div><button class="btn btn-primary" onclick="adminSubjectAddRow()">＋ Add Subject</button></div><form class="card admin-subject-editor" onsubmit="saveAdminSubjects(event,'${escapeHtml(course.name)}',${sem})"><div id="adminSubjectRows">${subs.map((sub,i)=>`<div class="subject-edit-row"><span class="subject-number">${i+1}</span><input value="${escapeHtml(sub)}" data-subject-input><button type="button" class="subject-remove" onclick="this.parentElement.remove()" aria-label="Remove subject">×</button></div>`).join('')}</div><div class="subject-editor-footer"><span class="muted">${subs.length} subjects configured</span><button class="btn btn-primary">Save Subjects</button></div></form>`;}
    }
    return adminSubjectsFinal([]);
  }
  function adminSubjectAddRow(){const box=document.getElementById('adminSubjectRows');if(!box)return;const n=box.querySelectorAll('[data-subject-input]').length+1;const row=document.createElement('div');row.className='subject-edit-row';row.innerHTML=`<span class="subject-number">${n}</span><input placeholder="Subject name" data-subject-input><button type="button" class="subject-remove" onclick="this.parentElement.remove()">×</button>`;box.appendChild(row);box.lastElementChild.querySelector('input')?.focus();}
  function saveAdminSubjects(e,course,sem){e.preventDefault();const d=db();d.subjectCatalog=d.subjectCatalog||{};d.subjectCatalog[course]=d.subjectCatalog[course]||{};const values=[...document.querySelectorAll('#adminSubjectRows [data-subject-input]')].map(x=>x.value.trim()).filter(Boolean);const unique=[...new Set(values)];d.subjectCatalog[course][String(sem)]=unique;d.students.filter(s=>s.course===course&&Number(s.semester)===Number(sem)).forEach(s=>{s.subjects=unique.slice();});saveDB(d);route();toast(`${unique.length} subjects saved for ${course} · Semester ${sem}.`);}

  function adminContent(s){
    const parts=(window._deepPortalParts||[]).slice(1);
    if(s==='students')return adminStudentsHierarchy(parts);
    if(s==='teachers')return adminTeachersFinal(parts);
    if(s==='admins')return adminAdmins();
    if(s==='profile')return adminProfileFinal();
    if(s==='results')return adminResultsFinal(parts);
    if(s==='attendance')return adminAttendanceFinal(parts);
    if(s==='subjects')return adminSubjectsFinal(parts);
    if(s==='admissions')return adminAdmissions();
    if(s==='events')return adminEvents();
    if(s==='gallery')return adminGalleryFinal();
    if(s==='website')return websiteBuilder();
    if(s==='assignments')return adminAssignmentsV3();
    if(s==='notices')return adminNotices();
    if(s==='payments')return adminPaymentsV3();
    if(s==='settings')return adminBackupSettings();
    return adminDashboard();
  }
  function studentContent(s){const me=currentUser(),x=studentById(me?.id)||me;if(/^result-\d+$/.test(s))return studentResultFinalPage(x,Number(s.split('-')[1]));if(s==='profile')return studentProfileFinal(x);if(s==='fees')return studentFeesFinal(x);if(s==='attendance')return studentAttendanceFinal(x);if(s==='results')return studentResultsFinal(x);if(s==='notices')return studentNotices();if(s==='assignments')return studentAssignments(x);return `<div class="dash-grid"><div class="metric"><b>${x.attendance||0}%</b><small>Overall attendance</small></div><div class="metric"><b>${todaySubjectNotice(x).length}</b><small>Absence alerts today</small></div><div class="metric"><b>${noticesData().length}</b><small>College notices</small></div><div class="metric"><b>${paidTotal(x)}</b><small>Paid this session</small></div></div><div class="feature-grid"><div class="card"><span class="kicker">Welcome</span><h2>${escapeHtml(x.name)}</h2><p class="muted">${escapeHtml(x.department||deptName(x.course))} · ${escapeHtml(x.course)} · Semester ${x.semester}</p><a class="btn btn-primary" href="#/portal/student/profile">Open Profile →</a></div><div class="card"><span class="kicker">Student notices</span><h2>${todaySubjectNotice(x).length?'Attendance alert':'No attendance alert'}</h2><p class="muted">Open Notices to see college announcements and absence notifications.</p><a class="btn btn-outline" href="#/portal/student/notices">Open Notices →</a></div></div>`}
  function teacherStudentsFinal(parts=[]){
    const t=currentTeacher(),allowed=teacherCoursesByDepartment(t),mine=students().filter(x=>allowed.includes(studentCourse(x)));
    if(!parts.length)return `<div class="hierarchy-head"><div><span class="kicker">Student directory</span><h2>Students by Course</h2><p class="muted">Choose any course in your department, then a semester to view student profiles and attendance.</p></div><span class="pill">${mine.length} students</span></div><div class="hierarchy-grid course-grid">${allowed.map(name=>{const c=courseMeta(name),n=mine.filter(s=>studentCourse(s)===name).length;return `<a class="hierarchy-card" href="#/portal/teacher/students/course/${enc(c.id)}"><span class="hier-icon">🎓</span><span class="kicker">Course</span><h3>${escapeHtml(name)}</h3><strong>${n}</strong><small>${c.semesters} semesters · Students →</small></a>`}).join('')||'<div class="card empty">No courses are assigned to this teacher yet.</div>'}</div>`;
    if(parts[0]==='course'&&parts[1]&&parts.length===2){const course=allowed.map(courseMeta).find(c=>c.id===dec(parts[1]));if(!course)return teacherStudentsFinal([]);return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/teacher/students">← Courses</a><span class="kicker">Student directory</span><h2>${escapeHtml(course.name)}</h2><p class="muted">Choose a semester to see its roster.</p></div><span class="pill">${mine.filter(s=>studentCourse(s)===course.name).length} students</span></div><div class="semester-grid-final">${Array.from({length:course.semesters},(_,i)=>i+1).map(sem=>{const n=mine.filter(s=>inCourseSemester(s,course.name,sem)).length;return `<a class="semester-card-final" href="#/portal/teacher/students/course/${enc(course.id)}/semester/${sem}"><span>SEMESTER ${sem}</span><b>${n}</b><small>Open roster →</small></a>`}).join('')}</div>`;}
    if(parts[0]==='course'&&parts[2]==='semester'&&parts[3]){const course=allowed.map(courseMeta).find(c=>c.id===dec(parts[1])),sem=Number(parts[3]);if(!course||sem<1||sem>course.semesters)return teacherStudentsFinal([]);const list=mine.filter(s=>inCourseSemester(s,course.name,sem));return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/teacher/students/course/${enc(course.id)}">← ${escapeHtml(course.name)} semesters</a><span class="kicker">Student roster</span><h2>${escapeHtml(course.name)} · Semester ${sem}</h2><p class="muted">${escapeHtml(t?.department||'Department')} · ${list.length} students</p></div><div class="row-actions"><a class="btn btn-outline" href="#/portal/teacher/attendance/course/${enc(course.id)}/semester/${sem}">Attendance</a><a class="btn btn-primary" href="#/portal/teacher/results/course/${enc(course.id)}/semester/${sem}">Results</a></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Student ID</th><th>Section</th><th>Email</th><th>Phone</th><th>Attendance</th></tr></thead><tbody>${list.map(s=>`<tr><td><button class="student-name-link" onclick="showFinalStudentProfile(decodeURIComponent('${enc(s.id)}'))">${escapeHtml(s.name||'')}</button><small>${escapeHtml(s.username||'')}</small></td><td>${escapeHtml(s.id||s.studentId||'—')}</td><td>${escapeHtml(s.section||'A')}</td><td>${escapeHtml(s.email||'—')}</td><td>${escapeHtml(s.phone||'—')}</td><td>${Number(s.attendance)||0}%</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No students are assigned to this course and semester yet. Ask the administrator to add or update the student records.</td></tr>'}</tbody></table></div>`;}
    return teacherStudentsFinal([]);
  }
  function teacherContent(s){
    const t=currentTeacher(),parts=window._deepPortalParts||[],allowed=teacherCoursesByDepartment(t),mine=students().filter(x=>allowed.includes(studentCourse(x)));
    if(s==='profile')return teacherProfileV4(t)+`<div class="card teacher-audit-card"><span class="kicker">Administrator updates</span><h3>Profile changes made by admin</h3>${(db().profileAudit||[]).filter(a=>a.targetId===t?.id&&a.targetRole==='teacher').slice(-8).reverse().map(a=>`<p class="audit-row"><b>${escapeHtml(a.admin)}</b> · ${new Date(a.at).toLocaleString('en-IN')}<br>${escapeHtml(a.changes||'Profile updated')}</p>`).join('')||'<p class="muted">No administrator changes recorded.</p>'}</div>`;
    if(s==='attendance')return teacherAttendanceFinal(parts.slice(1));
    if(s==='results')return teacherResultsFinal(parts.slice(1));
    if(s==='students')return teacherStudentsFinal(parts.slice(1));
    if(s==='assignments')return teacherAssignmentsV3(mine);
    return `<div class="dash-grid"><div class="metric"><b>${mine.length}</b><small>Assigned students</small></div><div class="metric"><b>${assignmentsForTeacher(t).length}</b><small>Assignments</small></div><div class="metric"><b>${allowed.length}</b><small>Assigned courses</small></div><div class="metric"><b>${todayKey()}</b><small>Attendance date</small></div></div><div class="feature-grid"><div class="card"><h2>Attendance</h2><p class="muted">Course → Semester → Student → Subject-wise attendance.</p><a class="btn btn-primary" href="#/portal/teacher/attendance">Open Attendance →</a></div><div class="card"><h2>Results</h2><p class="muted">Course → Semester → Student → Subject-wise marks.</p><a class="btn btn-outline" href="#/portal/teacher/results">Open Results →</a></div></div>`;
  }
  function portal(role,section='dashboard'){const u0=currentUser(), u=role==='teacher'?currentTeacher():role==='student'?studentById(u0?.id):activeAdmin(), avatar=u?.photo?`<img src="${u.photo}" alt="Profile">`:role==='student'?'👨‍🎓':role==='teacher'?'👩‍🏫':'⚙️';return `<div class="portal"><div>${side(role,section)}</div><main class="portal-main"><div class="topline"><div><div class="kicker">${role} portal</div><h1>${titleCase(section)}</h1></div><div class="avatar top-avatar">${avatar}</div></div>${role==='admin'?adminContent(section):role==='teacher'?teacherContent(section):studentContent(section)}</main></div>`}

  /* ---------- final router ---------- */
  const originalRoute=route;
  function startHeroCarouselV5(){
    const slides=(db()?.site?.heroSlides||[]).filter(x=>x&&x.image);
    const imgEl=document.querySelector('.hero-card img');
    if(!imgEl||slides.length<2)return;
    const caption=document.querySelector('.hero-card-caption');
    let i=Math.max(0,slides.findIndex(x=>x.image===imgEl.src));
    if(i<0)i=0;
    window._heroCarouselIndex=i;
    clearInterval(window._heroCarouselTimer);
    window._heroCarouselTimer=setInterval(()=>{
      const root=document.querySelector('.hero-card img'); if(!root)return clearInterval(window._heroCarouselTimer);
      root.classList.add('hero-picture-changing'); setTimeout(()=>{i=(i+1)%slides.length;window._heroCarouselIndex=i;root.src=slides[i].image;root.alt=slides[i].title||'Shakuntalam College';root.classList.remove('hero-picture-changing');const cap=caption||document.querySelector('.hero-card-caption');if(cap){const b=cap.querySelector('b'),sp=cap.querySelector('span');if(b)b.textContent=slides[i].title||'Shakuntalam College';if(sp)sp.textContent='Academic Session 2026–27';}},240);
    },5000);
  }
  route=function(){
    const path=location.hash.replace(/^#/,'')||'/';
    const previousPath=window._lastFinalRoutePath;
    const previousScroll=window.scrollY||0;
    const liveSidebar=document.querySelector('.blink-side .side-scroll');
    const previousSidebarScroll=window._portalSidebarClickScroll!=null?window._portalSidebarClickScroll:(liveSidebar?liveSidebar.scrollTop:(window._portalSidebarScrollTop||0));
    window._portalSidebarClickScroll=null;
    const samePath=previousPath===path;
    if(path.startsWith('/portal/')){
      const p=path.split('/').filter(Boolean),sess=currentUser(),wanted=p[1]||'student';
      if(sess&&sess.role===wanted){window._deepPortalParts=p.slice(2);let section=p[2]||'dashboard';app.innerHTML=portal(wanted,section)+loginModal();startClock();window._lastFinalRoutePath=path;window._portalSidebarScrollTop=previousSidebarScroll;requestAnimationFrame(()=>{const side=document.querySelector('.blink-side .side-scroll');if(side)side.scrollTop=previousSidebarScroll;window.scrollTo(0,samePath?previousScroll:0)});return;}
    }
    window._deepPortalParts=[]; originalRoute(); startHeroCarouselV5(); window._lastFinalRoutePath=path;
    requestAnimationFrame(()=>window.scrollTo(0,samePath?previousScroll:0));
  };


  /* ---------- scoped subject attendance (course + semester safe) ---------- */
  function scopedAttendanceKey(course,sem,subject){return `${slug(course)}__sem${Number(sem)||1}__${slug(subject)}`;}
  function scopedAttendanceRecord(d,course,sem,subject){d.attendanceScoped=d.attendanceScoped||{};const k=scopedAttendanceKey(course,sem,subject);d.attendanceScoped[k]=d.attendanceScoped[k]||{course,semester:Number(sem)||1,subject,status:'Working Day',submitted:false,records:{}};return d.attendanceScoped[k];}
  function teacherScope(){const p=window._deepPortalParts||[], courseId=p[1]==='course'?dec(p[2]):'', sem=p[3]==='semester'?Number(p[4]):0, t=currentTeacher(),allowed=teacherCoursesByDepartment(t);let course=allowed[0];if(courseId){const cm=allowed.map(courseMeta).find(c=>c.id===courseId);if(cm)course=cm.name;}return {teacher:t,course,semester:sem||1,students:students().filter(s=>inCourseSemester(s,course,sem||1))};}
  function finalSubjectStats(x){const d=db(),out={};effectiveSubjectsForCourse(x.course,x.semester).forEach(sub=>{let p=0,a=0,w=0,h=0;const prefix=`${slug(x.course)}__sem${Number(x.semester)||1}__`;Object.entries(d.attendanceScoped||{}).forEach(([k,r])=>{if(!k.startsWith(prefix)||r.subject!==sub)return;const v=r.records?.[x.id];if(v==='P')p++;else if(v==='A')a++;else if(v==='W')w++;else if(v==='H'||r.status==='Holiday')h++;});const total=p+a;out[sub]={p,a,w,h,total,pct:total?Math.round(p/total*100):0};});return out;}
  function finalTodayAlerts(x){const d=db(),alerts=[],prefix=`${slug(x.course)}__sem${Number(x.semester)||1}__`;Object.entries(d.attendanceScoped||{}).forEach(([k,r])=>{if(k.startsWith(prefix)&&r.records?.[x.id]==='A')alerts.push(r.subject)});return alerts;}
  function finalSetSubjectAttendance(id,subject,state){const sc=teacherScope(),x=sc.students.find(s=>s.id===id),d=db(),r=scopedAttendanceRecord(d,sc.course,sc.semester,subject);if(!x){toast('Student is outside your selected course and semester.');return}if(r.submitted){toast('This subject attendance is locked after submission.');return}r.status='Working Day';r.records[id]=state;saveDB(d);route();}
  function finalMarkAllSubjectPresent(){const sc=teacherScope(),d=db(),sub=window._attendanceSubject||teacherSubjects(sc.teacher,sc.students)[0],r=scopedAttendanceRecord(d,sc.course,sc.semester,sub);if(r.submitted){toast('Submitted attendance is locked.');return}r.status='Working Day';sc.students.forEach(x=>r.records[x.id]='P');saveDB(d);route();toast(`All ${sub} students marked present.`)}
  function finalSetTeacherDayStatus(status){const sc=teacherScope(),d=db(),sub=window._attendanceSubject||teacherSubjects(sc.teacher,sc.students)[0],r=scopedAttendanceRecord(d,sc.course,sc.semester,sub);if(r.submitted){toast('Submitted attendance cannot be changed by the teacher.');return}r.status=status;if(status==='Holiday')sc.students.forEach(x=>r.records[x.id]='H');if(status==='Working Day')sc.students.forEach(x=>{if(r.records[x.id]==='H')delete r.records[x.id]});saveDB(d);route();}
  function finalSubmitTeacherSubjectAttendance(){const sc=teacherScope(),d=db(),sub=window._attendanceSubject||teacherSubjects(sc.teacher,sc.students)[0],r=scopedAttendanceRecord(d,sc.course,sc.semester,sub);if(r.submitted){toast('Already submitted.');return}if(r.status!=='Holiday'&&sc.students.some(x=>!['P','A'].includes(r.records?.[x.id]))){toast('Mark Present or Absent for every student first.');return}r.submitted=true;r.submittedBy=sc.teacher?.name||'Teacher';r.submittedAt=new Date().toISOString();sc.students.forEach(x=>{x.attendance=Number(x.attendance)||0;});saveDB(d);route();toast(`${sub} attendance submitted and locked.`)}
  function finalAdminSubjectRecord(course,sem,subject){return scopedAttendanceRecord(db(),course,sem,subject)}
  function adminAttendanceFinal(parts){
    const all=db().students||[];
    if(parts.length===0) return `<div class="hierarchy-head"><div><span class="kicker">Attendance administration</span><h2>Attendance by Department</h2><p class="muted">Follow the exact structure: <b>Department → Course → Semester → Edit</b>.</p></div></div><div class="hierarchy-grid">${TAXONOMY.map(dep=>`<a class="hierarchy-card dept-card" href="#/portal/admin/attendance/department/${enc(dep.id)}"><span class="hier-icon">✓</span><span class="kicker">Department</span><h3>${dep.name}</h3><small>Courses →</small></a>`).join('')}</div>`;
    if(parts[0]==='department'&&parts[1]){
      const dep=TAXONOMY.find(x=>x.id===dec(parts[1]));if(!dep)return adminAttendanceFinal([]);
      if(parts.length===2)return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/attendance">← Departments</a><span class="kicker">Department</span><h2>${dep.name}</h2><p class="muted">Select a course to continue.</p></div></div><div class="hierarchy-grid course-grid">${dep.courses.map(c=>`<a class="hierarchy-card" href="#/portal/admin/attendance/department/${enc(dep.id)}/course/${enc(c.id)}"><span class="hier-icon">✓</span><span class="kicker">Course</span><h3>${c.name}</h3><strong>${all.filter(s=>studentCourse(s)===c.name).length}</strong><small>${c.semesters} semesters →</small></a>`).join('')}</div>`;
      const course=dep.courses.find(c=>c.id===dec(parts[3]));if(!course)return adminAttendanceFinal([]);
      if(parts.length===4)return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/attendance/department/${enc(dep.id)}">← ${dep.name}</a><span class="kicker">Course</span><h2>${course.name}</h2><p class="muted">Choose a semester to open the attendance editor.</p></div></div><div class="semester-grid-final">${Array.from({length:course.semesters},(_,i)=>i+1).map(sem=>`<a class="semester-card-final" href="#/portal/admin/attendance/department/${enc(dep.id)}/course/${enc(course.id)}/semester/${sem}"><span>SEMESTER ${sem}</span><b>${all.filter(x=>inCourseSemester(x,course.name,sem)).length}</b><small>Edit attendance →</small></a>`).join('')}</div>`;
      const sem=Number(parts[5]);if(parts[4]==='semester'&&sem){
        const list=all.filter(x=>inCourseSemester(x,course.name,sem)),subs=effectiveSubjectsForCourse(course.name,sem),sub=window._adminAttendanceSubject&&subs.includes(window._adminAttendanceSubject)?window._adminAttendanceSubject:(subs[0]||'Core Subject'),r=finalAdminSubjectRecord(course.name,sem,sub);
        return `<div class="hierarchy-head"><div><a class="back-link" href="#/portal/admin/attendance/department/${enc(dep.id)}/course/${enc(course.id)}">← ${course.name} semesters</a><span class="kicker">Attendance editor</span><h2>${course.name} · Semester ${sem}</h2><p class="muted">${dep.name} · Admin can edit attendance even after teacher submission.</p></div><div class="attendance-submit-actions"><button class="btn btn-outline" onclick="finalAdminMarkAll()">✓ Mark All Present</button><button class="btn btn-primary" onclick="finalAdminSubmit()">Submit Attendance</button></div></div><div class="attendance-controls-grid"><label>Subject<select onchange="window._adminAttendanceSubject=this.value;route()">${subs.map(s=>`<option ${s===sub?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></label><label>Day type<select onchange="finalAdminDayStatus(this.value)"><option ${r.status==='Working Day'?'selected':''}>Working Day</option><option ${r.status==='Holiday'?'selected':''}>Holiday</option></select></label></div><div class="attendance-submit-status ${r.submitted?'submitted':''}">${r.submitted?`✓ Submitted by ${escapeHtml(r.submittedBy||'staff')}. Admin editing remains enabled.`:`${escapeHtml(sub)} attendance is not submitted yet.`}</div><div class="attendance-legend"><span>🟢 Present</span><span>🔴 Absent</span><span>🟡 Working Day</span><span>🔵 Holiday</span></div><div class="table-wrap"><table class="table attendance-table"><thead><tr><th>Student</th><th>Section</th><th>Subject %</th><th>Today</th><th>Admin Edit</th></tr></thead><tbody>${list.map(x=>{const st=r.records?.[x.id]||'';const pct=finalSubjectStats(x)[sub]?.pct||0;return `<tr><td><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.id)}</small></td><td>${escapeHtml(x.section||'A')}</td><td><b>${pct}%</b></td><td><span class="att-state ${st==='P'?'present':st==='A'?'absent':st==='H'?'holiday':''}">${st||'Not marked'}</span></td><td><button class="att-action present" onclick="finalAdminSet('${x.id}','${escapeHtml(sub)}','P')">Present</button><button class="att-action absent" onclick="finalAdminSet('${x.id}','${escapeHtml(sub)}','A')">Absent</button></td></tr>`}).join('')||'<tr><td colspan="5" class="empty">No students in this semester.</td></tr>'}</tbody></table></div><div class="hierarchy-key">Academic path: <b>${escapeHtml(dep.name)}</b> → <b>${escapeHtml(course.name)}</b> → <b>Semester ${sem}</b> → Edit</div>`;
      }
    }
    return adminAttendanceFinal([]);
  }
  function finalAdminSet(id,sub,state){const d=db(),x=d.students.find(s=>s.id===id),r=finalAdminSubjectRecord(x.course,x.semester,sub);r.status='Working Day';r.records[id]=state;saveDB(d);route();}
  function adminAttendanceScope(){const p=window._deepPortalParts||[];const dep=p[1]?TAXONOMY.find(x=>x.id===dec(p[2])):null;const course=dep&&p[3]==='course'?dep.courses.find(x=>x.id===dec(p[4])):null;const sem=course&&p[5]==='semester'?Number(p[6]):1;const subs=course?effectiveSubjectsForCourse(course.name,sem):[];const sub=window._adminAttendanceSubject&&subs.includes(window._adminAttendanceSubject)?window._adminAttendanceSubject:(subs[0]||'Core Subject');return {course:course?.name||'BBA',sem,sub};}
  function finalAdminMarkAll(){const d=db(),sc=adminAttendanceScope(),r=finalAdminSubjectRecord(sc.course,sc.sem,sc.sub);r.status='Working Day';d.students.filter(x=>x.course===sc.course&&Number(x.semester)===sc.sem).forEach(x=>r.records[x.id]='P');saveDB(d);route();toast('All students marked present.');}
  function finalAdminDayStatus(status){const d=db(),sc=adminAttendanceScope(),r=finalAdminSubjectRecord(sc.course,sc.sem,sc.sub);r.status=status;if(status==='Holiday')d.students.filter(x=>x.course===sc.course&&Number(x.semester)===sc.sem).forEach(x=>r.records[x.id]='H');saveDB(d);route();}
  function finalAdminSubmit(){const d=db(),sc=adminAttendanceScope(),r=finalAdminSubjectRecord(sc.course,sc.sem,sc.sub);r.submitted=true;r.submittedBy=adminName();r.submittedAt=new Date().toISOString();saveDB(d);route();toast('Admin attendance submitted. Admin editing remains enabled.')}

  /* Override the generic stats used by the final student screens. */
  window.studentSubjectStats=finalSubjectStats;window.todaySubjectNotice=finalTodayAlerts;
  window.setSubjectAttendance=finalSetSubjectAttendance;window.markAllSubjectPresent=finalMarkAllSubjectPresent;window.setTeacherDayStatus=finalSetTeacherDayStatus;window.submitTeacherSubjectAttendance=finalSubmitTeacherSubjectAttendance;
  window.adminAttendanceV3=adminAttendanceFinal;window.finalAdminSet=finalAdminSet;window.finalAdminMarkAll=finalAdminMarkAll;window.finalAdminDayStatus=finalAdminDayStatus;window.finalAdminSubmit=finalAdminSubmit;
  /* expose handlers used by inline controls */
  window.header=header;window.gallery=gallery;
  window.adminPaymentsV3=adminPaymentsFinal;window.saveFeeAmountsFinal=saveFeeAmountsFinal;
  window.readSelfStudentImage=readSelfStudentImage;window.saveFinalStudentSelf=saveFinalStudentSelf;
  window.openFinalStudentEditor=openFinalStudentEditor;window.showFinalStudentProfile=showFinalStudentProfile;window.filterAdminStudentRoster=filterAdminStudentRoster;window.closeFinalStudentEditor=closeFinalStudentEditor;window.saveFinalStudent=saveFinalStudent;window.deleteFinalStudent=deleteFinalStudent;window.refreshFinalCourseOptions=refreshFinalCourseOptions;window.readFinalImage=readFinalImage;
  window.openFinalTeacherEditor=openFinalTeacherEditor;window.readFinalTeacherImage=readFinalTeacherImage;window.saveFinalTeacher=saveFinalTeacher;window.deleteFinalTeacher=deleteFinalTeacher;window.saveTeacherSelfProfileFinal=saveTeacherSelfProfileFinal;window.readTeacherSelfProfileImage=readTeacherSelfProfileImage;
  window.readAdminFinalImage=readAdminFinalImage;window.saveAdminProfileFinal=saveAdminProfileFinal;
  window.saveSubjectMarksFinal=saveSubjectMarksFinal;window.openAdminResultEditor=openAdminResultEditor;window.saveAdminResult=saveAdminResult;window.adminSubjectAddRow=adminSubjectAddRow;window.saveAdminSubjects=saveAdminSubjects;window.saveGalleryPhotoFinal=saveGalleryPhotoFinal;window.deleteGalleryPhotoFinal=deleteGalleryPhotoFinal;
  window.completeDemoPaymentV3=completeDemoPaymentFinal;
  window.exportBackupPackage=exportBackupPackage;window.restoreBackupFile=restoreBackupFile;window.savePortalRibbon=savePortalRibbon;

  /* ------------------------------------------------------------------
     FINAL ROUTER HANDOFF
     The base app.js installs hash listeners before this upgrade file is
     loaded.  The upgraded portal router is local to this IIFE, so without
     handing it back to the global navigation lifecycle, portal pages only
     become correct after a full HTML refresh.
     ------------------------------------------------------------------ */
  window.__shakuntalamPortalRoute = route;
  window.examination = examinationFinal;
  window.home = window.home || window.home;
  const _baseShakuntalamRoute = window.route;
  function finalRoute(){
    const path=location.hash.replace(/^#/,'')||'/';
    const previousPath=window._lastFinalRoutePath; const previousScroll=window.scrollY||0; const samePath=previousPath===path;
    if(path.startsWith('/examination/') && path!=='/examination') {
      const kind=path.split('/').filter(Boolean)[1]||'calendar';
      app.innerHTML=examinationSubPage(kind)+loginModal();
      startClock(); window._lastFinalRoutePath=path; requestAnimationFrame(()=>window.scrollTo(0,samePath?previousScroll:0)); return;
    }
    _baseShakuntalamRoute();
    if(path==='/'){
      const sections=[...document.querySelectorAll('section.section')];
      sections.find(sec=>/Notice board/i.test(sec.querySelector('h2')?.textContent||''))?.remove();
    }
    window._lastFinalRoutePath=path; requestAnimationFrame(()=>window.scrollTo(0,samePath?previousScroll:0));
  }
  window.route = finalRoute;
  window.removeEventListener('hashchange', route);
  window.removeEventListener('load', route);
  window.addEventListener('hashchange', finalRoute);
  window.addEventListener('load', finalRoute);

  /* Ensure a portal link clicked immediately after login renders the new
     screen even if the browser batches the hashchange event. */
  document.addEventListener('click', function(ev){
    const link = ev.target && ev.target.closest ? ev.target.closest('a[href^="#/portal/"]') : null;
    if(!link) return;
    requestAnimationFrame(function(){
      try { route(); } catch(err) { console.error('Portal route error:', err); }
    });
  });
  document.addEventListener('scroll',function(ev){
    if(ev.target&&ev.target.matches&&ev.target.matches('.blink-side .side-scroll')) window._portalSidebarScrollTop=ev.target.scrollTop;
  },true);
  document.addEventListener('click',function(ev){
    const link=ev.target&&ev.target.closest?ev.target.closest('.blink-side .side-scroll a[href^="#/portal/"]'):null;
    if(link){const side=link.closest('.blink-side')?.querySelector('.side-scroll');if(side)window._portalSidebarClickScroll=side.scrollTop;}
  },true);

  /* Manual hero carousel controls — four-to-three portrait-safe frame. */
  window.nextHeroSlideV7 = function(direction){
    const slides=(db()?.site?.heroSlides||[]).filter(x=>x&&x.image);
    const imgEl=document.getElementById('heroCarouselImage') || document.querySelector('.hero-card img');
    if(!imgEl || !slides.length)return;
    let i=Number.isFinite(window._heroCarouselIndex)?window._heroCarouselIndex:0;
    const current=slides.findIndex(x=>x.image===imgEl.getAttribute('src') || x.image===imgEl.src);
    if(current>=0)i=current;
    i=(i+(direction>0?1:-1)+slides.length)%slides.length;
    window._heroCarouselIndex=i;
    imgEl.classList.add('hero-picture-changing');
    setTimeout(()=>{imgEl.src=slides[i].image;imgEl.alt=slides[i].title||'Shakuntalam College';imgEl.classList.remove('hero-picture-changing');},240);
    const cap=document.querySelector('.hero-card-caption');
    if(cap){const b=cap.querySelector('b'); if(b)b.textContent=slides[i].title||'Shakuntalam College';}
    clearInterval(window._heroCarouselTimer);
    window._heroCarouselTimer=setInterval(()=>window.nextHeroSlideV7(1),5000);
  };

  /* Force the final public UI once all overrides are installed. */
  route();
})();
