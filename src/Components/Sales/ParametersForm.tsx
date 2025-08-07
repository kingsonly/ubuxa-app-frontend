import { useState } from "react";
import { FixedPercentageInput, Input, SelectInput } from "../InputComponent/Input";
import { z } from "zod";
import { SaleStore } from "@/stores/SaleStore";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { toJS } from "mobx";

const formSchema = z.object({
  paymentMode: z.string({
    required_error: "Payment mode is required",
  }),
  salesMode: z.string({
    required_error: "Sales mode is required",
  }),
  repaymentStyle: z.string({
    required_error: "Repayment Style is required",
  }).optional(),

  contractType: z.string({
    required_error: "Contract type Style is required",
  }).optional(),
  installmentDuration: z.number().optional(),
  installmentStartingPrice: z.number().optional(),
  installmentStartingPriceType: z.boolean().optional(),
  discount: z.number().optional(),
  discountType: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

const defaultFormData: FormData = {
  salesMode: "ONE_OFF",
  paymentMode: "CASH",
  installmentDuration: 0,
  installmentStartingPrice: 0,
  discount: 0,
  discountType: false,
  installmentStartingPriceType: false,
  repaymentStyle: "CLEAR_ARREARS",
  contractType: "MANUAL_SIGNING",
};

const ParametersForm = ({
  handleClose,
}: {
  handleClose: () => void;
  currentProductId: string;
}) => {
  const existingParamsNode = SaleStore.getParametersByProductId();
  const initialParams: FormData = existingParamsNode
    ? toJS(existingParamsNode)
    : defaultFormData;
  const [formData, setFormData] = useState<FormData>(
    initialParams
  );
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for installmentStartingPrice
    if (name === "installmentStartingPrice") {
      const numericValue = parseFloat(value);

      // If the value is greater than 100, set it to zero
      if (numericValue > 100) {
        setFormData((prev) => ({
          ...prev,
          [name]: 0, // Transform back to zero
        }));
        setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
        return;
      }

      // Otherwise, update the value as usual
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
      return;
    }

    // Handle other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };
  const handleOnSwitchChange = (
    e: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      ["installmentStartingPriceType"]: e, // Transform back to zero
    }));
    return
  };
  const handleOnSwitchDiscountChange = (
    e: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      ["discountType"]: e, // Transform back to zero
    }));
    return
  };
  const handleInitialAmountInput = (
    e: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      ["installmentStartingPrice"]: e, // Transform back to zero
    }));
    return
  };
  const handleDiscountInput = (
    e: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      ["discount"]: e, // Transform back to zero
    }));
    return
  };

  const handleSelectChange = (name: string, values: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  const isFormFilled =
    formData.salesMode === "ONE_OFF"
      ? Boolean(formData.salesMode)
      : Boolean(
        formData.salesMode &&
        formData.paymentMode &&
        formData.installmentDuration &&
        formData.installmentStartingPrice
      );
  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const validateItems = () => {
    const result = formSchema.safeParse({
      ...formData,
      installmentDuration:
        Number.parseFloat(formData.installmentDuration?.toString() || "") || 0,
      installmentStartingPrice:
        Number.parseFloat(
          formData.installmentStartingPrice?.toString() || ""
        ) || 0,
      discount: Number.parseFloat(formData.discount?.toString() || "") || 0,
    });
    if (!result.success) {
      setFormErrors(result.error.issues);
      return false;
    }
    setFormErrors([]);
    return true;
  };

  const saveForm = () => {
    if (!validateItems()) return;
    console.log("FORM DATA", formData);
    SaleStore.addParameters({
      ...formData,
      repaymentStyle: formData.repaymentStyle || "CLEAR_ARREARS",
      contractType: formData.contractType || "MANUAL_SIGNING",
      installmentDuration: Number(formData.installmentDuration) || 0,
      installmentStartingPrice: Number(formData.installmentStartingPrice) || 0,
      installmentStartingPriceType: formData.installmentStartingPriceType || false,
      discount: Number(formData.discount) || 0,
      discountType: formData.discountType || false,
    });
    SaleStore.addSaleItem();
    handleClose();
  };

  const MODE_TO_OPTION: Record<string, { label: string; value: string }> = {
    one_off: { label: "Single Deposit", value: "ONE_OFF" },
    installment: { label: "Installment", value: "INSTALLMENT" },
    eaas: { label: "Perpetuity", value: "EAAS" },
    // …and any other modes you might get
  };
  const rawPaymentModes =
    SaleStore.products?.productPaymentModes;
  const paymentModesArray = rawPaymentModes
    ?.split(",")
    .map((mode) => mode.trim().toLowerCase()) as string[];
  console.log("PAYMENT MODES", paymentModesArray);

  const paymentOptions = [
    { label: "Cash", value: "CASH" },
    { label: "POS", value: "POS" },
    { label: "System", value: "SYSTEM" },
  ];
  const repaymentOptions = [
    { label: "Clear Arrears", value: "CLEAR_ARREARS" },
    { label: "Pay-As-You-Go", value: "PAY_AS_YOU_GO" },
  ];
  const contractTypeOptions = [
    { label: "Manual", value: "MANUAL_SIGNING" },
    { label: "Automatic", value: "AUTOMATIC_SIGNING" },
  ];

  const salesOptions = paymentModesArray
    .map((mode) => MODE_TO_OPTION[mode])
    .filter(Boolean);

  return (
    <div className="flex flex-col justify-between w-full h-full h-full max-h-[360px] py-4 pr-1 sm:pr-3 overflow-y-auto  ">
      <div className="flex flex-col gap-6 mb-4">
        <SelectInput
          label="Payment Mode"
          options={paymentOptions}
          value={formData.paymentMode}
          onChange={(selectedValue) =>
            handleSelectChange("paymentMode", selectedValue)
          }
          placeholder="Select Payment Mode"
          required={true}
          errorMessage={getFieldError("paymentMode")}
        />

        <SelectInput
          label="Sales Mode"
          options={salesOptions}
          value={formData.salesMode}
          onChange={(selectedValue) =>
            handleSelectChange("salesMode", selectedValue)
          }
          placeholder="Select Sales Mode"
          required={true}
          errorMessage={getFieldError("salesMode")}
        />

        {formData.salesMode === "INSTALLMENT" || formData.salesMode === "EAAS" ? (
          <Input
            type="number"
            name="installmentDuration"
            label="NUMBER OF INSTALLMENTS"
            value={formData.installmentDuration as number}
            onChange={handleInputChange}
            placeholder="Number of Installments"
            required={true}
            errorMessage={getFieldError("installmentDuration")}
            description={
              formData.installmentDuration === 0
                ? "Enter Number of Installments"
                : ""
            }
          />
        ) : null}



        {formData.salesMode === "INSTALLMENT" || formData.salesMode === "EAAS" ? (
          <FixedPercentageInput
            name="initialPaymentAmount"
            label="INITIAL PAYMENT AMOUNT"
            value={formData.installmentStartingPrice as number}
            switchValue={formData.installmentStartingPriceType || false}
            onChange={(v: any) => handleInitialAmountInput(v)}
            onSwitchChange={(flag: any) => handleOnSwitchChange(flag)}
            placeholder="Enter initial amount"
            min={0}
            max={500}
            currency="₦"
            required
            errorMessage={getFieldError("installmentStartingPrice")}
            description="Enter Initial Payment Amount"
            className=""
          />
        ) : null}


        {formData.salesMode === "INSTALLMENT" || formData.salesMode === "EAAS" ? (
          <SelectInput
            label="Select contract type"
            options={contractTypeOptions}
            value={formData.contractType || "MANUAL_SIGNING"}
            onChange={(selectedValue) =>
              handleSelectChange("contractType", selectedValue)
            }
            placeholder="Select Contract Type"
            required={true}
            errorMessage={getFieldError("contractType")}
          />


        )
          : null
        }
        {formData.salesMode === "INSTALLMENT" || formData.salesMode === "EAAS" ? (
          <SelectInput
            label="Select How Repayments Are Applied"
            options={repaymentOptions}
            value={formData.repaymentStyle || "CLEAR_ARREARS"}
            onChange={(selectedValue) =>
              handleSelectChange("repaymentStyle", selectedValue)
            }
            placeholder="Select How Repayments Are Applied"
            required={true}
            errorMessage={getFieldError("repaymentStyle")}
          />


        )
          : null
        }

        <FixedPercentageInput
          name="discount"
          label="DISCOUNT"
          value={formData.discount as number}
          switchValue={formData.discountType || false}
          onChange={(v: any) => handleDiscountInput(v)}
          onSwitchChange={(flag: any) => handleOnSwitchDiscountChange(flag)}
          placeholder="Enter discount"
          min={0}
          max={500}
          currency="₦"
          required
          errorMessage={getFieldError("discount")}
          description="Enter Discount"
          className=""
        />



      </div>
      <div className="flex items-center justify-between gap-1">
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

export default ParametersForm;
