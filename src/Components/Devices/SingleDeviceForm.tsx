import type React from "react"
import { z } from "zod"
import { Input, ModalInput, ToggleInput } from "../InputComponent/Input"
import { useEffect, useState } from "react"
import SelectDeviceInventoryModal from "./SelectDeviceInventoryModal"
import { DeviceStore } from "@/stores/DeviceStore"
import { observer } from "mobx-react-lite"
import { infoMessages } from "@/lib/infoMessages"
import InfoTooltip from "../Info/InfoTooltip"
import { CardComponent } from "../CardComponents/CardComponent"
interface SingleDeviceFormProps {
    formData: {
        serialNumber: string
        key: string
        startingCode: string
        count: string
        timeDivider: string
        restrictedDigitMode: boolean
        hardwareModel: string
        firmwareVersion: string
        isTokenable: boolean
    }
    onFormDataChange: (data: any) => void
    formErrors: z.ZodIssue[]
    onValidationChange: (isValid: boolean) => void
}

// Updated schema with conditional validation
const SingleDeviceFormSchema = z
    .object({
        isTokenable: z.boolean(),
        inventoryId: z.string().min(1, "Please select an inventory"),
        serialNumber: z.string().trim().min(1, "Serial number is required"),
        key: z.string().optional(),
        startingCode: z.string().optional(),
        count: z
            .string()
            .trim()
            .optional()
            .refine((val) => !val || /^\d+$/.test(val), {
                message: "Device Count must be a valid integer",
            })
            .transform((val) => (val ? Number(val).toString() : val)),
        timeDivider: z.string().optional(),
        restrictedDigitMode: z.boolean(),
        hardwareModel: z.string().optional(),
        firmwareVersion: z.string().optional(),
    })
    .refine(
        (data) => {
            // If device is tokenable, key is required
            if (data.isTokenable && (!data.key || data.key.trim() === "")) {
                return false
            }
            return true
        },
        {
            message: "Key is required when device is tokenable",
            path: ["key"],
        },
    )

const SingleDeviceForm: React.FC<SingleDeviceFormProps> = observer(({
    formData,
    onFormDataChange,
    formErrors,
    onValidationChange,
}) => {
    const [isCustomerProductModalOpen, setIsCustomerProductModalOpen] =
        useState<boolean>(false);
    useEffect(() => {
        console.log("DeviceStore.selectedInventory", DeviceStore.selectedInventory?.productImage)
        updateInventoryId()

    }, [DeviceStore.selectedInventory])
    const selectedInventory = DeviceStore.selectedInventory;
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        const updatedFormData = { ...formData, [name]: value }

        // Validate the form
        const result = SingleDeviceFormSchema.safeParse(updatedFormData)
        onValidationChange(result.success)

        onFormDataChange(updatedFormData)
    }
    const updateInventoryId = () => {
        const updatedFormData = { ...formData, inventoryId: DeviceStore.selectedInventory?.productId }

        // Validate the form
        const result = SingleDeviceFormSchema.safeParse(updatedFormData)
        onValidationChange(result.success)
        onFormDataChange(updatedFormData)
    }

    const handleToggleChange = (fieldName: string, checked: boolean) => {
        const updatedFormData = { ...formData, [fieldName]: checked }

        // Validate the form
        const result = SingleDeviceFormSchema.safeParse(updatedFormData)
        onValidationChange(result.success)

        onFormDataChange(updatedFormData)
    }

    const getFieldError = (fieldName: string) => {
        return formErrors.find((error) => error.path[0] === fieldName)?.message
    }

    return (
        <>
            {/* Is Device Tokenable - First field */}
            <div className="flex items-center justify-between gap-2 w-full">
                <label className="text-sm text-textBlack font-semibold flex gap-1"><span className="">Is Device Tokenable</span> <InfoTooltip message={infoMessages.device.isTokenable} /></label>
                <div className="flex items-center">
                    <ToggleInput
                        defaultChecked={formData.isTokenable}
                        onChange={(checked: boolean) => {
                            handleToggleChange("isTokenable", checked)
                        }}
                    />
                    <span className="flex items-center justify-center gap-0.5 bg-[#F6F8FA] px-2 h-6 rounded-full text-xs font-medium capitalize border-[0.6px] border-strokeGreyTwo">
                        {formData.isTokenable ? <span className='text-green-500'>YES</span> : <span className='text-errorTwo'>NO</span>}
                    </span>
                </div>
            </div>

            {/* Serial Number - Second field */}
            <Input
                type="text"
                name="serialNumber"
                label="Serial Number"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="Enter Serial Number"
                required={true}
                errorMessage={getFieldError("serialNumber")}
            />
            {/* Inventory field */}
            <ModalInput
                type="button"
                name="inventoryId"
                label="Inventory"
                onClick={() => {
                    setIsCustomerProductModalOpen(true);
                }}
                placeholder="Select Inventory"
                required={true}
                isItemsSelected={Boolean(selectedInventory?.productId)}
                itemsSelected={
                    <div className="w-full">
                        {selectedInventory?.productId && (
                            <CardComponent
                                variant="deviceInventory"
                                productImage={selectedInventory.productImage}
                                productName={selectedInventory.productName}

                            />
                        )}
                    </div>
                }
                errorMessage={
                    getFieldError("inventoryId")
                }
            />
            <SelectDeviceInventoryModal
                isModalOpen={isCustomerProductModalOpen}
                setModalOpen={setIsCustomerProductModalOpen}
            />

            {/* Conditional fields - only show if device is tokenable */}
            {formData.isTokenable && (
                <>
                    <Input
                        type="text"
                        name="key"
                        label="Key"
                        value={formData.key}
                        onChange={handleInputChange}
                        placeholder="Enter Key"
                        required={true}
                        errorMessage={getFieldError("key")}
                    />

                    <Input
                        type="text"
                        name="startingCode"
                        label="Starting Code"
                        value={formData.startingCode}
                        onChange={handleInputChange}
                        placeholder="Enter Starting Code"
                        required={false}
                        errorMessage={getFieldError("startingCode")}
                    />

                    <Input
                        type="number"
                        name="count"
                        label="Count"
                        value={formData.count || ""}
                        onChange={handleInputChange}
                        placeholder="Enter Count"
                        required={false}
                        errorMessage={getFieldError("count")}
                    />

                    <Input
                        type="number"
                        name="timeDivider"
                        label="Time Divider"
                        value={formData.timeDivider}
                        onChange={handleInputChange}
                        placeholder="Enter Time Divider"
                        required={false}
                        min={1}
                        errorMessage={getFieldError("timeDivider")}
                    />

                    <Input
                        type="text"
                        name="hardwareModel"
                        label="Hardware Model"
                        value={formData.hardwareModel}
                        onChange={handleInputChange}
                        placeholder="Enter Hardware Model"
                        required={false}
                        errorMessage={getFieldError("hardwareModel")}
                    />

                    <Input
                        type="text"
                        name="firmwareVersion"
                        label="Firmware Version"
                        value={formData.firmwareVersion}
                        onChange={handleInputChange}
                        placeholder="Enter Firmware Version"
                        required={false}
                        errorMessage={getFieldError("firmwareVersion")}
                    />

                    <div className="flex items-center justify-between gap-2 w-full">
                        <label className="text-sm text-textBlack font-semibold flex gap-1"><span className="">Restricted Digit Mode</span> <InfoTooltip message={infoMessages.device.restrictedDigitMode} /></label>

                        <div className="flex items-center">
                            <ToggleInput
                                defaultChecked={formData.restrictedDigitMode}
                                onChange={(checked: boolean) => {
                                    handleToggleChange("restrictedDigitMode", checked)
                                }}
                            />
                            <span className="flex items-center justify-center gap-0.5 bg-[#F6F8FA] px-2 h-6 rounded-full text-xs font-medium capitalize border-[0.6px] border-strokeGreyTwo">
                                {formData.restrictedDigitMode ? <span className='text-errorTwo '>Restricted</span> : <span className='text-green-500'>Unrestricted</span>}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </>
    )
})

export { SingleDeviceForm, SingleDeviceFormSchema }
