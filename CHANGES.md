# Working-Tree Changes — Client

**Folder:** `TTPR/INTERNSHIP PROJECT/capston-3/Client`
**Baseline:** `61e32dd add frontend environment example`
**Scope:** everything currently uncommitted — 64 files staged, plus unstaged
edits to `src/App.css` and `src/pages/Confirmation.jsx`, plus two untracked
additions (`src/styles/`, `src/components/Calendar.md`).

> **Authorship note.** This document was produced by reading `git diff` in this
> folder. The code changes described here were written by you and your
> teammates — I did not author them. Every claim below was checked against the
> actual diff; the **Issues** section is a code-reading review, and none of
> those items were reproduced at runtime. Treat them as leads to confirm, not
> confirmed defects.

---

## Contents

1. [Summary](#summary)
2. [Calendar.jsx](#calendar)
3. [The CSS split](#css)
4. [Save flow rewrite](#save)
5. [App.jsx and routing](#app)
6. [Layout and Navbar](#layout)
7. [Login.jsx](#login)
8. [HomePage.jsx](#home)
9. [Trips.jsx](#trips)
10. [Assets](#assets)
11. [Issues found](#issues)
12. [Suggested commit split](#commits)

---

<a id="summary"></a>
## 1. Summary

| Area | File(s) | Change |
| --- | --- | --- |
| Calendar | `src/components/Calendar.jsx` | one line: container height 700px → 850px |
| Calendar docs | `src/components/Calendar.md` | new, untracked — full component documentation |
| Styling | `src/App.css` → `src/styles/*.css` | 3,029-line stylesheet split into 8 files behind `@import` |
| Save flow | `Confirmation.jsx`, `client.js`, `Login.jsx` | per-item saving moved into a shared `saveItinerary()`; unsaved trips now survive a login detour |
| Routing | `src/App.jsx` | Prettier reformat, `/protected` route added |
| Chrome | `Layout.jsx`, `Navbar.jsx` | `isLoading` removed; username display removed |
| Hero images | `HomePage.jsx` | five hand-listed imports replaced with `import.meta.glob` |
| Robustness | `Trips.jsx` | optional chaining on `date_Range` |
| Assets | `src/assets/**` | 57 image files added, **61 MB** |

**Net source change:** 672 insertions, 351 deletions across the staged set,
before the unstaged CSS split.

---

<a id="calendar"></a>
## 2. `src/components/Calendar.jsx`

Despite the `M` badge, the entire change is **one line**:

```diff
   ref={calendarElement}
   style={{
     width: "100%",
-    height: "700px",
+    height: "850px",
   }}
```

**Why it is needed.** Toast UI Calendar measures its parent element to lay out
the month grid. A `%` or `auto` height collapses the grid to nothing, so the
container must carry an explicit pixel height. 850px gives each month cell
enough room that a day holding three activities does not overflow its box.

Nothing else in the file changed — no logic, no handlers, no API calls.

### `src/components/Calendar.md` (new, untracked)

A full write-up of the component as it stands (678 lines), covering:

- **The two-ref bridge.** Toast UI is an imperative library that owns its own
  DOM, so `calendarElement` holds the node and `calendarInstance` holds the live
  object. Refs, not state — the instance must survive re-renders without
  causing them.
- **`updateMonthTitle`.** The library does not tell React the visible month
  changed, so the label is mirrored out by hand in four places.
- **The `raw` field.** Each calendar event carries the untouched database row in
  Toast UI's passthrough slot, so a click opens the detail modal with the real
  record — no second fetch, no lookup table.
- **`category: "time"`** is Toast UI's event type, unrelated to the app's own
  category field. Same word, two meanings.
- **`end` is start + 1 hour**, hardcoded — the `Activity` model has no duration
  column, so this is an invented default, not data.
- **Reload strategy:** `clear()` then `createEvents()` after every mutation.
  Full rebuild rather than surgical patching, so the calendar cannot drift out
  of sync with the database.
- Seven observations from reading the code, the highest-value being that all
  four fetches hardcode `http://localhost:8080` instead of using
  `src/api/client.js`.

That file is untracked. It needs `git add` to be committed.

---

<a id="css"></a>
## 3. The CSS split — `App.css` → `src/styles/`

The largest change by line count, and it is **unstaged**.

`src/App.css` went from 3,029 lines to 8 lines:

```css
@import "./styles/01-home.css";
@import "./styles/02-theme.css";
@import "./styles/03-trip-details.css";
@import "./styles/04-trip-pages.css";
@import "./styles/05-itinerary.css";
@import "./styles/06-auth.css";
@import "./styles/07-activities.css";
@import "./styles/08-responsive.css";
```

| File | Lines |
| --- | --- |
| `01-home.css` | 382 |
| `02-theme.css` | 253 |
| `03-trip-details.css` | 348 |
| `04-trip-pages.css` | 354 |
| `05-itinerary.css` | 425 |
| `06-auth.css` | 299 |
| `07-activities.css` | 375 |
| `08-responsive.css` | 73 |
| **Total** | **2,509** |

### Verification — nothing was lost

The 3,029 → 2,509 line difference looks alarming, so I checked it rather than
assuming:

| Check | Old `App.css` | New `styles/` | Verdict |
| --- | --- | --- | --- |
| Distinct class names | 437 | 437 | **identical** |
| `@media` blocks | 29 | 29 | **identical** |
| `@keyframes` | 10 | 10 | **identical** |
| Declarations | 1,175 | 1,193 | slightly more |
| Blank lines | 585 | 388 | −197 |

Every class name present in the old file is present in the new files. The line
drop is blank lines and comments; the declaration count going *up* by 18 is
one-line rules being split across lines by the formatter.

**Conclusion: the split is faithful.** No rule was dropped.

**One caveat to be aware of:** `@import` inside a stylesheet is resolved by the
bundler at build time here, so there is no extra network request in production.
Order still matters — `08-responsive.css` must stay last, or its media queries
lose to later rules of equal specificity.

---

<a id="save"></a>
## 4. Save flow rewrite

Three files changed together. This is the most behavioural change in the set.

### `src/api/client.js` — new `saveItinerary()`

```js
export async function saveItinerary(itinerary) {
  if (itinerary.budget < 0) {
    throw new Error("Enter budget as minimum 0");
  }

  const savedTrip = await createTrip({
    destination: itinerary.destination,
    date_Range: [itinerary.startDate, itinerary.endDate],
    budget: itinerary.budget,
  });

  const tripId = savedTrip.id;

  for (const activity of itinerary.activities || []) { /* createActivity */ }
  for (const item of itinerary.checklist || []) { /* createChecklistItem */ }
}
```

The trip → activities → checklist sequence used to live inside `Confirmation`.
Extracting it means **two** callers can now run it: the confirmation page, and
the login page after a redirect.

### `src/pages/Confirmation.jsx`

Staged:

- imports `saveItinerary` from `client.js` and `getMe` from `auth.js`
- calls `await getMe()` first, with the message "Checking authentication…", so a
  logged-out user is caught before any trip is created
- on success: `setSaved(true)`, `await saveItinerary(itinerary)`, then
  `navigate("/trips", { replace: true })`
- on failure: if `error.message === "Authentication required"`, stash the
  itinerary in `sessionStorage` under `pendingItinerary` and go to `/login`

Unstaged: the original inline `createTrip` / `createActivity` /
`createChecklistItem` block is **commented out** rather than deleted — 30 lines
of dead code now sitting above the `saveItinerary()` call that replaced it.

### `src/pages/Login.jsx`

After a successful login it checks for `pendingItinerary`:

```js
const pendingItinerary = sessionStorage.getItem("pendingItinerary");

if (pendingItinerary) {
  const itinerary = JSON.parse(pendingItinerary);
  const savedTrip = await saveItinerary(itinerary);
  sessionStorage.removeItem("pendingItinerary");
  navigate("/trips", { replace: true });
  return;
}
```

**The result:** generate a trip while logged out, hit Save, log in — and the
trip saves itself and drops you on the trips page. The work is no longer lost.
That is a real improvement over the previous behaviour.

Also changed: `redirectTo` default from `'/'` to `'/trips'`.

---

<a id="app"></a>
## 5. `src/App.jsx`

Mostly a **Prettier reformat** — single quotes to double quotes throughout, and
the `isLoading` expression collapsed onto one line. No logic change there.

Two real changes:

1. `ProtectedPage` is now imported.
2. A `/protected` route was added, wrapped in `ProtectedRoute`.

See [Issues](#issues) — both the new route and the `/trips` route need a look.

---

<a id="layout"></a>
## 6. `Layout.jsx` and `Navbar.jsx`

### `Layout.jsx`

- No longer accepts or forwards `isLoading`
- A **second** `authError` block was added above `<main>`, while the original
  one inside `<main>` remains
- Explanatory comments removed
- Trailing newline removed (`\ No newline at end of file`)

### `Navbar.jsx`

- The `isLoading ? null :` guard was removed; the function still *declares*
  `isLoading` in its parameters but no longer uses it
- The username expression was **deleted**, leaving an empty element:

```diff
 <span className='px-2 text-sm'>
-  {user.username || user.name || user.email}
 </span>
```

- A commented-out `/protected` NavLink block was added

---

<a id="login"></a>
## 7. `src/pages/Login.jsx`

Covered in [section 4](#save). Additionally, five `console.log` calls were added
during debugging and are still present, including one that logs the full login
response and one that logs the entire itinerary object.

---

<a id="home"></a>
## 8. `src/pages/HomePage.jsx`

The hero rotation changed from five hand-written imports to a glob:

```js
const HERO_IMAGES = Object.entries(
  import.meta.glob("../assets/travel-auth-backgrounds/desktop-webp/*.webp", {
    eager: true,        // load immediately
    query: "?url",      // give me the browser-ready URL
    import: "default",  // just the default export
  }),
)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, url]) => url);
```

**Why this is better:** dropping a `.webp` into that folder adds it to the
rotation with no code change. The `.sort()` matters — `import.meta.glob` does
not guarantee key order, so sorting by filename is what makes the numbered
prefixes (`01-`, `02-`…) actually control the sequence.

It reads the **WebP** folder, not the PNG one — the right choice: the WebP files
are 50–150 KB each against 2 MB PNGs.

The rest of the file's diff is Prettier reformatting plus a rewritten comment on
the budget field.

---

<a id="trips"></a>
## 9. `src/pages/Trips.jsx`

```diff
-  Start Date: {trip.date_Range[0].value}
+  Start Date: {trip.date_Range[0]?.value}
```

Same for the end date. A trip whose `date_Range` is missing or short now renders
blank instead of crashing the page with "cannot read property of undefined".
Small change, real robustness win.

---

<a id="assets"></a>
## 10. Assets — 57 files, 61 MB

| Folder | Size |
| --- | --- |
| `travel-auth-backgrounds/` | 46 MB |
| `japan/` | 4.3 MB |
| `greece/` | 2.1 MB |
| `cruise/` | 2.0 MB |

The backgrounds folder holds each of 10 photos in **four** variants: desktop
PNG, desktop WebP, mobile PNG, mobile WebP. Only the desktop WebP set is
referenced by `HomePage.jsx`.

The PNGs are 1.6–2.6 MB each; their WebP equivalents are 30–175 KB — a 95%
saving for no visible difference. See [Issues](#issues).

---

<a id="issues"></a>
## 11. Issues found

From reading the diffs. **None were reproduced at runtime** — confirm each
before acting.

### 1. The navbar no longer shows the username — *high*

`Navbar.jsx` renders an empty `<span className='px-2 text-sm'></span>` for a
logged-in user. The name, and its `user.name` / `user.email` fallbacks for Auth0
users, were deleted. The result is a blank gap before "Log out".

```diff
 <span className='px-2 text-sm'>
+  {user.username || user.name || user.email}
 </span>
```

### 2. "Log in / Sign up" will flash on every refresh — *high*

`Layout.jsx` stopped passing `isLoading`, and `Navbar.jsx` dropped the
`isLoading ? null :` guard while still declaring the parameter. On a refresh,
`user` is `null` for the moment it takes `/auth/me` to answer, so a logged-in
user sees the logged-out controls appear and then swap. That guard existed
specifically to prevent this.

### 3. `/trips` no longer receives `user` — *high*

```jsx
<Route path="/trips" element={
  <ProtectedRoute user={user} isLoading={isLoading}>
    <Trips />          {/* ← no user prop */}
  </ProtectedRoute>
} />
```

`Trips` reads `user?.username || user?.name || user?.email || "traveler"`, so
the greeting now always reads **"Welcome back, traveler!"**.

Meanwhile the new `/protected` route renders `<Trips user={user} />` — the
opposite of what was probably intended. `ProtectedPage` is imported but never
used, which is likely a copy-paste that got reversed.

### 4. The budget guard weakened — *high*

```js
if (itinerary.budget < 0) throw new Error("Enter budget as minimum 0");
```

This permits `0`, `""`, `null` and `undefined`. The old check was
`!budget || budget <= 0`, added specifically because an empty budget reached the
database and came back as a generic 500. This reopens that path.

```js
const budget = Number(itinerary.budget);
if (!budget || budget <= 0) throw new Error("Enter a budget above 0");
```

Note also that `saveItinerary` passes `itinerary.budget` **unconverted**, where
the old code passed `Number(budget)`. The form supplies a string.

### 5. Auth detection now matches on message text — *medium*

```js
if (error.message === "Authentication required") { … }
```

`request()` attaches `error.status`, which is exactly what this check should
use. Matching the server's wording means any rephrasing of that message
silently breaks the redirect, and the user loses their itinerary.

```js
if (error.status === 401) { … }
```

### 6. The "saved" popup fires before the save — *medium*

```js
setSaved(true);
setMessage("Saving Trip...");
await saveItinerary(itinerary);
```

`setSaved(true)` runs first, so the confirmation appears while the requests are
still in flight — and if `saveItinerary` throws, the user has already been told
it worked. Move `setSaved(true)` after the `await`.

Also, the `navigate("/trips")` immediately afterwards means the popup is only
visible for an instant, so the two mechanisms are working against each other.

### 7. Debug logging left in — *medium*

Five `console.log` calls in `Login.jsx` and two in `Confirmation.jsx`, including
the full login response and the entire itinerary object.

### 8. 46 MB of unused PNGs — *medium*

Only `desktop-webp/` is referenced. The PNG folders and `mobile-webp/` are dead
weight in the repository, and git stores every version of a binary forever —
this cannot be undone by deleting them later without rewriting history. Worth
deciding **before** this is pushed.

### 9. Commented-out code in `Confirmation.jsx` — *low*

30 lines of the old save block, superseded by `saveItinerary()`. Git history is
the place for old code.

### 10. `authError` renders twice in `Layout.jsx` — *low*

A new block above `<main>` plus the existing one inside it. The same error text
will appear twice.

### 11. `Layout.jsx` has no trailing newline — *low*

`\ No newline at end of file`. Cosmetic, but it makes the next diff of that file
noisier than it needs to be.

---

<a id="commits"></a>
## 12. Suggested commit split

Everything is currently one 64-file lump. Splitting it makes review possible and
makes any of it revertable on its own:

1. **`refactor(css): split App.css into styles/`** — `App.css` + `src/styles/`
   (verified faithful; needs `git add src/styles/`)
2. **`feat(save): save a pending itinerary after login`** — `client.js`,
   `Confirmation.jsx`, `Login.jsx`
3. **`feat(home): rotate hero images from the assets folder`** — `HomePage.jsx`
   + whichever asset folders survive the decision in issue 8
4. **`fix(trips): guard missing date_Range`** — `Trips.jsx`
5. **`style(calendar): raise the calendar to 850px`** + `Calendar.md`
6. **`style: apply prettier`** — the `App.jsx` quote changes, kept separate so
   they do not hide real edits
7. **Layout / Navbar** — hold this one until issues 1–3 are resolved

### Before committing

- [ ] Restore the username in `Navbar.jsx` (issue 1)
- [ ] Restore `isLoading` through `Layout` → `Navbar` (issue 2)
- [ ] Pass `user` to `<Trips />` on `/trips`, and fix `/protected` (issue 3)
- [ ] Restore the budget guard and the `Number()` conversion (issue 4)
- [ ] Switch back to `error.status === 401` (issue 5)
- [ ] Move `setSaved(true)` after the `await` (issue 6)
- [ ] Remove the `console.log` calls (issue 7)
- [ ] Decide on the 46 MB of PNGs **before** pushing (issue 8)
- [ ] Delete the commented-out block (issue 9)
- [ ] Remove the duplicate `authError` (issue 10)
- [ ] `git add src/styles/ src/components/Calendar.md` — both are untracked and
      would otherwise be left behind
