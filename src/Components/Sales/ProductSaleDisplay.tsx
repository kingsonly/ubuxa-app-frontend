// import React from "react";
// import { Tag } from "../Products/ProductDetails";
// import {
//   NairaSymbol,
//   ProductTag,
//   SimpleTag,
// } from "../CardComponents/CardComponent";
// import { RiDeleteBin5Fill } from "react-icons/ri";
// import { ExtraInfoType } from "./CreateNewSale";
// import { SaleStore } from "@/stores/SaleStore";
// import { observer } from "mobx-react-lite";
// import ExtraInfoPill from "./ExtraInfoPill";

// export const ProductDetailRow = ({
//   label,
//   value,
//   showNaira = false,
//   title,
// }: {
//   label: string;
//   value: string | number;
//   showNaira?: boolean;
//   title?: string;
// }) => (
//   <div className="flex items-center justify-between gap-2 w-full">
//     <Tag name={label} />
//     <p
//       className="flex gap-1 items-center justify-end text-xs font-bold text-textDarkGrey"
//       title={title}
//     >
//       {showNaira && <NairaSymbol />}
//       {label === "Product Category" ? <ProductTag productTag={value} /> : value}
//     </p>
//   </div>
// );

// export const ExtraInfoSection = ({
//   label,
//   onClear,
// }: {
//   label: string;
//   onClear: () => void;
// }) => (
//   <div className="flex flex-col gap-2 w-full">
//     <div className="flex items-center justify-between w-full">
//       <div className="flex items-center justify-between w-max gap-2">
//         <p className="text-textDarkGrey text-sm font-semibold">{label}</p>
//         <SimpleTag
//           text={"SAVED"}
//           dotColour="#00AF50"
//           containerClass="bg-[#F6F8FA] text-success font-semibold px-2 py-1 border-[0.4px] border-strokeGreyThree rounded-full"
//         />
//       </div>
//       <button
//         type="button"
//         className="text-sm font-semibold text-errorTwo"
//         title={`Clear ${label}`}
//         onClick={() => {
//           onClear();
//         }}
//       >
//         Clear
//       </button>
//     </div>
//   </div>
// );

// const ProductSaleDisplay = observer(
//   ({
//     productData,
//     onRemoveProduct,
//     setExtraInfoModal,
//     getIsFormFilled,
//     getFieldError,
//   }: {
//     productData: {
//       productId: string;
//       productName: string;
//       productUnits: number;
//       productImage: string;
//       productPrice: string;
//       productTag: string;
//     };
//     onRemoveProduct: (productId: string) => void;
//     setExtraInfoModal: React.Dispatch<React.SetStateAction<ExtraInfoType>>;
//     getIsFormFilled: () => boolean;
//     getFieldError: (fieldName: string, productId: string) => string[];
//   }) => {
//     const { productTag, productId, productName, productUnits, productPrice } =
//       productData;

//     const doesParamsExist = Boolean(
//       SaleStore.getParametersByProductId(productId)
//     );
//     const miscellaneousCosts =
//       SaleStore.getMiscellaneousByProductId(productId)?.costs;
//     const doesDevicesExist = Boolean(SaleStore.getSelectedDevices(productId));
//     const doesRecipientExist = Boolean(
//       SaleStore.getRecipientByProductId(productId)
//     );

//     const types = ["parameters", "miscellaneous", "devices", "recipient"];

//     const allErrors = [
//       ...getFieldError("quantity", productId),
//       ...getFieldError("paymentMode", productId),
//       ...getFieldError("installmentDuration", productId),
//       ...getFieldError("installmentStartingPrice", productId),
//       ...getFieldError("devices", productId),
//       ...getFieldError("miscellaneousPrices", productId),
//       ...getFieldError("saleRecipient", productId),
//     ];

//     return (
//       <div className="flex flex-col gap-2 w-full p-2.5 border-[0.6px] border-strokeGreyThree rounded-[20px]">
//         <ProductDetailRow label="Product Category" value={productTag} />
//         <ProductDetailRow label="Product Name" value={productName} />
//         <ProductDetailRow label="Product Quantity" value={productUnits} />
//         <ProductDetailRow label="Product Price" value={productPrice} />

//         <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
//           {doesParamsExist && (
//             <ExtraInfoSection
//               label="Parameters"
//               onClear={() => SaleStore.removeParameter(productId)}
//             />
//           )}
//           {miscellaneousCosts && Object.keys(miscellaneousCosts).length > 0 && (
//             <ExtraInfoSection
//               label="Miscellaneous Costs"
//               onClear={() => SaleStore.removeMiscellaneousPrice(productId)}
//             />
//           )}
//           {doesDevicesExist && (
//             <ExtraInfoSection
//               label="Devices"
//               onClear={() => {
//                 SaleStore.removeDevices(productId);
//                 SaleStore.removeTentativeDevices(productId);
//               }}
//             />
//           )}
//           {doesRecipientExist && (
//             <ExtraInfoSection
//               label="Recipient"
//               onClear={() => SaleStore.removeRecipient(productId)}
//             />
//           )}
//           <div className="flex items-center justify-between gap-2 w-full">
//             <div className="flex flex-wrap items-center w-[90%] gap-3 gap-y-3">
//               {types?.map((type) => (
//                 <ExtraInfoPill
//     key={type}
//     type={type}
//     selected={extraInfoModal === type}
//     onClick={(t) => setExtraInfoModal(t)}
//     infoMessage={infoMessages[type]}      // supply per-type info
//     required={requiredFlags[type]}        // per-type required flag
//     error={errors[type]}                  // per-type error message
//     filled={filledFlags[type]}            // per-type filled state
//   />
//               ))}
//             </div>
//             <span
//               className="flex items-center justify-center w-7 h-7 bg-white cursor-pointer border-[0.6px] border-strokeGreyTwo rounded-full transition-all hover:opacity-50"
//               title="Remove Product"
//               onClick={() => {
//                 onRemoveProduct(productId);
//                 getIsFormFilled();
//               }}
//             >
//               <RiDeleteBin5Fill color="#FC4C5D" />
//             </span>
//           </div>
//         </div>
//         {/* ERROR SECTION */}
//         {allErrors.length > 0 && (
//           <div className="p-3 mt-4 border border-red-500 rounded-md bg-red-50">
//             {allErrors.map((error, index) => (
//               <p key={index} className="text-sm text-red-600">
//                 {error}.
//               </p>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   }
// );

// export default ProductSaleDisplay;




import React from "react";
import { Tag } from "../Products/ProductDetails";
import {
  NairaSymbol,
  ProductTag,
  SimpleTag,
} from "../CardComponents/CardComponent";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ExtraInfoType } from "./CreateNewSale";
import { SaleStore } from "@/stores/SaleStore";
import { observer } from "mobx-react-lite";
import ExtraInfoPill from "./ExtraInfoPill";

export const ProductDetailRow = ({ label, value, showNaira = false, title }: {
  label: string;
  value: string | number;
  showNaira?: boolean;
  title?: string;
}) => (
  <div className="flex items-center justify-between gap-2 w-full">
    <Tag name={label} />
    <p className="flex gap-1 items-center justify-end text-xs font-bold text-textDarkGrey" title={title}>
      {showNaira && <NairaSymbol />}
      {label === "Product Category" ? <ProductTag productTag={value} /> : value}
    </p>
  </div>
);

export const ExtraInfoSection = ({ label, onClear }: {
  label: string;
  onClear: () => void;
}) => (
  <div className="flex flex-col gap-2 w-full">
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center justify-between w-max gap-2">
        <p className="text-textDarkGrey text-sm font-semibold">{label}</p>
        <SimpleTag
          text="SAVED"
          dotColour="#00AF50"
          containerClass="bg-[#F6F8FA] text-success font-semibold px-2 py-1 border-[0.4px] border-strokeGreyThree rounded-full"
        />
      </div>
      <button
        type="button"
        className="text-sm font-semibold text-errorTwo"
        title={`Clear ${label}`}
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  </div>
);

const ProductSaleDisplay = observer(({
  productData,
  onRemoveProduct,
  setExtraInfoModal,
  getIsFormFilled,
  getFieldError,
}: {
  productData: {
    productId: string;
    productName: string;
    productUnits: number;
    productImage: string;
    productPrice: string;
    productTag: string;
  };
  onRemoveProduct: (productId: string) => void;
  setExtraInfoModal: React.Dispatch<React.SetStateAction<ExtraInfoType>>;
  getIsFormFilled: () => boolean;
  getFieldError: (fieldName: string, productId: string) => string[];
}) => {
  const { productId, productName, productUnits, productPrice, productTag } = productData;

  // existence/fill flags
  const doesParamsExist = Boolean(SaleStore.getParametersByProductId(productId));
  const misc = SaleStore.getMiscellaneousByProductId(productId)?.costs;
  const doesDevicesExist = Boolean(SaleStore.getSelectedDevices(productId));
  const doesRecipientExist = Boolean(SaleStore.getRecipientByProductId(productId));

  const types: ExtraInfoType[] = ["parameters", "miscellaneous", "devices", "recipient"];

  // build the four lookups:
  const infoMessages: any = {
    parameters: "Set custom parameters for this product (eg. color, size).",
    miscellaneous: "Add any extra charges like shipping or handling.",
    devices: "Link physical devices being sold with this item.",
    recipient: "Specify who will receive this product.",
  };

  const requiredFlags: any = {
    parameters: !doesParamsExist,
    miscellaneous: false,
    devices: !doesDevicesExist,      // require devices if none yet
    recipient: !doesRecipientExist,  // require recipient if none yet
  };

  const errors: any = {
    parameters: (getFieldError("parameters", productId)[0]) ?? undefined,
    miscellaneous: (getFieldError("miscellaneousPrices", productId)[0]) ?? undefined,
    devices: (getFieldError("devices", productId)[0]) ?? undefined,
    recipient: (getFieldError("saleRecipient", productId)[0]) ?? undefined,
  };

  const filledFlags: any = {
    parameters: doesParamsExist,
    miscellaneous: Boolean(misc && Object.keys(misc).length),
    devices: doesDevicesExist,
    recipient: doesRecipientExist,
  };

  // aggregate all errors below
  const allErrors = types.flatMap(t => errors[t] ? [errors[t]!] : []);

  return (
    <div className="flex flex-col gap-2 w-full p-2.5 border-[0.6px] border-strokeGreyThree rounded-[20px]">
      <ProductDetailRow label="Product Category" value={productTag} />
      <ProductDetailRow label="Product Name" value={productName} />
      <ProductDetailRow label="Product Quantity" value={productUnits} />
      <ProductDetailRow label="Product Price" value={productPrice} showNaira />

      <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
        {doesParamsExist && (
          <ExtraInfoSection label="Parameters" onClear={() => SaleStore.removeParameter(productId)} />
        )}
        {misc && Object.keys(misc).length > 0 && (
          <ExtraInfoSection label="Miscellaneous Costs" onClear={() => SaleStore.removeMiscellaneousPrice(productId)} />
        )}
        {doesDevicesExist && (
          <ExtraInfoSection label="Devices" onClear={() => {
            SaleStore.removeDevices(productId);
            SaleStore.removeTentativeDevices(productId);
          }} />
        )}
        {doesRecipientExist && (
          <ExtraInfoSection label="Recipient" onClear={() => SaleStore.removeRecipient(productId)} />
        )}

        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex flex-wrap items-center w-[90%] gap-3 gap-y-3">
            {types.map(type => (
              <ExtraInfoPill
                key={type}
                type={type}
                selected={false /* you can also pass selected state */}
                onClick={() => setExtraInfoModal(type)}
                infoMessage={infoMessages[type]}
                required={requiredFlags[type]}
                error={errors[type]}
                filled={filledFlags[type]}
              />
            ))}
          </div>

          <span
            className="flex items-center justify-center w-7 h-7 bg-white cursor-pointer border-[0.6px] border-strokeGreyTwo rounded-full transition-all hover:opacity-50"
            title="Remove Product"
            onClick={() => {
              onRemoveProduct(productId);
              getIsFormFilled();
            }}
          >
            <RiDeleteBin5Fill color="#FC4C5D" />
          </span>
        </div>
      </div>

      {allErrors.length > 0 && (
        <div className="p-3 mt-4 border border-red-500 rounded-md bg-red-50">
          {allErrors.map((msg, i) => (
            <p key={i} className="text-sm text-red-600">{msg}</p>
          ))}
        </div>
      )}
    </div>
  );
});

export default ProductSaleDisplay;
