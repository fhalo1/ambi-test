# C4 Architecture Diagrams — Ambi Full Stack

## Level 1: System Context

```mermaid
C4Context
  title System Context — Ambi Study Spot App

  Person(user, "Student", "Finds, saves, and ranks study cafes")

  System(ambi, "Ambi Web App", "React SPA + Node.js API")
  System_Ext(db, "PostgreSQL", "Hosted on Render (or Neon)")
  System_Ext(vercel, "Vercel CDN", "Serves the React frontend")
  System_Ext(render, "Render", "Hosts the Node.js backend")

  Rel(user,   ambi,   "Uses browser", "HTTPS")
  Rel(ambi,   db,     "Reads/writes data", "SQL over TLS")
  Rel(vercel, user,   "Delivers static files")
  Rel(render, db,     "Connects via DATABASE_URL")
```

## Level 2: Container Diagram

```mermaid
C4Container
  title Container Diagram — Ambi

  Person(user, "Student")

  Container(frontend, "React SPA", "Vite + React Router", "Login, Dashboard, Map, Ranker, Stack, My Spots, Settings")
  Container(backend,  "Node.js API", "Express.js", "REST API: auth, spots, saved spots, user profile")
  ContainerDb(db, "PostgreSQL", "Relational DB", "users, spots, saved_spots tables")

  Rel(user,     frontend, "Opens in browser", "HTTPS")
  Rel(frontend, backend,  "Calls REST endpoints", "HTTPS / JSON + JWT")
  Rel(backend,  db,       "Queries and writes", "pg driver / SQL")
```

## Level 3: Component Diagram — Backend

```mermaid
C4Component
  title Component Diagram — Node.js Backend

  Container_Boundary(api, "Express API") {
    Component(server,    "server.js",        "Entry point", "Registers middleware + routes, calls initDB()")
    Component(authMW,    "middleware/auth.js","JWT Guard",   "Validates Bearer token on protected routes")
    Component(authRoute, "routes/auth.js",   "Auth Router", "POST /register, POST /login → bcrypt + JWT")
    Component(spotsRoute,"routes/spots.js",  "Spots Router","GET/POST/PUT/DELETE /spots — full CRUD + image upload")
    Component(savedRoute,"routes/saved.js",  "Saved Router","GET/POST/DELETE /saved — user's personal stack")
    Component(userRoute, "routes/users.js",  "User Router", "GET/PUT /users/me — profile read & update")
    Component(db,        "db.js",            "DB Module",   "pg Pool + initDB() — creates tables & seeds spots")
  }

  ContainerDb(postgres, "PostgreSQL", "", "users · spots · saved_spots")

  Rel(server,     authMW,    "Uses on protected routes")
  Rel(server,     authRoute, "Mounts at /api/auth")
  Rel(server,     spotsRoute,"Mounts at /api/spots")
  Rel(server,     savedRoute,"Mounts at /api/saved")
  Rel(server,     userRoute, "Mounts at /api/users")
  Rel(authRoute,  db,        "INSERT / SELECT users")
  Rel(spotsRoute, db,        "CRUD on spots table")
  Rel(savedRoute, db,        "CRUD on saved_spots table")
  Rel(userRoute,  db,        "SELECT / UPDATE users")
  Rel(db,         postgres,  "pg Pool connections")
```

## Level 3: Component Diagram — Frontend

```mermaid
C4Component
  title Component Diagram — React Frontend

  Container_Boundary(spa, "React SPA") {
    Component(app,      "App.jsx",             "Router Root",    "BrowserRouter, protected layout, route tree")
    Component(ctx,      "AppContext.jsx",       "Global State",   "user, savedSpots, login(), logout(), saveSpot()")
    Component(api,      "api.js",               "API Layer",      "All fetch() calls; attaches JWT; handles errors")
    Component(login,    "pages/Login.jsx",      "Login/Register", "Email + password form; calls apiLogin / apiRegister")
    Component(dash,     "pages/Dashboard.jsx",  "Discovery",      "Spot grid with search + noise filter; calls apiGetSpots")
    Component(map,      "pages/MapView.jsx",    "Map View",       "Pin map; click-to-popup with spot details + save")
    Component(ranker,   "pages/Ranker.jsx",     "Ranker",         "Head-to-head comparisons; ranks & adds to stack")
    Component(stack,    "pages/StudyStack.jsx", "My Stack",       "Persisted saved spots; remove + export")
    Component(myspots,  "pages/MySpots.jsx",    "My Spots",       "Submit user spot with image upload; delete own spots")
    Component(settings, "pages/Settings.jsx",   "Settings",       "Profile edit (full_name, university); calls apiUpdateMe")
    Component(sidebar,  "components/Sidebar.jsx","Nav Sidebar",   "NavLinks + logout button")
  }

  Container(backend, "Node.js API", "Express")

  Rel(app,      ctx,      "Wraps with AppProvider")
  Rel(ctx,      api,      "Calls API functions")
  Rel(api,      backend,  "HTTP/S + Bearer JWT")
  Rel(dash,     ctx,      "saveSpot()")
  Rel(map,      ctx,      "saveSpot()")
  Rel(ranker,   ctx,      "saveSpot()")
  Rel(stack,    ctx,      "savedSpots, removeSpot()")
  Rel(login,    ctx,      "login(user, token)")
  Rel(settings, api,      "apiGetMe(), apiUpdateMe()")
  Rel(myspots,  api,      "apiCreateSpot(), apiDeleteSpot()")
```

---

## Database Schema

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    users     │       │    spots     │       │   saved_spots    │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id (PK)      │──┐    │ id (PK)      │──┐    │ id (PK)          │
│ email        │  │    │ name         │  │    │ user_id (FK)     │──► users.id
│ password     │  │    │ location     │  └───►│ spot_id (FK)     │──► spots.id
│ full_name    │  └───►│ created_by   │       │ user_score       │
│ university   │       │ score        │       │ created_at       │
│ created_at   │       │ noise        │       └──────────────────┘
└──────────────┘       │ wifi         │
                       │ parking      │
                       │ image_url    │
                       │ lat / lng    │
                       │ is_default   │
                       │ created_at   │
                       └──────────────┘
```
