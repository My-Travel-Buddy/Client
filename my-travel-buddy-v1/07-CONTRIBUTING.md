# Contributing to My Travel Buddy

## Branch Workflow

```bash
git checkout main
git pull origin main
git checkout -b feature/task-name
```

Examples:

- `feature/authentication`
- `feature/trip-routes`
- `feature/activity-crud`
- `feature/checklist-crud`
- `feature/ai-integration`
- `fix/session-cookie`
- `deploy/vercel`

## Commit Workflow

```bash
git status
git add path/to/changed/files
git commit -m "Add clear description"
git push -u origin feature/task-name
```

## Pull Request Rules

Every PR must:

- Be small and focused
- Link an issue with `Closes #N`
- Explain what changed
- Explain how to test it
- Receive one approval
- Pass local testing
- Avoid unrelated files
- Never include `.env`, secrets, or `node_modules`

## Main Rule

`main` must always work.

Nobody pushes directly to `main`.

## Environment Variables

Frontend:

```text
VITE_API_URL
```

Backend:

```text
DATABASE_URL
SESSION_SECRET
AI_API_KEY
CLIENT_URL
```

Never expose private keys in `VITE_` variables.

## Before Merge

```bash
git status
npm run build
```

Run lint when configured.
