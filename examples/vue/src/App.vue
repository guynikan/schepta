<template>
  <div style="padding: 24px; max-width: 800px; margin: 0 auto">
    <h1>Spectra Vue Example</h1>
    
    <div style="margin-bottom: 24px">
      <router-link 
        to="/"
        style="margin-right: 8px; padding: 8px 16px; text-decoration: none; border: 1px solid #ccc; border-radius: 4px; display: inline-block"
      >
        Simple Form
      </router-link>
      <router-link 
        to="/complex"
        style="padding: 8px 16px; text-decoration: none; border: 1px solid #ccc; border-radius: 4px; display: inline-block"
      >
        Complex Form
      </router-link>
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

