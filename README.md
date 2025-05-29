# Elevatr - Habit Tracking Application

Elevatr is a modern habit tracking application built with Next.js, Prisma, and TypeScript. It helps users build and maintain positive habits through an intuitive interface and powerful tracking features.

## Features

- 🔐 Secure Authentication System
- 📊 Interactive Dashboard
- ✨ Habit Creation and Management
- 📱 Responsive Design
- 🎯 Progress Tracking
- 🔄 Daily/Weekly/Monthly Habit Frequency

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **Testing**: Vitest

## Getting Started

1. Clone the repository:
   ```bash
   git clone git@github.com:parth012001/Elevatr.git
   cd Elevatr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="your_database_url"
   JWT_SECRET="your_jwt_secret"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
