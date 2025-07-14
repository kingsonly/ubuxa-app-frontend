import { useState } from "react";
import { Input, SelectInput } from "../InputComponent/Input";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { SaleStore } from "@/stores/SaleStore";
import MiscellaneousForm from "./MiscellaneousForm";

// Replace with your own component if needed
const MiscellaneousCostInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => (
  <Input
    type="number"
    name="miscellaneousCost"
    label="Miscellaneous Cost"
    value={value.toString()}
    onChange={(e) => onChange(Number(e.target.value))}
    placeholder="Enter Miscellaneous Cost"
  />
);

const InventorySaleParametersForm = ({
  handleClose,
}: {
  handleClose: () => void;
}) => {
  const [modeOfPayment, setModeOfPayment] = useState("");
  const [discount, setDiscount] = useState<number | undefined>(undefined);
  const [miscellaneousCost, setMiscellaneousCost] = useState<number>(0);

  const isFormFilled = !!modeOfPayment;

  const handleSave = () => {
    SaleStore.setSaleParameters({
      modeOfPayment,
      discount,
      miscellaneousCost,
    });
    handleClose();
  };

  return (
    <div className="flex flex-col justify-between h-full max-h-[300px] py-4 pr-1 sm:pr-3 overflow-y-auto gap-4">
      <SelectInput
        label="Mode of Payment"
        value={modeOfPayment}
        onChange={(value) => setModeOfPayment(value)}
        options={[
          { label: "POS", value: "POS" },
          { label: "Cash", value: "CASH" },
          { label: "Transfer", value: "TRANSFER" },
        ]}
        placeholder="Select Mode"
        required
      />

      <Input
        type="number"
        name="discount"
        label="Discount (Optional)"
        value={discount?.toString() || ""}
        onChange={(e) => setDiscount(Number(e.target.value))}
        placeholder="Enter Discount"
      />

      <MiscellaneousForm handleClose={handleClose} />

      <div className="flex items-center justify-between gap-2 mt-4">
        <SecondaryButton variant="secondary" onClick={handleClose}>
          Cancel
        </SecondaryButton>
        <SecondaryButton disabled={!isFormFilled} onClick={handleSave}>
          Save
        </SecondaryButton>
      </div>
    </div>
  );
};

export default InventorySaleParametersForm;
