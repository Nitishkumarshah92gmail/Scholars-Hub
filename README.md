# StudyShare 📚 — Student Social Media Platform

A modern social media platform for students to share study materials including PDFs, images, YouTube videos, and playlists.

## Tech Stack
- **Frontend:** React.js + Tailwind CSS (Vite)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **File Storage:** Cloudinary
- **Auth:** JWT tokens

---

## Prerequisites

1. **Node.js** (v18+): Download from https://nodejs.org/
2. **MongoDB**: Install locally or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
3. **Cloudinary Account**: Sign up at https://cloudinary.com/ (free tier)

---

## Setup Instructions

### 1. Clone / Navigate to project
```bash
cd studyshare
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Edit the `.env` file with your credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studyshare    # or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:
```bash
npm run dev     # development with auto-reload
# or
npm start       # production
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Project Structure

```
studyshare/
├── backend/
│   ├── config/
│   │   └── cloudinary.js       # Cloudinary + Multer config
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js             # Register, login, me
│   │   ├── posts.js            # CRUD, like, comment, report
│   │   ├── users.js            # Profile, follow, bookmark
│   │   └── notifications.js    # Get & mark read
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx      # Sidebar + bottom nav
│   │   │   ├── PostCard.jsx    # Post display component
│   │   │   └── PostSkeleton.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── Feed.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Bookmarks.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── api.js              # Axios API client
│   │   ├── utils.js            # Helpers, subjects, colors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## Features

### Authentication
- Registration with name, email, password, school, subjects
- JWT-based login with token stored in localStorage
- Protected routes

### 4 Post Types
- **PDF Upload** — Upload PDF files with download button
- **Image Upload** — Single or multiple images
- **YouTube Video** — Paste URL, auto-embed player
- **YouTube Playlist** — Paste playlist URL, auto-embed

### Social Features
- Like / Unlike posts
- Comment on posts
- Bookmark / Save posts
- Follow / Unfollow students
- Notifications (new follower, like, comment)

### Feed & Explore
- Feed shows posts from followed users + trending
- Explore page with subject filters and search
- Infinite scroll pagination

### Design
- Dark / Light mode toggle
- Responsive: sidebar on desktop, bottom nav on mobile
- Color scheme: Navy blue + Yellow accent
- Fonts: Space Grotesk (headings) + Inter (body)
- Loading skeletons
- Subject-colored badges

---

## API Endpoints

| Method | Route                      | Description          |
|--------|----------------------------|----------------------|
| POST   | /api/auth/register         | Register new user    |
| POST   | /api/auth/login            | Login                |
| GET    | /api/auth/me               | Get current user     |
| GET    | /api/posts                 | Feed (paginated)     |
| POST   | /api/posts                 | Create post          |
| GET    | /api/posts/explore         | Explore with filters |
| GET    | /api/posts/:id             | Single post          |
| POST   | /api/posts/:id/like        | Like/unlike          |
| POST   | /api/posts/:id/comment     | Add comment          |
| POST   | /api/posts/:id/report      | Report post          |
| DELETE | /api/posts/:id             | Delete post          |
| GET    | /api/users/:id             | User profile + posts |
| PUT    | /api/users/:id             | Edit profile         |
| POST   | /api/users/:id/follow      | Follow/unfollow      |
| POST   | /api/users/bookmark/:id    | Bookmark/unbookmark  |
| GET    | /api/users/:id/bookmarks   | Get bookmarked posts |
| GET    | /api/notifications         | Get notifications    |
| PUT    | /api/notifications/read    | Mark all read        |
