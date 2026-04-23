# 🚀 Deployment Guide: Brew & Byte

This guide outlines the steps to deploy the Brew & Byte coffee shop management system using **Vercel** for hosting and **Neon.tech** for the PostgreSQL database.

## 1. Database Setup (Neon.tech)

1.  **Create Account**: Sign up at [Neon.tech](https://neon.tech/).
2.  **Create Project**: Create a new project (e.g., `brew-and-byte`).
3.  **Get Connection String**:
    *   Navigate to the **Dashboard**.
    *   In the **Connection String** dropdown, ensure **"Pooled Connection"** is selected.
    *   Copy the connection string (starts with `postgresql://`).

## 2. Environment Configuration

### Local Development
Update your `.env` file with the Neon connection string for testing (optional):
```env
DATABASE_URL="your-neon-pooled-connection-string"
```

### Production (Vercel)
1.  Go to your project settings in [Vercel](https://vercel.com).
2.  Navigate to **Environment Variables**.
3.  Add a new variable:
    *   **Name**: `DATABASE_URL`
    *   **Value**: `your-neon-pooled-connection-string`

## 3. Deployment Steps

1.  **Push to GitHub**: Ensure all changes are committed and pushed to your repository.
2.  **Import to Vercel**: Connect your GitHub repository to Vercel.
3.  **Deploy**: Vercel will automatically detect Next.js and start the build process.

## 4. Database Migration

After the first deployment, you must push the schema to your live database. Run the following command from your local machine:

```bash
npx prisma db push
```

*Note: This will create the necessary tables in your Neon database based on the `prisma/schema.prisma` file.*

## 5. Maintenance & Scaling

*   **Prisma Client**: The app uses a singleton pattern in `src/lib/prisma.js` to manage database connections efficiently in serverless environments.
*   **Migrations**: For future schema changes, use `npx prisma migrate dev` locally and let Vercel handle the generation during build, or run `npx prisma db push` for quick updates.

---
**Brew & Byte** - *Artisan Coffee & Digital Precision*
