/* ===== Hoan Nhạc Công Quán: phần dùng chung cho mọi trang =====
   Thanh điều hướng, đăng nhập, thông báo, hộp thoại bán, báo cáo, xem chi tiết sách.
   Cần nạp sau thư viện supabase-js. Trang đặt <body data-page="home|library|market"> để tô sáng mục đang mở. */
(function(){
'use strict';
const SB_URL='https://topbjzzygpsfchqpxepm.supabase.co';
const SB_KEY='sb_publishable_MM_YksiOIgC_Xi8u6sqi7w_AQQ81fZe';
const $=(s,r)=>(r||document).querySelector(s);
const root=document.documentElement;
try{const t=localStorage.getItem('hn-theme');if(t)root.dataset.theme=t}catch(e){}
const sb=window.supabase?window.supabase.createClient(SB_URL,SB_KEY):null;
const HN={sb,user:null,profile:null,$};
window.HN=HN;

HN.fmtD=t=>t?new Date(t).toLocaleDateString('vi-VN'):'';
HN.isReal=()=>!!HN.user&&!HN.user.is_anonymous;
HN.isGuest=()=>!HN.user||!!HN.user.is_anonymous;
HN.nameOf=u=>u.is_anonymous?'Khách':((u.user_metadata&&(u.user_metadata.name||u.user_metadata.username))||(u.email||'').split('@')[0]);
let toastT;
HN.msg=(t,ms)=>{const e=$('#hn-toast');e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{e.hidden=true},ms||3500)};

/* ---------- khung trang ---------- */
function build(){
  const page=document.body.dataset.page||'';
  const nav=document.createElement('header');nav.className='nav';
  nav.innerHTML=
  '<nav class="pill" aria-label="Điều hướng chính">'+
    '<button class="ic" id="hn-menuBtn" aria-label="Mở menu"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>'+
    '<a class="ic" href="index.html" aria-label="Trang chủ Hoan Nhạc Công Quán"><svg viewBox="0 0 24 24"><path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg></a>'+
    '<a class="tx" data-p="library" href="thu-vien.html">Thư Viện</a>'+
    '<a class="tx" data-p="market" href="cho.html">Chợ Trao Đổi</a>'+
    '<a class="tx" data-p="studio" href="editor.html">Xưởng Soạn</a>'+
    '<input id="hn-q" type="search" placeholder="Tìm truyện, tác giả…" aria-label="Tìm kiếm" hidden>'+
    '<button class="ic" id="hn-searchBtn" aria-label="Tìm kiếm"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg></button>'+
  '</nav>'+
  '<div class="pill">'+
    '<button class="ic" id="hn-bell" aria-label="Thông báo"><svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15zM10 21h4"/></svg></button>'+
    '<button class="ic" id="hn-theme" aria-label="Đổi giao diện sáng tối"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg></button>'+
    '<span class="gem" id="hn-gem" hidden></span>'+
    '<button class="av" id="hn-av" aria-label="Tài khoản" title="Đăng nhập"></button>'+
  '</div>'+
  '<div class="pop" id="hn-bellPop" hidden>Chưa có thông báo mới.</div>'+
  '<div class="pop" id="hn-menu" hidden></div>';
  const a=nav.querySelector('[data-p="'+page+'"]');if(a)a.classList.add('on');

  const dr=document.createElement('aside');dr.id='hn-drawer';dr.hidden=true;dr.setAttribute('aria-label','Menu');
  dr.innerHTML='<nav><p class="t">Hoan Nhạc Công Quán</p><a href="index.html">Trang chủ</a><a href="thu-vien.html">Thư Viện</a><a href="cho.html">Chợ Trao Đổi</a><a href="editor.html">Xưởng Soạn</a></nav>';

  const toast=document.createElement('div');toast.id='hn-toast';toast.hidden=true;toast.setAttribute('role','status');

  const dlg=document.createElement('dialog');dlg.id='hn-auth';
  dlg.innerHTML=
  '<div class="dlg">'+
    '<h2 id="hn-aTitle">Đăng nhập</h2>'+
    '<table class="atbl">'+
      '<tr id="hn-rUid"><th>UID</th><td><input id="hn-aUid" inputmode="numeric" maxlength="10" autocomplete="off"></td></tr>'+
      '<tr id="hn-rUser"><th>Username</th><td><input id="hn-aUser" maxlength="25" placeholder="@username" autocomplete="username"></td></tr>'+
      '<tr id="hn-rName"><th>Name</th><td><input id="hn-aName" maxlength="40" placeholder="Tên hiển thị" autocomplete="name"></td></tr>'+
      '<tr id="hn-rMail"><th>Email</th><td><input id="hn-aMail" type="email" autocomplete="email"></td></tr>'+
      '<tr id="hn-rPass"><th>Mật khẩu</th><td><input id="hn-aPass" type="password" autocomplete="current-password"></td></tr>'+
    '</table>'+
    '<div class="amsg" id="hn-aMsg"></div>'+
    '<button type="button" class="pri" id="hn-aGo" style="padding:11px 16px;font-size:16px">Đăng nhập</button>'+
    '<p style="margin:0;text-align:center" id="hn-aFg"><a href="#" id="hn-aForgot" style="color:var(--acc);font-weight:600">Quên mật khẩu?</a></p>'+
    '<p style="margin:0;text-align:center;color:var(--mute)"><span id="hn-aAsk">Bạn chưa có tài khoản?</span> <a href="#" id="hn-aSw" style="color:var(--acc);font-weight:600">Đăng ký</a> / <a href="#" id="hn-aGuest" style="color:var(--acc);font-weight:600">Tài khoản khách</a></p>'+
  '</div>';

  document.body.prepend(nav,dr,toast);
  document.body.appendChild(dlg);
  document.querySelectorAll('dialog').forEach(addX);
}
function addX(d){
  if(d.querySelector('.xbtn'))return;
  const x=document.createElement('button');x.type='button';x.className='xbtn';x.textContent='✕';x.setAttribute('aria-label','Đóng');x.onclick=()=>d.close();d.appendChild(x);
}
HN.dialog=function(id,html){
  let d=document.getElementById(id);
  if(!d){d=document.createElement('dialog');d.id=id;document.body.appendChild(d)}
  d.innerHTML=html;addX(d);return d;
};

/* ---------- tìm kiếm trong trang ---------- */
HN.filter=function(){
  const k=($('#hn-q').value||'').trim().toLowerCase();
  document.querySelectorAll('.card[data-s]').forEach(c=>{c.hidden=!!k&&!c.dataset.s.includes(k)});
};

/* ---------- thẻ sách ---------- */
HN.card=function(o){
  const c=document.createElement(o.href?'a':'div');c.className='card'+(o.onclick?' click':'');
  if(o.href)c.href=o.href;
  c.dataset.s=((o.search||o.title||'')+'').toLowerCase();
  if(o.onclick){c.tabIndex=0;c.setAttribute('role','button');c.onclick=o.onclick;c.onkeydown=e=>{if(e.key==='Enter')o.onclick(e)}}
  const cv=document.createElement('div');cv.className='cv';
  if(o.cover){const im=document.createElement('img');im.src=o.cover;im.alt='Bìa '+o.title;im.loading='lazy';cv.appendChild(im)}else cv.textContent=o.title;
  const cb=document.createElement('div');cb.className='cb';
  const b=document.createElement('b');b.textContent=o.title;cb.appendChild(b);
  if(o.sub){const s=document.createElement('small');s.textContent=o.sub;cb.appendChild(s)}
  if(o.desc){const s=document.createElement('div');s.className='ds';s.textContent=o.desc;cb.appendChild(s)}
  if(o.price!=null){const p=document.createElement('span');p.className='price';p.textContent='💎 '+o.price;cb.appendChild(p)}
  c.append(cv,cb);
  if(o.actions&&o.actions.length){
    const a=document.createElement('div');a.className='act';
    o.actions.forEach(x=>{
      const bt=document.createElement(x.href?'a':'button');bt.textContent=x.label;
      if(x.href)bt.href=x.href;else{bt.type='button';bt.onclick=e=>{e.stopPropagation();x.fn(bt)}}
      if(x.cls)bt.className=x.cls;a.appendChild(bt);
    });
    c.appendChild(a);
  }
  return c;
};
/* nút cần bấm 2 lần để xác nhận */
HN.confirmAct=(label,confirmLabel,fn)=>({label,cls:'bad',fn:bt=>{
  if(!bt.dataset.arm){bt.dataset.arm=1;bt.textContent=confirmLabel;setTimeout(()=>{delete bt.dataset.arm;bt.textContent=label},3500);return}
  fn();
}});

/* ---------- xem chi tiết sách công khai (chỉ bìa, thông tin, giới thiệu) ---------- */
HN.showBook=function(b){
  const d=HN.dialog('hn-book','<div class="dlg"><h2></h2><div class="det"><div class="cv"></div><div><p class="bi" style="margin:0 0 8px;color:var(--mute)"></p><p class="bd" style="margin:0;white-space:pre-wrap"></p></div></div><small style="color:var(--mute)">Chỉ hiển thị bìa, thông tin và giới thiệu. Nội dung truyện không công khai ở đây.</small></div>');
  $('h2',d).textContent=b.title||'Chưa đặt tên';
  const cv=$('.cv',d);if(b.cover){const im=document.createElement('img');im.src=b.cover;im.alt='';cv.appendChild(im)}else cv.textContent=b.title||'';
  $('.bi',d).textContent=[b.author,(b.chapters||0)+' chương','đăng bởi '+(b.owner_name||'ẩn danh'),'cập nhật '+HN.fmtD(b.updated_at)].filter(Boolean).join(' · ');
  $('.bd',d).textContent=b.description||'Tác giả chưa viết lời giới thiệu.';
  d.showModal();
};

/* ---------- đăng bán / đổi giá ---------- */
HN.openSell=function(book,listing,done){
  const d=HN.dialog('hn-sell','<div class="dlg"><h2></h2><div class="st1" style="font-weight:600"></div>'+
    '<label>Giá (💎)<input id="hn-sPrice" type="number" min="1" max="100000"></label>'+
    '<label>Mô tả ngắn<textarea id="hn-sDesc" rows="3" maxlength="300"></textarea></label>'+
    '<label style="display:flex;gap:8px;align-items:center;flex-direction:row"><input id="hn-sOk" type="checkbox">Tôi là tác giả hoặc có quyền phân phối nội dung này</label>'+
    '<div class="amsg" id="hn-sMsg"></div><div class="row"><button type="button" class="pri" id="hn-sGo">Lưu</button></div></div>');
  $('h2',d).textContent=listing?'Đổi giá / mô tả':'Đăng lên chợ';
  $('.st1',d).textContent=book.title||'Chưa đặt tên';
  $('#hn-sPrice').value=listing?listing.price:50;
  $('#hn-sDesc').value=(listing?listing.description:book.description)||'';
  $('#hn-sOk').checked=!!listing;
  $('#hn-sGo').onclick=async()=>{
    const price=parseInt($('#hn-sPrice').value,10),M=$('#hn-sMsg');M.style.color='var(--danger)';
    if(!(price>=1&&price<=100000)){M.textContent='Giá từ 1 đến 100000 💎.';return}
    if(!$('#hn-sOk').checked){M.textContent='Hãy xác nhận bạn có quyền phân phối nội dung này.';return}
    M.style.color='var(--mute)';M.textContent='Đang lưu…';
    const q=await sb.rpc('list_book',{p_book:book.id,p_price:price,p_desc:$('#hn-sDesc').value.trim()});
    if(q.error){M.style.color='var(--danger)';M.textContent=q.error.message;return}
    d.close();HN.msg(listing?'Đã cập nhật tin bán.':'Đã đăng "'+(book.title||'sách')+'" lên chợ.',4500);
    if(done)done();
  };
  d.showModal();
};

/* ---------- báo cáo ---------- */
HN.openReport=function(m){
  if(!HN.isReal()){HN.msg('Hãy đăng nhập tài khoản thật để báo cáo.');HN.openAuth();return}
  const d=HN.dialog('hn-report','<div class="dlg"><h2>Báo cáo sách</h2><div class="rt" style="font-weight:600"></div>'+
    '<label>Lý do<select id="hn-rReason"><option>Vi phạm bản quyền</option><option>Nội dung không phù hợp</option><option>Spam hoặc lừa đảo</option><option>Khác</option></select></label>'+
    '<label>Ghi chú (không bắt buộc)<textarea id="hn-rNote" rows="3" maxlength="300"></textarea></label>'+
    '<div class="amsg" id="hn-rMsg"></div><div class="row"><button type="button" class="pri" id="hn-rGo">Gửi báo cáo</button></div></div>');
  $('.rt',d).textContent=m.title||'Chưa đặt tên';
  $('#hn-rGo').onclick=async()=>{
    const q=await sb.rpc('report_item',{p_item:m.id,p_reason:$('#hn-rReason').value,p_note:$('#hn-rNote').value.trim()});
    if(q.error){$('#hn-rMsg').textContent=q.error.message;return}
    d.close();HN.msg('Đã gửi báo cáo. Cảm ơn bạn!',4500);
  };
  d.showModal();
};

/* ---------- đăng nhập / đăng ký / khách ---------- */
let amode='in',guestLocal=false;
function setMode(m){
  amode=m;
  $('#hn-aTitle').textContent=m==='up'?'Đăng ký tài khoản':m==='forgot'?'Quên mật khẩu':'Đăng nhập';
  $('#hn-rUid').hidden=m==='forgot';$('#hn-rUser').hidden=m==='forgot';$('#hn-rName').hidden=m!=='up';$('#hn-rPass').hidden=m==='forgot';
  $('#hn-aGo').textContent=m==='in'?'Đăng nhập':m==='up'?'Đăng ký':'Gửi liên kết đặt lại';
  $('#hn-aAsk').textContent=m==='in'?'Bạn chưa có tài khoản?':m==='up'?'Đã có tài khoản?':'Nhớ mật khẩu rồi?';
  $('#hn-aSw').textContent=m==='in'?'Đăng ký':'Đăng nhập';
  $('#hn-aFg').hidden=m!=='in';
  const u=$('#hn-aUid');u.disabled=m==='up';u.value='';u.placeholder=m==='up'?'Tự động cấp khi đăng ký':'Bắt buộc';
  $('#hn-aMsg').textContent='';$('#hn-aMsg').style.color='var(--danger)';
}
HN.openAuth=function(mode){setMode(mode||'in');$('#hn-aPass').value='';$('#hn-auth').showModal()};
async function auth(){
  const A=$('#hn-aMsg'),bad=t=>{A.style.color='var(--danger)';A.textContent=t};
  if(!sb)return bad('Chưa kết nối được máy chủ.');
  const uname=$('#hn-aUser').value.replace(/^@/,'').trim(),dname=$('#hn-aName').value.trim(),password=$('#hn-aPass').value,mail=$('#hn-aMail').value.trim(),uidIn=$('#hn-aUid').value.trim();
  const okU=/^[A-Za-z0-9_.]{3,24}$/.test(uname),okM=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  A.style.color='var(--mute)';
  if(amode==='forgot'){
    if(!okM)return bad('Nhập email đã dùng khi đăng ký.');
    A.textContent='Đang gửi…';
    const r=await sb.auth.resetPasswordForEmail(mail,{redirectTo:new URL('editor.html',location.href).href});
    if(r.error)return bad(r.error.message);
    A.textContent='Đã gửi (nếu email đúng). Hãy mở email và bấm liên kết để đặt mật khẩu mới.';return;
  }
  if(!okU)return bad('Username có dạng @tenban, dài 3 đến 24 ký tự: chữ không dấu, số, dấu _ hoặc dấu chấm.');
  if(password.length<6)return bad('Mật khẩu cần từ 6 ký tự.');
  if(amode==='in'){
    const fail='Sai UID, Username, email hoặc mật khẩu.';
    if(!/^\d{6,10}$/.test(uidIn))return bad('UID là bắt buộc (dãy số được cấp khi đăng ký).');
    if(!okM)return bad('Nhập email đã dùng khi đăng ký.');
    A.textContent='Đang xử lý…';
    const r=await sb.auth.signInWithPassword({email:mail,password});
    if(r.error)return bad(/banned/i.test(r.error.message)?'Tài khoản này đang bị khóa hoặc bị cấm.':fail);
    const md=r.data.user.user_metadata||{};
    if(String(md.uid)!==uidIn||String(md.username||'').toLowerCase()!==uname.toLowerCase()){await sb.auth.signOut();return bad(fail)}
    guestLocal=false;$('#hn-auth').close();HN.msg('Đã đăng nhập.');return;
  }
  if(!dname||dname.length>40)return bad('Hãy nhập Name (tên hiển thị, tối đa 40 ký tự).');
  if(!okM)return bad('Nhập email hợp lệ (dùng để lấy lại mật khẩu).');
  A.textContent='Đang xử lý…';
  let r,uid;
  for(let k=0;k<3;k++){
    uid=String(Math.floor(1e7+Math.random()*9e7));
    r=await sb.auth.signUp({email:mail,password,options:{data:{username:uname,name:dname,uid}}});
    if(!r.error||!/database/i.test(r.error.message))break;
  }
  if(r.error)return bad(/registered|exists/i.test(r.error.message)?'Email này đã được đăng ký.':/database/i.test(r.error.message)?'Username này đã có người dùng.':r.error.message);
  guestLocal=false;$('#hn-auth').close();
  HN.msg(r.data.session?'Đăng ký thành công. UID của bạn là '+uid+', hãy ghi nhớ.':'Đã gửi email xác nhận. Hãy bấm liên kết trong email rồi đăng nhập. UID của bạn là '+uid+', hãy ghi nhớ.',12000);
}
async function useGuest(){
  let ok=false;
  if(sb&&!HN.user){try{const r=await sb.auth.signInAnonymously();ok=!r.error}catch(e){}}
  if(!ok&&!HN.user)guestLocal=true;
  $('#hn-auth').close();paint();
  HN.msg(ok?'Bạn đang dùng tài khoản khách: kệ tạm 1 đến 3 ngày, tối đa 5 lượt xuất/tải EPUB mỗi ngày.':'Đã vào chế độ khách (chỉ xem).',5000);
  subs.forEach(f=>f());
}
HN.signOut=async()=>{guestLocal=false;if(sb&&HN.user)await sb.auth.signOut();HN.user=null;HN.profile=null;paint();subs.forEach(f=>f());HN.msg('Đã đăng xuất.')};

/* ---------- trạng thái tài khoản ---------- */
function avHue(u){const n=parseInt(u,10)||0;return n%2?100+n%50:28+n%12}
function paint(){
  const av=$('#hn-av'),gem=$('#hn-gem');
  av.textContent='';av.style.background='';
  if(HN.isReal()){
    const md=HN.user.user_metadata||{},nm=HN.nameOf(HN.user);
    av.title=nm;av.setAttribute('aria-label','Tài khoản '+nm);
    av.style.background='hsl('+avHue(md.uid)+' 38% 36%)';
    if(HN.profile&&HN.profile.avatar){const im=document.createElement('img');im.src=HN.profile.avatar;im.alt='';av.appendChild(im)}
    else av.textContent=(nm[0]||'?').toUpperCase();
    gem.hidden=false;gem.textContent='💎 '+((HN.profile&&HN.profile.gems)||0);
  }else{
    gem.hidden=true;
    av.title=(HN.user||guestLocal)?'Tài khoản khách':'Đăng nhập';av.setAttribute('aria-label',av.title);
    av.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20c.9-4 4-5.6 7.5-5.6s6.6 1.6 7.5 5.6"/></svg>';
  }
}
function menu(){
  const m=$('#hn-menu');m.textContent='';
  if(HN.isReal()){
    const md=HN.user.user_metadata||{};
    const h=document.createElement('div');h.className='mh';
    const b=document.createElement('b');b.textContent=HN.nameOf(HN.user);
    const s1=document.createElement('small');s1.textContent=(md.username?'@'+md.username+' · ':'')+'UID '+(md.uid||'—');
    const s2=document.createElement('small');s2.textContent='💎 '+((HN.profile&&HN.profile.gems)||0);
    h.append(b,s1,s2);m.appendChild(h);
    [['📚 Kệ của tôi','thu-vien.html#private'],['🏪 Cửa hàng của tôi','cho.html#mine'],['👤 Tài khoản & điểm danh','tai-khoan.html']].forEach(x=>{const a=document.createElement('a');a.href=x[1];a.textContent=x[0];m.appendChild(a)});
    const o=document.createElement('button');o.className='mi';o.type='button';o.textContent='Đăng xuất';o.onclick=()=>{m.hidden=true;HN.signOut()};m.appendChild(o);
  }else{
    const p=document.createElement('p');p.style.cssText='margin:0 0 8px;color:var(--mute);font-size:14px';
    p.textContent='Bạn đang dùng tài khoản khách: xem kệ công khai và chợ; kệ tạm 1 đến 3 ngày; tối đa 5 lượt xuất/tải EPUB mỗi ngày.';m.appendChild(p);
    const a=document.createElement('button');a.className='mi';a.type='button';a.textContent='Đăng nhập / Đăng ký';a.onclick=()=>{m.hidden=true;HN.openAuth()};m.appendChild(a);
    const o=document.createElement('button');o.className='mi';o.type='button';o.textContent='Thoát tài khoản khách';o.onclick=()=>{m.hidden=true;HN.signOut()};m.appendChild(o);
  }
}
const subs=[];let ready=false;
HN.start=fn=>{subs.push(fn);if(ready)fn()};
async function refreshMe(){
  if(!sb){HN.user=null;HN.profile=null;paint();return}
  try{
    const s=await sb.auth.getSession();HN.user=(s.data&&s.data.session&&s.data.session.user)||null;
    HN.profile=null;
    if(HN.isReal()){const p=await sb.from('profiles').select('name,avatar,gems').eq('id',HN.user.id).maybeSingle();HN.profile=p.error?null:p.data}
  }catch(e){HN.user=null;HN.profile=null}
  paint();
}
HN.reloadMe=async()=>{await refreshMe()};

/* ---------- khởi động ---------- */
function init(){
  build();
  $('#hn-theme').onclick=()=>{const t=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=t;try{localStorage.setItem('hn-theme',t)}catch(e){}};
  const dr=$('#hn-drawer');
  $('#hn-menuBtn').onclick=()=>{dr.hidden=false};
  dr.addEventListener('click',e=>{if(e.target===dr||e.target.closest('a'))dr.hidden=true});
  $('#hn-bell').onclick=e=>{e.stopPropagation();$('#hn-menu').hidden=true;$('#hn-bellPop').hidden=!$('#hn-bellPop').hidden};
  $('#hn-av').onclick=e=>{
    e.stopPropagation();$('#hn-bellPop').hidden=true;
    if(!HN.user&&!guestLocal){HN.openAuth();return}
    const m=$('#hn-menu');if(m.hidden){menu();m.hidden=false}else m.hidden=true;
  };
  document.addEventListener('click',e=>{if(!e.target.closest('.pop'))document.querySelectorAll('.pop').forEach(p=>{p.hidden=true})});
  $('#hn-searchBtn').onclick=()=>{const q=$('#hn-q');q.hidden=!q.hidden;if(!q.hidden)q.focus();else{q.value='';HN.filter()}};
  $('#hn-q').oninput=HN.filter;
  $('#hn-aGo').onclick=auth;
  $('#hn-aSw').onclick=e=>{e.preventDefault();setMode(amode==='in'?'up':'in')};
  $('#hn-aForgot').onclick=e=>{e.preventDefault();setMode('forgot')};
  $('#hn-aGuest').onclick=e=>{e.preventDefault();useGuest()};
  $('#hn-auth').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();auth()}});
  $('#hn-aUser').addEventListener('input',e=>{const v=e.target.value.replace(/[^A-Za-z0-9_.]/g,'');e.target.value=v?'@'+v:''});
  setMode('in');paint();
  refreshMe().then(()=>{
    ready=true;subs.forEach(f=>f());
    if(sb)sb.auth.onAuthStateChange((ev)=>{
      if(ev==='INITIAL_SESSION')return;
      setTimeout(async()=>{await refreshMe();subs.forEach(f=>f())},0);
    });
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
