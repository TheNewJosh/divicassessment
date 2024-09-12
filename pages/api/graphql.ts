import { ApolloServer } from "apollo-server-micro";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { typeDefs } from "../../graphql/typeDefs";
import { resolvers } from "../../graphql/resolvers";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Function to decode JWT and return the user
const getUserFromToken = (token: string) => {
  try {
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      return decoded;
    }
    return null;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: { req: NextApiRequest }) => {
    const token = req.headers.authorization || "";
    const decodedToken = getUserFromToken(token.replace("Bearer ", ""));

    return {
      prisma,
      user: decodedToken
        ? await prisma.user.findUnique({ where: { id: decodedToken.userId } })
        : null,
    };
  },
});

const startServer = apolloServer.start();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure Apollo Server has started
  await startServer;

  // Set response headers for GraphQL endpoint
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
