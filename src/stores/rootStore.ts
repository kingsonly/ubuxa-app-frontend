import { ProductStore } from "./ProductStore";
import { ContractStore } from "./ContractStore";
import { SaleStore } from "./SaleStore";
import { DeviceStore } from "./DeviceStore";

function createRootStore() {
  const rootStore = {
    productStore: ProductStore,
    contractStore: ContractStore,
    saleStore: SaleStore,
    deviceStore: DeviceStore,
  };

  return rootStore;
}

const rootStore = createRootStore();
export default rootStore;
