<template>
  <div class="mt-4 md:mt-8">
    <div class="grid">
      <div
        class="col-start-1 row-start-1 w-3/5 md:w-1/2 shadow-md justify-self-start self-start z-0"
      >
        <img src="/images/buckle1.webp" class="w-full" />
      </div>
      <div
        class="col-start-1 row-start-1 w-4/9 shadow-md justify-self-start self-start translate-x-full translate-y-20 z-10"
      >
        <img src="/images/buckle2.webp" class="w-full" />
      </div>
      <div
        class="col-start-1 row-start-1 aspect-square w-1/3 lg:w-1/4 shadow-md justify-self-end self-start z-20"
      >
        <AboutVisualizer model="buckle" />
      </div>
    </div>
    <div class="font-poppins my-4 md:my-8 lg:my-16">
      <h2 class="text-primary-500 font-semibold pb-2 pt-10">
        What is Heritage?
      </h2>
      <p class="text-2xl font-bold text-grayscale-800">
        Heritage refers to aspects of human culture that are valued and passed
        down through generations.
      </p>
      <div
        class="flex flex-col gap-4 md:flex-row md:gap-8 lg:gap-16 mt-4 md:mt-8 text-base md:text-lg"
      >
        <div class="bg-white shadow-md w-full px-4 lg:px-8 py-2 lg:py-4">
          <div class="w-full flex items-center gap-2 md:gap-4">
            <Icon
              icon="mdi:hand-extended-outline"
              class="text-primary-500"
              width="80"
            />
            <div class="flex flex-col w-full gap-2">
              <h3 class="text-lg font-semibold text-primary-500">
                Tangible Heritage
              </h3>
              <p class="font-garamond">
                Tangible heritage has a physical form, including naturally
                occurring landscapes and manufactured forms such as artifacts*.
              </p>
              <p class="font-garamond text-sm">
                * Sometimes
                <a
                  class="text-info-700 underline hover:text-info-900 active:text-info-600 font-semibold italic"
                  href="https://www.sfu.ca/ipinch/outputs/blog/citybeforecitybelongings/"
                  target="_blank"
                  >'belonging'</a
                >
                is a more appropriate term.
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white shadow-md w-full px-4 lg:px-8 py-2 lg:py-4">
          <div class="w-full flex items-center gap-2 md:gap-4">
            <Icon
              icon="boxicons:shapes-alt"
              class="text-primary-500"
              width="80"
            />
            <div class="flex flex-col w-full gap-2">
              <h3 class="text-lg font-semibold text-primary-500">
                Intangible Heritage
              </h3>
              <p class="font-garamond">
                Intangible heritage refers to parts of culture that do not have
                a physical form, such as belief systems and oral histories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AboutVisualizer from './AboutVisualizer.vue'
import { Icon } from '@iconify/vue'
</script>
