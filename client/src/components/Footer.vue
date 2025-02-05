<template>
  <div
    class="flex flex-col p-4 lg:p-8 gap-8 md:px-8 lg:px-16 lg:flex-row lg:justify-between border-b-[1rem] border-primary-500 bg-primary-700">
    <div class="flex flex-col items-center">
      <img src="/HH_white.svg" alt="Heritage Hub logo" class="w-20" />
      <span class="title text-grayscale-100">Heritage Hub</span>
    </div>
    <div class="flex justify-between text-grayscale-100 lg:gap-48 xl:gap-64">
      <div class="max-w-32">
        <h1 class="subtitle">Navigate</h1>
        <ul class="flex flex-col gap-2 mt-3 underline">
          <li>Home</li>
          <li>About</li>
          <li>Explore</li>
        </ul>
      </div>
      <div class="max-w-32">
        <h1 class="subtitle">Actions</h1>
        <ul class="flex flex-col gap-2 mt-3 underline">
          <li>Upload</li>
          <li>Search</li>
        </ul>
      </div>
      <div class="max-w-32">
        <h1 class="subtitle">Resources</h1>
        <ul class="flex flex-col gap-2 mt-3 underline">
          <li class="text-pretty">Museum of Archaeology & Ethnology</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
