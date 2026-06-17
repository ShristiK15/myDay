# MyDay — Personal Journaling Web App

A warm, scrapbook-inspired full-stack journaling application with mood tracking, memories timeline, future letters, and monthly/yearly reflections.

## Tech Stack

**Frontend:** React, React Router, Context API, Tailwind CSS, Recharts, Framer Motion  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Multer + Cloudinary

## Project Structure

```
myDay/
├── client/          # React + Vite frontend
├── server/          # Express API
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET
npm install
npm run dev
```

API runs at `http://localhost:5000`

### Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `CLIENT_URL` | Frontend URL for CORS |
| `CLOUDINARY_*` | Optional — image uploads to Cloudinary |
| `GOOGLE_CLIENT_ID` | Optional — Google OAuth |

### Client (`client/.env`)

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Features

- **Auth:** Sign up, sign in, forgot password, remember me, Google login (demo mode without client ID)
- **Dashboard:** Mood chart (week/month/year), calendar with entry dots, streak card, quick stats
- **Write:** Quote of the day, photo upload, mood, reflection prompt, voice journal
- **Entries:** Search, filter by mood/photo/voice, card grid
- **Timeline & Gallery:** Scrapbook memories with masonry layout
- **Future Letters:** Draft, seal, open time capsules
- **Monthly Reflection & Report:** Achievement, lesson, challenge, favorite memory
- **Yearly Review:** Wrapped-style year summary
- **Profile:** Avatar, themes (Parchment, Midnight Ink, Linen Blue), reminders, privacy
- **Settings:** Password, export JSON/PDF, delete account

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/entries/dashboard` | Dashboard data |
| CRUD | `/api/entries` | Journal entries |
| GET | `/api/entries/timeline` | Memories timeline |
| GET | `/api/entries/gallery` | Photo gallery |
| CRUD | `/api/letters` | Future letters |
| GET/POST | `/api/reflections/monthly` | Monthly reflection |
| GET | `/api/reflections/yearly` | Yearly review |

## Notes

- Without Cloudinary configured, uploads are stored locally in `server/uploads/`
- Google login uses a demo flow when `VITE_GOOGLE_CLIENT_ID` is not set
- Web Speech API is used for voice recording in the Write page
