import React, { useEffect, useState } from "react";
import { KeyedMutator } from "swr";
import { Tag } from "../Products/ProductDetails";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import customericon from "../../assets/customers/customericon.svg";
import { SmallFileInput } from "../InputComponent/Input";
import { LuImagePlus } from "react-icons/lu";
import { useApiCall } from "@/utils/useApiCall";
import { z } from "zod";

export type DetailsType = {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addressType: string;
  location: string;
  image?: string;
  landmark?: string;
  longitude?: string;
  latitude?: string;
};

const customerSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .max(20, "Phone number cannot be more than 20 digits")
    .transform((val) => val.replace(/\s+/g, "")),
  location: z.string().trim().min(1, "Address is required"),
  addressType: z
    .enum(["HOME", "WORK"], {
      errorMap: () => ({ message: "Please select an address type" }),
    })
    .default("HOME"),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  landmark: z.string().optional(),
  image: z
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

type CustomerFormData = z.infer<typeof customerSchema>;

const CustomerDetails = ({
  refreshTable,
  displayInput,
  ...data
}: DetailsType & {
  refreshTable: KeyedMutator<any>;
  displayInput?: boolean;
}) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    firstname: data.firstName || "",
    lastname: data.lastName || "",
    email: data.email || "",
    phone: data.phoneNumber || "",
    addressType: (data.addressType as "HOME" | "WORK") || "HOME",
    location: data.location || "",
    longitude: data.longitude || "",
    latitude: data.latitude || "",
    landmark: data.landmark || "",
    image: null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  // const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleChange = (
    e: any
  ) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    try {
      customerSchema.parse(formData)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const validatedData = customerSchema.parse(formData)
      const submissionData = new FormData()

      Object.entries(validatedData).forEach(([key, value]) => {
        if (value instanceof File) {
          submissionData.append(key, value)
        } else if (value !== null && value !== undefined && value !== "") {
          submissionData.append(key, String(value))
        }
      })

      await apiCall({
        endpoint: `/v1/customers/${data.customerId}`,
        method: "put",
        data: submissionData,
        successMessage: "Customer updated successfully!",
      })

      // Refresh the table after successful creation
      // if (refreshTable) {
      //   refreshTable()
      // }
    } catch (error: any) {
      console.error("Error creating customer:", error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Settings Icon" /> PERSONAL DETAILS
        </p>
        {displayInput && (
          <div className="flex items-center justify-between p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <Tag name="Customer Picture" variant="ink" />
            <SmallFileInput
              name="image"
              onChange={handleChange}
              placeholder="Upload Image"
              iconRight={<LuImagePlus />}
            />
          </div>)}
        {data.image && !displayInput && (
          <div className="flex items-center justify-between p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <Tag name="Customer Picture" variant="ink" />
            <div className="flex items-center justify-center w-full p-2 max-w-[100px] h-[100px] gap-2 border-[0.6px] border-strokeCream rounded-full overflow-clip">
              <img
                src={data.image}
                alt="Customer Image"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>)}


        <div className="flex items-center justify-between">
          <Tag name="First Name" />
          {displayInput ? (
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.firstName}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Last Name" />
          {displayInput ? (
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.lastName}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Email" />
          {displayInput ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{data.email}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Phone Number" />
          {displayInput ? (
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter Phone Number"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.phoneNumber}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Address Type" />
          {displayInput ? (
            <select
              name="addressType"
              value={formData.addressType}
              onChange={handleChange}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            >
              <option value="HOME">Home</option>
              <option value="WORK">Work</option>
            </select>
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.addressType || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Address" />
          {displayInput ? (
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter Address"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.location || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Landmark" />
          {displayInput ? (
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="Enter Landmark"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.landmark || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Longitude" />
          {displayInput ? (
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Enter Longitude"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.longitude || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Latitude" />
          {displayInput ? (
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Enter Latitude"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.latitude || "N/A"}
            </p>
          )}
        </div>
      </div>
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

export default CustomerDetails;
