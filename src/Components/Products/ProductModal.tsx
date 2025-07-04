import { useMemo, useState } from "react";
// import editInput from "../../assets/settings/editInput.svg";
// import { DropDown } from "../DropDownComponent/DropDown";
import TabComponent from "../TabComponent/TabComponent";
import ProductDetails from "./ProductDetails";
import InventoryDetails from "./InventoryDetails";
import StatsDetails from "./StatsDetails";
import CustomerDetails from "./CustomerDetails";
import { useApiCall, useGetRequest } from "../../utils/useApiCall";
import { Modal } from "@/Components/ModalComponent/Modal";
import { KeyedMutator } from "swr";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import { DropDown } from "../DropDownComponent/DropDown";
import EditSettingsIcon from "../appIcons/edit-settings.icon";
import { toast } from "react-toastify";

type ProductDetails = {
  id: string;
  productCapacity?: any[];
  eaasDetails?: any;
  name: string;
  description: string;
  image: string;
  priceRange: {
    minimumInventoryBatchPrice: number;
    maximumInventoryBatchPrice: number;
  };
  currency: string;
  paymentModes: string;
  creatorId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    parentId: string | null;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
  creatorDetails: {
    firstname: string;
    lastname: string;
  };
};

const ProductModal = ({
  isOpen,
  setIsOpen,
  productID,
  refreshTable,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  productID: string;
  refreshTable: KeyedMutator<any>;
}) => {
  const { apiCall } = useApiCall();
  const fetchSingleProduct = useGetRequest(`/v1/products/${productID}`, false);
  const fetchProductInventories = useGetRequest(
    `/v1/products/${productID}/inventory`,
    false
  );

  const [displayInput, setDisplayInput] = useState<boolean>(false);

  const generateProductEntries = (data: ProductDetails) => {
    console.log("lets see what we have ", data?.categoryId);
    return {
      productCapacity: data?.productCapacity,
      categoryId: data?.categoryId,
      eaasDetails: data?.eaasDetails,
      productId: data?.id,
      productImage: data?.image,
      description: data?.description,
      productName: data?.name,
      productTag: data?.category?.name,
      productPrice: data?.priceRange,
      paymentModes: data?.paymentModes?.split(",").map((mode) => mode.trim()),
      datetime: data?.createdAt,
      name: data?.creatorDetails?.firstname
        ? `${data?.creatorDetails?.firstname} ${data?.creatorDetails?.lastname}`
        : "N/A",
    };
  };

  const generateProductInventoryEntries = (data: any) => {
    const entries = data?.inventories?.map((item: any) => {
      return {
        id: item?.inventory?.id,
        productImage: item?.inventory?.image,
        productName: item?.inventory?.name,
        quantity: item?.quantity,
      };
    });
    return entries;
  };

  const productData = useMemo(() => {
    return generateProductEntries(fetchSingleProduct?.data);
  }, [fetchSingleProduct]);

  const inventoryData = useMemo(() => {
    return generateProductInventoryEntries(fetchProductInventories?.data);
  }, [fetchProductInventories]);

  // const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [tabContent, setTabContent] = useState<string>("productDetails");

  const handleCancelClick = () => {
    setDisplayInput(false);
  };

  const dropDownList = {
    items: ["Cancel Product"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          deleteProductById()
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const tabNames = [
    { name: "Product Details", key: "productDetails", count: null },
    { name: "Inventory Details", key: "inventoryDetails", count: null },
    { name: "Stats", key: "stats", count: null },
    { name: "Customers", key: "customers", count: 0 },
  ];

  const deleteProductById = async () => {
    const confirmation = prompt(
      `Are you sure you want to delete the product with the name "  ${fetchSingleProduct?.data?.name}" This action is irreversible! Enter "Yes" or "No".`,
      "No"
    );

    if (confirmation?.trim()?.toLowerCase() === "yes") {
      toast.info(`Deleting Product with the name "${fetchSingleProduct?.data?.name}" `);
      await apiCall({
        endpoint: `/v1/products/${productID}`,
        method: "delete",
        successMessage: "Product deleted successfully!",
      })
        .then(async () => {
          await refreshTable();
          setIsOpen(false);
        })
        .catch(() =>
          toast.error(`Failed to delete ${fetchSingleProduct?.data?.name}`)
        );
    }
  };

  const updateCallback = () => {
    setDisplayInput(false);
    setIsOpen(false)
  };

  return (
    <Modal
      layout="right"
      size="large"
      bodyStyle="pb-44"
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setTabContent("productDetails");
        setDisplayInput(false);
      }}
      rightHeaderComponents={
        displayInput ? (
          <p
            className="text-xs text-textDarkGrey font-semibold cursor-pointer over"
            onClick={handleCancelClick}
            title="Cancel editing product details"
          >
            Cancel Edit
          </p>
        ) : (
          <button
            className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full hover:bg-slate-100"
            onClick={() => setDisplayInput(true)}
          >
            <EditSettingsIcon />
          </button>
        )
      }
    >
      <div className="bg-white">
        <header
          className={`flex items-center ${productData?.productName ? "justify-between" : "justify-end"
            } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
        >
          {productData?.productName && (
            <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
              {productData?.productName}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            <DropDown {...dropDownList} />
          </div>
        </header>
        <div className="flex flex-col w-full gap-4 px-4 py-2">
          <TabComponent
            tabs={tabNames.map(({ name, key, count }) => ({
              name,
              key,
              count,
            }))}
            onTabSelect={(key) => setTabContent(key)}
          />
          {tabContent === "productDetails" ? (
            <DataStateWrapper
              isLoading={fetchSingleProduct?.isLoading}
              error={fetchSingleProduct?.error}
              errorStates={fetchSingleProduct?.errorStates}
              refreshData={fetchSingleProduct?.mutate}
              errorMessage="Failed to fetch product details"
            >
              <ProductDetails
                {...productData}
                displayInputState={displayInput}
                refreshTable={refreshTable}
                callback={updateCallback}
              />
            </DataStateWrapper>
          ) : tabContent === "inventoryDetails" ? (
            <DataStateWrapper
              isLoading={fetchProductInventories?.isLoading}
              error={fetchProductInventories?.error}
              errorStates={fetchProductInventories?.errorStates}
              refreshData={fetchProductInventories?.mutate}
              errorMessage="Failed to fetch product inventories"
            >
              <InventoryDetails inventoryData={inventoryData} />
            </DataStateWrapper>
          ) : tabContent === "stats" ? (
            <StatsDetails />
          ) : (
            <CustomerDetails />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;
