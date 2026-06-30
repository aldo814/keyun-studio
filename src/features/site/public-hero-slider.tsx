"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

type PublicHeroSlide = {
  backgroundType: "color" | "image";
  badge: string;
  bgColor: string;
  buttonLabel: string;
  buttonLink: string;
  description: string;
  id: string;
  imageUrl: string;
  secondaryButtonLabel: string;
  secondaryButtonLink: string;
  title: string;
};

type PublicHeroSliderProps = {
  align: "left" | "center" | "right";
  animations: {
    badge: string;
    button: string;
    description: string;
    secondaryButton: string;
    title: string;
  };
  arrowBgColor: string;
  arrowButtonSize: string;
  arrowColor: string;
  arrowImageUrl: string;
  arrowSize: string;
  arrowStyle: string;
  autoplayDelay: number;
  buttonStyle: CSSProperties;
  descriptionStyle: CSSProperties;
  overlayColor: string;
  overlayOpacity: string;
  paginationStyle: string;
  slides: PublicHeroSlide[];
  titleStyle: CSSProperties;
};

export function PublicHeroSlider({
  align,
  animations,
  arrowBgColor,
  arrowButtonSize,
  arrowColor,
  arrowImageUrl,
  arrowSize,
  arrowStyle,
  autoplayDelay,
  buttonStyle,
  descriptionStyle,
  overlayColor,
  overlayOpacity,
  paginationStyle,
  slides,
  titleStyle,
}: PublicHeroSliderProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const positionClass =
    align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "mr-auto";
  const justifyClass =
    align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
  const arrowStyleVars = {
    "--keyun-arrow-bg": arrowBgColor,
    "--keyun-arrow-color": arrowColor,
    "--keyun-arrow-icon-size": `${arrowSize}px`,
    "--keyun-arrow-size": `${arrowButtonSize}px`,
  } as CSSProperties;

  return (
    <Swiper
      a11y={{ enabled: true }}
      autoplay={{
        delay: autoplayDelay,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      className={`keyun-hero-swiper keyun-pagination-${paginationStyle}`}
      loop={slides.length > 1}
      modules={[A11y, Autoplay, Pagination]}
      pagination={{
        clickable: true,
        renderBullet: (index, className) =>
          `<span class="${className}">${paginationStyle === "numeric" ? index + 1 : ""}</span>`,
      }}
      onAutoplayTimeLeft={(swiper, _time, progress) => {
        swiper.el.style.setProperty(
          "--keyun-progress",
          `${Math.max(0, Math.min(100, (1 - progress) * 100))}%`,
        );
      }}
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
    >
      {slides.map((slide) => {
        const slideBackground =
          slide.backgroundType === "image" && slide.imageUrl
            ? {
                backgroundImage: `url(${slide.imageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            : { backgroundColor: slide.bgColor };

        return (
          <SwiperSlide key={slide.id}>
            <div
              className="keyun-slide-overlay min-h-[620px]"
              style={{
                ...slideBackground,
                "--keyun-overlay-color": overlayColor,
                "--keyun-overlay-opacity": overlayOpacity,
              } as unknown as CSSProperties}
            >
              <div className="relative z-[2] mx-auto flex min-h-[620px] w-full max-w-[1440px] items-center px-6 py-24 md:px-10">
                <div className={`w-full ${alignClass}`}>
                  {slide.badge ? (
                    <p
                      className={`mb-6 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white ${positionClass}`}
                      data-keyun-animation={animations.badge}
                    >
                      {slide.badge}
                    </p>
                  ) : null}
                  <h1
                    className={`max-w-4xl font-black leading-[1.08] tracking-normal ${positionClass}`}
                    data-keyun-animation={animations.title}
                    style={titleStyle}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className={`mt-5 max-w-2xl text-white/80 ${positionClass}`}
                    data-keyun-animation={animations.description}
                    style={descriptionStyle}
                  >
                    {slide.description}
                  </p>
                  <div className={`mt-8 flex flex-wrap items-center gap-3 ${justifyClass}`}>
                    {slide.buttonLabel ? (
                      <a
                        className="inline-flex min-h-12 items-center justify-center px-6 font-semibold"
                        data-keyun-animation={animations.button}
                        href={slide.buttonLink}
                        style={buttonStyle}
                      >
                        {slide.buttonLabel}
                      </a>
                    ) : null}
                    {slide.secondaryButtonLabel ? (
                      <a
                        className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white"
                        data-keyun-animation={animations.secondaryButton}
                        href={slide.secondaryButtonLink}
                      >
                        {slide.secondaryButtonLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
      <button
        aria-label="이전 슬라이드"
        className={`keyun-slider-arrow keyun-slider-arrow-prev ${
          arrowStyle === "circle" ? "keyun-slider-arrow-circle" : ""
        }`}
        style={arrowStyleVars}
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        {arrowStyle === "image" && arrowImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" src={arrowImageUrl} />
        ) : (
          <ArrowLeft />
        )}
      </button>
      <button
        aria-label="다음 슬라이드"
        className={`keyun-slider-arrow keyun-slider-arrow-next ${
          arrowStyle === "circle" ? "keyun-slider-arrow-circle" : ""
        }`}
        style={arrowStyleVars}
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
      >
        {arrowStyle === "image" && arrowImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" src={arrowImageUrl} />
        ) : (
          <ArrowRight />
        )}
      </button>
    </Swiper>
  );
}
