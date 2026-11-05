// Spanish (es) copy for the five Spanish pages and the shared site chrome on them, in one place for review.
// Neutral Latin American Spanish for Puerto Rico business owners, "tú" form, NEVORA app terms (docs/i18n/es-glossary.md).
// Page bodies with their own markup live in src/night/*.es.body.html; the browser scripts keep their own EN/ES tables
// (public/assets/velani.js, src/night/assist.js, kiosk.js, motion.js, nevora.js).
// Facts must match the English pages exactly: no added claims.

/** Hours as they appear in lists and sentences ("lunes a viernes, 8 a. m. a 9 p. m. ET"); spaces inside the times never break. */
export const HOURS_ES = 'lunes a viernes, 8 a. m. a 9 p. m. ET';

/** English route → Spanish route, for every page that has a Spanish version. Links on Spanish pages follow this map. */
export const ES_PATHS = Object.freeze({
  '/': '/pages/es',
  '/pages/nevora': '/pages/es-nevora',
  '/pages/plans': '/pages/es-planes',
  '/pages/products': '/pages/es-productos',
  '/pages/contact': '/pages/es-contacto',
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
    title: 'Gratis por 30 días. Luego, un solo precio por negocio.',
    intro: 'Prueba gratis de NEVORA por 30 días para equipos de hasta 30 empleados, sin tarjeta ni cargos automáticos. Luego, un solo precio por negocio, por cotización.',
    lede: 'Pide una prueba gratis de NEVORA para tu equipo, sin tarjeta ni cargos automáticos. El día 30 decides qué sigue.',
    og: ['velani-social-plans.png', 'Planes de NEVORA: gratis por 30 días y luego un solo precio por negocio'],
  }),
  '/pages/es-contacto': es('/pages/contact', {
    kind: 'contact', nav: 'contact', eyebrow: 'Contacto', title: 'Empieza por el problema.', name: 'Contacto',
    intro: 'Cuéntanos qué necesita funcionar mejor y quién lo usará. Procuramos responderte por correo en un plazo de dos días laborables.',
    og: ['velani-social.png', 'Velani. Escríbenos sobre tu proyecto o sobre NEVORA.'],
  }),
};

/** Words for a link to a page that exists only in English. */
export const IN_ENGLISH = '(en inglés)';

/** The site chrome on Spanish pages: header, Products menu, phone menu, language switch, closing panel. */
export const CHROME_ES = {
  skip: 'Saltar al contenido', home: 'Inicio de Velani', main: 'Principal', mainMenu: 'Menú principal', menu: 'Menú',
  products: 'Productos', productsMenu: 'Menú de productos',
  productsList: [
    ['NEVORA Workforce', '/pages/nevora', 'Horarios, registro de tiempo y cálculo de nómina'],
    ['Rondo<span class="nav-soon">En desarrollo</span>', '/pages/nevora#rondo', 'El asistente de IA que llega a NEVORA'],
    ['NEVORA Relay<span class="nav-soon">Próximamente</span>', '/pages/products#relay', 'Pedidos, pantalla de cocina e inventario'],
  ],
  nav: [['Sitios web', '/pages/custom-development#web-applications', 'websites'], ['Apps a la medida', '/pages/custom-development', 'services'], ['Planes', '/pages/plans', 'plans'], ['Soporte', '/pages/help', 'help'], ['Nosotros', '/pages/about', 'about']],
  rondoSoon: 'En desarrollo', relaySoon: 'Pronto', contact: 'Contacto',
  trial: 'Prueba gratis', trialLong: 'Pide la prueba gratis de NEVORA', project: 'Empieza un proyecto',
  support: 'Soporte al cliente', hours: HOURS_ES, brandOf: 'Velani es una marca de ',
  langGroup: 'Idioma',
  // Closing panel on company pages
  closingLine: 'Productos de software y desarrollo a la medida, desde San Juan.',
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
export const CONTACT_ES = {
  kicker: ['NEVORA para tu equipo', 'Prueba gratis de NEVORA por 30 días', 'NEVORA Relay'],
  h1: ['Pide una cotización de NEVORA.', 'Pide tu prueba gratis de NEVORA.', 'Únete a la lista de espera de NEVORA Relay.'],
  fact: ['Sitios web, apps a la medida, NEVORA u otra cosa.', 'Un solo precio por negocio, cotizado según tu número de empleados, tu negocio y las funciones que uses. Sin compromiso.', 'Hasta 30 empleados&nbsp;· 30 días&nbsp;· Sin tarjeta&nbsp;· Sin&nbsp;cargos&nbsp;automáticos', 'En diseño&nbsp;· Aún sin fechas. Te escribiremos cuando abra el acceso anticipado.'],
  previewNote: 'Vista previa del sitio web&nbsp;· revisa tu borrador, no envía nada',
  noscript: 'El formulario de vista previa necesita JavaScript. Desde esta vista previa no se envían mensajes.',
  legend: 'Consulta',
  name: 'Nombre', email: 'Correo electrónico', company: 'Empresa', optional: 'opcional',
  topic: 'Tema', topics: [['website', 'Sitio web'], ['custom-software', 'App a la medida'], ['nevora', 'Cotización de NEVORA'], ['nevora-demo', 'Prueba gratis de NEVORA'], ['relay', 'Lista de espera de NEVORA Relay'], ['other', 'Otra cosa']],
  team: 'Tamaño del equipo', bigTeam: 'Más de 30 (por cotización)', locations: 'Número de ubicaciones',
  message: 'Qué necesita funcionar mejor', messageOptional: 'Algo más',
  send: ['Enviar consulta', 'Pedir una cotización', 'Enviar solicitud de prueba'], check: 'Revisar el borrador',
  sendNote: 'Procuramos responderte por correo en un plazo de dos días laborables.', privacy: 'Aviso de privacidad ' + IN_ENGLISH,
  fine: 'El día 30 continúas por cotización o cierras el espacio de trabajo. Primero, exporta tus datos: un espacio de trabajo cerrado y sus datos se eliminan en un plazo de 3&nbsp;días, incluidas las tarjetas de tiempo y los comprobantes de nómina. Para cerrarlo, escribe a support@thevelani.com. NEVORA calcula los comprobantes de nómina; no les paga a los empleados ni presenta impuestos de nómina.',
  sentPreview: 'Vista previa del sitio web&nbsp;· esto es lo que ven los visitantes después de enviar. No se envió nada.',
  sentH: 'Mensaje enviado.', sentP: 'Gracias por escribirnos. Procuramos responderte por correo en un plazo de dos días laborables.',
  sentFrom: ['Las respuestas llegan desde ', '. Si no ves nuestra respuesta en tu bandeja de entrada, revisa la carpeta de spam o de correo no deseado.'], back: 'Volver al inicio',
  writeTitle: 'Escríbenos', writeText: 'Qué necesita funcionar mejor, quién lo usará y cómo funciona hoy. Te respondemos desde ', writeButton: 'Escribe a ', noSensitive: 'No envíes contraseñas, datos de pago ni registros confidenciales por correo.',
};

/** The plans page below its hero. */
export const PLANS_ES = {
  trial: 'Pide la prueba gratis', quote: 'Pide una cotización',
  facts: [['Prueba gratis', '30 días', 'Desde el día en que configuramos tu espacio de trabajo'], ['Tamaño del equipo', 'Hasta 30 empleados', 'Equipos más grandes, por cotización'], ['Tarjeta', 'Ninguna', 'Sin cargos automáticos el día 30'], ['Después de la prueba', 'Un solo precio por&nbsp;negocio', 'Cotizado según tu número de empleados, tu negocio y las funciones que uses']],
  includedKick: 'Incluido', includedTitle: 'Todo lo de la prueba sigue en el plan.',
  included: ['Horarios y cambios de turno', 'Registro de tiempo en una tableta compartida, con PIN', 'Solicitudes y aprobaciones de tiempo libre', 'Tarjetas de tiempo listas para revisar', 'Nómina calculada a partir de las horas aprobadas', 'Comprobantes de nómina para cada empleado', 'Roles para dueños, gerentes y empleados', 'Inglés y español para todos'],
  fine: 'NEVORA calcula los comprobantes de nómina; no les paga a los empleados ni presenta impuestos de nómina.',
  dayKick: 'Día 30', dayTitle: 'Dos formas de terminar la prueba.',
  day: [['Continúa por cotización', 'Le ponemos precio a NEVORA para tu negocio y tu equipo sigue trabajando sin interrupciones.'], ['Cierra el espacio de trabajo', 'Primero, exporta tus horarios, tarjetas de tiempo y comprobantes de nómina. Para cerrarlo, escribe a support@thevelani.com. Luego eliminamos el espacio de trabajo y sus datos en un plazo de 3 días.']],
  noCard: 'No se requiere tarjeta · Sin cargos automáticos',
  customKick: 'Sitios web y apps a la medida', customTitle: 'Cotizados por proyecto.',
  customText: 'Una propuesta por escrito después de una primera conversación: qué creamos, cuánto cuesta y los hitos. El trabajo pagado empieza solo cuando estés de acuerdo.',
  project: 'Empieza un proyecto',
};
