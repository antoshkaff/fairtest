import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/shared/lib/constants";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Fair online test delivery and behavior event review",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
