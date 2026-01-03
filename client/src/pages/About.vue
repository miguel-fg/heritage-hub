<template>
  <div class="w-full @container">
    <div
      class="w-full min-h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <div class="flex flex-col gap-4 body text-lg text-grayscale-900">
        <h1 class="title text-5xl text-wrap text-primary-500">
          What is Heritage Hub?
        </h1>
        <p>
          Heritage Hub is a website for education and engagement. It is being
          created to feature interactive 3D models of culturally important
          materials, accompanied by photographs, videos, and lesson plans for
          teachers. All content will be produced by faculty and students at
          Simon Fraser University.
        </p>
        <h2 class="title text-4xl text-grayscale-700 mt-10">
          What is Heritage?
        </h2>
        <p>
          Heritage refers to aspects of human culture that are valued and passed
          down through generations.
        </p>
        <p>
          Tangible heritage has a physical form, including naturally occurring
          landscapes and manufactured forms such as artifacts (sometimes
          ‘belonging’ is a more appropriate term- see
          <a
            class="text-info-600 underline hover:text-info-800 font-medium"
            href="https://www.sfu.ca/ipinch/outputs/blog/citybeforecitybelongings/"
            target="_blank"
            >this link</a
          >
          for more information). Intangible heritage refers to parts of culture
          that do not have a physical form, such as belief systems and oral
          histories.
        </p>
        <p>
          For more information about cultural heritage, see the
          <a
            class="text-info-600 underline hover:text-info-800 font-medium"
            href="https://www.sfu.ca/ipinch/"
            target="_blank"
            >Intellectual Property Issues in Cultural Heritage website</a
          >.
        </p>
        <h2 class="title text-4xl text-grayscale-700 mt-10">
          Why is Heritage Hub unique?
        </h2>
        <p>
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
        <h2 class="title text-4xl text-grayscale-700 mt-10">
          What should you know about Heritage Hub?
        </h2>
        <p>
          The materials will be primarily created by students, under the
          supervision of faculty. They are ideal for engagement and learning,
          but they may not be the most ideal resources for research that
          requires 100% accuracy in 3D models (since there can be some
          inconsistencies in scale, colour, etc. from the original material
          based on conditions of the scanning/ photogrammetry process and the
          competency of the individual who created the model). This reinforces
          the purpose of the website, as one for engagement with digital
          heritage and not as a substitute for in-person analysis of materials.
        </p>
        <h3 class="title text-3xl text-grayscale-700 mt-5">The Team</h3>
        <p>
          Heritage Hub is a project led by Dr. Cara Tremain, Assistant Professor
          in the Department of Archaeology at SFU. Miguel Ángel Fierro Gutiérrez
          is the project Software Developer. Funding has been provided by SFU’s
          Faculty of Environment Spark Grant.
        </p>
        <p class="tag text-base text-grayscale-500 mt-15">
          &copy; 2026. The content of this site is licensed via
          <a
            class="text-info-600 underline hover:text-info-800"
            href="https://creativecommons.org/licenses/by-nc/4.0/"
            target="_blank"
            >CC BY-NC 4.0</a
          >
        </p>
      </div>
    </div>

    <div class="w-full mt-40">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import Footer from '../components/Footer.vue'
import { Icon } from '@iconify/vue'
</script>
