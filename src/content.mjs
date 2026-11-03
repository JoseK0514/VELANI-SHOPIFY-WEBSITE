import { POLICY_DOCS } from './nevora-policies.mjs';
export const company = Object.freeze({
  name: 'Velani',
  operator: 'VELANI LLC',
  email: 'support@thevelani.com',
  phone: '787-925-2000',
  hours: 'Monday to Friday',
  address: '1654 Calle Tulipan, Suite 100, San Juan, PR 00927',
  domain: 'www.thevelani.com',
});
export const services = [
  { id: 'web-applications', title: 'Web applications', intro: 'Tools used in a browser, built around the task.', text: 'Customer portals, order trackers and tools for your office, used in a browser with nothing to install.', detail: 'Start with who needs access, what they need to finish and the systems the application needs to work with.' },
  { id: 'mobile-applications', title: 'Mobile applications', intro: 'Software for work away from a desk.', text: 'Apps for people who work away from a desk, such as field crews, drivers and store or warehouse staff.', detail: 'Device capabilities, accessibility, connectivity and the distribution approach are part of defining the project.' },
  { id: 'business-systems', title: 'Business systems', intro: 'A clear place for a manual process to happen.', text: 'Requests, approvals and records that move by email or paper today, kept in one place with a clear owner for each step.', detail: 'We work through roles, responsibilities and the information people need before deciding how a system should behave.' },
  { id: 'integrations', title: 'Integrations', intro: 'Your existing tools, working together.', text: 'Connections between the tools you already pay for, so nobody types the same order, invoice or hours twice.', detail: 'A useful integration starts with the source of each record, the permissions involved and what should happen when a system is unavailable.' },
];
/** name: the short page name used for <title> and og:title ("<name> · Velani"); the title is the H1 tagline. */
const page = (title, eyebrow, intro, sections = [], extra = {}) => ({ title, eyebrow, intro, sections, ...extra });
export const legalUpdated = 'November 2, 2026';
export const routes = {
  '/': page('Your team’s week, in one place.', 'Velani', 'NEVORA by Velani: scheduling, time clock and payroll calculation for teams that work in shifts. In development and offered to businesses by quote.', [], { kind: 'home', name: 'Velani · NEVORA scheduling, time clock and payroll calculation for shift teams' }),
  '/pages/products': page('What we make.', 'Velani', 'NEVORA, our own app for teams that work in shifts, and custom software we build for other businesses.', [], { kind: 'products', name: 'Products' }),
  '/pages/nevora': page('NEVORA · Scheduling, time clock and payroll calculation for shift teams', 'NEVORA', 'Scheduling, time clock and payroll calculation for shift teams. Owners and managers plan on the web, employees use their phone and everyone clocks in at a shared tablet with a PIN.', [], { kind: 'nevora', nav: 'nevora' }),
  '/pages/custom-development': page('Software for the work your business needs to do.', 'Custom development', 'A customer-facing application, an internal system or a connection between tools. Start with the problem and the people doing the work.', [], { kind: 'services', nav: 'services', name: 'Custom development' }),
  '/pages/about': page('A software company. Two\u00a0ways to work with us.', 'About Velani', 'Velani develops software products and builds custom applications for businesses.', [
    { heading: 'Products of our own', text: 'Our product work starts with a specific business workflow. NEVORA, our app for scheduling, time clock and payroll calculation, is in development and offered to businesses by quote.' },
    { heading: 'Software for your business', text: 'Custom development starts with the work you need software to support. We define the problem and the scope before making project commitments.' },
    { heading: 'Clarity throughout', text: 'What a product does. What is still in development. What a project agreement covers. Those details should be easy to understand.' },
    { heading: 'The company behind the work', text: 'Velani is operated by VELANI LLC. You can reach us at support@thevelani.com or at 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.' },
  ], { nav: 'about', name: 'About' }),
  '/pages/contact': page('Start with the problem.', 'Contact', 'Tell us what needs to work better, who needs to use it and what you want to build.', [], { kind: 'contact', nav: 'contact', name: 'Contact' }),
  '/pages/help': page('Before we start.', 'Help and questions', 'Answers about our products, custom development and getting in touch.', [
    { heading: 'How does my business get NEVORA?', text: 'NEVORA is offered to businesses by quote, with a free 30-day demo for teams of up to 30 employees. Ask for a quote or start a demo and we will discuss your team’s needs. Employees get their account from their workplace, not from this website.' },
    { heading: 'Does Velani build custom software?', text: 'Yes. Describe the application, internal workflow or integration you need on the contact page.' },
    { heading: 'Can you give me a price or delivery date here?', text: 'A project needs an agreed scope. Fees, milestones and delivery expectations are set out in the engagement agreement.' },
    { heading: 'Does an inquiry start a contract?', text: 'No. An inquiry starts a conversation. It does not purchase a product or begin paid work.' },
    { heading: 'Where should I send sensitive information?', text: 'Do not send passwords, API keys, payment details or sensitive records through a public form or ordinary email. Ask for an appropriate channel first.' },
    { heading: 'How do I reach client support?', text: 'Client support answers Monday to Friday. Write to support@thevelani.com, call 787-925-2000, or use the contact page.' },
    { heading: 'How does the free NEVORA demo work?', text: 'A business with up to 30 employees can use NEVORA free for 30 days from setup. No card is needed and nothing is charged. On day 30 you continue by quote, export your data, or we delete it within 3 days. NEVORA calculates pay statements; it does not pay employees or file payroll taxes.' },
  ], { kind: 'faq', name: 'Help and questions' }),
  '/pages/legal': page('The details matter.', 'Legal and trust', 'Find the information that applies to this company website. Product use and paid engagements have their own applicable terms.', [], { kind: 'legal-index', legal: true, name: 'Legal' }),
  '/pages/privacy': page('Privacy, in plain language.', 'Privacy notice', 'How information is handled on this company website and through a project inquiry.', [
    { heading: 'Who operates this website', text: 'Velani is operated by VELANI LLC. Contact support@thevelani.com about privacy, or write to VELANI LLC, 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.' },
    { heading: 'What this website collects', text: 'This website does not ask you to create an account. This website does not save your name, email or message to browser storage. Do not include credentials, payment details or sensitive records in a message.' },
    { heading: 'Website platform information', text: 'The website is hosted on Shopify. Shopify and the platform providers it uses may process device, connection, security and storage information to operate the website. Velani has not added advertising or analytics tools to this website.' },
    { heading: 'If you contact us', text: 'An email you choose to send contains your address, your message and any other information you include. We use an inquiry to handle the conversation you requested. An inquiry is not consent to subscribe you to marketing.' },
    { heading: 'The AI assistant', text: 'The assistant on this website answers questions about NEVORA and our services. When you use it, the messages you send and the replies you receive are stored by our hosting providers in the United States (Vercel for the service and Neon for its database) for up to 30 days, and your messages are sent to an AI model through our AI gateway to generate each reply. Before a conversation starts, Cloudflare Turnstile checks that the request comes from a browser and not from an automated program. Answers can be wrong, and product details may change. The assistant does not ask for passwords, payment details or employee records; do not include them. You can delete a conversation from the assistant at any time. The contact form is separate: an inquiry you send is handled as described above.' },
    { heading: 'Recipients and retention', text: 'Inquiries reach the support@thevelani.com mailbox, where VELANI LLC reads them. We keep an inquiry while we need it for the conversation and any project that follows, unless the law requires us to keep it longer. The NEVORA app has its own retention rules, set out in the NEVORA privacy policy.' },
    { heading: 'Privacy choices and requests', text: 'Use Cookie choices to review available website choices. Contact support@thevelani.com about personal information and privacy requests. Applicable rights depend on the relevant law and circumstances. The handling of a request may require proportionate identity verification.' },
    { heading: 'Product and client data', text: 'This notice concerns the company website. NEVORA workplace records are covered by the NEVORA privacy policy. Client processing, including any controller/processor responsibilities, must be covered by the relevant engagement and data-processing terms.' },
    { heading: 'Changes to this notice', text: 'When we change this notice, we update the date at the top of the page. This notice does not certify compliance with any standard.' },
  ], { legal: true, name: 'Website privacy notice' }),
  '/pages/cookies': page('Your website choices.', 'Cookies and preferences', 'How this website uses storage, and the optional choices you can make.', [
    { heading: 'Necessary platform operation', text: 'Shopify may use storage and technical information to operate the website, protect it from abuse and remember privacy choices. When you open the AI assistant, Cloudflare Turnstile runs a short automated-use check in your browser; it is not used for advertising.' },
    { heading: 'Optional integrations', text: 'Velani has not added advertising or analytics tools to this website. If we add one later, it will follow your choices and applicable opt-out requirements. Allowing a category does not add a tool.' },
    { heading: 'Make or change a choice', text: 'The Cookie choices button opens the available controls. On Shopify, those controls use its supported Customer Privacy API when available. Consent is recorded from your choice, not automatically.' },
    { heading: 'When controls are unavailable', text: 'If the platform privacy service cannot be reached, we do not start optional tools as a fallback. Shopify’s own processing is described in its notices; the absence of Velani tools does not mean the platform sets no cookies.' },
    { heading: 'Withdrawing a choice', text: 'Changing a choice affects supported processing going forward and does not itself erase data already processed. Contact support@thevelani.com with a privacy question.' },
  ], { legal: true, cookieAction: true, name: 'Cookies and preferences' }),
  '/pages/website-terms': page('Using the company website.', 'Website terms', 'These terms describe this informational website and its inquiry flow.', [
    { heading: 'Operator and contact', text: 'This website is operated by VELANI LLC. Velani is a brand of VELANI LLC. Contact support@thevelani.com or write to 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.' },
    { heading: 'Information and inquiries', text: 'The website describes software products and custom development. Sending an inquiry does not begin a paid engagement, reserve availability, create a software account or make a purchase.' },
    { heading: 'Use the website lawfully', text: 'Do not attempt unauthorized access, disrupt the website, submit malicious material or misuse another person’s information. Do not send credentials or sensitive personal records through the public inquiry form.' },
    { heading: 'Product availability', text: 'Each product page states its current status. NEVORA is in development and offered to businesses by quote. A product page is not a promise of a launch date, price or completed capability.' },
    { heading: 'Materials and project rights', text: 'Company and product materials are subject to their applicable ownership and license rights. This website grants no software license or assignment of intellectual property. Deliverable ownership, pre-existing materials and third-party licenses belong in a client’s written agreement.' },
    { heading: 'Separate agreements', text: 'Paid software access and custom projects have their own written terms. Those terms, not this website, set any liability, refund or intellectual-property commitments. An inquiry does not waive rights you have under the law.' },
    { heading: 'Changes', text: 'When we change these terms, we update the date at the top of the page. Before you accept a paid offer, we give you its commercial terms.' },
  ], { legal: true, name: 'Website terms' }),
  '/pages/software-project-terms': page('Before paid work begins.', 'Software and project terms', 'An inquiry is a starting point. A product or project agreement sets the commitments.', [
    { heading: 'What this website offers', text: 'This website presents Velani’s work and how to contact us. It does not sell a subscription, take payment, ship physical goods or guarantee a demo appointment. NEVORA is in development and offered to businesses by quote.' },
    { heading: 'Custom development', text: 'A written engagement should define scope, deliverables, fees, milestones, acceptance, change requests, responsibilities, confidentiality, ownership and licensing, data processing, support and termination. Those commitments are agreed for the project, not inferred from a landing page.' },
    { heading: 'Billing, cancellation and refunds', text: 'These depend on the actual product or signed engagement and applicable law. This website has no paid checkout and does not treat digital sales as final. Before any purchase, the price, renewal, cancellation and refund terms are set out in writing.' },
    { heading: 'Software access and use', text: 'A future software offering will have its own license or service terms, account lifecycle information and product-specific privacy notices. Product access is not created by using the company website.' },
    { heading: 'Client personal information', text: 'When a project requires processing personal information, the relevant roles, purposes, recipients, security, transfer and deletion responsibilities must be agreed, including a data-processing agreement where applicable.' },
    { heading: 'Support and service commitments', text: 'Support coverage, maintenance, service levels and response expectations belong in the applicable agreement. This website creates no uptime, certification, delivery deadline or support guarantee.' },
  ], { legal: true, name: 'Software and project terms' }),
  '/pages/accessibility': page('A website people can use.', 'Accessibility', 'Our design target is WCAG 2.2 AA. A target is not a completed compliance audit.', [
    { heading: 'What we are building for', text: 'Readable contrast and text, semantic page structure, keyboard access, visible focus, responsive layouts, descriptive labels and reduced-motion support are part of the website design.' },
    { heading: 'Evaluation', text: 'We check the website with automated tools and by hand in desktop and mobile browsers, with a keyboard and with reduced motion. We have not completed a full audit, and an automated result alone does not establish full conformance.' },
    { heading: 'Report a barrier', text: 'Email support@thevelani.com with the page and the task you were trying to complete. Include the device or assistive technology if it helps explain the problem. Do not include unnecessary personal information.' },
  ], { legal: true, name: 'Accessibility' }),
  '/pages/nevora-support': page('NEVORA support', 'NEVORA', '', [], { kind: 'policy', slug: 'support', nav: 'nevora-help' }),
  '/pages/nevora-privacy': page('NEVORA privacy policy', 'NEVORA', '', [], { kind: 'policy', slug: 'privacy' }),
  '/pages/nevora-terms': page('NEVORA terms of use', 'NEVORA', '', [], { kind: 'policy', slug: 'terms' }),
  '/pages/nevora-account-deletion': page('Delete your NEVORA account', 'NEVORA', '', [], { kind: 'policy', slug: 'account-deletion' }),
  '/pages/security': page('Report a concern privately.', 'Security contact', 'Help us understand a suspected issue without putting people or systems at risk.', [
    { heading: 'Contact', text: 'Write to support@thevelani.com with a first report, and ask us for a secure channel before sending sensitive evidence.' },
    { heading: 'Useful information', text: 'Describe the affected address, what happened and the minimum steps needed to explain the issue. Remove credentials, personal records and unnecessary data from any material you share.' },
    { heading: 'Responsible scope', text: 'Do not access another person’s information, disrupt a service or perform destructive testing. This page does not establish a bounty, a legal safe-harbor promise, a disclosure deadline or a guaranteed response time.' },
  ], { legal: true, name: 'Security' }),
};
for (const route of Object.values(routes)) if (route.kind === 'policy') route.intro = POLICY_DOCS.find(doc => doc.slug === route.slug).summary;

