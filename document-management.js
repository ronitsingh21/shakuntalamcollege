/* Public static PDF catalog and link rendering. No uploads or browser storage. */
(()=>{
  const PUBLIC_PDFS={
    aicte_approvals:[
      {title:'AICTE EOA 2025–26',filename:'AICTE EOA 2025-26.pdf',path:'assets/documents/aicte-eoa-2025-26.pdf'},
      {title:'AICTE EOA Report 2026–27',filename:'AICTE EOA Report 2026-27.PDF',path:'assets/documents/aicte-eoa-report-2026-27.pdf'}
    ],
    aishe_certificates:[
      {title:'AISHE 2023–24',filename:'AISHE 2023-24.pdf',path:'assets/documents/aishe-2023-24.pdf'},
      {title:'AISHE Certificate 2024–2025',filename:'AISHE CERTIFICATE 2024-2025.pdf',path:'assets/documents/aishe-certificate-2024-2025.pdf'}
    ],
    anti_ragging_guidelines:[{title:'Anti-Ragging Guidelines',filename:'Anti-Ragging Guidelines.pdf',path:'assets/documents/anti-ragging-guidelines.pdf'}],
    bed_syllabus:[{title:'B.Ed. Syllabus',filename:'B.ED SYLLABUS.pdf',path:'assets/documents/b-ed-syllabus.pdf'}],
    bba_syllabus:[{title:'BBA UG Syllabus',filename:'BBA UG SYLLABUS.pdf',path:'assets/documents/bba-ug-syllabus.pdf'}],
    deled_syllabus:[{title:'D.El.Ed. Syllabus',filename:'D.El.Ed Syllabus.pdf',path:'assets/documents/d-el-ed-syllabus.pdf'}],
    bed_admission_form:[{title:'B.Ed. Admission Form',filename:'B.ED ADMISSION FORM.pdf',path:'assets/documents/b-ed-admission-form.pdf'}],
    deled_admission_form:[{title:'D.El.Ed. Admission Form',filename:'D.EL.ED ADMISSION FORM.pdf',path:'assets/documents/d-el-ed-admission-form.pdf'}],
    bba_bca_admission_form:[{title:'BBA & BCA Admission Form',filename:'BBA & BCA ADMISSION FORM.pdf',path:'assets/documents/bba-bca-admission-form.pdf'}],
    bed_fee_structure:[{title:'B.Ed. Fee Structure',filename:'B.ED FEE STRUCTURE.pdf',path:'assets/documents/b-ed-fee-structure.pdf'}],
    deled_fee_structure:[{title:'D.El.Ed. Fee Structure',filename:'D.EL.ED FEE STRUCTURE.pdf',path:'assets/documents/d-el-ed-fee-structure.pdf'}],
    bba_fee_structure:[{title:'BBA Fee Structure',filename:'BBA FEE STRUCTURE.pdf',path:'assets/documents/bba-fee-structure.pdf'}],
    bba_faculty:[{title:'BBA Faculty',filename:'BBA FACULTY.pdf',path:'assets/documents/bba-faculty.pdf'}],
    bca_faculty:[{title:'BCA Faculty',filename:'BCA FACULTY.pdf',path:'assets/documents/bca-faculty.pdf'}],
    affiliation_bseb:[{title:'Affiliation – BSEB',filename:'AFFILIATION BSEB.pdf',path:'assets/documents/affiliation-bseb.pdf'}],
    affiliation_vksu:[{title:'Affiliation – VKSU',filename:'AFFILIATION VKSU.pdf',path:'assets/documents/affiliation-vksu.pdf'}],
    fdr_bed:[{title:'FDR – B.Ed.',filename:'FDR B.ED.pdf',path:'assets/documents/fdr-b-ed.pdf'}],
    fdr_deled:[{title:'FDR – D.El.Ed.',filename:'FDR D.EL.ED.pdf',path:'assets/documents/fdr-d-el-ed.pdf'}],
    admission_committee:[{title:'Admission Committee',filename:'ADMISSION COMMITTEE.pdf',path:'assets/documents/admission-committee.pdf'}],
    examination_committee:[{title:'Examination Committee',filename:'EXAMINATION COMMITTEE.pdf',path:'assets/documents/examination-committee.pdf'}],
    women_committee:[{title:'Women Committee',filename:'WOMEN COMMITTEE.pdf',path:'assets/documents/women-committee.pdf'}],
    sc_st_committee:[{title:'SC/ST Committee',filename:'SC:ST COMMITTEE.pdf',path:'assets/documents/sc-st-committee.pdf'}],
    alumni_committee:[{title:'Alumni Committee',filename:'ALUMNI COMMITTEE.pdf',path:'assets/documents/alumni-committee.pdf'}],
    bca_syllabus:[{title:'BCA UG Syllabus',filename:'BCA UG SYLLABUS.pdf',path:'assets/documents/bca-ug-syllabus.pdf'}],
    audit_report:[{title:'Audit Report',filename:'AUDIT REPORT.pdf',path:'assets/documents/audit-report.pdf'}],
    bed_faculty:[{title:'B.Ed. Faculty – NCTE',filename:'B.Ed. Faculty NCTE.pdf',path:'assets/documents/b-ed-faculty-ncte.pdf'}],
    deled_faculty:[{title:'D.El.Ed. Faculty – NCTE',filename:'D.El.Ed. Faculty NCTE.pdf',path:'assets/documents/d-el-ed-faculty-ncte.pdf'}],
    building_completion_certificate:[{title:'Building Completion Certificate',filename:'BUILDING COMPLETION CERTIFICATE.pdf',path:'assets/documents/building-completion-certificate.pdf'}],
    building_plan:[{title:'Building Plan',filename:'BUILDING PLAN.pdf',path:'assets/documents/building-plan.pdf'}],
    fire_safety:[{title:'Fire Safety Certificate',filename:'FIRE SAFETY.pdf',path:'assets/documents/fire-safety.pdf'}],
    land_documents:[{title:'Land Documents',filename:'LAND DOCUMENTS.pdf',path:'assets/documents/land-documents.pdf'}],
    noc_bseb:[{title:'NOC – BSEB',filename:'NOC BSEB.pdf',path:'assets/documents/noc-bseb.pdf'}],
    noc_vksu:[{title:'NOC – VKSU',filename:'NOC VKSU.pdf',path:'assets/documents/noc-vksu.pdf'}],
    recognition_ncte_bed:[{title:'Recognition – NCTE B.Ed.',filename:'RECOG NCTE B.ED.pdf',path:'assets/documents/recognition-ncte-b-ed.pdf'}],
    recognition_bseb_deled:[{title:'Recognition – BSEB D.El.Ed.',filename:'RECOG BSEB D.EL.ED.pdf',path:'assets/documents/recognition-bseb-d-el-ed.pdf'}],
    society_pan_card:[{title:'Society PAN Card',filename:'SOCIETY PAN.pdf',path:'assets/documents/society-pan.pdf'}],
    society_registration:[{title:'Society Registration',filename:'SOCIETY REGS.pdf',path:'assets/documents/society-registration.pdf'}],
    society_tan_card:[{title:'Society TAN Card',filename:'SOCIETY TAN .pdf',path:'assets/documents/society-tan.pdf'}],
    bed_internship:[{title:'B.Ed. & D.El.Ed. Internship',filename:'INTERNSHIP B.ED & D.EL.ED.pdf',path:'assets/documents/internship-b-ed-d-el-ed.pdf'}],
    deled_internship:[{title:'B.Ed. & D.El.Ed. Internship',filename:'INTERNSHIP B.ED & D.EL.ED.pdf',path:'assets/documents/internship-b-ed-d-el-ed.pdf'}],
    iqac:[{title:'IQAC',filename:'IQAC.pdf',path:'assets/documents/iqac.pdf'}]
  };
  const escape=value=>typeof escapeHtml==='function'?escapeHtml(String(value??'')):String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const entriesForKey=key=>PUBLIC_PDFS[key]||[];
  const entriesForKeys=keys=>{const seen=new Set();return keys.flatMap(entriesForKey).filter(doc=>{if(!doc.path||seen.has(doc.path))return false;seen.add(doc.path);return true})};
  const target=doc=>`href="${escape(doc.path)}" target="_blank" rel="noopener noreferrer"`;
  function card(doc,number=0){
    const title=doc.title||doc.filename||'Official document';
    return `<a class="managed-pdf-card" ${target(doc)} aria-label="Open ${escape(title)} PDF in a new tab">${number?`<span class="managed-pdf-number">${String(number).padStart(2,'0')}</span>`:''}<span class="managed-pdf-icon" aria-hidden="true">${collegeDocumentIcon()}</span><span class="managed-pdf-copy"><b>${escape(title)}</b><small>See Pdf</small></span><span class="managed-pdf-arrow" aria-hidden="true">↗</span></a>`;
  }
  window.managedPublicPdfCard=card;
  window.managedPublicDocumentSlot=key=>{const items=entriesForKey(key);return items.length?`<div class="managed-pdf-grid">${items.map((doc,index)=>card(doc,index+1)).join('')}</div>`:''};
  window.managedPublicDocumentAction=(key,label)=>{const doc=entriesForKey(key)[0];return doc?`<a class="btn btn-outline" ${target(doc)}>${escape(label)} ↗</a>`:`<span class="btn btn-outline is-disabled" aria-disabled="true">PDF not available yet</span>`};
  window.managedPublicDocumentGroup=(keys,title='')=>{const items=entriesForKeys(keys);return items.length?`<section class="managed-pdf-section">${title?`<h2>${escape(title)}</h2>`:''}<div class="managed-pdf-grid">${items.map((doc,index)=>card(doc,index+1)).join('')}</div></section>`:''};
  window.managedPublicDocumentGroups=groups=>groups.map(group=>window.managedPublicDocumentGroup(group.keys,group.title)).join('');
})();
