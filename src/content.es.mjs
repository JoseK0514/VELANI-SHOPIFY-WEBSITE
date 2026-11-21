// Spanish (es) routes and the Spanish words of the shared pieces (contact form, client requests, cookie choices).
// Neutral Latin American Spanish for Puerto Rico business owners, "tú" form, NEVORA app terms (docs/i18n/es-glossary.md).
// Spanish Day page bodies are their English body plus src/day/es/<page>.json; the browser scripts keep their own EN/ES
// tables (public/assets/velani.js, src/shared/assist.js, src/day/*.js).
// Facts must match the English pages exactly: no added claims.
import { LEGAL_ES_PATHS, LEGAL_ES_ROUTES } from './legal.es.mjs';

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
  '/pages/sign-in': '/pages/es-entrar',
  '/pages/nevora-start': '/pages/es-prueba',
  '/pages/nevora-billing': '/pages/es-facturacion',
  '/pages/nevora-verify': '/pages/es-configurar',
  '/pages/nevora-billing-return': '/pages/es-pago',
  '/pages/rondo': '/pages/es-rondo',
  '/pages/relay': '/pages/es-relay',
});

/** English-only pages whose closest Spanish page is not the Spanish home: the ES switch goes there instead. */
export const ES_NEAREST = Object.freeze({
  '/pages/legal': '/pages/es-ayuda', '/pages/cookies': '/pages/es-ayuda', '/pages/website-terms': '/pages/es-ayuda',
  '/pages/accessibility': '/pages/es-ayuda', '/pages/security': '/pages/es-ayuda',
});

/** Spanish routes: same kinds (and so the same components, images and order) as their English pages. */
const es = (en, fields) => ({ lang: 'es', en, sections: [], ...fields });
export const ES_ROUTES = {
  ...LEGAL_ES_ROUTES,
  '/pages/es': es('/', {
    kind: 'home', day: 'home', title: 'De abrir a cerrar.', eyebrow: 'Velani',
    name: 'Velani · Horarios, registro de tiempo y nómina para pequeños negocios',
    intro: 'NEVORA planifica la semana, registra cada hora y calcula la paga. Rondo le dice al dueño qué necesita hoy. Gratis por 30 días, sin tarjeta.',
    og: ['velani-social-es.png', 'Velani: NEVORA en una MacBook y un iPhone. De abrir a cerrar.'],
  }),
  '/pages/es-rondo': es('/pages/rondo', {
    nav: 'rondo', day: 'rondo', eyebrow: 'Rondo', title: 'Rondo.', og: ['velani-social-rondo-es.png', 'Rondo en un iPhone: responde quién puede cubrir el domingo y prepara un cambio para que el dueño lo apruebe'], name: 'Rondo · El asistente del dueño en NEVORA',
    intro: 'Rondo es el asistente del dueño dentro de NEVORA: pregunta como hablas, en español o en inglés, y aprueba cada cambio que prepara. Incluido en NEVORA.',
  }),
  '/pages/es-relay': es('/pages/relay', {
    nav: 'relay', day: 'relay', eyebrow: 'Relay', title: 'Relay.', og: ['velani-social-relay-es.png', 'Concepto de Relay: una pantalla de cocina con órdenes, temporizadores y una lista de lo que se está acabando. En diseño'], name: 'Relay · Pedidos, pantalla de cocina e inventario, en diseño',
    intro: 'NEVORA Relay está en diseño: pedidos, pantalla de cocina e inventario en un solo sistema. Aún sin fecha ni precio; únete a la lista de espera.',
  }),
  '/pages/es-nevora': es('/pages/nevora', {
    kind: 'nevora', day: 'nevora', nav: 'nevora', eyebrow: 'NEVORA',
    title: 'NEVORA · Horarios, registro de tiempo y cálculo de nómina para equipos por turnos',
    name: 'NEVORA · Horarios, registro de tiempo y nómina',
    intro: 'Horarios, registro de tiempo y cálculo de nómina para equipos por turnos: planifica en la web, consulta turnos en el teléfono y marca entrada con un PIN.',
    og: ['velani-social-nevora-es.png', 'NEVORA en una MacBook y un iPhone: toda la semana, del horario a la paga'],
  }),
  '/pages/es-productos': es('/pages/products', {
    kind: 'products', nav: 'products', day: 'products', eyebrow: 'Velani', title: 'Lo que hacemos.', name: 'Productos',
    intro: 'NEVORA para horarios, registro de tiempo y cálculo de nómina, gratis por 30 días; Rondo, el asistente del dueño; y Relay, en diseño.',
    og: ['velani-social-es.png', 'Velani. NEVORA, Rondo y Relay: software para negocios que trabajan por turnos.'],
  }),
  '/pages/es-planes': es('/pages/plans', {
    kind: 'plans', day: 'plans', nav: 'plans', eyebrow: 'Planes', name: 'Planes',
    title: 'Prueba NEVORA gratis por 30 días.',
    intro: 'Prueba NEVORA gratis por 30 días, sin tarjeta. Luego $19 al mes para hasta 15 empleados o $29 al mes para 16 a 30, por negocio.',
    lede: 'Pide tu prueba gratis de NEVORA, sin tarjeta. Luego un precio mensual por negocio.',
    og: ['velani-social-plans-es.png', 'Planes de NEVORA: gratis por 30 días y luego un precio mensual por negocio'],
  }),
  '/pages/es-contacto': es('/pages/contact', {
    kind: 'contact', day: 'contact', nav: 'contact', eyebrow: 'Contacto', title: 'Cuéntanos qué necesitas.', name: 'Contacto',
    intro: 'Pide una prueba gratis de NEVORA, configuración asistida para más de 30 empleados, la lista de Relay o lo que necesites. Respondemos en dos días laborables.',
    og: ['velani-social-es.png', 'Velani. Escríbenos sobre NEVORA, Rondo o Relay.'],
  }),
};

ES_ROUTES['/pages/es-nosotros'] = es('/pages/about', {
  nav: 'about', day: 'about', eyebrow: 'Sobre Velani', name: 'Nosotros',
  title: 'Software para pequeños negocios.',
  intro: 'Velani empezó en 2026. Hacemos NEVORA, Rondo y Relay para equipos que trabajan por turnos, en español y en inglés.',
  desc: 'Velani, de VELANI LLC, hace NEVORA para horarios, registro de tiempo y cálculo de nómina; Rondo, el asistente del dueño en NEVORA; y Relay, en diseño.',
});
ES_ROUTES['/pages/es-ayuda'] = es('/pages/help', {
  kind: 'faq', nav: 'help', day: 'help', eyebrow: 'Soporte', name: 'Ayuda',
  desc: 'Respuestas sobre NEVORA para tu equipo y para dueños: entrar, el PIN, turnos y paga, tu cuenta, la prueba y los planes. Una persona responde en dos días.',
  title: '¿Cómo te ayudamos?',
  intro: 'Respuestas sobre NEVORA para tu equipo y para dueños. Una persona responde en dos días laborables.',
});

ES_ROUTES['/pages/es-prueba'] = es('/pages/nevora-start', {
  kind: 'commerce', step: 'start', nav: 'plans', day: 'account', eyebrow: '', name: 'Pide una prueba de NEVORA', noindex: true,
  title: 'Tu prueba gratis.',
  intro: 'La app completa para tu equipo, gratis por 30 días. Sin tarjeta.',
  desc: 'Pide una prueba gratis de NEVORA por 30 días para tu negocio. Sin tarjeta.',
});
ES_ROUTES['/pages/es-facturacion'] = es('/pages/nevora-billing', {
  kind: 'commerce', step: 'billing', nav: 'plans', day: 'account', eyebrow: '', name: 'Facturación de NEVORA', noindex: true,
  title: 'Plan y facturación.',
  intro: 'El dueño del negocio abre la facturación desde NEVORA, en Configuración.',
});
ES_ROUTES['/pages/es-configurar'] = es('/pages/nevora-verify', {
  kind: 'commerce', step: 'verify', nav: 'plans', day: 'account', eyebrow: '', name: 'Configura tu lugar de trabajo de NEVORA', noindex: true,
  title: 'Configura tu lugar de trabajo.',
  intro: 'La configuración del lugar de trabajo ocurre en NEVORA. El botón de tu correo de verificación la abre.',
});
ES_ROUTES['/pages/es-pago'] = es('/pages/nevora-billing-return', {
  kind: 'commerce', step: 'return', nav: 'plans', day: 'account', eyebrow: '', name: 'Facturación de NEVORA',
  title: 'Plan y facturación.',
  intro: '', noindex: true,
  desc: 'Facturación de un lugar de trabajo de NEVORA. El dueño del negocio abre la facturación desde NEVORA, en Configuración.',
});
ES_ROUTES['/pages/es-entrar'] = es('/pages/sign-in', {
  kind: 'signin', nav: 'signin', day: 'signin', eyebrow: '', name: 'Cómo entrar a NEVORA',
  title: 'Cómo entrar a NEVORA.',
  intro: 'Cómo entrar a NEVORA en la dirección de tu lugar de trabajo, qué hacer si olvidaste tu contraseña y para qué sirve tu PIN.',
  desc: 'Cómo entrar a NEVORA: la dirección de tu lugar de trabajo, tu ID de empleado y tu contraseña, y qué hacer si olvidaste tu contraseña o tu PIN.',
});

/** Words for a link to a page that exists only in English. */
const IN_ENGLISH = '(en inglés)';
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
  clientT: '¿Necesitas algo en tu sitio o tu app?', clientText: 'Pídenos una página nueva, una función o un cambio, o cuéntanos qué dejó de funcionar. Respondemos por correo en un plazo de dos días laborables.',
  need: 'Tipo de solicitud', kinds: [['Trabajo nuevo', 'Una página nueva, una función o un cambio.'], ['Ayuda', 'Algo de tu sitio o tu app dejó de funcionar.']],
  business: 'Negocio', message: ['¿Qué necesitas?', '¿Qué pasó?'],
  timing: ['Plazo', [['No rush', 'Sin prisa'], ['This month', 'Este mes'], ['This week', 'Esta semana']]],
  urgency: ['Urgencia', [['It can wait', 'Puede esperar'], ["It's slowing us down", 'Nos está atrasando'], ["We can't work", 'No podemos trabajar']]],
  send: ['Enviar solicitud', 'Enviar a soporte'], note: 'No envíes contraseñas ni datos de pago.',
  preview: 'Vista previa. Este formulario revisa tu borrador y no envía nada.',
  project: 'Sitio web o app', refK: 'Tu referencia', refCopy: 'Copiar referencia',
  hubNote: 'Usamos estos datos solo para responder tu solicitud. Los registros de solicitudes se guardan hasta 90 días; las copias por correo pueden durar más. No se crea ninguna cuenta.',
  hubOff: 'Ahora mismo no se pueden enviar solicitudes desde esta página. No se envió nada de lo que escribiste. Escríbenos a:',
  hubTest: 'Copia de prueba de aceptación. Las solicitudes enviadas desde esta página son reales y llegan al soporte de Velani.',
  hubNoscript: 'Este formulario necesita JavaScript. También puedes escribir a ',
};
export const CONTACT_ES = {
  topicQ: '¿Sobre qué es?', preview: 'Vista previa. Este formulario revisa tu borrador y no envía nada.',
  noscript: 'El formulario de vista previa necesita JavaScript. Desde esta vista previa no se envían mensajes.',
  legend: 'Consulta',
  name: 'Nombre', email: 'Correo electrónico', company: 'Empresa', optional: 'opcional',
  team: 'Tamaño del equipo', bigTeam: 'Más de 30 (configuración asistida)', locations: 'Número de ubicaciones',
  message: 'Qué necesita funcionar mejor', messageOptional: 'Algo más',
  send: ['Enviar consulta', 'Pedir configuración asistida', 'Enviar solicitud de prueba', 'Unirme a la lista'], sendNote: 'No envíes contraseñas ni datos de pago.', privacy: 'Aviso de privacidad',
  fine: 'El día 30, el dueño elige un plan en NEVORA. No se cobra nada hasta entonces. NEVORA calcula los comprobantes de nómina; no les paga a los empleados ni presenta impuestos de nómina.',
  sentPreview: 'Vista previa del sitio web&nbsp;· esto es lo que ven los visitantes después de enviar. No se envió nada.',
  sentH: 'Mensaje enviado.', sentP: 'Gracias por escribirnos. Te respondemos por correo en un plazo de dos días laborables.',
  sentFrom: ['Las respuestas llegan desde ', '. Si no ves nuestra respuesta en tu bandeja de entrada, revisa la carpeta de spam o de correo no deseado.'], back: 'Volver al inicio', sentNext: 'Mira cómo funciona NEVORA',
  writeTitle: 'Escríbenos', writeText: 'Qué necesita funcionar mejor, quién lo usará y cómo funciona hoy. Te respondemos desde ', writeButton: 'Escribe a ', noSensitive: 'No envíes contraseñas, datos de pago ni registros confidenciales por correo.',
};
