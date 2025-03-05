# Competitive Arena

A competitive programming platform that allows users to participate in coding contests, solve problems, and improve their programming skills.

## Features Implemented

### User Management
- User registration and authentication system
- JWT-based secure login system
- User profile management
- Rating system for users

### Contest Features
- Real-time contest participation
- Contest status updates
- Problem solving capabilities
- Contest leaderboard system

### Technical Features
- Secure password hashing using bcrypt
- Real-time updates using Socket.IO
- Protected API routes with JWT authentication
- MongoDB integration for data persistence

## Technologies Used

### Frontend
- React.js
- Socket.IO Client
- Material-UI/Tailwind CSS (for styling)
- Redux (for state management)

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Socket.IO (Real-time communication)
- JWT (Authentication)
- Bcrypt (Password hashing)

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile (Protected)

### Contest Routes
- `GET /api/contests` - Get all contests
- `POST /api/contests` - Create new contest
- `GET /api/contests/:id` - Get specific contest
- `PUT /api/contests/:id` - Update contest
- `DELETE /api/contests/:id` - Delete contest

### Problem Routes
- `GET /api/problems` - Get all problems
- `POST /api/problems` - Create new problem
- `GET /api/problems/:id` - Get specific problem

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/competitive-arena.git
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Run the application
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm start
```

## Screenshots
[Add your application screenshots here]

## Hosted Links
[Add your deployed application links here when available]

## Contributing
Feel free to open issues and pull requests for any improvements.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
