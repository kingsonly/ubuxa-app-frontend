import React, { useState, useEffect } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useStoreManagement } from "@/hooks/useStoreManagement";
import { useApiCall } from "@/utils/useApiCall";
import ApiErrorMessage from "../ApiErrorMessage";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { observer } from "mobx-react-lite";

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  status: string;
}

interface UserAssignmentModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
  storeName: string;
  onUserAssigned?: () => void;
}

const UserAssignmentModal: React.FC<UserAssignmentModalProps> = observer(({ 
  isOpen, 
  setIsOpen, 
  storeId, 
  storeName,
  onUserAssigned 
}) => {
  const { assignUserToStore, fetchStoreUsers, storeUsers, loading } = useStoreManagement();
  const { apiCall } = useApiCall();
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen && storeId) {
      fetchUsers();
      fetchStoreUsers(storeId);
    }
  }, [isOpen, storeId]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiCall({
        endpoint: "/v1/users",
        method: "get",
      });
      setAvailableUsers(response.data || []);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch users";
      setApiError(errorMessage);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId) {
      setApiError("Please select a user to assign");
      return;
    }

    try {
      setApiError("");
      await assignUserToStore(storeId, selectedUserId);
      setSelectedUserId("");
      setIsOpen(false);
      onUserAssigned?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to assign user to store";
      setApiError(errorMessage);
    }
  };

  const assignedUserIds = storeUsers.map(user => user.id);
  const unassignedUsers = availableUsers.filter(user => !assignedUserIds.includes(user.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      layout="right"
      size="medium"
    >
      <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleCreamGradientLeft">
        <h2 className="text-xl text-textBlack font-semibold font-secondary" style={{ textShadow: "1px 1px grey" }}>
          Assign User to {storeName}
        </h2>
      </div>

      <div className="flex flex-col bg-white w-full px-[2.5em] gap-4 py-8">
        {loadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-textBlack">Available Users</h3>
              
              {unassignedUsers.length === 0 ? (
                <p className="text-textDarkGrey text-center py-4">No available users to assign</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {unassignedUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUserId === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-textBlack">
                            {user.firstname} {user.lastname}
                          </p>
                          <p className="text-sm text-textDarkGrey">{user.email}</p>
                          {user.phone && (
                            <p className="text-sm text-textDarkGrey">{user.phone}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {storeUsers.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-textBlack">Currently Assigned Users</h3>
                <div className="space-y-2">
                  {storeUsers.map((user) => (
                    <div key={user.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-textBlack">
                            {user.firstname} {user.lastname}
                          </p>
                          <p className="text-sm text-textDarkGrey">{user.email}</p>
                          {user.role && (
                            <p className="text-sm text-blue-600">{user.role.role}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ApiErrorMessage apiError={apiError} />

            <div className="flex items-center justify-between gap-4 w-full mt-6">
              <SecondaryButton
                variant="secondary"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Cancel
              </SecondaryButton>
              <ProceedButton
                onClick={handleAssignUser}
                disabled={!selectedUserId || loading || unassignedUsers.length === 0}
                loading={loading}
                variant={selectedUserId ? "gradient" : "gray"}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
});

export default UserAssignmentModal;