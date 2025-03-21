import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { carFilterSchema, carValidationSchema, insertContactSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = '/api';

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
      if (req.query.minYear) filter.minYear = parseInt(req.query.minYear as string);
      if (req.query.maxYear) filter.maxYear = parseInt(req.query.maxYear as string);
      if (req.query.fuelType) filter.fuelType = req.query.fuelType as string;
      if (req.query.transmission) filter.transmission = req.query.transmission as string;
      if (req.query.search) filter.search = req.query.search as string;
      
      const validationResult = carFilterSchema.safeParse(filter);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }

      const filteredCars = await storage.filterCars(validationResult.data);
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

  // Create a new car listing
  app.post(`${apiPrefix}/cars`, async (req: Request, res: Response) => {
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

  // Update a car listing
  app.patch(`${apiPrefix}/cars/:id`, async (req: Request, res: Response) => {
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

  // Delete a car listing
  app.delete(`${apiPrefix}/cars/:id`, async (req: Request, res: Response) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
