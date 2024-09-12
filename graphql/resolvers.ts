// /graphql/resolvers.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Define context interface for TypeScript
interface Context {
  user: User | null;
}

export const resolvers = {
  Query: {
    // Fetch authenticated user
    me: async (_parent: unknown, _args: unknown, context: Context) => {
      const { user } = context;
      if (!user) {
        throw new Error("Not authenticated");
      }
      return user;
    },
  },

  Mutation: {
    // Register a new user
    register: async (
      _parent: unknown,
      args: { email: string; password: string }
    ) => {
      const { email, password } = args;

      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      return {
        token,
        user,
      };
    },

    // Login a user
    login: async (
      _parent: unknown,
      args: { email: string; password: string }
    ) => {
      const { email, password } = args;

      // Find the user by email
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("User not found");
      }

      // Compare the hashed password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error("Invalid password");
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      return {
        token,
        user,
      };
    },

    // Set biometric key (hash it before saving)
    setBiometricKey: async (
      _parent: unknown,
      args: { biometricKey: string },
      context: Context
    ) => {
      const { biometricKey } = args;

      // Ensure user is authenticated before allowing to set biometric key
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Hash the biometric key
      const hashedBiometricKey = await bcrypt.hash(biometricKey, 10);

      // Update the user with the hashed biometric key
      const user = await prisma.user.update({
        where: { id: context.user.id },
        data: { biometricKey: hashedBiometricKey },
      });

      return user;
    },

    // Biometric login (compare hashed biometric key)
    biometricLogin: async (_parent: unknown, args: { biometricKey: string }) => {
      const { biometricKey } = args;

      // Find the user by biometric key
      const user = await prisma.user.findFirst({
        where: { biometricKey: { not: null } },
      });

      if (!user) {
        throw new Error("Biometric key not found");
      }

      // Compare the hashed biometric key with the provided one
      const isValid = await bcrypt.compare(biometricKey, user.biometricKey!);
      if (!isValid) {
        throw new Error("Invalid biometric key");
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      return {
        token,
        user,
      };
    },
  },
};


