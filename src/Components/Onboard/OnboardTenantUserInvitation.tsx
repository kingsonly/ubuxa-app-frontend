// const OnboardTenantUserInvitation = () => {

//     return (
//         <>
//             OnboardTenantUserInvitation
//         </>
//     );
// };

// export default OnboardTenantUserInvitation;
"use client"

import { useState } from "react"
import { UserPlus, ArrowRight, Mail, CheckCircle } from "lucide-react"
import { Button } from "../ui/button"
import { useApiCall, useGetRequest } from "@/utils/useApiCall"
import CreateNewUserModal from "../Settings/CreateNewUserModal"
import useTokens from "@/hooks/useTokens"

const OnboardTenantUserInvitation = ({ updateTenantStatus }: { updateTenantStatus: (status: string) => void }) => {
    const { apiCall } = useApiCall()
    const { tenant } = useTokens()
    const [loading, setLoading] = useState(false)
    const [showUserCreation, setShowUserCreation] = useState(false)
    const [invitedUsers, setInvitedUsers] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
    const [tableQueryParams, setTableQueryParams] = useState<Record<
        string,
        any
    > | null>({});
    const queryString = Object.entries(tableQueryParams || {})
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
    const fetchAllRoles = useGetRequest("/v1/roles", true, 60000);
    const fetchAllUsers = useGetRequest(
        `/v1/users?page=${currentPage}&limit=${entriesPerPage}${queryString && `&${queryString}`
        }`,
        true,
        60000
    );


    const handleFinish = async () => {
        setLoading(true)
        try {
            await apiCall({
                endpoint: `/v1/tenants/tenant-update/${tenant?.id}`,
                method: "patch",
                data: { status: "ACTIVE" },
                successMessage: "Welcome to Ubuxa! Your workspace is now active.",
            })
            updateTenantStatus("ACTIVE")
        } catch (error) {
            console.error("Failed to activate tenant:", error)
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
                data: { status: "ACTIVE" },
                successMessage: "Workspace activated! You can invite team members later.",
            })
            updateTenantStatus("ACTIVE")
        } catch (error) {
            console.error("Failed to skip step:", error)
        } finally {
            setLoading(false)
        }
    }

    const mockRolesList = [
        { label: "Admin", value: "admin" },
        { label: "Manager", value: "manager" },
        { label: "User", value: "user" },
    ]

    return (
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

                {/* Invited Users List */}
                {invitedUsers.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Invited Team Members</h4>
                        <div className="space-y-3">
                            {invitedUsers.map((email, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{email}</p>
                                        <p className="text-xs text-gray-500">Invitation sent</p>
                                    </div>
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <ArrowRight className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Start Using Ubuxa</h4>
                            <p className="text-sm text-gray-600 mb-4">Begin with just yourself and invite others later.</p>
                            <Button onClick={handleFinish} disabled={loading} variant="outline" className="w-full">
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    "Get Started"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Completion Message */}
                {invitedUsers.length > 0 && (
                    <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 mb-2">
                            Great! You've invited {invitedUsers.length} team member{invitedUsers.length > 1 ? "s" : ""}
                        </h4>
                        <p className="text-sm text-blue-800 mb-4">
                            They'll receive email invitations to join your workspace. Ready to get started?
                        </p>
                        <Button onClick={handleFinish} disabled={loading} className="px-8 flex items-center space-x-2 mx-auto">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Launch Workspace</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6">
                    <Button type="button" variant="outline" onClick={handleSkip} disabled={loading} className="px-6">
                        Skip for now
                    </Button>

                    <div className="text-sm text-gray-500">You can always invite team members later</div>
                </div>
            </div>

            {/* User Creation Modal */}
            {showUserCreation && (
                <CreateNewUserModal
                    isOpen={showUserCreation}
                    setIsOpen={setShowUserCreation}
                    rolesList={mockRolesList}
                    allUsersRefresh={fetchAllUsers.mutate}
                    allRolesError={null}
                    allRolesErrorStates={fetchAllRoles.errorStates}
                />
            )}
        </div>
    )
}

export default OnboardTenantUserInvitation
