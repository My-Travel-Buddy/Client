# My Travel Buddy — Start Here

This folder is the official Version 1.0 project specification.

Use only these files moving forward.

## Final MVP Flow

```text
Guest enters trip information
→ AI generates an itinerary
→ Guest reviews recommendations
→ Guest clicks Save Trip
→ Login or signup
→ Trip is saved
→ User views saved trip
→ User manages activities
→ User manages checklist items
```

## Final Database

The MVP uses four tables:

1. `users`
2. `trips`
3. `activities`
4. `checklist_items`

## Final Relationships

```text
User has many Trips
Trip belongs to User

Trip has many Activities
Activity belongs to Trip

Trip has many Checklist Items
Checklist Item belongs to Trip
```

## Final MVP Features

- Public homepage
- Guest AI itinerary generation
- Authentication
- Save trip after login
- Saved trip dashboard
- Trip CRUD
- Activity CRUD
- Manual activity creation
- Full checklist CRUD
- Loading and error states
- AI response validation
- Production deployment

## Out of Scope

- Maps
- Weather
- Documents
- Collaboration
- Notifications
- Budget analytics
- Visa comparison
- Chatbot editing
- Flight tracking
