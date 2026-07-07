import type { Metadata } from "next";

import { SuperAdminDesignMode } from "@/components/admin/super-admin-design-mode";
import { SessionTimeoutGuard } from "@/features/auth/session-timeout-guard";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KEYUN | 쉬운데 결과물은 예쁜 웹사이트 빌더",
    template: "%s | KEYUN",
  },
  description:
    "디자인과 코딩 없이 템플릿과 섹션으로 완성도 높은 웹사이트를 만들고 운영하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <SessionTimeoutGuard />
        <SuperAdminDesignMode />
      </body>
    </html>
  );
}
