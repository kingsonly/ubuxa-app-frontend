import { ProductStore } from "./ProductStore";
import { ContractStore } from "./ContractStore";
import { SaleStore } from "./SaleStore";
import { InventoryStore } from "./InventoryStore";

function createRootStore() {
  const rootStore = {
    productStore: ProductStore,
    contractStore: ContractStore,
    saleStore: SaleStore,
    inventoryStore: InventoryStore,
  };

  return rootStore;
}

const rootStore = createRootStore();
export default rootStore;
