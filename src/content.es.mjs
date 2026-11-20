// Spanish (es) copy for the five Spanish pages and the shared site chrome on them, in one place for review.
// Neutral Latin American Spanish for Puerto Rico business owners, "tú" form, NEVORA app terms (docs/i18n/es-glossary.md).
// Page bodies with their own markup live in src/night/*.es.body.html; the browser scripts keep their own EN/ES tables
// (public/assets/velani.js, src/night/assist.js, kiosk.js, motion.js, nevora.js).
// Facts must match the English pages exactly: no added claims.
import { LEGAL_ES_PATHS, LEGAL_ES_ROUTES } from './legal.es.mjs';

/** Hours as they appear in lists and sentences ("lunes a viernes, 8 a. m. a 9 p. m. ET"); spaces inside the times never break. */
export const HOURS_ES = 'lunes a viernes, 8 a. m. a 9 p. m. ET';

/** English route → Spanish route, for every page that has a Spanish version. Links on Spanish pages follow this map. */
export const ES_PATHS = Object.freeze({
  ...LEGAL_ES_PATHS,
  '/': '/pages/es',
  '/pages/nevora': '/pages/es-nevora',
  '/pages/plans': '/pages/es-planes',
  '/pages/products': '/pages/es-productos',
  '/pages/contact': '/pages/es-contacto',
  '/pages/about': '/pages/es-nosotros',
  '/pages/help': '/pages/es-ayuda',
  '/pages/custom-development': '/pages/es-a-la-medida',
  '/pages/sign-in': '/pages/es-entrar',
  '/pages/nevora-start': '/pages/es-prueba',
  '/pages/nevora-billing': '/pages/es-facturacion',
  '/pages/nevora-verify': '/pages/es-configurar',
  '/pages/nevora-billing-return': '/pages/es-pago',
});

/** English-only pages whose closest Spanish page is not the Spanish home: the ES switch goes there instead. */
export const ES_NEAREST = Object.freeze({
  '/pages/legal': '/pages/es-ayuda', '/pages/cookies': '/pages/es-ayuda', '/pages/website-terms': '/pages/es-ayuda',
  '/pages/software-project-terms': '/pages/es-ayuda', '/pages/accessibility': '/pages/es-ayuda', '/pages/security': '/pages/es-ayuda',
});

/** Spanish routes: same kinds (and so the same components, images and order) as their English pages. */
const es = (en, fields) => ({ lang: 'es', en, sections: [], ...fields });
export const ES_ROUTES = {
  ...LEGAL_ES_ROUTES,
  '/pages/es': es('/', {
    kind: 'home', title: 'Todo tu equipo, en un solo lugar.', eyebrow: 'Velani',
    name: 'Velani · Software, sitios web y apps a la medida para tu negocio',
    intro: 'Creamos sitios web, apps de reservas, tiendas en línea y herramientas de negocio, y NEVORA: horarios, registro de tiempo y cálculo de nómina por turnos.',
    og: ['velani-social.png', 'Velani. Más luz para tu trabajo.'],
  }),
  '/pages/es-nevora': es('/pages/nevora', {
    kind: 'nevora', nav: 'nevora', eyebrow: 'NEVORA',
    title: 'NEVORA · Horarios, registro de tiempo y cálculo de nómina para equipos por turnos',
    name: 'NEVORA · Horarios, registro de tiempo y nómina',
    intro: 'Horarios, registro de tiempo y cálculo de nómina para equipos por turnos: planifica en la web, consulta turnos en el teléfono y marca entrada con un PIN.',
    og: ['velani-social-nevora.png', 'NEVORA en un teléfono: horarios, registro de tiempo y cálculo de nómina para equipos por turnos'],
  }),
  '/pages/es-productos': es('/pages/products', {
    kind: 'products', nav: 'products', eyebrow: 'Velani', title: 'Lo que hacemos.', name: 'Productos',
    intro: 'NEVORA Workforce: horarios, registro de tiempo y cálculo de nómina, gratis por 30 días. NEVORA Relay: pedidos e inventario, en diseño. Sitios web y apps.',
    og: ['velani-social.png', 'Velani. Productos de software y desarrollo a la medida.'],
  }),
  '/pages/es-planes': es('/pages/plans', {
    kind: 'plans', nav: 'plans', eyebrow: 'Planes', name: 'Planes',
    title: 'Prueba NEVORA gratis por 30 días.',
    intro: 'Prueba NEVORA gratis por 30 días, sin tarjeta. Luego $19 al mes para hasta 15 empleados o $29 al mes para 16 a 30, por negocio.',
    lede: 'Pide tu prueba gratis de NEVORA, sin tarjeta. Luego un precio mensual por negocio.',
    og: ['velani-social-plans.png', 'Planes de NEVORA: gratis por 30 días y luego un precio mensual por negocio'],
  }),
  '/pages/es-contacto': es('/pages/contact', {
    kind: 'contact', nav: 'contact', eyebrow: 'Contacto', title: 'Cuéntanos qué necesitas.', name: 'Contacto',
    intro: 'Cuéntanos qué necesita funcionar mejor y quién lo usará. Te respondemos por correo en un plazo de dos días laborables.',
    og: ['velani-social.png', 'Velani. Escríbenos sobre tu proyecto o sobre NEVORA.'],
  }),
};

ES_ROUTES['/pages/es-nosotros'] = es('/pages/about', {
  nav: 'about', eyebrow: 'Sobre Velani', name: 'Nosotros',
  title: 'Software para pequeños negocios.',
  intro: 'Empezamos Velani en 2026 para crear software para pequeños negocios: alcance y precio fijo por escrito antes del trabajo pagado, entregas por hitos que pruebas funcionando, y todo en inglés y en español.',
  desc: 'Velani, de VELANI LLC, hace NEVORA para horarios, registro de tiempo y cálculo de nómina, y diseña y crea sitios web y apps para negocios.',
});
ES_ROUTES['/pages/es-ayuda'] = es('/pages/help', {
  kind: 'faq', nav: 'help', eyebrow: 'Soporte', name: 'Soporte',
  desc: 'Soporte al cliente de Velani: ayuda con un sitio web o una app que creamos, cómo obtener NEVORA, cómo funciona la prueba gratis y cómo escribirnos.',
  title: 'Aquí para ayudarte.',
  intro: 'Soporte al cliente, respuestas sobre nuestro trabajo y ayuda para quienes usan NEVORA.',
  sections: [
    { heading: '¿Cómo consigue mi negocio NEVORA?', text: 'Pide una prueba gratis de 30 días en la página de Planes. El registro en línea todavía no está abierto, así que configuramos tu lugar de trabajo contigo. Después de la prueba, el negocio paga $19 al mes para hasta 15 empleados o $29 al mes para 16 a 30, con la app completa. Los negocios con más de 30 empleados nos escriben primero para una configuración asistida. Los empleados reciben su cuenta de su lugar de trabajo, no de este sitio web.' },
    { heading: '¿Velani desarrolla software a la medida?', text: 'Sí. Describe en la página de contacto la aplicación, el proceso interno o la integración que necesitas.' },
    { heading: '¿Me pueden dar un precio o una fecha de entrega aquí?', text: 'No en el sitio web. Le ponemos precio a un proyecto cuando acordamos su alcance, y dejamos los honorarios, los hitos y las fechas de entrega en el acuerdo de proyecto por escrito.' },
    { heading: '¿Una consulta inicia un contrato?', text: 'No. Una consulta inicia una conversación. No compra un producto ni da inicio a trabajo pagado.' },
    { heading: '¿Dónde envío información confidencial?', text: 'No envíes contraseñas, claves de API, datos de pago ni registros confidenciales por un formulario público o por correo normal. Primero pide un canal adecuado.' },
    { heading: '¿Cómo contacto al soporte al cliente?', text: 'El soporte al cliente responde de ' + HOURS_ES + '. Escribe a support@thevelani.com o usa la página de contacto.' },
    { heading: '¿Cómo funciona la prueba gratis de NEVORA?', text: 'Un negocio con hasta 30 empleados puede usar NEVORA gratis por 30 días desde que se crea su lugar de trabajo en NEVORA. No se necesita tarjeta y no se cobra nada. El día 30 te suscribes o NEVORA queda en pausa para tu equipo. El dueño todavía puede abrir la facturación y exportar los registros de nómina disponibles, y los empleados todavía pueden ver sus propios comprobantes de nómina. Terminar la prueba no inicia ninguna eliminación automática. Para cerrar un lugar de trabajo o preguntar por sus registros, escribe a support@thevelani.com. Un equipo de más de 30 nos escribe primero: revisamos si califica y te damos una cotización, y los equipos aprobados reciben los mismos 30 días gratis. NEVORA calcula los comprobantes de nómina; no les paga a los empleados ni presenta impuestos de nómina.' },
  ],
});

ES_ROUTES['/pages/es-prueba'] = es('/pages/nevora-start', {
  kind: 'commerce', step: 'start', nav: 'plans', eyebrow: '', name: 'Pide una prueba de NEVORA', noindex: true,
  title: 'Tu prueba gratis.',
  intro: 'La app completa para tu equipo, gratis por 30 días. Sin tarjeta.',
  desc: 'Pide una prueba gratis de NEVORA por 30 días para tu negocio. Sin tarjeta.',
});
ES_ROUTES['/pages/es-facturacion'] = es('/pages/nevora-billing', {
  kind: 'commerce', step: 'billing', nav: 'plans', eyebrow: '', name: 'Facturación de NEVORA', noindex: true,
  title: 'Plan y facturación.',
  intro: 'El dueño del negocio abre la facturación desde NEVORA, en Configuración.',
});
ES_ROUTES['/pages/es-configurar'] = es('/pages/nevora-verify', {
  kind: 'commerce', step: 'verify', nav: 'plans', eyebrow: '', name: 'Configura tu lugar de trabajo de NEVORA', noindex: true,
  title: 'Configura tu lugar de trabajo.',
  intro: 'La configuración del lugar de trabajo ocurre en NEVORA. El botón de tu correo de verificación la abre.',
});
ES_ROUTES['/pages/es-pago'] = es('/pages/nevora-billing-return', {
  kind: 'commerce', step: 'return', nav: 'plans', eyebrow: '', name: 'Facturación de NEVORA',
  title: 'Plan y facturación.',
  intro: '', noindex: true,
  desc: 'Facturación de un lugar de trabajo de NEVORA. El dueño del negocio abre la facturación desde NEVORA, en Configuración.',
});
ES_ROUTES['/pages/es-entrar'] = es('/pages/sign-in', {
  kind: 'signin', nav: 'signin', eyebrow: '', name: 'Cómo entrar a NEVORA',
  title: 'Cómo entrar a NEVORA.',
  intro: 'Cómo entrar a NEVORA en la dirección de tu lugar de trabajo, qué hacer si olvidaste tu contraseña y para qué sirve tu PIN.',
  desc: 'Cómo entrar a NEVORA: la dirección de tu lugar de trabajo, tu ID de empleado y tu contraseña, y qué hacer si olvidaste tu contraseña o tu PIN.',
});
ES_ROUTES['/pages/es-a-la-medida'] = es('/pages/custom-development', {
  kind: 'services', nav: 'services', eyebrow: 'Software a la medida', name: 'Software a la medida',
  title: 'Sitios web y apps para tu negocio.',
  intro: 'Diseñamos y creamos sitios web, apps de reservas, tiendas en línea y herramientas de negocio. Antes de empezar cualquier trabajo pagado, recibes una cotización fija por escrito.',
  desc: 'Velani diseña y crea sitios web, apps de reservas, tiendas en línea y herramientas de negocio, con una cotización fija por escrito.',
  og: ['velani-social-custom.png', 'Velani: un sitio web creado por Velani para un cliente'],
});

/** The Custom software page below its hero (render.mjs WORK.en has the English). */
export const WORK_ES = {
  shotsLabel: 'Pantallas de Tool Box LLC',
  toolbox: { kind: 'Sitio web y tienda en línea de alquiler de equipos', story: [['Lo que necesitaban', 'Tool Box alquila elevadores y otros equipos. Antes de alquilar, un cliente necesita tres respuestas: qué máquina, qué fechas y cuánto cuesta la entrega a su obra.'], ['Lo que decidimos', 'Las tres respuestas van en la página de cada máquina, así el cliente las resuelve desde su teléfono y reserva.'], ['Lo que entregamos', 'Un sitio web y una tienda en línea. La tienda calcula la entrega según la distancia a la obra, cobra el pago y le envía el pedido al equipo de Tool Box.']], shots: [['tb-home', 'El sitio web de Tool Box LLC, creado por Velani: alquiler de equipos con entrega en la obra y fechas', 2000, 1250], ['store', 'La tienda en línea de Tool Box LLC, creada por Velani: equipos de alquiler con precios y un botón para reservar en cada uno', 1600, 1000]] },
  yavi: { kind: 'App de reservas y recompensas', story: [['Lo que necesitaban', 'Una barbería vive de las citas y de sus clientes de siempre.'], ['Lo que decidimos', 'Las reservas y la tarjeta de recompensas viven en una sola app.'], ['Lo que entregamos', 'Los clientes eligen un servicio y una hora, reciben un recordatorio antes de la cita y cada visita suma en su tarjeta de recompensas.']], shots: [['yavi-book', 'Reservas de Yavi Barber en un teléfono: los próximos horarios disponibles y los servicios con precios'], ['yavi-rewards', 'Tarjeta de recompensas de Yavi Barber en un teléfono: diez visitas y dos recompensas']] },
  more: ['También creamos herramientas internas para tu equipo, como formularios de solicitudes, aprobaciones y paneles. Como ejemplo, mira ', 'NEVORA', ', la app de personal que hacemos.'],
  getT: 'Lo que recibes', get: ['Cada proyecto incluye el diseño, el desarrollo y la configuración del hosting. Si lo quieres en inglés y español, creamos ambos. Después del lanzamiento, seguimos dándole soporte.', 'Antes de empezar cualquier trabajo pagado, recibes una cotización fija por escrito. El precio depende de lo que necesite el proyecto.'],
  howT: 'Cómo funciona un proyecto', how: ['Nos muestras cómo se hace el trabajo hoy y quién lo hace. Luego recibes la propuesta por escrito con lo que vamos a crear, el precio fijo y los hitos. El trabajo pagado empieza solo cuando estés de acuerdo.', 'Creamos por hitos, y en cada uno pruebas el software funcionando. El acuerdo indica quién es dueño del código, qué recibes y cómo funciona el soporte después del lanzamiento.'],
  project: 'Empieza un proyecto', endLine: 'Cuéntanos qué tiene que funcionar mejor. Primero recibes una cotización fija por escrito.',
  zoom: [['aria-label\', \'Screenshot\'', 'aria-label\', \'Captura de pantalla\''], ['aria-label="Close"', 'aria-label="Cerrar"'], ['aria-label="Screenshot, scrollable"', 'aria-label="Captura de pantalla, desplazable"'], ['Swipe to see the whole screen', 'Desliza para ver toda la pantalla'], ["'View full screen: '", "'Ver en pantalla completa: '"]],
};

/** The About and Support pages below their heroes. */
export const ABOUT_ES = { h1: 'Software para pequeños negocios.', text: 'Empezamos Velani en 2026 para crear software para pequeños negocios, con un precio fijo por escrito y todo en inglés y en español.', project: 'Empieza un proyecto', see: 'Mira NEVORA',
  builtT: 'Lo que hemos creado',
  built: [['NEVORA', 'Horarios, registro de tiempo y cálculo de nómina para equipos por turnos. Nuestro propio producto, lanzado en 2026.', 'Mira NEVORA', '/pages/nevora', 'night-r1-owner.webp', 'NEVORA en la web para un dueño: un asunto que necesita respuesta, cinco de cinco con entrada marcada, el próximo día de pago y las horas de esta semana', false],
    ['Tool Box LLC', 'Un sitio web de alquiler de equipos con tienda en línea, creado en 2026.', 'Mira el proyecto', '/pages/custom-development#web-applications', 'night-tb-home.webp', 'El sitio web de Tool Box LLC, creado por Velani: alquiler de equipos con entrega en la obra y fechas', false],
    ['Yavi Barber', 'Una app de reservas y recompensas, creada en 2026.', 'Mira el proyecto', '/pages/custom-development#booking', 'night-yavi-book.webp', 'Reservas de Yavi Barber en un teléfono: los próximos horarios disponibles y los servicios con precios', true]],
  coT: 'La empresa', callK: '¿Prefieres hablar? Llámanos.',
  endLine: 'Prueba NEVORA gratis por 30 días, y Jose, de Velani, lo configura contigo.', also: ['También creamos sitios web y apps para negocios.', 'Mira el software a la medida', '/pages/es-a-la-medida'],
  facts: [['Fundada en 2026', 'Velani es una marca de VELANI LLC.'], ['Inglés y español', 'Trabajamos, escribimos y creamos en los dos idiomas.'], ['Respuesta en dos días laborables', 'El soporte al cliente atiende de ' + HOURS_ES + '.']] };
export const FAQ_ES = {
  h1: 'Pide ayuda a Velani.', text: 'Preguntas sobre un sitio web o una app que creamos, sobre NEVORA o sobre cómo trabajamos. Leemos el correo de ' + HOURS_ES + ', y respondemos en un plazo de dos días laborables.',
  endT: '¿Todavía necesitas ayuda?', endLinks: [['Escribe a support@thevelani.com', 'mailto:support@thevelani.com'], ['Soporte de NEVORA', '/pages/nevora-support']],
  callK: 'Si tu equipo no puede trabajar, llámanos.',
  doors: [['Un sitio web o una app que creamos', 'Algo dejó de funcionar o necesitas un cambio.', 'Pide ayuda', '/pages/help?interest=client-help#client', true], ['NEVORA', 'Cómo entrar, tu cuenta, tus datos y cómo eliminar tu cuenta. La página está en inglés.', 'Soporte de NEVORA', '/pages/nevora-support', false]],
  doorsLabel: 'Formas de recibir ayuda', qT: 'Preguntas', contactPage: 'Página de contacto',
};

/** Words for a link to a page that exists only in English. */
export const IN_ENGLISH = '(en inglés)';

/** The site chrome on Spanish pages: header, Products menu, phone menu, language switch, closing panel. */
export const CHROME_ES = {
  skip: 'Saltar al contenido', home: 'Inicio de Velani', main: 'Principal', mainMenu: 'Menú principal', menu: 'Menú',
  products: 'Productos', productsMenu: 'Menú de productos',
  productsList: [
    ['NEVORA Workforce', '/pages/nevora', 'Horarios, registro de tiempo y cálculo de nómina'],
    ['Rondo en NEVORA', '/pages/nevora#rondo', 'El asistente que responde las preguntas del dueño'],
    ['NEVORA Relay<span class="nav-soon">En diseño</span>', '/pages/nevora#relay', 'Pedidos, pantalla de cocina e inventario'],
  ],
  nav: [['Sitios web', '/pages/custom-development#web-applications', 'websites'], ['Apps a la medida', '/pages/custom-development', 'services'], ['Planes', '/pages/plans', 'plans'], ['Soporte', '/pages/help', 'help'], ['Nosotros', '/pages/about', 'about']],
  groups: [
    ['nevora', 'NEVORA', ['nevora', 'products', 'plans'], [['NEVORA Workforce', '/pages/nevora', 'Horarios, registro de tiempo y cálculo de nómina'], ['Planes y precios', '/pages/plans', 'Gratis por 30 días y luego un solo precio por negocio'], ['Rondo en NEVORA', '/pages/nevora#rondo', 'El asistente que responde las preguntas del dueño'], ['NEVORA Relay<span class="nav-soon">En diseño</span>', '/pages/nevora#relay', 'Pedidos, pantalla de cocina e inventario']]],
    ['custom', 'Software a la medida', ['services', 'websites'], [['Sitios web', '/pages/custom-development#web-applications', 'Sitios que traen llamadas y reservas'], ['Apps de reservas', '/pages/custom-development#booking', 'Reservas, recordatorios y tarjetas de recompensas'], ['Tiendas en línea', '/pages/custom-development#online-stores', 'Productos, precio de entrega y pago'], ['Herramientas de negocio', '/pages/custom-development#business-systems', 'Solicitudes, aprobaciones y registros en un solo lugar']]],
    ['company', 'Empresa', ['about', 'help', 'contact'], [['Nosotros', '/pages/about', 'Qué hacemos y cómo trabajamos'], ['Soporte', '/pages/help', 'Lunes a viernes, 8 a. m. a 9 p. m. ET'], ['Contacto', '/pages/contact', 'Empieza un proyecto o haz una pregunta']]],
  ],
  signIn: 'Entrar', signInHref: '/pages/sign-in',
  rondoNevora: 'Rondo en NEVORA', rondoSoon: 'En desarrollo', relaySoon: 'Pronto', contact: 'Contacto',
  trial: 'Pide la prueba gratis', trialLong: 'Pide la prueba gratis de NEVORA', project: 'Empieza un proyecto',
  support: 'Soporte al cliente', hours: HOURS_ES, brandOf: 'Velani es una marca de ',
  langGroup: 'Idioma',
  // Closing panel on company pages
  closingLine: 'Prueba NEVORA gratis o cuéntanos qué quieres crear.',
  // The footer's words are in src/night/foot.es.html
};

/** The cookie choices dialog: the title, the necessary purpose and the four optional purposes. */
export const CONSENT_ES = {
  title: 'Opciones de cookies', close: 'Cerrar opciones de cookies',
  summary: ['Elige qué procesamiento opcional permites. Las funciones necesarias de la plataforma se explican en nuestra página ', 'Cookies y preferencias', ' ' + IN_ENGLISH + '.'],
  necessary: ['Necesarias', 'Funcionamiento del sitio web, seguridad y recordar tus opciones.'], alwaysOn: 'Siempre activas',
  preferences: ['Preferencias', 'Ajustes opcionales que personalizan una visita.'],
  analytics: ['Analítica', 'Medición de visitas y páginas vistas por Shopify y Mailchimp.'],
  marketing: ['Marketing', 'Información de visitas que Mailchimp, nuestra herramienta de correo, puede usar para marketing.'],
  sale: ['Venta o intercambio de datos', 'Intercambio de datos con Mailchimp que algunas leyes estatales de EE. UU. consideran una “venta” o un “intercambio”. Déjalo desactivado para excluirte.'],
  reject: 'Rechazar todas las opcionales', accept: 'Aceptar todas las opcionales', save: 'Guardar opciones',
};

/** The contact page: hero variants, form labels, the sent confirmation, the inquiry-off panel and the aside. */
/** Sign in page (Spanish). Values sent with a request stay in English, like the contact topics. */
export const SIGNIN_ES = {
  h1: 'Cómo entrar a NEVORA.', appText: 'NEVORA no tiene una página de entrada compartida. Cada lugar de trabajo tiene su propia dirección, y entras ahí con tu ID de empleado y tu contraseña.', support: 'Soporte de NEVORA', factsLabel: 'Ayuda para entrar',
  endT: '¿Todavía no puedes entrar?', endLinks: [['Soporte de NEVORA', '/pages/nevora-support'], ['Escribe a support@thevelani.com', 'mailto:support@thevelani.com']],
  facts: [['Tu dirección y tu ID', 'Están en el correo de invitación de tu lugar de trabajo. ¿Lo perdiste? Pregúntale a tu empleador.'],
    ['¿Olvidaste tu contraseña?', 'Elige ¿Olvidaste tu contraseña? en la página para entrar de tu lugar de trabajo. Vas a necesitar tu ID de empleado y el correo que tu lugar de trabajo tiene registrado.'],
    ['Tu PIN de 4 dígitos', 'Es solo para marcar entrada en la tableta de tu lugar de trabajo, no para entrar a NEVORA. ¿Lo olvidaste? Pide al dueño del negocio que te ponga uno nuevo.']],
  webAlt: 'NEVORA en la web para un dueño: un asunto que necesita respuesta, cinco de cinco con entrada marcada y el próximo día de pago', phoneAlt: 'NEVORA en el teléfono de una empleada: su turno de hoy y sus próximos turnos',
  clientT: '¿Necesitas algo en tu sitio o tu app?', clientText: 'Pídenos una página nueva, una función o un cambio, o cuéntanos qué dejó de funcionar. Respondemos por correo en un plazo de dos días laborables.',
  callK: 'Si tu equipo no puede trabajar, llámanos.',
  need: 'Tipo de solicitud', kinds: [['Trabajo nuevo', 'Una página nueva, una función o un cambio.'], ['Ayuda', 'Algo de tu sitio o tu app dejó de funcionar.']],
  business: 'Negocio', message: ['¿Qué necesitas?', '¿Qué pasó?'],
  timing: ['Plazo', [['No rush', 'Sin prisa'], ['This month', 'Este mes'], ['This week', 'Esta semana']]],
  urgency: ['Urgencia', [['It can wait', 'Puede esperar'], ["It's slowing us down", 'Nos está atrasando'], ["We can't work", 'No podemos trabajar']]],
  send: ['Enviar solicitud', 'Enviar a soporte'], check: 'Revisar el borrador', note: 'No envíes contraseñas ni datos de pago.',
  preview: 'Vista previa. Este formulario revisa tu borrador y no envía nada.',
  project: 'Sitio web o app', refK: 'Tu referencia', refCopy: 'Copiar referencia',
  hubNote: 'Usamos estos datos solo para responder tu solicitud. Los registros de solicitudes se guardan hasta 90 días; las copias por correo pueden durar más. No se crea ninguna cuenta.',
  hubOff: 'Ahora mismo no se pueden enviar solicitudes desde esta página. No se envió nada de lo que escribiste. Escríbenos a:',
  hubTest: 'Copia de prueba de aceptación. Las solicitudes enviadas desde esta página son reales y llegan al soporte de Velani.',
  hubNoscript: 'Este formulario necesita JavaScript. También puedes escribir a ',
};
export const CONTACT_ES = {
  kicker: ['NEVORA para tu equipo', 'Prueba gratis de NEVORA por 30 días', 'NEVORA Relay'],
  h1: ['Configura NEVORA para un equipo grande.', 'Pide tu prueba gratis de NEVORA.', 'Únete a la lista de NEVORA Relay.'],
  fact: ['Un sitio web, una app, NEVORA u otra cosa. Te respondemos por correo en un plazo de dos días laborables.', 'Para equipos de más de 30 empleados. Revisamos lo que necesitas y configuramos tu lugar de trabajo contigo. Los equipos que califican reciben los mismos 30 días gratis. Respondemos en un plazo de dos días laborables.', 'Cuéntanos sobre tu equipo. Jose, de Velani, te responde en un plazo de dos días laborables y configura tu lugar de trabajo contigo. Tus 30 días gratis comienzan cuando se crea tu lugar de trabajo en NEVORA, sin tarjeta.', 'NEVORA Relay está en diseño y aún no tiene fechas. Te escribiremos cuando abra el acceso anticipado.'],
  callK: '¿Prefieres hablar? Llámanos.', topicQ: '¿Sobre qué es?', preview: 'Vista previa. Este formulario revisa tu borrador y no envía nada.',
  tiles: [['custom-software', 'Web o app'], ['nevora', 'NEVORA'], ['other', 'Otra cosa']],
  previewNote: 'Vista previa del sitio web&nbsp;· revisa tu borrador, no envía nada',
  noscript: 'El formulario de vista previa necesita JavaScript. Desde esta vista previa no se envían mensajes.',
  legend: 'Consulta',
  name: 'Nombre', email: 'Correo electrónico', company: 'Empresa', optional: 'opcional',
  topic: 'Tema', topics: [['website', 'Sitio web'], ['custom-software', 'App a la medida'], ['nevora', 'NEVORA para más de 30'], ['nevora-demo', 'Prueba gratis de NEVORA'], ['relay', 'Lista de espera de NEVORA Relay'], ['other', 'Otra cosa']],
  team: 'Tamaño del equipo', bigTeam: 'Más de 30 (configuración asistida)', locations: 'Número de ubicaciones',
  message: 'Qué necesita funcionar mejor', messageOptional: 'Algo más',
  send: ['Enviar consulta', 'Pedir configuración asistida', 'Enviar solicitud de prueba', 'Unirme a la lista'], check: 'Revisar el borrador',
  sendNote: 'No envíes contraseñas ni datos de pago.', privacy: 'Aviso de privacidad',
  fine: 'El día 30, el dueño elige un plan en NEVORA. No se cobra nada hasta entonces. NEVORA calcula los comprobantes de nómina; no les paga a los empleados ni presenta impuestos de nómina.',
  sentPreview: 'Vista previa del sitio web&nbsp;· esto es lo que ven los visitantes después de enviar. No se envió nada.',
  sentH: 'Mensaje enviado.', sentP: 'Gracias por escribirnos. Te respondemos por correo en un plazo de dos días laborables.',
  sentFrom: ['Las respuestas llegan desde ', '. Si no ves nuestra respuesta en tu bandeja de entrada, revisa la carpeta de spam o de correo no deseado.'], back: 'Volver al inicio', sentNext: 'Mira cómo funciona NEVORA',
  writeTitle: 'Escríbenos', writeText: 'Qué necesita funcionar mejor, quién lo usará y cómo funciona hoy. Te respondemos desde ', writeButton: 'Escribe a ', noSensitive: 'No envíes contraseñas, datos de pago ni registros confidenciales por correo.',
};

/** The plans page below its hero. */
export const PLANS_ES = {
  h1: 'Prueba NEVORA gratis por 30 días.', text: 'Todo tu equipo usa la app completa, sin tarjeta. Después pagas un solo precio mensual por tu negocio: $19 para hasta 15 empleados y $29 para 16 a 30.',
  date: 'Tus 30 días gratis comienzan cuando se crea tu lugar de trabajo en NEVORA. Pide una prueba y te respondemos en un plazo de dos días laborables para configurarlo contigo.',
  trial: 'Pide la prueba gratis', quote: '¿Más de 30 empleados?',
  bands: [['$19', 'al mes', 'Hasta 15 empleados'], ['$29', 'al mes', 'De 16 a 30 empleados']], bandsLabel: 'Precios',
  billingHelp: ['¿Ya usas NEVORA? El dueño del negocio abre la facturación desde NEVORA, en Configuración. ', 'Ayuda con la facturación'],
  daysT: 'Tus 30 días', calLabel: 'Una prueba de ejemplo en un calendario',
  steps: [['Día 1', 'Tu lugar de trabajo está listo. Invitas a tu equipo y cada persona recibe un PIN para la tableta del registro de tiempo.'], ['Primera semana', 'Publicas el horario. Tu equipo ve sus turnos en el teléfono, cambia turnos y pide tiempo libre, en inglés o en español.'], ['Segunda semana', 'Apruebas las tarjetas de tiempo. NEVORA calcula la nómina a partir de las horas aprobadas y prepara un comprobante para cada empleado.'], ['Día 30', 'El día 30, el dueño elige un plan en NEVORA. No se cobra nada hasta entonces.']],
  fine: 'NEVORA calcula los comprobantes de nómina. No les paga a los empleados ni presenta impuestos de nómina.',
  shotAlt: 'Horario de NEVORA para la semana: ocho personas, sus turnos de cada día y la semana publicada', shotCap: 'La semana de Carmen en Northside Coffee, un lugar de trabajo de ejemplo: ocho personas y todos los turnos publicados.',
  priceT: 'Después de 30 días, un precio mensual',
  includes: 'Cada negocio recibe la app completa: horarios, registro de tiempo, tarjetas de tiempo y cálculo de nómina. El precio depende solo de cuántos empleados tienes, y los dueños no cuentan.',
  card: { q: 'Tu equipo', unit: 'empleados', per: 'al mes', small: '1 a 15 · $19', team: '16 a 30 · $29', less: 'Un empleado menos', more: 'Un empleado más', note: 'Se cobra cada mes, por negocio.', valueText: (n, p) => n + ' empleados, ' + p + ' al mes' },
  terms: 'Los precios son en dólares estadounidenses y pueden cambiar antes de que abra la facturación en línea. Cancela cuando quieras y NEVORA sigue funcionando hasta el final del mes pagado. Si no te suscribes al terminar la prueba, NEVORA queda en pausa para tu equipo; el dueño todavía puede abrir la facturación y exportar los registros de nómina disponibles.',
  over: ['¿Más de 30 empleados? ', 'Escríbenos para una configuración asistida', '. Respondemos en un plazo de dos días laborables.'],
  closing: 'Los sitios web y las apps a la medida reciben una cotización fija por escrito para cada proyecto.', project: 'Empieza un proyecto', custom: 'Mira el software a la medida',
};
