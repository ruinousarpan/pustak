# Pustak Setup Guide

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL or MariaDB

## Getting Started

1. Clone the repository:
   ```zsh
git clone https://github.com/ruinousarpan/pustak.git
cd pustak
```
2. Copy `.env.example` to `.env` and fill in your secrets.
3. Install dependencies for both client and server:
   ```zsh
cd client && npm install
cd ../server && npm install
```
4. Start the development servers:
   ```zsh
cd client && npm start
cd ../server && npm run dev
```

See `docs/` for more details.
