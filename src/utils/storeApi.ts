import { useApiCall } from "@/utils/useApiCall";
import { CreateStorePayload, UpdateStorePayload } from "@/types/store";

export const useStoreApi = () => {
  const { apiCall } = useApiCall();

  const createStore = async (data: CreateStorePayload) => {
    return await apiCall({
      endpoint: "/v1/stores",
      method: "post",
      data,
      successMessage: "Store created successfully!",
    });
  };

  const getAllStores = async () => {
    return await apiCall({
      endpoint: "/v1/stores",
      method: "get",
    });
  };

  const getMainStore = async () => {
    return await apiCall({
      endpoint: "/v1/stores/main",
      method: "get",
    });
  };

  const getStoreById = async (id: string) => {
    return await apiCall({
      endpoint: `/v1/stores/${id}`,
      method: "get",
    });
  };

  const getStoreUsers = async (storeId: string) => {
    return await apiCall({
      endpoint: `/v1/stores/${storeId}/users`,
      method: "get",
    });
  };

  const updateStore = async (id: string, data: UpdateStorePayload) => {
    return await apiCall({
      endpoint: `/v1/stores/${id}`,
      method: "patch",
      data,
      successMessage: "Store updated successfully!",
    });
  };

  const deleteStore = async (id: string) => {
    return await apiCall({
      endpoint: `/v1/stores/${id}`,
      method: "delete",
      successMessage: "Store deleted successfully!",
    });
  };

  const assignUserToStore = async (storeId: string, userId: string) => {
    return await apiCall({
      endpoint: `/v1/stores/${storeId}/assign-user/${userId}`,
      method: "post",
      successMessage: "User assigned to store successfully!",
    });
  };

  const getUserStore = async (userId: string) => {
    return await apiCall({
      endpoint: `/v1/stores/user/${userId}`,
      method: "get",
    });
  };

  const getCurrentUserStore = async () => {
    return await apiCall({
      endpoint: "/v1/stores/user/me/store",
      method: "get",
    });
  };

  const getUserDefaultStore = async (userId: string) => {
    return await apiCall({
      endpoint: `/v1/stores/user/${userId}/default`,
      method: "get",
    });
  };

  return {
    createStore,
    getAllStores,
    getMainStore,
    getStoreById,
    getStoreUsers,
    updateStore,
    deleteStore,
    assignUserToStore,
    getUserStore,
    getCurrentUserStore,
    getUserDefaultStore,
  };
};