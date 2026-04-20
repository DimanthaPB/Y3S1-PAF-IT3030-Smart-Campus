# Smart Campus Operations Hub

Smart Campus Operations Hub is a full-stack university operations platform built for the SLIIT `IT3030 - PAF 2026` assignment. Based on the assignment scope and the implemented codebase, the system brings together resource management, facility booking, maintenance ticketing, notifications, and role-based access control in one web application.

The project is designed around day-to-day campus workflows such as:

- Managing lecture halls, labs, meeting rooms, and equipment
- Letting students or staff discover active resources and request bookings
- Allowing admins to approve, reject, or cancel bookings
- Reporting maintenance or incident issues with comments and attachments
- Delivering in-app notifications for booking, ticket, comment, and system events
- Supporting secure authentication with JWT and Google OAuth 2.0

## Project Modules

### 1. Resource Management

Admins can:

- Create, update, search, and delete resources
- Manage resource type, capacity, location, status, and availability windows
- Maintain lecture halls, labs, meeting rooms, and equipment

Users can:

- Browse the active resource catalogue
- Search resources by type, keyword, location, and capacity

### 2. Booking Management

Users can:

- Create booking requests for resources
- View their own bookings
- Edit pending bookings
- Cancel approved bookings with reasons

Admins can:

- Review all booking requests
- Approve or reject bookings
- Monitor booking conflicts and availability

### 3. Incident Ticketing

Users can:

- Create maintenance or incident tickets
- Add details such as title, description, category, priority, and related resource
- Upload evidence attachments
- Follow updates through comments and status changes

Admins or technical staff workflows include:

- Viewing and managing ticket progress
- Updating status through the incident lifecycle
- Adding comments and operational follow-up

### 4. Notifications

The system includes an in-app notification center for:

- Booking approvals, rejections, and cancellations
- Ticket updates and comment events
- System alerts such as newly added resources

Users can also manage notification preferences for:

- Booking alerts
- Ticket alerts
- System alerts

### 5. Authentication and Authorization

The platform supports:

- Email/password registration and login
- Google OAuth 2.0 login
- JWT-based API authentication
- Role-based access control

Current role support in the backend includes:

- `USER`
- `ADMIN`
- `TECHNICIAN`
- `MANAGER`

The current UI primarily exposes `USER` and `ADMIN` flows, with shared preference and notification support across authenticated roles.

## Tech Stack

### Backend

- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT (`jjwt`)
- Google OAuth 2.0 client
- Lombok
- Maven Wrapper

### Frontend

- React 19
- Vite
- React Router
- Axios
- Lucide React

## Project Structure

```text
Y3S1-PAF-IT3030-Smart-Campus/
|-- backend/     Spring Boot REST API
|-- frontend/    React + Vite client
`-- README.md
```

## Key Features Implemented

- Resource catalogue with admin CRUD operations
- User-facing active resource catalogue
- Booking request workflow with validation and conflict checking
- Booking approval, rejection, and cancellation handling
- Ticket and comment workflows
- Attachment upload support for tickets
- Notification center with preference management
- JWT login and Google OAuth login
- Role-aware frontend routing
- Admin user management

## Prerequisites

Install these before running the project:

- Java `21`
- Node.js `18+` recommended, `20+` preferred
- npm
- PostgreSQL access, or a working remote PostgreSQL database

## Configuration

### Backend configuration

Backend configuration is mainly defined in:

- [backend/src/main/resources/application.yml](./backend/src/main/resources/application.yml)
- [backend/env.properties](./backend/env.properties)

The backend expects:

- A PostgreSQL database connection
- Google OAuth credentials for Google sign-in
- A JWT secret

### Recommended local configuration

For local development, keep secrets out of source control and provide your own values.

Create or update `backend/env.properties` like this:

```properties
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

If you want to use your own PostgreSQL database instead of the current configured datasource, update `backend/src/main/resources/application.yml` or override Spring datasource properties at runtime.

Important:

- The frontend expects the backend at `http://localhost:8080`
- The backend allows CORS from `http://localhost:5173`
- The frontend API base URL defaults to `http://localhost:8080/api`

You can change the frontend API URL by creating `frontend/.env`:

```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

## Run the Backend

Open a terminal in the `backend` folder.

### Windows

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### macOS / Linux

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on:

```text
http://localhost:8080
```

Useful backend commands:

```powershell
.\mvnw.cmd test
.\mvnw.cmd clean package
```

## Run the Frontend

Open a second terminal in the `frontend` folder.

Install dependencies:

```powershell
cd frontend
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

The frontend will start on:

```text
http://localhost:5173
```

Other useful frontend commands:

```powershell
npm run build
npm run preview
npm run lint
```

## Recommended Startup Order

1. Start the backend first
2. Start the frontend second
3. Open `http://localhost:5173`
4. Register a local user or sign in with Google OAuth

## Main Routes

### Frontend routes

- `/` - Home page
- `/login` - Login page
- `/bookings` - User bookings
- `/admin/bookings` - Admin booking management
- `/catalogue` - User resource catalogue
- `/resources` - Admin resource management
- `/tickets` - User ticket management
- `/tech/tickets` - Admin or technical ticket area
- `/preferences` - Notification preferences

### Backend API areas

- `/api/auth` - Authentication
- `/api/resources` - Resource management
- `/api/bookings` - Booking management
- `/api/tickets` - Ticket management
- `/api/users/me/notifications` - Notification inbox
- `/api/users/me/preferences` - Notification preferences
- `/api/admin/users` - Admin user management

## Testing

Backend tests can be run with:

```powershell
cd backend
./mvnw spring-boot:run
```

Example focused test:

```powershell
.\mvnw.cmd -Dtest=ResourceControllerTest test
```

## Notes

- The backend uses Spring Security with stateless JWT authentication
- Google OAuth redirects back to the frontend after successful login
- File uploads are stored under the backend `uploads` directory
- JPA is currently configured with `ddl-auto: update`
- The current implementation is coursework-oriented and suitable for demo and development use

## Suggested README Usage For Submission

This README is suitable as the main project overview for:

- GitHub repository documentation
- Assignment submission support material
- Team demo walkthroughs
- Viva preparation

If needed, this can be extended later with:

- Screenshots
- API endpoint tables
- Database schema diagrams
- Team member contribution mapping
- Deployment instructions
