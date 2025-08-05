'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type SmartImageProps = ImageProps & {
  showSkeleton?: boolean;
};

export default function SmartImage({
  src,
  alt,
  width,
  height,
  style,
  showSkeleton = true,
  ...props
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);

  const styleWidth = (style as any)?.width;
  const styleHeight = (style as any)?.height;

  const finalWidth = width || (styleWidth ? parseInt(styleWidth) : undefined);
  const finalHeight =
    height || (styleHeight ? parseInt(styleHeight) : undefined);

  const useFill = !finalWidth || !finalHeight;

  return (
    <div
      style={{
        position: 'relative',
        width: useFill ? '100%' : finalWidth, // If fill, use 100%
        height: useFill ? '250px' : finalHeight, // Use default height or passed height
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Show Skeleton Loader while image is not loaded */}
      {showSkeleton && !loaded && (
        <>
          <Skeleton
            width='100%'
            height='100%'
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          />
          {/* Loading Icon in the middle */}
          <div
            style={{
              zIndex: 2,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              src='/assets/SmartImage_Loader/icons8-picture-100.svg'
              alt='loading icon'
              style={{ width: '40px', height: '40px' }}
            />
          </div>
        </>
      )}

      {/* Image with fill logic */}
      <Image
        src={src}
        alt={alt}
        width={useFill ? undefined : Number(finalWidth)} // Ensure width is valid
        height={useFill ? undefined : Number(finalHeight)} // Ensure height is valid
        fill={useFill} // If no width/height, use 'fill' mode
        onLoad={() => setLoaded(true)}
        style={{
          objectFit: 'cover', // Maintain object-fit for proper resizing
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
        }}
        {...props}
      />
    </div>
  );
}
