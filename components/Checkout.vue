<!-- components/Checkout.vue -->
<template>
  <div class="checkout-container">
    <h1 class="page-title">Заказ</h1>

    <!-- Checkout Progress -->
    <div class="checkout-progress">
      <div
        v-for="step in totalSteps"
        :key="step"
        class="progress-step"
        :class="{ active: step <= currentStep, completed: step < currentStep }"
        @click="step < currentStep && goToStep(step)"
      >
        <div class="step-number">{{ step }}</div>
        <div class="step-label">
          {{
            step === 1
              ? "Информация о клиенте"
              : step === 2
              ? "Доставка"
              : "Оплата"
          }}
        </div>
      </div>
    </div>

    <!-- Main Checkout Form -->
    <form
      id="checkout-form"
      @submit.prevent="handleSubmit"
      class="checkout-form"
    >
      <!-- Step 1: Customer Information -->
      <div v-show="currentStep === 1" class="checkout-section">
        <h2>Информация о клиенте</h2>

        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Имя*</label>
            <input
              id="firstName"
              v-model="customerInfo.firstName"
              type="text"
              :class="{ error: !customerInfo.firstName }"
            />
            <div v-if="!customerInfo?.firstName" class="error-message">
              Заполните имя
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Фамилия</label>
            <input
              id="lastName"
              v-model="customerInfo.lastName"
              type="text"
              :class="{ error: !customerInfo.lastName }"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="customerInfo.email"
              type="email"
              :class="{ error: '' }"
            />
            <div v-if="!customerInfo?.email" class="error-message"></div>
          </div>

          <div class="form-group">
            <label for="phone">Номер телефона*</label>
            <input
              id="phone"
              v-model="customerInfo.phone"
              type="tel"
              :class="{ error: !customerInfo.phone }"
            />
            <div v-if="!customerInfo?.phone" class="error-message">
              Заполните номер телефона
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn-secondary"
            @click="$router.push('/products')"
          >
            Назад к покупкам
          </button>
          <button type="button" class="btn-primary" @click="goToStep(2)">
            Перейти к доставке
          </button>
        </div>
      </div>

      <!-- Step 2: Доставка Information -->
      <div v-show="currentStep === 2" class="checkout-section">
        <h2>Доставка</h2>

        <div class="form-group">
          <label for="addressLine1">Адрес*</label>
          <input
            id="addressLine1"
            v-model="shippingAddress.addressLine1"
            type="text"
            :class="{ error: !shippingAddress?.addressLine1 }"
          />
          <div v-if="!shippingAddress?.addressLine1" class="error-message">
            Заполните адрес
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city">Город*</label>
            <input
              id="city"
              v-model="shippingAddress.city"
              type="text"
              :class="{ error: !shippingAddress?.city }"
            />
            <div v-if="!shippingAddress?.city" class="error-message">
              Заполните город
            </div>
          </div>
        </div>

        <div class="shipping-options">
          <h3>Способ доставки</h3>
          <div
            v-for="option in shippingOptions"
            :key="option.id"
            class="shipping-option"
            :class="{ selected: selectedShipping === option.id }"
            @click="selectedShipping = option.id"
          >
            <div class="option-radio">
              <input
                type="radio"
                :id="option.id"
                :value="option.id"
                v-model="selectedShipping"
              />
              <label :for="option.id">{{ option.name }}</label>
            </div>
            <div class="option-cost">{{ formatCurrency(option.cost) }}</div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="goToStep(1)">
            Назад к Информации о клиенте
          </button>
          <button type="button" class="btn-primary" @click="goToStep(3)">
            Перейти к Оплате
          </button>
        </div>
      </div>

      <!-- Step 3: Оплата -->
      <div v-show="currentStep === 3" class="checkout-section">
        <h2>Методы оплаты</h2>

        <div class="payment-methods">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="payment-method"
            :class="{ selected: paymentMethod === method.id }"
            @click="paymentMethod = method.id"
          >
            <input
              type="radio"
              :id="method.id"
              :value="method.id"
              v-model="paymentMethod"
            />
            <label :for="method.id">
              <img v-if="method.icon" :src="method.icon" :alt="method.name" />
              {{ method.name }}
            </label>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h3>Детали заказа</h3>
          <div class="summary-item">
            <span>Промежуточный итог</span>
            <span>{{ formatCurrency(calculateSubtotal()) }}</span>
          </div>
          <div class="summary-item">
            <span>Доставка</span>
            <span>{{ formatCurrency(shippingCost) }}</span>
          </div>
          <div class="summary-item">
            <span>НДС</span>
            <span>{{ formatCurrency(calculateTax()) }}</span>
          </div>
          <div class="summary-item total">
            <span>Итого</span>
            <span>{{ formatCurrency(calculateTotal()) }}</span>
          </div>
        </div>

        <!-- Submit Error Message -->
        <div v-if="submitError" id="submit-error" class="submit-error">
          {{ submitError }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="goToStep(2)">
            Назад к Доставке
          </button>
          <button
            type="submit"
            class="btn-primary btn-place-order"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Обрабатывается...</span>
            <span v-else>Заказать</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<!-- <script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cartStore";
import { useVuelidate } from "@vuelidate/core";
import { required, email, helpers, minLength } from "@vuelidate/validators";
import type { CartItem } from "~/stores/cartStore";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "order-complete"]);
const cartStore = useCartStore();

// Multi-step form
const steps = [
  "Обзор корзины",
  "Информация о клиенте",
  "Доставка",
  "Оплата",
  "Подтверждение",
];

// Form data
const customerInfo = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
});

const shippingAddress = ref({
  addressLine1: "",
  city: "",
});

const paymentMethod = ref("cash");
const paymentDetails = ref({
  phoneNumber: "",
});

// Validation rules
const rules = computed(() => {
  const baseRules = {
    customerInfo: {
      firstName: {
        required: helpers.withMessage("Имя обязательно", required),
      },
      phone: {
        required: helpers.withMessage("Номер телефона обязателен", required),
      },
    },
    shippingAddress: {
      addressLine1: {
        required: helpers.withMessage("Адрес обязателен", required),
      },
      city: { required: helpers.withMessage("Город обязателен", required) },
    },
  };
});

// Form validation with VeeValidate
const v$ = useVuelidate(rules, {
  customerInfo,
  shippingAddress,
  paymentDetails,
});
// Router instance
const router = useRouter();

// Handle form submission
const isSubmitting = ref(false);
const submitError = ref("");

const handleSubmit = async () => {
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) {
    // Scroll to first error
    const firstError = document.querySelector(".error-message");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  isSubmitting.value = true;
  submitError.value = "";

  try {
    // Find the selected payment method object
    const selectedPaymentMethod = paymentMethods.value.find(
      (method) => method.id === paymentMethod.value
    );

    const currentselectedShipping = shippingOptions.value.find(
      (method) => method.id === selectedShipping.value
    );

    // Prepare checkout data
    const checkoutData = {
      orderNumber: `ЗАКАЗ-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString("ru-RU", {
        timeZone: "Asia/Dushanbe",
      }),
      status: "Подтвержден",
      customer: customerInfo.value,
      shippingAddress: shippingAddress.value,
      items: cartStore.items.map((item: CartItem) => ({
        id: item.product.Id,
        name: item.product.ProductName,
        quantity: item.quantity,
        price: item.product.Price,
      })),
      paymentMethod: selectedPaymentMethod?.name || "",
      paymentDetails: paymentDetails.value,
      shippingMethod: currentselectedShipping?.name || "",
      shippingCost: shippingCost.value,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
    };

    // Save checkout data to localStorage
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    // Send order data to Telegram
    await sendOrderToTelegram(checkoutData);

    router.push({
      name: "orderconfirmation",
    });
    // Handle successful order
    cartStore.clearCart();
  } catch (error) {
    console.error("Отправка заказа не удалась:", error);
    submitError.value =
      "Возникла проблема с обработкой вашего заказа. Попробуйте еще раз.";
    // Scroll to error message
    nextTick(() => {
      const errorEl = document.getElementById("submit-error");
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Show different sections based on checkout step
const currentStep = ref(1);
const totalSteps = 3;

const goToStep = (step: number) => {
  // Validate current step before proceeding
  if (step > currentStep.value) {
    if (currentStep.value === 1) {
      v$.value.customerInfo?.$touch();
      if (v$.value.customerInfo?.$error) return;
    } else if (currentStep.value === 2) {
      v$.value.shippingAddress?.$touch();
      if (v$.value.shippingAddress?.$error) return;
    }
  }
  currentStep.value = step;
  // Scroll to top of form
  nextTick(() => {
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
};

// Order summary calculations
const calculateSubtotal = () => {
  return cartStore.items.reduce(
    (total, item) => total + item.product.Price * item.quantity,
    0
  );
};

const calculateTax = () => {
  // Example tax calculation (could be made more complex based on location)
  const taxRate = 0.18; // 18%
  return calculateSubtotal() * taxRate;
};

const calculateTotal = () => {
  return calculateSubtotal() + calculateTax() + shippingCost.value;
};

// Типы доставки
const shippingOptions = ref([
  { id: "standard", name: "Стандартная доставка (1–2 рабочих дней)", cost: 10 },
  { id: "express", name: "Экспресс-доставка (в течении дня)", cost: 20 },
  { id: "immediate", name: "Срочная доставка (сразу после заказа)", cost: 50 },
  { id: "pickup", name: "Самовывоз", cost: 0 },
]);

// Методы оплаты
const paymentMethods = ref([
  { id: "cash", name: "Наличными", icon: null },
  { id: "ewallet", name: "Электронный кошелек(ДС, Алиф, Эсхата)", icon: null },
]);

const selectedShipping = ref("standard");
const shippingCost = computed(() => {
  const option = shippingOptions.value.find(
    (option) => option.id === selectedShipping.value
  );
  return option ? option.cost : 0;
});

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tg-TJ", {
    style: "currency",
    currency: "TJS",
    currencyDisplay: "name",
  })
    .format(amount)
    .replace("Tajikistani somonis", "сомонӣ");
};

interface OrderData {
  orderNumber: string;
  date: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    addressLine1: string;
    city: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  paymentDetails: {
    phoneNumber: string;
  };
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  total: number;
}

const sendOrderToTelegram = async (orderData: OrderData) => {
  const botToken = import.meta.env.VITE_BOT_TOKEN; //"7845700712:AAGupQg3jBQc9a_RgBprzLXUvQN-TaxA9MY"; //process.env.BOT_TOKEN;
  const chatId = import.meta.env.VITE_CHAT_ID; //"529229728"; //process.env.CHAT_ID;

  const message = `
    🛒 <b>Новый заказ</b> 🛒
    <b>Номер заказа:</b> ${orderData.orderNumber || "N/A"}
    <b>Дата:</b> ${orderData.date || ""}
    <b>Статус:</b> ${orderData.status || "Подтвержден"}
    <b>Клиент:</b> ${orderData.customer.firstName || ""} ${
    orderData.customer.lastName || ""
  }
    <b>Email:</b> ${orderData.customer.email || "N/A"}
    <b>Телефон:</b> ${orderData.customer.phone || "N/A"}
    <b>Адрес доставки:</b> ${orderData.shippingAddress.addressLine1 || ""}, ${
    orderData.shippingAddress.city || ""
  }
    <b>Метод оплаты:</b> ${orderData.paymentMethod || "N/A"}
    <b>Метод доставки:</b> ${orderData.shippingMethod || "N/A"}
    <b>Промежуточный итог:</b> ${formatCurrency(orderData.subtotal || 0)}
    <b>Доставка:</b> ${formatCurrency(orderData.shippingCost || 0)}
    <b>НДС:</b> ${formatCurrency(orderData.tax || 0)}
    <b>Итого:</b> ${formatCurrency(orderData.total || 0)}
    <b>Товары:</b>
    ${orderData.items
      .map(
        (item) =>
          `- ${item.name} (x${item.quantity}): ${formatCurrency(
            item.price * item.quantity
          )}`
      )
      .join("\n")}
    `;

  try {
    const response = await fetch(
      `http://localhost:3005/api/telegram/bot${botToken}/sendMessage`,

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send message to Telegram");
    }

    console.log("Order sent to Telegram successfully!");
  } catch (error) {
    console.error("Error sending order to Telegram:", error);
  }
};

// Check if cart is empty and redirect if needed
onMounted(() => {
  if (cartStore.items.length === 0) {
    router.push({ name: "products" });
  }
});
</script> -->

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cartStore";
import type { CartItem } from "~/stores/cartStore";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "order-complete"]);
const cartStore = useCartStore();

// Multi-step form
const steps = [
  "Обзор корзины",
  "Информация о клиенте",
  "Доставка",
  "Оплата",
  "Подтверждение",
];

// Form data
const customerInfo = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  errors: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
});

const shippingAddress = reactive({
  addressLine1: "",
  city: "",
  errors: {
    addressLine1: "",
    city: "",
  },
});

const paymentMethod = ref("cash");
const paymentDetails = reactive({
  phoneNumber: "",
  errors: {
    phoneNumber: "",
  },
});

// Custom validation
const validateCustomerInfo = () => {
  let isValid = true;

  // Reset errors
  customerInfo.errors.firstName = "";
  customerInfo.errors.phone = "";

  // Validate required fields
  if (!customerInfo.firstName.trim()) {
    customerInfo.errors.firstName = "Имя обязательно";
    isValid = false;
  }

  if (!customerInfo.phone.trim()) {
    customerInfo.errors.phone = "Номер телефона обязателен";
    isValid = false;
  }

  // Optional: Add email validation if needed
  if (customerInfo.email && !validateEmail(customerInfo.email)) {
    customerInfo.errors.email = "Неверный формат email";
    isValid = false;
  }

  return isValid;
};

const validateShippingAddress = () => {
  let isValid = true;

  // Reset errors
  shippingAddress.errors.addressLine1 = "";
  shippingAddress.errors.city = "";

  if (!shippingAddress.addressLine1.trim()) {
    shippingAddress.errors.addressLine1 = "Адрес обязателен";
    isValid = false;
  }

  if (!shippingAddress.city.trim()) {
    shippingAddress.errors.city = "Город обязателен";
    isValid = false;
  }

  return isValid;
};

// Helper function to validate email format
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Router instance
const router = useRouter();

// Handle form submission
const isSubmitting = ref(false);
const submitError = ref("");

const handleSubmit = async () => {
  // Validate all form sections
  const isCustomerInfoValid = validateCustomerInfo();
  const isShippingAddressValid = validateShippingAddress();

  if (!isCustomerInfoValid || !isShippingAddressValid) {
    // Scroll to first error
    const firstError = document.querySelector(".error-message");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  isSubmitting.value = true;
  submitError.value = "";

  try {
    // Find the selected payment method object
    const selectedPaymentMethod = paymentMethods.value.find(
      (method) => method.id === paymentMethod.value
    );

    const currentselectedShipping = shippingOptions.value.find(
      (method) => method.id === selectedShipping.value
    );

    // Prepare checkout data
    const checkoutData = {
      orderNumber: `ЗАКАЗ-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString("ru-RU", {
        timeZone: "Asia/Dushanbe",
      }),
      status: "Подтвержден",
      customer: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
      shippingAddress: {
        addressLine1: shippingAddress.addressLine1,
        city: shippingAddress.city,
      },
      items: cartStore.items.map((item: CartItem) => ({
        id: item.product.Id,
        name: item.product.ProductName,
        quantity: item.quantity,
        price: item.product.Price,
      })),
      paymentMethod: selectedPaymentMethod?.name || "",
      paymentDetails: {
        phoneNumber: paymentDetails.phoneNumber,
      },
      shippingMethod: currentselectedShipping?.name || "",
      shippingCost: shippingCost.value,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
    };

    // Save checkout data to localStorage
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    // Send order data to Telegram
    await sendOrderToTelegram(checkoutData);

    router.push({
      name: "orderconfirmation",
    });
    // Handle successful order
    cartStore.clearCart();
  } catch (error) {
    console.error("Отправка заказа не удалась:", error);
    submitError.value =
      "Возникла проблема с обработкой вашего заказа. Попробуйте еще раз.";
    // Scroll to error message
    nextTick(() => {
      const errorEl = document.getElementById("submit-error");
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Show different sections based on checkout step
const currentStep = ref(1);
const totalSteps = 3;

const goToStep = (step: number) => {
  // Validate current step before proceeding
  if (step > currentStep.value) {
    if (currentStep.value === 1) {
      if (!validateCustomerInfo()) return;
    } else if (currentStep.value === 2) {
      if (!validateShippingAddress()) return;
    }
  }
  currentStep.value = step;
  // Scroll to top of form
  nextTick(() => {
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
};

// Order summary calculations
const calculateSubtotal = () => {
  return cartStore.items.reduce(
    (total, item) => total + item.product.Price * item.quantity,
    0
  );
};

const calculateTax = () => {
  // Example tax calculation (could be made more complex based on location)
  const taxRate = 0.18; // 18%
  return calculateSubtotal() * taxRate;
};

const calculateTotal = () => {
  return calculateSubtotal() + calculateTax() + shippingCost.value;
};

// Типы доставки
const shippingOptions = ref([
  { id: "standard", name: "Стандартная доставка (1–2 рабочих дней)", cost: 10 },
  { id: "express", name: "Экспресс-доставка (в течении дня)", cost: 20 },
  { id: "immediate", name: "Срочная доставка (сразу после заказа)", cost: 50 },
  { id: "pickup", name: "Самовывоз", cost: 0 },
]);

// Методы оплаты
const paymentMethods = ref([
  { id: "cash", name: "Наличными", icon: null },
  { id: "ewallet", name: "Электронный кошелек(ДС, Алиф, Эсхата)", icon: null },
]);

const selectedShipping = ref("standard");
const shippingCost = computed(() => {
  const option = shippingOptions.value.find(
    (option) => option.id === selectedShipping.value
  );
  return option ? option.cost : 0;
});

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tg-TJ", {
    style: "currency",
    currency: "TJS",
    currencyDisplay: "name",
  })
    .format(amount)
    .replace("Tajikistani somonis", "сомонӣ");
};

interface OrderData {
  orderNumber: string;
  date: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    addressLine1: string;
    city: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  paymentDetails: {
    phoneNumber: string;
  };
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  total: number;
}

const sendOrderToTelegram = async (orderData: OrderData) => {
  const botToken = import.meta.env.VITE_BOT_TOKEN;
  const chatId = import.meta.env.VITE_CHAT_ID;

  const message = `
    🛒 <b>Новый заказ</b> 🛒
    <b>Номер заказа:</b> ${orderData.orderNumber || "N/A"}
    <b>Дата:</b> ${orderData.date || ""}
    <b>Статус:</b> ${orderData.status || "Подтвержден"}
    <b>Клиент:</b> ${orderData.customer.firstName || ""} ${
    orderData.customer.lastName || ""
  }
    <b>Email:</b> ${orderData.customer.email || "N/A"}
    <b>Телефон:</b> ${orderData.customer.phone || "N/A"}
    <b>Адрес доставки:</b> ${orderData.shippingAddress.addressLine1 || ""}, ${
    orderData.shippingAddress.city || ""
  }
    <b>Метод оплаты:</b> ${orderData.paymentMethod || "N/A"}
    <b>Метод доставки:</b> ${orderData.shippingMethod || "N/A"}
    <b>Промежуточный итог:</b> ${formatCurrency(orderData.subtotal || 0)}
    <b>Доставка:</b> ${formatCurrency(orderData.shippingCost || 0)}
    <b>НДС:</b> ${formatCurrency(orderData.tax || 0)}
    <b>Итого:</b> ${formatCurrency(orderData.total || 0)}
    <b>Товары:</b>
    ${orderData.items
      .map(
        (item) =>
          `- ${item.name} (x${item.quantity}): ${formatCurrency(
            item.price * item.quantity
          )}`
      )
      .join("\n")}
    `;

  try {
    const response = await fetch(
      `http://localhost:3005/api/telegram/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send message to Telegram");
    }

    console.log("Order sent to Telegram successfully!");
  } catch (error) {
    console.error("Error sending order to Telegram:", error);
  }
};

// Check if cart is empty and redirect if needed
onMounted(() => {
  if (cartStore.items.length === 0) {
    router.push({ name: "products" });
  }
});
</script>

<style scoped>
.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.checkout-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;
}

.checkout-progress::before {
  content: "";
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 1;
}

.progress-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  cursor: default;
}

.progress-step.completed {
  cursor: pointer;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
}

.progress-step.completed .step-number {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  color: #666;
}

.progress-step.active .step-label {
  color: #333;
  font-weight: bold;
}

.checkout-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.checkout-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus,
select:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

input.error,
select.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.shipping-options,
.payment-methods {
  margin-bottom: 2rem;
}

.shipping-option,
.payment-method {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shipping-option:hover,
.payment-method:hover {
  background-color: #f5f5f5;
}

.shipping-option.selected,
.payment-method.selected {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.05);
}

.option-radio,
.payment-method label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%; /* Adjust this value as needed */
  max-width: 600px; /* Set a maximum width if desired */
  justify-content: flex-start; /* Align items to the left */
  line-height: 3; /* Adjust line height for vertical spacing */
}

.option-radio input[type="radio"],
.payment-method input[type="radio"] {
  /* Ensure the radio button size remains consistent */
  width: auto; /* Reset width to auto */
  height: auto; /* Reset height to auto */
  margin-top: -10px;
}

.option-cost {
  font-weight: bold;
}

.payment-method img {
  height: 24px;
  margin-right: 8px;
}

.credit-card-details {
  margin-bottom: 2rem;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group.checkbox input {
  width: auto;
}

.order-summary {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f0f0f0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-item.total {
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
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

.btn-primary:disabled {
  background-color: #cccccc;
  border-color: #cccccc;
  cursor: not-allowed;
}

.btn-place-order {
  min-width: 150px;
}

.submit-error {
  background-color: #ffebee;
  color: #f44336;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .checkout-progress {
    overflow-x: auto;
    padding-bottom: 1rem;
  }

  .progress-step {
    min-width: 100px;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
