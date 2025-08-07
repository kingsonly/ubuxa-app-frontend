import React, { useState, useEffect } from "react";
import { Modal } from "../ModalComponent/Modal";
import { Input, SelectInput, ToggleInput } from "../InputComponent/Input";
import { useStoreManagement } from "@/hooks/useStoreManagement";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { UpdateStorePayload, StoreClass } from "@/types/store";
import { observer } from "mobx-react-lite";

const updateFormSchema = z.object({
  name: z.string().min(1, "Store Name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  classification: z.nativeEnum(StoreClass),
  isActive: z.boolean(),
});

type UpdateFormData = z.infer<typeof updateFormSchema>;

interface StoreDetailModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
  onStoreUpdated?: () => void;
}

const StoreDetailModal: React.FC<StoreDetailModalProps> = observer(({ 
  isOpen, 
  setIsOpen, 
  storeId, 
  onStoreUpdated 
}) => {
  const { 
    selectedStore, 
    fetchStoreById, 
    updateStore, 
    deleteStore, 
    loading 
  } = useStoreManagement();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateFormData>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    classification: StoreClass.BRANCH,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>("");

  useEffect(() => {
    if (isOpen && storeId) {
      fetchStoreById(storeId);
    }
  }, [isOpen, storeId]);

  useEffect(() => {
    if (selectedStore) {
      setFormData({
        name: selectedStore.name,
        description: selectedStore.description || "",
        address: selectedStore.address || "",
        phone: selectedStore.phone || "",
        email: selectedStore.email || "",
        classification: selectedStore.classification as StoreClass,
        isActive: selectedStore.isActive,
      });
    }
  }, [selectedStore]);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setApiError("");

    const result = updateFormSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.issues);
      return;
    }

    try {
      const payload: UpdateStorePayload = {
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        classification: formData.classification,
        isActive: formData.isActive,
      };

      await updateStore(storeId, payload);
      setIsEditing(false);
      onStoreUpdated?.();
    } catch (error: any) {
      console.log(error)
      const errorMessage = error?.response?.data?.message || "Failed to update store";
      setApiError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this store? This action cannot be undone.")) {
      try {
        await deleteStore(storeId);
        setIsOpen(false);
        onStoreUpdated?.();
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Failed to delete store";
        setApiError(errorMessage);
      }
    }
  };

  const getFieldError = (field: keyof UpdateFormData) => {
    return formErrors.find((err) => err.path[0] === field)?.message;
  };

  const isFormFilled = formData.name.trim() !== "";

  if (!selectedStore && !loading) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setIsEditing(false);
      }}
      layout="right"
      bodyStyle="pb-[100px]"
    >
      <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleCreamGradientLeft">
        <h2 className="text-xl text-textBlack font-semibold font-secondary" style={{ textShadow: "1px 1px grey" }}>
          {isEditing ? "Edit Store" : "Store Details"}
        </h2>
      </div>
        <div className="flex flex-col items-center bg-white w-full px-[2.5em] gap-4 py-8">
          {!isEditing ? (
            // View Mode
            <>
              <div className="w-full space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-textBlack">STORE NAME</label>
                  <p className="text-textDarkGrey bg-gray-50 p-3 rounded-md">{selectedStore?.name}</p>
                </div>
                
                {selectedStore?.description && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-textBlack">DESCRIPTION</label>
                    <p className="text-textDarkGrey bg-gray-50 p-3 rounded-md">{selectedStore.description}</p>
                  </div>
                )}
                
                {selectedStore?.address && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-textBlack">ADDRESS</label>
                    <p className="text-textDarkGrey bg-gray-50 p-3 rounded-md">{selectedStore.address}</p>
                  </div>
                )}
                
                {selectedStore?.phone && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-textBlack">PHONE</label>
                    <p className="text-textDarkGrey bg-gray-50 p-3 rounded-md">{selectedStore.phone}</p>
                  </div>
                )}
                
                {selectedStore?.email && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-textBlack">EMAIL</label>
                    <p className="text-textDarkGrey bg-gray-50 p-3 rounded-md">{selectedStore.email}</p>
                  </div>
                )}
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-textBlack">CLASSIFICATION</label>
                  <p className="text-textDarkGrey bg-gray-50 p-3 rounded-md">{selectedStore?.classification}</p>
                </div>
                
                <div className="flex items-center justify-between gap-2 w-full">
                  <p className="text-sm text-textBlack font-semibold">Store Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedStore?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedStore?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4 w-full mt-6">
                <SecondaryButton
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete Store
                </SecondaryButton>
                <SecondaryButton
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  Edit Store
                </SecondaryButton>
              </div>
            </>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdate} className="w-full space-y-4" noValidate>
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
              
              <div className="flex items-center justify-center w-full mt-6">
               
                <ProceedButton
                  type="submit"
                  disabled={!isFormFilled || loading}
                  loading={loading}
                  variant={isFormFilled ? "gradient" : "gray"}
                />
              </div>
            </form>
          )}
        </div>
      
    </Modal>
  );
});

export default StoreDetailModal;