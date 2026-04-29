import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { ProductsPage } from "@/pages/client/ProductsPage";
import { ProductDetailPage } from "@/pages/client/ProductDetailPage";
import { CheckoutPage } from "@/pages/client/CheckoutPage";
import { CheckoutSuccessPage } from "@/pages/client/CheckoutSuccessPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { RootRedirect } from "@/components/RootRedirect";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: <RootRedirect />
  },
  {
    element: (
      <RequireAuth role="client">
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/products", element: <ProductsPage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/checkout/sucesso", element: <CheckoutSuccessPage /> }
    ]
  },
  {
    element: (
      <RequireAuth role="admin">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/admin", element: <Navigate to="/admin/estoque" replace /> },
      { path: "/admin/estoque", element: <AdminProductsPage /> },
      { path: "/admin/clientes", element: <AdminUsersPage /> }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
