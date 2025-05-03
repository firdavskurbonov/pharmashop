// stores/cartStore.ts
import { defineStore } from 'pinia'
import { type Product } from './productStore'

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: []
  }),
  
  getters: {
    totalItems: (state): number => {
      return state.items ? state.items.reduce((total, item) => total + (item.quantity || 0), 0) : 0;
    },
    
    totalPrice: (state): number => {
      return state.items ? state.items.reduce((total, item) => total + (item.product.Price * item.quantity), 0) : 0;
    },
    
    cartIsEmpty: (state): boolean => {
      return !state.items || state.items.length === 0;
    }
  },
  
  actions: {
    addItem(product: Product, quantity: number = 1): void {
      // Don't allow adding more than available stock
      if (quantity > product.Quantity) {
        quantity = product.Quantity
      }
      
      // Find if product already exists in cart
      const existingItem = this.items.find(item => item.product.Id === product.Id)
      
      if (existingItem) {
        // Check if we're adding more than available stock
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity <= product.Quantity) {
          existingItem.quantity = newQuantity
        } else {
          existingItem.quantity = product.Quantity
        }
      } else {
        // Add new item
        this.items.push({
          product,
          quantity
        })
      }
    },
    
    removeItem(id: string): void {
      const index = this.items.findIndex(item => item.product.Id === id)
      if (index !== -1) {
        this.items.splice(index, 1)
      }
    },
    
    updateQuantity(id: string, quantity: number): void {
      const item = this.items.find(item => item.product.Id === id)
      if (item) {
        // Don't allow more than available stock
        if (quantity > item.product.Quantity) {
          quantity = item.product.Quantity
        }
        
        if (quantity <= 0) {
          this.removeItem(id)
        } else {
          item.quantity = quantity
        }
      }
    },
    
    incrementQuantity(id: string): void {
      const item = this.items.find(item => item.product.Id === id)
      if (item && item.quantity < item.product.Quantity) {
        item.quantity++
      }
    },
    
    decrementQuantity(id: string): void {
      const item = this.items.find(item => item.product.Id === id)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
        } else {
          this.removeItem(id)
        }
      }
    },

    getItemById(id:string) {
      return this.items.find(item => item.product.Id === id);
    },

    updateItem(updatedItem: CartItem) {
      const index = this.items.findIndex(item => item.product.Id === updatedItem.product.Id);
      if (index !== -1) {
        this.items[index] = updatedItem;
      }
    },
    
    clearCart(): void {
      this.items = []
    }
  }
})