/* ------------------------------------------------------------------
   Estudio Jurídico G&P · comportamiento de la página
   Lee window.DATOS (datos.js) y rellena las secciones. Sin dependencias.
   ------------------------------------------------------------------ */
'use strict';

/* Las entradas animadas parten de "oculto" solo si este script corre. Por eso
   se marca <html> con la clase "js" nada más cargar (el script va en el <head>,
   antes del primer pintado) y, si no llega a arrancar en 3 s, se vuelve al
   contenido visible sin animar. */
document.documentElement.classList.add('js');
setTimeout(() => {
  if (!document.documentElement.dataset.app) document.documentElement.classList.remove('js');
}, 3000);

/* Todo lo demás espera a que el HTML esté leído completo. */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  root.dataset.app = '1'; // avisa al plan B de arriba de que el script arrancó

  const D = window.DATOS;
  if (!D) { root.classList.remove('js'); return; }

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const slot = (name) => $(`[data-slot="${name}"]`);
  const soloDigitos = (texto) => String(texto).replace(/\D/g, '');

  /* Crea un elemento: h('p', { class: 'x' }, 'texto', otroNodo) */
  function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === null || value === undefined || value === false) continue;
      node.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat()) {
      if (child === null || child === undefined) continue;
      node.append(child.nodeType ? child : document.createTextNode(child));
    }
    return node;
  }

  /* Iconos de línea (mismo trazo que los del HTML). */
  const ICONOS = {
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
  };

  function icono(nombre, tamano = 18) {
    const caja = document.createElement('span');
    caja.innerHTML = `<svg class="icon" viewBox="0 0 24 24" width="${tamano}" height="${tamano}" aria-hidden="true">${ICONOS[nombre]}</svg>`;
    return caja.firstChild;
  }

  /* Marca un elemento para que entre al aparecer en pantalla (con escalonado). */
  function reveal(node, index = 0) {
    node.setAttribute('data-reveal', '');
    node.style.setProperty('--i', index);
    return node;
  }

  /* Aviso breve en pantalla. */
  const toast = $('#toast');
  let toastTimer;
  function aviso(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 4200);
  }

  /* ---------- Navegación ---------- */

  const navList = slot('nav');
  const navToggle = $('.nav__toggle');

  const navEnlaces = D.navegacion.map(({ texto, destino }) => {
    const enlace = h('a', { href: destino }, texto);
    navList.append(h('li', {}, enlace));
    return { enlace, destino };
  });

  function setMenu(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navList.classList.toggle('is-open', open);
  }

  navToggle.addEventListener('click', () => {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  navList.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navList.classList.contains('is-open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* El cuadro de la sección que está en pantalla se marca en burdeos. */
  if ('IntersectionObserver' in window) {
    const objetivos = navEnlaces.map((n) => ({ ...n, seccion: $(n.destino) })).filter((n) => n.seccion);
    const vigia = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        const objetivo = objetivos.find((n) => n.seccion === entrada.target);
        if (!objetivo) return;
        if (entrada.isIntersecting) {
          navEnlaces.forEach((n) => n.enlace.removeAttribute('aria-current'));
          objetivo.enlace.setAttribute('aria-current', 'true');
        } else {
          objetivo.enlace.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    objetivos.forEach((n) => vigia.observe(n.seccion));
  }

  /* ---------- Portada ---------- */

  slot('descripcion').textContent = D.estudio.descripcion;
  slot('declaracion').textContent = D.estudio.declaracion;

  const hechos = slot('portada-datos');
  [
    [D.sedes.length, D.sedes.length === 1 ? 'sede en Lima' : 'sedes en Lima'],
    [D.servicios.length, 'áreas de práctica'],
    ['Reserva', 'absoluta en cada caso']
  ].forEach(([valor, texto]) => hechos.append(h('li', {}, h('strong', {}, String(valor)), h('span', {}, texto))));

  /* ---------- Carruseles ---------- */

  /* Un solo carrusel para toda la página: la portada, quiénes somos y los valores. Recibe
     la raíz (.carousel); su escenario (.carousel__stage) ya trae las diapositivas (.slide,
     cada una con su nombre en `data-titulo`) y las flechas, y los puntos se crean aquí. */
  function iniciarCarrusel(carrusel) {
    const escenario = $('.carousel__stage', carrusel);
    const puntos = $('.carousel__dots', carrusel);
    const flechaAtras = $('[data-carousel-prev]', carrusel);
    const flechaAdelante = $('[data-carousel-next]', carrusel);
    const DURACION = 550; // ms: la misma que la transición de .slide en style.css

    const slides = $$('.slide', escenario);
    const dots = [];
    let actual = 0;
    let pendiente = null; // temporizador del deslizamiento en curso
    let observador = null;

    // Cada escucha se apunta para poder quitarla en `apagar` (los carruseles de tarjetas
    // solo viven en celular y se apagan al ensanchar la ventana).
    const escuchas = [];
    function escuchar(destino, tipo, funcion, opciones) {
      destino.addEventListener(tipo, funcion, opciones);
      escuchas.push(() => destino.removeEventListener(tipo, funcion, opciones));
    }

    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'diapositiva');
      slide.setAttribute('aria-label', `${i + 1} de ${slides.length}`);

      const punto = h('button', {
        class: 'carousel__dot',
        type: 'button',
        'aria-label': `Ir a la diapositiva ${i + 1}: ${slide.dataset.titulo || ''}`
      }, h('span', { class: 'carousel__track' }, h('span', { class: 'carousel__fill' })));

      punto.addEventListener('click', () => ir(i));
      dots.push(punto);
      puntos.append(punto);
    });

    /* Coloca una diapositiva a `x` de su sitio; con `animar` usa la transición de la hoja de estilos. */
    function colocar(slide, x, animar) {
      slide.style.transition = animar ? '' : 'none';
      slide.style.transform = `translate3d(${x}, 0, 0)`;
    }

    /* Hueco entre una diapositiva y la siguiente mientras se deslizan (`--slide-gap` en la hoja
       de estilos). Las fotos de la portada van pegadas (0); las tarjetas llevan un hueco para
       que sus esquinas redondeadas no se junten en una costura.
       `fuera` es hasta dónde se aparta una tarjeta que sale (o desde dónde llega la que entra):
       lo bastante lejos para que, con el escenario de borde a borde de la pantalla, no asome ni
       un filo de ella ni de su sombra (el margen de la tarjeta + 28 px). Con menos, la tarjeta
       que sale se quedaba "colgada" en el borde unos 250 ms y luego desaparecía de golpe.
       Se mide al empezar cada movimiento, no en cada fotograma. */
    let hueco = 0;
    let fuera = 0;
    function medirHueco() {
      hueco = parseFloat(getComputedStyle(carrusel).getPropertyValue('--slide-gap')) || 0;
      fuera = hueco;
      if (hueco > 0) {
        const caja = escenario.getBoundingClientRect();
        const hoja = slides[actual].getBoundingClientRect();
        fuera = Math.max(hueco, hoja.left - caja.left + 28, caja.right - hoja.right + 28);
      }
    }

    /* Posición de la diapositiva que espera, fuera de la vista, al lado `dir` (1 = derecha, -1 = izquierda). */
    function aLaVera(dir) {
      return `calc(${dir * 100}% + ${dir * fuera}px)`;
    }

    function marcarActiva(indice) {
      actual = indice;
      slides.forEach((slide, i) => {
        const activa = i === actual;
        slide.classList.toggle('is-active', activa);
        slide.setAttribute('aria-hidden', String(!activa));
        dots[i].classList.toggle('is-active', activa);
        dots[i].setAttribute('aria-current', String(activa));
      });
    }

    /* Deja todo quieto: la activa a la vista y las demás escondidas. También corta
       de golpe cualquier deslizamiento a medias. */
    function asentar() {
      clearTimeout(pendiente);
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-shown', i === actual);
        colocar(slide, '0px', false);
      });
    }

    /* Pasa de la activa a `destino`, entrando por el lado `dir` (1 = derecha, -1 = izquierda).
       Con `enArrastre`, las dos diapositivas ya están en su posición de arrastre. */
    function deslizar(destino, dir, enArrastre) {
      const saliente = slides[actual];
      const entrante = slides[destino];
      if (!enArrastre) {
        medirHueco();
        entrante.classList.add('is-shown');
        colocar(entrante, aLaVera(dir), false);
        void entrante.offsetWidth; // fija el punto de partida antes de animar
      }
      colocar(saliente, aLaVera(-dir), true);
      colocar(entrante, '0px', true);
      marcarActiva(destino);
      pendiente = setTimeout(asentar, DURACION + 80);
    }

    function ir(indice, dir) {
      const destino = (indice + slides.length) % slides.length;
      if (destino === actual) return;
      asentar();
      deslizar(destino, dir || (destino > actual ? 1 : -1), false);
    }

    function pausar(pausado) {
      carrusel.classList.toggle('is-paused', pausado);
      // Sin avance automático, el lector de pantalla puede anunciar cada cambio.
      escenario.setAttribute('aria-live', pausado ? 'polite' : 'off');
    }

    // El relleno del punto activo marca el tiempo: al terminar, pasa a la siguiente.
    escuchar(puntos, 'animationend', (event) => {
      if (event.animationName === 'carousel-fill') ir(actual + 1, 1);
    });

    escuchar(flechaAtras, 'click', () => ir(actual - 1, -1));
    escuchar(flechaAdelante, 'click', () => ir(actual + 1, 1));

    escuchar(carrusel, 'keydown', (event) => {
      if (event.key === 'ArrowLeft') ir(actual - 1, -1);
      else if (event.key === 'ArrowRight') ir(actual + 1, 1);
    });

    /* Arrastre con el dedo (Android, iPhone) o con el ratón manteniendo el clic.
       La diapositiva sigue al puntero y al soltar se queda en la siguiente si se
       arrastró más de un 20 % del ancho o se hizo un gesto rápido; si no, vuelve.
       El navegador sigue encargándose del scroll vertical (touch-action: pan-y). */
    let arrastre = null;
    let sinClic = false;

    function moverArrastre() {
      const { dx, ancho } = arrastre;
      if (dx === 0) return;
      const dir = dx < 0 ? 1 : -1; // arrastrando a la izquierda entra la siguiente por la derecha
      const vecino = (actual + dir + slides.length) % slides.length;
      if (vecino !== arrastre.vecino) {
        if (arrastre.vecino >= 0) {
          slides[arrastre.vecino].classList.remove('is-shown');
          colocar(slides[arrastre.vecino], '0px', false);
        }
        arrastre.vecino = vecino;
        arrastre.dir = dir;
        slides[vecino].classList.add('is-shown');
      }
      colocar(slides[actual], `${dx}px`, false);
      colocar(slides[vecino], `${dx + dir * (ancho + hueco)}px`, false);
    }

    escuchar(escenario, 'pointerdown', (event) => {
      if (event.button > 0 || event.target.closest('.carousel__arrow') || slides.length < 2) return;
      arrastre = {
        id: event.pointerId, x0: event.clientX, y0: event.clientY,
        dx: 0, ancho: 0, activo: false, vecino: -1, dir: 0, muestras: []
      };
    });

    escuchar(escenario, 'pointermove', (event) => {
      if (!arrastre || event.pointerId !== arrastre.id) return;
      const dx = event.clientX - arrastre.x0;
      const dy = event.clientY - arrastre.y0;
      if (!arrastre.activo) {
        // Hasta que el gesto no sea claramente horizontal es un toque, no un arrastre.
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        asentar();
        medirHueco();
        arrastre.activo = true;
        arrastre.ancho = slides[actual].offsetWidth; // el escenario de las tarjetas lleva relleno; la diapositiva, no
        carrusel.classList.add('is-dragging');
        escenario.setPointerCapture(event.pointerId);
      }
      const recorrido = arrastre.ancho + hueco; // lo que hay que arrastrar para que la vecina llegue a su sitio
      arrastre.dx = Math.max(-recorrido, Math.min(recorrido, dx));
      arrastre.muestras.push({ x: event.clientX, t: event.timeStamp });
      if (arrastre.muestras.length > 6) arrastre.muestras.shift();
      moverArrastre();
    });

    function soltar(event, cancelado) {
      if (!arrastre || event.pointerId !== arrastre.id) return;
      const a = arrastre;
      arrastre = null;
      if (!a.activo) return; // fue un clic o un toque
      carrusel.classList.remove('is-dragging');

      // Velocidad del gesto en los últimos instantes (px por ms).
      const ultima = a.muestras[a.muestras.length - 1];
      const primera = a.muestras.find((m) => ultima && ultima.t - m.t <= 100) || ultima;
      const velocidad = ultima && primera && ultima.t > primera.t ? (ultima.x - primera.x) / (ultima.t - primera.t) : 0;
      const rapido = Math.abs(velocidad) > 0.4;
      const dirGesto = rapido ? -Math.sign(velocidad) : -Math.sign(a.dx);
      const avanza = !cancelado && a.vecino >= 0 && dirGesto === a.dir && (rapido || Math.abs(a.dx) > a.ancho * 0.2);

      // El clic que sigue a un arrastre no debe activar nada.
      sinClic = true;
      setTimeout(() => { sinClic = false; }, 0);

      if (avanza) {
        deslizar(a.vecino, a.dir, true);
      } else {
        colocar(slides[actual], '0px', true);
        if (a.vecino >= 0) colocar(slides[a.vecino], aLaVera(a.dir), true);
        pendiente = setTimeout(asentar, DURACION + 80);
      }
    }

    escuchar(escenario, 'pointerup', (event) => soltar(event, false));
    escuchar(escenario, 'pointercancel', (event) => soltar(event, true));
    escuchar(escenario, 'dragstart', (event) => event.preventDefault());
    escuchar(escenario, 'click', (event) => {
      if (sinClic) { event.preventDefault(); event.stopPropagation(); }
    }, true);

    // No avanza mientras no se ve.
    if ('IntersectionObserver' in window) {
      observador = new IntersectionObserver(([entrada]) => {
        carrusel.classList.toggle('is-away', !entrada.isIntersecting);
      }, { threshold: 0.2 });
      observador.observe(carrusel);
    }

    marcarActiva(0);
    asentar();
    // Con "reducir movimiento" no avanza solo: queda en pausa y se maneja a mano.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) pausar(true);

    /* Deshace todo lo que puso este carrusel: las diapositivas vuelven a ser contenido normal. */
    return function apagar() {
      clearTimeout(pendiente);
      escuchas.forEach((quitar) => quitar());
      if (observador) observador.disconnect();
      puntos.textContent = '';
      slides.forEach((slide) => {
        slide.classList.remove('is-active', 'is-shown');
        ['role', 'aria-roledescription', 'aria-label', 'aria-hidden'].forEach((a) => slide.removeAttribute(a));
        slide.style.transition = '';
        slide.style.transform = '';
      });
      carrusel.classList.remove('is-paused', 'is-dragging', 'is-away');
      escenario.removeAttribute('aria-live');
    };
  }

  /* Quiénes somos y valores: carrusel solo en celular (720 px o menos). Con más ancho las
     tarjetas se ven todas a la vez, como una página normal, y el carrusel ni se enciende; si la
     ventana cambia de tamaño se enciende o se apaga en el momento. */
  function carruselEnMovil(carrusel) {
    const movil = window.matchMedia('(max-width: 720px)');
    let apagar = null;

    function ajustar() {
      if (movil.matches && !apagar) {
        carrusel.setAttribute('role', 'region');
        carrusel.setAttribute('aria-roledescription', 'carrusel');
        carrusel.setAttribute('aria-label', carrusel.dataset.etiqueta || '');
        apagar = iniciarCarrusel(carrusel);
      } else if (!movil.matches && apagar) {
        apagar();
        apagar = null;
        ['role', 'aria-roledescription', 'aria-label'].forEach((a) => carrusel.removeAttribute(a));
      }
    }

    if (movil.addEventListener) movil.addEventListener('change', ajustar);
    else movil.addListener(ajustar); // Safari anterior a 14
    ajustar();
  }

  /* Portada: una diapositiva de bienvenida y una por servicio, con foto y tarjeta. */
  const portada = $('.hero [data-carousel]');
  const escenarioPortada = slot('carrusel');
  const flechaPortada = $('[data-carousel-prev]', portada);

  const diapositivas = [
    {
      titulo: D.portada.titulo, texto: D.portada.texto, enlace: D.portada.enlace,
      imagen: D.portada.imagen, alt: D.portada.alt, posicion: D.portada.posicion, area: null
    },
    ...D.servicios.map((s) => ({
      titulo: s.nombre, texto: s.resumen, enlace: 'Consultar',
      imagen: s.imagen, alt: s.alt, posicion: s.posicion, area: s.id
    }))
  ];

  diapositivas.forEach((d, i) => {
    const imagen = h('img', {
      src: d.imagen,
      alt: d.alt,
      draggable: 'false', // para que el ratón arrastre el carrusel y no la imagen
      loading: i === 0 ? null : 'lazy',
      fetchpriority: i === 0 ? 'high' : null
    });
    imagen.style.objectPosition = d.posicion || '50% 50%';

    // Las flechas quedan detrás en el orden del teclado, y encima en pantalla.
    escenarioPortada.insertBefore(h('div', { class: 'slide', 'data-titulo': d.titulo },
      imagen,
      h('div', { class: 'slide__caption' },
        h('p', { class: 'slide__title' }, d.titulo),
        h('p', { class: 'slide__text' }, d.texto),
        h('a', { class: 'btn btn--small', href: '#contacto', 'data-area': d.area }, d.enlace)
      )
    ), flechaPortada);
  });

  iniciarCarrusel(portada);

  /* ---------- WhatsApp ---------- */

  const waNumero = D.contacto.whatsapp ? soloDigitos(D.contacto.whatsapp) : '';
  const waTexto = encodeURIComponent(D.contacto.whatsappMensaje || 'Hola, quisiera solicitar una consulta.');

  // El enlace de mensaje del estudio manda sobre el número: ese enlace no admite texto precargado.
  const waDestino = D.contacto.whatsappEnlace || (waNumero ? `https://wa.me/${waNumero}?text=${waTexto}` : '');

  $$('[data-whatsapp]').forEach((enlace) => {
    if (waDestino) {
      enlace.href = waDestino;
      enlace.target = '_blank';
      enlace.rel = 'noopener';
      return;
    }
    enlace.addEventListener('click', (event) => {
      event.preventDefault();
      aviso('Todavía no hay un número de WhatsApp configurado en datos.js.');
    });
  });

  /* ---------- Servicios: tarjetas ---------- */

  const tarjetas = slot('servicios');

  D.servicios.forEach((servicio, i) => {
    const imagen = h('img', { src: servicio.imagen, alt: servicio.alt, loading: 'lazy' });
    imagen.style.objectPosition = servicio.posicion || '50% 50%';

    const tarjeta = h('article', { class: 'svc-card' },
      h('div', { class: 'svc-card__media' }, imagen),
      h('div', { class: 'svc-card__body' },
        h('h3', {}, servicio.nombre),
        h('p', { class: 'svc-card__text' }, servicio.resumen),
        h('ul', { class: 'svc-card__list' }, servicio.puntos.map((punto) => h('li', {}, punto))),
        h('a', { class: 'svc-card__link', href: '#contacto', 'data-area': servicio.id },
          'Consultar', icono('flecha'))
      )
    );

    tarjetas.append(reveal(h('div', { class: 'cell' }, tarjeta), i % 4));
  });

  // Última tarjeta: para quien no encuentra su caso en la lista.
  tarjetas.append(reveal(h('div', { class: 'cell' },
    h('article', { class: 'svc-card svc-card--cta' },
      h('h3', {}, D.otraConsulta.titulo),
      h('p', { class: 'svc-card__text' }, D.otraConsulta.texto),
      h('a', { class: 'btn btn--small', href: '#contacto', 'data-area': 'no-se' }, D.otraConsulta.enlace)
    )
  ), D.servicios.length % 4));

  /* ---------- Quiénes somos, misión, visión y valores ---------- */

  const parrafos = slot('nosotros-parrafos');
  D.nosotros.parrafos.forEach((texto) => parrafos.append(h('p', {}, texto)));

  slot('mision').textContent = D.nosotros.mision;
  slot('vision').textContent = D.nosotros.vision;

  // Quiénes somos, misión y visión: tres diapositivas que ya están en el HTML. En tableta y
  // escritorio se ven juntas; en celular son un carrusel.
  carruselEnMovil($('.carousel--about'));

  // Valores: una diapositiva por valor (van antes de las flechas, como en la portada). En tableta
  // y escritorio son seis recuadros a la vista; en celular, un carrusel. La celda lleva la entrada
  // animada y el recuadro de dentro conserva sus transiciones de hover.
  const valores = slot('valores');
  const flechaValores = $('[data-carousel-prev]', valores);
  D.nosotros.valores.forEach((valor, i) => {
    valores.insertBefore(h('div', { class: 'slide', 'data-titulo': valor.titulo },
      reveal(h('div', { class: 'cell' },
        h('article', { class: 'value' },
          h('h3', {}, valor.titulo),
          h('p', {}, valor.texto)
        )
      ), i % 2)
    ), flechaValores);
  });
  carruselEnMovil($('.carousel--values'));

  /* ---------- Sedes y Google Maps ---------- */

  const sedesLista = slot('sedes-lista');
  const mapa = $('#mapa');
  const mapaNota = slot('mapa-nota');
  const mapaAbrir = slot('mapa-abrir');
  const sedeEls = [];
  const MAPA_GENERAL = 'Lima, Perú';

  /* Lo que se escribiría en el buscador de Google Maps para esta sede. */
  function consultaMapa(sede) {
    if (sede.mapa) return sede.mapa;
    if (sede.direccion) return [sede.direccion, sede.distrito, MAPA_GENERAL].filter(Boolean).join(', ');
    return MAPA_GENERAL;
  }

  const urlIncrustada = (consulta) =>
    `https://maps.google.com/maps?q=${encodeURIComponent(consulta)}&z=${consulta === MAPA_GENERAL ? 11 : 16}&hl=es&output=embed`;
  const urlAbrir = (consulta) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;

  // Etiqueta sobre el mapa con la sede que se está viendo.
  const etiquetaMapa = h('span', { class: 'sedes__chip' }, icono('pin', 16), h('span', {}));
  const marcoMapa = $('.sedes__map');
  marcoMapa.append(etiquetaMapa, h('span', { class: 'sedes__hint' }, 'Toque el mapa para moverlo'));

  // En pantallas táctiles el mapa empieza "dormido" (el CSS le quita los toques) para que
  // deslizar el dedo sobre él siga moviendo la página. Un toque lo activa; tocar fuera lo duerme.
  marcoMapa.addEventListener('click', () => marcoMapa.classList.add('is-interactive'));
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.sedes__map')) marcoMapa.classList.remove('is-interactive');
  });

  D.sedes.forEach((sede, i) => {
    const direccion = [sede.direccion, sede.distrito].filter(Boolean).join(' · ');
    const lineas = [
      { icono: 'pin', texto: direccion || 'Dirección por confirmar' },
      sede.telefono ? { icono: 'telefono', texto: sede.telefono } : null,
      sede.horario ? { icono: 'reloj', texto: sede.horario } : null
    ].filter(Boolean);
    const conUbicacion = Boolean(sede.mapa || sede.direccion);

    const boton = h('button', { class: 'sede__btn', type: 'button', 'aria-pressed': 'false' },
      h('span', { class: 'sede__icon' }, icono('pin', 22)),
      h('span', { class: 'sede__name' }, sede.nombre),
      h('span', { class: 'sede__lines' },
        lineas.map((linea) => h('span', { class: 'sede__line' }, icono(linea.icono, 16), h('span', {}, linea.texto)))
      )
    );

    const tarjeta = h('div', { class: 'sede' },
      boton,
      conUbicacion
        ? h('a', { class: 'sede__link', href: urlAbrir(consultaMapa(sede)), target: '_blank', rel: 'noopener' }, 'Cómo llegar')
        : null
    );

    boton.addEventListener('click', () => seleccionarSede(i));
    sedeEls.push(tarjeta);
    sedesLista.append(reveal(h('div', { class: 'cell' }, tarjeta), i));
  });

  function seleccionarSede(indice) {
    const sede = D.sedes[indice];
    const consulta = consultaMapa(sede);
    sedeEls.forEach((tarjeta, i) => {
      tarjeta.classList.toggle('is-active', i === indice);
      $('.sede__btn', tarjeta).setAttribute('aria-pressed', String(i === indice));
    });
    const destino = urlIncrustada(consulta);
    if (mapa.getAttribute('src') !== destino) mapa.setAttribute('src', destino);
    mapaAbrir.setAttribute('href', urlAbrir(consulta));
    $('span', etiquetaMapa).textContent = [sede.nombre, sede.distrito].filter(Boolean).join(' · ');
    mapaNota.textContent = sede.mapa || sede.direccion
      ? ''
      : 'Mapa general de Lima. La ubicación exacta de esta sede está por confirmar.';
  }

  seleccionarSede(0);

  /* ---------- Contacto ---------- */

  const contactoDatos = slot('contacto-datos');

  if (D.contacto.telefono) {
    contactoDatos.append(h('li', {}, h('a', { href: `tel:+${soloDigitos(D.contacto.telefono)}` }, icono('telefono'), D.contacto.telefono)));
  }
  if (D.contacto.email) {
    contactoDatos.append(h('li', {}, h('a', { href: `mailto:${D.contacto.email}` }, icono('correo'), D.contacto.email)));
  }

  const areaSelect = slot('areas');
  areaSelect.append(h('option', { value: '' }, 'Elija un área'));
  D.servicios.forEach((s) => areaSelect.append(h('option', { value: s.id }, s.nombre)));
  areaSelect.append(h('option', { value: 'no-se' }, 'Aún no lo sé'));

  // Los enlaces "Consultar" dejan elegida el área en el formulario.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-area]');
    if (link) areaSelect.value = link.dataset.area;
  });

  const form = $('#form');
  const send = $('#send');
  const note = $('#form-note');

  // Con el teclado abierto, el botón flotante de WhatsApp se aparta (ver .is-typing en el CSS).
  form.addEventListener('focusin', () => root.classList.add('is-typing'));
  form.addEventListener('focusout', () => {
    setTimeout(() => { if (!form.contains(document.activeElement)) root.classList.remove('is-typing'); }, 0);
  });
  const doneText = slot('done-text');
  const labels = $$('.btn__label', send);
  const envio = D.contacto.envio && D.contacto.envio.url ? D.contacto.envio : null;
  const correoEstudio = D.contacto.email || '';

  const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* Manda la consulta al servicio de formularios, sin salir de la página. Devuelve
     true solo si el servicio la aceptó; con cualquier fallo (sin conexión, tiempo
     agotado, error del servidor o respuesta que la rechaza) devuelve false. */
  async function enviarPorServicio(campos) {
    const control = new AbortController();
    const corte = setTimeout(() => control.abort(), envio.tiempoMax || 12000);
    try {
      const respuesta = await fetch(envio.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...envio.extra, ...campos }),
        signal: control.signal
      });
      let datos = null;
      try { datos = await respuesta.json(); } catch { /* respuesta sin JSON */ }
      const rechazada = Boolean(datos) && [datos.success, datos.ok].some((v) => v === false || v === 'false');
      return respuesta.ok && !rechazada;
    } catch {
      return false;
    } finally {
      clearTimeout(corte);
    }
  }

  function setState(state) {
    send.dataset.state = state;
    send.setAttribute('aria-disabled', String(state !== 'idle'));
    labels.forEach((label) => label.setAttribute('aria-hidden', String(label.dataset.state !== state)));
  }

  function fail(field, message) {
    field.setAttribute('aria-invalid', 'true');
    note.textContent = message;
    field.focus();
  }

  form.addEventListener('input', (event) => {
    event.target.removeAttribute('aria-invalid');
    note.textContent = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (send.dataset.state !== 'idle') return;

    const datos = Object.fromEntries(new FormData(form));
    const nombre = (datos.nombre || '').trim();
    const telefono = (datos.telefono || '').trim();
    const correo = (datos.correo || '').trim();

    if (!nombre) return fail($('#f-nombre'), 'Escriba su nombre para que sepamos cómo dirigirnos a usted.');
    if (!telefono && !correo) return fail($('#f-telefono'), 'Indique un teléfono o un correo para poder responderle.');
    if (correo && !$('#f-correo').checkValidity()) return fail($('#f-correo'), 'Revise el correo: parece incompleto.');

    const area = D.servicios.find((s) => s.id === datos.area);
    const asunto = `Consulta legal${area ? ` · ${area.nombre}` : ''}`;
    const esRobot = Boolean((datos._honey || '').trim()); // la trampa del formulario venía rellena

    note.textContent = '';
    setState('loading');

    // Qué pasó: 'enviada' (la aceptó el servicio), 'demo' (sin servicio configurado) o 'error'.
    let resultado;
    const minimo = esperar(900); // para que el estado "Enviando…" se vea siempre un instante

    if (esRobot) {
      await minimo;
      resultado = 'enviada'; // al robot se le dice que salió bien, pero no se envía nada
    } else if (envio) {
      const [aceptada] = await Promise.all([
        enviarPorServicio({
          _subject: `${asunto} · ${nombre}`,
          nombre,
          telefono,
          email: correo, // con este nombre el servicio lo usa para "Responder"
          area: area ? area.nombre : 'Aún no lo sé',
          mensaje: (datos.mensaje || '').trim()
        }),
        minimo
      ]);
      resultado = aceptada ? 'enviada' : 'error';
    } else {
      await minimo;
      resultado = 'demo';
    }

    if (resultado === 'error') {
      setState('idle');
      // Nunca se abre el programa de correo solo: se ofrece la dirección como enlace
      // y el visitante decide. El formulario conserva lo escrito.
      note.replaceChildren('No pudimos enviar su consulta en este momento. Inténtelo de nuevo en unos minutos');
      if (correoEstudio) {
        note.append(' o escríbanos a ', h('a', { href: `mailto:${correoEstudio}` }, correoEstudio));
      }
      note.append('.');
      return;
    }

    doneText.textContent = resultado === 'enviada' ? 'Consulta enviada' : 'Demostración completada';
    setState('done');

    if (resultado === 'enviada') {
      note.textContent = 'Gracias. Recibimos su consulta y le responderemos pronto.';
      form.reset();
    } else {
      note.textContent = 'Modo demostración: el envío de consultas todavía no está configurado en datos.js, así que no se envió nada.';
    }

    await esperar(3000);
    setState('idle');
  });

  /* ---------- Pie ---------- */

  slot('presentacion-pie').textContent = D.estudio.presentacionPie;
  slot('anio').textContent = new Date().getFullYear();
  slot('credito-fotos').textContent = D.estudio.creditoFotos;

  /* ---------- Entradas al hacer scroll ---------- */

  const items = $$('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((item) => observer.observe(item));
  } else {
    items.forEach((item) => item.classList.add('is-in'));
  }

  /* ---------- Portada: se anima cuando las tipografías ya cargaron ---------- */

  const fuentes = document.fonts && document.fonts.load
    ? Promise.all([
        document.fonts.load('500 60px "Bodoni Moda"'),
        document.fonts.load('400 16px "Hanken Grotesk"')
      ]).catch(() => {})
    : Promise.resolve();

  Promise.race([fuentes, new Promise((resolve) => setTimeout(resolve, 1500))]).then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.add('is-ready');
      // Los carruseles empiezan a avanzar con la página visible (los que no se ven esperan: `is-away`).
      $$('[data-carousel]').forEach((carrusel) => carrusel.classList.add('is-running'));
    }));
  });
});
