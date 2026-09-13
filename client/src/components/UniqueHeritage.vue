<template>
  <!-- Mobile layout -->
  <div
    v-if="current === 'sm' || current === 'xs'"
    class="font-poppins text-base"
  >
    <h2 class="font-bold text-4xl w-full my-4">
      Why is
      <span class="text-primary-500 text-nowrap">Heritage Hub</span> Unique?
    </h2>
    <div class="flex flex-col gap-2">
      <div
        class="aspect-video overflow-hidden flex items-center justify-center"
      >
        <img src="/images/ring1.webp" alt="" />
      </div>
      <p>
        The site was created for the purpose of showcasing, and sharing,
        information exclusive to tangible heritage. While other websites exist
        for hosting 3D models and other digital files such as images and videos,
        many were not designed for heritage. This means they lack features
        related to archaeology or culture, and may not be suitable venues for
        sharing educational information.
      </p>
      <div
        class="aspect-video overflow-hidden flex items-center justify-center"
      >
        <img src="/images/ring2.webp" alt="" />
      </div>
      <p>
        Heritage Hub exists for a very specific type of materials, and is
        designed to enrich engagement with digitized versions of heritage by
        providing educational resources. As well as being a learning resource,
        it is a platform for student training in digital technologies and
        pedagogical approaches.
      </p>
      <div>
        <div class="w-full aspect-video">
          <AboutVisualizer model="ring" />
        </div>
        <div
          class="bg-primary-500 pb-4 px-4 font-garamond text-lg text-grayscale-100"
        >
          The materials will be primarily created by students, under the
          supervision of faculty. They are ideal for engagement and learning,
          but they may not be the most ideal resources for research that
          requires 100% accuracy in 3D models. This reinforces the purpose of
          the website, as one for engagement with digital heritage and not as a
          substitute for in-person analysis of materials.
        </div>
      </div>
    </div>
  </div>

  <!-- Desktop layout -->
  <div v-else>
    <div class="flex justify-between gap-16 mt-4 md:mt-8 font-poppins">
      <h2 class="font-bold text-[4rem] w-full">
        Why is <span class="text-primary-500">Heritage Hub</span> Unique?
      </h2>
      <div class="w-full">
        <p class="mb-8">
          The site was created for the purpose of showcasing, and sharing,
          information exclusive to tangible heritage. While other websites exist
          for hosting 3D models and other digital files such as images and
          videos, many were not designed for heritage. This means they lack
          features related to archaeology or culture, and may not be suitable
          venues for sharing educational information.
        </p>
        <p>
          Heritage Hub exists for a very specific type of materials, and is
          designed to enrich engagement with digitized versions of heritage by
          providing educational resources. As well as being a learning resource,
          it is a platform for student training in digital technologies and
          pedagogical approaches.
        </p>
      </div>
    </div>
    <div class="grid mt-16">
      <div
        class="col-start-1 row-start-1 self-start justify-self-start z-10 w-1/3 min-w-[300px] bg-primary-500 text-grayscale-100 font-garamond text-lg xl:text-2xl p-8 shadow-md"
      >
        <p>
          The materials will be primarily created by students, under the
          supervision of faculty. They are ideal for engagement and learning,
          but they may not be the most ideal resources for research that
          requires 100% accuracy in 3D models. This reinforces the purpose of
          the website, as one for engagement with digital heritage and not as a
          substitute for in-person analysis of materials.
        </p>
      </div>
      <div
        class="col-start-1 row-start-1 self-start justify-self-end w-3/7 mr-[3.5%] xl:mr-[7%] shadow-md"
      >
        <img src="/images/ring1.webp" alt="ring being scanned" />
      </div>
      <div
        class="col-start-1 row-start-1 self-end justify-self-center -translate-x-1/8 xl:-translate-x-1/4 translate-y-10 w-4/9 shadow-md z-5"
      >
        <img src="/images/ring2.webp" alt="ring clamped in scanner" />
      </div>
      <div
        class="col-start-1 row-start-1 self-end justify-self-end xl:translate-y-10 aspect-square w-1/4 shadow-md"
      >
        <AboutVisualizer model="ring" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AboutVisualizer from './AboutVisualizer.vue'
import { useTailwindBreakpoints } from '../scripts/useTailwindBreakpoints'

const { current } = useTailwindBreakpoints()
</script>
