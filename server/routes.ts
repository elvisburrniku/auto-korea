import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { carFilterSchema, carValidationSchema, insertContactSchema, insertWishlistSchema, loginSchema, insertUserSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized. Please login to continue.' });
  }
  next();
};

// Middleware to check if the user is an admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req.session as any)?.user;
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = '/api';
  
  // Configure multer for file uploads
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  
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
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (_req, file, cb) => {
      // Accept images only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  });

  // Authentication routes

  // Register route
  app.post(`${apiPrefix}/auth/register`, async (req: Request, res: Response) => {
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
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      // Create new user (non-admin by default)
      const newUser = await storage.createUser(userData);
      
      // Store user in session
      (req.session as any).user = {
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.isAdmin
      };
      
      await new Promise((resolve) => req.session.save(resolve));
      
      res.status(201).json({ 
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

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
      console.log("User found:", user ? "Yes" : "No", user ? `Admin: ${user.isAdmin}` : "");

      if (!user || user.password !== password) {
        console.log("Authentication failed: Invalid credentials");
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Store user in session
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      };
      
      console.log("Session before save:", req.session);
      await new Promise((resolve) => req.session.save(resolve));
      console.log("Session after save:", req.session);

      res.json({ 
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Logout route
  app.post(`${apiPrefix}/auth/logout`, (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
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
          isAdmin: user.isAdmin
        } 
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Get all cars
  app.get(`${apiPrefix}/cars`, async (req: Request, res: Response) => {
    try {
      const cars = await storage.getAllCars();
      res.json(cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      res.status(500).json({ message: 'Failed to fetch cars' });
    }
  });

  // Filter cars - Moving this route before the :id route is crucial
  app.get(`${apiPrefix}/cars/filter`, async (req: Request, res: Response) => {
    try {
      // Convert query params to the right types
      const filter: Record<string, any> = {};

      if (req.query.make) filter.make = req.query.make as string;
      if (req.query.model) filter.model = req.query.model as string;
      if (req.query.minPrice) filter.minPrice = parseInt(req.query.minPrice as string);
      if (req.query.maxPrice) filter.maxPrice = parseInt(req.query.maxPrice as string);
      if (req.query.minYear) {
        filter.minYear = parseInt(req.query.minYear as string);
        console.log(`Setting minYear filter to: ${filter.minYear}`);
      }
      if (req.query.maxYear) {
        filter.maxYear = parseInt(req.query.maxYear as string);
        console.log(`Setting maxYear filter to: ${filter.maxYear}`);
      }
      if (req.query.fuelType) filter.fuelType = req.query.fuelType as string;
      if (req.query.transmission) filter.transmission = req.query.transmission as string;
      if (req.query.search) filter.search = req.query.search as string;

      console.log('Filter query parameters:', req.query);
      console.log('Constructed filter object:', filter);

      const validationResult = carFilterSchema.safeParse(filter);

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        console.error('Filter validation failed:', errorMessage);
        return res.status(400).json({ message: errorMessage });
      }

      const allCars = await storage.getAllCars();
      console.log('Total cars before filtering:', allCars.length);

      const filteredCars = await storage.filterCars(validationResult.data);
      console.log('Filtered cars count:', filteredCars.length);

      res.json(filteredCars);
    } catch (error) {
      console.error('Error filtering cars:', error);
      res.status(500).json({ message: 'Failed to filter cars' });
    }
  });

  // Get featured cars - Moving this route before the :id route as well
  app.get(`${apiPrefix}/cars/featured/list`, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const featuredCars = await storage.getFeaturedCars(limit);
      res.json(featuredCars);
    } catch (error) {
      console.error('Error fetching featured cars:', error);
      res.status(500).json({ message: 'Failed to fetch featured cars' });
    }
  });

  // Get recent cars - Moving this route before the :id route as well
  app.get(`${apiPrefix}/cars/recent/list`, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const recentCars = await storage.getRecentCars(limit);
      res.json(recentCars);
    } catch (error) {
      console.error('Error fetching recent cars:', error);
      res.status(500).json({ message: 'Failed to fetch recent cars' });
    }
  });

  // Get a specific car by ID - This should come after all specific /cars/* routes
  app.get(`${apiPrefix}/cars/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid car ID' });
      }

      const car = await storage.getCarById(id);
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }

      res.json(car);
    } catch (error) {
      console.error('Error fetching car:', error);
      res.status(500).json({ message: 'Failed to fetch car' });
    }
  });
  
  // Get similar cars
  app.get(`${apiPrefix}/cars/:id/similar`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid car ID' });
      }

      const limit = parseInt(req.query.limit as string) || 3;
      const similarCars = await storage.getSimilarCars(id, limit);
      
      res.json(similarCars);
    } catch (error) {
      console.error('Error fetching similar cars:', error);
      res.status(500).json({ message: 'Failed to fetch similar cars' });
    }
  });

  // Create a new car listing - Admin only
  app.post(`${apiPrefix}/cars`, isAdmin, async (req: Request, res: Response) => {
    try {
      const validationResult = carValidationSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      const newCar = await storage.createCar(validationResult.data);
      res.status(201).json(newCar);
    } catch (error) {
      console.error('Error creating car:', error);
      res.status(500).json({ message: 'Failed to create car listing' });
    }
  });

  // Update a car listing - Admin only
  app.patch(`${apiPrefix}/cars/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid car ID' });
      }

      const car = await storage.getCarById(id);
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }

      const updatedCar = await storage.updateCar(id, req.body);
      res.json(updatedCar);
    } catch (error) {
      console.error('Error updating car:', error);
      res.status(500).json({ message: 'Failed to update car listing' });
    }
  });

  // Delete a car listing - Admin only
  app.delete(`${apiPrefix}/cars/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid car ID' });
      }

      const success = await storage.deleteCar(id);
      if (!success) {
        return res.status(404).json({ message: 'Car not found' });
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting car:', error);
      res.status(500).json({ message: 'Failed to delete car listing' });
    }
  });

  // Submit contact message
  app.post(`${apiPrefix}/contact`, async (req: Request, res: Response) => {
    try {
      const validationResult = insertContactSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      const newMessage = await storage.createContactMessage(validationResult.data);
      
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
VIN: ${car.vin || 'Not specified'}
`;
          }
        } catch (carError) {
          console.error('Error getting car details for email:', carError);
        }
      }
      
      // Create detailed email content
      const emailContent = `
NEW INQUIRY FROM AUTOMARKET WEBSITE

Customer Information:
Name: ${validationResult.data.name}
Email: ${validationResult.data.email}
Phone: ${validationResult.data.phone || 'Not provided'}

Subject: ${validationResult.data.subject || 'Car Inquiry'}

Message:
${validationResult.data.message}

${carDetails}

This message was sent from the AutoMarket website contact form at ${new Date().toLocaleString()}.
`.trim();
      
      try {
        // Send email using Sendinblue/Brevo
        await storage.sendEmail({
          to: 'order.autokorea@gmail.com', // Replace with your desired recipient email
          subject: `AutoMarket Inquiry: ${validationResult.data.subject || (validationResult.data.carId ? 'Car #' + validationResult.data.carId : 'General Inquiry')}`,
          text: emailContent
        });
        console.log('Contact form email sent successfully');
      } catch (emailError) {
        console.error('Failed to send contact form email:', emailError);
        // Continue with response even if email fails
      }
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error creating contact message:', error);
      res.status(500).json({ message: 'Failed to submit contact message' });
    }
  });

  // Get contact messages for a car
  app.get(`${apiPrefix}/contact/:carId`, async (req: Request, res: Response) => {
    try {
      const carId = parseInt(req.params.carId);
      if (isNaN(carId)) {
        return res.status(400).json({ message: 'Invalid car ID' });
      }

      const messages = await storage.getContactMessagesForCar(carId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      res.status(500).json({ message: 'Failed to fetch contact messages' });
    }
  });

  // Get all contact messages - Admin only
  app.get(`${apiPrefix}/contact`, isAdmin, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching all contact messages:', error);
      res.status(500).json({ message: 'Failed to fetch contact messages' });
    }
  });

  // Wishlist routes
  app.post(`${apiPrefix}/wishlists`, async (req: Request, res: Response) => {
    try {
      const wishlistData = req.body;
      
      // Create a unique share ID if not provided
      if (!wishlistData.shareId) {
        wishlistData.shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      console.error('Error creating wishlist:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/wishlists/user/:userId`, async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const wishlists = await storage.getUserWishlists(userId);
      res.status(200).json(wishlists);
    } catch (error) {
      console.error('Error fetching user wishlists:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/wishlists/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid wishlist ID' });
      }
      
      const wishlist = await storage.getWishlistById(id);
      
      if (wishlist) {
        res.status(200).json(wishlist);
      } else {
        res.status(404).json({ message: "Wishlist not found" });
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/wishlists/share/:shareId`, async (req: Request, res: Response) => {
    try {
      const shareId = req.params.shareId;
      const wishlist = await storage.getWishlistByShareId(shareId);
      
      if (wishlist) {
        res.status(200).json(wishlist);
      } else {
        res.status(404).json({ message: "Shared wishlist not found" });
      }
    } catch (error) {
      console.error('Error fetching shared wishlist:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(`${apiPrefix}/wishlists/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid wishlist ID' });
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
      console.error('Error updating wishlist:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiPrefix}/wishlists/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid wishlist ID' });
      }
      
      const success = await storage.deleteWishlist(id);
      
      if (success) {
        res.status(200).json({ message: "Wishlist deleted successfully" });
      } else {
        res.status(404).json({ message: "Wishlist not found" });
      }
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

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
      console.error('Error in debug endpoint:', error);
      res.status(500).json({ message: 'Error retrieving debug data' });
    }
  });
  
  // File upload endpoint
  app.post(`${apiPrefix}/upload`, upload.single('image'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Return the path to the uploaded file
      const filePath = `/uploads/${req.file.filename}`;
      res.json({ 
        url: filePath,
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'File upload failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}