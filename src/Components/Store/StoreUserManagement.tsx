import React, { useState, useEffect } from "react";
import { Modal } from "../ModalComponent/Modal";
import { SimpleTag } from "../CardComponents/CardComponent";

import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import { useStoreApi } from "@/utils/storeApi";
import { observer } from "mobx-react-lite";

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

  const storeApi = useStoreApi();

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && storeId) {
      fetchData();
    }
  }, [isOpen, storeId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only assigned users for now
      const storeUsersResponse = await storeApi.getStoreUsers(storeId);
      setAssignedUsers(Array.isArray(storeUsersResponse.data) ? storeUsersResponse.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Removed assign functionality since backend doesn't support listing unassigned users

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

  // Simplified to only show assigned users since backend doesn't support unassigned users yet

  const renderUserCard = (user: User) => (
    <div
      key={user.id}
      className="flex items-center justify-between p-4 bg-white border border-strokeGreyThree rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-textBlack">
            {user.firstname} {user.lastname}
          </h3>
          <SimpleTag
            text={user.status}
            dotColour={user.status === 'active' ? '#00AF50' : '#FC4C5D'}
            containerClass={`px-2 py-1 text-xs font-medium rounded-full ${
              user.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          />
        </div>
        <p className="text-sm text-textDarkGrey mb-1">{user.email}</p>
        {user.phone && (
          <p className="text-sm text-textDarkGrey mb-1">{user.phone}</p>
        )}
        {user.role && (
          <p className="text-xs text-blue-600 font-medium">{user.role.role}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleUnassignUser(user.id)}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Unassign
        </button>
      </div>
    </div>
  );

  const renderAssignedUsers = () => {
    if (assignedUsers.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-textDarkGrey">No users assigned to this store</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {assignedUsers.map(user => renderUserCard(user))}
      </div>
    );
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

        <div className="flex flex-col w-full gap-4 px-4 py-2">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-textBlack">Assigned Users</h3>
            <SimpleTag
              text={assignedUsers.length.toString()}
              dotColour="#007AFF"
              containerClass="bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded-full text-xs"
            />
          </div>

          <DataStateWrapper
            isLoading={loading}
            error={error}
            errorStates={{
              errorStates: [],
              isNetworkError: false,
              isPermissionError: false,
            }}
            refreshData={fetchData}
            errorMessage="Failed to fetch user data"
          >
            {renderAssignedUsers()}
          </DataStateWrapper>
        </div>
      </div>
    </Modal>
  );
});

export default StoreUserManagement;