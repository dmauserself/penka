/* Пенка — небольшие сценарии страницы */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Данные. Их удобно править прямо здесь.
     ------------------------------------------------------------------ */

  /* Часы работы в минутах от полуночи */
  var HOURS = {
    weekday: { open: 8 * 60, close: 21 * 60 },
    weekend: { open: 9 * 60, close: 22 * 60 }
  };

  /* Что печём по дням недели (0 — воскресенье) */
  var BAKES = [
    'чак-чак по рецепту бабушки Наили',
    'булочки с кардамоном',
    'морковный пирог',
    'круассаны с миндальным кремом',
    'печенье с шоколадом и морской солью',
    'баскский чизкейк',
    'яблочный пирог с корицей'
  ];

  /* Зерно недели — меняется по кругу каждый понедельник */
  var BEANS = [
    { name: 'Эфиопия, Иргачеффе', notes: ['жасмин', 'бергамот', 'персик'], meta: 'Мытая обработка, светлая обжарка' },
    { name: 'Колумбия, Уила', notes: ['карамель', 'красное яблоко', 'какао'], meta: 'Мытая обработка, средняя обжарка' },
    { name: 'Кения, Ньери', notes: ['чёрная смородина', 'грейпфрут', 'тростниковый сахар'], meta: 'Мытая обработка, светлая обжарка' },
    { name: 'Бразилия, Серрадо', notes: ['фундук', 'молочный шоколад', 'печенье'], meta: 'Натуральная обработка, средняя обжарка' },
    { name: 'Гватемала, Уэуэтенанго', notes: ['тёмный шоколад', 'апельсин', 'мёд'], meta: 'Мытая обработка, средняя обжарка' },
    { name: 'Руанда, Ньямашеке', notes: ['клюква', 'чёрный чай', 'патока'], meta: 'Мытая обработка, светлая обжарка' },
    { name: 'Коста-Рика, Таррасу', notes: ['мёд', 'абрикос', 'ваниль'], meta: 'Хани-обработка, светлая обжарка' },
    { name: 'Суматра, Ачех', notes: ['пряности', 'кедр', 'горький шоколад'], meta: 'Влажная очистка, тёмная обжарка' }
  ];

  /* ------------------------------------------------------------------
     Время в Казани (МСК, UTC+3, без перехода на летнее время)
     ------------------------------------------------------------------ */
  var msk = new Date(Date.now() + 3 * 3600 * 1000);
  var dow = msk.getUTCDay();
  var minutesNow = msk.getUTCHours() * 60 + msk.getUTCMinutes();
  var daysSinceEpoch = Math.floor(msk.getTime() / 86400000);
  var weekIndex = Math.floor((daysSinceEpoch + 3) / 7); // недели с понедельника
  var isWeekend = function (d) { return d === 0 || d === 6; };
  var today = isWeekend(dow) ? HOURS.weekend : HOURS.weekday;
  var tomorrow = isWeekend((dow + 1) % 7) ? HOURS.weekend : HOURS.weekday;
  var bean = BEANS[weekIndex % BEANS.length];

  var fmt = function (m) { return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
  var plural = function (n, one, few, many) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  };

  /* ------------------------------------------------------------------
     Открыто ли сейчас
     ------------------------------------------------------------------ */
  var status = document.querySelector('[data-open-status]');
  if (status) {
    if (minutesNow < today.open) {
      status.textContent = 'Сегодня откроемся в ' + fmt(today.open);
    } else if (minutesNow < today.close) {
      status.textContent = 'Сейчас открыто, ждём до ' + fmt(today.close);
      status.setAttribute('data-state', 'open');
    } else {
      status.textContent = 'На сегодня закрылись, завтра ждём с ' + fmt(tomorrow.open);
    }
  }

  /* ------------------------------------------------------------------
     «С возвращением» для тех, кто заходит не впервые
     ------------------------------------------------------------------ */
  var hello = document.querySelector('[data-hello]');
  if (hello) {
    try {
      var last = parseInt(localStorage.getItem('penka:lastVisit'), 10);
      if (last && Date.now() - last > 30 * 60 * 1000) {
        hello.textContent = 'С возвращением! Сегодня печём ' + BAKES[dow];
        hello.hidden = false;
      }
      localStorage.setItem('penka:lastVisit', String(Date.now()));
    } catch (e) { /* хранилище недоступно, просто без приветствия */ }
  }

  /* ------------------------------------------------------------------
     Зерно недели
     ------------------------------------------------------------------ */
  var beanName = document.querySelector('[data-bean-name]');
  if (beanName) {
    beanName.textContent = bean.name;
    document.querySelector('[data-bean-meta]').textContent = bean.meta;
    var notes = document.querySelector('[data-bean-notes]');
    notes.innerHTML = '';
    bean.notes.forEach(function (n) {
      var li = document.createElement('li');
      li.textContent = n;
      notes.appendChild(li);
    });
    var left = (8 - dow) % 7 || 7;
    document.querySelector('[data-bean-next]').textContent = dow === 1
      ? 'Сегодня поставили новое зерно'
      : left === 1
        ? 'Завтра будет новое зерно'
        : 'Новое зерно через ' + left + ' ' + plural(left, 'день', 'дня', 'дней');
  }

  /* ------------------------------------------------------------------
     Бегущая строка
     ------------------------------------------------------------------ */
  var track = document.querySelector('[data-ticker]');
  if (track) {
    var list = track.querySelector('.ticker__list');
    var items = [
      'Сегодня печём ' + BAKES[dow],
      'Зерно недели: ' + bean.name,
      dow === 4 ? 'Сегодня день обжарки' : 'Обжариваем по четвергам',
      'Сегодня работаем с ' + fmt(today.open) + ' до ' + fmt(today.close),
      'Книги с полки можно брать домой'
    ];
    var icon = list.querySelector('svg').outerHTML;
    list.innerHTML = items.map(function (t) {
      var li = document.createElement('li');
      li.className = 'ticker__item';
      li.textContent = t;
      return li.outerHTML.replace('</li>', icon + '</li>');
    }).join('');
    // копия списка для бесшовной прокрутки
    var copy = list.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    track.appendChild(copy);
  }

  /* ------------------------------------------------------------------
     Появление блоков при прокрутке (+ очередь для меню и галереи)
     ------------------------------------------------------------------ */
  document.querySelectorAll('.menu__list').forEach(function (ul) {
    ul.querySelectorAll('.item').forEach(function (item, i) {
      item.classList.add('reveal');
      item.style.setProperty('--d', (i * 70) + 'ms');
    });
  });
  document.querySelectorAll('[data-stagger]').forEach(function (box) {
    Array.prototype.forEach.call(box.children, function (el, i) {
      el.style.setProperty('--d', (i * 90) + 'ms');
    });
  });

  var revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Фото на первом экране чуть следуют за мышкой
     ------------------------------------------------------------------ */
  var parallax = document.querySelector('[data-parallax]');
  if (parallax && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var hero = parallax.closest('.hero');
    var raf = 0;
    hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        parallax.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        parallax.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        raf = 0;
      });
    });
    hero.addEventListener('pointerleave', function () {
      parallax.style.setProperty('--mx', 0);
      parallax.style.setProperty('--my', 0);
    });
  }

  /* ------------------------------------------------------------------
     Петля на фоне прорисовывается при загрузке.
     Длину пути считаем сами — так одинаково работает во всех браузерах.
     ------------------------------------------------------------------ */
  var swirl = document.querySelector('.swirl path');
  if (swirl && swirl.getTotalLength) {
    var len = Math.ceil(swirl.getTotalLength());
    swirl.style.strokeDasharray = len + ' ' + (len + 10);
    swirl.style.strokeDashoffset = len;
    swirl.classList.add('is-drawing');
  }

  /* ------------------------------------------------------------------
     Бегущая строка и пар над чашкой ставятся на паузу, когда их не видно
     ------------------------------------------------------------------ */
  if ('IntersectionObserver' in window) {
    var pauser = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
      });
    });
    document.querySelectorAll('.ticker, .top').forEach(function (el) { pauser.observe(el); });
  }

  /* Текущий год в подвале */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
