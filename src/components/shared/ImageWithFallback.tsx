import React from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  // Use a separate prop to avoid conflicting with native img src type
  inputSrc?: string | null;
  fallbackSrc: string;
  forceHttps?: boolean;
  useCloudinaryFetch?: boolean; // if true and cloud name is provided, use Cloudinary fetch for remote images
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

// Try to read Cloudinary cloud name from both Vite and CRA env conventions
const getCloudName = (): string | undefined => {
  try {
    const vite = (import.meta as any)?.env?.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
    // @ts-ignore
    const cra = (typeof process !== 'undefined' ? (process.env?.REACT_APP_CLOUDINARY_CLOUD_NAME as string | undefined) : undefined);
    return vite || cra || undefined;
  } catch {
    return undefined;
  }
};

const buildCloudinaryFetchUrl = (src: string, opts: { w?: number | string; h?: number | string }): string | undefined => {
  const cloud = getCloudName();
  if (!cloud) return undefined;
  if (!/^https?:\/\//.test(src)) return undefined; // fetch only for remote URLs
  const w = typeof opts.w === 'number' ? opts.w : undefined;
  const h = typeof opts.h === 'number' ? opts.h : undefined;
  const transforms: string[] = ['f_auto', 'q_auto'];
  if (w || h) transforms.push('c_fill');
  if (w) transforms.push(`w_${w}`);
  if (h) transforms.push(`h_${h}`);
  const t = transforms.join(',');
  const encoded = encodeURIComponent(src);
  return `https://res.cloudinary.com/${cloud}/image/fetch/${t}/${encoded}`;
};

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  inputSrc,
  fallbackSrc,
  forceHttps = true,
  useCloudinaryFetch = true,
  boxWidth,
  boxHeight,
  fixedBox = true,
  style,
  onError,
  ...imgProps
}) => {
  let initial: string | undefined;
  const cloud = getCloudName();
  if (useCloudinaryFetch && cloud && typeof inputSrc === 'string' && /^https?:\/\//.test(inputSrc)) {
    // Route remote image through Cloudinary fetch to guarantee https and optimization
    initial = buildCloudinaryFetchUrl(inputSrc, { w: boxWidth as any, h: boxHeight as any }) || undefined;
  }
  if (!initial) {
    initial = (forceHttps ? ensureHttps(inputSrc) : (inputSrc || undefined)) || fallbackSrc;
  }
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
