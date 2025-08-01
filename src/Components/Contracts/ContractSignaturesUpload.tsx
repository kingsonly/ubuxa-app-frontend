import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { FileInput } from "../InputComponent/Input";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";
import { useApiCall } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";

interface ContractSignaturesUploadProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    contractId: string;
    contractRefresh?: KeyedMutator<any>;
    onSuccess?: () => void;
}

interface SignatureFiles {
    owner?: File | null;
    nextOfKin?: File | null;
    guarantor?: File | null;
}




const signatureSchema = z.object({
    owner: z
        .instanceof(File)
        .refine(
            (file) =>
                ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(
                    file.type
                ),
            {
                message: "Only PNG, JPEG, JPG, or SVG files are allowed for owner signature.",
            }
        ),

    guarantor: z
        .instanceof(File)
        .refine(
            (file) =>
                ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(
                    file.type
                ),
            {
                message: "Only PNG, JPEG, JPG, or SVG files are allowed for guarantor signature.",
            }
        ),

    nextOfKin: z
        .instanceof(File)
        .refine(
            (file) =>
                ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(
                    file.type
                ),
            {
                message: "Only PNG, JPEG, JPG, or SVG files are allowed for next-of-kin signature.",
            }
        )
        .nullable()
        .optional(),
});

const defaultFormData: SignatureFiles = {
    owner: null,
    nextOfKin: null,
    guarantor: null,
};

const ContractSignaturesUpload = ({
    isOpen,
    setIsOpen,
    contractId,
    contractRefresh,
    // onSuccess,
}: ContractSignaturesUploadProps) => {
    const { apiCall } = useApiCall();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SignatureFiles>(defaultFormData);
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
    const [apiError, setApiError] = useState<string | Record<string, string[]>>("");

    const handleFileChange = (e: { target: { name: string; files: FileList | null } }) => {
        const { name, files } = e.target;

        if (files && files.length > 0) {
            setFormData((prev) => ({
                ...prev,
                [name]: files[0],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: null,
            }));
        }

        resetFormErrors(name);
    };

    const resetFormErrors = (name: string) => {
        // Clear the error for this field when the user starts interacting
        setFormErrors((prev) => prev.filter((error) =>
            error.path[0] !== name && error.path[0] !== "general"
        ));
        setApiError("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate the form data
            const validatedData = signatureSchema.parse(formData);

            // Create FormData for multipart upload
            const submissionData = new FormData();

            if (validatedData.owner) {
                submissionData.append('owner', validatedData.owner);
            }
            if (validatedData.nextOfKin) {
                submissionData.append('nextOfKin', validatedData.nextOfKin);
            }
            if (validatedData.guarantor) {
                submissionData.append('guarantor', validatedData.guarantor);
            }

            // Upload signatures
            await apiCall({
                endpoint: `/v1/contract/${contractId}/signatures`,
                method: "post",
                data: submissionData,
                successMessage: "Contract signatures uploaded successfully!",
            });

            setIsOpen(false);
            // Refresh contract data if callback provided
            if (contractRefresh) {
                await contractRefresh();
            }

            // Close modal and reset form
            setFormData(defaultFormData);
            setFormErrors([]);
            setApiError("");

        } catch (error: any) {
            if (error instanceof z.ZodError) {
                setFormErrors(error.issues);
            } else {
                const message =
                    error?.response?.data?.message ||
                    "Signature upload failed: Internal Server Error";
                setApiError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const hasFiles = Boolean(formData.owner && formData.guarantor);

    const getFieldError = (fieldName: string) => {
        return formErrors.find((error) => error.path[0] === fieldName)?.message;
    };

    const getGeneralError = () => {
        return formErrors.find((error) => error.path[0] === "general")?.message;
    };

    const handleClose = () => {
        setIsOpen(false);
        setFormData(defaultFormData);
        setFormErrors([]);
        setApiError("");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            layout="right"
            bodyStyle="pb-[100px]"
            size="small"
        >
            <form
                className="flex flex-col items-center bg-white"
                onSubmit={handleSubmit}
                noValidate
            >
                <div
                    className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${hasFiles ? "bg-paleCreamGradientLeft" : "bg-paleGrayGradientLeft"
                        }`}
                >
                    <h2
                        style={{ textShadow: "1px 1px grey" }}
                        className="text-xl text-textBlack font-semibold font-secondary"
                    >
                        Upload Contract Signatures
                    </h2>
                </div>

                <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
                    <div className="w-full mb-2">
                        <p className="text-sm text-gray-600 mb-4">
                            Upload signature files for the contract. At least two signatures are required.
                        </p>
                    </div>

                    <FileInput
                        name="owner"
                        label="OWNER SIGNATURE"
                        onChange={handleFileChange}
                        required
                        accept=".jpg,.jpeg,.png,.svg"
                        placeholder="Upload Owner Signature"
                        errorMessage={getFieldError("owner")}
                    />
                    <FileInput
                        name="guarantor"
                        label="GUARANTOR SIGNATURE"
                        onChange={handleFileChange}
                        required
                        accept=".jpg,.jpeg,.png,.svg"
                        placeholder="Upload Guarantor Signature"
                        errorMessage={getFieldError("guarantor")}
                    />
                    <FileInput
                        name="nextOfKin"
                        label="NEXT OF KIN SIGNATURE"
                        onChange={handleFileChange}
                        required={false}
                        accept=".jpg,.jpeg,.png,.svg"
                        placeholder="Upload Next of Kin Signature"
                        errorMessage={getFieldError("nextOfKin")}
                    />

                    {/* Display general validation error */}
                    {getGeneralError() && (
                        <div className="w-full">
                            <p className="text-red-500 text-sm mt-1 text-wrap px-2">{getGeneralError()}</p>
                        </div>
                    )}

                    <ApiErrorMessage apiError={apiError} />

                    <ProceedButton
                        type="submit"
                        loading={loading}
                        variant={hasFiles ? "gradient" : "gray"}
                        disabled={!hasFiles}
                        className="mt-5"

                    />
                </div>
            </form>
        </Modal>
    );
};

export default ContractSignaturesUpload;