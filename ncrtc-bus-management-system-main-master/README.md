# NCRTC Bus Management System — Backend

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Create all database tables
npx prisma migrate dev --name init

# 4. Seed with demo data
npm run seed

# 5. Start backend
npm run dev

# 6. (Optional) Start fake GPS simulator in a new terminal
npm run tick
```

Backend runs at: **http://localhost:3000**

---

## Demo Credentials (password for all: `password`)

| Username   | Role              | Access          |
|------------|-------------------|-----------------|
| admin1     | admin             | Everything      |
| operator1  | control_operator  | Everything      |
| manager1   | depot_manager     | Noida depot only|
| manager2   | depot_manager     | Anand Vihar only|
| driver1    | driver            | Own data only   |
| driver2    | driver            | Own data only   |
| exec1      | executive         | Read only       |

---

## API Endpoints

### Auth
```
POST /auth/login          { username, password }
GET  /auth/me             (protected)
```

### AVLS (Live Map)
```
GET  /avls/live                        Live positions of all active vehicles
GET  /avls/vehicles                    Vehicle list for dropdown
GET  /avls/history/:vehicleId?date=    Full day GPS trail
GET  /avls/vehicle/:vehicleId/recent   Last 30 min pings
POST /avls/ping                        Insert GPS ping (tick.js uses this)
```

### Duties (Scheduling)
```
GET   /duties?date=              Roster for a date
GET   /duties/my                 Driver's own duty today
GET   /duties/drivers            Drivers list for dropdown
GET   /duties/routes             Routes list for dropdown
POST  /duties                    Create duty
PATCH /duties/:id/publish        Publish duty
PATCH /duties/:id/acknowledge    Driver acknowledges
```

### Incidents (IMS)
```
GET   /incidents?status=&severity=   Filtered incident list
GET   /incidents/:id                 Incident detail + timeline
POST  /incidents                     Raise incident
POST  /incidents/panic               Driver panic button (P1)
PATCH /incidents/:id/status          Update status (with note)
PATCH /incidents/:id/assign          Assign to user
```

### Notices (CMS)
```
GET  /notices                Notices with isRead flag
GET  /notices/:id            Single notice
POST /notices                Create notice (admin only)
POST /notices/:id/read       Mark as read
GET  /notices/:id/receipts   Read receipts (admin only)
```

### Vehicles
```
GET   /vehicles/depots     All depots list
GET   /vehicles            Vehicle list
POST  /vehicles            Create vehicle (admin)
PATCH /vehicles/:id        Update vehicle status
```

---

## Useful Commands

```bash
npm run dev      # Start with auto-reload
npm run seed     # Re-seed database (clears + refills)
npm run tick     # Start fake GPS simulator
npm run studio   # Open Prisma Studio (visual DB browser)
```

---

## .env Setup

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ncrtc"
JWT_SECRET=your_secret_here
PORT=3000
```
