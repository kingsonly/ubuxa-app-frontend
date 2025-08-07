import { useState, useEffect } from "react";
import { useStoreApi } from "@/utils/storeApi";
import { StoreStore } from "@/stores/StoreStore";
import { CreateStorePayload, UpdateStorePayload } from "@/types/store";

export const useStoreManagement = () => {
  const storeApi = useStoreApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllStores = async (force = false) => {
    // Simple check to prevent multiple calls
    if (StoreStore.loading && !force) {
      return;
    }

    try {
      setLoading(true);
      StoreStore.setLoading(true);
      const response = await storeApi.getAllStores();
      StoreStore.setStores(response.data);
      StoreStore.setError(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to fetch stores";
      setError(errorMessage);
      StoreStore.setError(errorMessage);
    } finally {
      setLoading(false);
      StoreStore.setLoading(false);
    }
  };

  const createStore = async (data: CreateStorePayload) => {
    try {
      setLoading(true);
      const response = await storeApi.createStore(data);
      StoreStore.addStore(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to create store";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStore = async (id: string, data: UpdateStorePayload) => {
    try {
      setLoading(true);
      const response = await storeApi.updateStore(id, data);
      StoreStore.updateStore(id, response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to update store";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStore = async (id: string) => {
    try {
      setLoading(true);
      await storeApi.deleteStore(id);
      StoreStore.removeStore(id);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to delete store";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreById = async (id: string) => {
    // Use existing store if available
    const existingStore = StoreStore.getStoreById(id);
    if (existingStore) {
      StoreStore.setSelectedStore({
        id: existingStore.id,
        name: existingStore.name,
        description: existingStore.description,
        address: existingStore.address,
        phone: existingStore.phone,
        email: existingStore.email,
        classification: existingStore.classification as any,
        isActive: existingStore.isActive,
        tenantId: existingStore.tenantId,
        createdAt: existingStore.createdAt,
        updatedAt: existingStore.updatedAt,
        deletedAt: existingStore.deletedAt,
      });
      return existingStore;
    }

    try {
      setLoading(true);
      const response = await storeApi.getStoreById(id);
      StoreStore.setSelectedStore(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to fetch store";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreUsers = async (storeId: string) => {
    try {
      setLoading(true);
      const response = await storeApi.getStoreUsers(storeId);
      StoreStore.setStoreUsers(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to fetch store users";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignUserToStore = async (storeId: string, userId: string) => {
    try {
      setLoading(true);
      await storeApi.assignUserToStore(storeId, userId);
      StoreStore.addUserToStore(userId, storeId);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to assign user to store";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUserStore = async () => {
    try {
      setLoading(true);
      const response = await storeApi.getCurrentUserStore();
      StoreStore.setCurrentUserStore(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to fetch current user store";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMainStore = async () => {
    try {
      setLoading(true);
      const response = await storeApi.getMainStore();
      StoreStore.setMainStore(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to fetch main store";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if stores are empty
    if (StoreStore.stores.length === 0) {
      fetchAllStores();
    }
  }, []);

  return {
    stores: StoreStore.stores,
    selectedStore: StoreStore.selectedStore,
    currentUserStore: StoreStore.currentUserStore,
    mainStore: StoreStore.mainStore,
    storeUsers: StoreStore.storeUsers,
    loading: loading || StoreStore.loading,
    error: error || StoreStore.error,
    storeCount: StoreStore.storeCount,
    activeStores: StoreStore.activeStores,
    inactiveStores: StoreStore.inactiveStores,
    fetchAllStores,
    createStore,
    updateStore,
    deleteStore,
    fetchStoreById,
    fetchStoreUsers,
    assignUserToStore,
    fetchCurrentUserStore,
    fetchMainStore,
    getStoreById: StoreStore.getStoreById,
    getStoresByClassification: StoreStore.getStoresByClassification,
    getUsersForStore: StoreStore.getUsersForStore,
  };
};