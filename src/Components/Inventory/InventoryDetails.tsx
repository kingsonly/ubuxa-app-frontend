import React, { useCallback, useEffect, useState } from "react";
import { Tag } from "../Products/ProductDetails";
import { SmallFileInput, ToggleInput } from "../InputComponent/Input";
import { LuImagePlus } from "react-icons/lu";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import inventoryIcon from "../../assets/inventory/inventoryIcon.svg";
import { GoDotFill } from "react-icons/go";
import { formatDateTime, formatNumberWithCommas } from "@/utils/helpers";
import { NairaSymbol } from "../CardComponents/CardComponent";
import { KeyedMutator } from "swr";
import { z } from "zod";
import { useApiCall } from "@/utils/useApiCall";
import { Category } from "../Products/CreateNewProduct";
import { infoMessages } from "@/lib/infoMessages";
type InventoryDetailsProps = {
  inventoryId: string | number;
  inventoryImage: string;
  inventoryName: string;
  inventoryClass: string;
  inventoryCategory: any;
  inventorySubCategory: any;
  hasDevice?: boolean;
  sku: string;
  manufacturerName: string;
  dateOfManufacture: string | null;
  numberOfStock?: number;
  remainingQuantity?: number;
  costPrice?: number;
  salePrice?: number;
  stockValue: string;
  displayInput?: boolean;
  tagStyle: (value: string) => string;
  callback: () => void;
  refreshTable: KeyedMutator<any>;
};

const inventorySchema = z.object({
  name: z.string().min(6, "Inventory Name is required"),
  class: z.string().min(1, "Inventory Class is required"),
  inventoryCategoryId: z.string().min(1, "Inventory Category is required"),
  inventorySubCategoryId: z
    .string()
    .trim()
    .min(1, "Inventory SubCategory is required"),
  sku: z
    .string()
    .trim()
    .optional(),
  hasDevice: z
    .boolean()
    .optional(),

  dateOfManufacture: z.string()
    .trim()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      "Invalid Date of Manufacture"
    )
    .default(""),
  manufacturerName: z.string().trim().min(1, "Address is required"),
  inventoryImage: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(
          file.type
        ),
      {
        message: "Only PNG, JPEG, JPG, or SVG files are allowed.",
      }
    )
    .nullable()
    .default(null).optional(),
});

const InventoryDetails: React.FC<InventoryDetailsProps> = ({
  inventoryId = "",
  inventoryImage = "",
  inventoryName = "",
  inventoryClass = "",
  inventoryCategory = null,
  inventorySubCategory = null,
  sku = "",
  hasDevice = false,
  manufacturerName = "",
  dateOfManufacture = "",
  numberOfStock = 0,
  remainingQuantity = 0,
  costPrice = 0,
  salePrice = 0,
  stockValue,
  displayInput = false,
  tagStyle,
  refreshTable,
  callback,
}) => {
  const [formData, setFormData] = useState({
    inventoryImage: null,
    name: inventoryName,
    class: inventoryClass,
    inventoryCategoryId: inventoryCategory?.id,
    inventorySubCategoryId: inventorySubCategory?.id,
    sku,
    hasDevice: hasDevice,
    manufacturerName,
    dateOfManufacture,
  });
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [inventoryCategories, setInventoryCategories] = useState<Category[]>(
    []
  );
  useEffect(() => {
    fetchInventoryCategories();
    console.log("lets see what we have ", {
      inventoryImage: null,
      name: inventoryName,
      class: inventoryClass,
      inventoryCategoryId: inventoryCategory?.id,
      inventorySubCategoryId: inventorySubCategory?.id,
      sku,
      hasDevice: hasDevice,
      manufacturerName,
      dateOfManufacture,
    })
  }, []);
  const fetchInventoryCategories = useCallback(async () => {
    try {
      const response = await apiCall({
        endpoint: "/v1/inventory/categories/all",
        method: "get",
        showToast: false,
      });
      setInventoryCategories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch inventory categories:", error);
      setInventoryCategories([]);
    }
  }, []);


  const handleChange = (
    e: any
  ) => {
    const { name, value, type } = e.target;
    // Handle file input
    if (type === "file" && name === "inventoryImage") {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {

        setFormData((prev) => ({
          ...prev,
          [name]: files[0],
        }));
      }

      return;
    }

    // Handle checkbox input for boolean values
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
      return;
    }

    // Handle number inputs
    if (type === "number" || ["numberOfStock", "costOfItem", "price"].includes(name)) {
      const numericValue = value === "" ? "" : Number(value);
      setFormData((prevData) => ({
        ...prevData,
        [name]: numericValue,
      }));
      return;
    }

    // Handle regular text inputs
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log("formData", name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log("Form validation failed", errors);
      return
    }
    setLoading(true);
    try {
      const validatedData = inventorySchema.parse(formData)
      const submissionData = new FormData()

      Object.entries(validatedData).forEach(([key, value]) => {
        if (value instanceof File) {
          submissionData.append(key, value)
        } else if (value !== null && value !== undefined && value !== "") {
          submissionData.append(key, String(value))
        }
      })

      await apiCall({
        endpoint: `/v1/inventory/${inventoryId}`,
        method: "put",
        data: submissionData,
        successMessage: "Inventory updated successfully!",
      })

      //Refresh the table after successful creation
      if (refreshTable) {
        refreshTable()
        callback()
      }
    } catch (error: any) {
      console.error("Error creating inventory:", error)
    } finally {
      setLoading(false)
    }

  };
  const validateForm = () => {
    try {
      inventorySchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSelectChange = (name: string, values: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
      ...(name === "inventoryCategoryId" && { inventorySubCategoryId: "" }),
    }));
    //resetFormErrors(name);
  };

  const handleInputChangeHasDevice = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hasDevice: value,
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="flex items-center justify-between p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <Tag name="Inventory Picture" variant="ink" />
        {displayInput ? (
          <SmallFileInput
            name="inventoryImage"
            onChange={handleChange}
            placeholder="Upload Image"
            required={false}
            iconRight={<LuImagePlus />}
          />
        ) : (
          <div className="flex items-center justify-center w-full p-2 max-w-[100px] h-[100px] gap-2 border-[0.6px] border-strokeCream rounded-full overflow-clip">
            <img
              src={inventoryImage}
              alt="Inventory Image"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={inventoryIcon} alt="Inventory Icon" /> ITEM DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Name" />
          {displayInput ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={true}
              placeholder="Enter Inventory Name"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {inventoryName}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Class" variant="ink" />
          {displayInput ? (
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              required={true}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-[10px]"
            >
              <option value="REGULAR">Regular</option>
              <option value="REFURBISHED">Refurbished</option>
            </select>
          ) : (
            <span
              className={`${tagStyle(
                inventoryClass
              )} flex items-center justify-center gap-0.5 w-max px-2 h-[24px] text-xs uppercase rounded-full`}
            >
              <GoDotFill width={4} height={4} />
              {inventoryClass}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Category" variant="ink" />
          {displayInput ? (
            // <SelectInput
            //   label="Category"
            //   options={
            //     inventoryCategories.length > 0
            //       ? inventoryCategories.map((category: Category) => ({
            //         label: category?.name,
            //         value: category?.id,
            //       }))
            //       : [
            //         {
            //           label: "No Category Available",
            //           value: "",
            //         },
            //       ]
            //   }
            //   value={formData.inventoryCategoryId}
            //   onChange={(selectedValue) =>
            //     handleSelectChange("inventoryCategoryId", selectedValue)
            //   }
            //   required={true}
            //   placeholder="Choose Item Category"

            // />
            <select
              name="inventoryCategory"
              value={formData.inventoryCategoryId}
              onChange={(e) => handleSelectChange("inventoryCategoryId", e.target.value)}
              required={true}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-[10px]"
            >
              {inventoryCategories.length > 0
                ? <>
                  <option value="">Select Category</option>
                  {inventoryCategories.map((category: Category) => (
                    <option value={category.id}>{category.name}</option>
                  ))}
                </>
                : <option value="">Category Is Empty</option>
              }

            </select>
          ) : inventoryCategory ? (
            <span className="flex items-center justify-center bg-[#FEF5DA] gap-0.5 w-max px-2 h-[24px] text-textDarkBrown text-xs uppercase rounded-full">
              <GoDotFill width={4} height={4} />
              {inventoryCategory?.name}
            </span>
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">N/A</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Tag name="Subcategory" variant="ink" />
          {displayInput ? (
            <select
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-[10px]"
              name="inventorySubCategoryId"
              value={formData.inventorySubCategoryId}
              onChange={(e) => handleSelectChange("inventorySubCategoryId", e.target.value)}
              required={!!formData.inventoryCategoryId}
            >
              {(() => {
                const selectedCategory = inventoryCategories.find(
                  (category: Category) => category?.id === formData?.inventoryCategoryId
                );

                if (selectedCategory && selectedCategory.children?.length > 0) {
                  return (
                    <>
                      <option value="">Select SubCategory</option>
                      {selectedCategory.children.map((child: { name: string; id: string }) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </>
                  );
                } else {
                  return (
                    <option value="">
                      {inventorySubCategory?.name || "SubCategory Is Empty"}
                    </option>
                  );
                }
              })()}
            </select>

            // <select
            //   className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-[10px]"
            //   name="inventorySubCategoryId"
            //   value={formData.inventorySubCategoryId}
            //   onChange={(e) => handleSelectChange("inventorySubCategoryId", e.target.value)}
            //   required={!!formData.inventoryCategoryId}
            // >

            //   {

            //   (
            //     inventoryCategories
            //       .find(
            //         (category: Category) =>
            //           category?.id === formData?.inventoryCategoryId
            //       )
            //       ?.children?.map((child: { name: string; id: string }) => (
            //         <option key={child.id} value={child.id}>
            //           {child.name}
            //         </option>
            //       )) || [
            //       <option key="no-subcategory" value="">
            //         {inventorySubCategory.name}
            //       </option>,
            //     ]
            //   )
            //   }
            // </select>
          ) : inventorySubCategory ? (
            <span className="flex items-center justify-center bg-[#FEF5DA] gap-0.5 w-max px-2 h-[24px] text-textDarkBrown text-xs uppercase rounded-full">
              <GoDotFill width={4} height={4} />
              {inventorySubCategory.name}
            </span>
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">N/A</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Tag name="SKU" />
          {displayInput ? (
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Enter SKU"
              required={false}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {sku ? sku : "N/A"}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Tag name="Has Device" info={true} infoMessage={infoMessages.inventory.hasDevice} />
          {displayInput ? (
            <div className="flex items-center justify-between">
              <ToggleInput
                defaultChecked={formData.hasDevice}
                onChange={(checked: boolean) => {
                  handleInputChangeHasDevice(checked);
                }}
              />
              <span className="flex items-center justify-center gap-0.5 bg-[#F6F8FA] px-2 h-6 rounded-full text-xs font-medium capitalize border-[0.6px] border-strokeGreyTwo">
                {formData.hasDevice ? <span className='text-green-500'>YES</span> : <span className='text-errorTwo'>NO</span>}
              </span>
            </div>
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {hasDevice ? hasDevice === true ? "YES" : "NO" : "NO"}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={inventoryIcon} alt="Inventory Icon" /> MANUFACTURERS DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Manufacturers Name" />
          {displayInput ? (
            <input
              type="text"
              name="manufacturerName"
              value={formData.manufacturerName}
              onChange={handleChange}
              placeholder="Enter Manufacturer Name"
              required={true}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {manufacturerName}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Date Of Manufacture" />
          {displayInput ? (
            <input
              type="date"
              name="dateOfManufacture"
              value={formData.dateOfManufacture || ""}
              onChange={handleChange}
              placeholder="Enter Date of Manufacture"
              required={false}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {dateOfManufacture
                ? formatDateTime("date", dateOfManufacture)
                : "N/A"}
            </p>
          )}
        </div>
      </div>

      {displayInput ? null :
        <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
            <img src={inventoryIcon} alt="Inventory Icon" />
            CURRENT BATCH STOCK DETAILS
          </p>
          <div className="flex items-center justify-between">
            <Tag name="Total Quantity of Stock" />
            <p className="text-xs font-bold text-textDarkGrey">
              {formatNumberWithCommas(numberOfStock)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Remaining Quantity of Stock" />
            <p className="text-xs font-bold text-textDarkGrey">
              {formatNumberWithCommas(remainingQuantity)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Cost of Stock" />
            <p className="flex items-center justify-end gap-1 w-max text-xs font-bold text-textDarkGrey">
              <NairaSymbol color="#828DA9" />
              {formatNumberWithCommas(costPrice)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Price of Stock" />
            <p className="flex items-center justify-end gap-1 w-max text-xs font-bold text-textDarkGrey">
              <NairaSymbol color="#828DA9" />
              {formatNumberWithCommas(salePrice)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Tag name="Stock Value" />
            <p className="flex items-center justify-end gap-1 w-max text-xs font-bold text-textDarkGrey">
              <NairaSymbol color="#828DA9" />
              {formatNumberWithCommas(stockValue)}
            </p>
          </div>
        </div>}

      {displayInput && (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            loading={loading}
            variant={"gray"}
            disabled={false}
          />
        </div>
      )}
    </form>
  );
};

export default InventoryDetails;
