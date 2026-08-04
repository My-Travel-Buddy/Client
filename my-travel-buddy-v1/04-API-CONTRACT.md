# My Travel Buddy — API Contract

Base path:

```text
/api
```

## Authentication

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create account |
| POST | `/api/auth/login` | Public | Log in |
| GET | `/api/auth/session` | Public | Check session |
| POST | `/api/auth/logout` | Public | Log out |

## AI

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/ai/itinerary` | Public | Generate itinerary suggestions |

The AI route never saves data.

## Trips

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/trips` | Protected | Get current user's trips |
| GET | `/api/trips/:tripId` | Protected | Get one owned trip |
| POST | `/api/trips` | Protected | Create trip |
| PATCH | `/api/trips/:tripId` | Protected | Update trip |
| DELETE | `/api/trips/:tripId` | Protected | Delete trip |

## Activities

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/trips/:tripId/activities` | Protected | Get trip activities |
| GET | `/api/trips/:tripId/activities/:activityId` | Protected | Get one activity |
| POST | `/api/trips/:tripId/activities` | Protected | Create activity |
| PATCH | `/api/trips/:tripId/activities/:activityId` | Protected | Update activity |
| DELETE | `/api/trips/:tripId/activities/:activityId` | Protected | Delete activity |

## Checklist

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/trips/:tripId/checklist` | Protected | Get checklist items |
| GET | `/api/trips/:tripId/checklist/:itemId` | Protected | Get one item |
| POST | `/api/trips/:tripId/checklist` | Protected | Create item |
| PATCH | `/api/trips/:tripId/checklist/:itemId` | Protected | Update item |
| DELETE | `/api/trips/:tripId/checklist/:itemId` | Protected | Delete item |

## Ownership Rule

Every protected nested resource request must first confirm that the trip belongs to the authenticated user.

## Standard Errors

| Status | Meaning |
|---|---|
| 400 | Invalid input |
| 401 | Not logged in |
| 404 | Owned resource not found |
| 409 | Duplicate email |
| 500 | Unexpected server error |
| 502 | AI provider failure |
