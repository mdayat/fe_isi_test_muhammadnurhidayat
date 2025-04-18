import "@styles/globals.css";
import type { AppProps } from "next/app";
import { ToastProvider } from "../contexts/ToastProvider";
import { AuthProvider } from "@contexts/AuthProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ToastProvider>
  );
}
