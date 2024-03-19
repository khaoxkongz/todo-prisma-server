# Todo RESTful API

A RESTful API for managing personal todo lists, built with Node.js, Express, Prisma, JWT authentication, and Redis for blacklisting revoked tokens.

## Features

- User registration and authentication with JWT
- Create, read, update, and delete todo items
- Associate todos with specific users
- Revoke JWT tokens upon user logout
- Automatically expire revoked tokens using a scheduled Redis expirer

## Tech Stack

- Node.js
- Express.js
- Prisma (ORM)
- PostgreSQL (database)
- JSON Web Tokens (JWT) for authentication
- Bcrypt for password hashing
- Redis for JWT blacklisting

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the development server: `npm run dev`

## Contributing

Contributions are welcome! Please follow the guidelines in `CONTRIBUTING.md`.

## License

This project is licensed under the [MIT License](LICENSE).