import { useApiCall } from "@/utils/useApiCall"

export const useTenantApi = () => {
    const { apiCall } = useApiCall()

    const updateTenant = async (
        tenantId: string,
        updateData: {
            logoUrl?: File
            domainUrl?: string
            theme?: {
                primary: string
                buttonText: string
                accent: string
                secondary: string
            }
            useCustomDomain?: boolean
            status?: string
            [key: string]: any
        },
    ) => {
        const formData = new FormData()
        formData.append("status", "ONBOARD_ROLE")
        // Handle file upload
        if (updateData.logoUrl instanceof File) {
            formData.append("logoUrl", updateData.logoUrl)
        }

        // Append other form fields
        Object.entries(updateData).forEach(([key, value]) => {

            if (key !== "logoUrl" && value !== undefined && value !== null) {
                if (typeof value === "object") {

                    // For nested objects like theme, stringify them
                    formData.append(key, JSON.stringify(value))

                } else {
                    formData.append(key, String(value))
                }
            }
        })

        try {

            const response = await apiCall({
                endpoint: `/v1/tenants/tenant-update/${tenantId}`,
                method: "patch",
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                successMessage: "Tenant updated successfully!",
            })

            return response
        } catch (error) {
            console.error("Failed to update tenant:", error)
            throw error
        }
    }

    return {
        updateTenant,
    }
}
