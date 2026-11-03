const $ = (id) => document.getElementById(id);
const copy = {
  en: {
    skip: "Skip to the guide",
    language: "Language",
    productLink: "Explore the product ↗",
    eyebrow: "YOUR TEAM. YOUR WORKFLOW.",
    headline: "Bring your week\ninto focus.",
    intro:
      "Describe how your team works. Explore where NEVORA could fit, and leave with a practical plan.",
    guideTitle: "A guide built around your business",
    guideDescription:
      "An AI conversation, a clear visual workflow, and next steps you can make your own.",
    noSignup: "No account needed",
    development: "NEVORA is in development",
    guideName: "Your NEVORA guide",
    guideLabel: "Start with the way you work.",
    briefLabel: "Tell us about your team",
    briefPlaceholder:
      "We run three cafés with 42 people. Shift swaps and Friday time approvals are a mess.",
    briefHint:
      "Team size, locations, current tools, and what you want to improve. Keep employee details private.",
    sampleCafe: "3 cafés · 42 people",
    sampleRetail: "2 shops · 18 people",
    sampleGrowing: "A growing team",
    createPlan: "Create my workflow plan",
    creationNote:
      "A practical starting point, based on published product information. No signup or sales form.",
    retry: "Retry the same request",
    dismiss: "Dismiss",
    refreshState: "Load saved version",
    businessDetails: "Your business details",
    profileHint:
      "Review these details before saving. Saved details help the guide remember your business in this session.",
    saveDetails: "Save details",
    askTitle: "Keep the conversation going",
    askHint:
      "Ask about your workflow, explore a limitation, or think through your next step.",
    question: "Your question",
    chatPlaceholder: "What should we improve first?",
    workflowEyebrow: "THE WORKING WEEK",
    workflowTitle: "One connected workflow.",
    illustrative: "Illustrative guide",
    beforePlanTitle: "Make this workflow yours.",
    beforePlanCopy:
      "Describe your team to see relevant suggestions and a plan you can edit, download, and discuss.",
    yourPlan: "YOUR WORKFLOW PLAN",
    nextSteps: "Make the next steps your own",
    editable: "Editable",
    notesLabel: "Your notes",
    notesPlaceholder: "What would you like to add or discuss?",
    savePlan: "Save changes",
    assumptionsTitle: "Assumptions to review",
    questionsTitle: "Questions to resolve",
    sources: "Product sources",
    planDisclaimer:
      "This is guidance, not a quote or implementation commitment. NEVORA is in development and offered by quote. Payroll calculations do not include paying employees or filing payroll taxes.",
    download: "Download plan",
    print: "Print / save PDF",
    share: "Discuss with Velani",
    downloadNote:
      "Your download is yours to keep. Sharing with Velani is a separate choice.",
    beyondTitle: "Built for the people behind every shift.",
    beyondCopy:
      "Explore the product, bring us a specific question, or keep your plan and take the next step when you are ready.",
    exploreNevora: "Explore NEVORA",
    privacy:
      "AI guide. Chats and plans are retained for up to 30 days; submitted enquiries for up to 90 days. Reloading starts a new session. Do not enter employee records or credentials.",
    privacyLink: "Privacy",
    deleteWorkspace: "Delete this workspace",
    talkToUs: "LET’S TALK",
    shareTitle: "Start with your plan.",
    shareIntro: "Review what you are sharing, then tell us how to reach you.",
    name: "Name",
    email: "Email",
    company: "Company (optional)",
    leadMessage: "Anything else you would like us to know?",
    sharePlanConsent:
      "Share the saved plan and its business details with Velani as part of this enquiry.",
    leadConsent:
      "I agree that Velani may store these details and contact me about this enquiry. This does not subscribe me to marketing.",
    leadRetention:
      "Submitted enquiries and their shared plan are retained for up to 90 days.",
    sendEnquiry: "Send enquiry",
    sendQuestion: "Send question",
    close: "Close",
    conversation: "Conversation",
    stages: "Workflow stages",
    publishedFact: "Described product workflow",
    suggestion: "A suggestion for your team",
    source: "Product information ↗",
    previewCaption: "Product preview · sample workplace · not a live clock",
    previewAlt:
      "NEVORA shared tablet time-clock screen with sample workplace and PIN keypad",
    workflowDiagram: "How the pieces connect",
    planReady: "Your plan is ready. Review the details and make it your own.",
    creating: "Creating your workflow plan…",
    thinking: "Thinking through your question…",
    saving: "Saving your changes…",
    detailsSaved: "Business details saved for this session.",
    updatedPlanBrief:
      "Create an updated workflow plan using my saved business details and constraints.",
    detailsSavedForPlan:
      "Details saved. Your next plan will use the updated business profile.",
    changesSaved: "Plan changes saved.",
    pendingChanges: "Unsaved changes",
    saved: "Saved",
    suggested: "Suggested · review before saving",
    confirmed: "Saved for this session",
    draft: "Generated draft",
    edited: "Edited plan",
    owner: "Who owns this?",
    timing: "When?",
    actionDetails: "What needs to happen?",
    actionTitle: "Step title",
    businessType: "Business type",
    teamSize: "Team size",
    locations: "Locations",
    currentTools: "Current tools",
    challenge: "Main challenge",
    constraints: "Constraints",
    approvalCadence: "Approval timing",
    you: "You",
    assistant: "NEVORA guide",
    noItems: "No additional items identified. Review this with your team.",
    enquirySaved:
      "Your enquiry and plan have been saved. No meeting has been booked.",
    sharing: "Saving your enquiry…",
    deleted:
      "Workspace deleted. Previously submitted enquiries are retained separately.",
    deleting: "Deleting this workspace…",
    downloaded: "Plan downloaded. Your notes and current edits are included.",
    confirmShare: "Saved plan version",
    waiting: "Wait before retrying.",
    networkError:
      "The connection was interrupted. Retry the same request to avoid creating a duplicate.",
    unavailable:
      "The guide could not complete this request. You can retry or contact Velani.",
    invalid: "Check your information and try again.",
    expired: "This session has expired. Create a new plan to continue.",
    captcha: "Complete the verification below, then retry.",
    configuration:
      "Verification is not configured for this site. Please contact Velani.",
    forbidden:
      "This request could not be authorized. Please reload or contact Velani.",
    conflict:
      "The saved details or plan changed. Load the saved version before editing again. This replaces your unsaved edits.",
    busyError: "Another request is still being completed. Wait, then retry.",
    rate: "The request limit has been reached. Wait before retrying.",
    noKnowledge:
      "Current product information is unavailable. Please contact Velani to confirm details.",
    loaded: "The saved version has been loaded.",
    shareFailed:
      "The enquiry was not confirmed. See the message in the guide and retry the same request if offered.",
    revision: "Version",
    localEdits: "Includes your current edits",
    sourceNote:
      "Product facts and recommendations are shown separately. Confirm availability and compatibility with Velani.",
    sampleCafeText:
      "We run three cafés with 42 people. Staff arrange shift swaps by group text, and two managers approve paper timesheets every Friday. We want a clearer process without changing everything at once.",
    sampleRetailText:
      "We run two shops with 18 employees and use spreadsheets for shifts. Collecting corrected hours before payroll takes too much time. Help us decide what to improve first.",
    sampleGrowingText:
      "We have a growing team of 12 at one location. The owner manages shifts and approves hours. We want a simple, repeatable weekly process before we add more people.",
    retryHint: "Retry after",
    seconds: "seconds",
    reviewedDetails: "Business details used for this plan",
    support: "Contact support",
    contact: "Contact Velani",
    formOpen: "Use the enquiry form to choose whether to share your plan.",
    planFirst:
      "Create a plan first, then choose whether to share it with Velani.",
    refreshedProfile:
      "Your saved details changed; create a new plan when ready.",
    notSaved: "Not saved yet",
    languageChanged:
      "Interface language changed. Create a new plan to generate its content in English.",
  },
  es: {
    skip: "Ir a la guía",
    language: "Idioma",
    productLink: "Explorar el producto ↗",
    eyebrow: "TU EQUIPO. TU FORMA DE TRABAJAR.",
    headline: "Una semana\nmás clara.",
    intro:
      "Cuéntanos cómo trabaja tu equipo. Explora dónde encaja NEVORA y llévate un plan práctico.",
    guideTitle: "Una guía para tu negocio",
    guideDescription:
      "Una conversación con IA, un flujo visual claro y próximos pasos que puedes adaptar.",
    noSignup: "Sin crear una cuenta",
    development: "NEVORA está en desarrollo",
    guideName: "Tu guía de NEVORA",
    guideLabel: "Empieza por tu forma de trabajar.",
    briefLabel: "Cuéntanos sobre tu equipo",
    briefPlaceholder:
      "Tenemos tres cafeterías y 42 personas. Los cambios de turno y la aprobación de horas de los viernes son complicados.",
    briefHint:
      "Tamaño del equipo, ubicaciones, herramientas actuales y lo que quieres mejorar. No incluyas datos de empleados.",
    sampleCafe: "3 cafeterías · 42 personas",
    sampleRetail: "2 tiendas · 18 personas",
    sampleGrowing: "Un equipo en crecimiento",
    createPlan: "Crear mi plan de trabajo",
    creationNote:
      "Un punto de partida práctico, basado en información publicada del producto. Sin registro ni formulario comercial.",
    retry: "Reintentar la misma solicitud",
    dismiss: "Cerrar aviso",
    refreshState: "Cargar la versión guardada",
    businessDetails: "Los datos de tu negocio",
    profileHint:
      "Revisa estos datos antes de guardarlos. La guía los recordará durante esta sesión.",
    saveDetails: "Guardar datos",
    askTitle: "Sigamos conversando",
    askHint:
      "Pregunta sobre tu proceso, aclara un límite o piensa en el siguiente paso.",
    question: "Tu pregunta",
    chatPlaceholder: "¿Qué deberíamos mejorar primero?",
    workflowEyebrow: "LA SEMANA DE TRABAJO",
    workflowTitle: "Un flujo conectado.",
    illustrative: "Guía ilustrativa",
    beforePlanTitle: "Adapta este flujo a tu equipo.",
    beforePlanCopy:
      "Describe tu equipo para recibir sugerencias y un plan que puedes editar, descargar y conversar.",
    yourPlan: "TU PLAN DE TRABAJO",
    nextSteps: "Adapta los próximos pasos",
    editable: "Editable",
    notesLabel: "Tus notas",
    notesPlaceholder: "¿Qué te gustaría añadir o conversar?",
    savePlan: "Guardar cambios",
    assumptionsTitle: "Supuestos por revisar",
    questionsTitle: "Preguntas por resolver",
    sources: "Fuentes del producto",
    planDisclaimer:
      "Esto es orientación, no una cotización ni un compromiso de implementación. NEVORA está en desarrollo y se ofrece por cotización. El cálculo de nómina no incluye pagar a empleados ni presentar impuestos de nómina.",
    download: "Descargar plan",
    print: "Imprimir / guardar PDF",
    share: "Conversar con Velani",
    downloadNote:
      "La descarga es tuya. Compartirla con Velani es una decisión aparte.",
    beyondTitle: "Para las personas detrás de cada turno.",
    beyondCopy:
      "Explora el producto, trae una pregunta concreta o guarda tu plan y avanza cuando estés listo.",
    exploreNevora: "Explorar NEVORA",
    privacy:
      "Guía con IA. Chats y planes se conservan hasta 30 días; consultas enviadas, hasta 90 días. Recargar inicia una sesión nueva. No introduzcas expedientes ni credenciales de empleados.",
    privacyLink: "Privacidad",
    deleteWorkspace: "Borrar este espacio",
    talkToUs: "CONVERSEMOS",
    shareTitle: "Empecemos por tu plan.",
    shareIntro: "Revisa lo que vas a compartir y dinos cómo contactarte.",
    name: "Nombre",
    email: "Correo electrónico",
    company: "Empresa (opcional)",
    leadMessage: "¿Hay algo más que quieras contarnos?",
    sharePlanConsent:
      "Compartir el plan guardado y los datos del negocio con Velani como parte de esta consulta.",
    leadConsent:
      "Acepto que Velani guarde estos datos y me contacte sobre esta consulta. Esto no me suscribe a publicidad.",
    leadRetention:
      "Las consultas enviadas y su plan compartido se conservan hasta 90 días.",
    sendEnquiry: "Enviar consulta",
    sendQuestion: "Enviar pregunta",
    close: "Cerrar",
    conversation: "Conversación",
    stages: "Etapas del flujo",
    publishedFact: "Flujo descrito del producto",
    suggestion: "Una sugerencia para tu equipo",
    source: "Información del producto ↗",
    previewCaption: "Vista previa · negocio de ejemplo · no es un reloj activo",
    previewAlt:
      "Pantalla del reloj compartido de NEVORA con negocio de ejemplo y teclado de PIN",
    workflowDiagram: "Cómo se conectan los pasos",
    planReady: "Tu plan está listo. Revisa los datos y adáptalo.",
    creating: "Creando tu plan de trabajo…",
    thinking: "Analizando tu pregunta…",
    saving: "Guardando los cambios…",
    detailsSaved: "Datos del negocio guardados para esta sesión.",
    updatedPlanBrief:
      "Crea un plan actualizado con los datos y las restricciones guardados de mi negocio.",
    detailsSavedForPlan:
      "Datos guardados. El próximo plan usará el perfil actualizado de tu negocio.",
    changesSaved: "Cambios del plan guardados.",
    pendingChanges: "Cambios sin guardar",
    saved: "Guardado",
    suggested: "Sugeridos · revisa antes de guardar",
    confirmed: "Guardados para esta sesión",
    draft: "Borrador generado",
    edited: "Plan editado",
    owner: "¿Quién se encarga?",
    timing: "¿Cuándo?",
    actionDetails: "¿Qué hay que hacer?",
    actionTitle: "Título del paso",
    businessType: "Tipo de negocio",
    teamSize: "Tamaño del equipo",
    locations: "Ubicaciones",
    currentTools: "Herramientas actuales",
    challenge: "Reto principal",
    constraints: "Restricciones",
    approvalCadence: "Aprobación de horas",
    you: "Tú",
    assistant: "Guía de NEVORA",
    noItems: "No se identificaron más puntos. Revísalo con tu equipo.",
    enquirySaved:
      "Tu consulta y tu plan se han guardado. No se ha reservado ninguna reunión.",
    sharing: "Guardando tu consulta…",
    deleted:
      "Espacio borrado. Las consultas enviadas anteriormente se conservan por separado.",
    deleting: "Borrando este espacio…",
    downloaded: "Plan descargado. Incluye tus notas y cambios actuales.",
    confirmShare: "Versión del plan guardado",
    waiting: "Espera antes de reintentar.",
    networkError:
      "Se interrumpió la conexión. Reintenta la misma solicitud para evitar duplicados.",
    unavailable:
      "La guía no pudo completar esta solicitud. Puedes reintentar o contactar con Velani.",
    invalid: "Revisa los datos e inténtalo de nuevo.",
    expired: "La sesión ha caducado. Crea un plan nuevo para continuar.",
    captcha: "Completa la verificación y vuelve a intentarlo.",
    configuration:
      "La verificación no está configurada para este sitio. Contacta con Velani.",
    forbidden:
      "No se pudo autorizar esta solicitud. Recarga la página o contacta con Velani.",
    conflict:
      "Los datos o el plan guardados han cambiado. Carga la versión guardada antes de editar. Esto reemplaza los cambios sin guardar.",
    busyError:
      "Todavía hay una solicitud en curso. Espera y vuelve a intentarlo.",
    rate: "Se alcanzó el límite de solicitudes. Espera antes de reintentar.",
    noKnowledge:
      "La información actual del producto no está disponible. Contacta con Velani para confirmar los detalles.",
    loaded: "Se ha cargado la versión guardada.",
    shareFailed:
      "No se confirmó la consulta. Revisa el aviso de la guía y reintenta la misma solicitud si se ofrece.",
    revision: "Versión",
    localEdits: "Incluye tus cambios actuales",
    sourceNote:
      "Los datos del producto y las recomendaciones se muestran por separado. Confirma disponibilidad y compatibilidad con Velani.",
    sampleCafeText:
      "Tenemos tres cafeterías y 42 personas. El personal cambia turnos por mensajes de grupo y dos administradores aprueban hojas de horas en papel los viernes. Queremos un proceso más claro sin cambiarlo todo de golpe.",
    sampleRetailText:
      "Tenemos dos tiendas con 18 empleados y usamos hojas de cálculo para los turnos. Recoger las horas corregidas antes de la nómina nos lleva demasiado tiempo. Ayúdanos a elegir qué mejorar primero.",
    sampleGrowingText:
      "Somos un equipo de 12 personas en una ubicación y estamos creciendo. El propietario organiza turnos y aprueba horas. Queremos un proceso semanal sencillo y repetible antes de contratar más personas.",
    retryHint: "Reintenta en",
    seconds: "segundos",
    reviewedDetails: "Datos usados para este plan",
    support: "Contactar con soporte",
    contact: "Contactar con Velani",
    formOpen: "Usa el formulario para decidir si quieres compartir tu plan.",
    planFirst:
      "Primero crea un plan; después podrás decidir si lo compartes con Velani.",
    refreshedProfile:
      "Los datos guardados han cambiado; crea un plan nuevo cuando estés listo.",
    notSaved: "Sin guardar",
    languageChanged:
      "Idioma de la interfaz actualizado. Crea un plan nuevo para generar su contenido en español.",
  },
};
const stageCopy = {
  en: {
    schedule: {
      label: "Plan shifts",
      title: "Give the week a clear shape.",
      fact: "NEVORA’s described scheduling workflow lets managers plan shifts, while employees can view their shifts and respond to swap offers.",
      diagram: [
        "Plan the week",
        "Make shifts visible",
        "Review requested changes",
      ],
    },
    clock: {
      label: "Capture time",
      title: "A shared clock. Individual PINs.",
      fact: "The described time clock runs on a shared tablet, with a separate four-digit PIN for each worker. Its interface supports English and Spanish.",
      diagram: [],
    },
    approve: {
      label: "Approve hours",
      title: "Start with hours you can review.",
      fact: "Managers review and approve hours on the web before those approved hours feed the described payroll-calculation workflow.",
      diagram: [
        "Review recorded hours",
        "Resolve corrections",
        "Approve the hours",
      ],
    },
    payroll: {
      label: "Prepare payroll",
      title: "A clearer handoff to payroll.",
      fact: "NEVORA describes calculating payroll from approved hours and publishing pay statements. Paying employees and filing payroll taxes remain the employer’s responsibility.",
      diagram: [
        "Use approved hours",
        "Review calculations",
        "Publish pay statements",
      ],
    },
  },
  es: {
    schedule: {
      label: "Planificar",
      title: "Dale forma a la semana.",
      fact: "El flujo descrito de NEVORA permite planificar turnos. Los empleados pueden consultarlos y responder a ofertas de intercambio.",
      diagram: [
        "Planificar la semana",
        "Compartir los turnos",
        "Revisar los cambios",
      ],
    },
    clock: {
      label: "Registrar",
      title: "Un reloj compartido. PIN individuales.",
      fact: "El reloj descrito funciona en una tableta compartida, con un PIN de cuatro dígitos para cada persona. Su interfaz admite español e inglés.",
      diagram: [],
    },
    approve: {
      label: "Aprobar",
      title: "Empieza por horas que puedes revisar.",
      fact: "Los administradores revisan y aprueban las horas desde la web, antes de utilizarlas en el flujo descrito de cálculo de nómina.",
      diagram: [
        "Revisar las horas",
        "Resolver correcciones",
        "Aprobar las horas",
      ],
    },
    payroll: {
      label: "Preparar nómina",
      title: "Un paso más claro hacia la nómina.",
      fact: "NEVORA describe el cálculo de nómina a partir de horas aprobadas y la publicación de comprobantes. Pagar a empleados y presentar impuestos sigue siendo responsabilidad del empleador.",
      diagram: [
        "Usar horas aprobadas",
        "Revisar cálculos",
        "Publicar comprobantes",
      ],
    },
  },
};
const fields = {
  businessType: 120,
  teamSize: 60,
  locations: 120,
  currentTools: 300,
  challenge: 1200,
  constraints: 1200,
  approvalCadence: 160,
};
const emptyProfile = () =>
  Object.fromEntries(Object.keys(fields).map((key) => [key, ""]));
const state = {
  locale: "en",
  token: null,
  expiresAt: null,
  profile: emptyProfile(),
  profileDraft: emptyProfile(),
  profileRevision: 0,
  record: null,
  stage: "clock",
  busy: false,
  pending: null,
  retryAt: 0,
  conflict: false,
  dirty: false,
  config: null,
  captchaToken: null,
  captchaWidget: null,
  lastSubmittedBrief: "",
};
const t = (key) => copy[state.locale][key] ?? key;
const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};
function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      ["www.thevelani.com", "thevelani.com"].includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port
      ? url.href
      : null;
  } catch {
    return null;
  }
}
function sourceLink(source) {
  const url = safeUrl(source.url);
  if (!url) return null;
  const a = node("a", "", source.title);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}
function translate() {
  document.documentElement.lang = state.locale;
  document.title =
    state.locale === "es"
      ? "NEVORA para tu negocio — Velani"
      : "NEVORA for your business — Velani";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.placeholder);
  });
  $("chat-send").ariaLabel = t("sendQuestion");
  $("close-share").ariaLabel = t("close");
  $("messages").ariaLabel = t("conversation");
  $("workflow-tabs").ariaLabel = t("stages");
  renderTabs();
  renderStage();
  renderProfile(false);
  if (state.record) {
    renderPlanMeta();
    renderActions(readActions());
  }
  controls();
}
function renderTabs() {
  const container = $("workflow-tabs");
  container.replaceChildren();
  Object.entries(stageCopy[state.locale]).forEach(([key, value], i) => {
    const button = node("button", "stage-tab");
    button.type = "button";
    button.id = `tab-${key}`;
    button.role = "tab";
    button.ariaSelected = String(state.stage === key);
    button.setAttribute("aria-controls", "stage-panel");
    button.tabIndex = state.stage === key ? 0 : -1;
    button.append(
      node("span", "stage-number", String(i + 1).padStart(2, "0")),
      node("span", "stage-label", value.label),
    );
    button.addEventListener("click", () => selectStage(key));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const keys = Object.keys(stageCopy.en);
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? 3
            : (i + (event.key === "ArrowRight" ? 1 : 3)) % 4;
      selectStage(keys[next]);
      $(`tab-${keys[next]}`).focus();
    });
    container.append(button);
  });
}
function selectStage(stage) {
  state.stage = stage;
  renderTabs();
  renderStage();
}
function renderStage() {
  const info = stageCopy[state.locale][state.stage],
    generated = state.record?.plan.workflow.find(
      (step) => step.stage === state.stage,
    );
  const panel = $("stage-panel");
  panel.replaceChildren();
  panel.setAttribute("aria-labelledby", `tab-${state.stage}`);
  const text = node("div", "stage-text");
  text.append(
    node("p", "fact-label", t("publishedFact")),
    node("h3", "", info.title),
    node("p", "stage-lead", generated?.productFact ?? info.fact),
  );
  if (generated) {
    const suggestion = node("div", "stage-suggestion");
    suggestion.append(
      node("strong", "", t("suggestion")),
      node("p", "", generated.recommendation),
    );
    text.append(suggestion);
  }
  const proof = node("div", "stage-proof");
  const sources = generated
    ? state.record.plan.sources.filter((source) =>
        generated.sourceIds.includes(source.id),
      )
    : [{ title: t("source"), url: "https://www.thevelani.com/pages/nevora" }];
  for (const source of sources) {
    const a = sourceLink(source);
    if (a) proof.append(a);
  }
  text.append(proof);
  panel.append(text);
  const visual = node("div", "stage-visual");
  if (state.stage === "clock") {
    const img = node("img");
    img.src = "/assets/nevora-clock.webp";
    img.alt = t("previewAlt");
    img.width = 1024;
    img.height = 768;
    img.loading = "lazy";
    visual.append(img, node("p", "image-caption", t("previewCaption")));
  } else {
    const diagram = node("div", "diagram");
    diagram.append(node("p", "diagram-label", t("workflowDiagram")));
    info.diagram.forEach((item) =>
      diagram.append(node("div", "diagram-step", item)),
    );
    visual.append(diagram);
  }
  panel.append(visual);
}
function renderProfile(replaceValues = true) {
  if (!replaceValues) {
    for (const key of Object.keys(fields)) {
      const input = $(`profile-${key}`);
      if (input) state.profileDraft[key] = input.value;
    }
  }
  const container = $("profile-fields");
  container.replaceChildren();
  for (const [key, max] of Object.entries(fields)) {
    const label = node("label", "", t(key));
    label.htmlFor = `profile-${key}`;
    const input = node(max > 300 ? "textarea" : "input");
    input.id = `profile-${key}`;
    input.name = key;
    input.maxLength = max;
    input.value = state.profileDraft[key];
    if (input.tagName === "TEXTAREA") input.rows = 3;
    input.addEventListener("input", () => {
      state.profileDraft[key] = input.value;
      $("profile-state").textContent = t("suggested");
    });
    container.append(label, input);
  }
  $("profile-state").textContent = t(
    JSON.stringify(state.profileDraft) === JSON.stringify(state.profile) &&
      state.profileRevision > 0
      ? "confirmed"
      : "suggested",
  );
}
function renderPlan(record) {
  state.record = record;
  state.dirty = false;
  $("before-plan").hidden = true;
  $("plan-section").hidden = false;
  $("profile-details").hidden = false;
  state.profileDraft = { ...emptyProfile(), ...record.plan.profile };
  renderProfile();
  renderActions(record.plan.actions);
  $("plan-notes").value = record.notes ?? "";
  renderPlanMeta();
  renderStage();
  controls();
}
function renderPlanMeta() {
  const record = state.record;
  if (!record) return;
  $("plan-title").textContent = record.plan.title;
  $("plan-summary").textContent = record.plan.summary;
  $("plan-state").textContent =
    `${t(record.edited ? "edited" : "draft")} · ${t("revision")} ${record.revision}`;
  $("plan-context").replaceChildren();
  for (const key of ["businessType", "teamSize", "locations"]) {
    if (record.plan.profile[key])
      $("plan-context").append(
        node("span", "context-chip", `${t(key)}: ${record.plan.profile[key]}`),
      );
  }
  for (const [id, items] of [
    ["plan-assumptions", record.plan.assumptions],
    ["plan-questions", record.plan.questions],
  ]) {
    const list = $(id);
    list.replaceChildren();
    (items.length ? items : [t("noItems")]).forEach((item) =>
      list.append(node("li", "", item)),
    );
  }
  const sources = $("plan-sources");
  sources.replaceChildren();
  for (const source of record.plan.sources) {
    const a = sourceLink(source);
    if (a) {
      const li = node("li");
      li.append(a);
      sources.append(li);
    }
  }
  $("save-state").textContent = t(state.dirty ? "pendingChanges" : "saved");
}
function renderActions(actions) {
  const container = $("plan-actions");
  container.replaceChildren();
  actions.forEach((action, index) => {
    const row = node("section", "action-row");
    row.dataset.index = String(index);
    const title = node("div", "action-title-line");
    title.append(
      node("span", "action-order", String(index + 1).padStart(2, "0")),
    );
    const titleInput = node("input");
    titleInput.value = action.title;
    titleInput.maxLength = 120;
    titleInput.required = true;
    titleInput.dataset.field = "title";
    titleInput.ariaLabel = `${t("actionTitle")} ${index + 1}`;
    title.append(titleInput);
    row.append(title);
    const meta = node("div", "action-meta");
    for (const key of ["owner", "timing"]) {
      const wrap = node("div");
      const label = node("label", "", t(key));
      label.htmlFor = `action-${index}-${key}`;
      const input = node("input");
      input.id = label.htmlFor;
      input.value = action[key];
      input.maxLength = 120;
      input.required = true;
      input.dataset.field = key;
      wrap.append(label, input);
      meta.append(wrap);
    }
    row.append(meta);
    const body = node("div", "action-body");
    const label = node("label", "", t("actionDetails"));
    label.htmlFor = `action-${index}-details`;
    const details = node("textarea");
    details.id = label.htmlFor;
    details.value = action.details;
    details.maxLength = 900;
    details.required = true;
    details.rows = 3;
    details.dataset.field = "details";
    body.append(label, details);
    row.append(body);
    row.addEventListener("input", markDirty);
    container.append(row);
  });
}
function readActions() {
  return [...$("plan-actions").querySelectorAll(".action-row")].map((row) =>
    Object.fromEntries(
      ["title", "owner", "timing", "details"].map((key) => [
        key,
        row.querySelector(`[data-field="${key}"]`).value.trim(),
      ]),
    ),
  );
}
function markDirty() {
  state.dirty = true;
  $("save-state").textContent = t("pendingChanges");
  controls();
}
function controls() {
  const pending = Boolean(state.pending);
  document.querySelectorAll("button,input,textarea,select").forEach((el) => {
    if (
      el.hasAttribute("data-entrance-control") ||
      [
        "retry",
        "share-retry",
        "dismiss-error",
        "refresh-state",
        "close-share",
      ].includes(el.id) ||
      el.classList.contains("stage-tab")
    )
      return;
    el.disabled = state.busy || pending;
  });
  for (const id of [
    "generate",
    "chat-send",
    "save-profile",
    "save-plan",
    "share",
    "send-enquiry",
  ])
    $(id).disabled = state.busy || pending;
  $("delete-workspace").disabled = state.busy || !state.token;
  $("save-plan").disabled = state.busy || pending || !state.dirty;
  $("status").dataset.loading = String(state.busy);
  $("retry-controls").hidden = !state.pending && !state.conflict;
  $("share-retry").hidden = state.pending?.label !== "sharing";
  $("share-retry").disabled = state.busy || Date.now() < state.retryAt;
  $("retry").hidden = !state.pending;
  $("retry").disabled = state.busy || Date.now() < state.retryAt;
  $("refresh-state").hidden = !state.conflict;
  $("refresh-state").disabled = state.busy;
  $("dismiss-error").disabled = state.busy;
  if (state.retryAt > Date.now())
    setTimeout(controls, Math.min(state.retryAt - Date.now() + 30, 60000));
}
class RequestError extends Error {
  constructor(code, status = 0, retryAt = 0) {
    super(code);
    this.code = code;
    this.status = status;
    this.retryAt = retryAt;
  }
}
async function request(path, method = "GET", body, authenticated = true) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authenticated && state.token)
    headers.Authorization = `Bearer ${state.token}`;
  let response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(90000),
    });
  } catch {
    throw new RequestError("network");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const after = response.headers.get("Retry-After");
    const seconds = Number(after);
    const retryAt = after
      ? Number.isFinite(seconds)
        ? Date.now() + seconds * 1000
        : Date.parse(after) || 0
      : 0;
    throw new RequestError(
      error?.error?.code ?? "service_unavailable",
      response.status,
      retryAt,
    );
  }
  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    throw new RequestError("invalid_response", 503);
  }
}
let turnstileScript;
async function configure() {
  if (!state.config)
    state.config = await request("/v1/config", "GET", undefined, false);
  if (!state.config.requireCaptcha) return;
  $("verification").hidden = false;
  if (!state.config.turnstileSiteKey)
    throw new RequestError("captcha_configuration");
  if (!turnstileScript)
    turnstileScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        turnstileScript = null;
        reject(new RequestError("network"));
      };
      document.head.append(script);
    });
  await turnstileScript;
  if (state.captchaWidget === null)
    state.captchaWidget = window.turnstile.render("#verification", {
      sitekey: state.config.turnstileSiteKey,
      action: "velani-session",
      language: state.locale,
      callback: (token) => {
        state.captchaToken = token;
      },
      "expired-callback": () => {
        state.captchaToken = null;
      },
    });
}
async function ensureSession() {
  if (state.token) {
    if (Date.parse(state.expiresAt) > Date.now()) return;
    throw new RequestError("session_expired", 401);
  }
  await configure();
  if (state.config.requireCaptcha && !state.captchaToken)
    throw new RequestError("captcha_required", 403);
  const result = await request(
    "/v1/sessions",
    "POST",
    {
      locale: state.locale,
      ...(state.captchaToken ? { captchaToken: state.captchaToken } : {}),
    },
    false,
  );
  state.token = result.sessionToken;
  state.expiresAt = result.expiresAt;
  if (state.captchaWidget !== null) {
    window.turnstile.reset(state.captchaWidget);
    state.captchaToken = null;
  }
  const profile = await request("/v1/profile");
  state.profile = profile.profile;
  state.profileRevision = profile.revision;
}
function clearSessionView() {
  state.token = null;
  state.expiresAt = null;
  state.record = null;
  state.profile = emptyProfile();
  state.profileDraft = emptyProfile();
  state.profileRevision = 0;
  state.dirty = false;
  $("plan-section").hidden = true;
  $("profile-details").hidden = true;
  $("before-plan").hidden = false;
  $("messages").replaceChildren();
  $("conversation-empty").hidden = false;
  $("share-dialog").close();
  renderStage();
}
function expireBeforeNewRequest() {
  if (state.token && Date.parse(state.expiresAt) <= Date.now()) {
    clearSessionView();
    return true;
  }
  return false;
}
function errorText(error) {
  if (error.code === "network") return t("networkError");
  if (error.code === "captcha_configuration") return t("configuration");
  if (error.code === "captcha_required") return t("captcha");
  if (error.code === "knowledge_unavailable") return t("noKnowledge");
  if (error.status === 401) return t("expired");
  if (error.status === 429) return t("rate");
  if (error.status === 409)
    return t(
      ["turn_in_progress", "plan_in_progress"].includes(error.code)
        ? "busyError"
        : "conflict",
    );
  if (error.status === 403) return t("forbidden");
  if ([400, 413, 422].includes(error.status)) return t("invalid");
  return t("unavailable");
}
function clearError() {
  state.pending = null;
  state.conflict = false;
  state.retryAt = 0;
  $("error").hidden = true;
  $("error").textContent = "";
}
async function perform(label, operation) {
  if (state.busy) return;
  clearError();
  state.busy = true;
  $("status").textContent = t(label);
  controls();
  try {
    await operation();
  } catch (raw) {
    const error =
      raw instanceof RequestError ? raw : new RequestError("unexpected", 503);
    $("status").textContent = "";
    $("error").textContent = errorText(error);
    $("error").hidden = false;
    state.conflict =
      error.status === 409 &&
      !["turn_in_progress", "plan_in_progress"].includes(error.code);
    const retryable =
      !state.conflict &&
      (error.status === 0 ||
        [408, 425, 429, 500, 502, 503, 504].includes(error.status) ||
        ["captcha_required", "turn_in_progress", "plan_in_progress"].includes(
          error.code,
        ));
    if (retryable) {
      state.pending = { label, operation };
      state.retryAt = error.retryAt;
    }
    if (error.status === 401) state.expiresAt = "1970-01-01T00:00:00.000Z";
    if ($("share-dialog").open)
      $("share-status").textContent = t("shareFailed");
  } finally {
    state.busy = false;
    controls();
  }
}
function setStatus(key) {
  $("status").textContent = t(key);
}
function addMessage(role, message, answer) {
  const li = node("li", `message ${role}`);
  li.append(
    node("span", "message-role", t(role === "user" ? "you" : "assistant")),
    node("p", "", message),
  );
  if (answer?.sources?.length) {
    const list = node("ul");
    for (const source of answer.sources) {
      const a = sourceLink(source);
      if (a) {
        const item = node("li");
        item.append(a);
        list.append(item);
      }
    }
    li.append(list);
  }
  if (answer?.action === "human_help") {
    const support = answer.sources?.some((source) => {
      const url = safeUrl(source.url);
      return url && new URL(url).pathname === "/pages/nevora-support";
    });
    const a = node("a", "", t(support ? "support" : "contact"));
    a.href = support
      ? "https://www.thevelani.com/pages/nevora-support"
      : "https://www.thevelani.com/pages/contact?interest=nevora";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    li.append(a);
  }
  if (answer?.action === "lead_form") {
    const button = node("button", "text-button", t("share"));
    button.type = "button";
    button.addEventListener("click", () => {
      if (state.record) openShare();
      else setStatus("planFirst");
    });
    li.append(button);
  }
  $("messages").append(li);
  $("conversation-empty").hidden = true;
  li.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
async function saveEdits() {
  if (!state.record || !state.dirty) return;
  const record = await request(
    `/v1/plans/${encodeURIComponent(state.record.id)}`,
    "PATCH",
    {
      expectedRevision: state.record.revision,
      actions: readActions(),
      notes: $("plan-notes").value.trim(),
    },
  );
  state.record = record;
  state.dirty = false;
  renderPlanMeta();
}
function openShare() {
  if (expireBeforeNewRequest() || !state.record) {
    setStatus("expired");
    return;
  }
  perform("saving", async () => {
    if (!$("plan-form").reportValidity()) return;
    await saveEdits();
    $("share-plan-title").textContent = state.record.plan.title;
    $("share-plan-summary").textContent = state.record.plan.summary;
    $("share-revision").textContent =
      `${t("confirmShare")} ${state.record.revision}`;
    $("share-plan-consent").checked = false;
    $("lead-consent").checked = false;
    $("share-status").textContent = "";
    $("share-dialog").showModal();
    $("lead-name").focus();
    $("status").textContent = "";
  });
}
function exportData() {
  return {
    ...state.record,
    plan: { ...state.record.plan, actions: readActions() },
    notes: $("plan-notes").value.trim(),
  };
}
function escapeMarkdown(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/[\\`*_{}\[\]()#+.!|]/g, "\\$&");
}
function markdown(record) {
  const p = record.plan,
    m = escapeMarkdown;
  const lines = [
    "# " + m(p.title),
    "",
    "NEVORA · VELANI",
    "",
    m(p.summary),
    "",
    "## " + t("reviewedDetails"),
  ];
  for (const [key, value] of Object.entries(p.profile))
    if (value) lines.push(`- ${t(key)}: ${m(value)}`);
  lines.push("", "## " + t("workflowTitle"));
  for (const step of p.workflow) {
    lines.push(
      "",
      "### " + stageCopy[state.locale][step.stage].label,
      "",
      t("publishedFact") + ": " + m(step.productFact),
      "",
      t("suggestion") + ": " + m(step.recommendation),
    );
  }
  lines.push("", "## " + t("nextSteps"));
  p.actions.forEach((action, i) =>
    lines.push(
      "",
      `${i + 1}. ${m(action.title)}`,
      `   ${t("owner")}: ${m(action.owner)}`,
      `   ${t("timing")}: ${m(action.timing)}`,
      `   ${m(action.details)}`,
    ),
  );
  for (const [key, items] of [
    ["assumptionsTitle", p.assumptions],
    ["questionsTitle", p.questions],
  ]) {
    lines.push("", "## " + t(key));
    items.forEach((item) => lines.push("- " + m(item)));
  }
  if (record.notes)
    lines.push("", "## " + t("notesLabel"), "", m(record.notes));
  lines.push("", "## " + t("sources"));
  p.sources.forEach((source) => {
    const url = safeUrl(source.url);
    if (url) lines.push(`- ${m(source.title)}: ${url}`);
  });
  lines.push(
    "",
    t("planDisclaimer"),
    "",
    `${t("revision")} ${record.revision} · ${t(state.dirty ? "localEdits" : "saved")}`,
  );
  return lines.join("\n") + "\n";
}
function downloadPlan() {
  if (!state.record) return;
  const blob = new Blob([markdown(exportData())], {
      type: "text/markdown;charset=utf-8",
    }),
    url = URL.createObjectURL(blob);
  const a = node("a");
  a.href = url;
  a.download =
    state.locale === "es" ? "mi-plan-nevora.md" : "my-nevora-plan.md";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus("downloaded");
}
function printPlan() {
  if (!state.record) return;
  $("print-area")?.remove();
  const area = node("article");
  area.id = "print-area";
  const record = exportData(),
    p = record.plan;
  area.append(
    node("p", "print-brand", "VELANI / NEVORA"),
    node("h1", "", p.title),
    node("p", "", p.summary),
  );
  const section = (title, items) => {
    const block = node("section");
    block.append(node("h2", "", title));
    items.forEach((item) => block.append(node("p", "", item)));
    area.append(block);
  };
  section(
    t("reviewedDetails"),
    Object.entries(p.profile)
      .filter(([, v]) => v)
      .map(([key, value]) => `${t(key)}: ${value}`),
  );
  p.workflow.forEach((step) =>
    section(stageCopy[state.locale][step.stage].label, [
      t("publishedFact") + ": " + step.productFact,
      t("suggestion") + ": " + step.recommendation,
    ]),
  );
  p.actions.forEach((action, i) =>
    section(`${i + 1}. ${action.title}`, [
      `${t("owner")}: ${action.owner} · ${t("timing")}: ${action.timing}`,
      action.details,
    ]),
  );
  section(t("assumptionsTitle"), p.assumptions);
  section(t("questionsTitle"), p.questions);
  if (record.notes) section(t("notesLabel"), [record.notes]);
  section(
    t("sources"),
    p.sources
      .filter((source) => safeUrl(source.url))
      .map((source) => `${source.title}: ${source.url}`),
  );
  area.append(node("p", "", t("planDisclaimer")));
  document.body.append(area);
  window.print();
}

$("brief-form").addEventListener("submit", (event) => {
  event.preventDefault();
  expireBeforeNewRequest();
  const brief = $("brief").value.trim();
  if (!brief) return;
  const payload = {
    requestId: crypto.randomUUID(),
    brief,
    profileRevision: state.profileRevision,
    locale: state.locale,
  };
  perform("creating", async () => {
    await ensureSession();
    const record = await request("/v1/plans", "POST", payload);
    state.lastSubmittedBrief = brief;
    renderPlan(record);
    setStatus("planReady");
    $("plan-title").focus({ preventScroll: true });
    $("plan-section").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
document.querySelectorAll("[data-sample]").forEach((button) =>
  button.addEventListener("click", () => {
    $("brief").value = t(
      {
        cafes: "sampleCafeText",
        retail: "sampleRetailText",
        growing: "sampleGrowingText",
      }[button.dataset.sample],
    );
    $("brief").focus();
  }),
);
$("profile-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (expireBeforeNewRequest()) {
    setStatus("expired");
    return;
  }
  const profile = Object.fromEntries(
    Object.keys(fields).map((key) => [key, $(`profile-${key}`).value.trim()]),
  );
  const payload = { expectedRevision: state.profileRevision, profile };
  perform("saving", async () => {
    await ensureSession();
    const saved = await request("/v1/profile", "PUT", payload);
    state.profile = saved.profile;
    state.profileDraft = { ...saved.profile };
    state.profileRevision = saved.revision;
    renderProfile();
    if ($("brief").value.trim() === state.lastSubmittedBrief) {
      $("brief").value = t("updatedPlanBrief");
      setStatus("detailsSavedForPlan");
    } else setStatus("detailsSaved");
  });
});
$("plan-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (expireBeforeNewRequest()) {
    setStatus("expired");
    return;
  }
  perform("saving", async () => {
    await saveEdits();
    setStatus("changesSaved");
  });
});
$("plan-notes").addEventListener("input", markDirty);
$("chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  expireBeforeNewRequest();
  const message = $("chat-input").value.trim();
  if (!message) return;
  const payload = {
    requestId: crypto.randomUUID(),
    message,
    locale: state.locale,
    ...(state.record ? { planId: state.record.id } : {}),
  };
  let appended = false;
  perform("thinking", async () => {
    await ensureSession();
    if (!appended) {
      addMessage("user", message);
      appended = true;
    }
    $("chat-input").value = "";
    const answer = await request("/v1/chat", "POST", payload);
    addMessage("assistant", answer.message, answer);
    $("status").textContent = "";
  });
});
$("retry").addEventListener("click", () => {
  if (state.pending && Date.now() >= state.retryAt) {
    const { label, operation } = state.pending;
    perform(label, operation);
  }
});
$("share-retry").addEventListener("click", () => {
  if (state.pending?.label === "sharing" && Date.now() >= state.retryAt) {
    const { label, operation } = state.pending;
    perform(label, operation);
  }
});
$("dismiss-error").addEventListener("click", () => {
  clearError();
  controls();
});
$("refresh-state").addEventListener("click", () =>
  perform("saving", async () => {
    await ensureSession();
    const saved = await request("/v1/profile");
    state.profile = saved.profile;
    state.profileRevision = saved.revision;
    if (state.record) {
      const record = await request(
        `/v1/plans/${encodeURIComponent(state.record.id)}`,
      );
      renderPlan(record);
    }
    state.profileDraft = { ...saved.profile };
    renderProfile();
    setStatus("loaded");
  }),
);
$("download").addEventListener("click", downloadPlan);
$("print").addEventListener("click", printPlan);
$("share").addEventListener("click", openShare);
$("close-share").addEventListener("click", () => {
  $("share-dialog").close();
});
$("share-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (expireBeforeNewRequest()) {
    setStatus("expired");
    return;
  }
  if (
    !state.record ||
    !$("lead-consent").checked ||
    !$("share-plan-consent").checked
  )
    return;
  const payload = {
    requestId: crypto.randomUUID(),
    name: $("lead-name").value.trim(),
    email: $("lead-email").value.trim(),
    company: $("lead-company").value.trim(),
    message: $("lead-message").value.trim(),
    teamSize: state.record.plan.profile.teamSize,
    locations: state.record.plan.profile.locations,
    consent: true,
    consentVersion: "lead-v1",
    planId: state.record.id,
    planRevision: state.record.revision,
  };
  perform("sharing", async () => {
    await request("/v1/leads", "POST", payload);
    $("share-status").textContent = t("enquirySaved");
    $("lead-consent").checked = false;
    $("share-plan-consent").checked = false;
    $("status").textContent = t("enquirySaved");
  });
});
$("delete-workspace").addEventListener("click", () => {
  if (!state.token) return;
  perform("deleting", async () => {
    await request("/v1/session", "DELETE");
    state.token = null;
    state.expiresAt = null;
    state.record = null;
    state.profile = emptyProfile();
    state.profileDraft = emptyProfile();
    state.profileRevision = 0;
    state.dirty = false;
    $("plan-section").hidden = true;
    $("profile-details").hidden = true;
    $("before-plan").hidden = false;
    $("messages").replaceChildren();
    $("conversation-empty").hidden = false;
    $("chat-input").value = "";
    $("share-dialog").close();
    renderStage();
    setStatus("deleted");
  });
});
$("language").addEventListener("change", (event) => {
  state.locale = event.target.value;
  translate();
  if (state.record) setStatus("languageChanged");
});
translate();
configure().catch((error) => {
  if (error.code !== "captcha_required") {
    $("error").textContent = errorText(error);
    $("error").hidden = false;
  }
});
