// A scripted stand-in for the model. Returns the same Answer shape the real engine validates,
// keyed on words in the visitor's message so every widget state can be exercised without paid calls.
export function stubEngine({ ModelError }) {
  const pick = (knowledge, locale, stem) => knowledge.find(d => d.id === `${stem}-${locale}`) ?? knowledge.find(d => d.id.startsWith(stem));
  const src = d => d ? [{ id: d.id, title: d.title, url: d.url }] : [];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  return {
    async answer({ message, locale, history, knowledge }) {
      const text = message.toLowerCase(); const es = locale === 'es';
      if (/\bfail\b|\bfalla\b/.test(text)) throw new ModelError('provider_unavailable');
      if (/\btimeout\b/.test(text)) throw new ModelError('provider_timeout');
      if (/\bslow\b|\blento\b/.test(text)) await sleep(3000);
      const base = { confidence: 'grounded', model: 'stub-model' };
      if (/\b(hello|hi|hola|buenas)\b/.test(text)) {
        return { ...base, action: 'none', sources: [], message: es
          ? 'Hola. Puedo explicarte cómo NEVORA organiza horarios, el reloj de entrada y el cálculo de nómina para equipos por turnos. ¿Cuántas personas trabajan por turnos en tu negocio?'
          : 'Hello. I can explain how NEVORA handles scheduling, the time clock and payroll calculation for shift teams. How many people work shifts in your business?' };
      }
      if (/\b(demo|try|prueba|probar|reloj)\b/.test(text)) {
        return { ...base, action: 'show_demo', sources: src(pick(knowledge, locale, 'nevora-time-clock')), message: es
          ? 'El reloj de entrada es una tableta compartida en el lugar de trabajo. Cada persona escribe su PIN de cuatro dígitos y la pantalla se borra sola antes de la siguiente persona. Puedes probar una copia de ese reloj en el sitio; es una demostración con datos ficticios.'
          : 'The time clock is a shared tablet at the workplace. Each person types a four-digit PIN, and the screen clears itself before the next person. You can try a working copy of that screen on this site; it is a demonstration with fictional data.' };
      }
      if (/\b(quote|price|pricing|cost|cotiz|precio|costo)/.test(text)) {
        return { ...base, confidence: 'needs_human', action: 'lead_form', sources: src(pick(knowledge, locale, 'nevora-availability')), message: es
          ? 'NEVORA está en desarrollo y se ofrece a las empresas mediante cotización; no hay una lista de precios publicada. Si me cuentas cuántas personas trabajan por turnos y en cuántos lugares, puedo orientarte, y el formulario de contacto es la vía para pedir una cotización.'
          : 'NEVORA is in development and offered to businesses by quote; there is no published price list. If you tell me how many people work shifts and across how many locations I can advise further, and the contact form is the route to ask for a quote.' };
      }
      if (/\b(sign in|password|account|login|contraseña|cuenta|iniciar sesión)\b/.test(text)) {
        return { ...base, confidence: 'needs_human', action: 'human_help', sources: src(pick(knowledge, locale, 'nevora-support')), message: es
          ? 'No puedo ver cuentas de empleados ni restablecer contraseñas. Tu cuenta la gestiona tu empleador, así que empieza por tu supervisor; la página de soporte de NEVORA explica los pasos para iniciar sesión.'
          : 'I cannot see employee accounts or reset passwords. Your account is managed by your employer, so start with your manager; the NEVORA support page explains the sign-in steps.' };
      }
      if (/\blong\b|\blargo\b/.test(text)) {
        return { ...base, action: 'none', sources: src(pick(knowledge, locale, 'nevora-overview')), message: es
          ? 'Así encaja NEVORA en una semana típica:\n\n1. Los administradores publican el horario desde la web.\n2. Cada persona marca entrada en la tableta compartida con su PIN.\n3. Las horas aprobadas pasan al cálculo de nómina.\n4. Cada empleado ve su comprobante de pago en el teléfono.\n\nTu negocio sigue pagando a su equipo y presentando los impuestos de nómina como hasta ahora. ¿Quieres que repasemos alguno de estos pasos?'
          : 'Here is how NEVORA fits a typical week:\n\n1. Managers publish the schedule on the web.\n2. Each person clocks in at the shared tablet with a PIN.\n3. Approved hours flow into the payroll calculation.\n4. Each employee sees their pay statement on their phone.\n\nYour business still pays its team and files payroll taxes as it does today. Would you like to go through any of these steps in more detail?' };
      }
      const turn = Math.floor(history.length / 2) + 1;
      return { ...base, action: 'none', sources: src(pick(knowledge, locale, 'nevora-overview')), message: es
        ? `Entendido (mensaje ${turn}). NEVORA conecta el horario publicado, el registro de tiempo, las horas aprobadas y el cálculo de nómina en un solo flujo. Para darte una recomendación concreta, ¿en cuántos lugares trabaja tu equipo?`
        : `Understood (message ${turn}). NEVORA connects the posted schedule, time tracking, approved hours and payroll calculation in one flow. To give you a concrete recommendation, how many locations does your team work across?` };
    },
  };
}
