// import { useState } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { formatDateTime } from "@/utils/helpers";
import { GoDotFill } from "react-icons/go";
import { Category } from "../Products/CreateNewProduct";
import { FaEye } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { toast } from "react-toastify";
import { useApiCall } from "@/utils/useApiCall";
interface CategoryEntries {
  dateTime: string;
  name: string;
  id: string;
  parent: string | null;
  serialNumber: number;
}

type urlFor = "Update" | "View" | "Delete";
// Helper function to map the API data to the desired format
const generateCategoryEntries = (data: Category[]): CategoryEntries[] => {
  const entries: CategoryEntries[] = data?.map((item, index) => {
    return {
      serialNumber: index + 1,
      id: item.id,
      dateTime: item.createdAt,
      name: item.name,
      parent: item.parent,
    };
  });

  return entries;
};

const CategoryList = ({
  categoryData,
  paginationInfo,
  isLoading,
  showSmallModal,
  callBack,
  deleteLoader,
}: {
  categoryData: Category[];
  paginationInfo: PaginationType;
  isLoading: boolean;
  showSmallModal: (category: Category) => void;
  callBack: () => void;
  deleteLoader?: () => void;

}) => {
  const { apiCall } = useApiCall();
  const deleteCategoryById = async (data: CategoryEntries) => {

    const confirmation = prompt(
      `Are you sure you want to delete the category with the name " ${data.name} " This action is irreversible! Enter "Yes" or "No".`,
      "No"
    );

    if (confirmation?.trim()?.toLowerCase() === "yes") {
      try {
        toast.info(`Deleting "${data.name}" `);
        if (deleteLoader) deleteLoader()
        const url: string = categoryActionsUrl("Delete");
        await apiCall({
          endpoint: `${url}/${data.id}`,
          method: "delete",
          successMessage: "Category deleted successfully!",
        })
        callBack()
      } catch (error) {
        toast.error(`Failed to delete ${data.name} category`)
      }
    }
  };
  const columnList = [
    { title: "S/N", key: "serialNumber" },
    { title: "Category Name", key: "name", },
    {
      title: "DATE & TIME",
      key: "dateTime",

      valueIsAComponent: true,
      customValue: (value: string) => {
        return (
          <div className="flex items-center justify-center gap-1 bg-[#F6F8FA] px-2 py-1 w-max border-[0.4px] border-strokeGreyTwo rounded-full">
            <p className="text-xs text-textDarkGrey font-semibold">
              {formatDateTime("date", value)}
            </p>
            <GoDotFill color="#E2E4EB" />
            <p className="text-xs text-textDarkGrey">
              {formatDateTime("time", value)}
            </p>
          </div>
        );
      },
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (value: any, rowData: any) => {

        return (
          <div className="flex items-center gap-2">
            <span
              className=" block px-2 py-1 text-[10px] text-textBlack hover:text-customButtonText font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-customPrimary"
              onClick={() => {
                // setHistoryID(rowData.id);
                showSmallModal({ ...rowData, reason: "View" });
              }}
            >

              <FaEye />
            </span>
            <span
              className=" block px-2 py-1 text-[10px] text-textBlack hover:text-customButtonText font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-customPrimary"
              onClick={() => {
                // setHistoryID(rowData.id);
                showSmallModal({ ...rowData, reason: "Update" });
                console.log(value, rowData);
              }}
            >

              <CiEdit />
            </span>
            <span
              className="block px-2 py-1 text-[10px] text-textBlack hover:text-customButtonText font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-customPrimary"
              onClick={() => {
                // setHistoryID(rowData.id);
                deleteCategoryById(rowData);
                console.log(value, rowData);
              }}
            >
              <FaTrashAlt />
            </span>
          </div>
        );
      },
    },
  ];




  const categoryActionsUrl = (urlFor: urlFor) => {
    var url = "";
    switch (urlFor) {
      case "Delete":

        url = `/v1/inventory/delete-inventory-category`
        break;

      case "Update":
        url = "/v1/inventory/update-inventory-category"
        break;

    }

    return url
  }


  return (
    <>
      <div className="w-full">
        <Table
          showHeader={false}
          columnList={columnList}
          loading={isLoading}
          tableData={generateCategoryEntries(categoryData)}
          paginationInfo={paginationInfo}
        />
      </div>

    </>
  );
};

export default CategoryList;
