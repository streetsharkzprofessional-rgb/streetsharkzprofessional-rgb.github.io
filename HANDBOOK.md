# Street Sharkz Professional — owner handbook

This is for Captain Deuce Skywalker and Fin. It is not a public page. The website itself never names outside platforms.

## What you are looking at

A static site. Plain HTML, CSS, and JavaScript. No server code, no build step, no accounts stored in the repo. Open the files, change the words, refresh the browser.

The public pages speak as Street Sharkz only. Prices stay exact. The only result named on the site is Raheem Medley, Victoryline Solar — closed 4, $1,300+ commission. Do not add medical claims, promised returns, or the phrase "lead list." Say qualified prospects and appointment opportunities.

## How the files fit

| File | What it is |
| --- | --- |
| `index.html` | Home. Hero, ticker, Sharkonomicz, Peak Performance, the four doors, the book, the Lead Engine, the Captain, Pirate Radio, Anchor & Arc, contact. |
| `assessment.html` | Free Sharked Up Assessment. Twelve questions, then email, phone, and delivery (Email / Text message / Both). |
| `seller.html` | Seller intake for the free systems diagnostic. |
| `portal.html` | Members Portal. Email, then a 6-digit code, then My App, Leaderboard, Learn, and Back Door. |
| `room.html` | Back Door Terminal. Intel wire, big screen, founders' stack, releases, floor, depth gauge. |
| `404.html` | Missing-page chart. |
| `styles.css` | All of the look: abyss, gold, silver, cyan, type, motion. |
| `main.js` | Motion, videos, pop-ups, forms, portal, and the Back Door. |
| `api.js` | The live engine. The address stays in this file only. |
| `assets/img/` | The official hexagon mark and the Skywalker crest, untouched, plus compressed `.webp` copies beside them. |
| `assets/img/captain/` | Photographs of the Captain. Originals are stored without location data. The strategy portrait used on the pages is a tight crop so the board behind him is not readable. |
| `assets/video/` | App clips, captions, and `manifest.json`. |
| `assets/fonts/` | Cinzel, Inter, and IBM Plex Mono, with their licenses. |

The mark and the crest are used as supplied. Do not redraw them.

## How to preview

From this folder, in a terminal:

```
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080/`.

Use a local server. Opening the HTML files straight from a folder can block the small checks the pages make.

`api.js` is the live engine file. Do not edit it, and do not paste its address into any page. A real code from **Email me my code** opens the desk. The pass stays in session storage. It is never written on the page, and it is not left in the address bar.

Do not merge this into the live branch until you have looked at the preview and said so.

## How to swap the videos

The paid doors and the Peak Performance opener already point at these files:

- `assets/video/app-90days.mp4` — $10 beta, vertical, "90 DAYS. ONE SHARK. ONE PATH."
- `assets/video/app-keep-it-alive.mp4` — $30 bundle, vertical, "KEEP IT ALIVE"
- `assets/video/app-build-your-profile.mp4` — $50 founding, landscape, "BUILD YOUR PROFILE"
- `assets/video/app-informative.mp4` — opens Peak Performance, landscape, "INFORMATIVE"

Those four files are in `assets/video/` and named in `assets/video/manifest.json`, so the frames play them. The clip stays muted, loops, and plays only while it is on screen. **Sound on** turns audio on for that one clip. Vertical clips sit in the phone frame. The founding clip and the Peak Performance opener are wide.

If you replace a file, keep the same name, or change the name in both the page and `manifest.json`. If the name is not in `manifest.json`, the page keeps the still and does not request the file.

Captions live next to each clip as a `.vtt` file. Replace the text when the real words are locked.

The Back Door plays a founder clip in the frame when `getRoomData` gives a local mp4 path. A news item shows its source bug and title and opens the source in a new tab. There is no embedded player. A private investor pitch is not on this site.

## How the assessment is scored

The twelve questions are written in `assessment.html`. Questions 1 and 2 are qualifiers. Questions 3 through 12 score 0–3 into Hydration, Nutrition, Fitness, Mind, and Economics, two questions each. The page sends `submitAssessment` with `name`, `email`, `phone`, `delivery`, `answers`, and `scores` (`hydration`, `nutrition`, `fitness`, `mind`, `economics`). Leave that shape alone so the report mailer keeps reading it.

The seller intake fields were not in the live engine. `sharkonomicz.html` carries the three packs and the office email for a systems diagnostic. Do not invent a new engine call for that form.

## The engine file

`api.js` is already the live file. Do not replace it unless Fin sends a new one, and do not copy its address into a page.

The pages call only this:

```
PortalAPI.call(name, ...args)
```

It must return a Promise. The names are:

- `sendMyCode(email)`
- `confirmCode(email, code)` → `{ ok, pass, url, tier, seat, name, username }`
- `getLeaderboard(pass)`
- `getResources(pass)`
- `getDrops(pass)`
- `getBoard(pass)`
- `postToBoard(pass, text)`
- `getRoomData(pass)` → `headlines`, `newsVideos`, `videos`, `rotationSlot`
- `submitAssessment(payload)`
- `submitSellerIntake(payload)` until Fin confirms that last name

`confirmCode` may return a `url`. The pages do not print it, link it, or send the browser there. The pass stays in memory and in `sessionStorage`. It is never written onto the page.

`getRoomData` headlines need `headline`, `source`, `time`, and `url`. News items need `kind: "news"`, `title`, `source`, `bug`, and `href`. Optional `thumb` is a local image path. Our clips need `kind: "own"`, `title`, and `src`. Founder clips in `videos` need `title` and `src`.

## Pop-ups

One system, two uses, never stacked.

- **Assessment invite.** On the home page, after 30 seconds or when the pointer leaves the top of the window, once per session. It does not open while a payment link is under the pointer. Buttons: Take the Free Assessment, and Stay Sharked Up.
- **Founding call.** Only from "What is the Back Door?" on the $50 card. It ends on the $50 payment button.

Escape or the dimmed backdrop closes either one. On a phone it sits as a bottom sheet. The crest is at the top. Motion is a 700ms fade and a 12px rise. If the visitor prefers less motion, that becomes a short fade.

## The Back Door screen

The intel wire sticks to the top and does not scroll away. Hover pauses it. A tap pins the full dispatch and its source link. The newest line breathes.

The big screen features `newsVideos[rotationSlot % length]`. A news item shows its frame, a source bug such as `GLOBAL INTEL — BLOOMBERG`, and a title. A tap opens the source in a new tab. There is no embedded player. Our own clips play in the frame. While the terminal stays open, the screen advances on the half hour (at :00 and :30). Founder clips stack underneath.

The depth gauge runs Deckhand 0, Rigger 3, Lookout 7, Bosun 14, Navigator 21, First Mate 30, Captain 45, Apex 66. Surface is at the top. Depth is at the bottom. Those points are also on the home page ladder. If you change them, change both.

## Pointing www.streetsharkz.com later

There is no `CNAME` file yet. Do not add one until you mean to flip the domain.

When you are ready:

1. Add a file named `CNAME` at the root of this repo. Its only line should be `www.streetsharkz.com`.
2. At the registrar, point `www` with a CNAME record to `streetsharkzprofessional-rgb.github.io`.
3. For the bare name `streetsharkz.com`, use the four address records the Pages settings show, or an ALIAS if the registrar has one.
4. Wait for the certificate. The site is already written so the public links assume `https://www.streetsharkz.com/`.

The Pages site publishes from the default branch of this repo after a merge. This preview branch is not that branch until you approve it.

## Still open

- Seller-intake fields were not in the live engine, so there is no intake form. The Lead Engine packs and the office email cover that ask.
- News thumbnails are not files in the repo. The big screen shows the source bug, the title, and a link out until `getRoomData` sends a local thumbnail path.
- A founder clip plays in the frame only when the engine returns a local mp4. Anything else opens as a link. There is no embedded player.
