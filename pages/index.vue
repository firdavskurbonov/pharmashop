<template>
  <div class="container mx-auto px-4 py-8">
    <header class="mb-10 text-center">
      <h1 class="text-3xl font-bold text-blue-700 mb-4">
        Аптечный интернет магазин
      </h1>
      <p class="text-lg text-gray-600">
        Ваш надежный источник качественной фармацевтической продукции
      </p>
    </header>

    <section class="mb-12 bg-blue-50 p-6 rounded-lg shadow">
      <h2 class="text-2xl font-semibold mb-4">
        Добро пожаловать в наш интернет-магазин аптек
      </h2>
      <p class="mb-4">
        В Санта-Русь мы предоставляем полный перечень фармацевтических продуктов
        для удовлетворения ваших медицинских потребностей. Наша онлайн-платформа
        предлагает легкий доступ к лекарствам, добавкам и медицинским
        принадлежностям с наличием на складе в режиме реального времени.
      </p>
      <p>
        Мы гордимся тем, что поддерживаем строгие стандарты контроля качества и
        гарантируем, что все продукты правильно хранятся и обрабатываются в
        соответствии с фармацевтическими рекомендациями. Наша команда
        лицензированных фармацевтов всегда готова помочь вам с любыми вопросами
        о наших продуктах.
      </p>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 text-blue-600">
          Обширный ассортимент препаратов
        </h3>
        <p>
          Ознакомьтесь с нашим широким выбором рецептурных препаратов,
          безрецептурных препаратов и товаров медицинского назначения.
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 text-blue-600">
          Обновления акций в режиме реального времени
        </h3>
        <p>
          Мгновенно проверяйте наличие товара с помощью нашей передовой системы
          управления запасами.
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-3 text-blue-600">
          Профессиональная поддержка
        </h3>
        <p>
          Получите экспертную консультацию от нашей команды лицензированных
          фармацевтов по всем вашим вопросам, касающимся лекарств.
        </p>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-2xl font-semibold mb-4">Рекомендуемые продукты</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="product in products"
          :key="product.name"
          class="bg-white p-4 rounded shadow"
        >
          <img
            :src="product.image"
            alt="Product Image"
            class="h-40 w-full object-cover mb-3 rounded"
          />
          <h3 class="font-medium">{{ product.name }}</h3>
          <p class="text-gray-600 text-sm mb-2">{{ product.category }}</p>
          <div class="flex justify-between items-center">
            <span class="font-bold">{{ product.price }}</span>
            <span
              :class="
                product.stock === 'В наличии'
                  ? 'text-green-600 text-sm'
                  : 'text-red-600 text-sm'
              "
            >
              {{ product.stock }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-blue-100 p-6 rounded-lg shadow">
      <h2 class="text-2xl font-semibold mb-4">Наши контакты</h2>
      <p class="mb-2">
        У вас есть вопросы по нашему ассортименту или нужна помощь с продуктом?
      </p>
      <router-link to="/contact">
        <button
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Свяжитесь с нашей командой
        </button>
      </router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Define the products data
const products = ref([
  {
    name: "Анальгин",
    category: "Обезболивающие",
    price: "19 сомонӣ",
    stock: "В наличии",
    image:
      "https://samson-pharma.ru/_next/image/?url=https%3A%2F%2Fsamson-pharma.ru%2Fer-pics%2Fimages%2Fgoods%2F187027%2Fmain&w=732&q=75",
  },
  {
    name: "Витамин C",
    category: "Витамины",
    price: "29 сомонӣ",
    stock: "В наличии",
    image:
      "https://optisalt.su/_next/image/?url=https%3A%2F%2Fmedia.optisalt.com%2Fproducts%2F9_6_250394e171.png&w=750&q=75",
  },
  {
    name: "Аспирин",
    category: "Жаропонижающие",
    price: "20 сомонӣ",
    stock: "В наличии",
    image:
      "https://root.cdntbl.com/img/goods/7d4f0897-ec2c-4139-9096-16c8a8ed113d/1/img_0.jpg?v=AAAAAArDnKk",
  },
  {
    name: "Омепразол",
    category: "Желудочные",
    price: "9 сомонӣ",
    stock: "В наличии",
    image:
      "https://superapteka.ru/_next/image/?url=https%3A%2F%2Fsuperapteka.ru%2Fer-pics%2Fimages%2Fgoods%2F396702%2Fmain&w=768&q=75",
  },
]);
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
</style>
