## 🚀 Project Initialization

To set up the project locally:

1. Navigate to the project directory:
   ```bash
   cd governance-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Navigate to the Prisma folder:
   ```bash
   cd prisma
   ```

4. Run the initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```

> **Note:** `init` is just a suggested name for the migration. You can replace it with a more descriptive name that reflects the changes in your schema.
