# Hackney Council Meeting Scheduler and Live Stream Application

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation and Setup](#installation-and-setup)
5. [How to Run the Application](#how-to-run-the-application)
6. [Database Setup](#database-setup)
7. [Usage Instructions](#usage-instructions)
8. [Screenshots](#screenshots)
9. [License](#license)

---

## Introduction

The **Hackney Council Meeting Scheduler and Live Stream Application** is designed to help councils schedule meetings, manage user roles, and broadcast meetings through a live streaming feature. This application is built using Flask (Python) and SQLite to provide an intuitive and secure way for users to access council meetings, schedule new meetings, and manage events.

---

## Features

- **User Authentication**: Admin and regular users can register and log in.
- **User Roles**: Admins have full control over the system (CRUD operations), while regular users have limited permissions.
- **Meeting Scheduling**: Create, read, update, and delete meetings based on user roles.
- **Live Streaming**: Allows real-time streaming of council meetings.
- **Input Validation**: Secure form validation and error handling for user inputs.
- **Notifications**: Provides visual feedback after user actions (success/error messages).

---

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite
- **Live Streaming**: Flask-SocketIO (or similar streaming libraries)
- **Version Control**: GitHub for source code management

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo-url.git
cd your-repo-directory
```

### 2. Install Dependencies

Ensure you have Python 3 and pip installed, then run the following command to install the required libraries:

```bash
pip install -r requirements.txt
```

---

## How to Run the Application

After installing the necessary dependencies, start the Flask development server with:

```bash
flask run
```

The application will run locally and can be accessed at:

```
http://127.0.0.1:5000/
```

---

## Database Setup

The application uses SQLite as its database. To initialize the database:

1. **Database Migration Commands**:
   
```bash
flask db init
flask db migrate
flask db upgrade
```

These commands will set up the necessary tables (users and meetings) in your SQLite database.

2. **Seeding the Database**:

(Optional) You can manually add records or create a script to seed the database with sample data for testing purposes.

---

## Usage Instructions

### Admin Users
1. **Log in as Admin**: 
   - After registering and logging in as an admin, you will have access to a dashboard where you can create, update, or delete meetings and manage users.
   
2. **Create/Edit/Delete Meetings**:
   - Admins can create new meetings, update meeting information, or delete existing ones from the dashboard.

3. **Initiate Live Stream**:
   - Admins have access to live stream controls to broadcast meetings in real-time.

### Regular Users
1. **Log in as a Regular User**: 
   - Regular users can create meetings but will have restricted access to update or delete only their own records.

2. **View Live Stream**:
   - Regular users can view the ongoing live streams of council meetings.

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---
