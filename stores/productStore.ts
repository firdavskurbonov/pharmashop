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