<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="product-info-modal">
      <div class="modal-backdrop" @click="closeModal"></div>
      <div class="modal-container">
        <div class="modal-content" @click.stop>
          <!-- Loading State -->
          <div v-if="loading" class="modal-loading">
            <div class="loader"></div>
            <p>Загрузка информации о препарате...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="modal-error">
            <p>{{ error }}</p>
            <button class="retry-button" @click="fetchProductDetails">
              Повторить попытку
            </button>
          </div>

          <!-- Modal Content -->
          <template v-else>
            <!-- Modal Header with Close Button -->
            <div class="modal-header">
              <h2 class="product-title">{{ product.ProductName }}</h2>
              <button
                class="close-button"
                @click="closeModal"
                aria-label="Close product details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Product Content -->
            <div class="modal-body">
              <div class="product-info-grid">
                <!-- Product Image Placeholder (since no images) -->
                <div class="product-gallery">
                  <div class="main-image-container">
                    <img
                      src="https://placehold.co/400"
                      :alt="product.ProductName"
                      class="main-image"
                    />
                  </div>
                </div>

                <!-- Product Details -->
                <div class="product-details">
                  <div class="product-header">
                    <div class="product-meta">
                      <span class="product-category">{{
                        product.ManufactName
                      }}</span>
                    </div>

                    <div class="product-price-container">
                      <span class="current-price">{{
                        formatCurrency(product.Price)
                      }}</span>
                    </div>
                  </div>

                  <div class="product-specs">
                    <h3>Характеристики</h3>
                    <ul class="specs-list">
                      <li class="spec-item">
                        <span class="spec-label">Штрих-код:</span>
                        <span class="spec-value">{{ product.Barcode }}</span>
                      </li>
                      <li class="spec-item">
                        <span class="spec-label">Срок годности:</span>
                        <span class="spec-value">{{
                          formatDate(product.ExpireDate)
                        }}</span>
                      </li>
                      <li class="spec-item">
                        <span class="spec-label">Производитель:</span>
                        <span class="spec-value">{{
                          product.ManufactName
                        }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Quantity Information -->
                  <div
                    class="product-availability"
                    :class="product.Quantity > 0 ? 'in-stock' : 'out-of-stock'"
                  >
                    <span v-if="product.Quantity > 0"
                      >В наличии ({{ product.Quantity }} шт.)</span
                    >
                    <span v-else>Нет в наличии</span>
                  </div>

                  <!-- Quantity Selector -->
                  <div class="product-quantity" v-if="product.Quantity > 0">
                    <h3>Количество</h3>
                    <div class="quantity-selector">
                      <button
                        class="quantity-btn decrease"
                        @click="decreaseQuantity"
                        :disabled="quantity <= 1"
                        aria-label="Decrease quantity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <span class="quantity-display">{{ quantity }}</span>
                      <button
                        class="quantity-btn increase"
                        @click="increaseQuantity"
                        :disabled="quantity >= product.Quantity"
                        aria-label="Increase quantity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Add to Cart Button -->
                  <div class="action-buttons">
                    <button
                      class="add-to-cart-btn"
                      @click="addToCart"
                      :disabled="product.Quantity <= 0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path
                          d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                        ></path>
                      </svg>
                      Добавить в корзину
                    </button>
                    <button class="wishlist-btn" @click="toggleWishlist">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="{ filled: isInWishlist }"
                      >
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        ></path>
                      </svg>
                      {{
                        isInWishlist
                          ? "Убрать из закладок"
                          : "Добавить в закладки"
                      }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Product Tabs (Description, Additional Info) -->
              <div class="product-tabs">
                <div class="tabs-header">
                  <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    class="tab-button"
                    :class="{ active: activeTab === tab.id }"
                    @click="activeTab = tab.id"
                  >
                    {{ tab.label }}
                  </button>
                </div>

                <div class="tab-content">
                  <!-- Description Tab -->
                  <div v-if="activeTab === 'description'" class="tab-pane">
                    <div class="detailed-description">
                      <h4>Информация о препарате</h4>
                      <p>
                        {{ product.ProductName }} - фармацевтический препарат от
                        производителя {{ product.ManufactName }}.
                      </p>
                      <p>Штрих-код: {{ product.Barcode }}</p>
                      <p>
                        Срок годности до: {{ formatDate(product.ExpireDate) }}
                      </p>
                    </div>
                  </div>

                  <!-- Additional Info Tab -->
                  <div v-if="activeTab === 'additional'" class="tab-pane">
                    <table class="additional-info-table">
                      <tbody>
                        <tr>
                          <th>Идентификатор</th>
                          <td>{{ product.Id }}</td>
                        </tr>
                        <tr>
                          <th>Наименование</th>
                          <td>{{ product.ProductName }}</td>
                        </tr>
                        <tr>
                          <th>Штрих-код</th>
                          <td>{{ product.Barcode }}</td>
                        </tr>
                        <tr>
                          <th>Количество в наличии</th>
                          <td>{{ product.Quantity }} шт.</td>
                        </tr>
                        <tr>
                          <th>Цена</th>
                          <td>{{ formatCurrency(product.Price) }}</td>
                        </tr>
                        <tr>
                          <th>Срок годности</th>
                          <td>{{ formatDate(product.ExpireDate) }}</td>
                        </tr>
                        <tr>
                          <th>Производитель</th>
                          <td>{{ product.ManufactName }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { useCartStore } from "../stores/cartStore"; // Adjust the import path as necessary

interface CartItem {
  Id: number;
  ProductName: string;
  Price: number;
  Quantity: number;
}

const cartStore = useCartStore();

export default defineComponent({
  name: "ProductInfo",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    productId: {
      type: Object as PropType<{
        Id: number;
        ProductName: string;
        Barcode: string;
        Quantity: number;
        Price: number;
        ExpireDate: string;
        ManufactName: string;
      }>,
      required: false,
    },
  },
  data() {
    return {
      product: {} as {
        Id: number;
        ProductName: string;
        Barcode: string;
        Quantity: number;
        Price: number;
        ExpireDate: string;
        ManufactName: string;
      },
      loading: true,
      error: null as string | null,
      quantity: 1,
      isInWishlist: false,
      activeTab: "description",
      tabs: [
        { id: "description", label: "Описание" },
        { id: "additional", label: "Дополнительная информация" },
      ],
    };
  },
  watch: {
    productId: {
      immediate: true,
      handler(newVal) {
        if (newVal && this.isOpen) {
          this.fetchProductDetails();
        }
      },
    },
    isOpen(newVal: boolean) {
      if (newVal && this.productId) {
        this.fetchProductDetails();
        this.addKeyboardListeners();
      } else {
        this.removeKeyboardListeners();
      }

      // Handle body scroll
      if (newVal) {
        document.body.classList.add("modal-open");
      } else {
        document.body.classList.remove("modal-open");
      }
    },
  },
  mounted() {
    if (this.isOpen) {
      this.addKeyboardListeners();
    }
  },
  beforeUnmount() {
    this.removeKeyboardListeners();
    document.body.classList.remove("modal-open");
  },
  methods: {
    addKeyboardListeners(): void {
      if (typeof document !== "undefined") {
        document.addEventListener("keydown", this.handleKeyDown);
      }
    },
    removeKeyboardListeners(): void {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", this.handleKeyDown);
      }
    },
    handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        this.closeModal();
      }
    },
    async fetchProductDetails(): Promise<void> {
      if (!this.productId) return;

      this.loading = true;
      this.error = null;

      try {
        // In a real app, you'd fetch from API
        // For now, we're just using the productId data directly
        await new Promise((resolve) => setTimeout(resolve, 300));

        this.product = {
          ...this.productId,
        };
        this.quantity = 1;

        // Check if product is in wishlist
        this.isInWishlist = this.checkIfInWishlist();
      } catch (err) {
        console.error("Error fetching product details:", err);
        this.error = "Failed to load product details. Please try again.";
      } finally {
        this.loading = false;
      }
    },

    closeModal(): void {
      this.$emit("close");
    },

    increaseQuantity(): void {
      if (this.quantity < this.product.Quantity) {
        this.quantity++;
      }
    },

    decreaseQuantity(): void {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },

    addToCart(): void {
      if (this.product.Quantity <= 0) return;
      cartStore.addItem(
        { ...this.product, Id: String(this.product.Id) },
        this.quantity
      );

      // Show confirmation
      this.showToast(
        `${this.product.ProductName} добавлен в корзину!`,
        "success"
      );
    },

    toggleWishlist(): void {
      this.isInWishlist = !this.isInWishlist;

      if (this.isInWishlist) {
        // Add to wishlist logic
        this.showToast(
          `${this.product.ProductName} добавлен в закладки!`,
          "success"
        );
      } else {
        // Remove from wishlist logic
        this.showToast(
          `${this.product.ProductName} удален из закладок.`,
          "info"
        );
      }
    },

    showToast(message: string, type: string = "info"): void {
      // If you have a toast plugin
      if ((this as any).$toast) {
        (this as any).$toast[type](message);
      } else {
        // Fallback - you can implement a simple toast system
        console.log(`TOAST [${type}]: ${message}`);
      }
    },

    checkIfInWishlist(): boolean {
      // Implementation would depend on your wishlist storage method
      return false;
    },

    formatCurrency(value: number): string {
      return new Intl.NumberFormat("tg-TJ", {
        style: "currency",
        currency: "TJS",
        currencyDisplay: "name",
      })
        .format(value)
        .replace("Tajikistani somonis", "сомонӣ");
    },

    formatDate(dateString: string): string {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(dateString).toLocaleDateString("ru-RU", options);
    },
  },
});
</script>

<style scoped>
.product-info-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1001;
}

.modal-container {
  position: relative;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  z-index: 1002;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eaeaea;
}

.product-title {
  margin: 0;
  font-size: 1.75rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #777;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

/* Product Info Grid */
.product-info-grid {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr);
  gap: 2rem;
  padding: 2rem;
}

/* Product Gallery */
.product-gallery {
  display: flex;
  flex-direction: column;
}

.main-image-container {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-thumbnails {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.thumbnail-button {
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: border-color 0.2s;
}

.thumbnail-button.active {
  border-color: #4caf50;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Details */
.product-details {
  display: flex;
  flex-direction: column;
}

.product-header {
  margin-bottom: 1.5rem;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.product-category {
  color: #666;
  font-size: 0.9rem;
  background-color: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
}

.product-rating {
  display: flex;
  align-items: center;
}

.stars {
  display: flex;
  margin-right: 0.5rem;
}

.star {
  color: #ddd;
  font-size: 1.2rem;
}

.star.filled {
  color: #ffc107;
}

.rating-count {
  color: #666;
  font-size: 0.9rem;
}

.product-price-container {
  margin-bottom: 1rem;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.current-price {
  color: #212121;
  font-size: 1.75rem;
  font-weight: 700;
}

.product-description {
  margin-bottom: 1.5rem;
  color: #555;
  line-height: 1.6;
}

/* Product Specifications */
.product-specs {
  margin-bottom: 1.5rem;
}

.product-specs h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  color: #333;
}

.specs-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
}

.spec-label {
  color: #666;
  font-size: 0.85rem;
}

.spec-value {
  font-weight: 500;
  color: #333;
}

/* Color Options */
.product-colors {
  margin-bottom: 1.5rem;
}

.product-colors h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  color: #333;
}

.color-options {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.color-option.selected {
  border-color: #333;
  transform: scale(1.1);
}

.color-check {
  color: white;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  font-weight: bold;
}

.selected-color-name {
  font-size: 0.9rem;
  color: #666;
}

/* Size Options */
.product-sizes {
  margin-bottom: 1.5rem;
}

.product-sizes h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  color: #333;
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.size-option {
  min-width: 50px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  background-color: white;
  transition: all 0.2s;
}

.size-option:hover {
  border-color: #999;
}

.size-option.selected {
  border-color: #4caf50;
  background-color: #e8f5e9;
  color: #4caf50;
  font-weight: 500;
}

/* Quantity Selector */
.product-quantity {
  margin-bottom: 1.5rem;
}

.product-quantity h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  color: #333;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #eaeaea;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-display {
  min-width: 40px;
  text-align: center;
  font-weight: 500;
}

/* Availability */
.product-availability {
  margin-top: 1rem;
  font-weight: 500;
  padding: 0.5rem 0;
}

.in-stock {
  color: #4caf50;
}

.out-of-stock {
  color: #f44336;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.add-to-cart-btn,
.wishlist-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-cart-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
  flex: 1;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #3b7fd7;
}

.add-to-cart-btn:disabled {
  background-color: #b3d1f5;
  cursor: not-allowed;
}

.wishlist-btn {
  background-color: transparent;
  border: 1px solid #ddd;
  color: #666;
}

.wishlist-btn:hover {
  background-color: #f5f5f5;
}

.wishlist-btn svg.filled {
  fill: #f44336;
  stroke: #f44336;
}

/* Product Tabs */
.product-tabs {
  margin-top: 3rem;
  padding: 0 2rem 2rem;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 1.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #333;
}

.tab-button.active {
  color: #4a90e2;
  border-bottom-color: #4a90e2;
}

.tab-content {
  padding: 1rem 0;
}

.tab-pane {
  line-height: 1.6;
  color: #555;
}

/* Detailed Description */
.detailed-description {
  max-width: 100%;
}

.detailed-description h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.detailed-description p {
  margin-bottom: 1rem;
}

.detailed-description ul,
.detailed-description ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

/* Additional Info Table */
.additional-info-table {
  width: 100%;
  border-collapse: collapse;
}

.additional-info-table th,
.additional-info-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eaeaea;
}

.additional-info-table th {
  font-weight: 500;
  width: 30%;
  background-color: #f9f9f9;
}

/* Reviews */
.review-item {
  border-bottom: 1px solid #eaeaea;
  padding: 1.5rem 0;
}

.review-item:first-child {
  padding-top: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.reviewer-name {
  font-weight: 500;
  margin-right: 0.5rem;
}

.review-date {
  color: #999;
  font-size: 0.875rem;
}

.review-content {
  line-height: 1.6;
}

.no-reviews {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}

/* Related Products */
.related-products {
  margin-top: 3rem;
  padding: 0 2rem 2rem;
}

.related-products h3 {
  margin-bottom: 1.5rem;
}

.related-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.related-product-card {
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0.75rem;
  border-radius: 8px;
}

.related-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.related-product-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.related-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-product-name {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-product-price {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a90e2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .product-info-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .tabs-header {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 0.5rem;
  }

  .tab-button {
    padding: 0.75rem 1rem;
  }

  .related-products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
