// stores/productStore.ts
import { useNuxtApp } from 'nuxt/app';
import { defineStore } from 'pinia'

// Define types based on the provided JSON structure
export interface Product {
  Id: string;
  ProductName: string;
  Barcode: string;
  Quantity: number;
  Price: number;
  ExpireDate: string;
  ManufactName: string;
}

interface PriceRange {
  min: number | null;
  max: number | null;
}

interface ProductFilters {
  pageNumber: number;
  pageSize: number;
  manufacturer: string | null;
  priceRange: PriceRange;
  sortBy: string;
  searchQuery: string;
  categoryId: number | null;
}

interface Pagination {
  totalRecords: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: Pagination | null;
}

export const useProductStore = defineStore('products', {
  state: (): ProductState => ({
    products: [],
    loading: false,
    error: null,
    filters: {
      pageNumber: 1,
      pageSize: 5,
      manufacturer: null,
      priceRange: {
        min: null,
        max: null
      },
      sortBy: 'default',
      searchQuery: '',
      categoryId: 1
    },
    pagination: null
  }),
  
  getters: {
    // Since we're doing server-side filtering, we just return the products as-is
    filteredProducts: (state): Product[] => {
      return state.products;
    },
    
    manufacturers: (state): string[] => {
      const manufacturers = new Set(state.products.map(product => product.ManufactName));
      return Array.from(manufacturers);
    },

    currentPage: (state): number => {
      return state.filters.pageNumber;
    },
    
    pageSize: (state): number => {
      return state.filters.pageSize;
    },
    
    totalPages: (state): number => {
      return state.pagination?.totalPages || 1;
    }
  },
  
  actions: {

    async fetchProducts(searchQuery?: string, pageNumber?: number, pageSize?: number): Promise<void> {
      this.loading = true;
      this.error = null;
      
      // Update filters if parameters are provided
      if (searchQuery !== undefined) this.filters.searchQuery = searchQuery;
      if (pageNumber !== undefined) this.filters.pageNumber = pageNumber;
      if (pageSize !== undefined) this.filters.pageSize = pageSize;
      
      const url = this.buildApiUrl();
      const { $axios } = useNuxtApp();
      const axiosInstance = $axios as import('axios').AxiosInstance;
      const config = { 
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        }
      };
      
      const MAX_RETRIES = 3;
      
      try {
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const response = await axiosInstance.get(url, config);
            
            // Check if response is HTML instead of JSON
            if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
              if (url.includes('ngrok')) {
                throw new Error('Your ngrok tunnel returned an HTML page instead of JSON data. The tunnel may have expired.');
              } else {
                throw new Error('API returned HTML instead of JSON. API endpoint may be misconfigured.');
              }
            }
            
            const responseData = response.data;
            
            // Validate response format
            if (typeof responseData !== 'object' || responseData === null) {
              throw new Error('Invalid response format: not a JSON object');
            }
            
            if (responseData?.Success === true) {
              this.products = Array.isArray(responseData.Data) ? responseData.Data : 
                             (responseData.Data ? [responseData.Data] : []);
              
              this.pagination = {
                totalRecords: responseData.TotalRecords || 0,
                pageSize: responseData.PageSize || 5,
                currentPage: responseData.CurrentPage || 1,
                totalPages: responseData.TotalPages || 1,
                nextPageUrl: responseData.NextPageUrl || null,
                previousPageUrl: responseData.PreviousPageUrl || null
              };
              
              return;
            } else {
              throw new Error(responseData?.Message || 'API returned success: false');
            }
          } catch (error: any) {
            // Check if error response contains HTML (in case axios already tried to parse it)
            if (error.response?.data && typeof error.response.data === 'string' && 
                error.response.data.includes('<!DOCTYPE html>')) {
              if (url.includes('ngrok')) {
                throw new Error('Your ngrok tunnel returned an HTML page instead of JSON data. The tunnel may have expired.');
              } else {
                throw new Error('API returned HTML instead of JSON. API endpoint may be misconfigured.');
              }
            }
            
            const isRetriableError = 
              error.code === 'ECONNABORTED' || 
              error.message.includes('timeout') ||
              error.message.includes('Network Error') ||
              (error.response && (
                error.response.status === 408 || 
                error.response.status === 429 || 
                error.response.status >= 500
              ));
            
            if (attempt === MAX_RETRIES - 1 || !isRetriableError) throw error;
            
            const backoffTime = Math.pow(2, attempt) * 500;
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }
      } catch (err) {
        const error = err as Error;
        let userFriendlyMessage = 'Failed to fetch products';
        
        if (error.message.includes('timeout')) {
          userFriendlyMessage = 'Request timed out. Please try again later.';
        } else if (error.message.includes('Network Error')) {
          userFriendlyMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('ngrok tunnel')) {
          userFriendlyMessage = 'Ngrok tunnel issue: ' + error.message;
        } else if (error.message.includes('HTML') || error.message.includes('<!DOCTYPE')) {
          userFriendlyMessage = 'Server returned a webpage instead of data. API endpoint may be misconfigured.';
        } else if ((err as any).response?.status === 401) {
          userFriendlyMessage = 'You are not authorized to access this data.';
        } else if ((err as any).response?.status === 403) {
          userFriendlyMessage = 'You do not have permission to access this data.';
        } else if ((err as any).response?.status === 404) {
          userFriendlyMessage = 'The requested resource was not found.';
        }
        
        // Log the error for debugging
        console.error('API Error Details:', {
          message: error.message,
          url: url,
          responseData: (err as any).response?.data
        });
        
        this.error = userFriendlyMessage;
      } finally {
        this.loading = false;
      }
    },

    // async fetchProducts(searchQuery?: string, pageNumber?: number, pageSize?: number): Promise<void> {
    //   this.loading = true;
    //   this.error = null;
      
    //   // Update filters if parameters are provided
    //   if (searchQuery !== undefined) this.filters.searchQuery = searchQuery;
    //   if (pageNumber !== undefined) this.filters.pageNumber = pageNumber;
    //   if (pageSize !== undefined) this.filters.pageSize = pageSize;
      
    //   const url = this.buildApiUrl();
    //   const { $axios } = useNuxtApp();
    //   const axiosInstance = $axios as import('axios').AxiosInstance;
    //   const config = { 
    //     timeout: 30000,
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Accept': 'application/json'
    //     },
    //     // Prevent axios from parsing HTML responses as JSON
    //     transformResponse: [(data: string) => {
    //       try {
    //         // Check if data is a string and contains HTML tags
    //         if (typeof data === 'string' && data.trim().startsWith('<!DOCTYPE html>')) {
    //           throw new Error('Received HTML response instead of JSON');
    //         }
    //         return JSON.parse(data);
    //       } catch (e) {
    //         console.warn('Response transformation error:', (e as Error).message);
    //         return { Success: false, Message: 'Invalid response format', Data: null };
    //       }
    //     }]
    //   };
      
    //   const MAX_RETRIES = 3;
      
    //   try {
    //     for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    //       try {
    //         const response = await axiosInstance.get(url, config);
    //         const responseData = response.data;
            
    //         // Validate response format
    //         if (typeof responseData !== 'object' || responseData === null) {
    //           throw new Error('Invalid response format: not a JSON object');
    //         }
            
    //         if (responseData?.Success === true) {
    //           this.products = Array.isArray(responseData.Data) ? responseData.Data : 
    //                          (responseData.Data ? [responseData.Data] : []);
              
    //           this.pagination = {
    //             totalRecords: responseData.TotalRecords || 0,
    //             pageSize: responseData.PageSize || 5,
    //             currentPage: responseData.CurrentPage || 1,
    //             totalPages: responseData.TotalPages || 1,
    //             nextPageUrl: responseData.NextPageUrl || null,
    //             previousPageUrl: responseData.PreviousPageUrl || null
    //           };
              
    //           return;
    //         } else {
    //           throw new Error(responseData?.Message || 'API returned success: false');
    //         }
    //       } catch (error: any) {
    //         // Special handling for HTML responses
    //         if (error.message.includes('HTML response')) {
    //           if (url.includes('ngrok')) {
    //             throw new Error('Your ngrok tunnel returned an HTML page instead of JSON data. The tunnel may have expired.');
    //           } else {
    //             throw new Error('API returned HTML instead of JSON. API endpoint may be misconfigured.');
    //           }
    //         }
            
    //         const isRetriableError = 
    //           error.code === 'ECONNABORTED' || 
    //           error.message.includes('timeout') ||
    //           error.message.includes('Network Error') ||
    //           (error.response && (
    //             error.response.status === 408 || 
    //             error.response.status === 429 || 
    //             error.response.status >= 500
    //           ));
            
    //         if (attempt === MAX_RETRIES - 1 || !isRetriableError) throw error;
            
    //         const backoffTime = Math.pow(2, attempt) * 500;
    //         await new Promise(resolve => setTimeout(resolve, backoffTime));
    //       }
    //     }
    //   } catch (err) {
    //     const error = err as Error;
    //     let userFriendlyMessage = 'Failed to fetch products';
        
    //     if (error.message.includes('timeout')) {
    //       userFriendlyMessage = 'Request timed out. Please try again later.';
    //     } else if (error.message.includes('Network Error')) {
    //       userFriendlyMessage = 'Network error. Please check your internet connection.';
    //     } else if (error.message.includes('ngrok tunnel')) {
    //       userFriendlyMessage = 'Ngrok tunnel issue: ' + error.message;
    //     } else if (error.message.includes('HTML response') || error.message.includes('HTML instead of JSON')) {
    //       userFriendlyMessage = 'Server returned a webpage instead of data. API endpoint may be misconfigured.';
    //     } else if ((err as any).response?.status === 401) {
    //       userFriendlyMessage = 'You are not authorized to access this data.';
    //     } else if ((err as any).response?.status === 403) {
    //       userFriendlyMessage = 'You do not have permission to access this data.';
    //     } else if ((err as any).response?.status === 404) {
    //       userFriendlyMessage = 'The requested resource was not found.';
    //     }
        
    //     this.error = userFriendlyMessage;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    // async fetchProducts(searchQuery?: string, pageNumber?: number, pageSize?: number): Promise<void> {
    //   this.loading = true;
    //   this.error = null;
      
    //   // Update filters if parameters are provided
    //   if (searchQuery !== undefined) this.filters.searchQuery = searchQuery;
    //   if (pageNumber !== undefined) this.filters.pageNumber = pageNumber;
    //   if (pageSize !== undefined) this.filters.pageSize = pageSize;
      
    //   const url = this.buildApiUrl();
    //   const { $axios } = useNuxtApp();
    //   const axiosInstance = $axios as import('axios').AxiosInstance;
    //   const config = { 
    //     timeout: 30000,
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Accept': 'application/json'
    //     }
    //   };
      
    //   const MAX_RETRIES = 3;
      
    //   try {
    //     for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    //       try {
    //         const response = await axiosInstance.get(url, config);
    //         const responseData = response.data;
            
    //         if (responseData?.Success === true) {
    //           this.products = Array.isArray(responseData.Data) ? responseData.Data : 
    //                          (responseData.Data ? [responseData.Data] : []);
              
    //           this.pagination = {
    //             totalRecords: responseData.TotalRecords || 0,
    //             pageSize: responseData.PageSize || 5,
    //             currentPage: responseData.CurrentPage || 1,
    //             totalPages: responseData.TotalPages || 1,
    //             nextPageUrl: responseData.NextPageUrl || null,
    //             previousPageUrl: responseData.PreviousPageUrl || null
    //           };
              
    //           return;
    //         } else {
    //           throw new Error(responseData?.Message || 'API returned success: false');
    //         }
    //       } catch (error: any) {
    //         const isRetriableError = 
    //           error.code === 'ECONNABORTED' || 
    //           error.message.includes('timeout') ||
    //           error.message.includes('Network Error') ||
    //           (error.response && (
    //             error.response.status === 408 || 
    //             error.response.status === 429 || 
    //             error.response.status >= 500
    //           ));
            
    //         if (attempt === MAX_RETRIES - 1 || !isRetriableError) throw error;
            
    //         const backoffTime = Math.pow(2, attempt) * 500;
    //         await new Promise(resolve => setTimeout(resolve, backoffTime));
    //       }
    //     }
    //   } catch (err) {
    //     const error = err as Error;
    //     let userFriendlyMessage = 'Failed to fetch products';
        
    //     if (error.message.includes('timeout')) {
    //       userFriendlyMessage = 'Request timed out. Please try again later.';
    //     } else if (error.message.includes('Network Error')) {
    //       userFriendlyMessage = 'Network error. Please check your internet connection.';
    //     } else if ((err as any).response?.status === 401) {
    //       userFriendlyMessage = 'You are not authorized to access this data.';
    //     } else if ((err as any).response?.status === 403) {
    //       userFriendlyMessage = 'You do not have permission to access this data.';
    //     } else if ((err as any).response?.status === 404) {
    //       userFriendlyMessage = 'The requested resource was not found.';
    //     }
        
    //     this.error = userFriendlyMessage;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    // async fetchProducts(searchQuery?: string, pageNumber?: number, pageSize?: number): Promise<void> {
    //   this.loading = true;
    //   this.error = null;
      
    //   // Update filters if parameters are provided
    //   if (searchQuery !== undefined) {
    //     this.filters.searchQuery = searchQuery;
    //   }
      
    //   if (pageNumber !== undefined) {
    //     this.filters.pageNumber = pageNumber;
    //   }
      
    //   if (pageSize !== undefined) {
    //     this.filters.pageSize = pageSize;
    //   }
      
    //   const url = this.buildApiUrl();
    //   console.log('Fetching products from URL:', url); // Log the URL for debugging
      
    //   // Debug log the filters
    //   console.log('Filters being used:', JSON.stringify(this.filters, null, 2));
      
    //   const MAX_RETRIES = 3;
      
    //   try {
    //     for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    //       try {
    //         // Use the axios instance created in plugins/axios.ts
    //         const { $axios } = useNuxtApp();
    //         const axiosInstance = $axios as import('axios').AxiosInstance;
            
    //         // Debug the request configuration
    //         const config = { 
    //           timeout: 30000,
    //           // Uncomment and use if needed - add auth headers if required
    //           headers: {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json'
    //           }
    //         };
            
    //         console.log(`Attempt ${attempt + 1} - Sending request to ${url} with config:`, config);
            
    //         // Await the response from the API call
    //         const response = await axiosInstance.get(url, config);

    //         console.log('Request URL:', url);
    //         console.log('Request Config:', config);
            
    //         // Log the full response for debugging
    //         console.log('Full API Response:', response);
    //         console.log('API Response Data:', response.data);
            
    //         // Handle the response format
    //         const responseData = response.data;
            
    //         // Explicitly check for Success flag
    //         if (responseData && responseData.Success === true) {
    //           if (!responseData.Data) {
    //             console.warn('API returned Success: true but with empty Data');
    //             this.products = [];
    //           } else {
    //             this.products = Array.isArray(responseData.Data) ? responseData.Data : [responseData.Data];
    //           }
              
    //           // Add pagination data to the store
    //           this.pagination = {
    //             totalRecords: responseData.TotalRecords || 0,
    //             pageSize: responseData.PageSize || 5,
    //             currentPage: responseData.CurrentPage || 1,
    //             totalPages: responseData.TotalPages || 1,
    //             nextPageUrl: responseData.NextPageUrl || null,
    //             previousPageUrl: responseData.PreviousPageUrl || null
    //           };
              
    //           console.log('Successfully fetched products:', this.products.length);
    //           return; // Exit if successful
    //         } else {
    //           // If the API indicates failure but returns a 200 response
    //           const errorDetails = {
    //             success: responseData?.Success,
    //             message: responseData?.Message || 'No error message provided',
    //             code: responseData?.ErrorCode || 'UNKNOWN',
    //             data: responseData?.Data || null
    //           };
              
    //           console.error('API returned Success: false with details:', errorDetails);
              
    //           // Check if there's a specific error condition we can handle
    //           if (responseData?.ErrorCode === 'INVALID_PARAMETERS') {
    //             throw new Error(`Invalid parameters: ${responseData.Message}`);
    //           } else if (responseData?.ErrorCode === 'AUTHORIZATION_REQUIRED') {
    //             throw new Error('Authorization required to access this resource');
    //           } else {
    //             throw new Error(responseData?.Message || 'API returned success: false');
    //           }
    //         }
    //       } catch (error: any) {
    //         // Enhanced error handling with complete error object
    //         console.error('API Request Error:', error);
    //         console.error('Error type:', error.constructor.name);
    //         console.error('Error message:', error.message);
    //         console.error('Stack trace:', error.stack);
            
    //         // Enhanced error logging
    //         if (error.response) {
    //           // The request was made and the server responded with a status code outside 2xx
    //           console.error('Server responded with error:', {
    //             status: error.response.status,
    //             statusText: error.response.statusText,
    //             data: error.response.data,
    //             headers: error.response.headers
    //           });
    //         } else if (error.request) {
    //           // The request was made but no response was received
    //           console.error('No response received. Request details:', {
    //             method: error.request.method,
    //             url: error.request.url,
    //             responseURL: error.request.responseURL,
    //             status: error.request.status,
    //             statusText: error.request.statusText
    //           });
    //         } else {
    //           // Something happened in setting up the request
    //           console.error('Error setting up request:', error.message);
    //         }
            
    //         // Special handling for ngrok tunnels which might have connection issues
    //         if (url.includes('ngrok') && error.message.includes('Network Error')) {
    //           console.warn('ngrok tunnel might be expired or unstable');
    //         }
            
    //         // If this is our last attempt or it's not a retriable error, throw it
    //         const isRetriableError = 
    //           (error.code === 'ECONNABORTED') || // Timeout
    //           (error.message.includes('timeout')) ||
    //           (error.message.includes('Network Error')) ||
    //           (error.response && (
    //             error.response.status === 408 || // Request Timeout
    //             error.response.status === 429 || // Too Many Requests
    //             error.response.status >= 500));  // Server errors
               
    //         if (attempt === MAX_RETRIES - 1 || !isRetriableError) {
    //           throw error;
    //         }
            
    //         // Wait before retrying (implement exponential backoff)
    //         const backoffTime = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s
    //         console.warn(`Attempt ${attempt + 1} failed. Retrying in ${backoffTime}ms...`);
    //         await new Promise(resolve => setTimeout(resolve, backoffTime));
    //       }
    //     }
    //   } catch (err) {
    //     const error = err as Error;
        
    //     // Default error message
    //     let userFriendlyMessage = 'Failed to fetch products';
        
    //     // User-friendly error messages based on error types
    //     if (error.message.includes('timeout')) {
    //       userFriendlyMessage = 'Request timed out. Please try again later.';
    //     } else if (error.message.includes('Network Error')) {
    //       userFriendlyMessage = 'Network error. Please check your internet connection.';
    //       // Additional specific check for ngrok
    //       if ((err as any).config?.url?.includes('ngrok')) {
    //         userFriendlyMessage += ' Your ngrok tunnel might be expired or unstable.';
    //       }
    //     } else if ((err as any).response?.status === 401) {
    //       userFriendlyMessage = 'You are not authorized to access this data.';
    //     } else if ((err as any).response?.status === 403) {
    //       userFriendlyMessage = 'You do not have permission to access this data.';
    //     } else if ((err as any).response?.status === 404) {
    //       userFriendlyMessage = 'The requested resource was not found.';
    //     } else if (error.message.includes('API returned success: false')) {
    //       userFriendlyMessage = 'The server could not process your request. Please try again later.';
    //     }
        
    //     this.error = userFriendlyMessage;
    //     console.error('Error fetching products:', error);
    //   } finally {
    //     this.loading = false; // Ensure loading is set to false in all cases
    //   }
    // },
    // async fetchProducts(searchQuery?: string, pageNumber?: number, pageSize?: number): Promise<void> {
    //   this.loading = true;
    //   this.error = null;
      
    //   // Update filters if parameters are provided
    //   if (searchQuery !== undefined) {
    //     this.filters.searchQuery = searchQuery;
    //   }
      
    //   if (pageNumber !== undefined) {
    //     this.filters.pageNumber = pageNumber;
    //   }
      
    //   if (pageSize !== undefined) {
    //     this.filters.pageSize = pageSize;
    //   }
      
    //   const url = this.buildApiUrl();
    //   console.log('Fetching products from URL:', url); // Log the URL for debugging
      
    //   const MAX_RETRIES = 3;
      
    //   try {
    //     for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    //       try {
    //         // Use the axios instance created in plugins/axios.ts
    //         const { $axios } = useNuxtApp();
    //         const axiosInstance = $axios as import('axios').AxiosInstance;
            
    //         // Await the response from the API call
    //         const response = await axiosInstance.get(url, { timeout: 30000 });
            
    //         // Log the response for debugging
    //         console.log('API Response:', {
    //           status: response.status,
    //           success: response.data.Success,
    //           message: response.data.Message || 'No message provided',
    //           dataLength: response.data.Data ? response.data.Data.length : 0
    //         });
            
    //         // Handle the response format
    //         const responseData = response.data;
            
    //         if (responseData && responseData.Success === true) {  // Explicitly check for true
    //           this.products = responseData.Data || [];  // Ensure products is always an array
              
    //           // Add pagination data to the store
    //           this.pagination = {
    //             totalRecords: responseData.TotalRecords || 0,
    //             pageSize: responseData.PageSize || 10,
    //             currentPage: responseData.CurrentPage || 1,
    //             totalPages: responseData.TotalPages || 1,
    //             nextPageUrl: responseData.NextPageUrl || null,
    //             previousPageUrl: responseData.PreviousPageUrl || null
    //           };
    //           return;  // Exit if successful
    //         } else {
    //           // If the API indicates failure but returns a 200 response
    //           const errorMessage = responseData?.Message || 'API returned success: false';
    //           console.error('API Success flag is false:', errorMessage);
    //           throw new Error(errorMessage);
    //         }
    //       } catch (error: any) {  // Type annotation for error
    //         console.error('API Request Error:', error);
            
    //         // Enhanced error logging
    //         if (error.response) {
    //           // The request was made and the server responded with a status code outside 2xx
    //           console.error('Server responded with error:', {
    //             status: error.response.status,
    //             data: error.response.data,
    //             headers: error.response.headers
    //           });
    //         } else if (error.request) {
    //           // The request was made but no response was received
    //           console.error('No response received:', error.request);
    //         } else {
    //           // Something happened in setting up the request
    //           console.error('Error setting up request:', error.message);
    //         }
            
    //         // If this is our last attempt or it's not a retriable error, throw it
    //         const isRetriableError = error.response && 
    //           (error.response.status === 408 || // Request Timeout
    //            error.response.status === 429 || // Too Many Requests
    //            error.response.status >= 500);   // Server errors
               
    //         if (attempt === MAX_RETRIES - 1 || !isRetriableError) {
    //           throw error;
    //         }
            
    //         // Wait before retrying (implement exponential backoff)
    //         const backoffTime = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s
    //         console.warn(`Attempt ${attempt + 1} failed. Retrying in ${backoffTime}ms...`);
    //         await new Promise(resolve => setTimeout(resolve, backoffTime));
    //       }
    //     }
    //   } catch (err) {
    //     const error = err as Error;
        
    //     // Default error message
    //     let userFriendlyMessage = 'Failed to fetch products';
        
    //     // User-friendly error messages based on error types
    //     if (error.message.includes('timeout')) {
    //       userFriendlyMessage = 'Request timed out. Please try again later.';
    //     } else if (error.message.includes('Network Error')) {
    //       userFriendlyMessage = 'Network error. Please check your internet connection.';
    //     } else if ((err as any).response?.status === 401) {
    //       userFriendlyMessage = 'You are not authorized to access this data.';
    //     } else if ((err as any).response?.status === 403) {
    //       userFriendlyMessage = 'You do not have permission to access this data.';
    //     } else if ((err as any).response?.status === 404) {
    //       userFriendlyMessage = 'The requested resource was not found.';
    //     }
        
    //     this.error = userFriendlyMessage;
    //     console.error('Error fetching products:', error);
    //   } finally {
    //     this.loading = false; // Ensure loading is set to false in all cases
    //   }
    // },



    
    // async fetchProducts(searchQuery?: string, pageNumber?: number, pageSize?: number): Promise<void> {
    //   this.loading = true;
    //   this.error = null;
      
    //   // Update filters if parameters are provided
    //   if (searchQuery !== undefined) {
    //     this.filters.searchQuery = searchQuery;
    //   }
      
    //   if (pageNumber !== undefined) {
    //     this.filters.pageNumber = pageNumber;
    //   }
      
    //   if (pageSize !== undefined) {
    //     this.filters.pageSize = pageSize;
    //   }
        
    //   const url = this.buildApiUrl();
    //   const MAX_RETRIES = 3;
        
    //   try {
    //     for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    //       try {
    //         // Use the axios instance created in plugins/axios.ts
    //         const { $axios } = useNuxtApp();
    //         const axiosInstance = $axios as import('axios').AxiosInstance;
      
    //         try {
    //           // Await the response from the API call
    //           const response = await axiosInstance.get(url, { timeout: 30000 });
            
    //           // Log the response for debugging
    //           console.log('API Response:', {
    //             status: response.status,
    //             success: response.data.Success,
    //             message: response.data.Message || 'No message provided',
    //             dataLength: response.data.Data ? response.data.Data.length : 0
    //           });
            
    //         // Handle the new response format
    //         const responseData = response.data;


            
    //         if (responseData.Success) {
    //           this.products = responseData.Data;
              
    //           // Add pagination data to the store
    //           this.pagination = {
    //             totalRecords: responseData.TotalRecords,
    //             pageSize: responseData.PageSize,
    //             currentPage: responseData.CurrentPage,
    //             totalPages: responseData.TotalPages,
    //             nextPageUrl: responseData.NextPageUrl,
    //             previousPageUrl: responseData.PreviousPageUrl
    //           };
    //         } else {
    //           // If the API indicates failure but returns a 200 response
    //           throw new Error(responseData.Message || 'API returned success: false');
    //         }
    //         return;
    //       } catch (error) {
    //         console.error('API Request Error:', error);
    //         // Handle the error appropriately
    //       }
    //       } catch (error: any) {
    //         // Enhanced error logging
    //         if (error.response) {
    //           // The request was made and the server responded with a status code
    //           // that falls out of the range of 2xx
    //           console.error('Server responded with error:', {
    //             status: error.response.status,
    //             data: error.response.data,
    //             headers: error.response.headers
    //           });
    //         } else if (error.request) {
    //           // The request was made but no response was received
    //           console.error('No response received:', error.request);
    //         } else {
    //           // Something happened in setting up the request that triggered an Error
    //           console.error('Error setting up request:', error.message);
    //         }
    //         // If this is our last attempt or it's not a network error, throw it
    //         if (attempt === MAX_RETRIES - 1 || !(error as any).response) {
    //           throw error;
    //         }
    //         // Wait a bit before retrying (implement exponential backoff)
    //         const backoffTime = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s
    //         console.warn(`Attempt ${attempt + 1} failed. Retrying in ${backoffTime}ms...`);
    //         await new Promise(resolve => setTimeout(resolve, backoffTime));
    //       }
    //     }
    //   } catch (err) {
    //     const error = err as Error;
    //     this.error = error.message || 'Failed to fetch products';
    //     console.error('Error fetching products:', error);

    //     // You might want to add user-friendly error messages based on error types
    //     if (error.message.includes('timeout')) {
    //       this.error = 'Request timed out. Please try again later.';
    //     } else if (error.message.includes('Network Error')) {
    //       this.error = 'Network error. Please check your internet connection.';
    //     }

    //   } finally {
    //     this.loading = false;
    //   }
    // },

    buildApiUrl(): string {
      let url = '/api/assortments?';
      
      // Add pagination parameters
      url += `pageNumber=${this.filters.pageNumber}&pageSize=${this.filters.pageSize}`;
      
      // Add search query if present - search across all data, not just current page
      if (this.filters.searchQuery) {
        url += `&ProductName=${encodeURIComponent(this.filters.searchQuery)}`;
      }
      
      // Add category ID
      if (this.filters.categoryId !== null) {
        url += `&CategoryId=${this.filters.categoryId}`;
      }
      
      // Add manufacturer filter if present
      if (this.filters.manufacturer) {
        url += `&Manufacturer=${encodeURIComponent(this.filters.manufacturer)}`;
      }
      
      // Add price range filters if present
      if (this.filters.priceRange.min !== null) {
        url += `&MinPrice=${this.filters.priceRange.min}`;
      }
      
      if (this.filters.priceRange.max !== null) {
        url += `&MaxPrice=${this.filters.priceRange.max}`;
      }
      
      // Add sorting parameter
      if (this.filters.sortBy !== 'default') {
        url += `&SortBy=${encodeURIComponent(this.filters.sortBy)}`;
      }
      
      return url;
    },

    setManufacturer(manufacturer: string | null): void {
      this.filters.manufacturer = manufacturer;
      // Reset to first page when filter changes
      this.filters.pageNumber = 1;
      // Fetch products with new filter
      this.fetchProducts();
    },
    
    setPriceRange(min: number | null, max: number | null): void {
      this.filters.priceRange.min = min;
      this.filters.priceRange.max = max;
      // Reset to first page when filter changes
      this.filters.pageNumber = 1;
      // Fetch products with new filter
      this.fetchProducts();
    },
    
    setSearchQuery(query: string): void {
      this.filters.searchQuery = query;
      // Reset to first page when filter changes
      this.filters.pageNumber = 1;
      // Fetch is handled in the component
    },
    
    setSortBy(sortOption: string): void {
      this.filters.sortBy = sortOption;
      // Reset to first page when filter changes
      this.filters.pageNumber = 1;
      // Fetch products with new sort option
      this.fetchProducts();
    },

    setCategoryId(categoryId: number | null): void {
      this.filters.categoryId = categoryId;
      // Reset to first page when filter changes
      this.filters.pageNumber = 1;
      // Fetch products with new category
      this.fetchProducts();
    },

    setPageNumber(pageNumber: number): void {
      this.filters.pageNumber = pageNumber;
      // Fetch products for the new page
      this.fetchProducts();
    },

    setPageSize(pageSize: number): void {
      this.filters.pageSize = pageSize;
      // Reset to first page when page size changes
      this.filters.pageNumber = 1;
      // Fetch products with new page size
      this.fetchProducts();
    },
    
    resetFilters(): void {
      this.filters = {
        pageNumber: 1,
        pageSize: 5,
        manufacturer: null,
        priceRange: {
          min: null,
          max: null
        },
        sortBy: 'default',
        searchQuery: '',
        categoryId: 1
      };
      // No need to call fetchProducts here as it's handled in the component
    },

    goToNextPage(): void {
      if (this.pagination && this.filters.pageNumber < this.pagination.totalPages) {
        this.filters.pageNumber++;
        this.fetchProducts();
      }
    },

    goToPreviousPage(): void {
      if (this.filters.pageNumber > 1) {
        this.filters.pageNumber--;
        this.fetchProducts();
      }
    },

    goToPage(pageNumber: number): void {
      if (this.pagination && pageNumber >= 1 && pageNumber <= this.pagination.totalPages) {
        this.filters.pageNumber = pageNumber;
        this.fetchProducts();
      }
    }
  }
});