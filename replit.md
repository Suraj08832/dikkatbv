# Overview

This is a Media Download Manager application - a comprehensive platform for managing multi-platform media downloads with advanced API management, real-time monitoring, and enterprise-grade security. The application provides a dashboard interface for users to manage API keys, monitor download requests, handle file management, view system logs, and configure settings for various media platforms like YouTube, Spotify, and Instagram.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes based on authentication status
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack Query for server state management and API caching
- **Authentication**: Session-based authentication with automatic redirect handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with route-based organization
- **Authentication**: Replit OIDC integration with session management
- **Database Access**: Drizzle ORM with type-safe database operations
- **Development**: Hot reload with Vite integration in development mode

## Data Storage Solutions
- **Primary Database**: PostgreSQL using Supabase (replacing Neon Database)
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Session Store**: PostgreSQL-backed session storage using connect-pg-simple
- **Schema Management**: Centralized schema definition with Zod validation
- **Configuration**: Settings class with API keys for YouTube, Spotify, Instagram, and security settings

## Authentication and Authorization Mechanisms
- **Provider**: Replit OIDC (OpenID Connect) for authentication
- **Session Management**: Express sessions with PostgreSQL storage
- **API Security**: API key-based authentication for external access
- **User Management**: Role-based access with user profiles and API key management
- **Authorization**: Route-level protection with middleware-based access control

## External Dependencies

### Database Services
- **Supabase**: Serverless PostgreSQL database with connection pooling (replaces Neon)
- **Database Driver**: @neondatabase/serverless for optimized serverless connections

### Authentication Services  
- **Replit OIDC**: OpenID Connect provider for user authentication
- **Passport.js**: Authentication middleware with OpenID Connect strategy

### Frontend Libraries
- **UI Components**: Comprehensive shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and responsive utilities
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod schema validation

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Replit Integration**: Custom Vite plugins for Replit-specific development features
- **Database Migrations**: Drizzle Kit for schema migrations and database management

### Media Platform Integration
- **YouTube**: Download capability for YouTube content
- **Spotify**: Audio download functionality  
- **Instagram**: Media download support for Instagram content
- **File Management**: Multi-format file handling with progress tracking