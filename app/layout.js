import './globals.css';

export const metadata = {
  title: '그리온 말씀 사관학교 (충진!)',
  description: '교회 교사를 위한 말씀 암기 & 실전 문답 훈련 게임',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#bfe8ff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'KOTRAHOPE';
                src: url('https://jsdelivr.net') format('woff2');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              html, body, * {
                font-family: 'KOTRAHOPE', sans-serif !important;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
