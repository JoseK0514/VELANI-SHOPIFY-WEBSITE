# Rondo answer card (November 21, 2026)

Found while taking full-page screenshots of the local preview: on the NEVORA and Rondo pages (English and Spanish), Rondo's
sample answer and the Approve buttons had no styles. Their rules (`.c-a`, `.c-who`, `.rm-badge`, `.src`, `.prep`, `.ok`)
lived only in `home.css`, which those pages don't load; the approved mockups carried them on each page. They now live in
`devices.css`, which Home, NEVORA and Rondo all load. The page scripts also built the card title as an `h4` under an `h2`; it is
now `p.prep-t`, as on Home.

`unstyled.cjs` lists, for each page, classes the page uses (after its demos run) that none of its stylesheets define but another
Day stylesheet does. Before the fix it flagged the card on the four pages; after, they read ok. Its other hits are Jose's
hooks styled another way (`client-form`, `t2`, `fill` on Contact and Help, covered by `.ct-card`, `.sent-h`, `.client-side h2`
and `.sent .hb`) and `fade`, an animation hook from the legal markup that has no style on Day.
