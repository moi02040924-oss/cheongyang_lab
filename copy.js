/* 청양·홍성 AI 강사양성 실습 사이트 v2 — 공용 스크립트 (외부 전송 없음)
   1) [복사하기] 버튼  2) '했어요' 체크박스 저장(이 폰/컴퓨터의 브라우저 안에만 저장)
   3) 인쇄할 때 접이식 상자 모두 펼치기 */
(function () {
  // ---------- 1) 복사하기 ----------
  function selectText(el) {
    try {
      var r = document.createRange(); r.selectNodeContents(el);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    } catch (e) { /* 무시 */ }
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    var original = b.textContent;
    var box = document.getElementById(b.getAttribute('data-copy'));
    var msg = document.createElement('p');
    msg.className = 'copymsg'; msg.hidden = true; b.parentNode.appendChild(msg);
    b.addEventListener('click', function () {
      var text = box ? box.innerText : '';
      function done(ok) {
        if (ok) {
          b.textContent = '복사됨 ✓'; msg.hidden = true;
        } else {
          // 복사가 막힌 폰·브라우저 대비: 글자를 미리 선택해 두고 안내
          if (box) selectText(box);
          b.textContent = '복사가 안 됐어요';
          msg.hidden = false;
          msg.textContent = '검은 상자 글자가 선택되어 있습니다. 글자를 길게 눌러 [복사]를 고르세요. (컴퓨터는 Ctrl+C)';
        }
        setTimeout(function () { b.textContent = original; }, 2200);
      }
      try {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
        } else { fallback(); }
      } catch (e) { fallback(); }
      function fallback() {
        try {
          var ta = document.createElement('textarea');
          ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          var ok = document.execCommand('copy'); document.body.removeChild(ta); done(ok);
        } catch (e) { done(false); }
      }
    });
  });

  // ---------- 1-2) 주소 복사 버튼 (사이트 링크 옆) ----------
  function copyPlain(text, done) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fb(); });
      } else { fb(); }
    } catch (e) { fb(); }
    function fb() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy'); document.body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
  }
  document.querySelectorAll('[data-addr]').forEach(function (b) {
    var original = b.textContent;
    var msg = document.createElement('span');
    msg.className = 'copymsg'; msg.hidden = true; b.parentNode.appendChild(msg);
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-addr');
      copyPlain(url, function (ok) {
        if (ok) { b.textContent = '복사됨 ✓'; msg.hidden = true; }
        else {
          b.textContent = '복사가 안 됐어요'; msg.hidden = false;
          msg.textContent = '주소 글자를 길게 눌러 [복사]를 고르세요. (컴퓨터는 Ctrl+C)';
          var a = b.parentNode.querySelector('.addr');
          if (a) selectText(a);
        }
        setTimeout(function () { b.textContent = original; }, 2200);
      });
    });
  });

  // ---------- 2) 지금 어디까지 했나 (체크박스) ----------
  var KEY = 'cyhs-v2:' + location.pathname.split('/').pop();
  var boxes = Array.prototype.slice.call(document.querySelectorAll('input[data-ck]'));
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { state = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 저장이 막혀도 괜찮음 */ } }
  function refresh() {
    var n = 0;
    boxes.forEach(function (c) {
      var id = c.getAttribute('data-ck');
      c.checked = !!state[id];
      var step = c.closest('.step'); if (step) step.classList.toggle('done', c.checked);
      if (c.checked) n++;
    });
    var total = boxes.length;
    var t = document.getElementById('progText'), bar = document.getElementById('progBar');
    if (t) t.textContent = total ? ('지금까지 ' + total + '칸 중 ' + n + '칸 했어요') : '';
    if (bar) bar.style.width = total ? (100 * n / total) + '%' : '0';
  }
  boxes.forEach(function (c) {
    c.addEventListener('change', function () {
      var id = c.getAttribute('data-ck');
      if (c.checked) state[id] = 1; else delete state[id];
      save(); refresh();
    });
  });
  var reset = document.getElementById('progReset');
  if (reset) reset.addEventListener('click', function () {
    if (window.confirm('체크한 표시를 모두 지울까요?')) { state = {}; save(); refresh(); }
  });
  refresh();

  // ---------- 3) 인쇄 때 접이식 모두 펼치기 ----------
  var opened = [];
  window.addEventListener('beforeprint', function () {
    opened = [];
    document.querySelectorAll('details').forEach(function (d) { if (!d.open) { d.open = true; opened.push(d); } });
  });
  window.addEventListener('afterprint', function () {
    opened.forEach(function (d) { d.open = false; }); opened = [];
  });
})();
