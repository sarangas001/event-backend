# 🎓 University Event Registration System

A full-stack web application for managing university events and student registrations.  
This project was developed as part of a university coursework project.

---

## 🚀 Features

### 👩‍🎓 Student Features
- Browse upcoming events with details (title, date, time, venue, description).
- Register for events online.
- Cancel or update registration.
- View personal registered events.

### 🛠️ Admin Features
- Add, edit, and delete events.
- View a list of registered students.
- Manage and approve/cancel student registrations.
- Generate participant reports.

---

## 🏗️ Tech Stack

- **Frontend**: React.js (HTML, CSS, JavaScript)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Version Control**: Git & GitHub

---

## 📂 Project Structure

```bash
university-event-registration/
│── backend/            # Node.js + Express backend
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── controllers/    # Business logic
│   └── server.js       # Main server file
│
│── frontend/           # React.js frontend
│   ├── public/         # Static files
│   ├── src/            # React components, pages, services
│   └── package.json    # Frontend dependencies
│
│── README.md           # Documentation
│── .gitignore          # Git ignore rules
│── package.json        # Backend dependencies
