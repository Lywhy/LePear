import App from "@/App.tsx";
import { SiteLayout } from "@/components/layout/site-layout";
import { AppMotion } from "@/components/motion/app-motion";
import ContactPage from "@/pages/contact";
import EditorPage from "@/pages/editor";
import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";

const DesignFoundationPage = import.meta.env.DEV
  ? lazy(() => import("@/pages/design-foundation"))
  : null;

createRoot(document.getElementById("root")!).render(
  <AppMotion>
    <BrowserRouter>
      <Routes>
        {DesignFoundationPage && (
          <Route
            path="/design-foundation"
            element={
              <Suspense fallback={<p className="p-6">Загрузка образцов…</p>}>
                <DesignFoundationPage />
              </Suspense>
            }
          />
        )}
        <Route element={<SiteLayout />}>
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/*" element={<App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AppMotion>
);
