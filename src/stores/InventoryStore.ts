import { types, Instance } from "mobx-state-tree";

const InventoryModel = types.model({
  productId: types.union(types.string),
  productImage: types.string,
  productTag: types.string,
  productName: types.string,
  productPrice: types.string,
  productUnits: types.number,
});

const inventoryStore = types
  .model({
    inventories: types.array(InventoryModel),
    doesInventoryCategoriesExist: types.boolean,
  })
  .actions((self) => ({
    addInventory(inventory: any) {
      console.log("I am selectedInventories",inventory)
      console.log("I am selectedInventory",self.inventories)
      const existingIndex = self.inventories.findIndex(
        (p) => p.productId === inventory.inventoryId
      );

      if (existingIndex !== -1) {
        // Update existing product
        self.inventories[existingIndex] = {
          ...self.inventories[existingIndex],
          ...inventory,
        };
      } else {
        // Add new product
        self.inventories.push(inventory);
      }
    },
    removeInventory(inventoryId?: string) {
      const index = self.inventories.findIndex((p) => p.productId === inventoryId);
      if (index !== -1) {
        self.inventories.splice(index, 1);
      }
    },
    currentInventoryUnits(inventoryId?: string) {
      const currentUnits = self.inventories.find(
        (p) => p.productId === inventoryId
      )?.productUnits;
      return currentUnits;
    },
    getInventoryById(inventoryId: string) {
      const inventory = self.inventories.find(
        (inventory) => inventory.productId === inventoryId
      );
      return inventory;
    },
    emptyInventories() {
      self.inventories.clear();
    },
    setInventoryCategoriesExist(value: boolean) {
      self.doesInventoryCategoriesExist = value;
    },
  }));

export const InventoryStore = inventoryStore.create({
  inventories: [],
  doesInventoryCategoriesExist: true,
});

export type InventoryStoreType = Instance<typeof inventoryStore>;
