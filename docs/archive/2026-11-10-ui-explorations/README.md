# November 10 UI explorations — retained source

Jose requested consolidation into main and removal of all working branches except
development and main on November 12. This archive preserves the additional work
from `claude/velani-home-gusto-20261110` (`044b6d2`) and its descendant
`claude/velani-phase1-system-20261110` (`950919f`). Their complete commits are
also parents/ancestors of the consolidation merge and retained by recovery tags.

The later signature-hero implementation on development supersedes these parallel
November 10 page designs. Its existing application files are retained exactly;
the old typography, paper/teal site-wide override, older pages and assistant rename
are not reapplied over the later combined UI/backend. This is an explicit merge
resolution, not a claim that the two complete designs can both be active.

`source-snapshot.tar.gz` contains the exact 41 added/modified files at the Phase1
head, including both original handoffs, the Fraunces license/font, old CSS/HTML/JS,
the Direction B screenshots, photograph and tests. `snapshot-manifest.json` pins
the full source SHA, common base and SHA256 of every file. The archive was read
back and all41 hashes verified. It is inert documentation and is not included in
the website build. Recover the complete original Gusto version through its commit
or recovery tag if that earlier intermediate design is needed.

Resolution of the additional behavior:

| Earlier change | Current combined implementation |
|---|---|
| Direction B time-clock restyle and registered-tablet strings | Later signature round6 explicitly ported it; current kiosk and shared sample week are preserved. |
| Home tab keyboard support | Replaced by the later shared four-view sample with keyboard behavior and tests. The retired `.nh-tabs` component is not reintroduced. |
| Live field-error clearing and named summary above Send | Already reimplemented in later `public/assets/velani.js` and form render/tests. Keep the current client-hub transport and stale-send guards. |
| Jose/two-business-day request wording, outage help, Plans closing and day30 copy | Later signature rounds7–10 implement these workflow improvements. Current claim discrepancies remain in the Step1 handoff for Claude, rather than importing older policy copy wholesale. |
| Guarded old NEVORA local navigation | Later NEVORA page replaces that navigation/script. Keep the current page and keyboard/sample behavior. |
| Replacing old Products phone screenshot | Later Products page was rebuilt as text/cards without that screenshot, so there is no current image slot to replace. Original image is retained here. |
| Fraunces headings and full paper/teal replacement | Superseded by the later signature design and current production theme; archived with original assets and license. |
| Website assistant rename to Velani | Conflicts with the current backend Rondo identity and recorded Lantern direction; do not expand this rename during source consolidation. |
| Spanish clear-all wording `Borrar todo` | Small optional copy refinement from the old demo, retained for Claude to assess against the current kiosk. No missing backend capability or new page. |

No new customer-facing page is required to consolidate these branches. Spanish
legal pages, language mapping, Relay anchors and no-JavaScript phone navigation
remain the already-recorded Claude-owned work; source consolidation does not
implement or self-close those findings.
