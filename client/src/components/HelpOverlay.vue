<template>
  <div
    v-if="props.state === 'visiting'"
    class="absolute top-0 left-0 z-30 w-full h-full flex flex-col items-center text-grayscale-100 bg-grayscale-900/80"
  >
    <div class="text-grayscale-100 w-full">
      <h1 class="title w-full text-center my-4">Help Menu</h1>
      <div class="w-100 mx-auto mb-8">
        <h2 class="subtitle mb-4">Navigating the Model</h2>
        <ul class="font-poppins">
          <li class="mb-1">
            <span class="font-bold">Rotate</span>: Click or swipe to rotate the
            model.
          </li>
          <li class="mb-1">
            <span class="font-bold">Pan</span>: Hold
            <span class="font-bold">Shift</span> and click or swipe to pan the
            view.
          </li>
          <li>
            <span class="font-bold">Zoom</span>: Scroll up/down or pinch to zoom
            in/out.
          </li>
        </ul>
      </div>
    </div>
    <div class="mb-2 w-100">
      <h2 class="subtitle mb-4">Toolbar Buttons</h2>
      <div class="flex gap-1 items-center mb-1">
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="fill-grayscale-100"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15 24.375C20.1776 24.375 24.375 20.1776 24.375 15C24.375 9.82233 20.1776 5.625 15 5.625C9.82233 5.625 5.625 9.82233 5.625 15C5.625 20.1776 9.82233 24.375 15 24.375ZM15 26.25C21.2132 26.25 26.25 21.2132 26.25 15C26.25 8.7868 21.2132 3.75 15 3.75C8.7868 3.75 3.75 8.7868 3.75 15C3.75 21.2132 8.7868 26.25 15 26.25ZM15.9375 18.75V20.625H14.0625V18.75H15.9375ZM13.125 13.0398C13.125 12.0783 13.9371 11.25 15 11.25C16.0629 11.25 16.875 12.0783 16.875 13.0398C16.875 13.4237 16.6439 13.8789 16.1345 14.3949C15.6408 14.8951 15.013 15.3241 14.491 15.6615L14.0625 15.9386V17.8125H15.9375V16.9529C16.414 16.6287 16.9785 16.2089 17.469 15.712C18.1023 15.0705 18.75 14.162 18.75 13.0398C18.75 10.9888 17.0436 9.375 15 9.375C12.9564 9.375 11.25 10.9888 11.25 13.0398H13.125Z"
          />
        </svg>
        <span class="font-poppins"
          ><span class="font-bold">Help</span>: Open this guide.</span
        >
      </div>
      <div class="flex gap-1 items-center mb-1">
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="fill-grayscale-100"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.9376 17.4241L19.9622 13.3996L21.2879 14.7254L15.0001 21.0134L8.71216 14.7254L10.038 13.3996L14.0626 17.4241V5.625H15.9376V17.4241Z"
          />
          <path d="M22.5 22.5V24.375H7.5V22.5H22.5Z" />
        </svg>
        <span class="font-poppins"
          ><span class="font-bold">Download</span>: Save the model in your
          device.</span
        >
      </div>
      <div class="flex gap-1 items-center mb-1">
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="fill-grayscale-100"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M18.75 10.3125V11.25H16.875V7.5H18.75V8.4375H24.375V10.3125H18.75ZM11.25 16.875V13.125H9.375V14.0625H5.625V15.9375H9.375V16.875H11.25ZM21.5625 18.75V19.6875H24.375V21.5625H21.5625V22.5H19.6875V18.75H21.5625ZM5.625 19.6875V21.5625H18.75V19.6875H5.625ZM12.1875 14.0625H24.375V15.9375H12.1875V14.0625ZM5.625 8.4375H15.9375V10.3125H5.625V8.4375Z"
          />
        </svg>
        <span class="font-poppins"
          ><span class="font-bold">Options</span>: Adjust visualizer
          settings.</span
        >
      </div>
      <div class="flex gap-1 items-center">
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="fill-grayscale-100"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.4375 5.625H3.75V10.3125H5.625V7.5H8.4375V5.625ZM21.5625 24.375H26.25V19.6875H24.375V22.5H21.5625V24.375ZM3.75 24.375V19.6875H5.625V22.5H8.4375V24.375H3.75ZM26.25 10.3125V5.625H21.5625V7.5H24.375V10.3125H26.25Z"
          />
        </svg>
        <span class="font-poppins"
          ><span class="font-bold">Fullscreen</span>: Toggle fullscreen
          mode.</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  state: { type: String, required: true },
});
</script>
