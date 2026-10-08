import { lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layouts/AppShell";
import LandingPage from "./pages/LandingPage";
import { ContentProvider } from "./content/ContentProvider";

// Split per sector: a visitor reading about the course should not have to
// download the agency page to do it.
const AgencyPage = lazy(() => import("./pages/AgencyPage"));
const InstitutePage = lazy(() => import("./pages/InstitutePage"));

// The admin panel is its own bundle, loaded only when someone opens /admin.
// Visitors never download the panel, its tables or its charts.
const AdminApp = lazy(() => import("./admin/AdminApp"));

export default function App() {
  return (
    <BrowserRouter>
      <ContentProvider>
        <Routes>
          {/* Staff side. Outside the public shell: no marketing header, no
              footer, and no visitor tracking of the people running the site. */}
          <Route path="/admin/*" element={<AdminApp />} />

          <Route element={<AppShell />}>
            <Route index element={<LandingPage />} />
            <Route path="agency" element={<AgencyPage />} />
            <Route path="institute" element={<InstitutePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ContentProvider>
    </BrowserRouter>
  );
}
