"use client"

import type React from "react"
import { useState } from "react"
import { z } from "zod"
import { CreditCard, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Input } from "@/Components/InputComponent/Input"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useApiCall } from "@/utils/useApiCall"
import { Button } from "../ui/button"
import useTokens from "@/hooks/useTokens"

const paymentSchema = z.object({
    paymentProvider: z.enum(["FLUTTERWAVE", "PAYSTACK"]),
    providerPublicKey: z.string().min(1, "Public key is required"),
    providerPrivateKey: z.string().min(1, "Private key is required"),
    webhookSecret: z.string().min(1, "Webhook secret is required"),
})

type PaymentFormData = z.infer<typeof paymentSchema>

const OnboardPaymentGateway = ({ updateTenantStatus }: { updateTenantStatus: (status: string) => void }) => {
    const { apiCall } = useApiCall()
    const { tenant } = useTokens()
    const [formData, setFormData] = useState<PaymentFormData>({
        paymentProvider: "PAYSTACK",
        providerPublicKey: "",
        providerPrivateKey: "",
        webhookSecret: "",
    })
    const [loading, setLoading] = useState(false)
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([])
    const [apiError, setApiError] = useState<string | null>(null)
    const [showPrivateKey, setShowPrivateKey] = useState(false)
    const [showWebhookSecret, setShowWebhookSecret] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setFormErrors((prev) => prev.filter((error) => error.path[0] !== name))
        setApiError(null)
    }

    const handleProviderChange = (value: string) => {
        setFormData((prev) => ({ ...prev, paymentProvider: value as any }))
        setFormErrors((prev) => prev.filter((error) => error.path[0] !== "paymentProvider"))
        setApiError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const validatedData = paymentSchema.parse(formData)

            await apiCall({
                endpoint: `/v1/tenants/tenant-update/${tenant?.id}`,
                method: "patch",
                data: {
                    ...validatedData,
                    status: "ONBOARD_CUSTOMIZATION",
                },
                successMessage: "Payment gateway configured successfully!",
            })

            updateTenantStatus("ONBOARD_CUSTOMIZATION")

        } catch (error: any) {
            if (error instanceof z.ZodError) {
                setFormErrors(error.issues)
            } else {
                const message = error?.response?.data?.message || "Failed to configure payment gateway"
                setApiError(message)
            }
        } finally {
            setLoading(false)
        }
    }



    const getFieldError = (fieldName: string) => {
        return formErrors.find((error) => error.path[0] === fieldName)?.message
    }

    const isFormFilled = paymentSchema.safeParse(formData).success

    const providerInfo = {
        PAYSTACK: {
            name: "Paystack",
            description: "Accept payments from customers across Africa",
            color: "bg-blue-500",
        },
        FLUTTERWAVE: {
            name: "Flutterwave",
            description: "Global payment infrastructure for Africa",
            color: "bg-orange-500",
        },
        // STRIPE: {
        //     name: "Stripe",
        //     description: "Global payment processing platform",
        //     color: "bg-purple-500",
        // },
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Payment Gateway</h3>
                        <p className="text-sm text-gray-600">Configure your payment provider</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Provider Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Payment Provider *</label>
                    <Select value={formData.paymentProvider} onValueChange={handleProviderChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select payment provider" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(providerInfo).map(([key, info]) => (
                                <SelectItem key={key} value={key}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
                                        <div>
                                            <div className="font-medium">{info.name}</div>
                                            <div className="text-xs text-gray-500">{info.description}</div>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {getFieldError("paymentProvider") && (
                        <p className="text-sm text-red-600">{getFieldError("paymentProvider")}</p>
                    )}
                </div>

                {/* Public Key */}
                <div className="space-y-2">
                    <Input
                        type="text"
                        name="providerPublicKey"
                        label="PUBLIC KEY"
                        value={formData.providerPublicKey}
                        onChange={handleInputChange}
                        placeholder="pk_test_..."
                        required={true}
                        errorMessage={getFieldError("providerPublicKey")}
                    />
                </div>

                {/* Private Key */}
                <div className="space-y-2">
                    <div className="relative">
                        <Input
                            type={showPrivateKey ? "text" : "password"}
                            name="providerPrivateKey"
                            label="PRIVATE KEY"
                            value={formData.providerPrivateKey}
                            onChange={handleInputChange}
                            placeholder="sk_test_..."
                            required={true}
                            errorMessage={getFieldError("providerPrivateKey")}
                            iconRight={
                                showPrivateKey ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPrivateKey(false)} />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPrivateKey(true)} />
                                )
                            }
                        />
                    </div>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-2">
                    <div className="relative">
                        <Input
                            type={showWebhookSecret ? "text" : "password"}
                            name="webhookSecret"
                            label="WEBHOOK SECRET"
                            value={formData.webhookSecret}
                            onChange={handleInputChange}
                            placeholder="whsec_..."
                            required={true}
                            errorMessage={getFieldError("webhookSecret")}
                            iconRight={
                                showWebhookSecret ? (
                                    <EyeOff
                                        className="h-5 w-5 text-gray-400 cursor-pointer"
                                        onClick={() => setShowWebhookSecret(false)}
                                    />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowWebhookSecret(true)} />
                                )
                            }
                        />
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

export default OnboardPaymentGateway
