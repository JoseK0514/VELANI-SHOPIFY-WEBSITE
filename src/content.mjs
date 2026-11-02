export const company = Object.freeze({
  name: 'The Velani',
  operator: 'VELANI LLC',
  email: 'support@thevelani.com',
  address: '1654 Calle Tulipan, Suite 100, San Juan, PR 00927',
  domain: 'www.thevelani.com',
});
export const services = [
  { id: 'web-applications', title: 'Web applications', intro: 'Useful in a browser. Built around the task.', text: 'Customer portals, business tools and applications your team can use without installing software.', detail: 'Start with who needs access, what they need to finish, and the systems the application needs to work with.' },
  { id: 'mobile-applications', title: 'Mobile applications', intro: 'Software for work away from a desk.', text: 'Mobile workflows designed around the people, devices and situations in which they will be used.', detail: 'Device capabilities, accessibility, connectivity and the distribution approach are part of defining the project.' },
  { id: 'business-systems', title: 'Business systems', intro: 'Give a manual process a clear place to happen.', text: 'Internal applications for requests, approvals, records and the handoffs that keep a business running.', detail: 'We work through roles, responsibilities and the information people need before deciding how a system should behave.' },
  { id: 'integrations', title: 'Integrations', intro: 'Make your existing tools work together.', text: 'Connections between applications that reduce repeated entry and make information easier to use.', detail: 'A useful integration starts with the source of each record, the permissions involved and what should happen when a system is unavailable.' },
];
const page = (title, eyebrow, intro, sections = [], extra = {}) => ({ title, eyebrow, intro, sections, ...extra });
export const routes = {
  '/': page('Software products and custom development', 'Software products + custom development', 'Velani develops software products and builds custom applications around the work your business needs to do.', [], { kind: 'home' }),
  '/pages/products': page('Software from Velani.', 'Our products', 'Our own products focus on specific business workflows. Here is what we are working on.', [], { kind: 'products', nav: 'products' }),
  '/pages/nevora': page('The daily work of running a team, connected.', 'NEVORA · In development', 'Scheduling, recorded time, employee requests and payroll review workflows in one place.', [
    { heading: 'Plan the work', text: 'Build schedules, review availability and handle changes with the work in context.' },
    { heading: 'Keep time in context', text: 'Connect recorded work and breaks with corrections, review and the people responsible for them.' },
    { heading: 'Give employees their own view', text: 'A place for people to view their schedule and work information and make requests.' },
    { heading: 'Review before the next step', text: 'Support review of time and payroll records through the appropriate workplace permissions and approvals.' },
    { heading: 'Availability', text: 'NEVORA is in development. This website does not offer public accounts, a paid plan, a guaranteed demo appointment or a launch date.' },
  ], { kind: 'product', nav: 'products', cta: 'Ask about NEVORA', interest: 'nevora' }),
  '/pages/custom-development': page('Software for the work your business needs to do.', 'Custom development', 'A customer-facing application, an internal system or a connection between tools. Start with the problem and the people doing the work.', [], { kind: 'services', nav: 'services' }),
  '/pages/about': page('A software company. Two ways to work with us.', 'About The Velani', 'The Velani develops software products and builds custom applications for businesses.', [
    { heading: 'Products of our own', text: 'Our product work starts with a specific business workflow. NEVORA, our workforce-management product, is in development.' },
    { heading: 'Software for your business', text: 'Custom development starts with the work you need software to support. We define the problem and the scope before making project commitments.' },
    { heading: 'Clarity throughout', text: 'What a product does. What is still in development. What a project agreement covers. Those details should be easy to understand.' },
    { heading: 'The company behind the work', text: 'The Velani is operated by VELANI LLC. You can reach us at support@thevelani.com or at 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.' },
  ], { nav: 'about' }),
  '/pages/contact': page('Start with the problem.', 'Discuss a project', 'Tell us what needs to work better, who needs to use it, and what you want to build.', [], { kind: 'contact', nav: 'contact' }),
  '/pages/help': page('Before we start.', 'Help & questions', 'Answers about our products, custom development and getting in touch.', [
    { heading: 'Can I sign up for NEVORA now?', text: 'NEVORA is in development. Ask about NEVORA to discuss the product; this website does not create a product account.' },
    { heading: 'Does Velani build custom software?', text: 'Yes. Describe the application, internal workflow or integration you need through Discuss a project.' },
    { heading: 'Can you give me a price or delivery date here?', text: 'A project needs an agreed scope. Fees, milestones and delivery expectations are set out in the engagement agreement.' },
    { heading: 'Does an inquiry start a contract?', text: 'No. An inquiry starts a conversation. It does not purchase a product or begin paid work.' },
    { heading: 'Where should I send sensitive information?', text: 'Do not send passwords, API keys, payment details or sensitive records through a public form or ordinary email. Ask for an appropriate channel first.' },
    { heading: 'Is this website accepting inquiries?', text: 'This is an unpublished website preview. Its form lets you check a draft inquiry without sending it. The public contact email is support@thevelani.com; do not send sensitive records.' },
  ], { kind: 'faq' }),
  '/pages/legal': page('The details matter.', 'Legal & trust', 'Find the information that applies to this company website. Product use and paid engagements have their own applicable terms.', [], { kind: 'legal-index', legal: true }),
  '/pages/privacy': page('Privacy, in plain language.', 'Privacy notice', 'How information is handled on this company website and through a project inquiry.', [
    { heading: 'Who operates this website', text: 'The Velani is operated by VELANI LLC. Contact support@thevelani.com about privacy, or write to VELANI LLC, 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.' },
    { heading: 'This preview and your information', text: 'This is an unpublished website preview. Its inquiry form checks your draft in the page and does not send the message. Velani’s preview code does not save the name, email or message to browser storage. Do not include credentials, payment details or sensitive records.' },
    { heading: 'Website platform information', text: 'The website is prepared for Shopify hosting. Shopify and any enabled platform providers may process device, connection, security and storage information to operate the website. No new advertising or analytics integration is included in this draft. The final notice must reflect the actual published configuration and providers.' },
    { heading: 'If you contact us', text: 'An email you choose to send contains your address, your message and any other information you include. We use an inquiry to handle the conversation you requested. An inquiry is not consent to subscribe you to marketing.' },
    { heading: 'Recipients and retention', text: 'Before enabling the website form, we must verify the recipient mailbox, actual delivery providers and the retention rules for inquiries and copies. These are not the workforce-record retention rules used by NEVORA. This preview does not promise a specific inquiry retention period or storage location.' },
    { heading: 'Privacy choices and requests', text: 'Use Cookie choices to review available website choices. Contact support@thevelani.com about personal information and privacy requests. Applicable rights depend on the relevant law and circumstances. The handling of a request may require proportionate identity verification.' },
    { heading: 'Product and client data', text: 'This notice concerns the company website. NEVORA workplace records are covered by its applicable product privacy notice. Client processing, including any controller/processor responsibilities, must be covered by the relevant engagement and data-processing terms.' },
    { heading: 'Changes before launch', text: 'The final published notice will identify its effective date and the verified processing practices. This preview notice does not certify compliance or make a claim that a product has launched.' },
  ], { legal: true }),
  '/pages/cookies': page('Your website choices.', 'Cookies & preferences', 'Understand the site’s storage and review optional processing choices.', [
    { heading: 'Necessary platform operation', text: 'Shopify may use storage and technical information to operate the site, protect it from abuse and remember privacy choices. Actual platform activity must be included in the final website inventory.' },
    { heading: 'Optional integrations', text: 'No new Velani advertising or analytics integration is included in this draft. Optional integrations added later must respect applicable consent and opt-out requirements. A choice to allow a category does not add an integration to this preview.' },
    { heading: 'Make or change a choice', text: 'Cookie choices opens the available controls. On Shopify, those controls use its supported Customer Privacy API when available. Consent is recorded from your choice, not automatically. The local review version keeps a demonstration choice only for this tab.' },
    { heading: 'When controls are unavailable', text: 'If the platform privacy service cannot be reached, this draft does not start optional integrations as a fallback. Existing Shopify processing is described separately; the absence of newly added code does not prove that the platform uses no cookies.' },
    { heading: 'Browser signals and withdrawal', text: 'Applicable opt-out signals and provider behavior must be verified in the final configuration. Changing a choice affects supported processing going forward and does not itself erase data already processed. Contact support@thevelani.com with a privacy question.' },
  ], { legal: true, cookieAction: true }),
  '/pages/website-terms': page('Using the company website.', 'Website terms', 'These terms describe this informational website and its inquiry flow.', [
    { heading: 'Operator and contact', text: 'This website is operated by VELANI LLC, doing business as The Velani. Contact support@thevelani.com or write to 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.' },
    { heading: 'Information and inquiries', text: 'The website describes software products and custom development. Sending an inquiry does not begin a paid engagement, reserve availability, create a software account or make a purchase. This unpublished preview does not send form inquiries.' },
    { heading: 'Use the website lawfully', text: 'Do not attempt unauthorized access, disrupt the website, submit malicious material or misuse another person’s information. Do not send credentials or sensitive personal records through the public inquiry form.' },
    { heading: 'Product availability', text: 'Each product page states its current status. NEVORA is in development. A development presentation is not a promise of a launch date, price or completed capability.' },
    { heading: 'Materials and project rights', text: 'Company and product materials are subject to their applicable ownership and licence rights. This website grants no software licence or assignment of intellectual property. Deliverable ownership, pre-existing materials and third-party licences belong in a client’s written agreement.' },
    { heading: 'Separate agreements', text: 'Paid software access and custom engagements require their applicable terms. This website does not choose an arbitration clause, liability cap, refund exclusion or intellectual-property transfer for a future transaction. Mandatory legal rights are not waived by an inquiry.' },
    { heading: 'Changes', text: 'The final published terms will carry their effective date and any notice appropriate to the change. Before a paid offer is accepted, the applicable commercial terms must be available.' },
  ], { legal: true }),
  '/pages/software-project-terms': page('Before paid work begins.', 'Software & project information', 'An inquiry is a starting point. A product or project agreement sets the commitments.', [
    { heading: 'The initial website offer', text: 'This site presents Velani’s work and a project inquiry path. It does not sell a subscription, take payment, ship physical goods or guarantee a demo appointment. NEVORA remains in development.' },
    { heading: 'Custom development', text: 'A written engagement should define scope, deliverables, fees, milestones, acceptance, change requests, responsibilities, confidentiality, ownership and licensing, data processing, support and termination. Those commitments are agreed for the project, not inferred from a landing page.' },
    { heading: 'Billing, cancellation and refunds', text: 'These depend on the actual product or signed engagement and applicable law. This preview offers no paid checkout and does not impose an all-digital-sales-final rule. Any future subscription must clearly describe price, renewal, cancellation and refund handling before purchase.' },
    { heading: 'Software access and use', text: 'A future software offering needs applicable licence or service terms, account lifecycle information and product-specific privacy notices. Product access is not created by using the company website.' },
    { heading: 'Client personal information', text: 'When a project requires processing personal information, the relevant roles, purposes, recipients, security, transfer and deletion responsibilities must be agreed, including a data-processing agreement where applicable.' },
    { heading: 'Support and service commitments', text: 'Support coverage, maintenance, service levels and response expectations belong in the applicable agreement. No uptime, certification, delivery deadline or support guarantee is created by this preview.' },
  ], { legal: true }),
  '/pages/accessibility': page('A site people can use.', 'Accessibility', 'Our design target is WCAG 2.2 AA. A target is not a completed compliance audit.', [
    { heading: 'What we are building for', text: 'Readable contrast and text, semantic page structure, keyboard access, visible focus, responsive layouts, descriptive labels and reduced-motion support are part of the website design.' },
    { heading: 'Evaluation', text: 'This unpublished preview is being checked with automated tools and manual browser interactions. The final statement will record its evaluation date, tested scope and any known barriers. An automated result alone does not establish full conformance.' },
    { heading: 'Report a barrier', text: 'Email support@thevelani.com with the page and the task you were trying to complete. Include the device or assistive technology if it helps explain the problem. Do not include unnecessary personal information.' },
  ], { legal: true }),
  '/pages/security': page('Report a concern privately.', 'Security contact', 'Help us understand a suspected issue without putting people or systems at risk.', [
    { heading: 'Contact', text: 'The existing public NEVORA support channel is support@thevelani.com. Use it for an initial security concern and ask for an appropriate channel before sending sensitive evidence.' },
    { heading: 'Useful information', text: 'Describe the affected address, what happened and the minimum steps needed to explain the issue. Remove credentials, personal records and unnecessary data from any material you share.' },
    { heading: 'Responsible scope', text: 'Do not access another person’s information, disrupt a service or perform destructive testing. This page does not establish a bounty, a legal safe-harbor promise, a disclosure deadline or a guaranteed response time.' },
  ], { legal: true }),
};
export const legalLinks = [
  ['Privacy', '/pages/privacy'], ['Terms', '/pages/website-terms'], ['Cookies', '/pages/cookies'],
  ['Project terms', '/pages/software-project-terms'], ['Accessibility', '/pages/accessibility'],
  ['Security', '/pages/security'], ['Help', '/pages/help'], ['Contact', '/pages/contact'],
];

