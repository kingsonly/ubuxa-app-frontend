import { useState } from "react";
import { Input } from "../InputComponent/Input";
import { z } from "zod";
import { guarantorDetailsSchema } from "./salesSchema";
import { SaleStore } from "@/stores/SaleStore";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { GooglePlacesInput } from "../InputComponent/GooglePlacesInput";

type FormData = z.infer<typeof guarantorDetailsSchema>;

const defaultFormData: FormData = {
  fullName: "",
  phoneNumber: "",
  email: "",
  homeAddress: "",

};

const GuarantorForm = ({ handleClose }: { handleClose: () => void }) => {
  const savedData = SaleStore.guarantorDetails || defaultFormData;
  const [formData, setFormData] = useState<FormData>({
    ...savedData,
  });
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const validateItems = () => {
    const result = guarantorDetailsSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.issues);
      return false;
    }
    setFormErrors([]);
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateItems();
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  // const handleNestedInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     identificationDetails: {
  //       ...prev.identificationDetails,
  //       [name]: value,
  //     },
  //   }));
  //   validateItems();
  //   setFormErrors((prev) =>
  //     prev.filter(
  //       (error) =>
  //         !(
  //           Array.isArray(error.path) &&
  //           error.path.join(".") === `identificationDetails.${name}`
  //         )
  //     )
  //   );
  // };

  // const handleNestedSelectChange = (
  //   name: string,
  //   values: string | string[]
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     identificationDetails: {
  //       ...prev.identificationDetails,
  //       [name]: values,
  //     },
  //   }));
  //   validateItems();
  //   setFormErrors((prev) =>
  //     prev.filter(
  //       (error) =>
  //         !(
  //           Array.isArray(error.path) &&
  //           error.path.join(".") === `identificationDetails.${name}`
  //         )
  //     )
  //   );
  // };

  const isFormFilled = guarantorDetailsSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    // Check for both top-level and nested paths
    const error = formErrors.find(
      (err) =>
        err.path.join(".") === fieldName || // Top-level check
        err.path.join(".") === `identificationDetails.${fieldName}` // Nested field check
    );
    return error?.message;
  };

  const saveForm = () => {
    if (!validateItems()) return;
    SaleStore.addGuarantorDetails({
      ...formData,
    });
    handleClose();
  };

  return (
    <div className="flex flex-col justify-between h-full max-h-[360px] py-4 pr-1 sm:pr-3 overflow-y-auto gap-4">
      <Input
        type="text"
        name="fullName"
        label="Full Name"
        value={formData.fullName}
        onChange={handleInputChange}
        placeholder="Enter Full Name"
        required={true}
        errorMessage={getFieldError("fullName")}
      />
      <Input
        type="text"
        name="phoneNumber"
        label="Phone Number"
        value={formData.phoneNumber}
        onChange={handleInputChange}
        placeholder="Enter Phone Number"
        required={true}
        errorMessage={getFieldError("phoneNumber")}
      />
      <Input
        type="email"
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Enter Email"
        required={false}
        errorMessage={getFieldError("email")}
      />

      <GooglePlacesInput
        type="text"
        name="homeAddress"
        label="Home Address"
        value={formData.homeAddress}
        placeholder="Search for a location"
        required={true}
        errorMessage={getFieldError("homeAddress")}
        onChange={(value) => {
          setFormData((prev) => ({
            ...prev,
            homeAddress: value.address,
            longitude: value.coordinates?.lng || "",
            latitude: value.coordinates?.lat || "",
          }));
        }}
      />

      <div className="flex items-center justify-between gap-1 mt-4">
        <SecondaryButton
          variant="secondary"
          children="Cancel"
          onClick={handleClose}
        />
        <SecondaryButton
          disabled={!isFormFilled}
          children="Save"
          onClick={saveForm}
        />
      </div>
    </div>
  );
};

export default GuarantorForm;
