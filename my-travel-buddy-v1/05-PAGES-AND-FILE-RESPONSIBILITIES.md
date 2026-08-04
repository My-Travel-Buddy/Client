# My Travel Buddy — Pages and File Responsibilities

## Frontend Routes

| Route | Access | Page |
|---|---|---|
| `/` | Public | `HomePage.jsx` |
| `/login` | Public | `LoginPage.jsx` |
| `/signup` | Public | `SignupPage.jsx` |
| `/trips` | Protected | `TripsPage.jsx` |
| `/trips/:tripId` | Protected | `TripPage.jsx` |
| `*` | Public | `NotFoundPage.jsx` |

## Frontend Structure

```text
src/
├── api/
│   ├── client.js
│   ├── auth.js
│   ├── trips.js
│   ├── activities.js
│   ├── checklist.js
│   └── ai.js
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── TripCard.jsx
│   ├── ActivityCard.jsx
│   ├── ActivityForm.jsx
│   ├── ChecklistItem.jsx
│   └── ChecklistForm.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── TripsPage.jsx
│   ├── TripPage.jsx
│   └── NotFoundPage.jsx
├── App.jsx
├── main.jsx
├── App.css
└── index.css
```

## Backend Structure

```text
backend/
├── db/
│   ├── index.js
│   └── seed.js
├── middleware/
│   └── requireAuth.js
├── models/
│   ├── index.js
│   ├── user.model.js
│   ├── trip.model.js
│   ├── activity.model.js
│   └── checklistItem.model.js
├── routes/
│   ├── auth.routes.js
│   ├── trips.routes.js
│   ├── activities.routes.js
│   ├── checklist.routes.js
│   └── ai.routes.js
├── services/
│   └── ai.service.js
├── utils/
│   └── validateAiResponse.js
├── app.js
└── package.json
```

## Key Responsibilities

| File | Responsibility |
|---|---|
| `HomePage.jsx` | Guest trip form and AI results |
| `TripsPage.jsx` | Saved trip dashboard |
| `TripPage.jsx` | Trip, activities, and checklist |
| `ActivityForm.jsx` | Create or edit activity |
| `ChecklistForm.jsx` | Create or edit checklist item |
| `ai.routes.js` | Public AI generation |
| `trips.routes.js` | Trip CRUD |
| `activities.routes.js` | Activity CRUD |
| `checklist.routes.js` | Checklist CRUD |
| `ai.service.js` | Prompt and AI provider call |
