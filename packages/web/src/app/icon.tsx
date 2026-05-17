import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: '#00DC82',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#000',
            fontSize: 20,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            lineHeight: 1,
            marginTop: -1,
          }}
        >
          K
        </span>
      </div>
    ),
    { ...size },
  );
}
