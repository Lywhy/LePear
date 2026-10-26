import { useState } from "react";
import { landingImages, type LandingImageId } from "@/lib/landing-images";

export function LandingImage({ asset }: { asset: LandingImageId }) {
  const image = landingImages[asset];
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        role="img"
        aria-label={"Изображение «" + image.fallback + "» недоступно"}
        className="flex h-full w-full items-center justify-center bg-linear-to-br from-shell-raised to-shell-deep p-6"
      >
        <span className="text-center font-mono text-xl text-shell-soft">
          {image.fallback}
        </span>
      </div>
    );
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes="(min-width: 1280px) 370px, (min-width: 1024px) calc((100vw - 176px) / 3), (min-width: 640px) calc(100vw - 64px), calc(100vw - 32px)"
      width={960}
      height={640}
      alt={image.alt}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover object-center"
      onError={() => setFailed(true)}
    />
  );
}
