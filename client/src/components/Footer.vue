<template>
  <div
    class="w-full border-b-[1rem] border-primary-500 bg-primary-700 px-4 md:px-8 lg:px-16"
  >
    <div class="w-full mx-auto max-w-[1920px]">
      <div
        class="flex flex-col py-4 lg:py-8 gap-8 lg:flex-row lg:justify-between"
      >
        <div class="flex flex-col items-center">
          <img src="/HH_white.svg" alt="Heritage Hub logo" class="w-20" />
          <span class="title text-grayscale-100 mt-2">Heritage Hub</span>
          <span class="font-poppins text-sm text-grayscale-200 mt-4"
            >&copy; {{ new Date().getFullYear() }} |
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/"
              target="_blank"
              referrerpolicy="no-referrer"
              class="cursor-pointer hover:underline"
              >CC BY-NC 4.0</a
            ></span
          >
        </div>
        <div
          class="flex flex-col md:flex-row justify-between text-grayscale-100 gap-12 lg:gap-48 xl:gap-64"
        >
          <div class="md:max-w-64">
            <h1 class="subtitle">Navigate</h1>
            <ul class="flex flex-col gap-2 mt-3">
              <li class="cursor-pointer hover:underline">
                <RouterLink to="/">Home</RouterLink>
              </li>
              <li class="cursor-pointer hover:underline">
                <RouterLink to="/about">About</RouterLink>
              </li>
              <li class="cursor-pointer hover:underline">
                <RouterLink to="/">Explore</RouterLink>
              </li>
            </ul>
          </div>
          <div class="md:max-w-64">
            <h1 class="subtitle">Actions</h1>
            <ul class="flex flex-col gap-2 mt-3">
              <li class="cursor-pointer hover:underline">
                <RouterLink to="/upload">Upload</RouterLink>
              </li>
              <li class="cursor-pointer hover:underline">
                <RouterLink to="/search">Search</RouterLink>
              </li>
            </ul>
          </div>
          <div class="md:max-w-64">
            <h1 class="subtitle">Resources</h1>
            <ul class="flex flex-col gap-2 mt-3">
              <li class="cursor-pointer hover:underline text-pretty">
                <a
                  href="https://www.sfu.ca/archaeology/museum.html"
                  target="_blank"
                  referrerpolicy="no-referrer"
                >
                  Museum of Archaeology & Ethnology
                </a>
              </li>
              <li class="cursor-pointer hover:underline text-pretty">
                <a
                  href="https://www.sfu.ca/ipinch/"
                  target="_blank"
                  referrerpolicy="no-referrer"
                >
                  Intellectual Property Issues in Cultural Heritage
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
