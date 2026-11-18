# Grok prompt v6 — premium GitHub build (Fin delivers to Grok, 2026-11-18: v5 + the Back Door intel wire + global news screen)

Account status (updated 2026-11-18): the GitHub account EXISTS — username streetsharkzprofessional-rgb,
signed up with streetsharkzprofessional@gmail.com (verified live Nov 18, 2026).
Create a PUBLIC repo named exactly: streetsharkzprofessional-rgb.github.io — that is the GitHub Pages home.
(The public site will live at www.streetsharkz.com once the custom domain flips, so the -rgb repo
address stays backstage.) Then paste the prompt below into Grok.

---

You are designing and building a website WITH me and my First Mate (my AI agent, Fin). I am Deuce Skywalker, founder of Street Sharkz Professional Corporation. Fin handles deployment, link verification, and brand-law review. You handle design and code. Work in this order: (1) present a design concept + sitemap and wait for my approval, (2) then build the files one at a time, complete and final, no placeholders.

THE JOB
Build the most premium version of streetsharkz.com as a static site for GitHub Pages (plain HTML/CSS/JS — no build step, no framework, no server). This site is the first impression for my whole company. It must look expensive, feel alive and interactive, and communicate my rebrand in the first five seconds. It will be served at www.streetsharkz.com with the same paths as today: / and /assessment.

WHITE-LABEL LAW (Captain's order, 2026-11-18 — no exceptions)
Every interface a visitor ever sees carries ONLY Street Sharkz Professional branding. No GitHub,
Grok, Google, Stripe, or any other platform's name, logo, badge, footer, or "powered by" line
anywhere on any page. No platform watermarks on media. All videos and images are self-hosted
files inside this repo (no YouTube/Vimeo embeds for the app ads — embeds leak another brand's
player chrome). The only outside services a page may load are Google Fonts. If a design element
would normally credit a platform, redesign it in our brand instead.

VIDEO ABOVE THE BUTTON (Captain's order, 2026-11-18)
The app sells itself on screen: in CHOOSE YOUR DEPTH, every paid door carries its app video
DIRECTLY ABOVE its payment button, inside the same card — video first, price line, then the
button. Fin supplies the finished mp4s (real app footage, SS logo end card already on them);
reference them exactly as:
- $10 Beta card -> assets/video/app-90days.mp4 (vertical 720x1280, 30s, "90 DAYS. ONE SHARK. ONE PATH.")
- $30 Bundle card -> assets/video/app-keep-it-alive.mp4 (vertical 720x1280, 30s, "KEEP IT ALIVE")
- $50 Founding card -> assets/video/app-build-your-profile.mp4 (landscape 1280x720, 62s, "BUILD YOUR PROFILE")
- PEAK PERFORMANCE section opens with assets/video/app-informative.mp4 (landscape 1280x720, 59s,
  "INFORMATIVE") as its big screen, above the pillar tiles.
Video behavior: muted, loop, playsinline, autoplay only when scrolled into view (pause when out
of view), poster frame first so nothing flashes black, gold hairline frame, rounded corners,
a small "SOUND ON" tap toggles audio. Vertical videos sit in a phone-shaped frame. NEVER use
the investor-pitch video on this public site — it does not exist as far as these pages are
concerned.

CALMING POP-UPS (Captain's order, 2026-11-18)
Pop-ups enter like still water, never like an alarm: a slow 700ms fade with a gentle 12px rise
and a soft deep-water blur behind them, gold hairline border, crest at the top. One pop-up
system, two uses:
1. THE INVITE — after 30 seconds on the page OR on exit intent (whichever comes first, once per
   session): "Start where every Shark starts — the free Sharked Up Assessment." Buttons:
   "Take the Free Assessment" / "Stay Sharked Up" (dismiss).
2. THE FOUNDING CALL — only when a visitor clicks the Founding card's "What is the Back Door?"
   link: one dignified panel on the 100 founding seats and the Back Door, ending at the $50
   payment button.
Rules: never stack two pop-ups, never cover or delay a payment button a visitor is reaching
for, ESC and backdrop tap both dismiss, the choice is remembered for the session, and with
prefers-reduced-motion the animation becomes a plain short fade. On phones the pop-up is a
bottom sheet with the same calm entry.

THE REBRAND (this is the story the design must tell)
I am rebranding as "Deuce Skywalker, the Man That Will Be Pirate King." Thesis: PIRATE and FINESSE mean NARRATIVE CONTROL — whoever tells the story sets the value. We practice LAWFUL PIRACY: lawfully creating or acquiring wealth-accumulating assets, then privately allocating profitable equity to all parties involved — equitable exchange, everyone eats. The company is Street Sharkz Professional — "helping you navigate financial waters with finesse."

DESIGN SYSTEM
- Palette: abyss navy-black (#050b14 to #0a1622 gradients), royal gold (#c9a227 and bright gold #e8c85a), silver (#c7d0d9), white text, one signal cyan accent (#57c7e3) used sparingly.
- Type: a royal display serif for headlines (Cinzel via Google Fonts), clean sans for body (Inter). Big confident type, generous spacing.
- Brand marks: I will supply two image files — the SS hexagon logo and the silver Skywalker family crest (phoenix). Use them as supplied; never redraw or alter them. Reference them as assets/logo.jpg and assets/crest.png.
- Motion (vanilla JS/CSS only, keep it fast): an animated deep-water hero (canvas bubbles/light rays or CSS waves), a shark fin that cuts across the hero, gold shimmer on the main headline, reveal-on-scroll sections, hover lift on cards, animated counters, a live-looking bottom ticker strip with my headlines. Respect prefers-reduced-motion. Mobile-first, flawless on a phone.
- Feel: Bloomberg-terminal precision meets Apple polish meets pirate royalty. No clip-art, no generic stock photos, no purple gradients, no cartoonish pirate kitsch.

PAGES
1. index.html — sections in this order:
   - HERO: crest + logo, "STREET SHARKZ PROFESSIONAL" headline, line: "Navigating Financial Waters — with Finesse." + "STAY SHARKED UP!!" and two buttons: "Take the Free Assessment" and "Enter the Members Portal".
   - THE CAPTAIN: my introduction (copy below, verbatim where quoted).
   - CHOOSE YOUR DEPTH (the doors, pricing cards, in this order): Free Assessment $0 · Peak Performance™ Beta $10 · Sharked Up Bundle $30 · Founding Member $50 (only 100 seats, glow-in-the-dark bracelet, founders' Back Door). Each card: what you get, price, one button.
   - PEAK PERFORMANCE™: the app — five pillars (Hydration, Nutrition, Fitness, Mind, Economics), 90-day plan, rank ladder Deckhand → Rigger → Lookout → Bosun → Navigator → First Mate → Captain → Apex. Interactive: pillar tiles and a ladder visual.
   - SHARKONOMICZ™ / LEAD ENGINE for businesses: we fix operational revenue leaks with trademarked RPAs (Revenue Producing Actions). For sellers: qualified prospects and appointment opportunities (NEVER call them "lead lists") — packs $50 / $100 / $150. Proof: Raheem Medley, Victoryline Solar — closed 4, $1,300+ commission.
   - PIRATE RADIO: my show with Chalk-Trophies — Mon / Wed / Fri, 7 PM ET. "Pirate or patriot? Same actions, different narratives."
   - THE BOOK: Sharked Up: The Art of Finesse — cover treatment + Amazon button.
   - ANCHOR & ARC: our nonprofit community organization (one dignified section, non-clinical language only).
   - FOOTER: "We are Street Sharkz Professional — helping you navigate financial waters with finesse." + contact: Office@StreetSharkz.com · +1 862-310-0775 · Camden, New Jersey.
2. assessment.html — explains the free Sharked Up Assessment (brief profile → free individual report + market data assets by email), then one big button to the live form (link below). Note under it: your report also shows your strongest and weakest pillars.
3. styles.css and main.js — shared, minified-quality hand code, everything responsive.

EXACT LINKS (use these verbatim; Fin will re-verify before launch)
- Free Assessment page: https://www.streetsharkz.com/assessment (the assessment page's button routes to the live form — Fin wires the final form address at deploy time)
- Members Portal (the ONLY app entry ever linked): https://script.google.com/macros/s/AKfycbyAiXXXiwR7FU2dlsUi0D_e3-vZJEzvI5rw-MXTEO0ls8LkM_TKJmv_hDoYhywEmtjDRA/exec
- Beta $10: https://buy.stripe.com/00waEYfsK99P70466s7kc0l
- Bundle $30: https://buy.stripe.com/4gM14o4O64Tz5W09iE7kc0i
- Founding $50: https://buy.stripe.com/5kQfZi94m85L98camI7kc0k
- Lead Engine seller intake: https://docs.google.com/forms/d/e/1FAIpQLSdiqcHJ6WLnHSWnFiLKzmP2krJH3UOdYVCcNaOnO3QClgGxeg/viewform
- YouTube: https://www.youtube.com/@StreetSharkz
- Book (Amazon): https://www.amazon.com/dp/B0GTK1TNHN

MY WORDS (use verbatim, do not paraphrase or smooth into corporate copy)
- "Salutations, I am Deuce Skywalker."
- "Observe, think, act, log, improve, repeat — this is finesse in practication."
- "Everyone eats, everyone earns their share."
- "Equity is more valuable than gold in the global private market."
- "Pirate, VC, PE, Angel — same actions, slightly different narratives. I'm taking control of mine, & I invite you to join me along the way."
- "Born in Camden, New Jersey. My start was not the easiest or the cleanest — the finish is most important."
- "I am Deuce Skywalker. I will be the king of the pirates — what will you be?"
- "Stay sharked UP"
Captain section copy: founder, systems analyst & engineer; background began in independent contract sales; artist; author of Sharked Up: The Art of Finesse; engineer of the Sharked Up proprietary framework & software. Mission: "give power to those who were never meant to have it but are willing to do what it takes to get there day by day."

THE PORTAL AND THE FORMS MOVE TOO (Captain's order, 2026-11-18)
The Members Portal and both forms leave Google's pages entirely — same white-label law.
You also build, as static pages in this repo:
3. portal.html — the Sharked Up OS gate + member home (email field, "Email me my code",
   then tabs: My App / Leaderboard / Learn / Back Door), and room.html — the Back Door
   Terminal (big private-video screen, headlines wire, releases, founders' Floor,
   leaderboard, bottom ticker). Same design system as the site, one notch more
   terminal: Bloomberg-by-social-app. These pages talk to a data endpoint Fin wires —
   build them against this contract and change NOTHING about what the functions do:
   Data calls: Fin supplies a small file, api.js, exposing PortalAPI.call(fn, ...args)
   returning a Promise. Call it with the engine's real function names:
   sendMyCode(email), confirmCode(email, code) -> {ok, pass, url, tier, seat, name,
   username}, getLeaderboard(pass), getResources(pass), getDrops(pass), getBoard(pass),
   postToBoard(pass, text), getRoomData(pass). The endpoint address lives ONLY inside
   api.js — never write any script.google.com address, or the word Google, anywhere in
   a page. Never print, link, or expose the real app address or any pass value beyond
   handing it to the app on Enter, exactly as the current portal behaves. ROUTE A is
   locked (Captain, 2026-11-18): the engine stays where it is as invisible plumbing;
   only the faces move. Do not design any server component.
4. The Assessment form as a native page on the site (his branding only — no Google
   Forms page anywhere). THE ASSESSMENT IS IN SCOPE BY NAME (Captain, 2026-11-18):
   the same 12 questions and the same contact step as the live form, in the same
   order — email (required), phone number, delivery choice (Email / Text message /
   Both) — and the free-gift copy (a deeper diagnostic of your strongest and weakest
   pillars). On submit it calls PortalAPI.call('submitAssessment', payload) with the
   answers, the pillar scores the page computes exactly as the live form does, and
   the contact step; Fin wires the landing sheet so the report mailer reads it
   unchanged. The Seller Intake form follows the same native pattern as a second
   form page, same fields as live.

BACK DOOR TERMINAL — TWO STANDING ORDERS (Captain, 2026-11-18)
A. THE INTEL WIRE (replaces the old bottom tape): a ticker pinned to the TOP of
   room.html that scrolls down with the reader and NEVER leaves the screen
   (position: sticky). It must feel clandestine — inside information for members
   only: label it "INTEL WIRE — EYES ONLY", monospace type, each item carrying its
   source and time like a field dispatch, thin redaction-bar accents. Interactive:
   hover pauses the scroll; tapping an item pins it open with its headline in full
   and a "read the source" link; a subtle pulse marks the newest item. Items come
   from getRoomData's headlines, exactly as wired today.
B. THE BIG SCREEN IS GLOBAL NOW: the room's large screen no longer features the
   Captain's own videos. It plays GLOBAL FINANCIAL NEWS video — the latest uploads
   from Bloomberg, CNBC and Reuters — supplied by getRoomData as newsVideos with a
   rotationSlot. Feature newsVideos[rotationSlot % newsVideos.length], show a
   source bug on the screen ("GLOBAL INTEL — BLOOMBERG"), the video's title under
   it, and roll to the next video every half hour on the half hour while the page
   is open (the list refreshes daily server-side). The Captain's private founder
   videos stack UNDER the screen as before, from the same getRoomData videos list —
   they are never the big-box feature anymore.

HARD RULES
- Brand/company copy speaks as We & Us. My personal section speaks as I.
- Prices exactly as listed. Never discount, never invent offers, stats, or testimonials — the only proof you may cite is Raheem Medley above.
- NEVER publish: any direct app address (the Members Portal link is the only entry), investor terms or percentages, or the words "lead list". Founding seats: "one of only 100" is the strongest claim allowed.
- No medical, nutritional, fitness, or financial outcome claims for the app. No promised returns anywhere.
- Anchor & Arc: non-clinical language only — never "therapy/treat/heal/diagnose."
- Accessibility + performance: semantic HTML, alt text, keyboard-focus states, Lighthouse-friendly (no external JS libraries except Google Fonts).

HOW WE WORK TOGETHER
- First reply: your design concept (mood, layout, motion) + sitemap + any questions. Wait for my approval.
- After approval: deliver files one at a time, complete, in this order: styles.css, main.js, index.html, assessment.html (with the native form), portal.html, room.html. Name them exactly. Keep a short CHANGELOG at the end of each delivery.
- Fin (my agent) will review every file against these rules, wire the final links, push to my GitHub repo, flip the domain when I say go, and verify the live site. If Fin requests a change, treat it as coming from me.
