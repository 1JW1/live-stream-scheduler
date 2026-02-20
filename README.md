# Hackney Council Meeting Scheduler and Live Stream Application

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation and Setup](#installation-and-setup)
5. [How to Run the Application](#how-to-run-the-application)
6. [Usage Instructions](#usage-instructions)
7. [License](#license)

---

## Introduction

The **Hackney Council Meeting Scheduler and Live Stream Application** helps councils schedule meetings, manage user roles, and broadcast meetings through a live streaming feature. Built with Node.js and Express, it uses SQLite for persistence and Socket.IO for real-time live chat.

---

## Features

- **User Authentication**: Register and log in with hashed passwords (bcryptjs) and session management.
- **User Roles**: Admins can create and delete meetings; regular users can view and comment.
- **Meeting Scheduling**: Create, view, and delete meetings with optional document uploads.
- **Live Streaming**: HLS video player with real-time Socket.IO chat.
- **Meeting Archive**: Browse past meeting recordings and minutes.
- **CSRF Protection**: All state-changing forms are CSRF-protected.
- **Flash Notifications**: Visual success/error feedback on all actions.

---

## Technologies Used

- **Runtime**: Node.js
- **Backend**: Express.js
- **Template Engine**: EJS (with express-ejs-layouts)
- **Database**: SQLite via Sequelize ORM
- **Authentication**: express-session + bcryptjs
- **Real-time**: Socket.IO
- **File Uploads**: multer
- **CSRF**: csurf
- **Validation**: express-validator
- **Frontend**: HTML, CSS, JavaScript (Video.js for HLS streaming)

---

## Installation and Setup

### Prerequisites

- Node.js 18+ and npm

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo-url.git
cd live-stream-scheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment (optional)

Create a `.env` file in the project root to override defaults:

```
SECRET_KEY=your-secret-key-here
PORT=8000
```

If no `.env` file is present the app runs with a default dev secret key on port `8000`.

---

## How to Run the Application

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

The application will be available at:

```
http://localhost:8000
```

The SQLite database is created automatically at `instance/app.db` on first run — no migration steps required.

### Run Tests

```bash
npm test
```

---

## Usage Instructions

### Admin Users

1. **Register** and select the **Admin** role.
2. Log in and navigate to **Admin** in the nav bar.
3. **Create meetings** using the form (date, agenda, optional document upload).
4. **Delete meetings** from the existing meetings table.

### Regular Users

1. **Register** and select the **Regular User** role.
2. Log in to access the **Schedule**, **Live Stream**, and **Archive** pages.
3. **Comment** in real time during a live stream.

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---
