import "./globals.css";
export const metadata = {
  title: "Password Panic",
  description: "Lock your deepest secrets with the ultimate password",
};
import styles from "./page.module.css";
import { Press_Start_2P } from "next/font/google";

const climateCrisis = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-climate-crisis",
  display: "swap",
});
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css?family=Roboto+Mono"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className={styles.title}>
          <span style={{ fontSize: 50 }}>*</span>
          <div className={`${climateCrisis.className} ${styles.title_text}`}>
            Password Panic
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
