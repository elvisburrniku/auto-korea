import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  carFilterSchema,
  carValidationSchema,
  insertContactSchema,
  insertWishlistSchema,
  loginSchema,
  insertUserSchema,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const user = (req.session as any)?.user;
  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please login to continue." });
  }
  next();
};

// Middleware to check if the user is an admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req.session as any)?.user;
  if (!user || !user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Forbidden. Admin access required." });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

  // Configure multer for file uploads
  const uploadDir = path.join(process.cwd(), "public/uploads");

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const multerStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const extension = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    },
  });

  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (_req, file, cb) => {
      // Accept images only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        cb(null, false);
        return;
      }
      cb(null, true);
    },
  });

  // Authentication routes

  // Register route
  app.post(
    `${apiPrefix}/auth/register`,
    async (req: Request, res: Response) => {
      try {
        const validationResult = insertUserSchema.safeParse(req.body);

        if (!validationResult.success) {
          const errorMessage = fromZodError(validationResult.error).message;
          return res.status(400).json({ message: errorMessage });
        }

        const userData = validationResult.data;

        // Check if username already exists
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser) {
          return res.status(409).json({ message: "Username already exists" });
        }

        // Create new user (non-admin by default)
        const newUser = await storage.createUser(userData);

        // Store user in session
        (req.session as any).user = {
          id: newUser.id,
          username: newUser.username,
          isAdmin: newUser.isAdmin,
        };

        await new Promise((resolve) => req.session.save(resolve));

        res.status(201).json({
          id: newUser.id,
          username: newUser.username,
          isAdmin: newUser.isAdmin,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Registration failed" });
      }
    },
  );

  // Login route
  app.post(`${apiPrefix}/auth/login`, async (req: Request, res: Response) => {
    try {
      console.log("Login attempt:", req.body);
      const validationResult = loginSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        console.log("Validation error:", errorMessage);
        return res.status(400).json({ message: errorMessage });
      }

      const { username, password } = validationResult.data;
      console.log(`Attempting to log in user: ${username}`);

      const user = await storage.getUserByUsername(username);
      console.log(
        "User found:",
        user ? "Yes" : "No",
        user ? `Admin: ${user.isAdmin}` : "",
      );

      if (!user || user.password !== password) {
        console.log("Authentication failed: Invalid credentials");
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Store user in session
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      };

      console.log("Session before save:", req.session);
      await new Promise((resolve) => req.session.save(resolve));
      console.log("Session after save:", req.session);

      res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout route
  app.post(`${apiPrefix}/auth/logout`, (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check current session
  app.get(`${apiPrefix}/auth/session`, (req: Request, res: Response) => {
    const user = (req.session as any)?.user;
    if (user) {
      res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Get all cars with sorting and pagination
  app.get(`${apiPrefix}/cars`, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const sort = (req.query.sort as string) || "newest";
      const order = (req.query.order as string) || "desc";

      const offset = (page - 1) * limit;

      let orderBy = "";
      switch (sort) {
        case "price":
          orderBy = "price";
          break;
        case "newest":
          orderBy = "created_at";
          break;
        default:
          orderBy = "created_at";
      }

      // Parse filters from query
      const filters = {
        make: req.query.make as string,
        model: req.query.model as string,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
        fuelType: req.query.fuelType as string,
        transmission: req.query.transmission as string,
        search: req.query.search as string,
      };

      const [cars, total] = await Promise.all([
        storage.getAllCars({ offset, limit, orderBy, order, filters }),
        storage.getTotalCars({ filters }),
      ]);

      res.json({
        cars,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.get(
    `${apiPrefix}/cars/meta/types`,
    async (req: Request, res: Response) => {
      try {
        const metadata = await storage.getCarMetadata();
        console.log("Metadata:", metadata);
        res.json(metadata);
      } catch (error) {
        console.error("Error fetching car metadata:", error);
        res.status(500).json({ message: "Failed to fetch car metadata" });
      }
    },
  );

  // Filter cars - Moving this route before the :id route is crucial
  app.get(`${apiPrefix}/cars/filter`, async (req: Request, res: Response) => {
    try {
      // Convert query params to the right types
      const filter: Record<string, any> = {};

      if (req.query.make) filter.make = req.query.make as string;
      if (req.query.model) filter.model = req.query.model as string;
      if (req.query.minPrice)
        filter.minPrice = parseInt(req.query.minPrice as string);
      if (req.query.maxPrice)
        filter.maxPrice = parseInt(req.query.maxPrice as string);
      if (req.query.minYear) {
        filter.minYear = parseInt(req.query.minYear as string);
        console.log(`Setting minYear filter to: ${filter.minYear}`);
      }
      if (req.query.maxYear) {
        filter.maxYear = parseInt(req.query.maxYear as string);
        console.log(`Setting maxYear filter to: ${filter.maxYear}`);
      }
      if (req.query.fuelType) filter.fuelType = req.query.fuelType as string;
      if (req.query.transmission)
        filter.transmission = req.query.transmission as string;
      if (req.query.search) filter.search = req.query.search as string;

      console.log("Filter query parameters:", req.query);
      console.log("Constructed filter object:", filter);

      const validationResult = carFilterSchema.safeParse(filter);

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        console.error("Filter validation failed:", errorMessage);
        return res.status(400).json({ message: errorMessage });
      }

      // const allCars = await storage.getAllCars();
      // console.log("Total cars before filtering:", allCars.length);
      const filteredCars = await storage.filterCars(validationResult.data);
      console.log("Filtered cars count:", filteredCars.length);

      res.json(filteredCars);
    } catch (error) {
      console.error("Error filtering cars:", error);
      res.status(500).json({ message: "Failed to filter cars" });
    }
  });

  // Get featured cars - Moving this route before the :id route as well
  app.get(
    `${apiPrefix}/cars/featured/list`,
    async (req: Request, res: Response) => {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
        const featuredCars = await storage.getFeaturedCars(limit);
        res.json(featuredCars);
      } catch (error) {
        console.error("Error fetching featured cars:", error);
        res.status(500).json({ message: "Failed to fetch featured cars" });
      }
    },
  );

  // Get recent cars - Moving this route before the :id route as well
  app.get(
    `${apiPrefix}/cars/recent/list`,
    async (req: Request, res: Response) => {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
        const recentCars = await storage.getRecentCars(limit);
        res.json(recentCars);
      } catch (error) {
        console.error("Error fetching recent cars:", error);
        res.status(500).json({ message: "Failed to fetch recent cars" });
      }
    },
  );

  // Get a specific car by ID - This should come after all specific /cars/* routes
  app.get(`${apiPrefix}/cars/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid car ID" });
      }

      const car = await storage.getCarById(id);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }

      res.json(car);
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  // Get similar cars
  app.get(
    `${apiPrefix}/cars/:id/similar`,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid car ID" });
        }

        const limit = parseInt(req.query.limit as string) || 3;
        const similarCars = await storage.getSimilarCars(id, limit);

        res.json(similarCars);
      } catch (error) {
        console.error("Error fetching similar cars:", error);
        res.status(500).json({ message: "Failed to fetch similar cars" });
      }
    },
  );

  // Create a new car listing - Admin only
  app.post(
    `${apiPrefix}/cars`,
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const validationResult = carValidationSchema.safeParse(req.body);

        if (!validationResult.success) {
          const errorMessage = fromZodError(validationResult.error).message;
          return res.status(400).json({ message: errorMessage });
        }

        const newCar = await storage.createCar(validationResult.data);
        res.status(201).json(newCar);
      } catch (error) {
        console.error("Error creating car:", error);
        res.status(500).json({ message: "Failed to create car listing" });
      }
    },
  );

  // Update a car listing - Admin only
  app.patch(
    `${apiPrefix}/cars/:id`,
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid car ID" });
        }

        const car = await storage.getCarById(id);
        if (!car) {
          return res.status(404).json({ message: "Car not found" });
        }

        const updatedCar = await storage.updateCar(id, req.body);
        res.json(updatedCar);
      } catch (error) {
        console.error("Error updating car:", error);
        res.status(500).json({ message: "Failed to update car listing" });
      }
    },
  );

  // Delete a car listing - Admin only
  app.delete(
    `${apiPrefix}/cars/:id`,
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid car ID" });
        }

        const success = await storage.deleteCar(id);
        if (!success) {
          return res.status(404).json({ message: "Car not found" });
        }

        res.status(204).end();
      } catch (error) {
        console.error("Error deleting car:", error);
        res.status(500).json({ message: "Failed to delete car listing" });
      }
    },
  );

  // Submit contact message
  app.post(`${apiPrefix}/contact`, async (req: Request, res: Response) => {
    try {
      const validationResult = insertContactSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      const newMessage = await storage.createContactMessage(
        validationResult.data,
      );

      // Get car details if this inquiry is about a specific car
      let carDetails = "";
      if (validationResult.data.carId) {
        try {
          const car = await storage.getCarById(validationResult.data.carId);
          if (car) {
            carDetails = `
Car Details:
Make: ${car.make}
Model: ${car.model}
Year: ${car.year}
Price: $${car.price.toLocaleString()}
VIN: ${car.vin || "Not specified"}
`;
          }
        } catch (carError) {
          console.error("Error getting car details for email:", carError);
        }
      }

      // Create detailed email content
      const emailContent = `
NEW INQUIRY FROM Auto Korea Kosova Import WEBSITE

Customer Information:
Name: ${validationResult.data.name}
Email: ${validationResult.data.email}
Phone: ${validationResult.data.phone || "Not provided"}

Subject: ${validationResult.data.subject || "Car Inquiry"}

Message:
${validationResult.data.message}

${carDetails}

This message was sent from the Auto Korea Kosova Import website contact form at ${new Date().toLocaleString()}.
`.trim();

      try {
        // Send email using Sendinblue/Brevo
        await storage.sendEmail({
          to: "order.autokorea@gmail.com", // Replace with your desired recipient email
          subject: `Auto Korea Kosova Import Inquiry: ${
            validationResult.data.subject ||
            (validationResult.data.carId
              ? "Car #" + validationResult.data.carId
              : "General Inquiry")
          }`,
          text: emailContent,
        });
        console.log("Contact form email sent successfully");
      } catch (emailError) {
        console.error("Failed to send contact form email:", emailError);
        // Continue with response even if email fails
      }

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to submit contact message" });
    }
  });

  // Get contact messages for a car
  app.get(
    `${apiPrefix}/contact/:carId`,
    async (req: Request, res: Response) => {
      try {
        const carId = parseInt(req.params.carId);
        if (isNaN(carId)) {
          return res.status(400).json({ message: "Invalid car ID" });
        }

        const messages = await storage.getContactMessagesForCar(carId);
        res.json(messages);
      } catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({ message: "Failed to fetch contact messages" });
      }
    },
  );

  // Get all contact messages - Admin only
  app.get(
    `${apiPrefix}/contact`,
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const messages = await storage.getAllContactMessages();
        res.json(messages);
      } catch (error) {
        console.error("Error fetching all contact messages:", error);
        res.status(500).json({ message: "Failed to fetch contact messages" });
      }
    },
  );

  // Wishlist routes
  app.post(`${apiPrefix}/wishlists`, async (req: Request, res: Response) => {
    try {
      const wishlistData = req.body;

      // Create a unique share ID if not provided
      if (!wishlistData.shareId) {
        wishlistData.shareId = `share_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      }

      // Validate data using Zod
      const validationResult = insertWishlistSchema.safeParse(wishlistData);

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      // Create wishlist in storage
      const newWishlist = await storage.createWishlist(validationResult.data);

      // Return the created wishlist
      res.status(201).json(newWishlist);
    } catch (error) {
      console.error("Error creating wishlist:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(
    `${apiPrefix}/wishlists/user/:userId`,
    async (req: Request, res: Response) => {
      try {
        const userId = req.params.userId;
        const wishlists = await storage.getUserWishlists(userId);
        res.status(200).json(wishlists);
      } catch (error) {
        console.error("Error fetching user wishlists:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.get(`${apiPrefix}/wishlists/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid wishlist ID" });
      }

      const wishlist = await storage.getWishlistById(id);

      if (wishlist) {
        res.status(200).json(wishlist);
      } else {
        res.status(404).json({ message: "Wishlist not found" });
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(
    `${apiPrefix}/wishlists/share/:shareId`,
    async (req: Request, res: Response) => {
      try {
        const shareId = req.params.shareId;
        const wishlist = await storage.getWishlistByShareId(shareId);

        if (wishlist) {
          res.status(200).json(wishlist);
        } else {
          res.status(404).json({ message: "Shared wishlist not found" });
        }
      } catch (error) {
        console.error("Error fetching shared wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.patch(
    `${apiPrefix}/wishlists/:id`,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid wishlist ID" });
        }

        const updateData = req.body;

        // Update wishlist in storage
        const updatedWishlist = await storage.updateWishlist(id, updateData);

        if (updatedWishlist) {
          res.status(200).json(updatedWishlist);
        } else {
          res.status(404).json({ message: "Wishlist not found" });
        }
      } catch (error) {
        console.error("Error updating wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.delete(
    `${apiPrefix}/wishlists/:id`,
    async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid wishlist ID" });
        }

        const success = await storage.deleteWishlist(id);

        if (success) {
          res.status(200).json({ message: "Wishlist deleted successfully" });
        } else {
          res.status(404).json({ message: "Wishlist not found" });
        }
      } catch (error) {
        console.error("Error deleting wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  // Debug endpoint to view database state (admin only)
  app.get("/api/debug/db", isAdmin, async (req, res) => {
    try {
      // Use public methods instead of accessing private properties
      const dbState = {
        cars: await storage.getAllCars(),
        // Add other data that might be useful for debugging
        // We don't expose users or contact messages for privacy reasons
      };
      res.json(dbState);
    } catch (error) {
      console.error("Error in debug endpoint:", error);
      res.status(500).json({ message: "Error retrieving debug data" });
    }
  });

  // File upload endpoint
  app.post(
    `${apiPrefix}/upload`,
    upload.single("image"),
    (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Return the path to the uploaded file
        const filePath = `/uploads/${req.file.filename}`;
        res.json({
          url: filePath,
          originalname: req.file.originalname,
          filename: req.file.filename,
          size: req.file.size,
        });
      } catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({ message: "File upload failed" });
      }
    },
  );

  // Import routes for car data
  app.post(
    `${apiPrefix}/cars/import/bmw`,
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        // Sample BMW cars with Unsplash image URLs
        const sampleCars = [
          {
            make: "BMW",
            model: "320i",
            year: 2022,
            price: 36000,
            mileage: 15000,
            fuelType: "Gasoline",
            transmission: "Automatic",
            drivetrain: "RWD",
            exteriorColor: "Alpine White",
            interiorColor: "Black",
            description:
              "2022 BMW 320i with Sport Package. Features include sport seats, sport suspension, and BMW M Sport steering wheel. The vehicle comes with a 2.0L turbocharged engine providing excellent performance and fuel efficiency.",
            sellerName: "Import Motors",
            sellerPhone: "+82-1234-5678",
            sellerEmail: "order.autokorea@gmail.com",
            sellerLocation: "Seoul, South Korea",
            images: [
              "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            ],
            isFeatured: Math.random() > 0.7,
          },
          {
            make: "BMW",
            model: "330i xDrive",
            year: 2021,
            price: 42000,
            mileage: 22000,
            fuelType: "Gasoline",
            transmission: "Automatic",
            drivetrain: "AWD",
            exteriorColor: "Black Sapphire",
            interiorColor: "Cognac",
            description:
              "2021 BMW 330i xDrive with Executive Package. All-wheel drive provides excellent traction in all weather conditions. Features include premium sound system, heated seats, and advanced driver assistance systems.",
            sellerName: "Import Motors",
            sellerPhone: "+82-1234-5678",
            sellerEmail: "order.autokorea@gmail.com",
            sellerLocation: "Seoul, South Korea",
            images: [
              "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            ],
            isFeatured: Math.random() > 0.7,
          },
          {
            make: "BMW",
            model: "M340i",
            year: 2020,
            price: 48000,
            mileage: 35000,
            fuelType: "Gasoline",
            transmission: "Automatic",
            drivetrain: "RWD",
            exteriorColor: "Portimao Blue",
            interiorColor: "Black",
            description:
              "2020 BMW M340i with M Sport Package. This high-performance variant of the 3 Series features a 3.0L inline-6 turbocharged engine producing 382 horsepower. Includes adaptive M suspension, M Sport differential, and M Sport brakes.",
            sellerName: "Import Motors",
            sellerPhone: "+82-1234-5678",
            sellerEmail: "order.autokorea@gmail.com",
            sellerLocation: "Seoul, South Korea",
            images: [
              "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            ],
            isFeatured: Math.random() > 0.7,
          },
          {
            make: "BMW",
            model: "430i Coupe",
            year: 2022,
            price: 45500,
            mileage: 8000,
            fuelType: "Gasoline",
            transmission: "Automatic",
            drivetrain: "RWD",
            exteriorColor: "Arctic Race Blue",
            interiorColor: "Oyster",
            description:
              "2022 BMW 430i Coupe with M Sport Package. This elegant two-door coupe features BMWs latest technology and premium finishes. Equipped with a 2.0L TwinPower Turbo engine and 8-speed automatic transmission.",
            sellerName: "Import Motors",
            sellerPhone: "+82-1234-5678",
            sellerEmail: "order.autokorea@gmail.com",
            sellerLocation: "Seoul, South Korea",
            images: [
              "https://images.unsplash.com/photo-1543465077-db45d34b88a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            ],
            isFeatured: Math.random() > 0.7,
          },
          {
            make: "BMW",
            model: "X3 xDrive30i",
            year: 2021,
            price: 47000,
            mileage: 18000,
            fuelType: "Gasoline",
            transmission: "Automatic",
            drivetrain: "AWD",
            exteriorColor: "Phytonic Blue",
            interiorColor: "Cognac",
            description:
              "2021 BMW X3 xDrive30i with Premium Package. This luxury compact SUV offers the perfect blend of performance and practicality. Features include panoramic sunroof, heated seats, and driver assistance systems.",
            sellerName: "Import Motors",
            sellerPhone: "+82-1234-5678",
            sellerEmail: "order.autokorea@gmail.com",
            sellerLocation: "Seoul, South Korea",
            images: [
              "https://images.unsplash.com/photo-1622390349663-1cbe2ec9bec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym13JTIweDN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1000&q=80",
            ],
            isFeatured: Math.random() > 0.7,
          },
          {
            make: "BMW",
            model: "X5 xDrive40i",
            year: 2022,
            price: 65000,
            mileage: 12000,
            fuelType: "Gasoline",
            transmission: "Automatic",
            drivetrain: "AWD",
            exteriorColor: "Mineral White",
            interiorColor: "Coffee",
            description:
              "2022 BMW X5 xDrive40i with Executive Package. This luxury midsize SUV offers exceptional comfort and capability. Features include 3.0L TwinPower Turbo inline-6 engine, third-row seating option, and advanced driver assistance systems.",
            sellerName: "Import Motors",
            sellerPhone: "+82-1234-5678",
            sellerEmail: "order.autokorea@gmail.com",
            sellerLocation: "Seoul, South Korea",
            images: [
              "https://images.unsplash.com/photo-1570356528233-b442cf2de345?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            ],
            isFeatured: Math.random() > 0.7,
          },
          {
            make: "BMW",
            model: "i4 eDrive40",
            year: 2022,
            price: 56000,
            mileage: 5000,
            fuelType: "Electric",
            transmission: "Automatic",
            drivetrain: "RWD",
            exteriorColor: "Mineral White",
            interiorColor: "Black",
            description:
              "2022 BMW i4 eDrive40 Gran Coupe. This all-electric sedan offers impressive range and performance. Features include 335 horsepower electric motor, up to 301 miles of range, and BMWs latest iDrive 8 system with curved display.",
            sellerName: "Import Motors",
            sellerPhone: "+82-1234-5678",
            sellerEmail: "order.autokorea@gmail.com",
            sellerLocation: "Seoul, South Korea",
            images: [
              "https://images.unsplash.com/photo-1655270001527-30d32aafb3bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            ],
            isFeatured: Math.random() > 0.7,
          },
          {
            make: "BMW",
            model: "iX xDrive50",
            year: 2022,
            price: 84000,
            mileage: 3000,
            fuelType: "Electric",
            transmission: "Automatic",
            drivetrain: "AWD",
            exteriorColor: "Sophisto Grey",
            interiorColor: "Stone Grey",
            description:
              "2022 BMW iX xDrive50. BMWs flagship electric SUV offers cutting-edge technology and sustainable luxury. Features include dual electric motors producing 516 horsepower, over 300 miles of range, and fast charging capability.",
            sellerName: "Import Motors",
            sellerPhone: "+82-1234-5678",
            sellerEmail: "order.autokorea@gmail.com",
            sellerLocation: "Seoul, South Korea",
            images: [
              "https://images.unsplash.com/photo-1656468014942-526429b23cc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            ],
            isFeatured: Math.random() > 0.7,
          },
        ];

        // Import cars one by one
        const importedCars = [];
        for (const carData of sampleCars) {
          try {
            const result = await storage.createCar(carData);
            importedCars.push(result);
          } catch (error) {
            console.error("Failed to import car:", error);
          }
        }

        return res.status(200).json({
          success: true,
          cars: importedCars,
          message: `Successfully imported ${importedCars.length} BMW cars`,
        });
      } catch (error: any) {
        console.error("BMW import failed:", error);
        return res.status(500).json({
          success: false,
          message: `Import failed: ${error.message}`,
        });
      }
    },
  );

  // Encar.com import route
  app.post(
    `${apiPrefix}/cars/import/encar`,
    isAdmin,
    async (req: Request, res: Response) => {
      try {
        const { url } = req.body;

        if (!url) {
          return res.status(400).json({
            success: false,
            message: "Missing URL parameter",
          });
        }

        console.log(`Received Encar.com API import request for URL: ${url}`);

        const { default: axios } = await import("axios");

        const getExchangeRate = async (
          from: string,
          to: string,
        ): Promise<number> => {
          try {
            const { default: axios } = await import("axios");

            const res = await axios.get(`https://api.frankfurter.app/latest`, {
              params: { from, to },
            });

            const rate = res.data?.rates?.[to];
            if (rate) {
              console.log(`💱 1 ${from} = ${rate} ${to}`);
              return rate;
            } else {
              console.error("Invalid response:", res.data);
              return 0;
            }
          } catch (err) {
            console.error("Error fetching exchange rate:", err);
            return 0;
          }
        };

        const exchangeRate = await getExchangeRate("KRW", "EUR");
        if (!exchangeRate) {
          return res.status(500).json({
            success: false,
            message: "Unable to fetch exchange rate from KRW to EUR",
          });
        }

        const TRANSLATIONS = {
          manufacturer: {
            BMW: "BMW",
            아우디: "Audi",
            별츠: "Mercedes-Benz",
            현대: "Hyundai",
            기아: "Kia",
            포스바건: "Volkswagen",
            루노산성: "Renault Samsung",
            쉘버레: "Chevrolet",
            토요타: "Toyota",
            렙서스: "Lexus",
            포드: "Ford",
            볼보: "Volvo",
            지프: "Jeep",
            미니: "Mini",
            푸조: "Peugeot",
            닌산: "Nissan",
            인피니티: "Infiniti",
            카드라드: "Cadillac",
            크라이슬러: "Chrysler",
            링컴: "Lincoln",
            테슬라: "Tesla",
            재귀어: "Jaguar",
            랜드로버: "Land Rover",
          },
          fuelType: {
            디젤: "Diesel",
            디젠: "Diesel",
            가솔린: "Gasoline",
            하이브리드: "Hybrid",
            전기: "Electric",
            LPG: "LPG",
          },
          modelGroup: {
            "1시리즈": "1 Series",
            "2시리즈": "2 Series",
            "3시리즈": "3 Series",
            "4시리즈": "4 Series",
            "5시리즈": "5 Series",
            "6시리즈": "6 Series",
            "7시리즈": "7 Series",
            "8시리즈": "8 Series",
            "뉴 5시리즈": "New 5 Series",
            X1: "X1",
            X2: "X2",
            X3: "X3",
            X4: "X4",
            X5: "X5",
            X6: "X6",
            X7: "X7",
            i3: "i3",
            i4: "i4",
            i5: "i5",
            i7: "i7",
            iX: "iX",
            Z4: "Z4",
          },
          condition: {
            Inspection: "Inspected",
            InspectionDirect: "Direct Inspection",
            Record: "Service History",
            Resume: "Resume Available",
          },
          transmission: {
            오토: "Automatic",
            수동: "Manual",
            세미오토: "Semi-Automatic",
            CVT: "CVT",
            기타: "etc",
          },
          color: {
            검정색: "Black",
            흰색: "White",
            회색: "Gray",
            은색: "Silver",
            청색: "Blue",
            남색: "Navy",
            파란색: "Blue",
            하늘색: "Sky Blue",
            빨간색: "Red",
            자주색: "Burgundy",
            분홍색: "Pink",
            주황색: "Orange",
            주황빛: "Orange Tint",
            노란색: "Yellow",
            갈색: "Brown",
            초록색: "Green",
            연두색: "Light Green",
            베이지색: "Beige",
            금색: "Gold",
            보라색: "Purple",
            청회색: "Blue Gray",
            진회색: "Dark Gray",
            진청색: "Dark Blue",
            진주색: "Pearl",
            카키색: "Khaki",
            아이보리: "Ivory",
            와인색: "Wine",
            민트색: "Mint",
            기타: "Other",
            쥐색: "Mouse gray",
            은회색: "Silver gray",
          },
          type: {
            중형차: "Midsize car",
            스포츠카: "Sports car",
            대형차: "Large car",
            SUV: "SUV",
            준중형차: "Compact car",
          },
        };

        const translate = (value: string, map: Record<string, string>) => {
          if (!value || typeof value !== "string") return value;
          return map[value.trim()] || value;
        };

        const response = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        });

        const data = response.data;
        if (!data || !Array.isArray(data.SearchResults)) {
          return res.status(422).json({
            success: false,
            message: "Invalid API response format",
          });
        }

        const rawCars = data.SearchResults;
        const importedCars: any[] = [];

        for (const car of rawCars) {
          try {
            const carDetailRes = await axios.get(
              `https://api.encar.com/v1/readside/vehicle/${car.Id}`,
            );
            const carDetail = carDetailRes.data;

            // 🚫 Skip if the car is webReserved
            if (carDetail?.manage?.webReserved) {
              console.log(`🚫 Skipping reserved car: ${car.Id}`);
              continue;
            }

            const phoneNumbers = [
              "+38345255388",
              "+38345432999",
              "+38349854504",
            ];
            const randomPhone =
              phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];

            const translatedConditions = (car.Condition || []).map((c) =>
              translate(c, TRANSLATIONS.condition),
            );
            const translatedServices = (car.ServiceMark || []).map((s) => s);
            const translatedManufacturer = translate(
              car.Manufacturer,
              TRANSLATIONS.manufacturer,
            );
            const translatedModel = translate(
              car.Model,
              TRANSLATIONS.modelGroup,
            );
            const translatedFuel = translate(
              carDetail.spec?.fuelName,
              TRANSLATIONS.fuelType,
            );
            const translatedTranssmision = translate(
              carDetail.spec?.transmissionName,
              TRANSLATIONS.transmission,
            );
            const translatedCarColor = translate(
              carDetail.spec?.colorName,
              TRANSLATIONS.color,
            );

            const translatedType = translate(
              carDetail.spec?.bodyName,
              TRANSLATIONS.type,
            );

            const displacement = carDetail.spec?.displacement || null;
            const transmission = translatedTranssmision || "Unknown";
            const fuelType = translatedFuel || "Other";
            const exteriorColor = translatedCarColor || "Unknown";
            const interiorColor = "Unknown";
            const bodyType = translatedType || "";
            const seatCount = carDetail.spec?.seatCount || null;
            const extraDescription =
              carDetail.contents?.text?.replace(/\r\n/g, "\n") || "";
            const vehiclePhotos = carDetail.photos || [];
            const images = vehiclePhotos.map(
              (photo) =>
                `http://ci.encar.com${photo.path}?impolicy=heightRate&rh=696&cw=1160&ch=696&cg=Center&wtmk=http://ci.encar.com/wt_mark/w_mark_04.png&wtmkg=SouthEast&wtmkw=70&wtmkh=30`,
            );

            const description = `Imported from Encar.\n\nTrim: ${
              car.Badge || "N/A"
            }\nCondition: ${translatedConditions.join(
              ", ",
            )}\nService: ${translatedServices.join(", ")}\n\n${extraDescription}`;

            const year = parseInt(car.FormYear);
            const mileage = parseInt(car.Mileage);
            let basePrice = Math.round(car.Price * 10000 * exchangeRate);
            let finalPrice = basePrice;

            if (basePrice < 12000) {
              finalPrice += 3050;
            } else if (basePrice >= 12000 && basePrice < 24000) {
              finalPrice += 3550;
            } else if (basePrice >= 24000 && basePrice < 40000) {
              finalPrice += 4050;
            } else if (basePrice >= 40000) {
              finalPrice += 5050;
            }

            const transformedCar = {
              car_id: car.Id,
              full_name:
                carDetail?.category?.manufacturerEnglishName +
                " " +
                carDetail?.category?.modelGroupEnglishName +
                " " +
                carDetail?.category?.gradeEnglishName,
              make:
                carDetail?.category?.manufacturerEnglishName ||
                translatedManufacturer ||
                car.Manufacturer ||
                "Unknown",
              model:
                carDetail?.category?.modelGroupEnglishName ||
                car.Badge ||
                translatedModel ||
                car.Model ||
                "Unknown",
              grade:
                carDetail?.category?.gradeEnglishName ||
                car.Badge ||
                translatedModel ||
                car.Model ||
                "Unknown",
              year,
              price: finalPrice,
              mileage,
              fuelType,
              type: bodyType,
              transmission,
              drivetrain: "RWD",
              displacement,
              seatCount,
              exteriorColor,
              interiorColor,
              description,
              sellerName: "Auto Korea Kosova Import",
              sellerPhone: randomPhone,
              sellerEmail: "order.autokorea@gmail.com",
              sellerLocation: car.OfficeCityState || "Korea",
              images,
              isFeatured: Math.random() > 0.7,
              warranty: {
                bodyMonth: carDetail?.category?.warranty?.bodyMonth || 0,
                bodyMileage: carDetail?.category?.warranty?.bodyMileage || 0,
                transmissionMonth:
                  carDetail?.category?.warranty?.transmissionMonth || 0,
                transmissionMileage:
                  carDetail?.category?.warranty?.transmissionMileage || 0,
              },
              dealer: {
                name: carDetail?.partnership?.dealer?.name || null,
                firm: carDetail?.partnership?.dealer?.firm?.name || null,
                location:
                  carDetail?.partnership?.dealer?.firm?.diagnosisCenters?.[0]
                    ?.address || null,
                phone:
                  carDetail?.partnership?.dealer?.firm?.diagnosisCenters?.[0]
                    ?.telephoneNumber || null,
              },
              options: carDetail?.options?.standard || [],
              originalPriceKRW: carDetail?.category?.originPrice || null,
              registrationDate: carDetail?.manage?.registDateTime || null,
              viewCount: carDetail?.manage?.viewCount || 0,
              subscriberCount: carDetail?.manage?.subscribeCount || 0,
            };

            // const transformedCar = {
            //   car_id: car.Id,
            //   make: translatedManufacturer || car.Manufacturer || "Unknown",
            //   model: car.Badge || translatedModel || car.Model || "Unknown",
            //   year,
            //   price: finalPrice,
            //   mileage,
            //   fuelType: translatedFuel || "Other",
            //   type: "",
            //   transmission: "Automatic",
            //   drivetrain: "RWD",
            //   exteriorColor: "Silver",
            //   interiorColor: "Black",
            //   description: `Imported from Encar. Trim: ${car.Badge || "N/A"}, Condition: ${translatedConditions.join(", ")}, Service: ${translatedServices.join(", ")}`,
            //   sellerName: "Auto Korea Kosova Import",
            //   sellerPhone: randomPhone,
            //   sellerEmail: "order.autokorea@gmail.com",
            //   sellerLocation: car.OfficeCityState || "Korea",
            //   images,
            //   isFeatured: Math.random() > 0.7,
            // };

            // const transformedCar = {
            //   car_id: car.Id,
            //   make: translatedManufacturer || car.Manufacturer || "Unknown",
            //   model: car.Badge || translatedModel || car.Model || "Unknown",
            //   year,
            //   price: finalPrice,
            //   mileage,
            //   fuelType: translatedFuel || "Other",
            //   type: "",
            //   transmission: "Automatic",
            //   drivetrain: "RWD",
            //   exteriorColor: "Silver",
            //   interiorColor: "Black",
            //   description: `Imported from Encar. Trim: ${car.Badge || "N/A"}, Condition: ${translatedConditions.join(", ")}, Service: ${translatedServices.join(", ")}`,
            //   sellerName: "Auto Korea Kosova Import",
            //   sellerPhone: randomPhone,
            //   sellerEmail: "order.autokorea@gmail.com",
            //   sellerLocation: car.OfficeCityState || "Korea",
            //   images,
            //   isFeatured: Math.random() > 0.7,
            // };

            const savedCar = await storage.createCar(transformedCar);
            importedCars.push(savedCar);
            console.log(
              `✅ Imported: ${transformedCar.year} ${transformedCar.make} ${transformedCar.model}`,
            );

            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (err) {
            console.error(`❌ Failed to import car: ${car.Badge}`, err);
          }
        }

        if (importedCars.length > 0) {
          return res.status(200).json({
            success: true,
            message: `Successfully imported ${importedCars.length} cars from Encar.com API`,
            cars: importedCars,
          });
        } else {
          throw new Error("No cars were imported from API response");
        }
      } catch (error: any) {
        console.error("Encar API import failed:", error);
        return res.status(500).json({
          success: false,
          message: `Import failed: ${error.message}`,
        });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}
