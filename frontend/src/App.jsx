{
  /* Start Project Date Sunday 21 April 2025 */
}

import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { fetchUserProfile } from "./redux/slices/authSlices";
import ErrorBoundary from "./components/Layout/ErrorBoundary";

const UserLayout = lazy(() => import("./components/Layout/UserLayout"));
const Home = lazy(() => import("./Pages/Home"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));
const Profile = lazy(() => import("./Pages/Profile"));
const CollectionPage = lazy(() => import("./Pages/CollectionPage"));
const ProductDetails = lazy(() => import("./components/Products/ProductDetails"));
const Checkout = lazy(() => import("./components/Products/Checkout"));
const OrderConfirmationPage = lazy(() => import("./Pages/OrderConfirmationPage"));
const OrderDetailsPage = lazy(() => import("./Pages/OrderDetailsPage"));
const MyOrderPages = lazy(() => import("./Pages/MyOrderPages"));
const AdminLayout = lazy(() => import("./components/Admin/AdminLayout"));
const AdminHomePage = lazy(() => import("./Pages/Admin-Pages/AdminHomePage"));
const UserManagement = lazy(() => import("./components/Admin/UserManagement"));
const ProductManagement = lazy(() => import("./components/Admin/ProductManagement"));
const OrderManagement = lazy(() => import("./components/Admin/OrderManagement"));
const EditProductPage = lazy(() => import("./components/Admin/EditProductPage"));
const NotFound = lazy(() => import("./Pages/NotFound"));

const routeTitles = [
  ["/", "E / C Studio — Everyday pieces, considered"],
  ["/collections", "The collection — E / C Studio"],
  ["/login", "Sign in — E / C Studio"],
  ["/register", "Create an account — E / C Studio"],
  ["/profile", "Your account — E / C Studio"],
  ["/checkout", "Checkout — E / C Studio"],
  ["/my-order", "Your orders — E / C Studio"],
  ["/admin", "Studio dashboard — E / C Studio"],
];

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const RouteTransition = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const title = routeTitles.find(([path]) => (
      path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(`${path}/`)
    ))?.[1] || "E / C Studio";
    document.title = title;
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = "A considered wardrobe of elevated everyday essentials from E / C Studio.";
    let openGraphTitle = document.querySelector('meta[property="og:title"]');
    if (!openGraphTitle) {
      openGraphTitle = document.createElement("meta");
      openGraphTitle.setAttribute("property", "og:title");
      document.head.appendChild(openGraphTitle);
    }
    openGraphTitle.content = title;
    let openGraphUrl = document.querySelector('meta[property="og:url"]');
    if (!openGraphUrl) {
      openGraphUrl = document.createElement("meta");
      openGraphUrl.setAttribute("property", "og:url");
      document.head.appendChild(openGraphUrl);
    }
    openGraphUrl.content = window.location.href;
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-transition">
      <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<main className="storefront-shell grid min-h-[60vh] place-items-center"><p role="status" className="eyebrow">Opening the studio…</p></main>}>
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route
            index
            element={
              <Suspense
                fallback={
                  <main className="storefront-shell">
                    <div className="section-shell py-24">
                      <div className="animate-pulse bg-[#e7e0d5]" style={{ height: "68vh" }} />
                    </div>
                  </main>
                }
              >
                <Home />
              </Suspense>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/collections" element={<CollectionPage />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
          <Route path="order/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
          <Route path="/my-order" element={<ProtectedRoute><MyOrderPages /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminHomePage />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="shop" element={<Navigate to="/admin/products" replace />} />
          <Route path="products/new" element={<EditProductPage />} />
          <Route path="products/:id/edit" element={<EditProductPage />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
      </ErrorBoundary>
    </div>
  );
};

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  return (
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ className: "store-toast" }} />
        <RouteTransition />
      </BrowserRouter>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
