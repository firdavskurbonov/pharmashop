<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold mr-6">Санта-Русь</h1>
            <div class="hidden sm:flex sm:space-x-8">
              <NuxtLink
                to="/"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >Главная</NuxtLink
              >
              <NuxtLink
                to="/products"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Каталог
              </NuxtLink>
              <NuxtLink
                to="/contact"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Наши контакты
              </NuxtLink>
            </div>
          </div>
          <div class="sm:hidden">
            <button
              @click="toggleMenu"
              class="text-gray-500 focus:outline-none"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
        <div :class="{ block: isOpen, hidden: !isOpen }" class="sm:hidden">
          <div class="flex flex-col space-y-2 mt-2">
            <NuxtLink
              to="/"
              class="text-gray-500 hover:text-gray-700 block px-2 py-1"
              >Главная</NuxtLink
            >
            <NuxtLink
              to="/products"
              class="text-gray-500 hover:text-gray-700 block px-2 py-1"
              >Каталог</NuxtLink
            >
            <NuxtLink
              to="/contact"
              class="text-gray-500 hover:text-gray-700 block px-2 py-1"
              >Наши контакты</NuxtLink
            >
          </div>
        </div>
      </div>
    </nav>

    <div class="py-10">
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>
