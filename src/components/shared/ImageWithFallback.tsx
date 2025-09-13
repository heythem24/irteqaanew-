import React from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  // Use a separate prop to avoid conflicting with native img src type
  inputSrc?: string | null;
  fallbackSrc: string;
  forceHttps?: boolean;
  // If provided, we will set explicit width/height attributes to stabilize layout
  boxWidth?: number | string;
  boxHeight?: number | string;
  // If true, wraps the image in a fixed-size container to avoid layout shift
  fixedBox?: boolean;
}

const ensureHttps = (url?: string | null): string | undefined => {
  if (!url || typeof url !== 'string') return undefined;
  return /^https:\/\//.test(url) ? url : undefined;
};

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  inputSrc,
  fallbackSrc,
  forceHttps = true,
  boxWidth,
  boxHeight,
  fixedBox = true,
  style,
  onError,
  ...imgProps
}) => {
  const initial = (forceHttps ? ensureHttps(inputSrc) : (inputSrc || undefined)) || fallbackSrc;
  const [currentSrc, setCurrentSrc] = React.useState<string>(initial);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if ((e.currentTarget as HTMLImageElement).src !== fallbackSrc) {
      (e.currentTarget as HTMLImageElement).src = fallbackSrc;
      setCurrentSrc(fallbackSrc);
    }
    if (onError) onError(e);
  };

  const imgEl = (
    <img
      {...imgProps}
      src={currentSrc}
      onError={handleError}
      loading={imgProps.loading || 'lazy'}
      style={{ objectFit: 'cover', ...style }}
      width={typeof boxWidth === 'number' ? boxWidth : undefined}
      height={typeof boxHeight === 'number' ? boxHeight : undefined}
      decoding="async"
    />
  );

  if (fixedBox && (boxWidth || boxHeight)) {
    const w = boxWidth ?? '100%';
    const h = boxHeight ?? '100%';
    return (
      <div style={{ width: w, height: h, overflow: 'hidden', display: 'inline-block' }}>
        {imgEl}
      </div>
    );
  }

  return imgEl;
};

export default ImageWithFallback;
