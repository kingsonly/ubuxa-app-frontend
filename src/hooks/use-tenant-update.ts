"use client"

import { useState } from "react"
import { useTenantApi } from "@/utils/tenant-api"


export const useTenantUpdate = () => {
    const { updateTenant } = useTenantApi()
    const [isLoading, setIsLoading] = useState(false)

    const handleTenantUpdate = async (
        tenantId: string,
        updateData: any,
        options?: {
            onSuccess?: (data: any) => void
            onError?: (error: any) => void
            successMessage?: string
        },
    ) => {
        setIsLoading(true)

        try {
            const response = await updateTenant(tenantId, updateData)



            if (options?.onSuccess) {
                options.onSuccess(response.data)
            }

            return response.data
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to update tenant"

            console.log("Error updating tenant:", errorMessage)

            if (options?.onError) {
                options.onError(error)
            }

            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return {
        handleTenantUpdate,
        isLoading,
    }
}
