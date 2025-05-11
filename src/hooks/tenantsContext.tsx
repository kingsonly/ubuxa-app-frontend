"use client"

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
    if (!tenant) return

    let isMounted = true
    setLoading(true)

    const fetchColors = async () => {
      try {
        const response = await fetch(`/api/colors?userId=${tenant.id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch colors: ${response.status}`)
        }

        const data = await response.json()

        if (isMounted) {
          setColors(data)
          updateColors(data)
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

  return (
    <TenantContext.Provider value={{ tenant, colors, loading, login }}>
      {children}
    </TenantContext.Provider>
  );

}
