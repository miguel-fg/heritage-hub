<template>
  <div class="w-full @container">
    <div
      class="w-full min-h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <div class="flex flex-col gap-1 body text-lg text-grayscale-900">
        <h1 class="font-poppins font-semibold text-grayscale-500">About Us</h1>
        <p class="font-poppins font-bold text-4xl md:text-[4.5rem]">
          <span class="text-primary-500">Heritage Hub</span> is a website for
          education and engagement.
        </p>
        <p class="text-xl mt-1 md:mt-4 md:text-2xl text-grayscale-700">
          It is being created to feature interactive 3D models of culturally
          important materials, accompanied by photographs, videos, and lesson
          plans for teachers. All content will be produced by faculty and
          students at Simon Fraser University.
        </p>
        <AboutHeritage />
        <UniqueHeritage />
        <div>
          <h2
            class="text-grayscale-500 font-poppins font-semibold pb-2 pt-8 md:pt-24"
          >
            The Team
          </h2>
          <div class="flex flex-col lg:flex-row w-full gap-8 xl:gap-16">
            <div class="flex flex-col md:flex-row w-full gap-4 md:gap-16">
              <div
                v-if="current === 'xs' || current === 'sm'"
                class="flex gap-2"
              >
                <div class="aspect-square w-1/3 sm:w-1/4 shadow-md h-fit">
                  <a
                    href="https://www.sfu.ca/archaeology/about/people/faculty/ctremain.html"
                    target="_blank"
                    referrerpolicy="no-referrer"
                  >
                    <img src="/images/cara.webp" class="w-full" />
                  </a>
                </div>
                <div class="flex flex-col gap-1 w-2/3 sm:w-3/4">
                  <a
                    href="https://www.sfu.ca/archaeology/about/people/faculty/ctremain.html"
                    target="_blank"
                    referrerpolicy="no-referrer"
                  >
                    <div class="flex gap-1">
                      <h3
                        class="text-lg font-bold font-poppins text-primary-500 leading-tight w-full"
                      >
                        Dr. Cara Tremain
                      </h3>
                      <Icon
                        icon="bx:link-external"
                        class="text-grayscale-500"
                      />
                    </div>
                  </a>
                  <p class="leading-tight mb-2 text-base">
                    Assistant Professor in the Department of Archaeology at SFU
                  </p>
                  <span
                    class="text-xs font-poppins px-2 py-1 bg-grayscale-300 text-grayscale-800 font-medium w-min text-nowrap"
                    >Project Lead</span
                  >
                </div>
              </div>
              <div v-else class="w-1/3">
                <a
                  href="https://www.sfu.ca/archaeology/about/people/faculty/ctremain.html"
                  target="_blank"
                  referrerpolicy="no-referrer"
                >
                  <div
                    class="cursor-pointer transform transition duration-500 md:hover:scale-107"
                  >
                    <div class="aspect-square w-full shadow-md">
                      <img src="/images/cara.webp" class="w-full" />
                    </div>
                    <div>
                      <h3
                        class="text-xl font-bold font-poppins text-primary-500 mt-1"
                      >
                        Dr. Cara Tremain
                      </h3>
                      <p class="leading-tight mb-2">
                        Assistant Professor in the Department of Archaeology at
                        SFU
                      </p>
                    </div>
                  </div>
                </a>
                <span
                  class="text-xs font-poppins px-2 py-1 bg-grayscale-300 text-grayscale-800 font-medium"
                  >Project Lead</span
                >
              </div>
              <div
                v-if="current === 'xs' || current === 'sm'"
                class="flex gap-2"
              >
                <div class="aspect-square w-1/3 sm:w-1/4 shadow-md h-fit">
                  <a
                    href="https://github.com/miguel-fg"
                    target="_blank"
                    referrerpolicy="no-referrer"
                  >
                    <img src="/images/miguel.webp" class="w-full" />
                  </a>
                </div>
                <div class="flex flex-col gap-1 w-2/3 sm:w-3/4">
                  <a
                    href="https://github.com/miguel-fg"
                    target="_blank"
                    referrerpolicy="no-referrer"
                  >
                    <div class="flex gap-1">
                      <h3
                        class="text-lg font-bold font-poppins text-primary-500 leading-tight w-full"
                      >
                        Miguel Fierro
                      </h3>
                      <Icon
                        icon="bx:link-external"
                        class="text-grayscale-500"
                      />
                    </div>
                  </a>
                  <p class="leading-tight mb-2 text-base">Software Developer</p>
                  <span
                    class="text-xs font-poppins px-2 py-1 bg-grayscale-300 text-grayscale-800 font-medium w-min text-nowrap"
                    >Technical Lead</span
                  >
                </div>
              </div>
              <div v-else class="w-1/3">
                <a
                  href="https://github.com/miguel-fg"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div
                    class="cursor-pointer transform transition duration-500 md:hover:scale-107"
                  >
                    <div class="aspect-square w-full shadow-md">
                      <img src="/images/miguel.webp" class="w-full" />
                    </div>
                    <div>
                      <h3
                        class="text-xl font-bold font-poppins text-primary-500 mt-1"
                      >
                        Miguel Fierro
                      </h3>
                      <p class="leading-tight mb-2">Software Developer</p>
                    </div>
                  </div>
                </a>
                <span
                  class="text-xs font-poppins px-2 py-1 bg-grayscale-300 text-grayscale-800 font-medium"
                  >Technical Lead</span
                >
              </div>
            </div>
            <p
              class="w-full font-poppins font-bold text-xl md:text-2xl xl:text-5xl"
            >
              Funding has been provided by
              <span class="text-primary-500">SFU's Faculty of Environment</span>
              Spark Grant and the Library's
              <span class="text-primary-500"
                >Scholarly Digital Projects Program</span
              >.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full mt-40">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import AboutHeritage from '../components/AboutHeritage.vue'
import UniqueHeritage from '../components/UniqueHeritage.vue'
import Footer from '../components/Footer.vue'
import { Icon } from '@iconify/vue'
import { useTailwindBreakpoints } from '../scripts/useTailwindBreakpoints'

const { current } = useTailwindBreakpoints()
</script>
