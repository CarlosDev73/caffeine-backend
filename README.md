# Caffeine - Mobile App and Backend API ☕

Caffeine is a platform designed for programmers and tech enthusiasts. The app provides a space to share posts, follow users, interact with content, and manage coding-related resources.

This repository contains the **Node.js-based backend** API.

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express.js**: Web framework for creating RESTful APIs.
- **MongoDB (Atlas)**: NoSQL database for data storage.
- **Mongoose**: MongoDB object modeling for Node.js.
- **Migration-Mongo**: For database schema and data migrations.
- **Jest**: Testing framework for unit and integration tests.
- **Nodemailer**: For handling email communication (password recovery, notifications, etc.).

## Features


### Backend API
- RESTful API: Handles user authentication, post interactions, and data operations.
- Authentication: Secure JWT-based user authentication.
- Validation: Ensures data integrity using Mongoose schemas.
- Email Integration: Send emails for password recovery and notifications using Nodemailer.
- API Documentation: Fully documented API endpoints in Postman (see below).
- Database Migrations: Manage incremental changes with Migration-Mongo.

## Postman Documentation

Explore the API endpoints with the provided Postman collection:
[Postman Collection](https://martian-equinox-636176.postman.co/workspace/Caffeine~f37c04df-2be3-41d9-89ef-3345ceec60df/collection/30633673-da3be000-02f2-4816-b9bb-16c09b8eb191?action=share&creator=30633673)

### Key Endpoints
#### Auth
- `POST /api/v1/auth/register`: Register a new user.
- `POST /api/v1/auth/login`: User login.
- `POST /api/v1/auth/forgot-password`: Request password reset email.
- `POST /api/v1/auth/reset-password`: Reset user password.

#### Posts
- `GET /api/v1/posts`: Get all posts with pagination.
- `POST /api/v1/post`: Create a new post.
- `PUT /api/v1/post/:id`: Update a specific post.
- `DELETE /api/v1/post/:id`: Delete a specific post.

#### Users
- `GET /api/v1/users/:id`: Fetch user details.
- `PUT /api/v1/users/update/:id`: Update user details.
- `POST /api/v1/users/follow/:id`: Follow another user.
- `POST /api/v1/users/unfollow/:id`: Unfollow another user.

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (Atlas or Local Instance)
- Expo CLI
- Postman (optional, for testing API endpoints)

### Environment Variables

Create a `.env` file in the root directory and populate it with the following variables:

```env
MONGODB_URI=
DATABASE_NAME=Test1
SECRET_KEY=your_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
RESET_TOKEN_SECRET=reset_token_secret
RESET_TOKEN_EXPIRATION=3600
FRONTEND_URL=http://localhost:8081
```

### Installation

#### Backend
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run database migrations:
   ```bash
   npx migrate-mongo up
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

4. Run tests:
   ```bash
   npm test
   ```


### API Usage

Use Postman to test the API or integrate the endpoints directly into your mobile app. See the [Postman Collection](https://martian-equinox-636176.postman.co/workspace/Caffeine~f37c04df-2be3-41d9-89ef-3345ceec60df/collection/30633673-da3be000-02f2-4816-b9bb-16c09b8eb191?action=share&creator=30633673) for examples.

## Database Migrations

### Adding a New Migration
To create a new migration:

1. Generate a new migration file:
   ```bash
   npx migrate-mongo create migration_name
   ```

2. Implement the `up` and `down` functions in the generated file.

### Running Migrations
- Apply migrations:
  ```bash
  npx migrate-mongo up
  ```
- Rollback the last migration:
  ```bash
  npx migrate-mongo down
  ```

## Testing

The project uses Jest for testing. Run tests using:
```bash
npm test
```

## Contribution Guidelines

1. Fork the repository and create a new branch.
2. Make your changes and test thoroughly.
3. Submit a pull request with a detailed description of the changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

Enjoy building and contributing to Caffeine! ☕

