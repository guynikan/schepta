<template>
  <v-app>
    <v-container class="py-8" style="max-width: 800px">
      <h1 class="text-h3 mb-6">Spectra - Vue Vuetify Example</h1>
      
      <v-btn-toggle class="mb-6">
        <v-btn to="/" variant="outlined">Simple Form</v-btn>
        <v-btn to="/complex" variant="outlined">Complex Form</v-btn>
      </v-btn-toggle>

      <router-view />
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
</script>

