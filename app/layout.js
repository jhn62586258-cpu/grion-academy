import localFont from 'next/font/local';
import './globals.css';

const kotraHope = localFont({
  src: '../public/images/KOTRAHOPE.ttf',
  display: 'swap',
});

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
    <html lang="ko" className={kotraHope.className}>
      <body>{children}</body>
    </html>
  );
}
