import { types, Instance } from "mobx-state-tree";

const InventoryModel = types.model({
  productId: types.union(types.string),
  productImage: types.string,
  productTag: types.string,
  productName: types.string,
  productPrice: types.string, // Price per unit as string
  productUnits: types.number, // Quantity selected
  minimumProductPrice: types.number, // Quantity selected
  maximumProductPrice: types.number, // Quantity selected
   // Quantity selected
});

const inventoryStore = types
  .model({
    inventories: types.array(InventoryModel),
    doesInventoryCategoriesExist: types.boolean,
    modeOfPayment: types.string,
  })
  .views((self) => ({
    // ✅ Total amount = sum of (units × price)
    get totalInventoryAmount() {
      return self.inventories.reduce((sum, item) => {
        const price = item.minimumProductPrice || 0;
        return sum + item.productUnits * price;
      }, 0);
    },
  }))
  .actions((self) => ({
    addInventory(inventory: any) {
      const existingIndex = self.inventories.findIndex(
        (p) => p.productId === inventory.productId
      );

      if (existingIndex !== -1) {
        self.inventories[existingIndex] = {
          ...self.inventories[existingIndex],
          ...inventory,
        };
      } else {
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
      return self.inventories.find(
        (inventory) => inventory.productId === inventoryId
      );
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
  modeOfPayment: "",
});

export type InventoryStoreType = Instance<typeof inventoryStore>;


// import { types, Instance } from "mobx-state-tree";

// const InventoryModel = types.model({
//   productId: types.union(types.string),
//   productImage: types.string,
//   productTag: types.string,
//   productName: types.string,
//   productPrice: types.string, // Price per unit as string
//   productUnits: types.number, // Quantity selected
//   minimumProductPrice: types.number, // Quantity selected
//   maximumProductPrice: types.number, // Quantity selected
 
// });

// const inventoryStore = types
//   .model({
//     inventories: types.array(InventoryModel),
//     doesInventoryCategoriesExist: types.boolean,
//     totalPrice: types.number
//   })
//   .views((self) => ({
//     // ✅ Total amount = sum of (units × price)
//     get totalInventoryAmount() {
//       return self.inventories.reduce((sum, item) => {
       
//         const price = parseFloat(item.productPrice || "0");
//         return sum + item.productUnits * price;
//       }, 0);
//     },
//   }))
//   .actions((self) => ({
//     addInventory(inventory: any) {
//       console.log("test oh",inventory)
//       //return
//       const existingIndex = self.inventories.findIndex(
//         (p) => p.productId === inventory.productId
//       );

//       if (existingIndex !== -1) {
//         self.inventories[existingIndex] = {
//           ...self.inventories[existingIndex],
//           ...inventory,
//         };
//       } else {
//         self.inventories.push(inventory);
//       }
      
//      self.totalPrice=self.inventories.reduce((sum, item) => {
//        console.log("i am price",item.minimumProductPrice)
//         const price = item.minimumProductPrice || 0;
//         return sum + item.productUnits * price;
//       }, 0);
//       console.log("i am him",self.totalPrice)
//     //  self.totalPrice=self.getTotalInventoryAmount()
//     },
//     removeInventory(inventoryId?: string) {
//       const index = self.inventories.findIndex((p) => p.productId === inventoryId);
//       if (index !== -1) {
//         self.inventories.splice(index, 1);
//       }
//     },
//     currentInventoryUnits(inventoryId?: string) {
//       const currentUnits = self.inventories.find(
//         (p) => p.productId === inventoryId
//       )?.productUnits;
//       return currentUnits;
//     },
//     getInventoryById(inventoryId: string) {
//       return self.inventories.find(
//         (inventory) => inventory.productId === inventoryId
//       );
//     },
//     emptyInventories() {
//       self.inventories.clear();
//     },
//     setInventoryCategoriesExist(value: boolean) {
//       self.doesInventoryCategoriesExist = value;
//     },
//   }));

// export const InventoryStore = inventoryStore.create({
//   inventories: [],
//   doesInventoryCategoriesExist: true,
//   totalPrice:0,
// });

// export type InventoryStoreType = Instance<typeof inventoryStore>;



