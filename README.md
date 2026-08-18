# My Travel Buddy — Client

Frontend application for **My Travel Buddy**, an AI-powered travel-planning app.

Users can enter a destination, travel dates, budget, and interests to generate a personalized itinerary. They can review the generated plan, save trips, manage activities and checklist items, view activities in a calendar, and check visa requirements.

## Features

* Create a trip using a destination, dates, budget, and interests
* Select multiple travel interests
* Generate an AI itinerary
* Review an itinerary before saving
* Save and view trips
* View individual trip details
* Add and delete activities
* Manage checklist items
* View activities on a calendar
* Check visa requirements by passport and destination
* Display AI-assisted guidance when verified visa data is temporarily unavailable
* Local email/password authentication
* Auth0 social authentication
* Protected saved-trip pages
* Popular destination cards on the Home page
* Responsive layout for desktop and mobile devices

## Tech Stack

| Technology         | Purpose                                      |
| ------------------ | -------------------------------------------- |
| React 19           | Frontend user interface                      |
| Vite               | Development server and production build tool |
| React Router       | Client-side routing                          |
| CSS / Tailwind CSS | Styling and layout                           |
| Toast UI Calendar  | Trip activity calendar                       |
| React Toastify     | User notifications                           |
| Fetch API          | Communication with the Express backend       |
| Auth0              | Social authentication                        |

## Getting Started

### Prerequisites

* Node.js
* npm
* The [My Travel Buddy Server](https://github.com/My-Travel-Buddy/Server) running locally

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

Create your local environment file:

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

The backend should also be running at:

```text
http://localhost:8080
```

## Environment Variables

Create a `Client/.env` file using `.env.example` as a guide:

```env
VITE_API_URL=http://localhost:8080

VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
```

| Variable               | Purpose                          |
| ---------------------- | -------------------------------- |
| `VITE_API_URL`         | Base URL for the Express backend |
| `VITE_AUTH0_DOMAIN`    | Auth0 tenant domain              |
| `VITE_AUTH0_CLIENT_ID` | Auth0 SPA client ID              |
| `VITE_AUTH0_AUDIENCE`  | Auth0 API audience               |

Vite only exposes browser environment variables that begin with `VITE_`.

> Do not put private API keys, database URLs, or other secrets in the frontend `.env` file.

## Frontend Routes

| Path               | Page                             |
| ------------------ | -------------------------------- |
| `/`                | Home and trip planner            |
| `/trips/itinerary` | Generated itinerary confirmation |
| `/trips`           | Saved trips                      |
| `/trips/:id`       | Individual trip details          |
| `/login`           | Login                            |
| `/signup`          | Sign up                          |

## Home Page

The Home page collects:

* Destination
* Start date
* End date
* Budget
* Travel interests

Available interests include:

```text
Culture & History
Food & Culinary
Nature & Outdoors
Shopping
Cozy Cafes
Art & Architecture
Photography hotspots
Nightlife
```

When the user selects **Generate Dream Plan**, the frontend sends the trip data to the backend.

Example request data:

```json
{
  "destination": "Kyoto, Japan",
  "startDate": "2026-08-15",
  "endDate": "2026-08-20",
  "budget": "1500",
  "interests": [
    "Culture & History",
    "Food & Culinary",
    "Photography hotspots"
  ]
}
```

The backend sends the request to Gemini and returns a structured itinerary with activities and a preparation checklist.

## API Client

Frontend API requests are organized in:

```text
src/api/client.js
```

The client uses `VITE_API_URL` as the backend base URL.

Example itinerary request flow:

```text
HomePage
→ generateItinerary()
→ src/api/client.js
→ POST /trips/itinerary
→ Express backend
→ Gemini
```

The API client also handles trip creation, activities, checklist items, and visa requirement requests.

## Travel Documents

The **Travel Documents** tab allows a user to:

* Choose their passport country
* Choose a destination country
* View visa requirements
* View destination details such as currency, passport validity, phone code, and time zone
* Open a required registration form when one is available
* Find an embassy link when one is provided

When the visa-data service is temporarily unavailable, the app provides clearly labeled AI-assisted guidance and encourages travelers to confirm official entry requirements before departure.

## Project Structure

```text
Client/
├── src/
│   ├── api/
│   │   ├── auth.js
│   │   └── client.js
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Activities.jsx
│   │   ├── ActivityEdit.jsx
│   │   ├── Calendar.jsx
│   │   ├── Checklist.jsx
│   │   ├── Documents.jsx
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── Confirmation.jsx
│   │   ├── HomePage.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── TripDetails.jsx
│   │   └── Trips.jsx
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── package.json
└── vite.config.js
```

## Styling

Most page and component styling is in:

```text
src/App.css
```

Global styles and Tailwind configuration are in:

```text
src/index.css
```

The Home page includes:

* Hero image
* Trip-planning form
* Interest-selection buttons
* Generate Itinerary button
* Popular destination cards

## Calendar

Saved trip activities can be displayed with **Toast UI Calendar**. The calendar organizes activities using the dates returned by the backend.

## Authentication

The application supports:

* Email and password login
* Auth0 social login

Saved trips and individual trip details are protected. Users who are not authenticated are redirected to sign in before accessing private trip information.

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

Vite generates the production files in:

```text
dist/
```

## Troubleshooting

### Frontend starts on a different port

The app normally runs at:

```text
http://localhost:5173
```

If Vite uses another port, port `5173` may already be in use. Stop the existing process and run:

```bash
npm run dev
```

### `Failed to fetch`

Confirm the backend is running at:

```text
http://localhost:8080
```

Also confirm your `.env` contains:

```env
VITE_API_URL=http://localhost:8080
```

### Vite dependency or cache error

Stop the frontend and run:

```bash
rm -rf node_modules/.vite
npm run dev -- --force
```

Also make sure React files do not import Vite directly:

```js
import { preview } from "vite";
```

Vite should not be imported into React page components.

### Generated itinerary is unavailable

The generated itinerary is stored temporarily in browser session storage. It remains available after a page refresh but is cleared when the browser tab is closed. Generate a new itinerary from the Home page if needed.

## Backend

This frontend communicates with the separate [My Travel Buddy Server](https://github.com/My-Travel-Buddy/Server) repository.

The backend handles:

* PostgreSQL database access
* User authentication
* Gemini itinerary generation
* Trip persistence
* Activities
* Checklist items
* Visa requirements
