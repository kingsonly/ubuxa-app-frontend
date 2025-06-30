"use client"

import { useState } from "react"
import { UserPlus, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "../ui/button"
import { useApiCall, useGetRequest } from "@/utils/useApiCall"
import CreateNewUserModal from "../Settings/CreateNewUserModal"
import useTokens from "@/hooks/useTokens"

const OnboardTenantUserInvitation = ({ updateTenantStatus }: { updateTenantStatus: (status: string) => void }) => {
    const { apiCall } = useApiCall()
    const { tenant } = useTokens()
    const [loading, setLoading] = useState(false)
    const [showUserCreation, setShowUserCreation] = useState(false)
    // const currentPage = 1;
    // const entriesPerPage = 20;
    // const tableQueryParams: Record<string, any> | null = {};
    // const queryString = Object.entries(tableQueryParams || {})
    //     .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    //     .join("&");
    const fetchAllRoles = useGetRequest("/v1/roles", true, 60000);
    // const fetchAllUsers = useGetRequest(
    //     `/v1/users?page=${currentPage}&limit=${entriesPerPage}${queryString && `&${queryString}`
    //     }`,
    //     true,
    //     60000
    // );


    // const handleFinish = async () => {

    //     try {
    //         updateTenantStatus("ACTIVE")
    //     } catch (error) {
    //         console.error("Failed to continue:", error)
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    const handleSkip = async () => {
        setLoading(true)
        try {
            await apiCall({
                endpoint: `/v1/tenants/tenant-update/${tenant?.id}`,
                method: "patch",
                data: { status: "ONBOARD_STORE_TYPE" },
                successMessage: "You can invite team members later.",
            })
            updateTenantStatus("ONBOARD_STORE_TYPE")
        } catch (error) {
            console.error("Failed to skip step:", error)
        } finally {
            setLoading(false)
        }
    }



    const rolesList = fetchAllRoles.data?.map((item: any) => ({
        label: item.role,
        value: item.id,
    }));

    return (
        <>
            {!showUserCreation ?
                <div className="p-6 max-w-2xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <UserPlus className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Invite Your Team</h3>
                                <p className="text-sm text-gray-600">Add team members to start collaborating</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Benefits */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-green-900 mb-2">Why invite team members now?</h4>
                            <ul className="space-y-2 text-sm text-green-800">
                                <li className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Get everyone set up and ready to work immediately</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Assign roles and permissions from the start</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Start collaborating and sharing workspaces</span>
                                </li>
                            </ul>
                        </div>


                        {/* Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols gap-4">
                            <div className="border border-gray-200 rounded-lg p-6 hover:border-primary transition-colors">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <UserPlus className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Invite Team Members</h4>
                                    <p className="text-sm text-gray-600 mb-4">Add your colleagues and assign them appropriate roles.</p>
                                    <Button onClick={() => setShowUserCreation(true)} className="w-full">
                                        Invite Users
                                    </Button>
                                </div>
                            </div>

                            {/* TODO: Still needed */}

                            {/* <div className="border border-gray-200 rounded-lg p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <ArrowRight className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Start Using Ubuxa</h4>
                                    <p className="text-sm text-gray-600 mb-4">Begin with just yourself and invite others later.</p>
                                    <Button disabled={loading} variant="outline" className="w-full">
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            "Get Started"
                                        )}
                                    </Button>
                                </div>
                            </div> */}
                        </div>



                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6">
                            <Button type="button" variant="outline" onClick={handleSkip} disabled={loading} className="px-6">
                                Skip for now
                            </Button>

                            <div className="text-sm text-gray-500">You can always invite team members later</div>
                        </div>
                    </div>

                    {/* User Creation Modal */}

                </div>
                :
                <div>
                    {showUserCreation && (
                        <div className="p-6">
                            <div className="mb-6">
                                <Button variant="outline" onClick={() => setShowUserCreation(false)} className="mb-4">
                                    ← Back to overview
                                </Button>
                            </div>

                            <CreateNewUserModal
                                // callback={handleFinish}
                                onboarding={true}
                                withoutModal={true}
                                isOpen={showUserCreation}
                                setIsOpen={setShowUserCreation}
                                rolesList={rolesList}
                                allRolesError={null}
                                allRolesErrorStates={fetchAllRoles.errorStates}
                            />


                        </div>

                    )}
                </div>

            }
        </>



    )
}

export default OnboardTenantUserInvitation
