# Spanish glossary (es), Velani website

Neutral Latin American Spanish for Puerto Rico business owners, in the "tú" form, the same register as Rondo and the NEVORA
app. Product names stay in English: Velani, NEVORA, NEVORA Workforce, NEVORA Relay, Rondo. Where the NEVORA app already has a
Spanish term, the website uses it. Sources checked (read-only): the NEVORA app on `origin/claude-codex-collab-nevora`,
`src/components/clocker-copy.ts`, `src/components/clocker-language.tsx`, `src/components/mobile-access/copy.ts`,
`src/lib/auth-copy.ts`, `src/lib/payroll/native/paystub-document.ts`, `src/lib/workspace-presentation/words.ts`.

## Where the Spanish lives

| What | File |
|---|---|
| Routes, titles, descriptions, header and phone menu words, cookie dialog, contact form, plans | `src/content.es.mjs` |
| Home, NEVORA and Products page bodies | `src/night/home.es.body.html`, `src/night/nevora.es.body.html`, `src/night/products.es.body.html` |
| Footer | `src/night/foot.es.html` |
| Form status, errors, quote note, sent confirmation, cookie messages, page titles set by script | `public/assets/velani.js` (`STRINGS.es`) |
| Time-clock demo | `src/night/kiosk.js` (`ES`, also used to render the Spanish page) |
| Rondo chat | `src/night/assist.js` (`T.es`), `src/night/velani-assistant.js` (error messages) |
| Menu button labels, the NEVORA shift time | `src/night/motion.js`, `src/night/nevora.js` |

## Terms

| English | Spanish | Note |
|---|---|---|
| Scheduling | horarios | App tab "Horario"; "Programa turnos" as a verb in the NEVORA feature heading |
| Shift / shift teams | turno / equipos por turnos | App: "Próximo turno", "En turno" |
| Time clock | registro de tiempo | App: "Time clock" = "Registro de tiempo" (Clocker). Rondo had "reloj de entrada"; aligned to the app |
| Clock in | marcar entrada | App: "Clock In" = "Marcar entrada" |
| Clock-in recorded | Entrada registrada | App: "Clock In Recorded". The kiosk demo said "Tiempo registrado"; aligned to the app |
| Clock in again | Marcar entrada de nuevo | Kiosk said "Registrar de nuevo"; aligned to "Marcar entrada" |
| PIN / PINs | PIN / los PIN | App: "Los PIN" |
| Shared tablet | tableta compartida | App: "tableta" |
| Timecards | tarjetas de tiempo | App (owner advisor): "Tarjetas de tiempo" |
| Pay statement | comprobante de nómina | App: paystub and pay documents are titled "Comprobante de nómina" |
| Payroll / payroll calculation | nómina / cálculo de nómina | App: "Nómina", "Resumen de nómina" |
| Time off | tiempo libre | App: "Solicita tiempo libre" |
| Shift swap | cambio de turno | The app has no Spanish swap string yet; standard term |
| Workplace (the business's NEVORA account) | espacio de trabajo | App: "Espacio de trabajo no disponible" |
| Your workplace (the employer) | tu lugar de trabajo / tu trabajo | App: "tu lugar de trabajo", "tu trabajo" |
| Owner / manager / employee | dueño / gerente / empleado | App clocker and mobile access use "dueño"; the sign-in pages leave "Owner" in English, the site does not |
| Location | ubicación | App: "Ubicación", "Ubicaciones" |
| Free trial / request free trial | prueba gratis / Pide la prueba gratis | Header button shortened to "Prueba gratis" so the bar fits at 834px |
| Quote / by quote / ask for a quote | cotización / por cotización / Pide una cotización | |
| One price per business | un solo precio por negocio | |
| No card · No automatic charge | Sin tarjeta · Sin cargos automáticos | |
| Waitlist / early access | lista de espera / acceso anticipado | |
| In development / Coming soon / Soon / In design | En desarrollo / Próximamente / Pronto / En diseño | |
| Available now | Disponible ahora | |
| No dates yet | Aún sin fechas | |
| Custom development / custom apps | desarrollo a la medida / apps a la medida | "a la medida" is the usual Puerto Rico phrasing |
| Websites / online stores / booking / loyalty / dashboard | sitios web / tiendas en línea / reservas / lealtad / panel | |
| Client support / Support | Soporte al cliente / Soporte | |
| About | Nosotros | |
| Plans / Products / Contact | Planes / Productos / Contacto | |
| Start a project | Empieza un proyecto | |
| Learn more | Conoce más | |
| Ask Rondo | Pregúntale a Rondo | Rondo's own launcher string |
| AI assistant | asistente de IA | |
| Inquiry | consulta | Rondo already uses "consultas" |
| Business days | días laborables | "Buscamos responderte en un plazo de dos días laborables" |
| Support hours | lunes a viernes, 8 a. m. a 9 p. m. ET | Non-breaking spaces inside "8 a. m." |
| Time of day | 2:17 p. m. | Lowercase with a space ("p. m."), as RAE recommends; the demo normalizes what browsers return |
| Calendar days | días calendario | |
| Cookie choices / necessary / preferences / analytics / marketing / sale or sharing | Opciones de cookies / Necesarias / Preferencias / Analítica / Marketing / Venta o uso compartido | |
| Privacy notice | Aviso de privacidad | Linked pages that exist only in English carry "(en inglés)" and `hreflang="en"` |
| Language | Idioma | The switch's group name |

## Facts that must stay identical to English

30-day free trial; up to 30 employees; no card; no automatic charge; one price per business quoted by number of employees,
business and features; a closed workplace and its data are deleted within 3 days; export first; email support@thevelani.com to
close; we aim to reply within two business days; support hours as above; phone 787-925-2000; address unchanged; NEVORA
calculates pay statements and does not pay employees or file payroll taxes; Rondo in NEVORA is in development and the website
chat works today; NEVORA Relay is in design, no dates, waitlist.

## Things that stay in English on purpose

- Topic option values (`website`, `custom-software`, `nevora`, `nevora-demo`, `relay`, `other`), the submitted team size
  ("More than 30 (by quote)") and the lines velani.js writes into an empty message, so every inquiry email reads the same.
- Legal and policy pages (no Spanish versions yet); Spanish pages mark links to them.
- Screenshots of the NEVORA app and client work (images are shared with the English pages).
