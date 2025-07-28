import type React from "react"
import { z } from "zod"
import { FileInput, ModalInput, ToggleInput } from "../InputComponent/Input"
import { useEffect, useState } from "react"
import { RiDeleteBin5Fill } from "react-icons/ri"
import roletwo from "../../assets/table/roletwo.svg";
import SelectDeviceInventoryModal from "./SelectDeviceInventoryModal"
import { DeviceStore } from "@/stores/DeviceStore"
import { observer } from "mobx-react-lite"
import { RxFilePlus } from "react-icons/rx"
import InfoTooltip from "../Info/InfoTooltip"
import { infoMessages } from "@/lib/infoMessages"
interface UploadDeviceFormProps {
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
const UploadDeviceFormSchema = z
    .object({
        isTokenable: z.boolean(),
        inventoryId: z.string().min(1, "Please select an inventory"),
        restrictedDigitMode: z.boolean(),
        devicesFile: z
            .instanceof(File, { message: "Devices file is required" })
            .refine(
                (file) =>
                    ["csv", "xlsx"].includes(
                        file.name.split(".").pop()?.toLowerCase() || ""
                    ),
                { message: "Only .csv and .xlsx files are allowed." }
            )
    })


const UploadDeviceForm: React.FC<UploadDeviceFormProps> = observer(({
    formData,
    onFormDataChange,
    formErrors,
    onValidationChange,
}) => {
    const [isCustomerProductModalOpen, setIsCustomerProductModalOpen] =
        useState<boolean>(false);
    useEffect(() => {
        updateInventoryId()

    }, [DeviceStore.selectedInventory])
    const selectedInventory = DeviceStore.selectedInventory;

    const handleFileChange = (e: {
        target: { name: any; value: any; files: any }
    }) => {
        const { name, files } = e.target
        if (files && files.length > 0) {
            const fileData = { ...formData, [name]: files[0] }
            // const fileData = { [name]: files[0] }
            // Validate just the file field

            const result = UploadDeviceFormSchema.safeParse(fileData)
            onValidationChange(result.success)
            onFormDataChange(fileData)
        }

    }

    const updateInventoryId = () => {
        const updatedFormData = { ...formData, inventoryId: DeviceStore.selectedInventory?.productId }

        // Validate the form
        const result = UploadDeviceFormSchema.safeParse(updatedFormData)
        onValidationChange(result.success)
        onFormDataChange(updatedFormData)
    }

    const handleToggleChange = (fieldName: string, checked: boolean) => {
        const updatedFormData = { ...formData, [fieldName]: checked }

        // Validate the form
        const result = UploadDeviceFormSchema.safeParse(updatedFormData)
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
            <FileInput
                name="devicesFile"
                label="Devices File"
                onChange={handleFileChange}
                required={true}
                accept=".csv,.xlsx"
                placeholder="Upload Device File"
                errorMessage={getFieldError("devicesFile")}
                iconRight={<RxFilePlus color="black" title="Upload File" />}
                description="Only .csv and .xlsx files are allowed"
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
                            <div className="relative flex items-center gap-1 w-max">
                                <img src={roletwo} alt="Icon" width="30px" />
                                <span className="bg-[#EFF2FF] px-3 py-1.5 rounded-full text-xs font-bold text-textDarkGrey capitalize">
                                    {selectedInventory?.productName}
                                </span>
                                <span
                                    className="flex items-center justify-center w-7 h-7 bg-white cursor-pointer border-[0.6px] border-strokeGreyTwo rounded-full transition-all hover:opacity-50"
                                    title="Remove Inventory"
                                    onClick={() => {
                                        DeviceStore.unsetInventory()
                                    }}
                                >
                                    <RiDeleteBin5Fill color="#FC4C5D" />
                                </span>
                            </div>
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

export { UploadDeviceForm, UploadDeviceFormSchema }
