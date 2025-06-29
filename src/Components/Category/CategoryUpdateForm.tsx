import { useState } from "react";
import { Input } from "../InputComponent/Input";
import { z } from "zod";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { Category } from "../Products/CreateNewProduct";
import { useApiCall } from "@/utils/useApiCall";

const formSchema = z.object({
    name: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;



const CategoryUpdateForm = ({
    handleClose,
    categoryData,
}: {
    handleClose: (status: boolean) => void;
    categoryData: Category;
}) => {
    const { apiCall } = useApiCall();
    const defaultFormData: FormData = {
        name: categoryData.name,
    };
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [loading, setLoading] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        // Handle other fields
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    };

    const getFieldError = (fieldName: string) => {
        return formErrors.find((error) => error.path[0] === fieldName)?.message;
    };

    const validateItems = () => {
        const result = formSchema.safeParse({
            ...formData,
            name: formData.name,
        });
        if (!result.success) {
            setFormErrors(result.error.issues);
            return false;
        }
        setFormErrors([]);
        return true;
    };

    const updateCategory = async () => {
        if (!validateItems()) return;
        setLoading(true);
        try {
            await apiCall({
                endpoint: `/v1/inventory/update-inventory-category/${categoryData.id}`,
                method: "put",
                data: formData,
                successMessage: "Category updated successfully!",
            })
            handleClose(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="flex flex-col justify-between w-full h-full min-h-[360px]">
            <div className="flex flex-col gap-3">
                <Input
                    type="text"
                    name="name"
                    label="CATEGORY NAME"
                    value={formData.name as string}
                    onChange={handleInputChange}
                    placeholder="Category Name"
                    required={true}
                    errorMessage={getFieldError("name")}
                    description=" Enter Category Name"
                />
            </div>
            <div className="flex items-center justify-between gap-1">
                <SecondaryButton
                    variant="secondary"
                    children="Cancel"
                    onClick={() => handleClose(false)}
                />
                {loading ? <SecondaryButton
                    disabled={true}
                >
                    <img src="/Images/loader.gif" alt="Loader" width={28} height={28} />
                </SecondaryButton>

                    :
                    <SecondaryButton
                        disabled={!formData.name}
                        children="Save"
                        onClick={updateCategory}
                    />
                }

            </div>
        </div>
    );
};

export default CategoryUpdateForm;
