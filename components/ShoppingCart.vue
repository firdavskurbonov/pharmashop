<!-- components/ShoppingCart.vue -->
<template>
  <div
    class="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300"
    :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- Cart Header -->
    <div class="flex justify-between items-center p-4 border-b">
      <h2 class="text-lg font-semibold">Корзина</h2>
      <button @click="closeCart" class="text-gray-500 hover:text-gray-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Empty Cart State -->
    <div v-if="cartStore.cartIsEmpty" class="p-4 text-center text-gray-500">
      <div class="py-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 mx-auto text-gray-400"
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
        <p class="mt-4">Ваша корзина пуста</p>
      </div>
    </div>

    <!-- Cart Items -->
    <div v-else class="flex flex-col h-full">
      <div class="flex-grow overflow-y-auto p-4">
        <div
          v-for="item in cartStore.items"
          :key="item.product.Id"
          class="mb-4 border-b pb-4"
        >
          <div class="flex justify-between">
            <div class="flex-grow mr-2">
              <p class="font-medium">{{ item.product.ProductName }}</p>
              <p class="text-sm text-gray-500">
                {{ formatPrice(item.product.Price) }} каждый
              </p>
            </div>
          </div>

          <div class="flex justify-between items-center mt-2">
            <div class="flex items-center">
              <button
                @click="decrementItem(item.product.Id)"
                class="bg-gray-200 px-2 py-1 rounded-l"
              >
                -
              </button>
              <span class="bg-gray-100 px-4 py-1">{{ item.quantity }}</span>
              <button
                @click="incrementItem(item.product.Id)"
                class="bg-gray-200 px-2 py-1 rounded-r"
                :disabled="item.quantity >= item.product.Quantity"
              >
                +
              </button>
            </div>
            <div>
              <p class="font-medium">
                {{ formatPrice(item.product.Price * item.quantity) }}
              </p>
              <button
                @click="removeItem(item.product.Id)"
                class="text-sm text-red-500 hover:text-red-700"
              >
                Убрать
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div class="border-t p-4">
        <div class="flex justify-between mb-2">
          <span>Всего препаратов:</span>
          <span>{{ cartStore.totalItems }}</span>
        </div>
        <div class="flex justify-between font-bold text-lg mb-4">
          <span>Итого:</span>
          <span>{{ formatPrice(cartStore.totalPrice) }}</span>
        </div>

        <button
          @click="checkout"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
        >
          Заказать
        </button>
        <button
          @click="cartStore.clearCart"
          class="w-full mt-2 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 border border-gray-400 rounded"
        >
          Очистить корзину
        </button>
      </div>
    </div>
  </div>

  <!-- Cart Overlay -->
  <div
    v-if="isOpen"
    @click="closeCart"
    class="fixed inset-0 bg-black bg-opacity-50 z-40"
  ></div>
</template>

<script setup lang="ts">
import { useCartStore } from "../stores/cartStore";
import { useRouter } from "vue-router"; // Import useRouter from vue-router

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const cartStore = useCartStore();
const router = useRouter(); // Get the router instance

const formatPrice = (price: number): string => {
  if (price === undefined || price === null) {
    return "0.00"; // or any default value you prefer
  }
  return price.toFixed(2);
};

const closeCart = () => {
  emit("close");
};

const removeItem = (id: string) => {
  cartStore.removeItem(id);
};

const incrementItem = (id: string) => {
  cartStore.incrementQuantity(id);
};

const decrementItem = (id: string) => {
  cartStore.decrementQuantity(id);
};

const checkout = () => {
  router.push({ name: "checkout" });
};
</script>
