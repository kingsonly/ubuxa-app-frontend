import React, { useState, useEffect } from "react";
import { Modal } from "../ModalComponent/Modal";
import { SimpleTag } from "../CardComponents/CardComponent";
import { Table, PaginationType } from "../TableComponent/Table";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import { useStoreApi } from "@/utils/storeApi";
import { observer } from "mobx-react-lite";
import { GoDotFill } from "react-icons/go";
import role from "../../assets/table/role.svg";
import clock from "../../assets/table/clock.svg";

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  status: string;
  assignedStore?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    role: string;
  };
}

interface UserTableEntry {
  id: string;
  no: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

interface StoreUserManagementProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
  storeName: string;
}

const StoreUserManagement: React.FC<StoreUserManagementProps> = observer(({
  isOpen,
  setIsOpen,
  storeId,
  storeName,
}) => {
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [tableQueryParams, setTableQueryParams] = useState<Record<string, any> | null>(null);
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const storeApi = useStoreApi();

  // Fetch data when modal opens, pagination, or query params change
  useEffect(() => {
    if (isOpen && storeId) {
      fetchData();
    }
  }, [isOpen, storeId, currentPage, entriesPerPage, tableQueryParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assigned users with pagination and query params
      const storeUsersResponse = await storeApi.getStoreUsers(storeId, currentPage, entriesPerPage, tableQueryParams);
      setAssignedUsers(Array.isArray(storeUsersResponse.data.data) ? storeUsersResponse.data.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignUser = async (userId: string) => {
    try {
      setLoading(true);
      await storeApi.unassignUserFromStore(storeId, userId);
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to unassign user");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map the API data to the desired format
  const generateUserEntries = (data: User[]): UserTableEntry[] => {
    return data.map((user, index) => ({
      id: user.id,
      no: index + 1,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      phone: user.phone || "N/A",
      role: user.role?.role?.toUpperCase() || "NO ROLE",
      status: user.status?.toUpperCase() || "UNKNOWN",
    }));
  };

  // Pagination info
  const paginationInfo: PaginationType = () => ({
    total: assignedUsers.length,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });

  // Filter list for table
  const filterList = [
    {
      name: "Status",
      items: ["All Status", "Active", "Inactive"],
      onClickLink: async (index: number) => {
        setIsSearchQuery(false);
        let status = "";
        if (index === 1) {
          status = "active";
        } else if (index === 2) {
          status = "inactive";
        }
        setQueryValue(status);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          status: status,
        }));
      },
    },
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          search: query,
        }));
      },
      isSearch: true,
    },
  ];

  // Column list for table
  const columnList = [
    { title: "S/N", key: "no" },
    { title: "NAME", key: "name" },
    { title: "EMAIL", key: "email" },
    { title: "PHONE", key: "phone" },
    {
      title: "ROLE",
      key: "role",
      valueIsAComponent: true,
      customValue: (value: any) => {
        return (
          <span className="flex items-center gap-0.5 w-max px-2 py-1 bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full">
            <GoDotFill />
            {value}
          </span>
        );
      },
      rightIcon: <img src={role} alt="role icon" className="ml-auto" />,
    },
    {
      title: "STATUS",
      key: "status",
      valueIsAComponent: true,
      customValue: (value: any) => {
        let style: string = "";

        if (value === "ACTIVE") {
          style = "text-success";
        } else {
          style = "text-errorTwo";
        }

        return (
          <span
            className={`${style} flex items-center gap-0.5 w-max px-2 py-1 bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full`}
          >
            <GoDotFill />
            {value}
          </span>
        );
      },
      rightIcon: <img src={clock} alt="clock icon" className="ml-auto" />,
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_: any, rowData: any) => {
        return (
          <span
            className="px-2 py-1 text-[10px] text-white font-medium bg-red-500 hover:bg-red-600 border-[0.2px] border-red-600 rounded-full cursor-pointer transition-all"
            onClick={() => handleUnassignUser(rowData.id)}
          >
            Unassign
          </span>
        );
      },
    },
  ];

  const getTableData = () => {
    return generateUserEntries(assignedUsers);
  };

  const refreshTable = async () => {
    await fetchData();
  };

  return (
    <Modal
      layout="right"
      bodyStyle="pb-44 overflow-auto"
      size="large"
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
      leftHeaderComponents={
        <div className="flex items-center gap-3">
          <SimpleTag
            text={storeName}
            dotColour="#007AFF"
            containerClass="bg-blue-100 text-blue-800 font-medium px-3 py-1 border border-blue-200 rounded-full"
          />
        </div>
      }
      leftHeaderContainerClass="pl-2"
    >
      <div className="bg-white">
        <header className="flex items-center justify-between bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree">
          <div className="flex items-center gap-1 pl-1 pr-2 py-1 w-max bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full">
            <span className="text-textBlack text-sm font-medium">Store User Management</span>
          </div>
        </header>

        <div className="flex flex-col w-full">
          <DataStateWrapper
            isLoading={false} // Table handles its own loading
            error={error}
            errorStates={{
              errorStates: [],
              isNetworkError: false,
              isPermissionError: false,
            }}
            refreshData={fetchData}
            errorMessage="Failed to fetch user data"
          >
            <div className="p-4">
              <Table
                tableTitle="ASSIGNED USERS"
                filterList={filterList}
                columnList={columnList}
                loading={loading}
                tableData={getTableData()}
                refreshTable={refreshTable}
                queryValue={isSearchQuery ? queryValue : ""}
                paginationInfo={paginationInfo}
                clearFilters={() => setTableQueryParams({})}
              />
            </div>
          </DataStateWrapper>
        </div>
      </div>
    </Modal>
  );
});

export default StoreUserManagement;