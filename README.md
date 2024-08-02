# Task Manager

Prerequisites

- Docker and Docker Compose installed (for Docker setup)
- Node.js and npm installed (for local setup)
- MongoDB

## Setup

### Using Docker Compose

1. **Setup the .env variables:**

   Setup `.env` as in ` .env.example` and ensure the  `DATABASE_URL` is set to:

   ```plaintext
   DATABASE_URL=mongodb://mongo:27017/db
   ```
2. **Run Docker Compose:**

   ```bash
   docker-compose up
   ```

### Running Locally

1. **Install NestJS:**

   Follow the NestJS documentation to install NestJS CLI:
   [NestJS Installation Guide](https://docs.nestjs.com/)
2. **Install project dependencies:**

   ```bash
   npm install
   ```
3. **Setup the .env variables:**

   Setup `.env` and configure your environment variables.
4. **Start the application:**

   ```bash
   npm start
   ```
5. **To run tests**

   ```bash
   npm run test
   ```

## API Documentation

Swagger documentation is available at:

```plaintext
http://localhost:<PORT>/docs
```

Replace `<PORT>` with the actual port number your application is running on (default is typically 3000).
