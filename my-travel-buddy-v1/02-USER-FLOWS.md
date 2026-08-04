# My Travel Buddy — User Flows

## Guest Generation Flow

```text
Open homepage
→ Enter destination, dates, budget, and interests
→ Click Generate
→ Frontend sends data to public AI route
→ Backend returns structured itinerary
→ Frontend displays recommendations
→ Temporary draft is stored in sessionStorage
```

## Save After Login Flow

```text
Guest clicks Save Trip
→ Redirect to login or signup
→ User authenticates
→ Frontend reads temporary draft
→ Frontend creates trip
→ Frontend saves selected activities
→ Frontend creates generated checklist items
→ Frontend clears sessionStorage
→ Redirect to saved trip
```

## Returning User Flow

```text
Login
→ Open dashboard
→ View saved trips
→ Open one trip
→ Manage activities
→ Manage checklist
```

## Activity Flow

```text
View activities
→ Add AI or manual activity
→ Edit activity
→ Delete activity
```

## Checklist Flow

```text
View checklist
→ Add item
→ Edit item
→ Mark complete or incomplete
→ Delete item
```

## AI Failure Flow

```text
Generate request fails
→ Show clear error
→ Keep form values
→ Allow retry
→ Do not save malformed data
```
