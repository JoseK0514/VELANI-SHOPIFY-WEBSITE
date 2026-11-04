import { POLICY_DOCS } from './nevora-policies.mjs';
export const company = Object.freeze({
  name: 'Velani',
  operator: 'VELANI LLC',
  email: 'support@thevelani.com',
  phone: '787-925-2000',
  hours: 'Monday to Friday, 8 am to 9 pm ET',
  address: '1654 Calle Tulipan, Suite 100, San Juan, PR 00927',
  domain: 'www.thevelani.com',
});
export const services = [
  { id: 'web-applications', title: 'Websites', img: 'ai-laptop-soft', win: ['tb-home', 'The Tool Box LLC website, built by Velani: equipment rental with job-site delivery and dates', 2000, 1250], cap: 'Tool Box LLC · equipment rental website, designed and built by Velani', side: 'right', text: 'Fast, modern, and built to bring in calls and bookings on every phone.' },
  { id: 'booking', title: 'Booking and loyalty', img: 'ai-phone-soft', phones: [['yavi-book', 'Yavi Barber booking on a phone: the next open times and services with prices'], ['yavi-rewards', 'Yavi Barber rewards card on a phone: ten visits and two rewards']], cap: 'Yavi Barber · booking and rewards app, designed and built by Velani', side: 'left', text: 'Customers book from their phone. Reminders go out. The rewards card fills up.' },
  { id: 'online-stores', title: 'Online stores', img: 'ai-store-soft', win: ['store', 'The Tool Box LLC online store, built by Velani: rental equipment with prices and a Reserve button on each item', 1600, 1000], cap: 'Tool Box LLC · online equipment rental store, built by Velani', side: 'right', text: 'Products, delivery priced by distance, payment. Orders land where your team works.' },
  { id: 'business-systems', title: 'Business tools', img: 'ai-room', cap: 'NEVORA · Velani’s own scheduling, time clock and payroll calculation app', win: ['desk', 'NEVORA on the web, built by Velani: today’s shift, two items to review and a shift swap waiting for an answer', 3600, 2250], side: 'left', text: 'Requests, approvals and records in one place. A dashboard for your day.' },
];
/** name: the short page name used for <title> and og:title ("<name> · Velani"); the title is the H1 tagline. */
const page = (title, eyebrow, intro, sections = [], extra = {}) => ({ title, eyebrow, intro, sections, ...extra });
export const legalUpdated = 'November 2, 2026';
export const routes = {
  '/': page('Brighter work ahead.', 'Velani', 'Velani builds websites, booking systems, online stores and business tools, and makes NEVORA, its own scheduling, time clock and payroll calculation app for shift teams. Free NEVORA demo for 30 days.', [], { kind: 'home', name: 'Velani · Software, websites and custom apps for your business' }),
  '/pages/nevora': page('NEVORA · Scheduling, time clock and payroll calculation for shift teams', 'NEVORA', 'Scheduling, time clock and payroll calculation for shift teams. Owners and managers plan on the web, employees use their phone and everyone clocks in at a shared tablet with a PIN.', [], { kind: 'nevora', nav: 'nevora', name: 'NEVORA' }),
  '/pages/custom-development': page('Software for the work your business needs to do.', 'Custom development', 'Websites, booking systems, online stores and business tools. Built for how your business works.', [], { kind: 'services', nav: 'services', name: 'Custom development' }),
  '/pages/about': page('A software company. Two\u00a0ways to work with us.', 'About Velani', 'We make NEVORA. We build software for businesses.', [
    { heading: 'Products of our own', text: 'We build each product around one specific business workflow. NEVORA, our app for scheduling, time clock and payroll calculation, is available now; businesses get it by quote.' },
    { heading: 'Software for your business', text: 'Custom development starts with the work you need software to support. We define the problem and the scope before making project commitments.' },
    { heading: 'Clarity throughout', text: 'What a product does, what it costs and what a project agreement covers. We write those details down where you can find them.' },
    { heading: 'The company behind the work', text: 'Velani is operated by VELANI LLC. You can reach us at support@thevelani.com or at 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.' },
  ], { nav: 'about', name: 'About' }),
  '/pages/contact': page('Start with the problem.', 'Contact', 'Tell us what needs to work better and who will use it. We reply by email within two business days.', [], { kind: 'contact', nav: 'contact', name: 'Contact' }),
  '/pages/plans': page('Free for 30 days. Then one price per business.', 'Plans', 'Start a free NEVORA demo for your team. On day 30 you continue by quote, export your data, or we delete all of it within 3 days, timecards and pay statements included.', [], { kind: 'plans', nav: 'plans', name: 'Plans' }),
  '/pages/help': page('Here to help.', 'Support', 'Client support, answers about our work, and help for people who use NEVORA.', [
    { heading: 'How does my business get NEVORA?', text: 'NEVORA is offered to businesses by quote, with a free 30-day demo for teams of up to 30 employees. Ask for a quote or start a demo and we will discuss your team’s needs. Employees get their account from their workplace, not from this website.' },
    { heading: 'Does Velani build custom software?', text: 'Yes. Describe the application, internal workflow or integration you need on the contact page.' },
    { heading: 'Can you give me a price or delivery date here?', text: 'Not on the website. We price a project once we agree its scope, and we put fees, milestones and delivery dates in the written project agreement.' },
    { heading: 'Does an inquiry start a contract?', text: 'No. An inquiry starts a conversation. It does not purchase a product or begin paid work.' },
    { heading: 'Where should I send sensitive information?', text: 'Do not send passwords, API keys, payment details or sensitive records through a public form or ordinary email. Ask for an appropriate channel first.' },
    { heading: 'How do I reach client support?', text: 'Client support answers Monday to Friday, 8 am to 9 pm ET. Write to support@thevelani.com, call 787-925-2000, or use the contact page.' },
    { heading: 'How does the free NEVORA demo work?', text: 'A business with up to 30 employees can use NEVORA free for 30 days from setup. No card is needed and nothing is charged. On day 30 you continue by quote, export your data, or we delete all of it within 3 days, timecards and pay statements included. Export first if you need to keep those records. NEVORA calculates pay statements; it does not pay employees or file payroll taxes.' },
  ], { kind: 'faq', nav: 'help', name: 'Support' }),
  '/pages/legal': page('The details matter.', 'Legal and trust', 'The notices for this company website. Product use and paid engagements have their own terms.', [], { kind: 'legal-index', legal: true, name: 'Legal' }),
  '/pages/privacy': page('Privacy, in plain language.', 'Privacy notice', 'How information is handled on this company website and through a project inquiry.', [
    { heading: 'Who operates this website', text: 'Velani is operated by VELANI LLC. Contact support@thevelani.com about privacy, or write to VELANI LLC, 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.' },
    { heading: 'What this website collects', text: 'When you send an inquiry, we receive the name, email address, company, topic and message you enter. This website does not ask you to create an account and does not save your name, email or message to browser storage. Do not include credentials, payment details or sensitive records in a message.' },
    { heading: 'Website platform information', text: 'The website is hosted on Shopify. Shopify and the platform providers it uses may process device, connection, security and storage information to operate the website. Velani has not added advertising or analytics tools to this website.' },
    { heading: 'If you contact us', text: 'An inquiry you send through the form, or an email you write to us, contains your address, your message and any other information you include. We use it to handle the conversation you asked for. An inquiry is not consent to subscribe you to marketing.' },
    { heading: 'The AI assistant', text: 'When the assistant is turned on, a button on each page opens it, and it answers questions about NEVORA and our services. When you use it, our hosting providers in the United States store the messages you send and the replies you receive for up to 30 days (Vercel for the service and Neon for its database). An AI model receives your messages through our AI gateway and generates each reply. Before a conversation starts, Cloudflare Turnstile checks that the request comes from a browser and not from an automated program. Answers can be wrong, and product details may change. The assistant does not ask for passwords, payment details or employee records; do not include them. You can delete a conversation from the assistant at any time. The contact form is separate: we handle an inquiry you send as described above.' },
    { heading: 'Recipients and retention', text: 'Inquiries reach the support@thevelani.com mailbox, where VELANI LLC reads them. We keep an inquiry while we need it for the conversation and any project that follows, unless the law requires us to keep it longer. The NEVORA app has its own retention rules, set out in the NEVORA privacy policy.' },
    { heading: 'Privacy choices and requests', text: 'Open Cookie choices to review the choices this website offers. Write to support@thevelani.com to ask what we hold about you, to correct it or to have it deleted. The law that applies to you sets which rights you have. Before we act on a request, we may ask you to confirm your identity in a way that fits the request.' },
    { heading: 'Product and client data', text: 'This notice concerns the company website. NEVORA workplace records are covered by the NEVORA privacy policy. Client processing, including any controller/processor responsibilities, must be covered by the relevant engagement and data-processing terms.' },
    { heading: 'Changes to this notice', text: 'When we change this notice, we update the date at the top of the page. This notice does not certify compliance with any standard.' },
  ], { legal: true, name: 'Website privacy notice' }),
  '/pages/cookies': page('Your website choices.', 'Cookies and preferences', 'How this website uses storage, and the optional choices you can make.', [
    { heading: 'Necessary platform operation', text: 'Shopify may use storage and technical information to operate the website, protect it from abuse and remember privacy choices. When the AI assistant is turned on and you open it, Cloudflare Turnstile runs a short automated-use check in your browser; it is not used for advertising.' },
    { heading: 'Optional integrations', text: 'Velani has not added advertising or analytics tools to this website. If we add one later, it will follow your choices and applicable opt-out requirements. Allowing a category does not add a tool.' },
    { heading: 'Make or change a choice', text: 'The Cookie choices button opens the available controls. On Shopify, those controls use the Customer Privacy API where Shopify supports it. We record consent only from the choice you make.' },
    { heading: 'When controls are unavailable', text: 'If the platform privacy service cannot be reached, optional tools stay off. Shopify describes its own processing in its notices, and the platform may set its own cookies even though Velani has added no tools.' },
    { heading: 'Withdrawing a choice', text: 'A changed choice applies from then on. It does not erase data that was already processed. Write to support@thevelani.com with a privacy question.' },
  ], { legal: true, cookieAction: true, name: 'Cookies and preferences' }),
  '/pages/website-terms': page('Using the company website.', 'Website terms', 'These terms describe this informational website and its inquiry flow.', [
    { heading: 'Operator and contact', text: 'This website is operated by VELANI LLC. Velani is a brand of VELANI LLC. Contact support@thevelani.com or write to 1654 Calle Tulipan, Suite 100, San Juan, PR 00927.' },
    { heading: 'Information and inquiries', text: 'The website describes software products and custom development. Sending an inquiry does not begin a paid engagement, reserve availability, create a software account or make a purchase.' },
    { heading: 'Use the website lawfully', text: 'Do not attempt unauthorized access, disrupt the website, submit malicious material or misuse another person’s information. Do not send credentials or sensitive personal records through the public inquiry form.' },
    { heading: 'Product availability', text: 'Each product page states its current status. NEVORA is available to businesses by quote. A product page is not a promise of a price, a release date for a feature or a completed capability.' },
    { heading: 'Materials and project rights', text: 'VELANI LLC and its clients each own their own materials, and product names and designs stay with their owners. This website grants no software license or assignment of intellectual property. Who owns deliverables, pre-existing materials and third-party licenses belongs in a client’s written agreement.' },
    { heading: 'Separate agreements', text: 'Paid software access and custom projects have their own written terms. Those terms, not this website, set any liability, refund or intellectual-property commitments. An inquiry does not waive rights you have under the law.' },
    { heading: 'Changes', text: 'When we change these terms, we update the date at the top of the page. Before you accept a paid offer, we give you its commercial terms.' },
  ], { legal: true, name: 'Website terms' }),
  '/pages/software-project-terms': page('Before paid work begins.', 'Software and project terms', 'An inquiry is a starting point. A product or project agreement sets the commitments.', [
    { heading: 'What this website offers', text: 'This website presents Velani’s work and how to contact us. It does not sell a subscription, take payment, ship physical goods or guarantee a demo appointment. NEVORA is available to businesses by quote.' },
    { heading: 'Custom development', text: 'A written engagement defines scope, deliverables, fees, milestones, acceptance, change requests, responsibilities, confidentiality, ownership and licensing, data processing, support and termination. We agree those commitments for the project; a landing page does not set them.' },
    { heading: 'Billing, cancellation and refunds', text: 'These depend on the product or signed engagement and on applicable law. This website has no checkout and sells nothing directly. Before any purchase, we set out the price, renewal, cancellation and refund terms in writing.' },
    { heading: 'Software access and use', text: 'Software access has its own license or service terms, account lifecycle information and product privacy notices; for NEVORA they are the NEVORA terms of use and privacy policy. Using the company website creates no product access.' },
    { heading: 'Client personal information', text: 'When a project requires processing personal information, we and the client agree the roles, purposes, recipients, security, transfer and deletion responsibilities, including a data-processing agreement where one applies.' },
    { heading: 'Support and service commitments', text: 'Support coverage, maintenance, service levels and response expectations belong in the applicable agreement. This website creates no uptime, certification, delivery deadline or support guarantee.' },
  ], { legal: true, name: 'Software and project terms' }),
  '/pages/accessibility': page('A website people can use.', 'Accessibility', 'Our design target is WCAG 2.2 AA. A target is not a completed compliance audit.', [
    { heading: 'What we are building for', text: 'We design the website for readable contrast and text, semantic page structure, keyboard access, visible focus, responsive layouts, descriptive labels and reduced motion.' },
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
    { heading: 'Responsible scope', text: 'Do not access another person’s information, disrupt a service or perform destructive testing. This page does not establish a bounty, a legal safe-harbor promise or a disclosure deadline. We reply to reports by email within two business days.' },
  ], { legal: true, name: 'Security' }),
};
for (const route of Object.values(routes)) if (route.kind === 'policy') route.intro = POLICY_DOCS.find(doc => doc.slug === route.slug).summary;

