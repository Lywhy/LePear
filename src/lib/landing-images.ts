export const landingImages = {
  theme: {
    src: "/assets/landing/theme-v1-640.webp",
    srcSet:
      "/assets/landing/theme-v1-640.webp 640w, /assets/landing/theme-v1-960.webp 960w",
    alt: "Веер бумажных цветовых образцов, матовые пластины и металлическая линейка.",
    label: "Цвет, шрифт и форма",
    fallback: "Редактор тем",
  },
  media: {
    src: "/assets/landing/media-v1-640.webp",
    srcSet:
      "/assets/landing/media-v1-640.webp 640w, /assets/landing/media-v1-960.webp 960w",
    alt: "Студийные наушники, микрофон и пустая кинохлопушка на тёмной поверхности.",
    label: "Видео, аудио и субтитры",
    fallback: "YouTube",
  },
  converter: {
    src: "/assets/landing/converter-v1-640.webp",
    srcSet:
      "/assets/landing/converter-v1-640.webp 640w, /assets/landing/converter-v1-960.webp 960w",
    alt: "Виниловая пластинка и стопка фотоснимков, соединённые прозрачной дугой.",
    label: "Музыка и изображения",
    fallback: "Конвертер",
  },
} as const;
export type LandingImageId = keyof typeof landingImages;
