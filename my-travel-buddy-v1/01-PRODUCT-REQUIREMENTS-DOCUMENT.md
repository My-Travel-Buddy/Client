# My Travel Buddy — Product Requirements Document

## Project Name

**My Travel Buddy**

## Tagline

Plan smarter, personalize every day, and prepare for your trip in one place.

## Problem Statement

Travel planning is often spread across search results, screenshots, notes, and separate applications. Travelers need one place to generate, customize, save, and manage a trip itinerary.

## Target User

A traveler planning an upcoming personal trip who wants a simple and organized planning experience.

## Solution

My Travel Buddy allows users to enter a destination, dates, budget, and interests, then generate AI-powered itinerary recommendations.

Guests can generate and review recommendations without logging in. Authentication is required only when the user wants to save the trip.

## Core Features

- Public trip-planning form
- Guest AI itinerary generation
- Signup, login, session check, and logout
- Save trip after authentication
- Saved trip dashboard
- Trip CRUD
- Activity CRUD
- Manual activity creation
- Full checklist CRUD
- AI error handling

## Stretch Goals

- Maps
- Weather-based packing suggestions
- Documents
- Collaboration
- Budget analytics
- Visa comparison
- Notifications
- Chatbot editing

## Technology Stack

### Core PERN Stack

- PostgreSQL
- Express
- React
- Node.js

### Supporting Technologies

- Sequelize
- React Router
- Vite
- express-session
- bcrypt
- Neon
- Render
- Vercel

### New Capability Beyond PERN

- AI API integration

## Team Roles and Responsibilities

| Role | Primary Responsibility | Deliverables |
|---|---|---|
| Authentication Lead | Accounts, sessions, protected routes | User model, auth routes, login/signup UI |
| Trip Lead | Trip creation and saved trip management | Trip model, trip routes, dashboard |
| Activity and AI Lead | AI generation and activity management | AI service, activity model, activity CRUD |
| Checklist and Integration Lead | Checklist CRUD, integration, deployment | Checklist model/routes/UI, deployment, testing |

### Shared Responsibilities

- Database review
- API contract review
- Pull Request reviews
- Testing
- Documentation
- Demo preparation

## Success Criteria

The MVP is complete when a user can:

1. Visit the homepage without logging in.
2. Enter trip information.
3. Generate an AI itinerary.
4. Sign up or log in.
5. Save the generated trip.
6. View saved trips.
7. Open a trip.
8. Add, edit, and delete activities.
9. Add, edit, complete, and delete checklist items.
10. Refresh and see all saved data persist.

## Demo Pitch

- **Problem:** Travel planning is fragmented.
- **Solution:** One platform generates, saves, and customizes itineraries and preparation tasks.
- **Technical highlight:** Guest AI generation with authenticated relational database saving.
