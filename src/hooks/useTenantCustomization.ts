import { useEffect, useState } from "react";
import { useApiCall } from "@/utils/useApiCall";
import { z } from "zod";
import { useTenant } from "@/Context/tenantsContext"

// Define schema for tenant data validation
const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Add other fields you expect from the tenant response
  // Example:
  // logo: z.string().optional(),
  // theme: z.object({ primaryColor: z.string() }).optional(),
});

type TenantInfo = z.infer<typeof tenantSchema>;

export function useTenantCustomization() {
  const { apiCall } = useApiCall();
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { login: setTenantContext} = useTenant();

  function getTenantIdentifier() {
    return window.location.hostname;
  }

  useEffect(() => {
    const tenantIdentifier = getTenantIdentifier();

    async function fetchTenantInfo() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiCall({
          endpoint: `/v1/tenants/get-tenant-by-url/${tenantIdentifier}`,
          method: "get",
          // You can add successMessage if needed
        });
       
        // Validate the response data with Zod
       // const validatedData = tenantSchema.parse(response.data);
        setTenantInfo(response.data);
        setTenantContext(response.data)
        console.log("I am the new tenant",response.data)
      } catch (err: any) {
        if (err instanceof z.ZodError) {
          setError("Invalid tenant data format");
        } else {
          const message =
            err?.response?.data?.message ||
            "Failed to fetch tenant information";
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTenantInfo();
  }, []);

  return { tenantInfo, loading, error };
}