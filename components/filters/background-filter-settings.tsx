"use client";
import React from "react";
import { useBackgroundFilters } from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";

export const BackgroundFilterSettings: React.FC = () => {
  const {
    isSupported,
    isReady,
    disableBackgroundFilter,
    applyBackgroundBlurFilter,
    applyBackgroundImageFilter,
    backgroundImages: _backgroundImages,
  } = useBackgroundFilters();
  const backgroundImages = _backgroundImages ?? [];

  if (!isSupported) {
    return (
      <div className="text-sm text-red-500">
        Thiết bị không hỗ trợ hiệu ứng nền.
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="text-sm animate-pulse text-muted-foreground">
        Đang tải bộ lọc nền...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-xs text-black">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={disableBackgroundFilter}
          className="cursor-pointer"
        >
          Tắt
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyBackgroundBlurFilter("low")}
          className="cursor-pointer"
        >
          Mờ nhẹ
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyBackgroundBlurFilter("medium")}
          className="cursor-pointer"
        >
          Mờ vừa
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyBackgroundBlurFilter("high")}
          className="cursor-pointer"
        >
          Mờ nhiều
        </Button>
      </div>
      {backgroundImages.length > 0 && (
        <div className="flex flex-wrap gap-2 cursor-pointer">
          {backgroundImages.map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => applyBackgroundImageFilter(img)}
              className="relative h-14 w-20 overflow-hidden rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <img
                src={img}
                alt="bg"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-[10px] text-center text-white">
                Áp dụng
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackgroundFilterSettings;
