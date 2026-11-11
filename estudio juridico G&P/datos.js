/* ------------------------------------------------------------------
   Datos del sitio · Estudio Jurídico G&P

   Todo el contenido que cambia (servicios, textos de "Quiénes somos",
   sedes y contacto) vive en este archivo. La página lo lee al cargar:
   para añadir, quitar o reordenar un servicio basta editar la lista
   `servicios`, sin tocar index.html.

   Convenciones
   - Un valor en null significa "aún no definido": las sedes lo muestran
     como "por confirmar" y el contacto lo oculta.
   - Las imágenes se indican con su ruta dentro de imagenes/web/.
   - `posicion` es el punto de enfoque del recorte (CSS object-position).

   Los textos de servicios, misión, visión y valores son una propuesta
   inicial: revisarlos antes de publicar.
   ------------------------------------------------------------------ */

window.DATOS = {
  estudio: {
    nombre: "Estudio Jurídico G&P",
    sigla: "G&P",
    ciudad: "Lima, Perú",
    descripcion:
      "Estudio Jurídico G&P acompaña a personas, familias y empresas con asesoría y defensa legal, desde tres sedes en Lima.",

    /* Frase destacada, en una banda justo debajo de la portada. */
    declaracion: "Defender sus derechos con rigor, reserva y compromiso.",
    presentacionPie:
      "Estudio Jurídico G&P presta servicios de asesoría y defensa legal en derecho penal, laboral, civil, familiar y corporativo, conciliación, y derecho aduanero y comercio exterior, desde tres sedes en Lima.",
    creditoFotos: "Fotografías: Pexels e iStock."
  },

  /* Contacto.
     - email: dirección del estudio. Se muestra en la sección de contacto y,
       si el envío falla, el aviso la ofrece como enlace (el programa de correo
       nunca se abre solo).
     - envio: cómo salen las consultas del botón "Solicitar consulta", sin
       salir de la página. La página no tiene servidor propio, así que se usa un
       servicio de formularios que recibe la consulta y la reenvía al correo del
       estudio.
         url        dirección de tu formulario en Formspree, con este aspecto:
                    "https://formspree.io/f/abcdwxyz". Se obtiene así: crear
                    una cuenta gratuita en formspree.io, pulsar "New form",
                    poner el correo donde quieres recibir las consultas y
                    copiar la dirección ("Endpoint") que muestra. Mientras
                    esté en null, el formulario funciona en modo demostración
                    y no envía nada.
         extra      campos fijos que se añaden a cada consulta si el servicio
                    los pide (con Formspree no hace falta ninguno).
         tiempoMax  milisegundos que se espera al servicio antes de dar el
                    envío por fallido.
       Cuando el envío falla (sin conexión, servicio caído...), el formulario
       conserva lo escrito y muestra un aviso con el correo del estudio.
     - whatsappEnlace: enlace de mensaje de WhatsApp del estudio. Todos los
       botones e iconos de WhatsApp de la página (cabecera, portada, sedes,
       contacto y el botón flotante) abren este enlace en otra pestaña. Tiene
       prioridad sobre `whatsapp`.
     - whatsapp: número con código de país, por ejemplo "+51 999 999 999".
       Solo se usa si `whatsappEnlace` es null: los botones abren la
       conversación con ese número y el texto de `whatsappMensaje`.
       Si ambos son null, los botones avisan de que falta configurarlo. */
  contacto: {
    email: "gabrielpinillos44@gmail.com",
    envio: {
      url: null, // ← pegar aquí la dirección del formulario de Formspree (ver arriba)
      extra: {},
      tiempoMax: 12000
    },
    telefono: null,
    whatsappEnlace: "https://wa.me/message/RPT3IK76WBV7P1",
    whatsapp: null,
    whatsappMensaje: "Hola, quisiera solicitar una consulta con Estudio Jurídico G&P."
  },

  /* Carrusel de la portada: la primera diapositiva es esta; las demás se
     generan solas a partir de `servicios` (nombre, resumen y foto), en el
     mismo orden. */
  portada: {
    titulo: "Asesoría y defensa legal",
    texto: "Acompañamos a personas, familias y empresas con rigor, reserva y cercanía.",
    enlace: "Solicitar consulta",
    imagen: "imagenes/web/hero-justicia.jpg",
    alt: "Estatua de la justicia junto a un mazo, frente a una biblioteca",
    posicion: "50% 55%"
  },

  navegacion: [
    { texto: "Servicios", destino: "#servicios" },
    { texto: "Nosotros", destino: "#nosotros" },
    { texto: "Valores", destino: "#valores" },
    { texto: "Sedes", destino: "#sedes" },
    { texto: "Contacto", destino: "#contacto" }
  ],

  nosotros: {
    parrafos: [
      "Somos Estudio Jurídico G&P, un equipo de abogados con tres sedes en Lima, dedicado a acompañar a personas, familias y empresas cuando más necesitan orientación legal. Sabemos que detrás de cada caso hay una historia, una preocupación o un proyecto. Por eso lo atendemos con cercanía, rigor y respeto.",
      "Nuestra práctica abarca el derecho penal, laboral, civil, familiar y corporativo, la conciliación, y el derecho aduanero y comercio exterior. Esta variedad nos permite ofrecer una mirada integral. Cuando un asunto involucra varias áreas, podemos abordarlo de forma coordinada, con un solo equipo de confianza."
    ],
    mision:
      "Proteger los derechos de nuestros clientes con asesoría y defensa legal de excelencia, integridad y sentido humano.",
    vision:
      "Ser un estudio de referencia en Lima y en el Perú por la confianza que inspira y por cómo acompaña a sus clientes en cada etapa.",
    valores: [
      {
        titulo: "Integridad",
        texto: "Actuamos con honestidad y ética en cada decisión, y decimos con claridad lo que es posible y lo que no."
      },
      {
        titulo: "Compromiso",
        texto: "Defendemos cada caso con dedicación, como si fuera propio."
      },
      {
        titulo: "Confidencialidad",
        texto: "Protegemos la información de nuestros clientes con absoluta reserva."
      },
      {
        titulo: "Excelencia profesional",
        texto: "Nos preparamos y actualizamos de manera constante para ofrecer soluciones sólidas y bien fundamentadas."
      },
      {
        titulo: "Cercanía y empatía",
        texto: "Escuchamos, explicamos en un lenguaje claro y acompañamos en cada paso."
      },
      {
        titulo: "Responsabilidad",
        texto: "Asumimos con seriedad el encargo que se nos confía y cumplimos nuestros compromisos."
      }
    ]
  },

  /* Servicios: el orden de esta lista es el orden en la página. */
  servicios: [
    {
      id: "penal",
      nombre: "Derecho penal",
      resumen:
        "Defensa técnica y asesoría en todas las etapas del proceso penal, desde la investigación hasta el juicio, con una estrategia clara y absoluta reserva.",
      puntos: [
        "Defensa en investigaciones y procesos penales",
        "Asesoría a agraviados y denunciantes",
        "Medidas cautelares y recursos"
      ],
      imagen: "imagenes/web/penal-mazo.jpg",
      alt: "Persona firmando un documento junto a un mazo de juez sobre un escritorio de madera",
      posicion: "50% 55%"
    },
    {
      id: "laboral",
      nombre: "Derecho laboral",
      resumen:
        "Orientamos a trabajadores y empleadores para que la relación de trabajo se ajuste a la ley y los conflictos se resuelvan con equilibrio.",
      puntos: [
        "Contratos y políticas laborales",
        "Despidos, beneficios sociales y reclamos",
        "Negociación y procesos laborales"
      ],
      imagen: "imagenes/web/laboral-contrato.jpg",
      alt: "Abogado firmando un contrato en su escritorio, junto a una estatua de la justicia",
      posicion: "50% 58%"
    },
    {
      id: "civil",
      nombre: "Derecho civil",
      resumen:
        "Asesoría en contratos, propiedad, sucesiones y responsabilidad civil, para proteger su patrimonio y dar seguridad a sus acuerdos.",
      puntos: [
        "Contratos y obligaciones",
        "Propiedad, posesión y arrendamientos",
        "Sucesiones y responsabilidad civil"
      ],
      imagen: "imagenes/web/civil-documentos.jpg",
      alt: "Manos revisando un contrato sobre una mesa, con una estatua de la justicia al fondo",
      posicion: "50% 45%"
    },
    {
      id: "familiar",
      nombre: "Derecho familiar",
      resumen:
        "Acompañamos a las familias en momentos delicados, con sensibilidad, claridad y una defensa responsable del interés de cada integrante.",
      puntos: [
        "Alimentos, tenencia y régimen de visitas",
        "Divorcio y separación",
        "Filiación y otros asuntos de familia"
      ],
      imagen: "imagenes/web/familiar-papel.jpg",
      alt: "Figura de papel de una familia junto a un mazo, sobre un libro",
      posicion: "22% 50%"
    },
    {
      id: "corporativo",
      nombre: "Derecho corporativo",
      resumen:
        "Asesoramos a empresas en su constitución, sus contratos y sus decisiones societarias, para que crezcan con seguridad jurídica.",
      puntos: [
        "Constitución y gobierno de sociedades",
        "Contratos comerciales",
        "Asesoría legal permanente para empresas"
      ],
      imagen: "imagenes/web/corporativo-apreton.jpg",
      alt: "Apretón de manos entre dos personas de traje en una oficina",
      posicion: "50% 50%"
    },
    {
      id: "conciliacion",
      nombre: "Conciliación",
      resumen:
        "Buscamos acuerdos que ahorren tiempo y desgaste, con el respaldo legal necesario para que lo pactado se cumpla.",
      puntos: [
        "Conciliación extrajudicial",
        "Negociación y redacción de acuerdos",
        "Alternativas al juicio"
      ],
      imagen: "imagenes/web/conciliacion-acuerdo.jpg",
      alt: "Apretón de manos sobre un escritorio, con una estatua de la justicia al fondo",
      posicion: "36% 50%"
    },
    {
      id: "aduanero",
      nombre: "Derecho aduanero y comercio exterior",
      resumen:
        "Orientamos a importadores y exportadores en el cumplimiento de las normas aduaneras y en sus operaciones de comercio internacional.",
      puntos: [
        "Procedimientos y regímenes aduaneros",
        "Infracciones, sanciones y reclamos",
        "Contratos de compraventa internacional"
      ],
      imagen: "imagenes/web/aduanero-puerto.jpg",
      alt: "Puerto con grúas y contenedores junto al mar",
      posicion: "35% 50%"
    }
  ],

  /* Última tarjeta de la cuadrícula de servicios, para quien no encuentra su caso. */
  otraConsulta: {
    titulo: "¿No encuentra su caso aquí?",
    texto: "Cuéntenos su situación y le orientaremos sobre cómo podemos ayudarle.",
    enlace: "Solicitar consulta"
  },

  /* Sedes: completar distrito, dirección, teléfono y horario de cada una.
     Mientras un campo sea null, la página muestra "por confirmar".

     Mapa de Google Maps: se genera solo a partir de `direccion` y `distrito`.
     Si hace falta afinarlo, en `mapa` se puede escribir exactamente lo que se
     escribiría en el buscador de Google Maps (por ejemplo el nombre del local
     o unas coordenadas "-12.0464, -77.0428"). Mientras no haya dirección ni
     `mapa`, se muestra un mapa general de Lima. */
  sedes: [
    { nombre: "Sede 1", distrito: null, direccion: null, telefono: null, horario: null, mapa: null },
    { nombre: "Sede 2", distrito: null, direccion: null, telefono: null, horario: null, mapa: null },
    { nombre: "Sede 3", distrito: null, direccion: null, telefono: null, horario: null, mapa: null }
  ]
};
