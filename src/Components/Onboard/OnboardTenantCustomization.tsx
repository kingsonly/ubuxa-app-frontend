"use client"

import type React from "react"
import { useState } from "react"
import { z } from "zod"
import { Palette, Upload, Globe, ArrowRight } from "lucide-react"
import { Input } from "@/Components/InputComponent/Input"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { useApiCall } from "@/utils/useApiCall"
import useTokens from "@/hooks/useTokens"
import { useTenantApi } from "@/utils/tenant-api"
const customizationSchema = z.object({
    logoUrl: z.string().optional(),
    domainUrl: z.string().min(1, "Domain is required"),
    theme: z.object({
        primary: z.string().min(1, "Primary color is required"),
        buttonText: z.string().min(1, "Button text color is required"),
        accent: z.string().min(1, "Accent color is required"),
        secondary: z.string().min(1, "Secondary color is required"),
    }),
    useCustomDomain: z.boolean(),
})

type CustomizationFormData = z.infer<typeof customizationSchema>

const OnboardTenantCustomization = ({ updateTenantStatus }: { updateTenantStatus: (status: string) => void }) => {
    const { apiCall } = useApiCall()
    const { tenant } = useTokens()
    const { updateTenant } = useTenantApi()
    const [formData, setFormData] = useState<CustomizationFormData>({
        logoUrl: "",
        domainUrl: "",
        theme: {
            primary: "#3B82F6",
            buttonText: "#FFFFFF",
            accent: "#10B981",
            secondary: "#8B5CF6",
        },
        useCustomDomain: false,
    })
    const [loading, setLoading] = useState(false)
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([])
    const [apiError, setApiError] = useState<string | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>("")

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setFormErrors((prev) => prev.filter((error) => error.path[0] !== name))
        setApiError(null)
    }

    const handleThemeChange = (colorKey: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            theme: { ...prev.theme, [colorKey]: value },
        }))
        setFormErrors((prev) => prev.filter((error) => error.path[0] !== `theme.${colorKey}`))
        setApiError(null)
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                setLogoPreview(result)
                setFormData((prev) => ({ ...prev, logoUrl: result }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const updateData: any = {
                ...formData,
                domainUrl: formData.useCustomDomain ? formData.domainUrl : `${formData.domainUrl}.ubuxa.ng`,
            }

            // Add logo file if selected
            if (logoFile) {
                updateData.logoUrl = logoFile
            }

            const response = await updateTenant(tenant?.id, updateData)

            if (response) {
                updateTenantStatus("ONBOARD_ROLE")
            }
        } catch (error: any) {

        } finally {
            setLoading(false)
        }
    }

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault()
    //     setLoading(true)

    //     try {
    //         const updateFormData = new FormData()

    //         // Handle file upload

    //         const validatedData = customizationSchema.parse(formData)

    //         // Prepare domain URL
    //         const finalDomainUrl = formData.useCustomDomain ? validatedData.domainUrl : `${validatedData.domainUrl}.ubuxa.ng`

    //         if (validatedData.logoUrl as any instanceof File) {
    //             updateFormData.append("logoUrl", updateData.logoUrl)
    //         }

    //         await apiCall({
    //             endpoint: `/v1/tenants/tenant-update/${tenant?.id}`,
    //             method: "put",
    //             data: {
    //                 ...validatedData,
    //                 domainUrl: finalDomainUrl,
    //                 status: "ONBOARD_ROLE",
    //             },
    //             successMessage: "Customization saved successfully!",
    //         })

    //         updateTenantStatus("ONBOARD_ROLE")
    //     } catch (error: any) {
    //         if (error instanceof z.ZodError) {
    //             setFormErrors(error.issues)
    //         } else {
    //             const message = error?.response?.data?.message || "Failed to save customization"
    //             setApiError(message)
    //         }
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    const handleSkip = async () => {
        setLoading(true)
        try {
            await apiCall({
                endpoint: "/v1/tenant/status",
                method: "put",
                data: { status: "ONBOARD_ROLE" },
                successMessage: "Skipped customization",
            })
            updateTenantStatus("ONBOARD_ROLE")
        } catch (error) {
            console.error("Failed to skip step:", error)
        } finally {
            setLoading(false)
        }
    }

    const getFieldError = (fieldName: string) => {
        return formErrors.find((error) => error.path.join(".") === fieldName)?.message
    }

    const isFormFilled = customizationSchema.safeParse(formData).success

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Palette className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Customize Your Brand</h3>
                        <p className="text-sm text-gray-600">Make your workspace uniquely yours</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Logo Upload */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
                        <Upload className="h-4 w-4" />
                        <span>Logo Upload</span>
                    </h4>

                    <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview || "/placeholder.svg"}
                                        alt="Logo preview"
                                        className="w-full h-full object-contain rounded-lg"
                                    />
                                ) : (
                                    <Upload className="h-8 w-8 text-gray-400" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1">
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                            <label
                                htmlFor="logo-upload"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Choose Logo
                            </label>
                            <p className="mt-2 text-xs text-gray-500">PNG, JPG up to 2MB</p>
                        </div>
                    </div>
                </div>

                {/* Domain Configuration */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>Domain Setup</span>
                    </h4>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Switch
                                checked={formData.useCustomDomain}
                                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, useCustomDomain: checked }))}
                            />
                            <label className="text-sm font-medium text-gray-700">Use custom domain</label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    name="domainUrl"
                                    label={formData.useCustomDomain ? "CUSTOM DOMAIN" : "SUBDOMAIN"}
                                    value={formData.domainUrl}
                                    onChange={handleInputChange}
                                    placeholder={formData.useCustomDomain ? "yourdomain.com" : "yourcompany"}
                                    required={true}
                                    errorMessage={getFieldError("domainUrl")}
                                />
                            </div>
                            {!formData.useCustomDomain && (
                                <div className="flex items-center text-sm text-gray-500 mt-6">.ubuxa.ng</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Theme Colors */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Brand Colors</h4>

                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(formData.theme).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        value={value}
                                        onChange={(e) => handleThemeChange(key, e.target.value)}
                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleThemeChange(key, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="#000000"
                                    />
                                </div>
                                {getFieldError(`theme.${key}`) && (
                                    <p className="text-sm text-red-600">{getFieldError(`theme.${key}`)}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Preview</h4>
                    <div
                        className="p-6 rounded-lg border-2 border-dashed border-gray-300"
                        style={{ backgroundColor: `${formData.theme.primary}10` }}
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            {logoPreview && <img src={logoPreview || "/placeholder.svg"} alt="Logo" className="h-8 w-auto" />}
                            <div>
                                <h5 className="font-semibold" style={{ color: formData.theme.primary }}>
                                    Your Company
                                </h5>
                                <p className="text-sm text-gray-600">
                                    {formData.useCustomDomain ? formData.domainUrl : `${formData.domainUrl}.ubuxa.ng`}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="px-4 py-2 rounded-md text-sm font-medium"
                            style={{
                                backgroundColor: formData.theme.primary,
                                color: formData.theme.buttonText,
                            }}
                        >
                            Sample Button
                        </button>
                    </div>
                </div>

                {/* API Error */}
                {apiError && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{apiError}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6">
                    <Button type="button" variant="outline" onClick={handleSkip} disabled={loading} className="px-6">
                        Skip for now
                    </Button>

                    <Button type="submit" disabled={!isFormFilled || loading} className="px-8 flex items-center space-x-2">
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Continue</span>
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default OnboardTenantCustomization
