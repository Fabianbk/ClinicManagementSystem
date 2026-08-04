import { Sarabun, Taviraj } from "next/font/google";

export const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const taviraj = Taviraj({
  subsets: ["latin", "thai"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});