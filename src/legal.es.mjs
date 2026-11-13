import { POLICY_DOCS_ES } from './nevora-policies.es.mjs';

const privacySections = [
  ['Quién opera este sitio', 'Velani es operada por VELANI LLC. Escribe a support@thevelani.com sobre privacidad o por correo postal a VELANI LLC, 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.'],
  ['Qué recopila este sitio', 'Al enviar una consulta, recibimos el nombre, correo, empresa, tema y mensaje que escribes. Este sitio no te pide crear una cuenta ni guarda tu nombre, correo o mensaje en el almacenamiento del navegador. No incluyas credenciales, datos de pago ni registros sensibles.'],
  ['Información de la plataforma', 'El sitio está alojado en Shopify. Shopify y sus proveedores pueden procesar información del dispositivo, la conexión, la seguridad y el almacenamiento para operar el sitio. Shopify también recopila visitas y vistas de página para análisis. Mailchimp, la herramienta de correo de la lista de Velani, puede recibir información de visitas para análisis y mercadeo. Puedes desactivar los análisis y el mercadeo opcionales en las opciones de cookies.'],
  ['Si nos contactas', 'Una consulta mediante el formulario o un correo que nos envías contiene tu dirección, mensaje y lo que incluyas. Lo usamos para atender la conversación que solicitaste. Una consulta no es consentimiento para suscribirte a mercadeo.'],
  ['Solicitudes de clientes', 'Las solicitudes de trabajo nuevo o de ayuda con un sitio o app que construimos, enviadas desde Soporte, llegan al servicio de solicitudes de Velani y no al formulario de contacto. El servicio está alojado en Estados Unidos: Vercel para el servicio y Neon para la base de datos. Guarda tu nombre, correo, negocio, sitio o app, mensaje y el plazo o urgencia que elegiste. Resend, el proveedor de correo, envía la solicitud a support@thevelani.com y una confirmación a ti. Cloudflare Turnstile verifica el navegador antes del envío. Los registros de solicitudes y su cola de correo se conservan hasta 90 días. Los registros del proveedor de correo tienen su propio plazo de 30 días; las copias en buzones y copias de seguridad se conservan por separado y pueden durar más. No se crea una cuenta ni te suscribes a mercadeo.'],
  ['Rondo, el asesor de este sitio', 'Cuando está habilitado, Rondo responde preguntas sobre NEVORA y los servicios de Velani. Este asesor público es distinto de las demostraciones del asistente del dueño dentro de NEVORA; esas funciones dependen de la disponibilidad y los permisos del lugar de trabajo. El servicio de Rondo está en Vercel y su base de datos en Neon, en Estados Unidos. Conservamos los mensajes y respuestas de la conversación hasta 30 días. Un modelo recibe tus mensajes mediante nuestra pasarela de IA y genera la respuesta. Databricks puede conservar entradas y respuestas hasta 30 días para detectar abusos; también pueden aplicarse los plazos de seguridad de los proveedores de modelos. Cloudflare Turnstile verifica el navegador antes de comenzar. Las respuestas pueden ser incorrectas y los detalles del producto pueden cambiar. No envíes contraseñas, datos de pago ni registros de empleados. Puedes eliminar la conversación del asistente; eso no elimina inmediatamente todas las copias de proveedores, registros, copias de seguridad o buzones. El historial de recuperación de la base de datos de Rondo es de un día y es distinto del de la fuerza laboral de NEVORA. El formulario de contacto se procesa por separado.'],
  ['Destinatarios y conservación', 'Las consultas llegan al buzón support@thevelani.com, donde VELANI LLC las lee. Conservamos una consulta mientras sea necesaria para la conversación y el proyecto que resulte, o por más tiempo si la ley lo exige. Los registros de solicitudes, la cola de correo, los registros de proveedores, las copias en buzones y las copias de seguridad son categorías distintas. La eliminación de una conversación o cuenta no garantiza su eliminación simultánea en todas ellas. La app de NEVORA tiene sus propias reglas, explicadas en su Política de privacidad.'],
  ['Opciones y solicitudes de privacidad', 'Abre las opciones de cookies para revisar las opciones del sitio. Escribe a support@thevelani.com para preguntar qué información tenemos, corregirla o solicitar su eliminación. La ley aplicable determina tus derechos. Antes de actuar, podemos pedirte que confirmes tu identidad de una manera adecuada para la solicitud.'],
  ['Datos de productos y clientes', 'Este aviso corresponde al sitio de la empresa. Los registros laborales de NEVORA se rigen por la Política de privacidad de NEVORA. El procesamiento para clientes y las responsabilidades de las partes deben quedar cubiertos por los acuerdos del proyecto y de procesamiento de datos correspondientes.'],
  ['Cambios a este aviso', 'Al modificar este aviso, actualizamos la fecha al principio de la página. Este aviso no certifica el cumplimiento de ninguna norma.'],
].map(([heading, text]) => ({ heading, text }));

export const LEGAL_ES_PATHS = Object.freeze({
  '/pages/privacy': '/pages/es-privacy',
  '/pages/nevora-privacy': '/pages/es-nevora-privacy',
  '/pages/nevora-terms': '/pages/es-nevora-terms',
  '/pages/nevora-support': '/pages/es-nevora-support',
  '/pages/nevora-account-deletion': '/pages/es-nevora-account-deletion',
});

const names = {
  privacy: 'Política de privacidad de NEVORA',
  terms: 'Términos de uso de NEVORA',
  support: 'Soporte de NEVORA',
  'account-deletion': 'Eliminar tu cuenta de NEVORA',
};
export const LEGAL_ES_ROUTES = {
  '/pages/es-privacy': {
    lang: 'es', en: '/pages/privacy', legal: true, updated: '12 de noviembre de 2026',
    title: 'Tu privacidad, en palabras claras.', name: 'Aviso de privacidad del sitio', eyebrow: 'Aviso de privacidad',
    intro: 'Cómo se maneja la información de este sitio, las solicitudes de clientes y las conversaciones con Rondo.',
    sections: privacySections,
  },
  ...Object.fromEntries(POLICY_DOCS_ES.map(doc => {
    const en = '/pages/nevora-' + doc.slug;
    return [LEGAL_ES_PATHS[en], {
      lang: 'es', en, kind: 'policy', slug: doc.slug, sections: [],
      title: names[doc.slug], name: names[doc.slug], eyebrow: 'NEVORA', intro: doc.summary,
      ...(doc.slug === 'support' ? { nav: 'nevora-help' } : {}),
    }];
  })),
};
