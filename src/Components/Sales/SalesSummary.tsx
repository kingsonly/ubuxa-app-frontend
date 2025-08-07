import React, { useState } from "react";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import settingsicon from "../../assets/settings.svg";
import producticon from "../../assets/product-grey.svg";
import { SaleStore } from "@/stores/SaleStore";
import { Tag } from "../Products/ProductDetails";
import { NameTag } from "../CardComponents/CardComponent";
import { ProductDetailRow } from "./ProductSaleDisplay";
import { IoReturnUpBack } from "react-icons/io5";
import { capitalizeFirstLetter, formatLabel, formatNumberWithCommas, resolveParamDisplay } from "@/utils/helpers";
import creditcardicon from "../../assets/creditcardgrey.svg";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { FlutterwaveConfig } from "flutterwave-react-v3/dist/types";
import { toast } from "react-toastify";

const SalesSummary = ({
  setSummaryState,
  resetSaleModalState,
  loading,
  getIsFormFilled,
  apiErrorMessage,
}: {
  setSummaryState: React.Dispatch<React.SetStateAction<boolean>>;
  resetSaleModalState: () => void;
  loading: boolean;
  getIsFormFilled: () => any;
  apiErrorMessage: React.ReactNode;
}) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const paymentInfo = SaleStore.paymentDetails;
  const handleFlutterPayment = useFlutterwave(paymentInfo as FlutterwaveConfig);
  const salesData = SaleStore.products

  const initializePayment = () => {
    if (paymentInfo === null) {
      setPaymentError("Payment details not found.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    handleFlutterPayment({
      callback: (response) => {
        console.log("Flutterwave Response:", response);
        setPaymentLoading(false);
        closePaymentModal();
        toast.success("Payment Successful");
      },
      onClose: () => {
        setPaymentLoading(false);
        resetSaleModalState();
        toast.info("Payment Cancelled");
      },
    });
  };

  const renderSummary = (salesData: any) => {
    const params = SaleStore.getParametersByProductId();
    const identificationDetails = SaleStore.identificationDetails;
    const guarantorDetails = SaleStore.guarantorDetails;
    const nextOfKinDetails = SaleStore.nextOfKinDetails;

    const miscellaneousCosts = SaleStore.getMiscellaneousByProductId()?.costs;
    const miscCostsExist = miscellaneousCosts ? Object.keys(miscellaneousCosts).length >= 1 : false;

    return (
      <div
        className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]"
      >
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={producticon} alt="Product Icon" /> PRODUCT{" "}

        </p>

        <ProductDetailRow
          label="Product Category"
          value={salesData.productTag}
        />
        <ProductDetailRow
          label="Product Name"
          value={salesData.productName}
        />
        <ProductDetailRow
          label="Product Quantity"
          value={salesData.productUnits}
        />
        <ProductDetailRow
          label="Product Price"
          value={salesData.productPrice}
        />

        <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <p className="text-sm font-medium text-textGreyTwo mb-1">Sales Parameters</p>
          {Object.entries(params || {}).map(([key, value]) => {
            const display = resolveParamDisplay(key, value, params);
            if (!display) return null;

            return (
              <ProductDetailRow
                key={key}
                label={display.label}
                value={display.formattedValue}
                showNaira={display.showNaira}
              />
            );
          })}
        </div>

        {params?.salesMode === "INSTALLMENT" ?
          <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="text-sm font-medium text-textGreyTwo mb-1">Identification Details </p>
            {

              Object.entries(identificationDetails || {}).map(([key, value]) => {

                return (
                  key !== "customerIdImage" ?
                    <ProductDetailRow
                      key={identificationDetails.customerCountry}
                      label={formatLabel(key)}
                      value={key === "expirationDate" ? new Date(value).toLocaleDateString() : formatLabel(value)}
                      showNaira={false}

                    />
                    :

                    <div className="flex items-center justify-between p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                      <Tag name={formatLabel(key)} />
                      <div className="flex items-center justify-center w-full p-2 max-w-[70%] h-[100px] gap-2 border-[0.6px] border-strokeCream rounded-[20px] overflow-clip">
                        <img
                          src={URL.createObjectURL(value) || "/placeholder.svg"}
                          alt="Product Image"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>


                    </div>
                );
              })}
          </div>
          : null}
        {params?.salesMode === "INSTALLMENT" ?
          <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="text-sm font-medium text-textGreyTwo mb-1">Guarantor Details</p>
            {Object.entries(guarantorDetails || {}).map(([key, value]) => {
              return (
                <ProductDetailRow
                  key={key}
                  label={formatLabel(key)}
                  value={formatLabel(value)}
                  showNaira={false}
                />
              );
            })}
          </div>
          : null}
        {params?.salesMode === "INSTALLMENT" && nextOfKinDetails.fullName.length > 0 && nextOfKinDetails.phoneNumber.length > 0 ?
          <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="text-sm font-medium text-textGreyTwo mb-1">Next of kin Details</p>
            {Object.entries(nextOfKinDetails || {}).map(([key, value]) => {
              return (
                <ProductDetailRow
                  key={key}
                  label={formatLabel(key)}
                  value={formatLabel(value)}
                  showNaira={false}
                />
              );
            })}
          </div>
          : null}

        {!miscCostsExist ? null : (
          <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="text-sm font-medium text-textGreyTwo mb-1">Miscellaneous Costs</p>
            {miscellaneousCosts && Array.from(miscellaneousCosts.entries()).map(
              ([name, cost], index) => (
                <ProductDetailRow
                  key={index}
                  label={capitalizeFirstLetter(name)}
                  value={formatNumberWithCommas(cost)}
                  showNaira={true}
                />
              )
            )}

            {miscellaneousCosts && (
              <div className="pt-2 border-t border-strokeGreyThree mt-2">
                <ProductDetailRow
                  label="Total Miscellaneous"
                  value={formatNumberWithCommas(
                    Array.from(miscellaneousCosts.values()).reduce((sum, cost) => sum + cost, 0)
                  )}
                  showNaira={true}
                />
              </div>
            )}
          </div>
        )}

      </div>
    );

  }

  return (
    <>
      {!SaleStore.paymentDetails.tx_ref ? (
        <>
          <div className="flex w-full">
            <p
              className="flex gap-1 items-center text-xs font-bold text-textDarkGrey cursor-pointer hover:underline"
              onClick={() => setSummaryState(false)}
            >
              <IoReturnUpBack />
              Back to form
            </p>
          </div>
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={settingsicon} alt="Settings Icon" /> GENERAL DETAILS
            </p>
            <ProductDetailRow
              label="Sale Category"
              value={SaleStore.category}
            />
            <div className="flex items-center justify-between">
              <Tag name="Customer" />
              <div className="text-xs font-bold text-textDarkGrey">
                <NameTag name={SaleStore.customer?.customerName} />
              </div>
            </div>
          </div>
          {renderSummary(salesData)}

          {apiErrorMessage}

          <ProceedButton
            type="submit"
            loading={loading}
            variant={getIsFormFilled() ? "gradient" : "gray"}
            disabled={!getIsFormFilled()}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={creditcardicon} alt="Settings Icon" /> PAYMENT DETAILS
            </p>
            <div className="flex items-center justify-between">
              <Tag name="Customer Name" />
              <div className="text-xs font-bold text-textDarkGrey">
                <NameTag name={paymentInfo?.customer?.email || "N/A"} />
              </div>
            </div>
            <ProductDetailRow
              label="Payment Amount"
              value={formatNumberWithCommas(paymentInfo?.amount || 0)}
            />
            <ProductDetailRow
              label="Payment Currency"
              value={paymentInfo?.currency || ""}
            />
            <ProductDetailRow
              label="Payment Description"
              value={paymentInfo?.customizations?.description || ""}
            />
          </div>

          {paymentError && (
            <div className="p-3 mt-4 border border-red-500 rounded-md bg-red-50">
              <p className="text-red-600 text-sm">{paymentError}</p>
            </div>
          )}

          <ProceedButton
            type="button"
            onClick={initializePayment}
            loading={paymentLoading}
            variant="gradient"
            disabled={paymentLoading}
          />
        </>
      )}
    </>
  );
};

export default SalesSummary;
