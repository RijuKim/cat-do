import './globals.css';

export const metadata = {
  title: 'Cat-Do',
  description: '고양이 비서 캣두',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
