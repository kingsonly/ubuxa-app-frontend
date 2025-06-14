"use client"

import { useEffect, useState } from "react"
import { Shield, Users } from "lucide-react"
import { Button } from "../ui/button"
import { useApiCall } from "@/utils/useApiCall"
import EditPermissions from "../Settings/EditPermissions"
import useTokens from "@/hooks/useTokens"
import { useTenant } from "@/Context/tenantsContext"
import Cookies from "js-cookie"
// import { useTenantCustomization } from "@/hooks/useTenantCustomization"
// import { useTenant } from "@/Context/tenantsContext"


const OnboardTenantRoleCreation = ({ updateTenantStatus }: { updateTenantStatus: (status: string) => void }) => {
    const { apiCall } = useApiCall()
    const { tenant } = useTokens()
    const [loading, setLoading] = useState(false)
    const [showRoleCreation, setShowRoleCreation] = useState(false)
    // const fetchAllRoles = useGetRequest("/v1/roles", true, 60000);
    // const { tenantInfo: activeTenant, loading: tenantLoading } = useTenantCustomization()
    const { login: setTenantContext } = useTenant()


    useEffect(() => {

        setCustomization()
    }, [])

    const setCustomization = async () => {
        const response = await apiCall({
            endpoint: `/v1/tenants/${tenant.id}`,
            method: "get",
            showToast: false
        })
        setTenantContext(response.data)
        const userData = JSON.parse(Cookies.get("userData") || "{}")
        userData.tenant.theme = response.data.theme
        Cookies.set("userData", JSON.stringify(userData), {
            expires: 7,
            path: "/",
            sameSite: "Lax",
        })
    }

    const handleContinue = async () => {
        setLoading(true)
        try {
            // await apiCall({
            //     endpoint: "/v1/tenant/status",
            //     method: "put",
            //     data: { status: "ONBOARD_TEAMMATE" },
            //     successMessage: "Roles configured successfully!",
            // })
            updateTenantStatus("ONBOARD_TEAMMATE")
        } catch (error) {
            console.error("Failed to continue:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = async () => {
        setLoading(true)
        try {
            await apiCall({
                endpoint: `/v1/tenants/tenant-update/${tenant?.id}`,
                method: "patch",
                data: { status: "ONBOARD_TEAMMATE" },
                successMessage: "Skipped role creation",
            })
            updateTenantStatus("ONBOARD_TEAMMATE")
        } catch (error) {
            console.error("Failed to skip step:", error)
        } finally {
            setLoading(false)
        }
    }

    if (showRoleCreation) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => setShowRoleCreation(false)} className="mb-4">
                        ← Back to overview
                    </Button>
                </div>

                <EditPermissions onboarding={true} setIsOpen={setShowRoleCreation} callback={handleContinue} />


            </div>
        )
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Roles & Permissions</h3>
                        <p className="text-sm text-gray-600">Control who can access what in your workspace</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Overview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">Why set up roles?</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Control access to sensitive features like financial data and user management</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Ensure team members only see what they need for their job</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Maintain security and compliance standards</span>
                        </li>
                    </ul>
                </div>

                {/* Default Roles Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Default Roles</h4>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-900">Admin</h5>
                                <p className="text-sm text-gray-600">Full access to all features and settings</p>
                            </div>
                        </div>




                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-primary transition-colors">
                        <h4 className="font-semibold text-gray-900 mb-2">Create Custom Roles</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Set up specific roles with custom permissions for your team structure.
                        </p>
                        <Button onClick={() => setShowRoleCreation(true)} variant="outline" className="w-full hover:bg-customSecondary bg-customPrimary text-customButtonText hover:text-customButtonText">
                            Create Roles
                        </Button>
                    </div>


                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6">
                    <Button type="button" variant="outline" onClick={handleSkip} disabled={loading} className="px-6">
                        Skip for now
                    </Button>

                    <div className="text-sm text-gray-500">You can always modify roles later in settings</div>
                </div>
            </div>
        </div>
    )
}

export default OnboardTenantRoleCreation
