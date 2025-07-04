import type React from "react"
import { useCallback, useEffect, useState } from "react"
import producticon from "../../assets/product-grey.svg"
import creditcardicon from "../../assets/creditcardgrey.svg"
import settingsicon from "../../assets/settings.svg"
import { NameTag, ProductTag } from "../CardComponents/CardComponent"
import { formatDateTime, formatNumberWithCommas } from "../../utils/helpers"
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent"
import { ProductDescriptionInput, SelectMultipleInput, SmallFileInput } from "../InputComponent/Input"
import { LuImagePlus } from "react-icons/lu"
import type { KeyedMutator } from "swr"
import { useApiCall } from "@/utils/useApiCall"
import type { Category } from "./CreateNewProduct"
import { ProductCapacityForm } from "./ProductCapacityForm"
import { EAASDetailsForm } from "./EAASDetailsForm"
import { z } from "zod"
import ApiErrorMessage from "../ApiErrorMessage"
import InfoTooltip from "../Info/InfoTooltip"


interface ProductDetailsProps {
  productId: string
  categoryId: string
  productImage: string
  productName: string
  productTag: string
  productPrice: {
    minimumInventoryBatchPrice: number
    maximumInventoryBatchPrice: number
  }
  paymentModes: string[] | string
  datetime: string
  name: string
  displayInputState?: boolean
  refreshTable: KeyedMutator<any>
  description?: string
  productCapacity?: ProductCapacity[]
  eaasDetails?: EAASDetails
  callback?: () => void
}

interface ProductCapacity {
  facility: string
  value: number
}

interface EAASDetails {
  costOfPowerDaily: number
  costOfOneTimeInstallation: number
  numberOfDaysPowerAfterInstallation: number
  maximumIdleDays: number
  maximumIdleDaysSequence: "MONTHLY" | "YEARLY" | "LIFETIME"
}

const updateFormSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  productName: z.string().trim().min(1, "Product Name is required"),
  categoryId: z.string().trim().min(1, "Product Category is required"),
  description: z.string().optional(),

  productCapacity: z
    .array(
      z.object({
        facility: z.string().min(1, "Facility is required"),
        value: z.number().min(1, "Value must be at least 1"),
      }),
    )
    .min(1, "At least one capacity entry is required"),
})

const paymentModesUpdateSchema = z.array(z.string()).min(1, "Please select at least 1 payment mode")

const eaasDetailsUpdateSchema = z.object({
  costOfPowerDaily: z.number().min(1, "Daily cost must be positive"),
  costOfOneTimeInstallation: z.number().min(1, "Installation cost must be positive"),
  numberOfDaysPowerAfterInstallation: z.number().min(1, "Free days must be positive"),
  maximumIdleDays: z.number().min(1, "Maximum idle days must be at least 1"),
  maximumIdleDaysSequence: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]),
})

const mainUpdateSchema = updateFormSchema.extend({
  paymentModes: paymentModesUpdateSchema,
  eaasDetails: eaasDetailsUpdateSchema.optional(),
})

export const Tag = ({ name, variant, infoMessage = "", info = false }: { name: string; variant?: string, infoMessage?: string, info?: boolean }) => {
  return (
    <p
      className={`flex ${info && "gap-2"} gap-1 items-center justify-center h-[24px] text-xs p-2 rounded-full ${variant === "ink" ? "text-inkBlueTwo bg-paleLightBlue" : "text-textBlack bg-[#F6F8FA]"
        }`}
    >
      <span>{name}</span>
      {info && <span><InfoTooltip message={infoMessage} size={14} variant={variant} /></span>}

    </p>
  )
}



const ProductDetails: React.FC<ProductDetailsProps> = ({
  productId = "",
  productImage = "",
  productName = "",
  productTag = "",
  productPrice = {
    minimumInventoryBatchPrice: 0,
    maximumInventoryBatchPrice: 0,
  },
  paymentModes = [],
  datetime = "",
  name = "",
  categoryId = "",
  displayInputState = false,
  refreshTable,
  callback,
  description = "",
  productCapacity = [],
  eaasDetails = null,
}) => {
  const [formData, setFormData] = useState({
    productId,
    productImage: productImage ?? "",
    categoryId: categoryId,
    paymentModes: Array.isArray(paymentModes) ? paymentModes : [paymentModes],
    productName: `${productName}`,
    description: description,
    productCapacity: productCapacity && productCapacity.length > 0 ? productCapacity : [{ facility: "", value: 0 }],
    eaasDetails: eaasDetails || {
      costOfPowerDaily: 0,
      costOfOneTimeInstallation: 0,
      numberOfDaysPowerAfterInstallation: 0,
      maximumIdleDays: 0,
      maximumIdleDaysSequence: "MONTHLY" as const,
    },
  })

  const { apiCall } = useApiCall()
  const [loading, setLoading] = useState<boolean>(false)
  const [displayInput, setDisplayInput] = useState<boolean>(displayInputState)
  const [productCategories, setProductCategories] = useState<Category[]>([])
  const [showEAASFields, setShowEAASFields] = useState(false)
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([])
  const [apiError, setApiError] = useState<string | Record<string, string[]>>("")

  useEffect(() => {
    fetchProductCategories()
    console.log("Payment Modes:", paymentModes)
  }, [])

  useEffect(() => {
    setDisplayInput(displayInputState)
  }, [displayInputState])

  useEffect(() => {
    // Check if EAAS is selected in payment modes
    const hasEAAS = formData.paymentModes.includes("EAAS")
    setShowEAASFields(hasEAAS)
  }, [formData.paymentModes])

  const resetFormErrors = (name: string) => {
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name))
    setApiError("")
  }

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (name.startsWith("eaas.")) {
      const eaasField = name.split(".")[1]
      setFormData((prevData) => ({
        ...prevData,
        eaasDetails: {
          ...prevData.eaasDetails,
          [eaasField]: type === "number" ? Number(value) : value,
        },
      }))
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "number" ? Number(value) : value,
      }))
    }
    resetFormErrors(name.startsWith("eaas.") ? "eaasDetails" : name)
  }

  const handleDescriptionChange = (description: string) => {
    setFormData((prev) => ({
      ...prev,
      description: description,
    }))
    resetFormErrors("description")
  }

  const handleCapacityChange = (capacity: ProductCapacity[]) => {
    setFormData((prev) => ({
      ...prev,
      productCapacity: capacity,
    }))
    resetFormErrors("productCapacity")
  }

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData for file upload
      const validationData = {
        ...formData,
        eaasDetails: showEAASFields ? formData.eaasDetails : undefined,
      }

      //const validatedData = mainUpdateSchema.parse(validationData)
      mainUpdateSchema.parse(validationData)
      const submitData = new FormData()

      // Add basic product data
      submitData.append("productId", formData.productId)
      submitData.append("productName", formData.productName)
      submitData.append("categoryId", formData.categoryId)
      submitData.append("description", formData.description)
      submitData.append("paymentModes", String(formData.paymentModes))
      submitData.append("productCapacity", JSON.stringify(formData.productCapacity))

      // Add EAAS details if EAAS is selected
      if (showEAASFields) {
        submitData.append("eaasDetails", JSON.stringify(formData.eaasDetails))
      }

      // Handle file upload
      const fileInput = document.querySelector('input[name="productImage"]') as HTMLInputElement
      if (fileInput?.files?.[0]) {
        submitData.append("productImage", fileInput.files[0])
      }

      const response = await apiCall({
        endpoint: `/v1/products/${productId}`,
        method: "put",
        data: submitData,
        successMessage: "Product updated successfully!",
      })

      if (response) {
        refreshTable()
        displayInput && setDisplayInput(false)
        setFormErrors([])
        setApiError("")
        callback && callback()

      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues)
      } else {
        const message = error?.response?.data?.message || "Product Update Failed: Internal Server Error"
        setApiError(message)
      }
      console.error("Error updating product:", error)
    } finally {
      setLoading(false)
    }
  }

  const { minimumInventoryBatchPrice, maximumInventoryBatchPrice } = productPrice

  const fetchProductCategories = useCallback(async () => {
    try {
      const response = await apiCall({
        endpoint: "/v1/products/categories/all",
        method: "get",
        showToast: false,
      })
      setProductCategories(response.data || [])
    } catch (error) {
      console.error("Failed to fetch product categories:", error)
      setProductCategories([])
    }
  }, [apiCall])

  const handleEAASChange = (eaasDetails: EAASDetails) => {
    setFormData((prev) => ({
      ...prev,
      eaasDetails,
    }))
    resetFormErrors("eaasDetails")
  }

  const isFormFilled = () => {
    try {
      const validationData = {
        ...formData,
        eaasDetails: showEAASFields ? formData.eaasDetails : undefined,
      }

      const result = mainUpdateSchema.safeParse(validationData)
      return result.success
    } catch (error) {
      return false
    }
  }


  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      {/* Product Picture */}
      <div className="flex items-center justify-between p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <Tag name="Product Picture" variant="ink" />
        {displayInput ? (
          <div>
            <SmallFileInput
              name="productImage"
              onChange={handleChange}
              placeholder="Upload Image"
              iconRight={<LuImagePlus />}
            />
            {getFieldError("productImage") && (
              <span className="text-red-500 text-xs mt-1">{getFieldError("productImage")}</span>
            )}
          </div>

        ) : (
          <div className="flex items-center justify-center w-full p-2 max-w-[100px] h-[100px] gap-2 border-[0.6px] border-strokeCream rounded-full overflow-clip">
            <img
              src={productImage || "/placeholder.svg"}
              alt="Product Image"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={producticon || "/placeholder.svg"} alt="Product Icon" /> PRODUCT DETAILS
        </p>

        <div className="flex items-center justify-between">
          <Tag name="Category" />
          {displayInput ? (
            // <div className="flex flex-col w-full max-w-[160px]">
            //   </div>
            <div className="flex flex-col w-full max-w-[160px]">
              <select
                name="productTag"
                value={formData.categoryId}
                onChange={handleChange}
                className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
              >
                {productCategories.length > 0 ? (
                  <>
                    <option value="">Select Category</option>
                    {productCategories.map((category: Category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="">Category Is Empty</option>
                )}
              </select>
              {getFieldError("categoryId") && (
                <span className="text-red-500 text-xs mt-1">{getFieldError("categoryId")}</span>
              )}
            </div>
          ) : (
            <ProductTag productTag={productTag} />
          )}
        </div>

        <div className="flex items-center justify-between">
          <Tag name="Name" />
          {displayInput ? (
            <div className="flex flex-col w-full max-w-[160px]">
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter Product Name"
                className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
              />
              {getFieldError("productName") && (
                <span className="text-red-500 text-xs mt-1">{getFieldError("productName")}</span>
              )}
            </div>

          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{productName}</p>
          )}
        </div>

        {/* Product Description */}
        <div className="flex flex-col gap-2">
          {!displayInput && <Tag name="Description" />}
          {displayInput ? (
            <ProductDescriptionInput
              value={formData.description}
              onChange={handleDescriptionChange}
              errorMessage={getFieldError("description")}
            />
          ) : (
            <p className="text-xs text-textDarkGrey px-2">{description || "No description available"}</p>
          )}
        </div>

        {/* Product Capacity */}
        <div className="flex flex-col gap-2">
          {!displayInput && (
            <Tag name="PRODUCT CAPACITY" variant="ink" />
          )}
          {displayInput ? (
            <div className="space-y-2">
              <ProductCapacityForm
                value={formData.productCapacity}
                onChange={handleCapacityChange}
                errorMessage={getFieldError("productCapacity")}
              />

            </div>
          ) : (
            <div className="space-y-1">
              {productCapacity && productCapacity.length > 0 ? (
                productCapacity.map((capacity, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{capacity.facility.replace("_", " ")}</span>
                    <span className="font-bold">{capacity.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-textDarkGrey">No capacity information</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Mode */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={creditcardicon || "/placeholder.svg"} alt="Credit Card Icon" /> Payment Mode
        </p>

        <div className="flex items-center justify-between">
          <Tag name="Product Price" />
          <p className="flex items-center gap-0.5 text-xs font-bold text-textDarkGrey">
            {minimumInventoryBatchPrice === maximumInventoryBatchPrice
              ? `₦ ${formatNumberWithCommas(maximumInventoryBatchPrice)}`
              : `₦ ${formatNumberWithCommas(minimumInventoryBatchPrice)} - ${formatNumberWithCommas(maximumInventoryBatchPrice)}`}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div><Tag name="Payment Mode(s)" variant="ink" /></div>
          {displayInput ? (
            <div>
              <SelectMultipleInput

                options={[
                  { label: "Single Deposit", value: "ONE_OFF" },
                  { label: "Installment", value: "INSTALLMENT" },
                  { label: "Energy as a Service", value: "EAAS" },
                ]}
                value={formData.paymentModes}
                onChange={(values) => { setFormData({ ...formData, paymentModes: values }) }}
                placeholder="Select Payment Modes"
                required={true}
                plainBorder={true}
                errorMessage={getFieldError("paymentModes")}
              />
            </div>
          ) : (
            <div className="flex items-center w-max gap-1">
              {(typeof paymentModes === "string"
                ? paymentModes.split(",")
                : Array.isArray(paymentModes)
                  ? paymentModes
                  : []
              ).map((payment, index) => (
                <Tag key={index} name={payment.trim().toUpperCase()} />
              ))}
            </div>
          )}
        </div>

        {/* EAAS Details */}
        {showEAASFields && displayInput && (
          <div className="mt-4 p-3 bg-blue-50 rounded-[10px] space-y-3">
            <div className="flex items-center justify-center">
              <Tag name="Energy as a Service (EAAS) Details" variant="ink" />
            </div>
            <EAASDetailsForm
              value={formData.eaasDetails}
              onChange={handleEAASChange}
              errorMessage={getFieldError("eaasDetails")}
            />
          </div>
        )}

        {/* Display EAAS details when not in edit mode */}
        {!displayInput && eaasDetails && paymentModes.includes("EAAS") && (
          <div className="mt-2 p-3 bg-blue-50 rounded-[10px] space-y-2">
            <Tag name="EAAS Details" variant="ink" />
            <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
              <div className="flex justify-between">
                <Tag name="Daily Cost" />
                <span className="text-xs font-bold text-textDarkGrey">₦{formatNumberWithCommas(eaasDetails.costOfPowerDaily)}</span>
              </div>
              <div className="flex justify-between">
                <Tag name="Installation" />
                <span className="text-xs font-bold text-textDarkGrey">₦{formatNumberWithCommas(eaasDetails.costOfOneTimeInstallation)}</span>
              </div>
              <div className="flex justify-between">
                <Tag name="Free Days" />
                <span className="text-xs font-bold text-textDarkGrey">{eaasDetails.numberOfDaysPowerAfterInstallation} days</span>
              </div>
              <div className="flex justify-between">
                <Tag name="Max Idle" />
                <span className="text-xs font-bold text-textDarkGrey">{eaasDetails.maximumIdleDays} days</span>
              </div>
              <div className="flex justify-between col-span-2">
                <Tag name="Reset Period" />
                <span className="text-xs font-bold text-textDarkGrey">{eaasDetails.maximumIdleDaysSequence.toLowerCase()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {displayInput && <ApiErrorMessage apiError={apiError} />}
      {displayInput ? (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            loading={loading}
            variant={isFormFilled() ? "gradient" : "gray"}
            disabled={false}
          />
        </div>
      ) : (
        <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
            <img src={settingsicon || "/placeholder.svg"} alt="Settings Icon" /> GENERAL DETAILS
          </p>
          <div className="flex items-center justify-between">
            <Tag name="Date Created" />
            <p className="text-xs font-bold text-textDarkGrey">{formatDateTime("date", datetime)}</p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Time Created" />
            <p className="text-xs font-bold text-textDarkGrey">{formatDateTime("time", datetime)}</p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Created By" />
            <div className="text-xs font-bold text-textDarkGrey">
              <NameTag name={name} />
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

export default ProductDetails