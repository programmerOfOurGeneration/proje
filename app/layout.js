import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import Provider from "./components/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Portföy Sitesi",
  description: "Portföy ve Etkinlikler",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html lang="tr">
      <body className={inter.className}>
        <Provider session={session}>{children}</Provider>
      </body>
    </html>
  );
}
