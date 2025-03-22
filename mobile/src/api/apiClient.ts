import { Car, CarFilter, InsertCar, InsertContactMessage, InsertWishlist, User, Wishlist } from '../../../shared/schema';

// Configuration for the API client
const API_CONFIG = {
  // Set the base URL for the API - can be updated based on environment
  baseUrl: 'http://localhost:3000/api',
  // Default headers for API requests
  headers: {
    'Content-Type': 'application/json',
  },
};

// Function to check if the response is OK and throw an error if not
async function checkResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API request failed with status ${response.status}`);
  }
  return response;
}

// Function to handle API requests
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  headers?: Record<string, string>
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      ...API_CONFIG.headers,
      ...headers,
    },
    credentials: 'include', // Include cookies for authentication
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestOptions);
  await checkResponse(response);
  
  // For DELETE requests that might not return data
  if (method === 'DELETE' && response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

// User authentication and registration operations
export const authAPI = {
  login: (username: string, password: string) => 
    apiRequest<{ user: User }>('/auth/login', 'POST', { username, password }),
  
  register: (userData: { username: string, password: string, email: string, name: string }) => 
    apiRequest<{ user: User }>('/auth/register', 'POST', userData),
  
  logout: () => 
    apiRequest<void>('/auth/logout', 'POST'),
  
  getSession: () => 
    apiRequest<{ isAuthenticated: boolean, user?: User }>('/auth/session')
};

// Car-related operations
export const carAPI = {
  getAllCars: () => 
    apiRequest<Car[]>('/cars'),
  
  getCarById: (id: number) => 
    apiRequest<Car>(`/cars/${id}`),
  
  createCar: (car: InsertCar) => 
    apiRequest<Car>('/cars', 'POST', car),
  
  updateCar: (id: number, car: Partial<InsertCar>) => 
    apiRequest<Car>(`/cars/${id}`, 'PATCH', car),
  
  deleteCar: (id: number) => 
    apiRequest<boolean>(`/cars/${id}`, 'DELETE'),
  
  getFeaturedCars: (limit?: number) => 
    apiRequest<Car[]>(`/cars/featured/list${limit ? `?limit=${limit}` : ''}`),
  
  getRecentCars: (limit?: number) => 
    apiRequest<Car[]>(`/cars/recent/list${limit ? `?limit=${limit}` : ''}`),
  
  filterCars: (filter: CarFilter) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(val => queryParams.append(`${key}[]`, val.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    return apiRequest<Car[]>(`/cars/filter?${queryParams.toString()}`);
  },
  
  getSimilarCars: (carId: number, limit?: number) => 
    apiRequest<Car[]>(`/cars/${carId}/similar${limit ? `?limit=${limit}` : ''}`)
};

// Contact message operations
export const contactAPI = {
  createContactMessage: (message: InsertContactMessage) => 
    apiRequest<{ success: boolean }>('/contact', 'POST', message),
  
  getContactMessagesForCar: (carId: number) => 
    apiRequest<InsertContactMessage[]>(`/contact/${carId}`),
  
  getAllContactMessages: () => 
    apiRequest<InsertContactMessage[]>('/contact')
};

// Wishlist operations
export const wishlistAPI = {
  createWishlist: (wishlist: InsertWishlist) => 
    apiRequest<Wishlist>('/wishlists', 'POST', wishlist),
  
  getWishlistById: (id: number) => 
    apiRequest<Wishlist>(`/wishlists/${id}`),
  
  getWishlistByShareId: (shareId: string) => 
    apiRequest<Wishlist>(`/wishlists/share/${shareId}`),
  
  getUserWishlists: (userId: string) => 
    apiRequest<Wishlist[]>(`/wishlists/user/${userId}`),
  
  updateWishlist: (id: number, wishlist: Partial<InsertWishlist>) => 
    apiRequest<Wishlist>(`/wishlists/${id}`, 'PATCH', wishlist),
  
  deleteWishlist: (id: number) => 
    apiRequest<boolean>(`/wishlists/${id}`, 'DELETE')
};

// Upload operations
export const uploadAPI = {
  uploadImage: async (image: { uri: string, type: string, name: string }) => {
    const formData = new FormData();
    formData.append('image', image as any);
    
    const response = await fetch(`${API_CONFIG.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      credentials: 'include',
    });
    
    await checkResponse(response);
    return response.json();
  }
};

// Export the complete API client
export const apiClient = {
  auth: authAPI,
  cars: carAPI,
  contact: contactAPI,
  wishlists: wishlistAPI,
  upload: uploadAPI,
  
  // Configuration methods
  setBaseUrl: (url: string) => {
    API_CONFIG.baseUrl = url;
  },
  
  addHeader: (key: string, value: string) => {
    API_CONFIG.headers[key] = value;
  }
};

export default apiClient;