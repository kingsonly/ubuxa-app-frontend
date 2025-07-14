"use client"

import type React from "react"
import { LuPlus, LuMinus } from "react-icons/lu"
import { Tag } from "./ProductDetails"

export interface ProductCapacity {
    facility: string
    value: number
}
interface ProductCapacityFormProps {
    value: ProductCapacity[]
    onChange: (capacity: ProductCapacity[]) => void
    errorMessage?: string
    required?: boolean
    label?: string
}

const facilityOptions = [
    { value: "rooms", label: "Rooms" },
    { value: "bulbs", label: "Bulbs" },
    { value: "air_conditioners", label: "Air Conditioners" },
    { value: "fans", label: "Fans" },
    { value: "refrigerators", label: "Refrigerators" },
    { value: "tvs", label: "TVs" },
    { value: "laptops", label: "Laptops" },
    { value: "phone_chargers", label: "Phone Chargers" },
]

export const ProductCapacityForm: React.FC<ProductCapacityFormProps> = ({
    value,
    onChange,
    errorMessage,
    required = false,
    label = "PRODUCT CAPACITY",
}) => {
    const handleCapacityChange = (index: number, field: "facility" | "value", newValue: string | number) => {
        const updatedCapacity = [...value]
        updatedCapacity[index] = {
            ...updatedCapacity[index],
            [field]: field === "value" ? Number(newValue) : newValue,
        }
        onChange(updatedCapacity)
    }

    const addCapacityField = () => {
        onChange([...value, { facility: "", value: 0 }])
    }

    const removeCapacityField = (index: number) => {
        if (value.length > 1) {
            const updatedCapacity = value.filter((_, i) => i !== index)
            onChange(updatedCapacity)
        }
    }

    return (
        <div className="flex flex-col w-full gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Tag name={label} variant="ink" />
                    {/* <label className="text-sm font-medium text-textBlack">{label}</label> */}
                    {required && <span className="text-red-500">*</span>}
                </div>
                <button
                    type="button"
                    onClick={addCapacityField}
                    className="flex gap-1 h-8 px-3 bg-transparent border-strokeGreyThree"
                >
                    <LuPlus className="h-4 w-4" />
                    <span className="ml-1 text-xs">Add</span>
                </button>
            </div>

            <div className="space-y-3">
                {value.map((capacity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <select
                                value={capacity.facility}
                                onChange={(e) => handleCapacityChange(index, "facility", e.target.value)}
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorMessage ? "border-red-500" : "border-strokeGreyThree"
                                    }`}
                            >
                                <option value="">Select Facility</option>
                                {facilityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-24">
                            <input
                                type="number"
                                value={capacity.value}
                                onChange={(e) => handleCapacityChange(index, "value", e.target.value)}
                                placeholder="Max"
                                min="0"
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorMessage ? "border-red-500" : "border-strokeGreyThree"
                                    }`}
                            />
                        </div>

                        {value.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeCapacityField(index)}
                                className="h-8 w-8 p-0 border-red-300 text-red-500 hover:bg-red-50"
                            >
                                <LuMinus className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        </div>
    )
}
