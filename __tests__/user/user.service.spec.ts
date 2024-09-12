import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

// Mock the User entity type
interface User {
  id: number;
  email: string;
  password: string;
}

describe("UserService", () => {
  let userService: UserService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    // eslint-disable-next-line @next/next/no-assign-module-variable
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const email = "test@example.com";
      const password = "password123";
      const hashedPassword = "hashedPassword";
      const userId = 1;

      // Mock Prisma methods
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null); // No user exists
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        id: userId,
        email,
        password: hashedPassword,
      } as User);
      (jwtService.sign as jest.Mock).mockReturnValue("jwt_token");

      // Test the user registration flow
      const result = await userService.register(email, password);

      // Expectations
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { email, password: hashedPassword },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({
        token: "jwt_token",
        user: { id: userId, email, password: hashedPassword },
      });
    });

    it("should throw an error if the user already exists", async () => {
      const mockExistingUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(
        mockExistingUser as User
      );

      await expect(
        userService.register("test@example.com", "password123")
      ).rejects.toThrow("User already exists");
    });
  });

  describe("login", () => {
    it("should log in a user successfully", async () => {
      const email = "test@example.com";
      const password = "password123";
      const hashedPassword = "hashedPassword";
      const userId = 1;

      // Mock Prisma and bcrypt methods
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email,
        password: hashedPassword,
      } as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue("jwt_token");

      // Test the login flow
      const result = await userService.login(email, password);

      // Expectations
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(jwtService.sign).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({
        token: "jwt_token",
        user: { id: userId, email, password: hashedPassword },
      });
    });

    it("should throw an error if the user is not found", async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.login("nonexistent@example.com", "password123")
      ).rejects.toThrow("User not found");
    });

    it("should throw an error if the password is incorrect", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(
        user as User
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Password mismatch

      await expect(
        userService.login("test@example.com", "wrongPassword")
      ).rejects.toThrow("Invalid password");
    });
  });
});
