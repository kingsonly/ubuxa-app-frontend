import { types, Instance } from "mobx-state-tree";

const InventoryModel = types.model({
  productId: types.union(types.string),
  productImage: types.string,
  productTag: types.string,
  productName: types.string,
  productPrice: types.string,
  productUnits: types.number,
});

const deviceStore = types
  .model({
    selectedInventory: types.maybeNull(InventoryModel),
  })
  .actions((self) => ({
    setInventory(inventory: typeof self.selectedInventory) {
      self.selectedInventory = inventory;
    },
    unsetInventory() {
      //alert("unsetInventory");
      self.selectedInventory = null;
    },

  }));

export const DeviceStore = deviceStore.create({
  selectedInventory: null,
});

export type DeviceStoreType = Instance<typeof deviceStore>;
