import React, { useEffect, useMemo } from "react";
import { Navigate, useLocation, Outlet, matchPath } from "react-router-dom";
import useTokens from "../hooks/useTokens";
import { toast } from "react-toastify";

const ProtectedRouteWrapper: React.FC = () => {
  const { token, tenant } = useTokens();
  const location = useLocation();
  const unprotectedRoutes = useMemo(
    () => [
      "/",
      "/login",
      "/create-password/:id/:token",
      "/reset-password/:id/:token",
    ],
    []
  );
  const checkTenantStatus = () => {
    if (tenant && tenant?.status !== "ACTIVE") {
      const selfHandledRoutes = ["/onboarding", "/deactivated"];
      if (selfHandledRoutes.includes(location.pathname)) return null;
      switch (tenant?.status) {
        case "DEACTIVATED":
          return <Navigate to={"/deactivated"} replace />
        default:
          return <Navigate to={"/onboarding"} replace />
      }
    }
  }
  useEffect(() => {
    if (
      !token &&
      !unprotectedRoutes.some((route) => matchPath(route, location.pathname))
    ) {
      const toastId = toast.warning("You are not logged in!");
      return () => toast.dismiss(toastId);
    }
  }, [token, location.pathname, unprotectedRoutes]);

  // If not authenticated and trying to access protected route, redirect to login
  if (
    !token &&
    !unprotectedRoutes.some((route) => matchPath(route, location.pathname))
  ) {
    return (
      <Navigate
        to={`/?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }


  // check tenant status first 
  const tenantRedirect = checkTenantStatus();
  if (tenantRedirect) return tenantRedirect;
  // If authenticated but trying to access login page, redirect to home or saved redirect
  if (
    token &&
    unprotectedRoutes.some((route) => matchPath(route, location.pathname))
  ) {
    const redirectPath = sessionStorage.getItem("redirect") || "/home";
    sessionStorage.removeItem("redirect");
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise, render the protected content
  return <Outlet />;
};

export default ProtectedRouteWrapper;
