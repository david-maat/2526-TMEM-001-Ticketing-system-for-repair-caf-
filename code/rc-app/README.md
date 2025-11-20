This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Repair Café Ticketing System

A ticketing and management system for Repair Café events, built with Next.js, TypeScript, and PostgreSQL.

## Database Setup

This project uses Prisma ORM with PostgreSQL. Before running the application, you need to set up the database.

### Prerequisites
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a new database called `repaircafe`

### Setup Steps

1. **Configure Environment Variables**
   
   Update the `.env` file with your PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/repaircafe?schema=public"
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Run Database Migration**
   ```bash
   npx prisma migrate dev --name init
   ```
   This creates the database schema and automatically seeds initial data.

4. **Or use Push for Quick Development**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### Database Tools

- **Prisma Studio** - Visual database browser:
  ```bash
  npx prisma studio
  ```

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for more details.

## Getting Started

After setting up the database, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
