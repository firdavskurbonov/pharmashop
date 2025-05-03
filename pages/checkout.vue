<template>
  <div>
    <Checkout :isOpen="true" @close="handleClose" />
  </div>
</template>

<script setup lang="ts">
import Checkout from "../components/Checkout.vue";

const handleClose = () => {
  // Handle the close action
  console.log("Checkout closed");
};
</script>

<style scoped>
/* Add your styles here if needed */
</style>
