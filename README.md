# Restaurant Booking System

A full-stack restaurant reservation system built with Express.js and MongoDB, featuring user authentication, reservation management, and a RESTful API.

## Features

- **User Authentication**
  - User registration with email validation
  - Secure login with password hashing (bcrypt)
  - Session-based authentication using cookie-session
  - Automatic logout and session management

- **Reservation Management**
  - Create, view, edit, and cancel reservations
  - Branch selection (Ho Man Tin Branch, Mong Kok Branch)
  - Date and time selection with calendar view
  - Guest count management (adults and children)
  - Reservation status tracking (active/cancelled)
  - Cooldown period to prevent frequent cancellations

- **RESTful API**
  - Complete CRUD operations for reservations
  - Query filtering by user, branch, date, and status
  - JSON responses for easy integration

- **User Interface**
  - Responsive web interface using EJS templates
  - Calendar view for date selection
  - Dashboard for viewing all reservations
  - Intuitive forms for creating and editing reservations

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: cookie-session, bcrypt
- **Template Engine**: EJS
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
```bash
cd /path/to/project
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables** (optional):
   Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key_here
```

   If no `.env` file is provided, the application will use default values:
   - Port: 3000
   - MongoDB URI: Default connection string (configured in server.js)
   - Session Secret: 'your-secret-key-change-in-production'

4. **Start the server**:
```bash
npm start
```

   Or use development mode with auto-reload:
```bash
npm run dev
```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
.
├── server.js                 # Main Express server file
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (optional)
├── models/                   # Mongoose data models
│   ├── User.js              # User model with password hashing
│   └── Reservation.js       # Reservation model
├── routes/                   # Route handlers
│   ├── auth.js              # Authentication routes (login, register, logout)
│   ├── reservations.js      # Web routes for reservation management
│   └── api.js               # RESTful API endpoints
├── views/                    # EJS templates
│   ├── login.ejs            # Login page
│   ├── register.ejs         # Registration page
│   ├── home.ejs             # Home page with branch selection
│   ├── dashboard.ejs        # Reservation list/dashboard
│   ├── create-reservation.ejs  # Create reservation form
│   └── edit-reservation.ejs    # Edit reservation form
└── public/                   # Static files
    └── style.css            # CSS styles
```

## API Documentation

### Web Routes

#### Authentication
- `GET /login` - Display login page
- `POST /login` - Process login (email, password)
- `GET /register` - Display registration page
- `POST /register` - Process registration (name, contact, email, password)
- `GET /logout` - Logout and clear session

#### Reservations (Web Interface)
- `GET /` - Home page (redirects to login if not authenticated)
- `GET /reservations/list` - View all active reservations for logged-in user
- `GET /reservations/create?branch=<branch_name>` - Create reservation page
- `POST /reservations/create` - Process reservation creation
- `GET /reservations/edit/:id` - Edit reservation page
- `POST /reservations/edit/:id` - Update reservation
- `POST /reservations/delete/:id` - Delete/cancel reservation

### RESTful API Endpoints

All API endpoints are prefixed with `/api`.

#### Get All Reservations
```
GET /api/reservations
```

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `branch` (optional) - Filter by branch name
- `date` (optional) - Filter by date (YYYY-MM-DD format)
- `status` (optional) - Filter by status ('active' or 'cancelled')

**Example:**
```bash
GET /api/reservations?branch=Ho Man Tin Branch&status=active
```

**Response:**
```json
[
  {
    "_id": "...",
    "userId": {
      "_id": "...",
      "name": "John Doe",
      "contact": "12345678",
      "email": "john@example.com"
    },
    "branch": "Ho Man Tin Branch",
    "date": "2025-11-15T00:00:00.000Z",
    "time": "18:00",
    "adults": 2,
    "children": 1,
    "status": "active",
    "createdAt": "2025-11-01T10:00:00.000Z"
  }
]
```

#### Get Single Reservation
```
GET /api/reservations/:id
```

**Response:**
```json
{
  "_id": "...",
  "userId": {...},
  "branch": "Mong Kok Branch",
  "date": "2025-11-15T00:00:00.000Z",
  "time": "19:30",
  "adults": 4,
  "children": 0,
  "status": "active",
  "createdAt": "2025-11-01T10:00:00.000Z"
}
```

#### Create Reservation
```
POST /api/reservations
```

**Request Body:**
```json
{
  "userId": "user_id_here",
  "branch": "Ho Man Tin Branch",
  "date": "2025-11-15",
  "time": "18:00",
  "adults": 2,
  "children": 1
}
```

**Response:** 201 Created with reservation object

#### Update Reservation
```
PUT /api/reservations/:id
```

**Request Body:** (all fields optional)
```json
{
  "branch": "Mong Kok Branch",
  "date": "2025-11-16",
  "time": "19:00",
  "adults": 3,
  "children": 0,
  "status": "cancelled"
}
```

**Response:** Updated reservation object

#### Delete Reservation
```
DELETE /api/reservations/:id
```

**Response:**
```json
{
  "message": "Reservation deleted",
  "reservation": {...}
}
```

## Data Models

### User Model
```javascript
{
  name: String (required),
  contact: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  consecutiveDeletions: Number,
  lastDeletionTime: Date,
  cooldownUntil: Date
}
```

### Reservation Model
```javascript
{
  userId: ObjectId (required, ref: User),
  branch: String (required, enum: ['Ho Man Tin Branch', 'Mong Kok Branch']),
  date: Date (required),
  time: String (required),
  adults: Number (required, min: 1),
  children: Number (required, min: 0, default: 0),
  status: String (enum: ['active', 'cancelled'], default: 'active'),
  createdAt: Date
}
```

## Usage Guide

1. **Registration**: First-time users need to register with their name, contact number, email, and password.

2. **Login**: Use your email and password to log in.

3. **Create Reservation**:
   - Select a branch from the home page
   - Choose a date using the calendar view
   - Select a time slot
   - Enter the number of adults and children
   - Submit the reservation

4. **View Reservations**: Access your dashboard to see all active reservations.

5. **Edit Reservation**: Click on any reservation to modify details (branch, date, time, guest count).

6. **Cancel Reservation**: Delete a reservation from the dashboard. Note: Frequent cancellations may trigger a cooldown period.

## Security Features

- Password hashing using bcrypt (10 rounds)
- Session-based authentication
- Input validation and sanitization
- Cooldown mechanism to prevent abuse
- Secure session management with cookie-session

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses `nodemon` to automatically restart the server when files change.

### Environment Variables
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Secret key for session encryption

## License

This project is open source and available for use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
