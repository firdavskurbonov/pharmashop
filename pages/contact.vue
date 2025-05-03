<template>
  <div class="container mx-auto px-4 py-8">
    <header class="mb-10 text-center">
      <h1 class="text-3xl font-bold text-blue-700 mb-4">Свяжитесь с нами</h1>
      <p class="text-lg text-gray-600">
        Мы готовы ответить на ваши вопросы и помочь с любыми запросами
      </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <!-- Contact Form Section -->
      <section class="bg-blue-50 p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-6">Отправить сообщение</h2>

        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label for="name" class="block text-gray-700 mb-2">Имя</label>
            <input
              type="text"
              id="name"
              v-model="form.name"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ваше имя"
              required
            />
          </div>

          <div class="mb-4">
            <label for="email" class="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ваш@email.com"
              required
            />
          </div>

          <div class="mb-4">
            <label for="phone" class="block text-gray-700 mb-2">Телефон</label>
            <input
              type="tel"
              id="phone"
              v-model="form.phone"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+7 (XXX) XXX-XX-XX"
            />
          </div>

          <div class="mb-4">
            <label for="subject" class="block text-gray-700 mb-2">Тема</label>
            <select
              id="subject"
              v-model="form.subject"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled selected>Выберите тему запроса</option>
              <option value="order">Вопросы по заказу</option>
              <option value="product">Информация о продукте</option>
              <option value="shipping">Доставка</option>
              <option value="returns">Возврат</option>
              <option value="other">Другое</option>
            </select>
          </div>

          <div class="mb-6">
            <label for="message" class="block text-gray-700 mb-2"
              >Сообщение</label
            >
            <textarea
              id="message"
              v-model="form.message"
              rows="5"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Опишите ваш вопрос или запрос подробно..."
              required
            ></textarea>
          </div>

          <button
            type="submit"
            class="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition w-full md:w-auto"
          >
            Отправить сообщение
          </button>
        </form>
      </section>

      <!-- Contact Information Section -->
      <section>
        <div class="bg-white p-6 rounded-lg shadow mb-6">
          <h2 class="text-2xl font-semibold mb-4">Контактная информация</h2>

          <div class="space-y-4">
            <div class="flex items-start">
              <div class="text-blue-600 mr-3 mt-1">
                <!-- Location icon placeholder -->
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-medium">Адрес</h3>
                <address class="not-italic text-gray-600">
                  ул. Бехзод, 16<br />
                  Душанбе, Таджикистан<br />
                </address>
              </div>
            </div>

            <div class="flex items-start">
              <div class="text-blue-600 mr-3 mt-1">
                <!-- Phone icon placeholder -->
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-medium">Телефон</h3>
                <p class="text-gray-600">
                  <a href="tel:+74951234567" class="hover:text-blue-600"
                    >+992 (93) 123-45-67</a
                  >
                </p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="text-blue-600 mr-3 mt-1">
                <!-- Email icon placeholder -->
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-medium">Email</h3>
                <p class="text-gray-600">
                  <a href="mailto:info@santa-rus.ru" class="hover:text-blue-600"
                    >info@santa-rus.tj</a
                  >
                </p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="text-blue-600 mr-3 mt-1">
                <!-- Clock icon placeholder -->
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-medium">Часы работы</h3>
                <p class="text-gray-600">
                  Пн-Пт: 9:00 - 20:00<br />
                  Сб: 10:00 - 18:00<br />
                  Вс: Выходной
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Section -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Как нас найти</h2>
          <div class="h-64 bg-gray-200 rounded mb-4">
            <!-- Map placeholder -->
            <!-- In a real app, you would integrate a map service like Yandex Maps or Google Maps here -->
            <div class="h-full flex items-center justify-center">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d621.4193099334221!2d68.79822528907323!3d38.57113516286919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1zLA!5e0!3m2!1sen!2s!4v1745825063416!5m2!1sen!2s"
                width="600"
                height="450"
                style="border: 0"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
          <p class="text-gray-600 text-sm">
            Мы находимся в центре города, в 5 минутах ходьбы от Ашана.
          </p>
        </div>
      </section>
    </div>

    <!-- FAQ Section -->
    <section class="mt-12 bg-blue-50 p-6 rounded-lg shadow">
      <h2 class="text-2xl font-semibold mb-6">Часто задаваемые вопросы</h2>

      <div class="space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="border-b border-gray-200 pb-4"
        >
          <h3 class="font-medium text-lg text-blue-700 mb-2">
            {{ faq.question }}
          </h3>
          <p class="text-gray-600">{{ faq.answer }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const form = ref({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
});

const faqs = ref([
  {
    question: "Как я могу узнать о наличии определенного лекарства?",
    answer:
      'Вы можете проверить наличие лекарств на нашем сайте в разделе "Каталог" или связаться с нами по телефону для получения актуальной информации.',
  },
  {
    question: "Как долго обрабатывается заказ?",
    answer:
      "Обычно мы обрабатываем заказы в течение 1-2 рабочих дней. После подтверждения заказа мы свяжемся с вами для уточнения деталей доставки.",
  },
  {
    question: "Предоставляете ли вы консультации фармацевта?",
    answer:
      "Да, наши квалифицированные фармацевты готовы предоставить консультацию по подбору лекарств и ответить на ваши вопросы. Вы можете связаться с нами по телефону или электронной почте.",
  },
  {
    question: "Как осуществляется доставка?",
    answer:
      "Мы предлагаем доставку курьером по городу, а также отправку по всем регионам Таджикистана. Сроки и стоимость доставки зависят от вашего местоположения.",
  },
]);

const submitForm = () => {
  // In a real application, you would send the form data to your backend
  alert("Форма отправлена!");
  // Reset form after submission
  form.value = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  };
};
</script>
