import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useApiCall } from "@/utils/useApiCall";
import { Category } from "../Products/CreateNewProduct";
import CategoryList from "./CategoryList";
import SmallModal from "../ModalComponent/SmallModal";
import CategoryUpdateForm from "./CategoryUpdateForm";
import CategoryDetails from "./CategoryDetails";
import LoadingSpinner from "../Loaders/LoadingSpinner";



export type CategoryDetailsType = "Category" | "SubCategory";
export type CategoryFor = "Product" | "Inventory";
type CategoryWithReason = Category & { reason?: string };
interface AllCategoriesComponentProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  type: CategoryDetailsType;
  categoryFor: CategoryFor
}

const defaultCategory: CategoryWithReason = {
  id: "",
  name: "",
  parent: null,
  parentId: null,
  type: "INVENTORY",
  createdAt: "",
  reason: "UPDATE",
  updatedAt: "",
  children: [],
}
const AllCategories: React.FC<AllCategoriesComponentProps> = ({
  isOpen,
  setIsOpen,
  type,
  categoryFor
}) => {
  const { apiCall } = useApiCall();
  const [isOpenSmall, setIsOpenSmall] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [inventoryCategories, setInventoryCategories] = useState<Category[]>(
    []
  );
  const [activeCategory, setActiveCategory] = useState<CategoryWithReason>(defaultCategory);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const paginationInfo = () => {
    const total = inventoryCategories?.length || 0;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  // Fetch inventory categories using apiCall
  const fetchInventoryCategories = useCallback(async () => {
    setLoading(true);
    var url = "";
    if (categoryFor === "Product") {
      switch (type) {
        case "SubCategory":
          url = "/v1/products/subcategories/all"
          break;

        default:
          url = "/v1/products/categories/all"
          break;
      }
    } else {

      switch (type) {
        case "SubCategory":

          url = "/v1/inventory/subcategories/all"
          break;

        case "Category":
          url = "/v1/inventory/categories/all"
          break;
      }
    }

    try {
      const response = await apiCall({
        endpoint: url,
        method: "get",
        showToast: false,
      });
      setInventoryCategories(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch inventory categories:", error);
      setInventoryCategories([]);
      setLoading(false);
    }
  }, [categoryFor, type]);

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInventoryCategories();
    }
  }, [isOpen, fetchInventoryCategories, type, categoryFor]);
  const handleClose = () => {
    //fetchInventoryCategories()
    setIsOpenSmall(false);
  };
  const handleUpdateSuccessCallback = (status: boolean) => {
    if (status) {
      fetchInventoryCategories()
    }
    setIsOpenSmall(false);
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        layout="right"
        bodyStyle="pb-[100px]"
      >
        <div
          className="flex flex-col items-center bg-white"
        >
          <div
            className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft`}
          >
            <h2
              style={{ textShadow: "1px 1px grey" }}
              className="lowercase text-xl text-textBlack font-semibold font-secondary"
            >
              <span className="capitalize"> All {type}</span>
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center w-full px-[2.5em] gap-4 py-8">
            {deleteLoader ? <LoadingSpinner text="Deleting..." /> :
              <CategoryList
                categoryData={inventoryCategories}
                paginationInfo={paginationInfo}
                isLoading={loading}
                callBack={() => {
                  fetchInventoryCategories()
                  setDeleteLoader(false)

                }}
                deleteLoader={() => setDeleteLoader(true)}
                showSmallModal={(rowData) => {
                  setActiveCategory(rowData);
                  setIsOpenSmall(true); // ✅ opens SmallModal
                }}
              />}
          </div>
        </div>
      </Modal>
      {isOpenSmall && (
        <SmallModal
          description={activeCategory?.reason === "Update" ? `Update ${activeCategory?.name} Details` : `${activeCategory?.name} Details`}
          onClose={handleClose}>
          {activeCategory?.reason === "Update" ?
            <CategoryUpdateForm
              handleClose={handleUpdateSuccessCallback}
              categoryData={activeCategory}
            /> : <CategoryDetails
              categoryData={activeCategory}
            />}
        </SmallModal>
      )}
    </>


  );
};

export default AllCategories;
