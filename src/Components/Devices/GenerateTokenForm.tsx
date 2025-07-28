import { useEffect, useState } from "react";
import { Input, ToggleInput } from "../InputComponent/Input";
import { z } from "zod";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { useApiCall } from "@/utils/useApiCall";
import InfoTooltip from "../Info/InfoTooltip";
import { infoMessages } from "@/lib/infoMessages";

const formSchema = z.object({
    unlockStatus: z.boolean(),
    duration: z.number().min(-1, "Duration must be at least 1"),
});

type FormData = z.infer<typeof formSchema>;



const GenerateTokenForm = ({
    handleClose,
    deviceId,
}: {
    handleClose: (status: boolean) => void;
    deviceId: string;
}) => {
    const { apiCall } = useApiCall();
    const defaultFormData: FormData = {
        unlockStatus: false,
        duration: 1,
    };
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [loading, setLoading] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

    useEffect(() => {
        if (formData.unlockStatus) {
            setFormData((prev) => ({
                ...prev,
                duration: -1,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                duration: 1,
            }));
        }
    }, [formData.unlockStatus])
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        // Handle other fields
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'duration' ? Number(value) : value,
        }));
        setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    };

    const switchUnlockStatus = (value: boolean) => {
        setFormData((prev) => ({
            ...prev,
            unlockStatus: value,
        }));
    }

    const getFieldError = (fieldName: string) => {
        return formErrors.find((error) => error.path[0] === fieldName)?.message;
    };

    const validateItems = () => {
        const result = formSchema.safeParse({
            ...formData,
        });
        if (!result.success) {
            setFormErrors(result.error.issues);
            return false;
        }
        setFormErrors([]);
        return true;
    };

    const generateToken = async () => {
        if (!validateItems()) return;
        setLoading(true);
        try {
            await apiCall({
                endpoint: `/v1/device/${deviceId}/generate-token`,
                method: "post",
                data: formData,
                successMessage: "Token Generated Successfully, and would be emailed to you shortly",
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
            <div>
                <div className="flex items-center justify-between  w-full border-strokeCream rounded-3xl border-[0.6px] px-[1.1em] ">
                    <p className=" flex gap-1 text-sm text-textBlack font-semibold">
                        <span >Unlock Forever</span>  <InfoTooltip message={infoMessages.device.unlock} />
                    </p>
                    <div className="flex items-center">
                        <ToggleInput
                            defaultChecked={formData.unlockStatus}
                            onChange={(checked: boolean) => {
                                switchUnlockStatus(checked);
                            }}
                        />
                        <span className="flex items-center justify-center gap-0.5 bg-[#F6F8FA] px-2 h-6 rounded-full text-xs font-medium capitalize border-[0.6px] border-strokeGreyTwo">
                            {formData.unlockStatus ? <span className='text-green-500'>YES</span> : <span className='text-errorTwo'>NO</span>}
                        </span>
                    </div>

                </div>
                <div className="flex flex-col mt-6">
                    <Input
                        type="number"
                        name="duration"
                        label="Duration"
                        value={formData.duration as number}
                        onChange={handleInputChange}
                        placeholder="Token Duration"
                        required={true}
                        errorMessage={getFieldError("duration")}
                        description=" Enter Token Duration in days"
                        disabled={formData.unlockStatus}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between gap-1">
                <SecondaryButton
                    variant="secondary"
                    children="Cancel"
                    onClick={() => handleClose(false)}
                />
                {loading ? <SecondaryButton
                    disabled={true}
                    variant="secondary"
                >
                    <img src="/Images/loader.gif" alt="Loader" width={28} height={28} />
                </SecondaryButton>

                    :
                    <SecondaryButton
                        disabled={!formData.duration}
                        children="Generate Token"
                        onClick={generateToken}
                    />
                }

            </div>
        </div>
    );
};

export default GenerateTokenForm;
