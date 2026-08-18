# `Calendar.jsx` — TripCalendar component

Documentation of the calendar component as it currently stands (678 lines).

> **Scope note.** This describes code **you** wrote — I did not author it. It was
> produced by reading `Calendar.jsx`, `Server/routes/activities.js`, and
> `Server/models/Activity.js`. The "Observations" section at the end is a
> code-reading review; none of those items were reproduced at runtime, so treat
> them as leads to confirm, not confirmed defects.

---

## Purpose

Renders a month-view calendar of a trip's activities and provides the full
create / read / update / delete cycle against the backend, all inside one
component.

```jsx
<TripCalendar tripId={trip.id} />
```

**Props**

| Prop     | Type             | Required | Purpose                                     |
| -------- | ---------------- | -------- | ------------------------------------------- |
| `tripId` | number \| string | yes      | Which trip's activities to load and mutate. |

**Dependency:** `@toast-ui/calendar` — an imperative, non-React library. It owns
its own DOM subtree and is driven through a instance handle rather than props.
That single fact explains most of the component's structure.

---

## Architecture: bridging an imperative library into React

Toast UI Calendar is not a React component. It mounts itself into a plain DOM
node and is then commanded through method calls. The component bridges the two
worlds with **two refs**:

```js
const calendarElement  = useRef(null);  // the DOM node Toast UI renders into
const calendarInstance = useRef(null);  // the live Calendar object we command
```

Refs are the correct choice here, not state. The calendar instance must survive
re-renders without triggering them, and it is never *rendered* — it is
*commanded* (`.createEvents()`, `.setDate()`, `.prev()`, `.next()`, `.clear()`).
Putting it in `useState` would cause render loops and needless work.

Because the library is imperative, one piece of its state is mirrored back into
React by hand:

```js
const updateMonthTitle = (calendar) => {
  const tuiDate = calendar.getDate();
  const date    = tuiDate.toDate();   // Toast UI returns its own date wrapper
  setCurrentMonth(date.toLocaleDateString("en-US", { month: "long", year: "numeric" }));
};
```

`getDate()` returns a **TZDate**, Toast UI's own wrapper type — hence the
`.toDate()` call to reach a real JavaScript `Date`. `updateMonthTitle` must be
invoked manually after **every** navigation, because the library does not notify
React that the visible month changed. It is called in four places: on creation,
after loading activities, and in each of the two month-navigation handlers.

---

## Lifecycle

### Effect 1 — create the calendar (runs once, `[]`)

```js
const calendar = new Calendar(calendarElement.current, {
  defaultView: "month",
  usageStatistics: false,       // opt out of the library's analytics ping
  calendars: calendars,
  month: { startDayOfWeek: 0, isAlways6Weeks: false },
});
```

- `usageStatistics: false` disables Toast UI's phone-home telemetry. Worth
  keeping.
- `isAlways6Weeks: false` lets the grid shrink to 5 rows for shorter months
  rather than always padding to 6.
- `startDayOfWeek: 0` — weeks start Sunday.

Two library events are then subscribed:

| Event            | Fires when                       | Handler does                                                       |
| ---------------- | -------------------------------- | ------------------------------------------------------------------ |
| `clickEvent`     | an existing activity is clicked  | reads `event.event.raw` → opens the **detail** modal                |
| `selectDateTime` | empty calendar space is selected | prefills `activityForm.dateTime` → opens the **add** modal          |

The cleanup function is present and correct:

```js
return () => {
  calendar.destroy();
  calendarInstance.current = null;
};
```

Without `destroy()` the library leaks DOM nodes and listeners on every unmount —
and under React StrictMode, which mounts every component twice in development,
you would get two overlapping calendars. This is the single most important line
in the effect.

### Effect 2 — load activities (runs on `[tripId]`)

Guarded with `if (tripId)` so it does not fire before the parent has resolved the
trip. Effect 1 is declared first, so on mount the instance already exists by the
time this runs.

---

## The `raw` field — how a click finds its data

This is the component's key data-flow trick. When activities are shaped into
calendar events, the original database record is stashed on the event:

```js
{
  id: String(activity.id),
  calendarId: "1",
  title: activity.title,
  category: "time",
  start: activity.dateTime,
  end:   new Date(new Date(activity.dateTime).getTime() + 60 * 60 * 1000),
  body:  activity.notes || "",
  raw:   activity,          // ← the untouched DB row rides along
}
```

`raw` is Toast UI's designated passthrough slot: the library stores it, never
interprets it, and hands it back on `clickEvent`. So the detail modal gets the
real record — `estimatedCost`, `notes`, the true `id` — without a second fetch
or a client-side lookup table.

Two other details in this mapping:

- **`category: "time"`** is Toast UI's *event* category (`time` / `allday` /
  `milestone`), and is unrelated to the app's own `category` field
  (`Food`, `Culture`, …). Same word, two different meanings — a genuine
  readability trap when returning to this file.
- **`end` is hardcoded to start + 1 hour.** The `Activity` model has no duration
  column, but Toast UI requires an end time to place a block. One hour is an
  invented default, not data.

Activities without a `dateTime` are filtered out entirely — they cannot be
placed on a calendar.

---

## Reload strategy

Every mutation ends with `await getActivities()`, which does:

```js
calendarInstance.current.clear();          // wipe every event
calendarInstance.current.createEvents(formattedEvents);   // rebuild from server
```

Full teardown and rebuild rather than surgical patching. For a trip-sized set of
activities this is the right trade: it costs almost nothing and it guarantees the
calendar always mirrors the database, with no chance of local state drifting out
of sync after an edit or a failed request.

After loading, the view jumps to the first activity:

```js
calendarInstance.current.setDate(new Date(formattedEvents[0].start));
```

Sensible, because a trip in a future month would otherwise open on today's empty
month. See Observation 3 for the caveat.

---

## State map

| State               | Type          | Role                                                 |
| ------------------- | ------------- | ---------------------------------------------------- |
| `selectedActivity`  | object\|null  | Non-null ⇒ **detail** modal open; holds the DB row.   |
| `showAddActivity`   | boolean       | **Add** modal open.                                   |
| `editActivity`      | boolean       | **Edit** modal open.                                  |
| `activityForm`      | object        | Controlled fields for the add form.                   |
| `editActivityForm`  | object        | Controlled fields for the edit form (carries `id`).   |
| `currentMonth`      | string        | Month label mirrored out of the Toast UI instance.    |

The three modals are mutually exclusive by convention, not by construction —
each handler closes the others by hand. `handleEdit` is the clearest example:

```js
function handleEdit() {
  setEditActivityForm({ id: selectedActivity.id, ...fields });
  setSelectedActivity(null);   // close detail
  setEditActivity(true);       // open edit
}
```

It copies the record into the edit form **before** clearing `selectedActivity`,
which is required — clearing first would null out the source it reads from.

---

## API contract

All calls send `credentials: "include"` so the JWT cookie rides along;
every backend route is behind `requireAuth`.

| Action | Request                                              | Backend behaviour                                    |
| ------ | ---------------------------------------------------- | ---------------------------------------------------- |
| Load   | `GET /trips/:tripId/activities`                      | 404 if the user has no `User_Trip` link              |
| Add    | `POST /trips/:tripId/activities`                     | 404 if no trip, **403** if not the user's trip, 201  |
| Edit   | `PATCH /trips/:tripId/activities/:activityId`        | returns the updated row                              |
| Delete | `DELETE /trips/:tripId/activities/:activityId`       | **204 No Content** — no body to parse                |

Ownership is enforced through the `User_Trip` join table, because an `Activity`
has no `UserId` of its own — it belongs to a `Trip`, and the `Trip` belongs to
the user. Every activity route re-checks that link independently, which is the
correct pattern: authorisation is not inherited from a previous request.

`editActivities` uses the response body to refresh the detail modal:

```js
const updatedActivity = await response.json();
setEditActivity(false);
await getActivities();
setSelectedActivity(updatedActivity);
```

Reopening the detail view on the *server's* version of the record, not the form
values — so any server-side coercion is reflected immediately.

---

## Rendered structure

```
<div>
  ├─ header: [Previous]  {currentMonth}  [Next]
  ├─ <div ref={calendarElement} height 850px />   ← Toast UI's territory
  ├─ {selectedActivity && …}  detail modal
  ├─ {editActivity     && …}  edit modal
  └─ {showAddActivity  && …}  add modal
</div>
```

All three modals are fixed-position overlays at `zIndex: 99999` — high enough to
clear Toast UI's own stacking contexts, which is why the value is so extreme.

---

## Uncommitted change

The `M` badge on this file in the editor is a **one-line** change, staged but not
committed:

```diff
   ref={calendarElement}
   style={{
     width: "100%",
-    height: "700px",
+    height: "850px",
   }}
```

The calendar container needs an explicit pixel height — Toast UI measures its
parent to lay out the grid, and a `%` or `auto` height collapses it. 850px gives
month cells enough room that a day with three activities does not overflow.

That is the entire diff against `HEAD`. Everything else in this document is
already committed history.

---

## Observations

From reading the code. **None were reproduced at runtime** — verify before
acting on any of them.

**1. Hardcoded API URLs bypass the shared client.**
All four fetches hardcode `http://localhost:8080`, while `src/api/client.js`
exists and reads `import.meta.env.VITE_API_URL`. Given `vercel.json` in the
repo, a deployed build would call `localhost` from the visitor's browser and
fail. Routing these through the existing helper would also fix the duplicated
headers and error handling. Highest-value item here.

**2. `toISOString()` shifts the prefilled time by your UTC offset.**
```js
dateTime: date.toISOString().slice(0, 16)
```
`toISOString()` converts to **UTC**, but `<input type="datetime-local">` expects
**local** time. Clicking an empty 9:00 AM slot outside UTC prefills a different
hour. A local-time formatter is needed instead.

**3. "First activity" depends on database ordering.**
`formattedEvents[0]` is used to pick the month to jump to, but
`Activity.findAll` in `Server/routes/activities.js` has no `order` clause —
Postgres may return rows in any order. Sorting by `dateTime` (server-side, or
before indexing `[0]`) would make the jump deterministic.

**4. The edit modal's date field may render empty.**
`handleEdit` copies `selectedActivity.dateTime` straight into the form, but that
value is a full ISO string with seconds and a `Z`. `datetime-local` accepts only
`YYYY-MM-DDTHH:mm` and silently shows blank otherwise. The add path slices to 16
chars; the edit path does not.

**5. An empty category produces a confusing failure.**
Both forms allow submitting with `category: ""`, which fails the model's `isIn`
validation. The `POST` route has no `try`/`catch`, so Express 5 forwards the
error to the global handler in `app.js` — which returns the generic
*"Something went wrong on the server"*. The user sees only
`alert("Failed to add activity.")`. Either mark the select `required` or return
the validation message, the way `trips.js` already does for
`SequelizeValidationError`.

**6. Failed loads are invisible.**
`getActivities` catches and logs to the console. If it fails, the user sees an
empty calendar with no indication anything went wrong — indistinguishable from a
trip with no activities.

**7. `alert()` for errors, inline styles throughout.**
Both are inconsistent with the rest of the app, and the three modals are
near-identical blocks of markup — a single `<Modal>` component would remove a
large share of the file's 678 lines.
