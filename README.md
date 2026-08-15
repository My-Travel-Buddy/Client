# My Travel Buddy — Client

The frontend for **My Travel Buddy**, an AI-powered travel planning application.

Users can enter a destination, travel dates, budget, and interests to generate a personalized itinerary. They can review the generated plan, save trips, manage activities and checklist items, view trips on a calendar, and check visa requirements.

## Tech Stack

| Technology         | Purpose                                |
| ------------------ | -------------------------------------- |
| React 19           | Frontend user interface                |
| Vite               | Development and build tool             |
| React Router       | Client-side routing                    |
| CSS / Tailwind CSS | Styling                                |
| Toast UI Calendar  | Trip activity calendar                 |
| React Toastify     | User notifications                     |
| Fetch API          | Communication with the Express backend |
| Auth0              | Social authentication                  |

## Features

* [x] Create a trip using destination, dates, budget, and interests
* [x] Select multiple travel interests
* [x] Generate an AI itinerary
* [x] Review an itinerary before saving
* [x] Save trips
* [x] View saved trips
* [x] View individual trip details
* [x] Add and delete activities
* [x] Manage checklist items
* [x] View activities on a calendar
* [x] Check visa requirements
* [x] Local email/password authentication
* [x] Auth0 social authentication
* [x] Popular destination cards on the Home page

## Getting Started

Install the dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The backend should also be running locally at:

```text
http://localhost:8080
```

## Environment Variables

Example `Client/.env`:

```env
VITE_API_URL=http://localhost:8080

VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
```

### Variables

| Variable               | Purpose                          |
| ---------------------- | -------------------------------- |
| `VITE_API_URL`         | Base URL for the Express backend |
| `VITE_AUTH0_DOMAIN`    | Auth0 tenant domain              |
| `VITE_AUTH0_CLIENT_ID` | Auth0 SPA client ID              |
| `VITE_AUTH0_AUDIENCE`  | Auth0 API audience               |

Vite only exposes environment variables beginning with `VITE_`.

Do not place private API keys or secrets in the frontend `.env` file.

## Frontend Routes

| Path               | Page                             |
| ------------------ | -------------------------------- |
| `/`                | Home / Trip Planner              |
| `/trips/itinerary` | Generated itinerary confirmation |
| `/trips`           | Saved trips                      |
| `/trips/:id`       | Individual trip details          |
| `/login`           | Login                            |
| `/signup`          | Sign up                          |
| `/protected`       | Example protected page           |

## Home Page

The Home page allows users to enter:

* Destination
* Start date
* End date
* Budget
* Interests

Available interests include:

```text
Food
Sightseeing
Culture
Adventure
Shopping
Transportation
Entertainment
Other
```

When the user selects **Generate Itinerary**, the frontend sends the trip information to the backend.

Example:

```json
{
  "destination": "Kyoto, Japan",
  "startDate": "2026-08-15",
  "endDate": "2026-08-20",
  "budget": "1500",
  "interests": [
    "Food",
    "Culture",
    "Sightseeing"
  ]
}
```

The backend sends the request to Gemini and returns the generated itinerary to the frontend.

## API Client

Frontend API requests are handled in:

```text
src/api/client.js
```

The client uses:

```env
VITE_API_URL
```

as the backend base URL.

For local development:

```env
VITE_API_URL=http://localhost:8080
```

Example request flow:

```text
HomePage
   ↓
generateItinerary()
   ↓
src/api/client.js
   ↓
POST /trips/itinerary
   ↓
Express backend
   ↓
Gemini
```

## Project Structure

```text
Client/
├── src/
│   ├── api/
│   │   ├── client.js
│   │   └── auth.js
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Layout.jsx
│   │   ├── Activities.jsx
│   │   ├── Checklist.jsx
│   │   ├── Calendar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── Confirmation.jsx
│   │   ├── Trips.jsx
│   │   ├── TripDetails.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── visa.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── package.json
└── vite.config.js
```

## Styling

The frontend uses:

```text
src/App.css
```

for page and component styling.

Global styling and Tailwind are configured in:

```text
src/index.css
```

The Home page includes:

* Hero image
* Trip planning form
* Interest selection buttons
* Generate Itinerary button
* Popular destination cards

## Calendar

Trip activities can be displayed using **Toast UI Calendar**.

The calendar uses activity dates returned by the backend and organizes saved trip activities by date.

## Authentication

The frontend supports two authentication methods:

* Email and password
* Auth0 social login

Protected pages verify that the user is authenticated before displaying private trip information.

## Available Scripts

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Build

Create the production build with:

```bash
npm run build
```

Vite generates the production files inside:

```text
dist/
```

## Troubleshooting

### Frontend starts on port 5174

The application should normally run on:

```text
http://localhost:5173
```

If Vite starts on another port, another process may already be using port 5173.

Stop that process and restart:

```bash
npm run dev
```

### `Failed to fetch`

Verify that the backend is running:

```text
http://localhost:8080
```

Also verify:

```env
VITE_API_URL=http://localhost:8080
```

### Vite dependency error

If you see a Vite dependency/cache error, stop the frontend and run:

```bash
rm -rf node_modules/.vite
npm run dev -- --force
```

Also make sure React files do not contain imports such as:

```js
import { preview } from "vite";
```

Vite should not be imported directly into React page components.

### Generated itinerary disappears after refresh

The `/trips/itinerary` page currently receives the generated itinerary through React Router state.

Refreshing that page clears the router state, so generate the itinerary again from the Home page.

## Backend

The frontend communicates with the separate **My Travel Buddy Server** repository.

The backend handles:

* PostgreSQL database access
* User authentication
* Gemini itinerary generation
* Trip persistence
* Activities
* Checklist items
* Visa requirements

Local backend URL:

```text
http://localhost:8080
```

## Team

| Name              | Focus              |
| ----------------- | ------------------ |
| *Add team member* | *Add contribution* |
| *Add team member* | *Add contribution* |
