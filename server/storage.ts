import { Car, InsertCar, CarFilter, ContactMessage, InsertContactMessage, User, InsertUser, Wishlist, InsertWishlist } from "@shared/schema";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Car operations
  getAllCars(): Promise<Car[]>;
  getCarById(id: number): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, car: Partial<InsertCar>): Promise<Car | undefined>;
  deleteCar(id: number): Promise<boolean>;
  getFeaturedCars(limit?: number): Promise<Car[]>;
  getRecentCars(limit?: number): Promise<Car[]>;
  filterCars(filter: CarFilter): Promise<Car[]>;
  getSimilarCars(carId: number, limit?: number): Promise<Car[]>;

  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessagesForCar(carId: number): Promise<ContactMessage[]>;
  
  // Wishlist operations
  createWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  getWishlistById(id: number): Promise<Wishlist | undefined>;
  getWishlistByShareId(shareId: string): Promise<Wishlist | undefined>;
  getUserWishlists(userId: string): Promise<Wishlist[]>;
  updateWishlist(id: number, wishlist: Partial<InsertWishlist>): Promise<Wishlist | undefined>;
  deleteWishlist(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cars: Map<number, Car>;
  private contactMessages: Map<number, ContactMessage>;
  private wishlists: Map<number, Wishlist>;
  private userIdCounter: number;
  private carIdCounter: number;
  private messageIdCounter: number;
  private wishlistIdCounter: number;

  constructor() {
    this.users = new Map();
    this.cars = new Map();
    this.contactMessages = new Map();
    this.wishlists = new Map();
    this.userIdCounter = 1;
    this.carIdCounter = 1;
    this.messageIdCounter = 1;
    this.wishlistIdCounter = 1;

    // Initialize with some demo cars for testing
    this.initDemoCars();

    // Initialize with admin user
    this.initAdmin();
  }

  private initAdmin() {
    const adminUser: InsertUser = {
      username: "admin",
      password: "admin123", // In a real app, this would be hashed!
      isAdmin: true
    };

    this.createUser(adminUser);
  }

  private initDemoCars() {
    const demoCars: InsertCar[] = [
      {
        make: "BMW",
        model: "3 Series",
        year: 2021,
        price: 42500,
        mileage: 12450,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "RWD",
        exteriorColor: "Alpine White",
        interiorColor: "Black",
        vin: "WBA5R1C50LFH45222",
        engineDetails: "2.0L Turbocharged I4",
        mpg: "25 city / 34 highway",
        description: "Excellent condition BMW 3 Series with premium package. One owner, no accidents.",
        sellerName: "James Wilson",
        sellerPhone: "+1234567890",
        sellerSince: "October 2021",
        images: [
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80"
        ],
        features: ["Leather Seats", "Navigation", "Bluetooth", "Sunroof"],
        isFeatured: true
      },
      {
        make: "Mercedes-Benz",
        model: "C-Class",
        year: 2022,
        price: 47800,
        mileage: 8200,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "RWD",
        exteriorColor: "Polar White",
        interiorColor: "Black/Nappa Leather",
        vin: "WDDZF4JB1KA123456",
        engineDetails: "2.0L Turbocharged I4",
        mpg: "25 city / 35 highway",
        description: "This stunning 2022 Mercedes-Benz C-Class is in excellent condition with only 8,200 miles. One-owner vehicle with a clean history report. Includes premium package and all features listed. Full manufacturer warranty still in effect until 2026. Recent service completed with all maintenance up to date.",
        sellerName: "Sarah Johnson",
        sellerPhone: "+1234567890",
        sellerSince: "May 2022",
        images: [
          "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80"
        ],
        features: ["Premium Audio", "Leather Seats", "Navigation", "Heated Seats"],
        isFeatured: true
      },
      {
        make: "Tesla",
        model: "Model 3",
        year: 2022,
        price: 52900,
        mileage: 5800,
        fuelType: "Electric",
        transmission: "Automatic",
        drivetrain: "AWD",
        exteriorColor: "Red Multi-Coat",
        interiorColor: "Black",
        vin: "5YJ3E1EA1NF123456",
        engineDetails: "Dual Motor Electric",
        mpg: "358 miles range",
        description: "Like-new Tesla Model 3 Long Range AWD. Full self-driving capability included. Premium interior and sound system.",
        sellerName: "Alex Chen",
        sellerPhone: "+1234567890",
        sellerSince: "January 2022",
        images: [
          "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80"
        ],
        features: ["Autopilot", "Premium Interior", "Glass Roof", "Fast Charging"],
        isFeatured: true
      },
      {
        make: "Toyota",
        model: "Camry",
        year: 2021,
        price: 26800,
        mileage: 18500,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "FWD",
        exteriorColor: "Celestial Silver Metallic",
        interiorColor: "Black",
        vin: "4T1BF1FK3MU123456",
        engineDetails: "2.5L I4",
        mpg: "32 city / 38 highway",
        description: "Well-maintained Toyota Camry SE with all service records. Excellent fuel economy and reliability.",
        sellerName: "David Lee",
        sellerPhone: "+1234567890",
        sellerSince: "March 2021",
        images: [
          "https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80"
        ],
        features: ["Backup Camera", "Bluetooth", "Lane Assist", "Adaptive Cruise Control"],
        isFeatured: false
      },
      {
        make: "Honda",
        model: "Accord",
        year: 2020,
        price: 24500,
        mileage: 22150,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "FWD",
        exteriorColor: "Modern Steel Metallic",
        interiorColor: "Gray",
        vin: "1HGCV2F34LA123456",
        engineDetails: "1.5L Turbocharged I4",
        mpg: "30 city / 38 highway",
        description: "Clean Honda Accord with one owner. Well-maintained and in excellent condition. All service records available.",
        sellerName: "Emily Wong",
        sellerPhone: "+1234567890",
        sellerSince: "August 2020",
        images: [
          "https://images.unsplash.com/photo-1551830820-330a71b99659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80"
        ],
        features: ["Apple CarPlay", "Android Auto", "Heated Seats", "Blind Spot Monitor"],
        isFeatured: false
      },
      {
        make: "Audi",
        model: "A4",
        year: 2022,
        price: 39900,
        mileage: 7800,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "AWD",
        exteriorColor: "Mythos Black Metallic",
        interiorColor: "Brown",
        vin: "WAUENAF48NN123456",
        engineDetails: "2.0L Turbocharged I4",
        mpg: "28 city / 35 highway",
        description: "Premium Audi A4 with Quattro AWD. Includes technology package and B&O sound system.",
        sellerName: "Michael Taylor",
        sellerPhone: "+1234567890",
        sellerSince: "November 2021",
        images: [
          "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80"
        ],
        features: ["Virtual Cockpit", "MMI Navigation", "Leather Seats", "Sunroof"],
        isFeatured: false
      },
      {
        make: "Ford",
        model: "Mustang",
        year: 2021,
        price: 44700,
        mileage: 9200,
        fuelType: "Gasoline",
        transmission: "Manual",
        drivetrain: "RWD",
        exteriorColor: "Race Red",
        interiorColor: "Ebony",
        vin: "1FA6P8CF3M5123456",
        engineDetails: "5.0L V8",
        mpg: "22 city / 32 highway",
        description: "Powerful Ford Mustang GT with 6-speed manual transmission. Performance package included.",
        sellerName: "Robert Johnson",
        sellerPhone: "+1234567890",
        sellerSince: "May 2021",
        images: [
          "https://images.unsplash.com/photo-1549399542-7e38945b93c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80"
        ],
        features: ["Performance Package", "SYNC 3", "Digital Gauge Cluster", "Brembo Brakes"],
        isFeatured: false
      }
    ];

    // Add demo cars to storage
    demoCars.forEach(car => {
      const id = this.carIdCounter++;
      const timestamp = new Date();
      this.cars.set(id, { ...car, id, createdAt: timestamp });
    });
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const newUser: User = { ...user, id, createdAt: timestamp };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getAllCars(): Promise<Car[]> {
    return Array.from(this.cars.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCarById(id: number): Promise<Car | undefined> {
    return this.cars.get(id);
  }

  async createCar(car: InsertCar): Promise<Car> {
    const id = this.carIdCounter++;
    const timestamp = new Date();
    const newCar: Car = { ...car, id, createdAt: timestamp };
    this.cars.set(id, newCar);
    return newCar;
  }

  async updateCar(id: number, car: Partial<InsertCar>): Promise<Car | undefined> {
    const existingCar = this.cars.get(id);
    if (!existingCar) return undefined;

    const updatedCar = { ...existingCar, ...car };
    this.cars.set(id, updatedCar);
    return updatedCar;
  }

  async deleteCar(id: number): Promise<boolean> {
    return this.cars.delete(id);
  }

  async getFeaturedCars(limit: number = 3): Promise<Car[]> {
    return Array.from(this.cars.values())
      .filter(car => car.isFeatured)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getRecentCars(limit: number = 4): Promise<Car[]> {
    return Array.from(this.cars.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async filterCars(filter: CarFilter): Promise<Car[]> {
    let filtered = Array.from(this.cars.values());
    console.log('Initial car count:', filtered.length);
    console.log('All cars years:', filtered.map(car => car.year));
    console.log('Applied filter:', filter);

    if (filter.make) {
      filtered = filtered.filter(car => 
        car.make.toLowerCase().includes(filter.make!.toLowerCase())
      );
      console.log(`After make filter (${filter.make}):`, filtered.length);
    }

    if (filter.model) {
      filtered = filtered.filter(car => 
        car.model.toLowerCase().includes(filter.model!.toLowerCase())
      );
      console.log(`After model filter (${filter.model}):`, filtered.length);
    }

    if (filter.minPrice !== undefined) {
      filtered = filtered.filter(car => car.price >= filter.minPrice!);
      console.log(`After minPrice filter (${filter.minPrice}):`, filtered.length);
    }

    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter(car => car.price <= filter.maxPrice!);
      console.log(`After maxPrice filter (${filter.maxPrice}):`, filtered.length);
    }

    if (filter.minYear !== undefined) {
      console.log('Cars before minYear filter:', filtered.map(car => ({ id: car.id, year: car.year })));

      filtered = filtered.filter(car => car.year >= filter.minYear!);

      console.log(`After minYear filter (${filter.minYear}):`, filtered.length);
      console.log('Cars after minYear filter:', filtered.map(car => ({ id: car.id, year: car.year })));
    }

    if (filter.maxYear !== undefined) {
      console.log('Cars before maxYear filter:', filtered.map(car => ({ id: car.id, year: car.year })));

      filtered = filtered.filter(car => car.year <= filter.maxYear!);

      console.log(`After maxYear filter (${filter.maxYear}):`, filtered.length);
      console.log('Cars after maxYear filter:', filtered.map(car => ({ id: car.id, year: car.year })));
    }

    if (filter.fuelType) {
      filtered = filtered.filter(car => car.fuelType === filter.fuelType);
      console.log(`After fuelType filter (${filter.fuelType}):`, filtered.length);
    }

    if (filter.transmission) {
      filtered = filtered.filter(car => car.transmission === filter.transmission);
      console.log(`After transmission filter (${filter.transmission}):`, filtered.length);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(car => 
        car.make.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower) ||
        car.description?.toLowerCase().includes(searchLower) ||
        car.exteriorColor.toLowerCase().includes(searchLower) ||
        car.fuelType.toLowerCase().includes(searchLower) ||
        (car.features?.some(feature => feature.toLowerCase().includes(searchLower)) ?? false)
      );
      console.log(`After search filter (${filter.search}):`, filtered.length);
    }

    console.log('Final filtered cars:', filtered.map(car => ({ id: car.id, year: car.year })));

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.messageIdCounter++;
    const timestamp = new Date();
    const newMessage: ContactMessage = { ...message, id, createdAt: timestamp };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }

  async getContactMessagesForCar(carId: number): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values())
      .filter(message => message.carId === carId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async sendEmail(options: { to: string, subject: string, text: string }): Promise<void> {
    try {
      const SibApiV3Sdk = require('sib-api-v3-sdk');
      const defaultClient = SibApiV3Sdk.ApiClient.instance;
      
      // Configure API key authorization
      const apiKey = defaultClient.authentications['api-key'];
      apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
      
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sender = {
        email: "notification@automarket.com",
        name: "AutoMarket Notifications",
      };
      
      const receivers = [
        {
          email: options.to,
        },
      ];
      
      const sendSmtpEmail = {
        sender,
        to: receivers,
        subject: options.subject,
        textContent: options.text,
      };
      
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Wishlist methods
  async createWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const id = this.wishlistIdCounter++;
    const timestamp = new Date();
    
    // Ensure required fields have default values if not provided
    const cars = wishlist.cars ?? null;
    const userId = wishlist.userId ?? null;
    
    const newWishlist: Wishlist = { 
      ...wishlist,
      id, 
      createdAt: timestamp,
      cars,
      userId
    };
    
    this.wishlists.set(id, newWishlist);
    return newWishlist;
  }

  async getWishlistById(id: number): Promise<Wishlist | undefined> {
    return this.wishlists.get(id);
  }

  async getWishlistByShareId(shareId: string): Promise<Wishlist | undefined> {
    return Array.from(this.wishlists.values()).find(wishlist => wishlist.shareId === shareId);
  }

  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values())
      .filter(wishlist => wishlist.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateWishlist(id: number, wishlist: Partial<InsertWishlist>): Promise<Wishlist | undefined> {
    const existingWishlist = this.wishlists.get(id);
    if (!existingWishlist) return undefined;

    const updatedWishlist = { ...existingWishlist, ...wishlist };
    this.wishlists.set(id, updatedWishlist);
    return updatedWishlist;
  }

  async deleteWishlist(id: number): Promise<boolean> {
    return this.wishlists.delete(id);
  }

  async getSimilarCars(carId: number, limit: number = 3): Promise<Car[]> {
    const car = this.cars.get(carId);
    if (!car) return [];

    // Define similarity criteria based on the car's attributes
    const similarCars = Array.from(this.cars.values())
      .filter(otherCar => otherCar.id !== carId) // Exclude the current car
      .map(otherCar => {
        // Calculate a similarity score based on various attributes
        let score = 0;

        // Same make gets high score
        if (otherCar.make === car.make) {
          score += 30;
        }

        // Same model gets high score
        if (otherCar.model === car.model) {
          score += 20;
        }

        // Similar price range (within 20% of the car's price)
        const priceDiffPercentage = Math.abs(otherCar.price - car.price) / car.price;
        if (priceDiffPercentage <= 0.2) {
          score += 15;
        }

        // Similar year (within 3 years)
        const yearDiff = Math.abs(otherCar.year - car.year);
        if (yearDiff <= 3) {
          score += 10;
        }

        // Same fuel type
        if (otherCar.fuelType === car.fuelType) {
          score += 10;
        }

        // Same transmission
        if (otherCar.transmission === car.transmission) {
          score += 5;
        }

        // Same drivetrain
        if (otherCar.drivetrain === car.drivetrain) {
          score += 5;
        }

        // Same body type/segment (if we had this attribute)
        
        return {
          car: otherCar,
          similarityScore: score
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity score (highest first)
      .slice(0, limit) // Limit the number of similar cars
      .map(result => result.car); // Extract the car objects

    return similarCars;
  }
}

export const storage = new MemStorage();