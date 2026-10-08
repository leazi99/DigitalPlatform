import { Navigate, Route, Routes } from "react-router-dom";
import { AdminAuthProvider } from "./AdminAuth";
import { useAdminAuth } from "./useAdminAuth";
import { AdminMetaProvider } from "./AdminMeta";
import { useMeta } from "./useAdmin";
import AdminLayout from "./AdminLayout";
import ResourcePage from "./ResourcePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Visitors from "./pages/Visitors";
import RecordsPage from "./pages/Records";
import SiteContent from "./pages/SiteContent";
import Account from "./pages/Account";
import { contentOrder } from "./resourceViews";
import { Alert, Loading } from "./ui";

/**
 * The admin panel.
 *
 * Its own bundle, loaded only when someone opens /admin, so a visitor reading
 * about the course never downloads it. Its own routes, outside the public app
 * shell: no marketing header, no footer, and staff are not counted in the
 * visitor figures they are here to read.
 */
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Gate />
    </AdminAuthProvider>
  );
}

function Gate() {
  const { admin, checking } = useAdminAuth();

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading label="Checking your session…" />
      </div>
    );
  }

  // Not signed in: every route is the sign-in screen. Nothing behind it is
  // rendered, so no protected request is ever attempted.
  if (!admin) return <Login />;

  return (
    <AdminMetaProvider>
      <AdminLayout>
        <Panel />
      </AdminLayout>
    </AdminMetaProvider>
  );
}

function Panel() {
  const { error } = useMeta();

  // All the content screens, generated from the same list the sidebar uses.
  const contentKeys = Object.values(contentOrder).flat();

  return (
    <>
      {error && (
        <div className="px-5 pt-5 sm:px-8">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="students" element={<RecordsPage resourceKey="students" />} />
        <Route path="enquiries" element={<RecordsPage resourceKey="enquiries" />} />

        {contentKeys.map((key) => (
          <Route key={key} path={key} element={<ResourcePage resourceKey={key} />} />
        ))}

        <Route path="content" element={<SiteContent />} />
        <Route path="account" element={<Account />} />

        {/* A mistyped admin URL goes to the dashboard, not the public site. */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </>
  );
}
