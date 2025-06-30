import type React from "react"

export interface EAASDetails {
    costOfPowerDaily: number
    costOfOneTimeInstallation: number
    numberOfDaysPowerAfterInstallation: number
    maximumIdleDays: number
    maximumIdleDaysSequence: "MONTHLY" | "YEARLY" | "LIFETIME"
}
interface EAASDetailsFormProps {
    value: EAASDetails
    onChange: (eaasDetails: EAASDetails) => void
    errorMessage?: string
    required?: boolean
    label?: string
}

export const EAASDetailsForm: React.FC<EAASDetailsFormProps> = ({
    value,
    onChange,
    errorMessage,
    required = false,
    label = "ENERGY AS A SERVICE (EAAS) DETAILS",
}) => {
    const handleFieldChange = (field: keyof EAASDetails, newValue: string | number) => {
        onChange({
            ...value,
            [field]: typeof value[field] === "number" ? Number(newValue) : newValue,
        })
    }

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-textBlack">{label}</label>
                {required && <span className="text-red-500">*</span>}
            </div>

            <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-700">Daily Power Cost (₦)</label>
                        <input
                            type="number"
                            value={value.costOfPowerDaily}
                            onChange={(e) => handleFieldChange("costOfPowerDaily", e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorMessage ? "border-red-500" : "border-strokeGreyThree"
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-700">One-Time Installation Cost (₦)</label>
                        <input
                            type="number"
                            value={value.costOfOneTimeInstallation}
                            onChange={(e) => handleFieldChange("costOfOneTimeInstallation", e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorMessage ? "border-red-500" : "border-strokeGreyThree"
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-700">Free Power Days After Installation</label>
                        <input
                            type="number"
                            value={value.numberOfDaysPowerAfterInstallation}
                            onChange={(e) => handleFieldChange("numberOfDaysPowerAfterInstallation", e.target.value)}
                            placeholder="0"
                            min="0"
                            className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorMessage ? "border-red-500" : "border-strokeGreyThree"
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-700">Maximum Idle Days</label>
                        <input
                            type="number"
                            value={value.maximumIdleDays}
                            onChange={(e) => handleFieldChange("maximumIdleDays", e.target.value)}
                            placeholder="0"
                            min="1"
                            className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorMessage ? "border-red-500" : "border-strokeGreyThree"
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-700">Idle Days Reset Sequence</label>
                        <select
                            value={value.maximumIdleDaysSequence}
                            onChange={(e) =>
                                handleFieldChange("maximumIdleDaysSequence", e.target.value as "MONTHLY" | "YEARLY" | "LIFETIME")
                            }
                            className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorMessage ? "border-red-500" : "border-strokeGreyThree"
                                }`}
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                            <option value="LIFETIME">Lifetime</option>
                        </select>
                    </div>
                </div>

                <div className="text-xs text-gray-600 bg-white p-3 rounded border-l-4 border-blue-400">
                    <p className="font-medium mb-1">EAAS Information:</p>
                    <ul className="space-y-1 text-xs">
                        <li>• Monthly: Idle days counter resets every month</li>
                        <li>• Yearly: Idle days counter resets every year</li>
                        <li>• Lifetime: Idle days never reset, permanent tracking</li>
                    </ul>
                </div>
            </div>

            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        </div>
    )
}
