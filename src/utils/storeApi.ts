import { useApiCall } from "@/utils/useApiCall";
import { CreateStorePayload, UpdateStorePayload } from "@/types/store";
import { buildQueryString } from "@/hooks/useQueryString";

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

  const getAllStores = async (
    page = 1,
    limit = 20,
    queryParams?: Record<string, any> | null
  ) => {
    const queryString = buildQueryString(queryParams);
    const endpoint = `/v1/stores?page=${page}&limit=${limit}${queryString}`;

    return await apiCall({
      endpoint,
      method: "get",
      showToast: false,
    });
  };

  const getMainStore = async () => {
    return await apiCall({
      endpoint: "/v1/stores/main",
      method: "get",
      showToast: false,
    });
  };

  const getStoreById = async (id: string) => {
    return await apiCall({
      endpoint: `/v1/stores/${id}`,
      method: "get",
      showToast: false,
    });
  };

  const getStoreUsers = async (
    storeId: string,
    page = 1,
    limit = 20,
    queryParams?: Record<string, any> | null
  ) => {
    const queryString = buildQueryString(queryParams);
    const endpoint = `/v1/stores/${storeId}/users?page=${page}&limit=${limit}${queryString}`;

    return await apiCall({
      endpoint,
      method: "get",
      showToast: false,
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
      showToast: false,
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
      showToast: false,
    });
  };

  const getAllTenantUsers = async (
    page = 1,
    limit = 20,
    queryParams?: Record<string, any> | null
  ) => {
    const queryString = buildQueryString(queryParams);
    const endpoint = `/v1/users?page=${page}&limit=${limit}${queryString}`;

    return await apiCall({
      endpoint,
      method: "get",
      showToast: false,
    });
  };

  const unassignUserFromStore = async (storeId: string, userId: string) => {
    return await apiCall({
      endpoint: `/v1/stores/${storeId}/unassign-user/${userId}`,
      method: "delete",
      successMessage: "User unassigned from store successfully!",
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
    unassignUserFromStore,
    getUserStore,
    getCurrentUserStore,
    getUserDefaultStore,
    getAllTenantUsers,
  };
};
