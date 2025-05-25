<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "~/stores/cartStore";

const route = useRoute();
const router = useRouter();
const store = useCartStore();

interface OrderDetails {
  orderNumber: string;
  date: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: {
    addressLine1: string;
    city: string;
    country?: string;
  };
  items: any[];
  paymentMethod: string;
  shippingMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const orderDetails = ref<OrderDetails | null>(null);
const isLoading = ref(true);
const loadError = ref("");

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
};

// Format currency for display
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tg-TJ", {
    style: "currency",
    currency: "TJS",
    currencyDisplay: "name",
  })
    .format(amount)
    .replace("Tajikistani somonis", "сомонӣ")
    .replace("сомонии Тоҷикистон", "сомонӣ");
};

// Estimated delivery date (5-7 business days from now)
const getEstimatedDelivery = () => {
  const today = new Date();
  const businessDays = Math.floor(Math.random() * 2);

  // Add business days (skip weekends)
  let deliveryDate = new Date(today);
  let daysAdded = 0;

  while (daysAdded < businessDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
      daysAdded++;
    }
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return deliveryDate.toLocaleDateString("ru-RU", options);
};

// Print order confirmation
const printConfirmation = () => {
  window.print();
};

// Continue shopping
const continueShopping = () => {
  router.push("/products");
};

// Load order details
onMounted(async () => {
  const checkoutData = localStorage.getItem("checkoutData");
  if (!checkoutData) {
    loadError.value = "Order ID not found";
    isLoading.value = false;
    return;
  }

  try {
    let orderNumber = "";
    let date = "";
    let status = "";
    let shippingAddress: { addressLine1?: string; city?: string } = {};
    let customer: { firstName?: string; lastName?: string; email?: string } =
      {};
    let paymentMethod = "";
    let shippingMethod = "";
    let shipping = 0;
    let subtotal = 0;
    let tax = 0;
    let total = 0;
    let items = [];

    if (checkoutData) {
      const parsedData = JSON.parse(checkoutData);
      orderNumber = parsedData.orderNumber || "";
      date = parsedData.date || "";
      status = parsedData.status || "";
      shippingAddress = parsedData.shippingAddress || {};
      customer = parsedData.customer || {};
      paymentMethod = parsedData.paymentMethod || "";
      shippingMethod = parsedData.shippingMethod || "";
      shipping = parsedData.shippingCost || 0;
      subtotal = parsedData.subtotal || 0;
      tax = parsedData.tax || 0;
      total = parsedData.total || 0;
      items = parsedData.items || [];
    }

    // Create order details using available data
    orderDetails.value = {
      orderNumber: orderNumber,
      date: date,
      status: status,
      customer: {
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
      },
      shippingAddress: {
        addressLine1: shippingAddress.addressLine1 || "",
        city: shippingAddress.city || "",
      },
      items: items,
      paymentMethod: paymentMethod,
      shippingMethod: shippingMethod,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: total,
    };

    // Clear cart after successful order
    // This should be done in checkout, but we add it here as a safeguard
    if (store.items.length > 0) {
      store.clearCart();
    }
  } catch (error) {
    console.error("Failed to load order details:", error);
    loadError.value = "Failed to load order details. Please try again later.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="order-confirmation-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка деталей вашего заказа...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="error-state">
      <h2>Ого! Что-то пошло не так.</h2>
      <p>{{ loadError }}</p>
    </div>

    <!-- Success State -->
    <div v-else class="confirmation-content">
      <!-- Header with Success Message -->
      <div class="confirmation-header">
        <div class="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1>Спасибо за Ваш заказ!</h1>
        <p class="confirmation-message">
          Ваш заказ подтвержден и обрабатывается. Мы отправили подтверждающее
          письмо на
          <strong>{{ orderDetails?.customer?.email || "" }}</strong
          >.
        </p>
      </div>

      <!-- Order Summary Card -->
      <div class="order-summary-card">
        <div class="order-info">
          <div class="info-item">
            <span class="label">Номер заказа:</span>
            <span class="value">{{ orderDetails?.orderNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">Дата заказа:</span>
            <span class="value">{{ orderDetails?.date }}</span>
          </div>
          <div class="info-item">
            <span class="label">Статус Заказа:</span>
            <span class="value status">{{ orderDetails?.status }}</span>
          </div>
        </div>

        <!-- Estimated Delivery -->
        <div class="estimated-delivery">
          <h3>Предполагаемая доставка</h3>
          <p class="delivery-date">{{ getEstimatedDelivery() }}</p>
          <p class="delivery-note">
            Вам позвонит наш курьер и проинформирует Вас по поводу Вашего
            заказа.
          </p>
        </div>
      </div>

      <!-- Order Details Section -->
      <div class="order-details-section">
        <h2>Детали заказа</h2>

        <div class="details-grid">
          <!-- Shipping Information -->
          <div class="detail-card">
            <h3>Адрес доставки</h3>
            <div class="card-content">
              <p>
                <strong>Имя:</strong>
                {{ orderDetails?.customer.firstName }}
                {{ orderDetails?.customer.lastName }}
              </p>
              <p>
                <strong>Адрес:</strong>
                {{ orderDetails?.shippingAddress.addressLine1 }}
              </p>

              <p>
                <strong>Город:</strong>
                {{ orderDetails?.shippingAddress.city }}
              </p>
              <p>{{ orderDetails?.shippingAddress?.country }}</p>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="detail-card">
            <h3>Оплата и доставка</h3>
            <div class="card-content">
              <p>
                <strong>Тип оплаты:</strong> {{ orderDetails?.paymentMethod }}
              </p>
              <p>
                <strong>Тип доставки:</strong>
                {{ orderDetails?.shippingMethod }}
              </p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items">
          <h3>Заказанные препараты</h3>
          <div class="items-table">
            <div class="table-header">
              <div class="header-item product-col">Наименование</div>
              <div class="header-item price-col">Цена</div>
              <div class="header-item quantity-col">Количество</div>
              <div class="header-item total-col">Итого</div>
            </div>

            <div
              v-for="item in orderDetails?.items"
              :key="item.id"
              class="table-row"
            >
              <div class="row-item product-col">
                <div class="product-info">
                  <h4>{{ item.name }}</h4>
                </div>
              </div>
              <div class="row-item price-col">
                {{ formatCurrency(item.price) }}
              </div>
              <div class="row-item quantity-col">
                {{ item.quantity }}
              </div>
              <div class="row-item total-col">
                {{ formatCurrency(item.price * item.quantity) }}
              </div>
            </div>

            <!-- Order Summary -->
            <div class="order-totals">
              <div class="total-row">
                <span>Промежуточный итог: </span>
                <span>{{ formatCurrency(orderDetails?.subtotal ?? 0) }}</span>
              </div>
              <div class="total-row">
                <span>Доставка: </span>
                <span>{{ formatCurrency(orderDetails?.shipping ?? 0) }}</span>
              </div>
              <div class="total-row">
                <span>НДС: </span>
                <span>{{ formatCurrency(orderDetails?.tax ?? 0) }}</span>
              </div>
              <div class="total-row grand-total">
                <span>Итого: </span>
                <span>{{ formatCurrency(orderDetails?.total ?? 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="confirmation-actions">
        <button @click="printConfirmation" class="btn-secondary">
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
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path
              d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
            ></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Распечатать квитанцию
        </button>
        <button @click="continueShopping" class="btn-primary">
          Продолжить покупку
        </button>
      </div>

      <!-- Customer Support -->
      <div class="customer-support">
        <h3>Нужна помощь?</h3>
        <p>
          Если у вас есть вопросы по вашему заказу, свяжитесь с нашей службой
          поддержки клиентов:
        </p>
        <div class="support-options">
          <div class="support-option">
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
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              ></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>info@apteka.tj</span>
          </div>
          <div class="support-option">
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
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              ></path>
            </svg>
            <span>+992 93 333-33-33</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-confirmation-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4caf50;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state h2 {
  color: #f44336;
  margin-bottom: 1rem;
}

.error-state button {
  margin-top: 1.5rem;
}

/* Confirmation Header */
.confirmation-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  color: #4caf50;
  margin: 0 auto 1.5rem;
}

.confirmation-header h1 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: #333;
}

.confirmation-message {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  color: #666;
}

/* Order Summary Card */
.order-summary-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}

.order-info {
  flex: 1;
  min-width: 280px;
}

.info-item {
  margin-bottom: 0.75rem;
}

.label {
  font-weight: 500;
  color: #666;
  margin-right: 0.5rem;
}

.value {
  font-weight: 600;
  color: #333;
}

.value.status {
  color: #4caf50;
}

.estimated-delivery {
  flex: 1;
  min-width: 280px;
  padding: 1rem;
  background-color: #f0f7f0;
  border-radius: 6px;
  border-left: 4px solid #4caf50;
}

.estimated-delivery h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
}

.delivery-date {
  font-size: 1.2rem;
  font-weight: 700;
  color: #4caf50;
  margin-bottom: 0.5rem;
}

.delivery-note {
  font-size: 0.9rem;
  color: #666;
}

/* Order Details Section */
.order-details-section {
  margin-bottom: 2.5rem;
}

.order-details-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.75rem;
}

.details-grid {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.detail-card {
  flex: 1;
  min-width: 280px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.detail-card h3 {
  margin: 0;
  padding: 1rem;
  background-color: #f0f0f0;
  color: #333;
  font-size: 1.1rem;
}

.card-content {
  padding: 1rem;
}

.card-content p {
  margin: 0.5rem 0;
  color: #555;
}

/* Order Items */
.order-items {
  margin-bottom: 2rem;
}

.order-items h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #333;
}

.items-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: #f5f5f5;
  padding: 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
}

.table-row {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.table-row:last-child {
  border-bottom: none;
}

.header-item,
.row-item {
  padding: 0 0.5rem;
}

.product-col {
  flex: 3;
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-info h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.price-col {
  flex: 1;
  display: flex;
  align-items: center;
}

.quantity-col {
  flex: 1;
  display: flex;
  align-items: center;
}

.total-col {
  flex: 1;
  display: flex;
  align-items: center;
  font-weight: 600;
}

/* Order Totals */
.order-totals {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.grand-total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-size: 1.2rem;
  font-weight: 700;
}

/* Actions */
.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background-color: white;
  border: 1px solid #ddd;
  color: #333;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}

.btn-primary {
  background-color: #4caf50;
  border: 1px solid #4caf50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

/* Customer Support */
.customer-support {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.customer-support h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.customer-support p {
  margin-bottom: 1.5rem;
  color: #666;
}

.support-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.support-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4caf50;
  font-weight: 500;
}

/* Print styles */
@media print {
  .confirmation-actions,
  .customer-support {
    display: none;
  }

  .order-confirmation-container {
    padding: 0;
  }

  body {
    font-size: 12pt;
  }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .order-summary-card {
    flex-direction: column;
    gap: 1.5rem;
  }

  .table-header {
    display: none;
  }

  .table-row {
    flex-direction: column;
    padding: 1.5rem 1rem;
  }

  .row-item {
    margin-bottom: 0.75rem;
    padding: 0;
    display: flex;
  }

  .product-col {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .price-col::before {
    content: "Цена: ";
    font-weight: 500;
    margin-right: 0.5rem;
  }

  .quantity-col::before {
    content: "Количество: ";
    font-weight: 500;
    margin-right: 0.5rem;
  }

  .total-col::before {
    content: "Итого: ";
    font-weight: 500;
    margin-right: 0.5rem;
  }

  .confirmation-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
