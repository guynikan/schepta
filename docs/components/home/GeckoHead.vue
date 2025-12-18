<template>
  <div
    v-motion-slide-top
    :delay="200"
    :duration="2000"
  >
    <svg
      class="gecko-head"
      viewBox="0 0 592 610"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xml:space="preserve"
      xmlns:serif="http://www.serif.com/"
      style="
        fill-rule: evenodd;
        clip-rule: evenodd;
        stroke-linejoin: round;
        stroke-miterlimit: 2;
      "
      :aria-label="alt"
      role="img"
    >
        <g
          v-for="(path, index) in paths"
          :key="index"
          class="gecko-piece"
          v-motion-slide-top
          :enter="{
            y: 0,
            opacity: 1,
            transition: { delay: delayFor(index, paths.length) },
          }"
          :hovered="{
            y: -3.5,
            transition: {
              type: 'spring',
              stiffness: 320,
              damping: 24,
              mass: 0.6,
            },
          }"
        >
          <path
            :d="path.d"
            :fill="path.originalColor"
            class="gecko-path base"
          />

          <path
            :d="path.d"
            :fill="path.alternativeColor"
            class="gecko-path paint"
          />
        </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { geckoPaths } from "./gecko-paths";

  defineProps<{
    alt?: string;
  }>();

  const delayFor = (index: number, total: number) => {
    const maxDelay = 2000;
    const minStep = 6;
    if (total <= 1) return 0;
    const t = index / (total - 1);
    const d = t * maxDelay;
    return Math.round(index * minStep + d * 0.6);
  };

  const hoveredIndex = ref<number | null>(null);

  const colorPalette = [
    "rgb(36,77,159)",
    "rgb(10,156,213)",
    "rgb(69,168,87)",
    "rgb(101,80,114)",
    "rgb(221,50,45)",
    "rgb(248,193,29)",
    "rgb(2,129,115)",
    "rgb(30,28,28)",
  ];

  const getRandomAlternativeColor = (originalColor: string): string => {
    const BLACK = "rgb(30,28,28)";

    if (originalColor === BLACK) {
      return BLACK;
    }

    const availableColors = colorPalette.filter(
      (color) => color !== originalColor && color !== BLACK
    );

    if (availableColors.length === 0) {
      return originalColor;
    }

    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
  };

  const paths = geckoPaths.map((path) => {
    let alternativeColor = getRandomAlternativeColor(path.originalColor);

    return {
      ...path,
      alternativeColor,
    };
  });
</script>

<style scoped>
  .gecko-head {
    width: 100%;
    max-width: 300px;
    height: auto;
    filter: drop-shadow(0 3px 10px rgba(0, 0, 0, 0.08));
    animation: float 3s ease-in-out infinite;
  }

  .gecko-path {
    cursor: pointer;
    transform-origin: center;
    transition: fill 180ms ease, filter 180ms ease, transform 180ms ease;
  }

  .gecko-piece {
    cursor: pointer;
  }

  .gecko-path.paint {
    pointer-events: none;
    -webkit-mask-image: url("/nature-sprite.png");
    mask-image: url("/nature-sprite.png");
    -webkit-mask-size: 2300% 100%;
    mask-size: 2300% 100%;
    -webkit-mask-position: 0 0;
    mask-position: 0 0;
  }

  .gecko-piece:hover .gecko-path.paint {
    -webkit-animation: geckoMaskIn 0.7s steps(22) forwards;
    animation: geckoMaskIn 0.7s steps(22) forwards;
  }

  @keyframes geckoMaskIn {
    from {
      -webkit-mask-position: 0 0;
      mask-position: 0 0;
    }

    to {
      -webkit-mask-position: 100% 0;
      mask-position: 100% 0;
    }
  }

  @keyframes geckoMaskOut {
    from {
      -webkit-mask-position: 100% 0;
      mask-position: 100% 0;
    }

    to {
      -webkit-mask-position: 0 0;
      mask-position: 0 0;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }

    50% {
      transform: translateY(-10px);
    }
  }
</style>
