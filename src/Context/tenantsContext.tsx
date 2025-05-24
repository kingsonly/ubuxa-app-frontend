"use client"

import Cookies from "js-cookie"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"

// Define the shape of your context
interface TenantContextType {
  tenant: any
  colors: any
  loading: boolean
  login: (tenantData: any) => void
}

// Helper to apply CSS variables
const updateColors = (colors: any) => {
  if (!colors) return;

  Object.keys(colors).forEach((color) => {
    const value = colors[color];
    if (value !== undefined && value !== null && value !== '') {
      document.documentElement.style.setProperty(`--${color}`, value);
    }
  });
};

// const updateColors = (colors: any) => {
//   if (!colors) return

//   Object.keys(colors).forEach((color) => {
//     document.documentElement.style.setProperty(`--${color}`, colors[color])
//   })
// }

// Default value to avoid runtime issues
const defaultContextValue: TenantContextType = {
  tenant: null,
  colors: null,
  loading: false,
  login: () => { },
}

// Create context with default value
const TenantContext = createContext<TenantContextType>(defaultContextValue)

// Custom hook
export const useTenant = () => useContext(TenantContext)

// Provider component
export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<any>(null)
  const [colors, setColors] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const userData = Cookies.get("userData")
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        if (parsed?.tenant?.theme) {
          setTenant(parsed.tenant)
        }
      } catch (err) {
        console.error("Failed to parse userData cookie:", err)
      }
    }
  }, [])

  useEffect(() => {
    if (!tenant) return

    let isMounted = true
    setLoading(true)

    const fetchColors = async () => {
      try {
        if (isMounted) {
          setColors(tenant.theme)
          updateColors(tenant.theme)
          setFavicon(tenant.logoUrl)
        }
      } catch (error) {
        console.error("Error fetching colors:", error)
        // You might want to set some default colors here
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchColors()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [tenant])

  const login = (tenantData: any) => {
    setTenant(tenantData)
  }

  function setFavicon(href: string) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    link.href = href;
  }

  return (
    <TenantContext.Provider value={{ tenant, colors, loading, login }}>
      {children}
    </TenantContext.Provider>
  );

}
