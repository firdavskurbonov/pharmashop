<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Cart Button -->
    <div class="cart-button-container flex justify-center p-4">
      <button
        @click="openCart"
        class="cart-button bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-2 rounded flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span class="ml-2">Корзина</span>
        <span
          v-if="
            cartStore?.totalItems !== undefined && cartStore?.totalItems > 0
          "
          class="ml-1 bg-white text-indigo-600 rounded-full px-1 py-0.5 text-xs font-bold"
        >
          {{ cartStore?.totalItems || 0 }}
        </span>
      </button>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Поиск препаратов..."
          class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <div class="absolute left-3 top-2.5 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Filter and Sort Controls -->
    <!-- <div class="mb-8 bg-white p-4 rounded-lg shadow">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
      >
        <!-- Manufacturer Filter -->
    <!-- <div class="w-full md:w-1/4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Производитель</label
          >
          <select
            v-model="selectedManufacturer"
            @change="filterByManufacturer"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Все производители</option>
            <option
              v-for="manufacturer in manufacturers"
              :key="manufacturer"
              :value="manufacturer"
            >
              {{ manufacturer }}
            </option>
          </select>
        </div> -->

    <!-- Price Range Filter -->
    <!-- <div class="w-full md:w-2/5">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Диапазон цен</label
          >
          <div class="flex items-center space-x-4">
            <input
              v-model.number="priceMin"
              type="number"
              placeholder="Минимальная цена"
              class="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              step="0.01"
              @change="filterByPrice"
            />
            <input
              v-model.number="priceMax"
              type="number"
              placeholder="Максимальная цена"
              class="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              step="0.01"
              @change="filterByPrice"
            />
          </div>
        </div> -->

    <!-- Sort Options -->
    <!-- <div class="w-full md:w-1/4">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Сортировать по</label
          >
          <select
            v-model="sortOption"
            @change="sortProducts"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="default">По умолчанию</option>
            <option value="price-asc">
              Цена: От минимальной к максимальной
            </option>
            <option value="price-desc">
              Цена: От максимальной к минимальной
            </option>
            <option value="name-asc">Наименование: от А до Я</option>
            <option value="name-desc">Наименование: от Я до A</option>
            <option value="expiry-asc">Срок годности: Ранние cначала</option>
            <option value="expiry-desc">
              Срок годности: Последние cначала
            </option>
            <option value="quantity-asc">
              Количество: От мин. к максимуму
            </option>
            <option value="quantity-desc">
              Количество: От макс. к минимуму
            </option>
          </select>
        </div>
      </div> -->

    <!-- Reset Filters Button -->
    <!-- <div class="mt-4">
        <button
          @click="resetFilters"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>  -->

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Загрузка препаратов...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
    >
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
      <button
        @click="retryFetch"
        class="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded"
      >
        Попробуйте еще раз
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProducts?.length === 0" class="text-center py-12">
      <h3 class="text-xl font-medium text-gray-900">Нет препаратов</h3>
      <p class="mt-4 text-gray-500">
        Попробуйте настроить фильтры или зайдите позже.
      </p>
    </div>

    <!-- Product Table -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="block sm:hidden p-4">
        <h2 class="text-lg font-bold mb-4">Товары</h2>
        <div
          v-for="product in filteredProducts"
          :key="product.Id"
          class="mb-4 border-b pb-2"
        >
          <div class="flex justify-between items-center">
            <div class="font-medium">{{ product.ProductName }}</div>
            <div class="text-sm text-gray-500">
              {{ formatPrice(product.Price) }}
            </div>
          </div>
          <div class="text-sm text-gray-500">
            Производитель: {{ product.ManufactName }}
          </div>
          <div class="text-sm text-gray-500">
            Количество: {{ product.Quantity }}
          </div>
          <div class="text-sm text-gray-500">
            Срок годности: {{ formatDate(product.ExpireDate) }}
          </div>
          <div class="flex justify-end space-x-2 mt-2">
            <button
              @click.stop="showProductInfo(product)"
              class="text-indigo-600 hover:text-indigo-900"
            >
              Подробнее
            </button>
            <button
              @click="addToCart(product)"
              :disabled="product.Quantity === 0"
              :class="[
                'px-3 py-1 rounded-md text-sm',
                product.Quantity > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500',
              ]"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>

      <table class="min-w-full hidden sm:table divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Наименование
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Производитель
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Цена
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Количество
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Срок годности
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="product in filteredProducts"
            :key="product.Id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 whitespace-normal">
              <div class="text-sm font-medium text-gray-900">
                {{ product.ProductName }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">
                {{ product.ManufactName }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ formatPrice(product.Price) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStockClass(product.Quantity)">{{
                product.Quantity
              }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">
                {{ formatDate(product.ExpireDate) }}
              </div>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <div class="flex justify-end space-x-2">
                <button
                  @click.stop="showProductInfo(product)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Подробнее
                </button>
                <button
                  @click="addToCart(product)"
                  :disabled="product.Quantity === 0"
                  :class="[
                    'px-3 py-1 rounded-md text-sm',
                    product.Quantity > 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-300 cursor-not-allowed text-gray-500',
                  ]"
                >
                  Добавить
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <!-- Pagination Info -->
          <div
            class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm text-gray-700">
                Показаны <span class="font-medium">{{ startItem }}</span> -
                <span class="font-medium">{{ endItem }}</span> из
                <span class="font-medium">{{
                  productStore.pagination?.totalRecords || 0
                }}</span>
                товаров
              </p>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="flex-1 flex justify-between sm:justify-end">
            <button
              @click="goToPreviousPage"
              :disabled="productStore.pagination?.currentPage === 1"
              :class="[
                'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white',
                productStore.pagination?.currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50',
              ]"
            >
              Предыдущая
            </button>
            <div class="hidden md:flex mx-2">
              <template v-for="page in pageNumbers" :key="page">
                <button
                  @click="goToPage(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium mx-1 rounded-md',
                    page === productStore.pagination?.currentPage
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                  ]"
                >
                  {{ page }}
                </button>
              </template>
            </div>
            <button
              @click="goToNextPage"
              :disabled="
                productStore.pagination?.currentPage ===
                productStore.pagination?.totalPages
              "
              :class="[
                'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white',
                productStore.pagination?.currentPage ===
                productStore.pagination?.totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50',
              ]"
            >
              Следующая
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Shopping Cart Component -->
    <ShoppingCart :is-open="isCartOpen" @close="closeCart" />

    <!-- ProductInfo Component -->
    <client-only>
      <ProductInfo
        :isOpen="isProductInfoVisible"
        :productId="
          selectedProduct
            ? { ...selectedProduct, Id: Number(selectedProduct.Id) }
            : undefined
        "
        @close="closeProductInfo"
      />
    </client-only>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useProductStore } from "~/stores/productStore";
import { useCartStore } from "~/stores/cartStore";
import ShoppingCart from "~/components/ShoppingCart.vue";
import ProductInfo from "~/components/ProductInfo.vue";

const productStore = useProductStore();
const cartStore = useCartStore();

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

// Search and filters
const searchQuery = ref("");
const selectedManufacturer = ref("");
const priceMin = ref(null);
const priceMax = ref(null);
const sortOption = ref("default");

// UI state
const isCartOpen = ref(false);
const isProductInfoVisible = ref(false);
const selectedProduct = ref(null);
const activeQuantityPopover = ref(null);

// Fetch products on mount
onMounted(async () => {
  await fetchProducts();
});

// Computed properties
const loading = computed(() => productStore.loading);
const error = computed(() => productStore.error);
const filteredProducts = computed(() => productStore.filteredProducts);
const manufacturers = computed(() => productStore.manufacturers);

// Calculate pagination info
const startItem = computed(() => {
  if (!productStore.pagination || productStore.pagination.totalRecords === 0)
    return 0;
  return (
    (productStore.pagination.currentPage - 1) *
      productStore.pagination.pageSize +
    1
  );
});

const endItem = computed(() => {
  if (!productStore.pagination) return 0;
  return Math.min(
    startItem.value + productStore.pagination.pageSize - 1,
    productStore.pagination.totalRecords
  );
});

// Generate page numbers for pagination
const pageNumbers = computed(() => {
  if (!productStore.pagination) return [];

  const total = productStore.pagination.totalPages;
  const current = productStore.pagination.currentPage;

  // For 7 or fewer pages, show all
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // For more than 7 pages, show current ±2 with ellipsis
  if (current <= 3) {
    // Near start
    return [1, 2, 3, 4, 5, "...", total];
  } else if (current >= total - 2) {
    // Near end
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  } else {
    // Middle
    return [1, "...", current - 1, current, current + 1, "...", total];
  }
});

// Fetch products method
async function fetchProducts() {
  await productStore.fetchProducts(
    searchQuery.value,
    currentPage.value,
    pageSize.value
  );
}

// Pagination methods
function goToPage(page) {
  if (typeof page === "number") {
    currentPage.value = page;
    fetchProducts();
  }
}

function goToNextPage() {
  if (
    productStore.pagination &&
    currentPage.value < productStore.pagination.totalPages
  ) {
    currentPage.value++;
    fetchProducts();
  }
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchProducts();
  }
}

// Search and filter methods
function handleSearch() {
  // Reset to page 1 when search changes
  currentPage.value = 1;
  fetchProducts();
  productStore.setSearchQuery(searchQuery.value);
}

function filterByManufacturer() {
  productStore.setManufacturer(selectedManufacturer.value);
}

function filterByPrice() {
  productStore.setPriceRange(priceMin.value, priceMax.value);
}

function sortProducts() {
  productStore.setSortBy(sortOption.value);
}

function resetFilters() {
  searchQuery.value = "";
  selectedManufacturer.value = "";
  priceMin.value = null;
  priceMax.value = null;
  sortOption.value = "default";

  productStore.resetFilters();
  currentPage.value = 1;
  fetchProducts();
}

function retryFetch() {
  fetchProducts();
}

// Product info modal
function showProductInfo(product) {
  selectedProduct.value = product;
  isProductInfoVisible.value = true;
}

function closeProductInfo() {
  isProductInfoVisible.value = false;
  selectedProduct.value = null;
}

// Cart methods
function openCart() {
  isCartOpen.value = true;
}

function closeCart() {
  isCartOpen.value = false;
}

function addToCart(product) {
  // Call addItem with the product object and the desired quantity
  cartStore.addItem(product, 1); // or any other quantity you want to add
}

function isInCart(productId) {
  return cartStore.items.some((item) => item.id === productId);
}

function getCartQuantity(productId) {
  const item = cartStore.items.find((item) => item.id === productId);
  return item ? item.quantity : 0;
}

function openQuantityPopover(productId) {
  if (activeQuantityPopover.value === productId) {
    activeQuantityPopover.value = null;
  } else {
    activeQuantityPopover.value = productId;
  }
}

function incrementItem(productId) {
  cartStore.incrementItem(productId);
}

function decrementItem(productId) {
  cartStore.decrementItem(productId);
}

function removeFromCart(productId) {
  cartStore.removeItem(productId);
  activeQuantityPopover.value = null;
}

// Formatters
function formatPrice(price) {
  return new Intl.NumberFormat("tg-TJ", {
    style: "currency",
    currency: "TJS",
    currencyDisplay: "name",
  })
    .format(price)
    .replace("Tajikistani somonis", "сомонӣ");
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("ru-RU");
}

function getStockClass(quantity) {
  if (quantity === 0) {
    return "px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800";
  } else if (quantity < 5) {
    return "px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800";
  } else {
    return "px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800";
  }
}

// Close quantity popover when clicking outside
function handleClickOutside(event) {
  if (activeQuantityPopover.value !== null) {
    const popoverElements = document.querySelectorAll(".quantity-popover");
    let clickedInsidePopover = false;

    popoverElements.forEach((element) => {
      if (element.contains(event.target)) {
        clickedInsidePopover = true;
      }
    });

    if (!clickedInsidePopover) {
      activeQuantityPopover.value = null;
    }
  }
}

// Additional event handlers for accessibility
const handleEscapeKey = (event) => {
  if (event.key === "Escape") {
    // Close any open UI elements when Escape is pressed
    if (activeQuantityPopover.value !== null) {
      activeQuantityPopover.value = null;
    }
    if (isProductInfoVisible.value) {
      closeProductInfo();
    }
    if (isCartOpen.value) {
      closeCart();
    }
  }
};

// Add keyboard accessibility for popover navigation
const handleTabKey = (event) => {
  if (activeQuantityPopover.value !== null && event.key === "Tab") {
    // Get all focusable elements in the popover
    const popover = document.querySelector(
      `[data-popover-id="${activeQuantityPopover.value}"]`
    );
    if (popover) {
      const focusableElements = popover.querySelectorAll(
        'button, [tabindex]:not([tabindex="-1"])'
      );

      // If Tab is pressed on the last element, close the popover
      if (
        event.target === focusableElements[focusableElements.length - 1] &&
        !event.shiftKey
      ) {
        activeQuantityPopover.value = null;
      }
    }
  }
};

// Function to check if product has low stock (used for warnings)
function hasLowStock(quantity) {
  return quantity > 0 && quantity < 5;
}

// Function to check if product is expired or expiring soon
function isExpiringSoon(dateString) {
  const expiryDate = new Date(dateString);
  const today = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);

  return expiryDate <= oneMonthFromNow;
}

// Add warning indicators for products
function getExpiryWarning(dateString) {
  const expiryDate = new Date(dateString);
  const today = new Date();

  if (expiryDate < today) {
    return "Срок годности истек";
  } else if (isExpiringSoon(dateString)) {
    return "Истекает в течение месяца";
  }
  return null;
}

// Enhanced search with debounce
let searchTimeout = null;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 300); // 300ms debounce delay
}

// Handle number input validation for price filters
function validatePriceInput(event, field) {
  // Allow only numbers and decimal point
  const value = event.target.value;
  if (!/^\d*\.?\d*$/.test(value)) {
    // Reset to previous valid value if input is invalid
    event.target.value = field === "min" ? priceMin.value : priceMax.value;
  }
}

// Watch for pagination changes
watch(
  () => productStore.pagination,
  (newPagination) => {
    if (newPagination) {
      pageSize.value = newPagination.pageSize;
      currentPage.value = newPagination.currentPage;
    }
  },
  { deep: true }
);

// Update URL when filters change for shareable links
watch([searchQuery, selectedManufacturer, currentPage], () => {
  const url = new URL(window.location);

  if (searchQuery.value) {
    url.searchParams.set("search", searchQuery.value);
  } else {
    url.searchParams.delete("search");
  }

  if (selectedManufacturer.value) {
    url.searchParams.set("manufacturer", selectedManufacturer.value);
  } else {
    url.searchParams.delete("manufacturer");
  }

  if (currentPage.value > 1) {
    url.searchParams.set("page", currentPage.value);
  } else {
    url.searchParams.delete("page");
  }

  // Update URL without refreshing the page
  window.history.replaceState({}, "", url);
});

// Add global click handler for popovers and other event listeners
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscapeKey);
  document.addEventListener("keydown", handleTabKey);

  // Initialize with URL params if they exist
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("search")) {
    searchQuery.value = urlParams.get("search");
  }
  if (urlParams.has("manufacturer")) {
    selectedManufacturer.value = urlParams.get("manufacturer");
  }
  if (urlParams.has("page")) {
    const page = parseInt(urlParams.get("page"));
    if (!isNaN(page) && page > 0) {
      currentPage.value = page;
    }
  }

  // Apply any URL parameters that were set
  fetchProducts();
});

// Clean up event listeners
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleEscapeKey);
  document.removeEventListener("keydown", handleTabKey);
});

// Export methods for potential testing or external use
defineExpose({
  fetchProducts,
  resetFilters,
  addToCart,
  formatPrice,
  formatDate,
});
</script>

<!-- <style>
@media (max-width: 768px) {
  .cart-button-container {
    bottom: 10px;
    right: 10px;
  }

  .cart-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
.cart-button-container {
  position: fixed;
  top: 10px; /* Distance from the bottom of the screen */
  right: 20px; /* Distance from the right of the screen */
  z-index: 50; /* Ensure it stays above other elements */
}

.cart-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}
</style> -->

<style>
@media (max-width: 768px) {
  .cart-button-container {
    bottom: 10px;
    right: 10px;
  }

  .cart-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    width: 40px;
    height: 40px;
  }
}
.cart-button-container {
  position: fixed;
  top: 10px; /* Distance from the bottom of the screen */
  right: 20px; /* Distance from the right of the screen */
  z-index: 50; /* Ensure it stays above other elements */
}

.cart-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}
</style>
