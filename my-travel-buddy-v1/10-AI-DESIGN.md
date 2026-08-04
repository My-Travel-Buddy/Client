# My Travel Buddy — AI Design

## Purpose

The AI service generates structured itinerary recommendations based on trip information.

## Input

- Destination
- Start date
- End date
- Budget level
- Interests

## Architecture

```text
React
→ POST /api/ai/itinerary
→ Express
→ AI service
→ AI provider
→ Validate response
→ Return structured JSON
```

## System Prompt

```text
You are a travel itinerary planning assistant.

Return only valid JSON matching the required schema.
Create realistic activity suggestions organized by travel date.
Respect destination, dates, budget, and interests.
Do not claim that bookings, prices, hours, visa rules, or live conditions are guaranteed.
Do not include markdown.
```

## Expected Response

```json
{
  "days": [
    {
      "date": "2026-10-12",
      "activities": [
        {
          "title": "Senso-ji Temple",
          "category": "Culture",
          "timeOfDay": "Morning",
          "location": "Asakusa",
          "estimatedCost": 5,
          "notes": "Explore the temple and market."
        }
      ]
    }
  ],
  "checklist": [
    {
      "text": "Verify passport validity",
      "category": "Documents",
      "priority": "Essential"
    }
  ]
}
```

## Validation

Reject the response when:

- JSON cannot be parsed
- `days` is missing
- an activity has no title
- activity dates fall outside the trip range
- checklist text is missing
- numeric values are invalid

## Save Rule

AI output is never saved automatically.

```text
Generate
→ Display
→ User approves
→ Save through trip, activity, and checklist routes
```

## Failure Handling

- Return a clear error
- Use status `502` for provider failure
- Keep the user's form data
- Allow retry
- Never expose the API key
