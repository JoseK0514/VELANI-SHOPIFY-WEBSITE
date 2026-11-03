# Velani website integration

`velani-assistant.js` is a dependency-free browser ES module. It provides the API lifecycle without imposing a widget design. `example.html` is a manual integration harness, not a production homepage or an already deployed demo.

## Run the harness

Start the backend using the project README, then serve only this directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory integration
```

Open `http://localhost:8080/example.html`. The backend defaults to `http://localhost:3001`; its development allowed origins must include `http://localhost:8080`. Use that exact hostname and port. Opening the HTML with `file://` will not work because the API requires an allowed browser Origin. Do not serve the project root, which can contain local configuration and private artifacts.

For local development with CAPTCHA disabled, leave the verification token empty. In a protected environment, supply a fresh Turnstile token issued on the page's hostname with action `velani-session`. Tokens are single-use: the harness clears the field after each creation attempt. A failed session request can require a fresh token before manual retry. The production widget should obtain tokens through the Turnstile integration, rather than asking visitors to paste them.

The optional demo URL is an installer setting. Set it only after verifying a working demo on `https://thevelani.com` or `https://www.thevelani.com`. Without it, a `show_demo` action opens `/pages/nevora` with the label “Explore Nevora.” The harness does not assume that a `#try` section is a working demo. Contact links use the fixed `/pages/contact?interest=nevora` URL.

## Embed in a Shopify theme

Host the module as a theme asset or another trusted static asset. Instantiate it with the deployed API URL and the visitor's selected language. Allow the exact production storefront origins in the backend configuration. Use HTTPS. If the storefront has a Content Security Policy, allow the API in `connect-src` and the required Turnstile origins. Do not put `DATABASE_URL`, model provider keys, session signing secrets, or the Turnstile secret key in theme code.

```js
import { VelaniAssistant, NOTICES, safeSourceUrl } from './velani-assistant.js';

const assistant = new VelaniAssistant({
  apiBaseUrl: 'https://YOUR-DEPLOYED-API.example',
  locale: 'en', // or 'es'; selected when the session is created
  getCaptchaToken: async () => obtainFreshTurnstileToken(),
});

noticeElement.textContent = NOTICES[assistant.locale];
await assistant.start();

// Run in a user-initiated message submit handler.
const answer = await assistant.chat(messageInput.value);
answerElement.textContent = answer.message;
for (const source of answer.sources) {
  const href = safeSourceUrl(source.url);
  if (!href) continue;
  const link = document.createElement('a');
  link.textContent = source.title;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  sourceList.append(link);
}
```

`obtainFreshTurnstileToken` and the DOM references in that snippet are integration placeholders. Use the full harness for an executable example. Render assistant messages and source titles with `textContent`, never `innerHTML`. Treat every model response as untrusted. The client filters source links to the two exact Velani HTTPS hostnames, rejecting credentials, nonstandard ports and lookalike domains. It does not render Markdown or execute HTML.

An answer contains `message`, `sources`, `action`, `confidence`, and `model`. Present the message and relevant sources; keep model identifiers out of the visitor interface. Actions are display suggestions:

| Action | Website behavior |
| --- | --- |
| `none` | Show the answer. |
| `show_demo` | Offer a verified, explicitly configured demo URL; otherwise offer the Nevora product page. |
| `lead_form` | Offer a button to open the contact form. |
| `human_help` | Offer a link to `/pages/nevora-support` when the answer cites the official support article; otherwise link to `/pages/contact?interest=nevora`. Do not open or submit the lead form. |

An action never authorizes submitting a form, inventing a booking, sending an email, or navigating automatically. A visitor who mentions their email in chat has not consented to creating a lead.

## Save an enquiry only from the contact form

Display an unchecked required consent checkbox alongside the contact fields. Explain that Velani will store the submitted details and contact the visitor about their enquiry, with retention up to 90 days. This is enquiry consent, not subscription to marketing communications. Do not prefill fields using guesses from chat or submit automatically from an assistant action.

```js
// Inside the form's explicit submit handler, after native/custom validation:
if (!consentCheckbox.checked) return;
await assistant.captureLead({
  name: nameInput.value,
  email: emailInput.value,
  company: companyInput.value,  // optional
  teamSize: teamSizeInput.value, // optional string
  locations: locationsInput.value, // optional string
  message: enquiryInput.value, // optional
  consent: true,
  consentVersion: 'lead-v1',
});
```

Success means the enquiry was saved. It does not mean an email was sent, an appointment was booked, or a staff member accepted it. Do not promise a response time the business has not approved.

## Retries and session lifecycle

Each chat or lead submission gets a UUID. The client sends no automatic retries. After a network failure, rate limit, or retryable server error, `failedRequest` exposes its kind, original request ID, retryability and earliest retry time. A user-initiated call to `retryLastRequest()` replays exactly the same payload and request ID. For a failure after the server has saved the result, this allows the backend to return the original result instead of duplicating it.

```js
try {
  await assistant.chat(messageInput.value);
} catch (error) {
  errorElement.textContent = error.message;
  retryButton.hidden = !assistant.failedRequest?.retryable;
  // Disable retry until failedRequest.retryAt, when supplied.
}

// Separate explicit button handler; never an automatic loop:
retryButton.onclick = () => assistant.retryLastRequest();
```

The client permits one request at a time. Resolve a failed request by retrying or calling `discardFailedRequest()` before submitting another. Discarding only forgets the local retry: the first request might already have reached the server. Do not replace a failed lead submission with a newly generated request ID as a retry.

The bearer token lives in a private in-memory field. `assistant.session` exposes only `sessionId` and `expiresAt`; no token is returned through that getter. There is no cookie, localStorage or sessionStorage persistence. Reloading or opening another tab creates a separate session. The backend's default bearer lifetime is 24 hours. An expired session needs a new session, not a replay under a different session identity.

- `start()` explicitly creates the session; `chat()` and `captureLead()` can also lazily create it.
- `deleteSession()` deletes the active chat via the backend, then drops the token locally on success. Submitted enquiries remain separately retained.
- `forgetLocally()` drops this tab's session and pending retry only. It does **not** delete server data. Use it only for an explicitly explained new-session flow.
- If deletion fails, show the failure. Never display “deleted” merely because the browser lost its token.
- A new locale takes a new `VelaniAssistant` instance and session. The harness enables language selection again after successful chat deletion.

Show this notice near the widget before the first message:

> AI assistant. Product details may change. Chat history is retained up to 30 days; submitted enquiries up to 90 days.

The module includes the Spanish equivalent. These are retention upper bounds, separate from the 24-hour bearer lifetime. The website privacy notice must explain the business purpose, model provider processing, retention and the process for requesting deletion of submitted enquiries. The backend retention task must run on a schedule for the notice to remain accurate. Do not ask for passwords, payment card data, employee records or other sensitive operational data in this product-advice chat.

## Manual acceptance checks

1. Connect in English and Spanish; ask a question and a follow-up that relies on the first answer.
2. Verify citations only link to the allowed Velani hosts, and text resembling HTML displays as literal text.
3. Disable the network for a message, then restore it and press “Retry same request.” Confirm the network payload keeps its request ID and the transcript shows one assistant answer.
4. Trigger a rate limit in a test environment; confirm retry stays disabled through `Retry-After` and no background retries occur.
5. Open the enquiry form from an assistant action. Confirm no lead is saved before explicit submission, and an unchecked consent box blocks submission.
6. Submit an enquiry, then simulate a dropped response and retry with the same ID. Confirm only one lead exists.
7. Delete the chat and verify it is inaccessible. Confirm the interface explains that previously submitted enquiries are retained separately.
8. Test an expired session and rejected CAPTCHA. Confirm failures are explained and no false success is shown.
