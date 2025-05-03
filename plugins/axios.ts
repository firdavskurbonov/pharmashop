// plugins/axios.ts
import axios from 'axios';
import { defineNuxtPlugin } from 'nuxt/app';

import type { NuxtApp } from 'nuxt/app';

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '', 
  });

  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      console.log('Request:', config);

      // Add Accept-Encoding header
      if (config.headers) {
        config.headers['Accept'] = '*/*';
        config.headers['Content-Type'] = 'application/json'
      }

      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log('Response:', response);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error('Response error:', error.response);
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else {
        console.error('Network error:', error.message);
      }
      return Promise.reject(error);
    }
  );
  nuxtApp.provide('axios', axiosInstance);
});