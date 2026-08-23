---
name: testing-projectway
description: How to run and manually test the Project Way unified education dashboard (Vite frontend + Express/Mongo backend), including a MongoDB-free local setup and seeding teacher/student data.
---

# Testing Project Way locally

## Services
- Frontend (Vite): `npm install && npm run dev` at repo root → http://localhost:3000
- Backend (Express): `cd backend && npm install && npm start` → http://localhost:4000
  (`backend/node_modules` is usually NOT committed/installed; install it separately.)
- Frontend hardcodes `http://localhost:4000` as API base (e.g. `teacher-panel/api/teacherPanelApi.js`),
  so the backend must run on port 4000. Without it, the dashboard shows "All caught up!" and no ideas.

## MongoDB when no mongod is installed
`backend/.env` points at `mongodb://127.0.0.1:27017/projectway-student-panel`. If no local
MongoDB exists, run an in-memory one on port 27017:

```
cd backend && npm install mongodb-memory-server --no-save
# start-with-memdb.js:
#   import { MongoMemoryServer } from 'mongodb-memory-server';
#   const mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
#   await import('./server.js');
node start-with-memdb.js
```
Data is lost on restart, so re-seed after each start. Check `curl localhost:4000/api/health`.

## Logging in
Login page (`/`) requires Name, Email, Password and a Role dropdown. Backend `authController.login`
looks up the user **by email** and requires the role to match; password is only verified for `admin`
or when the user document has a password. So a teacher/student user created without a password can
log in with any password string.

Seed a teacher + pending ideas with a small script connecting to the same URI:
- `User.create({ name, email, role: 'teacher' })`
- `StudentIdea.create({ title, projectName, session, leader:{name}, shortDescription,
  fullDescription, team:[{name}], groupId, status: 'Pending' })`

Then log in as that email with role Teacher → redirected to `/teacher/dashboard`, where pending
ideas appear in a table and the right-hand detail panel exposes the Feedback textarea, Send,
Reject and Accept controls. The dashboard polls every 2s, so seeded data appears without reload.

## Verifying backend effects
Teacher actions surface as `window.alert` dialogs ("Feedback sent to student!",
"Idea accepted/rejected successfully!"). To confirm persistence, tail the backend log — the
controllers log e.g. `✅ [Teacher Dashboard] Feedback sent successfully` with the request body.
Note `GET /api/feedback/all` may return an empty list even after a successful send, so prefer
the server log or a direct DB query as evidence.

## Devin Secrets Needed
None — all credentials are local (`backend/.env` contains dev admin creds).
