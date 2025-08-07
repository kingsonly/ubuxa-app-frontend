import React, { useState } from "react";
import { Input } from "../InputComponent/Input";
import { useStoreManagement } from "@/hooks/useStoreManagement";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";
import { Modal } from "../ModalComponent/Modal";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { SelectInput, ToggleInput } from "../InputComponent/Input";
import { CreateStorePayload, StoreClass } from "@/types/store";

const formSchema = z.object({
  name: z.string().min(1, "Store Name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  classification: z.nativeEnum(StoreClass),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateNewStoreProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onStoreCreated?: () => void;
}

const CreateNewStore: React.FC<CreateNewStoreProps> = ({ isOpen, setIsOpen, onStoreCreated }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    classification: StoreClass.BRANCH,
    isActive: true,
  });

  const { createStore, loading } = useStoreManagement();
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => prev.filter((err) => err.path[0] !== name));
    setApiError("");
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => prev.filter((err) => err.path[0] !== name));
    setApiError("");
  };

  const handleToggleChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => prev.filter((err) => err.path[0] !== name));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setApiError("");

    const result = formSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.issues);
      return;
    }

    try {
      const payload: CreateStorePayload = {
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        classification: formData.classification,
        isActive: formData.isActive,
      };

      await createStore(payload);
      
      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        classification: StoreClass.BRANCH,
        isActive: true,
      });
      setIsOpen(false);
      onStoreCreated?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to create store";
      setApiError(errorMessage);
    }
  };

  const isFormFilled = formData.name.trim() !== "";

  const getFieldError = (field: keyof FormData) => {
    return formErrors.find((err) => err.path[0] === field)?.message;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      layout="right"
      bodyStyle="pb-[100px]"
    >
      <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleCreamGradientLeft">
        <h2 className="text-xl text-textBlack font-semibold font-secondary" style={{ textShadow: "1px 1px grey" }}>
          New Store
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center bg-white w-full px-[2.5em] gap-4 py-8" noValidate>
        <Input
          type="text"
          name="name"
          label="STORE NAME"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter Store Name"
          required={true}
          errorMessage={getFieldError("name")}
        />
        
        <Input
          type="text"
          name="description"
          label="DESCRIPTION"
          value={formData.description || ""}
          onChange={handleInputChange}
          placeholder="Enter Store Description (Optional)"
          required={false}
          errorMessage={getFieldError("description")}
        />
        
        <Input
          type="text"
          name="address"
          label="ADDRESS"
          value={formData.address || ""}
          onChange={handleInputChange}
          placeholder="Enter Store Address (Optional)"
          required={false}
          errorMessage={getFieldError("address")}
        />
        
        <Input
          type="tel"
          name="phone"
          label="PHONE"
          value={formData.phone || ""}
          onChange={handleInputChange}
          placeholder="Enter Phone Number (Optional)"
          required={false}
          errorMessage={getFieldError("phone")}
        />
        
        <Input
          type="email"
          name="email"
          label="EMAIL"
          value={formData.email || ""}
          onChange={handleInputChange}
          placeholder="Enter Email Address (Optional)"
          required={false}
          errorMessage={getFieldError("email")}
        />
        
        <SelectInput
          label="STORE CLASSIFICATION"
          value={formData.classification}
          onChange={(value: string) => handleSelectChange("classification", value)}
          options={[
            { label: "Main Store", value: StoreClass.MAIN },
            { label: "Branch Store", value: StoreClass.BRANCH },
            { label: "Outlet Store", value: StoreClass.OUTLET },
          ]}
          required={true}
          errorMessage={getFieldError("classification")}
          placeholder="Select Store Classification"
        />
        
        <div className="flex items-center justify-between gap-2 w-full">
          <p className="text-sm text-textBlack font-semibold">Store Active</p>
          <ToggleInput
            defaultChecked={formData.isActive}
            onChange={(checked: boolean) => handleToggleChange("isActive", checked)}
          />
        </div>
        
        <ApiErrorMessage apiError={apiError} />
        
        <ProceedButton
          type="submit"
          disabled={!isFormFilled || loading}
          loading={loading}
          variant={isFormFilled ? "gradient" : "gray"}
        />
      </form>
    </Modal>
  );
};

export default CreateNewStore;