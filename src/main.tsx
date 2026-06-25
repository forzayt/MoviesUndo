import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { router } from "./router";
import "./styles.css";

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <>
      <RouterProvider router={router} />
      <SpeedInsights />
      <Analytics />
    </>,
  );
}
