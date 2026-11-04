// Pantalla de carga (arranque y cambio de día). Script clásico: se ejecuta antes que los módulos, así se ve desde el primer instante.
(function () {
  var el = document.getElementById('loading');
  if (!el) return;
  var bar = el.querySelector('.ld-bar i'), txt = el.querySelector('.ld-text'), title = el.querySelector('.ld-title'), sub = el.querySelector('.ld-sub'), img = el.querySelector('.ld-art img');
  var PHRASES = ['Eligiendo el próximo libro…', 'Colocando marcapáginas…', 'Preparando el té…', 'Barriendo las hojas de la entrada…', 'Ordenando las estanterías…', 'Despertando al gato de la librería…', 'Puliendo el mostrador…', 'Encendiendo las lámparas…', 'Buscando el libro perfecto…', 'Abriendo la persiana…'];
  var prog = 0, target = 0, t0 = 0, minMs = 0, raf = 0, phraseTimer = 0, order = [], pi = 0, shown = false, hiding = null;

  function shuffle() { order = PHRASES.slice().sort(function () { return Math.random() - 0.5; }); pi = 0; }
  function nextPhrase() { if (pi >= order.length) shuffle(); txt.textContent = order[pi++]; }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    var elapsed = now - t0;
    // avance suave: sube solo hasta un tope y los hitos reales (Loading.set) lo empujan más allá
    var creep = Math.min(0.85, 0.08 + elapsed / 6000);
    var want = hiding ? 1 : Math.max(creep, Math.min(target, 0.95));
    prog += (want - prog) * 0.08;
    bar.style.width = (prog * 100).toFixed(1) + '%';
    if (hiding && prog > 0.985 && elapsed >= minMs) finishHide();
  }
  function finishHide() {
    var res = hiding; hiding = null;
    cancelAnimationFrame(raf); clearInterval(phraseTimer);
    bar.style.width = '100%';
    el.classList.remove('on');
    setTimeout(function () { el.hidden = true; shown = false; res && res(); }, 450);
  }

  var L = {
    // kind: 'boot' | 'day'. Devuelve una promesa que se cumple cuando la pantalla ya cubre todo.
    show: function (o) {
      o = o || {};
      return new Promise(function (resolve) {
        if (hiding) { hiding = null; }
        el.hidden = false; el.dataset.kind = o.kind || 'boot';
        el.classList.toggle('has-diary', !!o.diary); el.classList.remove('ready'); el.querySelector('.ld-next').hidden = true;
        el.querySelector('.ld-diary').classList.remove('open');
        title.textContent = o.title || ''; sub.textContent = o.sub || ''; sub.hidden = !o.sub;
        var src = o.img || (o.kind === 'day' ? 'arte/pantallas/dia.jpg' : 'arte/pantallas/carga.jpg');
        el.querySelector('.ld-art').classList.remove('has-img');
        img.onload = function () { el.querySelector('.ld-art').classList.add('has-img'); };
        img.onerror = function () { el.querySelector('.ld-art').classList.remove('has-img'); };
        img.src = src;
        prog = 0; target = 0.08; minMs = o.minMs || 2200; t0 = performance.now(); shown = true;
        shuffle(); nextPhrase(); clearInterval(phraseTimer); phraseTimer = setInterval(nextPhrase, 1100);
        bar.style.width = '0%';
        cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
        requestAnimationFrame(function () { el.classList.add('on'); setTimeout(resolve, 320); });
      });
    },
    set: function (p) { target = Math.max(target, p); },
    hint: function (t) { var h = el.querySelector('.ld-hint'); h.textContent = t || ''; h.hidden = !t; },
    // Escribe la página del diario y la pasa. d = { day, lines: [...], todo: [...], sign }
    diary: function (d) {
      return new Promise(function (resolve) {
      var box = el.querySelector('.ld-diary'), page = box.querySelector('.ld-page');
      page.querySelector('.dy-day').textContent = d.day;
      var body = page.querySelector('.dy-body'); body.innerHTML = '';
      var n = 0;
      (d.lines || []).forEach(function (t) { var p = document.createElement('p'); p.textContent = t; p.style.animationDelay = (0.5 + n++ * 0.7) + 's'; body.appendChild(p); });
      if (d.todo && d.todo.length) {
        var ul = document.createElement('ul');
        d.todo.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; li.style.animationDelay = (0.5 + n++ * 0.7) + 's'; ul.appendChild(li); });
        body.appendChild(ul);
      }
      var sg = page.querySelector('.dy-sign'); sg.textContent = d.sign || ''; sg.style.animationDelay = (0.5 + n * 0.7) + 's';
      box.classList.remove('open'); void box.offsetWidth; box.classList.add('open');
      // cuando termina de escribirse: la barra se completa y aparece el botón para pasar de día
      var btn = el.querySelector('.ld-next');
      setTimeout(function () {
        target = 1; el.classList.add('ready'); btn.hidden = false;
        btn.onclick = function () { btn.onclick = null; btn.hidden = true; resolve(); };
      }, (0.5 + n * 0.7 + 1.2) * 1000);
      });
    },
    hide: function () {
      if (!shown) return Promise.resolve();
      return new Promise(function (res) { hiding = res; target = 1; });
    },
  };
  window.Loading = L;
  var nombre = (window.APP && window.APP.name) || 'Mi librería de barrio';
  L.show({ kind: 'boot', title: nombre, minMs: 4200 });
})();
