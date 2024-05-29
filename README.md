# NestJS REST API Project

## Description

This project is a simple REST API application built using the NestJS framework. The application provides endpoints to create users, retrieve user data, handle user avatars, and emit RabbitMQ events. It also integrates with an external API (`https://reqres.in/`) for some of its operations.

## Prerequisites

- Node.js (v12.x or higher)
- npm (v6.x or higher)
- MongoDB (v4.4 or higher)
- RabbitMQ (v3.7 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/amqfr/second-chance
   cd second-chance
   
2. Install dependencies:
   ```bash
   npm install

3. Start MongoDB and RabbitMQ services if not already running.

## Running the Application

1. Start the NestJS application:
  ```bash
  npm run start

2. The application will be running on http://localhost:3000.

## API Endpoints
### POST /api/users
- Node.js (v12.x or higher)
- npm (v6.x or higher)
- MongoDB (v4.4 or higher)
- RabbitMQ (v3.7 or higher)
  ```bash
  {
  "id": 1,
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "avatar": "https://reqres.in/img/faces/1-image.jpg"
  }

### GET /api/users/{userId}
- Description: Retrieve user data from the external API.
- URL: http://localhost:3000/api/users/{userId}
- Method: GET
   
### DELETE /api/users/{userId}/avatar
- Description: Delete the user's avatar.
- URL: http://localhost:3000/api/users/{userId}/avatar
- Method: DELETE


## Testing

### Unit Tests
1. To run the unit tests, use the following command:
   ```bash
   npm run test -- --config jest.config.js

### Functional Testing
Use Postman or a similar tool to send requests to the API endpoints as described above.

## Project Structure
second-chance/
├── src/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── users/
│   │   ├── dto/
│   │   │   └── create-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.spec.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.spec.ts
│   │   └── users.service.ts
│   ├── email/
│   │   ├── email.module.ts
│   │   ├── email.service.spec.ts
│   │   └── email.service.ts
│   ├── producer/
│   │   ├── producer.service.spec.ts
│   │   └── producer.service.ts
├── .eslintrc.js
├── .gitignore
├── jest.config.js
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig.json