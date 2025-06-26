import { 
    types, 
    Instance, 
    SnapshotIn, 
    isStateTreeNode, 
    applySnapshot 
  } from "mobx-state-tree";
  
  // Creator details sub-model
  const CreatorDetailsModel = types.model({
    firstname: types.string,
    lastname: types.string
  });
  
  // Batch sub-model
  const BatchModel = types.model({
    id: types.string,
    costOfItem: types.number,
    price: types.number,
    batchNumber: types.number,
    numberOfStock: types.number,
    remainingQuantity: types.number,
    creatorId: types.string,
    createdAt: types.string,
    updatedAt: types.string,
    inventoryId: types.string,
    tenantId: types.string,
    creatorDetails: CreatorDetailsModel,
    stockValue: types.string
  });
  
  // Category/Subcategory model (shared structure)
  const CategoryModel = types.model({
    id: types.string,
    name: types.string,
    parentId: types.maybeNull(types.string),
    type: types.string,
    tenantId: types.string
  });
  
  // Sale price model
  const SalePriceModel = types.model({
    minimumInventoryBatchPrice: types.number,
    maximumInventoryBatchPrice: types.number
  });
  
  // Main Inventory model
  const InventoryModel = types.model("InventoryModel", {
    id: types.string,
    name: types.string,
    manufacturerName: types.string,
    sku: types.string,
    image: types.string,
    dateOfManufacture: types.string,
    status: types.enumeration(["IN_STOCK", "OUT_OF_STOCK", "DISCONTINUED"]),
    class: types.enumeration(["REGULAR", "PREMIUM", "DISCOUNTED"]),
    inventoryCategoryId: types.string,
    inventorySubCategoryId: types.string,
    tenantId: types.string,
    inventoryCategory: CategoryModel,
    inventorySubCategory: CategoryModel,
    batches: types.array(BatchModel),
    salePrice: SalePriceModel,
    inventoryValue: types.number,
    totalRemainingQuantities: types.number,
    totalInitialQuantities: types.number,
    inventoryUnits: types.maybe(types.number)
  });
  
  // Type definitions
  type IInventoryModel = Instance<typeof InventoryModel>;
  type InventoryModelSnapshot = SnapshotIn<typeof InventoryModel>;
  
  // Inventory Store
  const InventoryStoreModel = types
    .model({
      inventories: types.array(InventoryModel),
      doesInventoryCategoriesExist: types.boolean,
    })
    .actions((self) => ({
      addInventory(inventory: InventoryModelSnapshot | IInventoryModel) {
        const existingIndex = self.inventories.findIndex(
          (i) => i.id === inventory.id
        );
  
        if (existingIndex !== -1) {
          if (isStateTreeNode(inventory)) {
            self.inventories[existingIndex] = inventory;
          } else {
            applySnapshot(self.inventories[existingIndex], inventory);
          }
        } else {
          self.inventories.push(
            isStateTreeNode(inventory) ? inventory : InventoryModel.create(inventory)
          );
        }
      },
      removeInventory(inventoryId: string) {
        const index = self.inventories.findIndex((i) => i.id === inventoryId);
        if (index !== -1) {
          self.inventories.splice(index, 1);
        }
      },
      currentInventoryUnits(inventoryId: string): number | undefined {
        return self.inventories.find((i) => i.id === inventoryId)?.inventoryUnits;
      },
      getInventoryById(inventoryId: string): IInventoryModel | undefined {
        return self.inventories.find((inventory) => inventory.id === inventoryId);
      },
      clearInventories() {
        self.inventories.clear();
      },
      setInventoryCategoriesExist(value: boolean) {
        self.doesInventoryCategoriesExist = value;
      },
    }))
    .views((self) => ({
      get inventoryCount(): number {
        return self.inventories.length;
      },
      get allInventoryIds(): string[] {
        return self.inventories.map((inv) => inv.id);
      }
    }));
  
  // Create the store instance
  const inventoryStore = InventoryStoreModel.create({
    inventories: [],
    doesInventoryCategoriesExist: true,
  });
  
  // Export types and instance
  export type { IInventoryModel, InventoryModelSnapshot };
  export type InventoryStoreType = Instance<typeof InventoryStoreModel>;
  export { inventoryStore as InventoryStore };