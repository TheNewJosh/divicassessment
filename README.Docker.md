###Project Setup Documentation
1. Prerequisites
Node.js: Install Node.js from nodejs.org.
PostgreSQL: Install and configure PostgreSQL for the database.
Prisma: Used as the ORM, ensure Prisma CLI is installed globally:
bash
Copy code
npm install -g prisma
2. Clone the Repository
bash
Copy code
git clone https://github.com/your-repo.git
cd your-repo
3. Install Dependencies
Install the required packages using npm:

bash
Copy code
npm install
4. Setup Environment Variables
Create a .env file at the root of your project and add the following:

bash
Copy code
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
JWT_SECRET="your_jwt_secret_key"
5. Set Up Prisma
Initialize Prisma and migrate the database:

bash
Copy code
npx prisma migrate dev --name init
npx prisma generate
6. Running the Application
Start the development server:

bash
Copy code
npm run dev
7. Running Tests
Jest is used for testing. Run the tests with:

bash
Copy code
npm run test
8. Endpoints
/api/graphql: Main GraphQL endpoint for interacting with the API.
9. Tools and Libraries
Next.js: Framework for the frontend and API routes.
Apollo Server: For the GraphQL API.
Prisma: ORM for PostgreSQL database.
Jest: For testing.
Additional Notes
Ensure PostgreSQL is running and connected properly via the DATABASE_URL


### Building and running your application

When you're ready, start your application by running:
`docker compose up --build`.

### Deploying your application to the cloud

First, build your image, e.g.: `docker build -t myapp .`.
If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker build --platform=linux/amd64 -t myapp .`.

Then, push it to your registry, e.g. `docker push myregistry.com/myapp`.

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.