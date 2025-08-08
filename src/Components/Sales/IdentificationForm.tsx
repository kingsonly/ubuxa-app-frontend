import { useState } from "react";
import { FileInput, Input, SelectInput } from "../InputComponent/Input";
import { z } from "zod";
import { identificationDetailsSchema } from "./salesSchema";
import { SaleStore } from "@/stores/SaleStore";
import { formatDateForInput } from "@/utils/helpers";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { GooglePlacesInput } from "../InputComponent/GooglePlacesInput";


type FormData = z.infer<typeof identificationDetailsSchema>;

const defaultFormData: FormData = {
  idType: "",
  idNumber: "",
  customerCountry: "",
  customerState: "",
  customerLGA: "",
  expirationDate: "",
  installationAddress: "",
  installationAddressLongitude: "",
  installationAddressLatitude: "",
  customerIdImage: new File([], ''),
};

const IdentificationForm = ({ handleClose }: { handleClose: () => void }) => {
  const savedData = SaleStore.identificationDetails || defaultFormData;

  const [formData, setFormData] = useState<FormData>({
    ...savedData,
    expirationDate: formatDateForInput(savedData.expirationDate),
    customerIdImage: savedData.customerIdImage ?? new File([], ''),
  });
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const validateItems = () => {
    const result = identificationDetailsSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.issues);
      return false;
    }
    setFormErrors([]);
    return true;
  };

  const handleInputChange = (
    e: any
  ) => {
    const { name, value, files } = e.target;
    if (name === "customerIdImage" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        customerIdImage: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    validateItems();
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  const handleSelectChange = (name: string, values: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
    validateItems();
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  const isFormFilled = identificationDetailsSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const saveForm = () => {
    if (!validateItems()) return;
    SaleStore.addIdentificationDetails({
      ...formData,
      customerLGA: formData.customerLGA ?? "",
      customerIdImage: formData.customerIdImage,
      expirationDate: new Date(formData.expirationDate)?.toISOString(),
    });
    handleClose();
  };

  return (
    <div className="flex flex-col justify-between h-full max-h-[360px] py-4 pr-1 sm:pr-3 overflow-y-auto gap-4">
      <SelectInput
        label="ID Type"
        options={[
          { label: "NIN", value: "Nin" },
          { label: "Passport", value: "Passport" },
          { label: "Driver's License", value: "Driver_License" },
          { label: "Voter ID", value: "Voter_ID" },
          { label: "Social Security Number", value: "Social_Security_Number" },
        ]}
        value={formData.idType}
        onChange={(selectedValue) =>
          handleSelectChange("idType", selectedValue)
        }
        placeholder="Select ID Type"
        required={true}
        errorMessage={getFieldError("idType")}
      />
      <Input
        type="text"
        name="idNumber"
        label="ID Number"
        value={formData.idNumber}
        onChange={handleInputChange}
        placeholder="Enter ID Number"
        required={true}
        errorMessage={getFieldError("idNumber")}
      />
      {formData.customerIdImage.name}
      <FileInput
        name="customerIdImage"
        label="ID Image"
        onChange={handleInputChange}
        required={true}
        accept=".jpg,.jpeg,.png,.svg"
        placeholder="ID Image"
        errorMessage={getFieldError("customerIdImage")}
        value={formData.customerIdImage}
      />
      <Input
        type="text"
        name="customerCountry"
        label="Customer Country"
        value={formData.customerCountry}
        onChange={handleInputChange}
        placeholder="Enter Customer Country"
        required={true}
        errorMessage={getFieldError("customerCountry")}
      />
      <Input
        type="text"
        name="customerState"
        label="Customer State"
        value={formData.customerState}
        onChange={handleInputChange}
        placeholder="Enter Customer State"
        required={true}
        errorMessage={getFieldError("customerState")}
      />
      <Input
        type="text"
        name="customerLGA"
        label="Customer LGA"
        value={formData.customerLGA || ""}
        onChange={handleInputChange}
        placeholder="Enter Customer LGA"
        required={true}
        errorMessage={getFieldError("customerLGA")}
      />

      <Input
        type="date"
        name="expirationDate"
        label="Expiration Date"
        value={formData.expirationDate}
        onChange={handleInputChange}
        placeholder="Enter Expiration Date"
        required={true}
        errorMessage={getFieldError("expirationDate")}
        description={"Enter Expiration Date"}
      />
      <GooglePlacesInput
        type="text"
        name="homeAddress"
        label="Home Address"
        value={formData.installationAddress}
        placeholder="Search for a location"
        required={true}
        errorMessage={getFieldError("installationAddress")}
        onChange={(value) => {
          setFormData((prev) => ({
            ...prev,
            installationAddress: value.address,
            installationAddressLongitude: value.coordinates?.lng || "",
            installationAddressLatitude: value.coordinates?.lat || "",
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

export default IdentificationForm;
