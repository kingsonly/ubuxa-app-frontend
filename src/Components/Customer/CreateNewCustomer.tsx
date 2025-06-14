import { useApiCall } from "@/utils/useApiCall";
import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { Modal } from "../ModalComponent/Modal";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { FileInput, Input, SelectInput } from "../InputComponent/Input";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";
import { GooglePlacesInput } from "../InputComponent/GooglePlacesInput";

interface CreatNewCustomerProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allCustomerRefresh: KeyedMutator<any>;
}

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
  customerImage: z
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

const defaultFormData = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  addressType: "HOME" as "HOME" | "WORK",
  location: "",
  landmark: "",
  customerImage: null,
};

const CreateNewCustomer = ({
  isOpen,
  setIsOpen,
  allCustomerRefresh,
}: CreatNewCustomerProps) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );

  const handleInputChange = (
    e: {
      target: { name: any; value: any; files: any };
    }
  ) => {
    const { name, value, files } = e.target;
    if (name === "customerImage" && files && files.length > 0) {
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

    resetFormErrors(name);
  };

  const handleSelectChange = (name: string, values: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
    resetFormErrors(name);
  };

  const resetFormErrors = (name: string) => {
    // Clear the error for this field when the user starts typing
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = customerSchema.parse(formData);
      const submissionData = new FormData();
      Object.entries(validatedData).forEach(([key, value]) => {
        if (value instanceof File) {
          submissionData.append(key, value);
        } else if (value !== null && value !== undefined) {
          submissionData.append(key, String(value));
        }
      });
      await apiCall({
        endpoint: "/v1/customers/create",
        method: "post",
        data: submissionData,
        successMessage: "Customer created successfully!",
      });

      await allCustomerRefresh();
      setIsOpen(false);
      setFormData(defaultFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          "Customer Creation Failed: Internal Server Error";
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = customerSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      layout="right"
      bodyStyle="pb-[100px]"
    >
      <form
        className="flex flex-col items-center bg-white"
        onSubmit={handleSubmit}
        noValidate
      >
        <div
          className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${isFormFilled
            ? "bg-paleCreamGradientLeft"
            : "bg-paleGrayGradientLeft"
            }`}
        >
          <h2
            style={{ textShadow: "1px 1px grey" }}
            className="text-xl text-textBlack font-semibold font-secondary"
          >
            New Customer
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          <Input
            type="text"
            name="firstname"
            label="FIRST NAME"
            value={formData.firstname}
            onChange={handleInputChange}
            placeholder="First Name"
            required={true}
            errorMessage={getFieldError("firstname")}
          />
          <Input
            type="text"
            name="lastname"
            label="LAST NAME"
            value={formData.lastname}
            onChange={handleInputChange}
            placeholder="Last Name"
            required={true}
            errorMessage={getFieldError("lastname")}
          />
          <Input
            type="email"
            name="email"
            label="EMAIL"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            required={true}
            errorMessage={getFieldError("email")}
          />
          <Input
            type="text"
            name="phone"
            label="PHONE"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            required={true}
            errorMessage={getFieldError("phone")}
          />
          <FileInput
            name="customerImage"
            label="CUSTOMER IMAGE"
            onChange={handleInputChange}
            required={false}
            accept=".jpg,.jpeg,.png,.svg"
            placeholder="Upload Customer Image"
            errorMessage={getFieldError("customerImage")}
          />

          <GooglePlacesInput
            type="text"
            name="location"
            label="Location"
            value={formData.location}
            placeholder="Search for a location"
            required={true}
            errorMessage={getFieldError("location")}
            onChange={(value, _place, coordinates) => {
              setFormData((prev) => ({
                ...prev,
                location: value,
                longitude: coordinates?.lng || "",
                latitude: coordinates?.lat || "",
              }));
            }}
          />
          <Input
            type="text"
            name="landmark"
            label="Landmark"
            value={formData.landmark || ""}
            onChange={handleInputChange}
            placeholder="Landmark"
            required={false}
            errorMessage={getFieldError("phone")}
          />
          <SelectInput
            label="Address Type"
            options={[
              { label: "Home", value: "HOME" },
              { label: "Work", value: "WORK" },
            ]}
            value={formData.addressType}
            onChange={(selectedValue) =>
              handleSelectChange("addressType", selectedValue)
            }
            required={false}
            placeholder="Choose Address Type"
            errorMessage={getFieldError("addressType")}
          />

          <ApiErrorMessage apiError={apiError} />

          <ProceedButton
            type="submit"
            loading={loading}
            variant={isFormFilled ? "gradient" : "gray"}
            disabled={!isFormFilled}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateNewCustomer;
