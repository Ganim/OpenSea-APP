# OpenSea-App

A modern Next.js application built with TypeScript, Tailwind CSS, and shadcn/ui, featuring authentication and API integration with [OpenSea-API](https://github.com/Ganim/OpenSea-API).

## 🚀 Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **ESLint + Prettier** for code quality and formatting
- **Authentication system** with login and registration
- **Public and private routes** structure
- **API client** ready for OpenSea-API integration
- **Dashboard layout** for authenticated users

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication routes (public)
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   ├── (dashboard)/      # Dashboard routes (private)
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # shadcn/ui components
├── config/
│   └── api.ts            # API configuration
├── lib/
│   ├── api-client.ts     # Base API client
│   └── utils.ts          # Utility functions
├── services/
│   └── auth.service.ts   # Authentication service
├── types/
│   └── auth.ts           # TypeScript types
├── hooks/                # Custom React hooks
└── middleware/           # Next.js middleware
```

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/Ganim/OpenSea-App.git
cd OpenSea-App
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and configure:

```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your configuration:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
API_BASE_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## 🏃 Running the Application

### Development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build:

```bash
npm run build
npm start
```

## 🧪 Code Quality

### Linting:

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

### Formatting:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

## 🔌 API Integration

The application comes with a pre-configured API client located in `src/lib/api-client.ts`. It includes:

- Automatic token management
- Request/response interceptors
- Timeout handling
- Error handling

### Using the API Client:

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const data = await apiClient.get('/endpoint');

// POST request
const result = await apiClient.post('/endpoint', { data });

// PUT, PATCH, DELETE also available
```

### Authentication Service:

```typescript
import { authService } from '@/services/auth.service';

// Login
await authService.login({ email, password });

// Register
await authService.register({ email, password, name });

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();
```

## 🎨 Styling

This project uses:

- **Tailwind CSS v4** for utility-first styling
- **shadcn/ui** for pre-built, customizable components
- **CSS variables** for theming

To add shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

## 🔐 Authentication Routes

- `/` - Home page (public)
- `/login` - Login page (public)
- `/register` - Registration page (public)
- `/dashboard` - Dashboard (requires authentication)

## 📦 Technologies

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Projects

- [OpenSea-API](https://github.com/Ganim/OpenSea-API) - Backend API for this application
