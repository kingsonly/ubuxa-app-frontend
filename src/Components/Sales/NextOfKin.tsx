import { useState } from "react";
import { Input } from "../InputComponent/Input";
import { z } from "zod";
import { nextOfKinDetailsSchema } from "./salesSchema";
import { SaleStore } from "@/stores/SaleStore";
import SecondaryButton from "../SecondaryButton/SecondaryButton";


type FormData = z.infer<typeof nextOfKinDetailsSchema>;

const defaultFormData: FormData = {
  fullName: "",
  phoneNumber: "",
};

const NextOfKinForm = ({ handleClose }: { handleClose: () => void }) => {
  const savedData = SaleStore.nextOfKinDetails || defaultFormData;

  const [formData, setFormData] = useState<FormData>({
    ...savedData,
  });
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const validateItems = () => {
    const result = nextOfKinDetailsSchema.safeParse(formData);
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

  const isFormFilled = nextOfKinDetailsSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const saveForm = () => {
    if (!validateItems()) return;
    SaleStore.addNextOfKinDetails({
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

export default NextOfKinForm;
