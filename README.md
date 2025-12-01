# Project Title: Restaurant Booking System

## Group information
Group [13]  

[CHEN Jiawei] [12790696] [s1279069@live.hkmu.edu.hk]  

[ZHAO Yihang] [13076843] [s1307684@live.hkmu.edu.hk]  

[FAN Yutao] [13024637] [s1302463@live.hkmu.edu.hk]  

[WANG Zhou] [12811395] [s1281139@live.hkmu.edu.hk] 


# Project Information
A full-stack restaurant reservation system allows users to manage dining bookings across multiple branches.

It provides: 
- An interface open to public users
  - View restaurant availability and login.
- An interface accessible to logged-in users
  - Perform semantic searches on availability.
  - Create, view, edit, and cancel reservations.
  - Manage guest counts (adults and children) and select specific branches.
- RESTful APIs
  - Public APIs for performing complete CRUD operations on reservations.
  - Filtering capabilities for integration with external systems.

More details of each of the functionalities are introduced below. 

# Project File Introduction
Here’s a brief overview of the important files in this project:

## `server.js`
The server.js file is the main entry point for the Express server. It configures the MongoDB connection using Mongoose, sets up session management via `cookie-session`, initializes the EJS template engine, and defines the middleware for parsing requests. It aggregates routes for authentication, web interface, and API endpoints.

## `package.json`
- `bcrypt`: ^5.0.0
- `cookie-session`: ^1.4.0
- `dotenv`: ^8.2.0
- `ejs`: ^3.1.6
- `express`: ^4.17.1
- `mongoose`: ^5.12.3
- `nodemon`: ^2.0.7

## `models`
- `User.js`
  - Defines the User schema with name, contact, email, and hashed password.
  - Includes tracking for deletion history and cooldown periods.
- `Reservation.js`
  - Defines the Reservation schema linking to Users.
  - Stores branch, date, time, guest counts, and status (active/cancelled).

## `views`
- `login.ejs`
- `register.ejs`
- `home.ejs`
- `dashboard.ejs`
- `create-reservation.ejs`
- `edit-reservation.ejs`

## `public`
- `style.css`
  - Contains styling for the responsive web interface.


# Cloud URL
The project is hosted on GitHub:  
[https://github.com/Shaw552/COMPS381F-restaurant-Booking]  

**Note:**
To run the application locally, clone the repository, install dependencies, and start the server. Access the application at `http://localhost:3000`.

# Operation Guides

## The use of Login/Logout Pages

### Valid Login Information
For demonstration purposes, you can register a new account or use an existing one if seeded:

- **User Account**
  - **Email**: [user@example.com]
  - **Password**: [userpassword]

### Sign In Steps
1. Navigate to the login page by accessing `/login` or clicking the login link on the home page.
2. Enter your registered email address and password in the respective fields.
3. Click the `Submit` button to log in.
4. If the information is correct, you will be redirected to the dashboard or home page.

### Registration Steps
1. Navigate to the registration page via `/register`.
2. Enter your Name, Contact Number, Email, and Password.
3. Submit the form to create a new account.

### Logout Steps
1. To log out, click the `Logout` link/button in the navigation bar.
2. You will be logged out and the session will be cleared.


## The use of CRUD web services on the user interface

### For visitors
1. **Home**: Visitors can view the Home page (`/`) but will be redirected to Login for specific actions.
2. **Login/Register**: Access to authentication forms.

### For logged in users
1. **Branch Selection (Read)**: On the Home page, select a branch (e.g., "Ho Man Tin Branch" or "Mong Kok Branch").
2. **Create Reservation (Create)**: 
   - Select a date using the calendar view.
   - Choose a time slot.
   - Enter the number of adults and children.
   - Submit the form to book a table.
3. **Dashboard (Read)**: View a list of all active reservations at `/reservations/list`.
4. **Edit Reservation (Update)**: 
   - Click on an existing reservation in the dashboard.
   - Modify details such as time, date, or guest count.
   - Save changes to update the booking.
5. **Cancel Reservation (Delete)**: 
   - Use the delete/cancel option on a reservation.
   - *Note*: Frequent cancellations may trigger a cooldown period.

### Login Page
1. **Submit**: Use the `Submit` button to verify credentials.
2. **Register**: Link to the registration page for new users.

### Dashboard Page
1. **Edit**: Navigate to the edit form for a specific reservation.
2. **Delete**: Cancel a specific reservation.


## The use of RESTful CRUD services

All API endpoints are prefixed with `/api`.

### 1. Create Reservation
**Endpoint:**
POST /api/reservations

**Description:**
Creates a new reservation for a user.

**Parameters:**
1. **URL Parameter:**
   - None
2. **Request Body (JSON):**
   - `userId` (required): The ID of the user making the booking.
   - `branch` (required): "Ho Man Tin Branch" or "Mong Kok Branch".
   - `date` (required): Date in YYYY-MM-DD format.
   - `time` (required): Time string (e.g., "18:00").
   - `adults` (required): Number of adults (min 1).
   - `children` (required): Number of children (default 0).

**Example Usage:**
   ```bash
   curl -X POST http://localhost:3000/api/reservations \
   -H "Content-Type: application/json" \
   -d '{
      "userId": "user_id_here",
      "branch": "Ho Man Tin Branch",
      "date": "2025-11-15",
      "time": "18:00",
      "adults": 2,
      "children": 1
   }'
   ``` 
### 2. Read Reservations (List)
**Endpoint:**
GET /api/reservations

**Description:**
Retrieves reservations. Optional query parameters let you narrow the list for integrations or dashboards.

**Query Parameters:**
- `userId` (optional): Filter by owning user.
- `branch` (optional): Filter by branch name.
- `date` (optional): Filter by a single calendar date (YYYY-MM-DD).
- `status` (optional): Filter by reservation status such as `active` or `cancelled`.

**Example Usage:**
  ```bash
  curl https://comps381f-resturant-booking.onrender.com/api/reservations
  ```

### 3. Read Reservation (Single)
**Endpoint:**
GET /api/reservations/:id

**Description:**
Fetches a single reservation document by its MongoDB identifier, including basic user information.

**URL Parameters:**
- `id` (required): Reservation ID.

**Example Usage:**
  ```bash
  curl https://comps381f-resturant-booking.onrender.com/api/reservations/67ab3c9d8e7f6a5b4c3d2e1f
  ```

### 4. Update Reservation
**Endpoint:**
PUT /api/reservations/:id

**Description:**
Updates an existing reservation. You may send only the fields that need to change. Server-side validation still applies (e.g., total guests ≤ 12 and December 2025 window).

**URL Parameters:**
- `id` (required): Reservation ID.

**Request Body (JSON):**
- `branch` (optional)
- `date` (optional, YYYY-MM-DD)
- `time` (optional)
- `adults` (optional)
- `children` (optional)
- `status` (optional): Set to `active` or `cancelled` for workflow automation.

**Example Usage:**
  ```bash
  curl -X PUT https://comps381f-resturant-booking.onrender.com/api/reservations/67ab3c9d8e7f6a5b4c3d2e1f \
  -H "Content-Type: application/json" \
  -d '{
    "time": "20:00",
    "adults": 5,
    "status": "active"
  }'
  ```

### 5. Delete Reservation
**Endpoint:**
DELETE /api/reservations/:id

**Description:**
Permanently removes a reservation document. Use this with caution—UI workflows usually prefer setting the status to `cancelled`.

**URL Parameters:**
- `id` (required): Reservation ID to delete.

**Example Usage:**
  ```bash
  curl -X DELETE https://comps381f-resturant-booking.onrender.com/api/reservations/67ab3c9d8e7f6a5b4c3d2e1f
  ```
