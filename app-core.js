(function(global){
  'use strict';

  const DAYS = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì'];
  const CLASS_RE = /^[123][A-D]$/i;
  const SURV_KEYS = ['r1out','r1in','r2out','r2in'];
  const SURV_LABELS = {r1in:'R1 IN',r1out:'R1 OUT',r2in:'R2 IN',r2out:'R2 OUT'};

  function normSpace(s){
    return String(s == null ? '' : s).replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
  }
  function normKey(s){
    return normSpace(s).toUpperCase().replace(/[’‘`]/g,"'");
  }
  function pretty(s){
    return normSpace(s).replace(/_/g,' ').replace(/ED FISICA/gi,'ED. FISICA');
  }
  function htmlEsc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function newGrid(){
    return Array.from({length:6},()=>Array.from({length:5},()=>[]));
  }
  function splitPlus(s){
    return normSpace(s).split(/\s*\+\s*/).map(normSpace).filter(Boolean);
  }
  function splitBlocks(td){
    const html = td.innerHTML || '';
    return html.split(/<hr\b[^>]*>/i).map(x=>x.trim()).filter(Boolean).map(fragment=>{
      const box=document.createElement('div');
      box.innerHTML=fragment;
      return box;
    });
  }
  function textWithoutSmall(box){
    const c=box.cloneNode(true);
    c.querySelectorAll('small').forEach(n=>n.remove());
    c.querySelectorAll('br').forEach(n=>n.replaceWith(' '));
    return normSpace(c.textContent);
  }
  function smallText(box){
    const s=box.querySelector('small');
    return s?normSpace(s.textContent):'';
  }
  function parsePotTokens(text){
    const t=normSpace(text);
    const m=t.match(/^(POT(?:\s+AGG\.)?)\s*[·•]\s*(.*?)\s*[·•]\s*(.*)$/i);
    if(!m) return null;
    return {label:normKey(m[1]).startsWith('POT AGG')?'POT AGG.':'POT', middle:normSpace(m[2]), tail:normSpace(m[3])};
  }
  function classifyClassEntry(subject, detail){
    const d=normSpace(detail), s=normSpace(subject);
    if(!s && !d) return null;
    let m=d.match(/^(POT(?:\s+AGG\.)?)\s*[·•]\s*(.+)$/i);
    if(m){
      const label=normKey(m[1]).startsWith('POT AGG')?'POT AGG.':'POT';
      return {kind:label==='POT AGG.'?'potagg':'pot',subject:s,teacher:normSpace(m[2]),label};
    }
    if(/\bSOST(?:EGNO)?\b/i.test(d) || /\bSOST(?:EGNO)?\b/i.test(s)){
      const teacher=normSpace(d.replace(/\bSOST(?:EGNO)?\b/ig,'')) || d;
      return {kind:'sost',subject:s || 'SOSTEGNO',teacher,label:'SOST'};
    }
    if(/\bALT(?:ERNATIVA)?\b/i.test(d) || /\bALT(?:ERNATIVA)?\b/i.test(s)){
      const teacher=normSpace(d.replace(/\bALT(?:ERNATIVA)?\b/ig,'')) || d;
      return {kind:'alt',subject:s || 'ALTERNATIVA',teacher,label:'ALT'};
    }
    const p=parsePotTokens(s || d);
    if(p) return {kind:p.label==='POT AGG.'?'potagg':'pot',subject:p.tail,teacher:p.middle,label:p.label};
    return {kind:'curr',subject:s,teacher:d,label:''};
  }
  function parseClassCell(td){
    const out=[];
    for(const box of splitBlocks(td)){
      const e=classifyClassEntry(textWithoutSmall(box),smallText(box));
      if(e && (e.subject || e.teacher)) out.push(e);
    }
    return out;
  }
  function classifyTeacherEntry(subject, detail){
    const s=normSpace(subject), d=normSpace(detail);
    if(!s && !d) return null;
    const p=parsePotTokens(s || d);
    if(p) return {kind:p.label==='POT AGG.'?'potagg':'pot',subject:p.tail,class:p.middle,label:p.label};
    if(/\bSOST(?:EGNO)?\b/i.test(s) || /\bSOST(?:EGNO)?\b/i.test(d)) return {kind:'sost',subject:s || 'SOSTEGNO',class:d,label:'SOST'};
    if(/\bALT(?:ERNATIVA)?\b/i.test(s) || /\bALT(?:ERNATIVA)?\b/i.test(d)) return {kind:'alt',subject:s || 'ALTERNATIVA',class:d,label:'ALT'};
    return {kind:'curr',subject:s,class:d,label:''};
  }
  function parseTeacherCell(td){
    const out=[];
    for(const box of splitBlocks(td)){
      const e=classifyTeacherEntry(textWithoutSmall(box),smallText(box));
      if(e && (e.subject || e.class)) out.push(e);
    }
    return out;
  }
  function nextTable(h2){
    let n=h2.nextElementSibling;
    while(n && n.tagName!=='TABLE') n=n.nextElementSibling;
    return n;
  }
  function parseClassHtml(html){
    const doc=new DOMParser().parseFromString(String(html),'text/html');
    const classes={}, warnings=[];
    for(const h2 of Array.from(doc.querySelectorAll('h2'))){
      const name=normKey(h2.textContent);
      if(!CLASS_RE.test(name)) continue;
      const table=nextTable(h2);
      if(!table){ warnings.push(`Classe ${name}: tabella non trovata`); continue; }
      const grid=newGrid();
      const rows=Array.from(table.querySelectorAll('tbody tr'));
      if(rows.length!==6) warnings.push(`Classe ${name}: trovate ${rows.length} righe orarie invece di 6`);
      rows.slice(0,6).forEach((tr,hour)=>{
        const cells=Array.from(tr.children).filter(x=>x.tagName==='TD');
        if(cells.length!==5) warnings.push(`Classe ${name}, ${hour+1}ª: trovate ${cells.length} colonne invece di 5`);
        cells.slice(0,5).forEach((td,day)=>grid[hour][day]=parseClassCell(td));
      });
      classes[name]=grid;
    }
    if(!Object.keys(classes).length) warnings.push('Nessuna classe riconosciuta nel file classi');
    return {classes,warnings};
  }
  function parseTeacherHtml(html){
    const doc=new DOMParser().parseFromString(String(html),'text/html');
    const teachers={}, teacherMeta={}, warnings=[];
    for(const h2 of Array.from(doc.querySelectorAll('h2'))){
      const title=normSpace(h2.textContent);
      if(!title || CLASS_RE.test(normKey(title))) continue;
      const table=nextTable(h2);
      if(!table) continue;
      const parts=title.split(/\s+[—–-]\s+/);
      const teacher=normKey(parts.shift() || title);
      const subject=normSpace(parts.join(' — '));
      if(!teacher) continue;
      const grid=newGrid();
      const rows=Array.from(table.querySelectorAll('tbody tr'));
      if(rows.length!==6) warnings.push(`${teacher}: trovate ${rows.length} righe orarie invece di 6`);
      rows.slice(0,6).forEach((tr,hour)=>{
        const cells=Array.from(tr.children).filter(x=>x.tagName==='TD');
        if(cells.length!==5) warnings.push(`${teacher}, ${hour+1}ª: trovate ${cells.length} colonne invece di 5`);
        cells.slice(0,5).forEach((td,day)=>grid[hour][day]=parseTeacherCell(td));
      });
      teachers[teacher]=grid;
      teacherMeta[teacher]={subject,title};
    }
    if(!Object.keys(teachers).length) warnings.push('Nessun docente riconosciuto nel file docenti');
    return {teachers,teacherMeta,warnings};
  }

  function parseSupportCellText(text){
    const t=normSpace(text);
    if(!t) return [];
    const blocks=t.split(/\s*[\n|]+\s*/).map(normSpace).filter(Boolean);
    const out=[];
    for(const block of blocks){
      const parts=block.split(/\s*[·•]\s*/).map(normSpace).filter(Boolean);
      if(!parts.length) continue;
      const cls=normKey(parts.shift()||'');
      const pupil=parts.length>=3 ? normSpace(parts.pop()) : '';
      const subject=normSpace(parts.join(' · '));
      out.push({kind:'sost',class:cls,subject:subject||'SOSTEGNO',pupil,label:'SOST'});
    }
    return out;
  }
  function parseSupportHtml(html){
    const doc=new DOMParser().parseFromString(String(html),'text/html');
    const support={}, supportMeta={}, warnings=[];
    for(const h2 of Array.from(doc.querySelectorAll('h2'))){
      const title=normSpace(h2.textContent);
      if(!title) continue;
      const table=nextTable(h2);
      if(!table) continue;
      const parts=title.split(/\s+[—–-]\s+/);
      const teacher=normKey(parts.shift() || title);
      if(!teacher) continue;
      const grid=newGrid();
      const rows=Array.from(table.querySelectorAll('tbody tr'));
      if(rows.length!==6) warnings.push(`${teacher} (sostegno): trovate ${rows.length} righe orarie invece di 6`);
      rows.slice(0,6).forEach((tr,hour)=>{
        const cells=Array.from(tr.children).filter(x=>x.tagName==='TD');
        if(cells.length!==5) warnings.push(`${teacher} (sostegno), ${hour+1}ª: trovate ${cells.length} colonne invece di 5`);
        cells.slice(0,5).forEach((td,day)=>grid[hour][day]=parseSupportCellText(td.textContent));
      });
      support[teacher]=grid;
      supportMeta[teacher]={subject:'SOSTEGNO',title};
    }
    if(!Object.keys(support).length) warnings.push('Nessun docente di sostegno riconosciuto');
    return {support,supportMeta,warnings};
  }

  function sanitizeSupportHtml(html){
    const parsed=parseSupportHtml(html);
    let out='<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Orario docenti di sostegno</title></head><body>';
    out+='<h1>Orario docenti di sostegno</h1><p>Dati pubblici: classe e disciplina. Le iniziali degli alunni sono state rimosse automaticamente.</p>';
    for(const teacher of Object.keys(parsed.support)){
      const grid=parsed.support[teacher];
      out+=`<h2>${htmlEsc(teacher)} — SOSTEGNO</h2><table><thead><tr><th>Ora</th>${DAYS.map(d=>`<th>${htmlEsc(d)}</th>`).join('')}</tr></thead><tbody>`;
      for(let h=0;h<6;h++){
        out+=`<tr><th>${h+1}ª</th>`;
        for(let d=0;d<5;d++){
          const txt=grid[h][d].map(e=>`${e.class} · ${e.subject}`).join('<hr>');
          out+=`<td>${htmlEsc(txt).replace(/&lt;hr&gt;/g,'<hr>')}</td>`;
        }
        out+='</tr>';
      }
      out+='</tbody></table>';
    }
    return out+'</body></html>';
  }

  function parseNamesCell(text){
    return normSpace(text).split(/\s*,\s*/).map(normKey).filter(Boolean);
  }
  function dayIndexFromName(name){
    const n=normKey(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const map={LUNEDI:0,MARTEDI:1,MERCOLEDI:2,GIOVEDI:3,VENERDI:4};
    return Object.prototype.hasOwnProperty.call(map,n)?map[n]:-1;
  }
  function parseSurveillanceHtml(html){
    const doc=new DOMParser().parseFromString(String(html),'text/html');
    const surveillance={}, warnings=[];
    const areas=Array.from(doc.querySelectorAll('.area'));
    const containers=areas.length?areas:Array.from(doc.querySelectorAll('h2')).map(h2=>({querySelector:(sel)=>sel==='h2'?h2:nextTable(h2)}));
    for(const box of containers){
      const h2=box.querySelector('h2') || box.querySelector('.area-title');
      const table=box.querySelector('table');
      if(!h2||!table) continue;
      const area=normSpace(h2.textContent).replace(/^SORVEGLIANZA\s*[—–-]\s*/i,'');
      if(!area) continue;

      // Riconoscimento per intestazione: il parser non dipende più
      // dalla posizione fisica delle colonne nel file HTML.
      const allRows=Array.from(table.querySelectorAll('tr'));
      if(!allRows.length) continue;
      const headers=Array.from(allRows[0].children).map(c=>normKey(c.textContent));
      const col={};
      headers.forEach((h,i)=>{
        const compact=h.replace(/\s+/g,' ');
        if(/R1\s+OUT/.test(compact)) col.r1out=i;
        else if(/R1\s+IN/.test(compact)) col.r1in=i;
        else if(/R2\s+OUT/.test(compact)) col.r2out=i;
        else if(/R2\s+IN/.test(compact)) col.r2in=i;
      });
      const missing=SURV_KEYS.filter(k=>!Number.isInteger(col[k]));
      if(missing.length){
        warnings.push(`Colonne sorveglianza non riconosciute in ${area}: ${missing.join(', ')}`);
        continue;
      }

      const week=Array.from({length:5},()=>({r1out:[],r1in:[],r2out:[],r2in:[]}));
      for(const tr of allRows.slice(1)){
        const cells=Array.from(tr.children);
        if(!cells.length) continue;
        const day=dayIndexFromName(cells[0]?.textContent||'');
        if(day<0) continue;
        week[day]={
          r1out:parseNamesCell(cells[col.r1out]?.textContent||''),
          r1in:parseNamesCell(cells[col.r1in]?.textContent||''),
          r2out:parseNamesCell(cells[col.r2out]?.textContent||''),
          r2in:parseNamesCell(cells[col.r2in]?.textContent||'')
        };
      }
      surveillance[area]=week;
    }
    if(!Object.keys(surveillance).length) warnings.push('Nessuna area di sorveglianza riconosciuta');
    return {surveillance,warnings};
  }
  function surveillanceForTeacher(surveillance,teacher,day,key){
    const who=normKey(teacher), out=[];
    if(day<0||day>4||!SURV_KEYS.includes(key)) return out;
    for(const [area,week] of Object.entries(surveillance||{})){
      const names=week[day]&&week[day][key]||[];
      if(names.includes(who)) out.push(area);
    }
    return out;
  }
  function allTeacherNames(data){
    const set=new Set([...Object.keys(data.teachers||{}),...Object.keys(data.support||{})]);
    for(const week of Object.values(data.surveillance||{})) for(const day of week) for(const key of SURV_KEYS) for(const t of day[key]||[]) set.add(normKey(t));
    return [...set].filter(Boolean).sort((a,b)=>a.localeCompare(b,'it'));
  }

  function kindCode(kind){
    if(kind==='potagg') return 'POTAGG';
    if(kind==='pot') return 'POT';
    if(kind==='sost') return 'SOST';
    if(kind==='alt') return 'ALT';
    return 'CURR';
  }
  function atomicFromClasses(classes){
    const rows=[];
    for(const [cls,grid] of Object.entries(classes)){
      for(let h=0;h<6;h++) for(let d=0;d<5;d++){
        for(const e of grid[h][d]){
          const teachers=splitPlus(e.teacher); if(!teachers.length) teachers.push('');
          for(const teacher of teachers) rows.push({day:d,hour:h,class:normKey(cls),teacher:normKey(teacher),subject:normKey(e.subject),kind:kindCode(e.kind)});
        }
      }
    }
    return rows;
  }
  function atomicFromTeachers(teachers){
    const rows=[];
    for(const [teacher,grid] of Object.entries(teachers)){
      for(let h=0;h<6;h++) for(let d=0;d<5;d++){
        for(const e of grid[h][d]){
          const classes=splitPlus(e.class); if(!classes.length) classes.push('');
          for(const cls of classes) rows.push({day:d,hour:h,class:normKey(cls),teacher:normKey(teacher),subject:normKey(e.subject),kind:kindCode(e.kind)});
        }
      }
    }
    return rows;
  }
  function rowKey(r){ return [r.day,r.hour,r.class,r.teacher,r.subject,r.kind].join('|'); }
  function multiset(rows){ const m=new Map(); for(const r of rows){ const k=rowKey(r); m.set(k,(m.get(k)||0)+1); } return m; }
  function humanRow(r){ return `${DAYS[r.day]} ${r.hour+1}ª — ${r.class} — ${r.teacher} — ${pretty(r.subject)}${r.kind!=='CURR'?' ['+r.kind+']':''}`; }
  function validate(classes,teachers){
    const ca=atomicFromClasses(classes), ta=atomicFromTeachers(teachers), cm=multiset(ca), tm=multiset(ta);
    const onlyClass=[], onlyTeacher=[], allKeys=new Set([...cm.keys(),...tm.keys()]);
    for(const k of allKeys){
      const c=cm.get(k)||0, t=tm.get(k)||0;
      if(c>t){ const r=ca.find(x=>rowKey(x)===k); for(let i=0;i<c-t;i++) onlyClass.push({...r,text:humanRow(r)}); }
      if(t>c){ const r=ta.find(x=>rowKey(x)===k); for(let i=0;i<t-c;i++) onlyTeacher.push({...r,text:humanRow(r)}); }
    }
    const teacherSlot=new Map();
    for(const r of ta){ const k=[r.day,r.hour,r.teacher].join('|'); if(!teacherSlot.has(k)) teacherSlot.set(k,[]); teacherSlot.get(k).push(r); }
    const overlaps=[];
    for(const arr of teacherSlot.values()){
      const unique=[...new Set(arr.map(r=>r.class))], subjects=[...new Set(arr.map(r=>r.subject))], kinds=[...new Set(arr.map(r=>r.kind))];
      if(unique.length>1 && !(unique.length===2 && subjects.length===1 && kinds.length===1 && /TEDESCO\s*\/\s*FRANCESE/.test(subjects[0]))) overlaps.push({teacher:arr[0].teacher,day:arr[0].day,hour:arr[0].hour,classes:unique,subjects});
    }
    return {classAtomic:ca.length,teacherAtomic:ta.length,differences:onlyClass.length+onlyTeacher.length,onlyClass,onlyTeacher,overlaps,ok:onlyClass.length===0&&onlyTeacher.length===0&&overlaps.length===0};
  }
  function parseBoth(classHtml,teacherHtml){
    const c=parseClassHtml(classHtml), t=parseTeacherHtml(teacherHtml), qa=validate(c.classes,t.teachers);
    return {days:DAYS.slice(),classes:c.classes,teachers:t.teachers,teacherMeta:t.teacherMeta,qa,warnings:[...c.warnings,...t.warnings]};
  }
  function parseAll(classHtml,teacherHtml,supportHtml,survHtml){
    const base=parseBoth(classHtml,teacherHtml), s=parseSupportHtml(supportHtml), v=parseSurveillanceHtml(survHtml);
    return {...base,support:s.support,supportMeta:s.supportMeta,surveillance:v.surveillance,warnings:[...base.warnings,...s.warnings,...v.warnings]};
  }
  function formatValidation(data){
    const q=data.qa;
    return {classes:Object.keys(data.classes||{}).length,teachers:Object.keys(data.teachers||{}).length,supportTeachers:Object.keys(data.support||{}).length,surveillanceAreas:Object.keys(data.surveillance||{}).length,classAtomic:q.classAtomic,teacherAtomic:q.teacherAtomic,differences:q.differences,overlaps:q.overlaps.length,warnings:data.warnings.length,ok:q.ok&&data.warnings.length===0};
  }

  global.FermiCore={DAYS,SURV_KEYS,SURV_LABELS,normSpace,normKey,pretty,htmlEsc,parseClassHtml,parseTeacherHtml,parseSupportHtml,sanitizeSupportHtml,parseSurveillanceHtml,surveillanceForTeacher,allTeacherNames,validate,parseBoth,parseAll,formatValidation};
})(window);
