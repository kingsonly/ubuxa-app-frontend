import { types, Instance, cast } from "mobx-state-tree";
import { StoreResponse, StoreUserResponse } from "@/types/store";

const StoreModel = types.model("Store", {
  id: types.string,
  name: types.string,
  // description: types.maybe(types.string),
  // address: types.maybe(types.string),
  // phone: types.maybe(types.string),
  // email: types.maybe(types.string),
  // deletedAt: types.maybe(types.string),
description: types.maybeNull(types.string),
address: types.maybeNull(types.string),
phone: types.maybeNull(types.string),
email: types.maybeNull(types.string),
deletedAt: types.maybeNull(types.string),
  classification: types.enumeration(["MAIN", "BRANCH", "OUTLET"]),
  isActive: types.boolean,
  tenantId: types.string,
  createdAt: types.string,
  updatedAt: types.string,
});

const StoreUserModel = types.model("StoreUser", {
  id: types.string,
  firstname: types.string,
  lastname: types.string,
  username: types.maybe(types.string),
  email: types.string,
  phone: types.maybe(types.string),
  status: types.enumeration(["active", "inactive", "suspended"]),
  createdAt: types.string,
  userTenantId: types.string,
  assignedStore: types.maybe(types.model({
    id: types.string,
    name: types.string,
  })),
  role: types.maybe(types.model({
    id: types.string,
    role: types.string,
  })),
});

const storeStore = types
  .model("StoreStore", {
    stores: types.array(StoreModel),
    storeUsers: types.array(StoreUserModel),
    selectedStore: types.maybe(StoreModel),
    currentUserStore: types.maybe(StoreModel),
    mainStore: types.maybe(StoreModel),
    loading: types.boolean,
    error: types.maybe(types.string),
  })
  .actions((self) => ({
    setLoading(loading: boolean) {
      self.loading = loading;
    },
    setError(error: string | null) {
      self.error = error || undefined;
    },
    setStores(stores: StoreResponse[]) {
      self.stores = cast(stores.map(store => ({
        ...store,
        description: store.description || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        deletedAt: store.deletedAt || "",
      })));
    },
    addStore(store: StoreResponse) {
      self.stores.push({
        ...store,
        description: store.description || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        deletedAt: store.deletedAt || "",
      });
    },
    updateStore(storeId: string, updatedData: Partial<StoreResponse>) {
      const store = self.stores.find(s => s.id === storeId);
      if (store) {
        Object.assign(store, updatedData);
      }
    },
    removeStore(storeId: string) {
      const index = self.stores.findIndex(s => s.id === storeId);
      if (index !== -1) {
        self.stores.splice(index, 1);
      }
    },
    setSelectedStore(store: StoreResponse | null) {
      self.selectedStore = store ? {
        ...store,
        description: store.description || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        deletedAt: store.deletedAt || "",
      } : undefined;
    },
    setCurrentUserStore(store: StoreResponse | null) {
      self.currentUserStore = store ? {
        ...store,
        description: store.description || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        deletedAt: store.deletedAt || "",
      } : undefined;
    },
    setMainStore(store: StoreResponse | null) {
      self.mainStore = store ? {
        ...store,
        description: store.description || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        deletedAt: store.deletedAt || "",
      } : undefined;
    },
    setStoreUsers(users: StoreUserResponse[]) {
      self.storeUsers = cast(users);
    },
    addUserToStore(userId: string, storeId: string) {
      const user = self.storeUsers.find(u => u.id === userId);
      const store = self.stores.find(s => s.id === storeId);
      if (user && store) {
        user.assignedStore = { id: store.id, name: store.name };
      }
    },
    clearStore() {
      self.stores.clear();
      self.storeUsers.clear();
      self.selectedStore = undefined;
      self.currentUserStore = undefined;
      self.mainStore = undefined;
      self.error = undefined;
    },
  }))
  .views((self) => ({
    get storeCount() {
      return self.stores.length;
    },
    get activeStores() {
      return self.stores.filter(store => store.isActive);
    },
    get inactiveStores() {
      return self.stores.filter(store => !store.isActive);
    },
    getStoreById(id: string) {
      return self.stores.find(store => store.id === id);
    },
    getStoresByClassification(classification: "MAIN" | "BRANCH" | "OUTLET") {
      return self.stores.filter(store => store.classification === classification);
    },
    getUsersForStore(storeId: string) {
      return self.storeUsers.filter(user => user.assignedStore?.id === storeId);
    },
  }));

export const StoreStore = storeStore.create({
  stores: [],
  storeUsers: [],
  loading: false,
});

export type StoreStoreType = Instance<typeof storeStore>;