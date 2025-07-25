import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useApiCall } from "../../utils/useApiCall"
import type { KeyedMutator } from "swr"
import { FileInput, Input, ModalInput, ProductDescriptionInput, SelectInput, SelectMultipleInput } from "../InputComponent/Input"
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent"
import SelectInventoryModal from "./SelectInventoryModal"
import { observer } from "mobx-react-lite"
import { CardComponent } from "../CardComponents/CardComponent"
import { Modal } from "@/Components/ModalComponent/Modal"
import { z } from "zod"
import { ProductStore } from "@/stores/ProductStore"
import ApiErrorMessage from "../ApiErrorMessage"

import { ProductCapacity, ProductCapacityForm } from "./ProductCapacityForm"
import { EAASDetails, EAASDetailsForm } from "./EAASDetailsForm"


export type ProductFormType = "newProduct" | "newCategory"

interface CreatNewProductProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  refreshTable?: KeyedMutator<any>
  formType?: ProductFormType
}

export type Category = {
  id: string
  name: string
  parent: string | null
  parentId: string | null
  type: "INVENTORY" | "PRODUCT"
  createdAt: string
  updatedAt: string
  children: Category[]
}

const formSchema = z.object({
  categoryId: z.string().trim().min(1, "Inventory Category is required").default(""),
  name: z.string().trim().min(1, "Product Name is required"),
  description: z.string(),
  productImage: z
    .instanceof(File)
    .refine((file) => ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(file.type), {
      message: "Only PNG, JPEG, JPG, or SVG files are allowed.",
    })
    .nullable()
    .default(null),
  productCapacity: z
    .array(
      z.object({
        facility: z.string().min(1, "Facility is required"),
        value: z.number().min(1, "Value must be at least 1"),
      }),
    )
    .optional(),
})

const paymentModesSchema = z
  .array(z.string())
  .min(1, "Please select at least 1 payment mode")
  .transform((arr) => arr.join(", "))

const eaasDetailsSchema = z.object({
  costOfPowerDaily: z.number().min(1, "Daily cost must be positive"),
  costOfOneTimeInstallation: z.number().min(1, "Installation cost must be positive"),
  numberOfDaysPowerAfterInstallation: z.number().min(1, "Free days must be positive"),
  maximumIdleDays: z.number().min(1, "Maximum idle days must be at least 1"),
  maximumIdleDaysSequence: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]),
})

const otherFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product Category is required")
    .max(50, "Product Category cannot exceed 50 characters"),
})

const mainSchema = formSchema.extend({
  paymentModes: paymentModesSchema,
  eaasDetails: eaasDetailsSchema.optional(),
  inventories: z
    .array(
      z.object({
        inventoryId: z.string(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      }),
    )
    .nonempty("Select at least 1 inventory item"),
})

const defaultFormData = {
  categoryId: "",
  name: "",
  description: "",
  inventories: [],
  paymentModes: [],
  productImage: null,
  productCapacity: [{ facility: "", value: 0 }] as ProductCapacity[],
  eaasDetails: {
    costOfPowerDaily: 0,
    costOfOneTimeInstallation: 0,
    numberOfDaysPowerAfterInstallation: 0,
    maximumIdleDays: 0,
    maximumIdleDaysSequence: "MONTHLY" as const,
  } as EAASDetails,
}

const OtherSubmissonData = {
  name: "",
}

export type FormData = z.infer<typeof formSchema> & {
  inventories: any[]
  paymentModes: string[]
  eaasDetails: EAASDetails
  productCapacity: ProductCapacity[]

}

type OtherFormData = z.infer<typeof otherFormSchema>


const CreateNewProduct: React.FC<CreatNewProductProps> = observer(
  ({ isOpen, setIsOpen, refreshTable, formType = "newProduct" }) => {
    const { apiCall } = useApiCall()
    const [formData, setFormData] = useState<FormData>(defaultFormData)
    const [paymentModes, setPaymentModes] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false)
    const [otherFormData, setOtherFormData] = useState<OtherFormData>(OtherSubmissonData)
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([])
    const [apiError, setApiError] = useState<string | Record<string, string[]>>("")
    const [productCategories, setProductCategories] = useState<Category[]>([])
    const [showEAASFields, setShowEAASFields] = useState(false)

    // Check if EAAS is selected
    useEffect(() => {
      const hasEAAS = paymentModes.includes("EAAS")
      setShowEAASFields(hasEAAS)
    }, [paymentModes])


    // Fetch product categories using apiCall
    const fetchProductCategories = useCallback(async () => {
      try {
        const response = await apiCall({
          endpoint: "/v1/products/categories/all",
          method: "get",
          showToast: false,
        });
        setProductCategories(response.data || []);
      } catch (error) {
        console.error("Failed to fetch product categories:", error);
        setProductCategories([]);
      }
    }, [isOpen]);

    // Load categories when modal opens
    useEffect(() => {
      if (isOpen) {
        fetchProductCategories();
      }
    }, [isOpen, fetchProductCategories]);

    const handleInputChange = (e: { target: { name: any; value: any; files: any } }) => {
      const { name, value, files } = e.target
      if (name === "productImage" && files && files.length > 0) {
        setFormData((prev) => ({
          ...prev,
          [name]: files[0],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }))
      }
      resetFormErrors(name)
    }

    const handleSelectChange = (name: string, values: string | string[]) => {
      if (name === "paymentModes") {
        setPaymentModes(Array.isArray(values) ? values : [values])
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: values,
        }))
      }
      resetFormErrors(name)
    }

    const handleCapacityChange = (capacity: ProductCapacity[]) => {
      setFormData((prev) => ({
        ...prev,
        productCapacity: capacity,
      }))
      resetFormErrors("productCapacity")
    }

    const handleEAASChange = (eaasDetails: EAASDetails) => {
      setFormData((prev) => ({
        ...prev,
        eaasDetails,
      }))
      resetFormErrors("eaasDetails")
    }

    const handleDescriptionChange = (description: string) => {
      setFormData((prev) => ({
        ...prev,
        description: description,
      }))
      resetFormErrors("description")
    }

    const resetFormErrors = (name: string) => {
      setFormErrors((prev) => prev.filter((error) => error.path[0] !== name))
      setApiError("")
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)

      try {
        if (formType === "newProduct") {
          const inventories = ProductStore.products.map((product) => ({
            inventoryId: product.productId,
            quantity: product.productUnits,
          }))

          const validationData = {
            ...formData,
            paymentModes: paymentModes,
            inventories: inventories,
            eaasDetails: showEAASFields ? formData.eaasDetails : undefined,
          }

          const validatedData = mainSchema.parse(validationData)

          const submissionData = new FormData()

          // Add basic fields
          Object.entries(validatedData).forEach(([key, value]) => {
            if (!["inventories", "productCapacity", "eaasDetails"].includes(key)) {
              if (value instanceof File) {
                submissionData.append(key, value)
              } else if (value !== null && value !== undefined) {
                submissionData.append(key, String(value))
              }
            }
          })

          // Add complex data as JSON
          submissionData.append("inventories", JSON.stringify(validatedData.inventories))
          submissionData.append("productCapacity", JSON.stringify(formData.productCapacity))

          if (showEAASFields && validatedData.eaasDetails) {
            submissionData.append("eaasDetails", JSON.stringify(validatedData.eaasDetails))
          }

          await apiCall({
            endpoint: "/v1/products",
            method: "post",
            data: submissionData,
            headers: { "Content-Type": "multipart/form-data" },
            successMessage: "Product created successfully!",
          })
        } else {
          const validatedData = otherFormSchema.parse(otherFormData)
          const submissionData = {
            name: validatedData.name,
            type: "PRODUCT",
          }

          await apiCall({
            endpoint: "/v1/products/create-category",
            method: "post",
            data: submissionData,
            successMessage: "Product category created successfully!",
          })

          // Refresh categories after creating a new one
          await fetchProductCategories()
        }

        if (refreshTable) {
          await refreshTable()
        }
        setIsOpen(false)
        setFormData(defaultFormData)
        setPaymentModes([])
        ProductStore.emptyProducts()
        setOtherFormData(OtherSubmissonData)
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          setFormErrors(error.issues)
        } else {
          const message =
            error?.response?.data?.message ||
            `Product ${formType === "newCategory" ? "Category" : ""} Creation Failed: Internal Server Error`
          setApiError(message)
        }
      } finally {
        setLoading(false)
      }
    }

    const selectedProducts = ProductStore.products
    const { categoryId, name, productImage } = formData

    const isFormFilled = () => {
      if (formType !== "newProduct") {
        return otherFormSchema.safeParse(otherFormData).success
      }

      const basicValidation =
        productImage &&
        selectedProducts.length > 0 &&
        formSchema.safeParse(formData).success &&
        paymentModesSchema.safeParse(paymentModes).success

      if (!basicValidation) return false

      // Additional validation for EAAS if selected
      if (showEAASFields) {
        return eaasDetailsSchema.safeParse(formData.eaasDetails).success
      }

      return true
    }

    const getFieldError = (fieldName: string) => {
      return formErrors.find((error) => error.path[0] === fieldName)?.message
    }

    return (
      <>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} layout="right" bodyStyle="pb-[100px]">
          <form className="flex flex-col items-center bg-white" onSubmit={handleSubmit} noValidate>
            <div
              className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${isFormFilled() ? "bg-paleCreamGradientLeft" : "bg-paleGrayGradientLeft"
                }`}
            >
              <h2
                style={{ textShadow: "1px 1px grey" }}
                className="text-xl text-textBlack font-semibold font-secondary"
              >
                New Product {formType === "newCategory" && "Category"}
              </h2>
            </div>
            <div className="flex flex-col items-center justify-center w-full px-[2.5em] gap-4 py-8">
              {formType === "newProduct" ? (
                <>
                  <SelectInput
                    label="Product Category"
                    options={
                      productCategories.length > 0
                        ? productCategories.map((category: Category) => ({
                          label: category.name,
                          value: category.id,
                        }))
                        : []
                    }
                    value={categoryId}
                    onChange={(selectedValue) => handleSelectChange("categoryId", selectedValue)}
                    required={true}
                    placeholder="Select Product Category"
                    errorMessage={getFieldError("categoryId")}
                  />

                  <Input
                    type="text"
                    name="name"
                    label="PRODUCT NAME"
                    value={name}
                    onChange={handleInputChange}
                    placeholder="Product Name"
                    required={true}
                    errorMessage={getFieldError("name")}
                  />

                  <ProductDescriptionInput
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    errorMessage={getFieldError("productDescription")}
                  />

                  <ProductCapacityForm
                    value={formData.productCapacity}
                    onChange={handleCapacityChange}
                    errorMessage={getFieldError("productCapacity")}
                  />

                  <ModalInput
                    type="button"
                    name="inventories"
                    label="INVENTORY"
                    onClick={() => setIsInventoryOpen(true)}
                    placeholder="Select Inventory"
                    required={true}
                    isItemsSelected={selectedProducts.length > 0}
                    itemsSelected={
                      <div className="flex flex-wrap items-center w-full gap-4">
                        {selectedProducts?.map((data, index) => {
                          return (
                            <CardComponent
                              key={`${data.productId}-${index}`}
                              variant={"inventoryTwo"}
                              productId={data.productId}
                              productImage={data.productImage}
                              productTag={data.productTag}
                              productName={data.productName}
                              productPrice={data.productPrice}
                              productUnits={data.productUnits}
                              readOnly={true}
                              onRemoveProduct={(productId) => ProductStore.removeProduct(productId)}
                            />
                          )
                        })}
                      </div>
                    }
                    errorMessage={getFieldError("inventories")}
                  />

                  <SelectMultipleInput
                    label="Payment Modes"
                    options={[
                      { label: "Single Deposit", value: "ONE_OFF" },
                      { label: "Installment", value: "INSTALLMENT" },
                      { label: "Energy as a Service", value: "EAAS" },
                    ]}
                    value={paymentModes}
                    onChange={(values) => setPaymentModes(values)}
                    placeholder="Select Payment Modes"
                    required={true}
                    errorMessage={getFieldError("paymentModes")}
                  />

                  {showEAASFields && (
                    <EAASDetailsForm
                      value={formData.eaasDetails}
                      onChange={handleEAASChange}
                      errorMessage={getFieldError("eaasDetails")}
                    />
                  )}

                  <FileInput
                    name="productImage"
                    label="PRODUCT IMAGE"
                    onChange={handleInputChange}
                    required={true}
                    accept=".jpg,.jpeg,.png,.svg"
                    placeholder="Upload Product Image"
                    errorMessage={getFieldError("productImage")}
                  />
                </>
              ) : (
                <Input
                  type="text"
                  name="name"
                  label="Product Category Name"
                  value={otherFormData.name}
                  onChange={(e) => {
                    setOtherFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                    resetFormErrors("name")
                  }}
                  placeholder="Product Category Name"
                  required={true}
                  errorMessage={getFieldError("name")}
                />
              )}

              <ApiErrorMessage apiError={apiError} />

              <ProceedButton
                type="submit"
                loading={loading}
                variant={isFormFilled() ? "gradient" : "gray"}
                disabled={!isFormFilled()}
              />
            </div>
          </form>
        </Modal>
        <SelectInventoryModal isInventoryOpen={isInventoryOpen} setIsInventoryOpen={setIsInventoryOpen} />
      </>
    )
  }
);

export default CreateNewProduct;