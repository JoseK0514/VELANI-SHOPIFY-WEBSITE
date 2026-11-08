// Spanish (es) copy for the five Spanish pages and the shared site chrome on them, in one place for review.
// Neutral Latin American Spanish for Puerto Rico business owners, "tú" form, NEVORA app terms (docs/i18n/es-glossary.md).
// Page bodies with their own markup live in src/night/*.es.body.html; the browser scripts keep their own EN/ES tables
// (public/assets/velani.js, src/night/assist.js, kiosk.js, motion.js, nevora.js).
// Facts must match the English pages exactly: no added claims.

/** Hours as they appear in lists and sentences ("lunes a viernes, 8 a. m. a 9 p. m. ET"); spaces inside the times never break. */
export const HOURS_ES = 'lunes a viernes, 8 a. m. a 9 p. m. ET';

/** English route → Spanish route, for every page that has a Spanish version. Links on Spanish pages follow this map. */
export const ES_PATHS = Object.freeze({
  '/': '/pages/es',
  '/pages/nevora': '/pages/es-nevora',
  '/pages/plans': '/pages/es-planes',
  '/pages/products': '/pages/es-productos',
  '/pages/contact': '/pages/es-contacto',
  '/pages/about': '/pages/es-nosotros',
  '/pages/help': '/pages/es-ayuda',
  '/pages/custom-development': '/pages/es-a-la-medida',
  '/pages/sign-in': '/pages/es-entrar',
});

/** English-only pages whose closest Spanish page is not the Spanish home: the ES switch goes there instead. */
export const ES_NEAREST = Object.freeze({
});

/** Spanish routes: same kinds (and so the same components, images and order) as their English pages. */
const es = (en, fields) => ({ lang: 'es', en, sections: [], ...fields });
export const ES_ROUTES = {
  '/pages/es': es('/', {
    kind: 'home', title: 'Más luz para tu trabajo.', eyebrow: 'Velani',
    name: 'Velani · Software, sitios web y apps a la medida para tu negocio',
    intro: 'Creamos sitios web, apps de reservas, tiendas en línea y herramientas de negocio, y NEVORA: horarios, registro de tiempo y nómina para equipos por turnos.',
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
    intro: 'Prueba gratis de NEVORA por 30 días para equipos de hasta 30 empleados, sin tarjeta ni cargos automáticos. Luego, un solo precio por negocio, por cotización.',
    lede: 'Pide una prueba gratis de NEVORA para tu equipo, sin tarjeta ni cargos automáticos. El día 30 decides qué sigue.',
    og: ['velani-social-plans.png', 'Planes de NEVORA: gratis por 30 días y luego un solo precio por negocio'],
  }),
  '/pages/es-contacto': es('/pages/contact', {
    kind: 'contact', nav: 'contact', eyebrow: 'Contacto', title: 'Cuéntanos qué necesitas.', name: 'Contacto',
    intro: 'Cuéntanos qué necesita funcionar mejor y quién lo usará. Procuramos responderte por correo en un plazo de dos días laborables.',
    og: ['velani-social.png', 'Velani. Escríbenos sobre tu proyecto o sobre NEVORA.'],
  }),
};

ES_ROUTES['/pages/es-nosotros'] = es('/pages/about', {
  nav: 'about', eyebrow: 'Sobre Velani', name: 'Nosotros',
  title: 'Software para pequeños negocios.',
  intro: 'Empezamos Velani en 2026 para darles a los pequeños negocios software de primera calidad a precios que puedan pagar.',
  desc: 'Velani, de VELANI LLC, hace NEVORA para horarios, registro de tiempo y cálculo de nómina, y diseña y crea sitios web y apps para negocios.',
});
ES_ROUTES['/pages/es-ayuda'] = es('/pages/help', {
  kind: 'faq', nav: 'help', eyebrow: 'Soporte', name: 'Soporte',
  desc: 'Soporte al cliente de Velani: cómo obtener NEVORA, cómo funciona la prueba gratis y cómo escribirnos o llamarnos.',
  title: 'Aquí para ayudarte.',
  intro: 'Soporte al cliente, respuestas sobre nuestro trabajo y ayuda para quienes usan NEVORA.',
  sections: [
    { heading: '¿Cómo obtiene NEVORA mi negocio?', text: 'NEVORA se ofrece a los negocios por cotización, con una prueba gratis de 30 días para equipos de hasta 30 empleados. Después de la prueba hay un solo precio por negocio, cotizado según tu número de empleados, tu negocio y las funciones que uses. Pide una cotización o una prueba y hablamos de lo que necesita tu equipo. Los empleados reciben su cuenta de su lugar de trabajo, no de este sitio web.' },
    { heading: '¿Velani desarrolla software a la medida?', text: 'Sí. Describe en la página de contacto la aplicación, el proceso interno o la integración que necesitas.' },
    { heading: '¿Me pueden dar un precio o una fecha de entrega aquí?', text: 'No en el sitio web. Le ponemos precio a un proyecto cuando acordamos su alcance, y dejamos los honorarios, los hitos y las fechas de entrega en el acuerdo de proyecto por escrito.' },
    { heading: '¿Una consulta inicia un contrato?', text: 'No. Una consulta inicia una conversación. No compra un producto ni da inicio a trabajo pagado.' },
    { heading: '¿Dónde envío información confidencial?', text: 'No envíes contraseñas, claves de API, datos de pago ni registros confidenciales por un formulario público o por correo normal. Primero pide un canal adecuado.' },
    { heading: '¿Cómo contacto al soporte al cliente?', text: 'El soporte al cliente responde de ' + HOURS_ES + '. Escribe a support@thevelani.com, llama al 787-925-2000 o usa la página de contacto.' },
    { heading: '¿Cómo funciona la prueba gratis de NEVORA?', text: 'Un negocio con hasta 30 empleados puede usar NEVORA gratis por 30 días desde la configuración. No se necesita tarjeta y no se cobra nada. El día 30 continúas por cotización o cierras el espacio de trabajo. Primero, exporta tus datos: un espacio de trabajo cerrado y sus datos se eliminan en un plazo de 3 días, incluidas las tarjetas de tiempo y los comprobantes de nómina. Para cerrarlo, escribe a support@thevelani.com. NEVORA calcula los comprobantes de nómina; no les paga a los empleados ni presenta impuestos de nómina.' },
  ],
});

ES_ROUTES['/pages/es-entrar'] = es('/pages/sign-in', {
  kind: 'signin', nav: 'signin', eyebrow: '', name: 'Entrar',
  title: 'Entra a NEVORA.',
  intro: 'Abre NEVORA o envíanos una solicitud sobre el sitio web o la app que creamos para ti.',
  desc: 'Entra a NEVORA, pide trabajo nuevo para tu sitio web o tu app, o recibe ayuda con un proyecto que Velani creó.',
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
  jump: [['Tool Box LLC', '#web-applications'], ['Yavi Barber', '#booking'], ['Lo que recibes', '#how']], jumpLabel: 'En esta página', shotsLabel: 'Pantallas de Tool Box LLC', moreLabel: 'Herramientas de negocio',
  toolbox: { kind: 'Sitio web y tienda en línea de alquiler de equipos', text: 'Tool Box alquila elevadores y otros equipos. Desde cualquier teléfono, sus clientes encuentran la máquina que necesitan, eligen las fechas y verifican la entrega a su obra. Cada máquina tiene su precio y un botón para reservar, y la tienda calcula la entrega según la distancia a la obra.', credit: 'Diseñamos y creamos el sitio web y la tienda en línea de Tool Box LLC.', shots: [['tb-home', 'El sitio web de Tool Box LLC, creado por Velani: alquiler de equipos con entrega en la obra y fechas', 2000, 1250], ['store', 'La tienda en línea de Tool Box LLC, creada por Velani: equipos de alquiler con precios y un botón para reservar en cada uno', 1600, 1000]] },
  yavi: { kind: 'App de reservas y recompensas', text: 'Los clientes de Yavi Barber eligen un servicio y una hora en su teléfono, reciben un recordatorio antes de la cita y suman cada visita en una tarjeta de recompensas.', credit: 'Diseñamos y creamos la app de reservas y recompensas de Yavi Barber.', shots: [['yavi-book', 'Reservas de Yavi Barber en un teléfono: los próximos horarios disponibles y los servicios con precios'], ['yavi-rewards', 'Tarjeta de recompensas de Yavi Barber en un teléfono: diez visitas y dos recompensas']] },
  more: ['También creamos herramientas internas para tu equipo, como formularios de solicitudes, aprobaciones y paneles. Como ejemplo, mira ', 'NEVORA', ', la app de personal que hacemos.'],
  getT: 'Lo que recibes', get: ['Cada proyecto incluye el diseño, el desarrollo y la configuración del hosting. Si lo quieres en inglés y español, creamos ambos. Después del lanzamiento, seguimos dándole soporte.', 'Antes de empezar cualquier trabajo pagado, recibes una cotización fija por escrito. El precio depende de lo que necesite el proyecto.'],
  howT: 'Cómo funciona un proyecto', how: ['Nos muestras cómo se hace el trabajo hoy y quién lo hace. Luego recibes la propuesta por escrito con lo que vamos a crear, el precio fijo y los hitos. El trabajo pagado empieza solo cuando estés de acuerdo.', 'Creamos por hitos, y en cada uno pruebas el software funcionando. El acuerdo indica quién es dueño del código, qué recibes y cómo funciona el soporte después del lanzamiento.'],
  project: 'Empieza un proyecto',
  zoom: [['aria-label\', \'Screenshot\'', 'aria-label\', \'Captura de pantalla\''], ['aria-label="Close"', 'aria-label="Cerrar"'], ['aria-label="Screenshot, scrollable"', 'aria-label="Captura de pantalla, desplazable"'], ['Swipe to see the whole screen', 'Desliza para ver toda la pantalla'], ["'View full screen: '", "'Ver en pantalla completa: '"]],
};

/** The About and Support pages below their heroes. */
export const ABOUT_ES = { h1: 'Software para pequeños negocios.', text: 'Empezamos Velani en 2026 para darles a los pequeños negocios software de primera calidad a precios que puedan pagar.', project: 'Empieza un proyecto', see: 'Ver NEVORA',
  builtT: 'Lo que hemos creado',
  built: [['NEVORA', 'Horarios, registro de tiempo y cálculo de nómina para equipos por turnos. Nuestro propio producto, lanzado en 2026.', 'Ver NEVORA', '/pages/nevora', 'night-r1-owner.webp', 'NEVORA en la web para un dueño: un asunto que necesita respuesta, cinco de cinco con entrada marcada, el próximo día de pago y las horas de esta semana', false],
    ['Tool Box LLC', 'Un sitio web de alquiler de equipos con tienda en línea, creado en 2026.', 'Ver el proyecto', '/pages/custom-development#web-applications', 'night-tb-home.webp', 'El sitio web de Tool Box LLC, creado por Velani: alquiler de equipos con entrega en la obra y fechas', false],
    ['Yavi Barber', 'Una app de reservas y recompensas, creada en 2026.', 'Ver el proyecto', '/pages/custom-development#booking', 'night-yavi-book.webp', 'Reservas de Yavi Barber en un teléfono: los próximos horarios disponibles y los servicios con precios', true]],
  coT: 'La empresa', callK: '¿Prefieres hablar? Llámanos.',
  facts: [['Fundada en 2026', 'Velani es una marca de VELANI LLC.'], ['Inglés y español', 'Trabajamos, escribimos y creamos en los dos idiomas.'], ['Respuesta en dos días laborables', 'El soporte al cliente atiende de ' + HOURS_ES + '.']] };
export const FAQ_ES = {
  h1: 'Pide ayuda a Velani.', text: 'Preguntas sobre un sitio web o una app que creamos, sobre NEVORA o sobre cómo trabajamos. Te respondemos por correo en un plazo de dos días laborables.',
  callK: 'Si no pueden trabajar, llámanos.',
  doors: [['Un sitio web o una app que creamos', 'Algo dejó de funcionar o necesitas un cambio.', 'Pedir ayuda', '/pages/sign-in?interest=client-help#client', true], ['NEVORA', 'Cómo entrar, tu cuenta, tus datos y cómo eliminar tu cuenta.', 'Soporte de NEVORA (en inglés)', '/pages/nevora-support', false]],
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
    ['Rondo en NEVORA<span class="nav-soon">En desarrollo</span>', '/pages/nevora#rondo', 'El asistente de IA que llega a NEVORA'],
    ['NEVORA Relay<span class="nav-soon">Próximamente</span>', '/pages/nevora#relay', 'Pedidos, pantalla de cocina e inventario'],
  ],
  nav: [['Sitios web', '/pages/custom-development#web-applications', 'websites'], ['Apps a la medida', '/pages/custom-development', 'services'], ['Planes', '/pages/plans', 'plans'], ['Soporte', '/pages/help', 'help'], ['Nosotros', '/pages/about', 'about']],
  groups: [
    ['nevora', 'NEVORA', ['nevora', 'products', 'plans'], [['NEVORA Workforce', '/pages/nevora', 'Horarios, registro de tiempo y cálculo de nómina'], ['Rondo en NEVORA<span class="nav-soon">En desarrollo</span>', '/pages/nevora#rondo', 'El asistente de IA que llega a NEVORA'], ['NEVORA Relay<span class="nav-soon">Próximamente</span>', '/pages/nevora#relay', 'Pedidos, pantalla de cocina e inventario'], ['Planes', '/pages/plans', 'Gratis por 30 días y luego un solo precio por negocio']]],
    ['custom', 'Software a la medida', ['services', 'websites'], [['Sitios web', '/pages/custom-development#web-applications', 'Sitios que traen llamadas y reservas'], ['Apps de reservas', '/pages/custom-development#booking', 'Reservas, recordatorios y tarjetas de recompensas'], ['Tiendas en línea', '/pages/custom-development#online-stores', 'Productos, precio de entrega y pago'], ['Herramientas de negocio', '/pages/custom-development#business-systems', 'Solicitudes, aprobaciones y registros en un solo lugar']]],
    ['company', 'Empresa', ['about', 'help', 'contact'], [['Nosotros', '/pages/about', 'Qué hacemos y cómo trabajamos'], ['Soporte', '/pages/help', 'Lunes a viernes, 8 a. m. a 9 p. m. ET'], ['Contacto', '/pages/contact', 'Empieza un proyecto o haz una pregunta']]],
  ],
  signIn: 'Entrar', signInHref: '/pages/sign-in',
  rondoNevora: 'Rondo en NEVORA', rondoSoon: 'En desarrollo', relaySoon: 'Pronto', contact: 'Contacto',
  trial: 'Prueba gratis', trialLong: 'Pide la prueba gratis de NEVORA', project: 'Empieza un proyecto',
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
  h1: 'Entra a NEVORA.', appText: 'Dueños, gerentes y empleados entran con el correo con el que su lugar de trabajo los invitó.', open: 'Abrir NEVORA', support: 'Soporte de NEVORA (en inglés)',
  appFact: '¿No puedes entrar? Pídele a tu gerente que te reenvíe la invitación.',
  webAlt: 'NEVORA en la web para un dueño: un asunto que necesita respuesta, cinco de cinco con entrada marcada y el próximo día de pago', phoneAlt: 'NEVORA en el teléfono de una empleada: su turno de hoy y sus próximos turnos',
  clientT: '¿Necesitas algo en tu sitio o tu app?', clientText: 'Pídenos una página nueva, una función o un cambio, o cuéntanos qué dejó de funcionar. Respondemos por correo en un plazo de dos días laborables.',
  callK: 'Si no pueden trabajar, llámanos.',
  need: '¿Qué necesitas?', kinds: [['Trabajo nuevo', 'Una página nueva, una función o un cambio.'], ['Ayuda', 'Algo de tu sitio o tu app dejó de funcionar.']],
  business: 'Negocio', message: ['¿Qué necesitas?', '¿Qué pasó?'],
  timing: ['¿Para cuándo lo necesitas?', [['No rush', 'Sin prisa'], ['This month', 'Este mes'], ['This week', 'Esta semana']]],
  urgency: ['¿Qué tan urgente es?', [['It can wait', 'Puede esperar'], ["It's slowing us down", 'Nos está atrasando'], ["We can't work", 'No podemos trabajar']]],
  send: ['Enviar solicitud', 'Enviar a soporte'], check: 'Revisar el borrador', note: 'No envíes contraseñas ni datos de pago.',
  preview: 'Vista previa. Este formulario revisa tu borrador y no envía nada.',
  writeT: 'Escríbenos', writeText: 'Cuéntanos qué necesitas o qué pasó, y de qué sitio web o app se trata. Respondemos desde ',
};
export const CONTACT_ES = {
  kicker: ['NEVORA para tu equipo', 'Prueba gratis de NEVORA por 30 días', 'NEVORA Relay'],
  h1: ['Pide una cotización de NEVORA.', 'Pide tu prueba gratis de NEVORA.', 'Únete a la lista de NEVORA Relay.'],
  fact: ['Un sitio web, una app, NEVORA u otra cosa. Te respondemos por correo en un plazo de dos días laborables.', 'Un solo precio por negocio, cotizado según tu número de empleados, tu negocio y las funciones que uses. Sin compromiso.', 'Gratis por 30 días para equipos de hasta 30 personas. No necesitas tarjeta.', 'NEVORA Relay está en diseño y aún no tiene fechas. Te escribiremos cuando abra el acceso anticipado.'],
  callK: '¿Prefieres hablar? Llámanos.', preview: 'Vista previa. Este formulario revisa tu borrador y no envía nada.',
  tiles: [['custom-software', 'Web o app'], ['nevora', 'NEVORA'], ['other', 'Otra cosa']],
  previewNote: 'Vista previa del sitio web&nbsp;· revisa tu borrador, no envía nada',
  noscript: 'El formulario de vista previa necesita JavaScript. Desde esta vista previa no se envían mensajes.',
  legend: 'Consulta',
  name: 'Nombre', email: 'Correo electrónico', company: 'Empresa', optional: 'opcional',
  topic: 'Tema', topics: [['website', 'Sitio web'], ['custom-software', 'App a la medida'], ['nevora', 'Cotización de NEVORA'], ['nevora-demo', 'Prueba gratis de NEVORA'], ['relay', 'Lista de espera de NEVORA Relay'], ['other', 'Otra cosa']],
  team: 'Tamaño del equipo', bigTeam: 'Más de 30 (por cotización)', locations: 'Número de ubicaciones',
  message: 'Qué necesita funcionar mejor', messageOptional: 'Algo más',
  send: ['Enviar consulta', 'Pedir una cotización', 'Enviar solicitud de prueba'], check: 'Revisar el borrador',
  sendNote: 'No envíes contraseñas ni datos de pago.', privacy: 'Aviso de privacidad ' + IN_ENGLISH,
  fine: 'El día 30 continúas por cotización o cierras el espacio de trabajo. Primero, exporta tus datos: un espacio de trabajo cerrado y sus datos se eliminan en un plazo de 3&nbsp;días, incluidas las tarjetas de tiempo y los comprobantes de nómina. Para cerrarlo, escribe a support@thevelani.com. NEVORA calcula los comprobantes de nómina; no les paga a los empleados ni presenta impuestos de nómina.',
  sentPreview: 'Vista previa del sitio web&nbsp;· esto es lo que ven los visitantes después de enviar. No se envió nada.',
  sentH: 'Mensaje enviado.', sentP: 'Gracias por escribirnos. Procuramos responderte por correo en un plazo de dos días laborables.',
  sentFrom: ['Las respuestas llegan desde ', '. Si no ves nuestra respuesta en tu bandeja de entrada, revisa la carpeta de spam o de correo no deseado.'], back: 'Volver al inicio',
  writeTitle: 'Escríbenos', writeText: 'Qué necesita funcionar mejor, quién lo usará y cómo funciona hoy. Te respondemos desde ', writeButton: 'Escribe a ', noSensitive: 'No envíes contraseñas, datos de pago ni registros confidenciales por correo.',
};

/** The plans page below its hero. */
export const PLANS_ES = {
  h1: 'Prueba NEVORA gratis por 30 días.', text: 'Los equipos de hasta 30 personas usan la app completa, sin tarjeta. Después del día 30 pagas un solo precio por el negocio, cotizado para tu equipo.',
  date: ['Gratis por 30 días desde el día en que configuramos tu espacio de trabajo.', 'Si configuramos tu espacio de trabajo hoy, es gratis hasta el '],
  trial: 'Pide la prueba gratis', quote: 'Pide una cotización',
  daysT: 'Tus 30 días', calLabel: 'Tu prueba en un calendario',
  steps: [['Día 1', 'Configuramos tu espacio de trabajo. Invitas a tu equipo y cada persona recibe un PIN para la tableta del registro de tiempo.'], ['Primera semana', 'Publicas el horario. Tu equipo ve sus turnos en el teléfono, cambia turnos y pide tiempo libre, en inglés o en español.'], ['Segunda semana', 'Apruebas las tarjetas de tiempo. NEVORA calcula la nómina a partir de las horas aprobadas y prepara un comprobante para cada empleado.'], ['Día 30', 'Tú decides qué sigue.']],
  fine: 'NEVORA calcula los comprobantes de nómina. No les paga a los empleados ni presenta impuestos de nómina.',
  shotAlt: 'Horario de NEVORA para la semana: ocho personas, sus turnos de cada día y la semana publicada', shotCap: 'La semana de Carmen en Northside Coffee, un lugar de trabajo de ejemplo: ocho personas y todos los turnos publicados.',
  endT: 'Cuando termina la prueba',
  end: [['Sigue con NEVORA', 'Te cotizamos un solo precio para tu negocio y tu equipo sigue trabajando sin pausa.'], ['Cierra tu espacio de trabajo', 'Exporta tus horarios, tarjetas de tiempo y comprobantes de nómina, y luego escribe a support@thevelani.com. Eliminamos el espacio de trabajo y sus datos en un plazo de 3 días.']],
  closing: 'Los sitios web y las apps a la medida reciben una cotización fija por escrito para cada proyecto.', project: 'Empieza un proyecto', custom: 'Mira Software a la medida',
};
