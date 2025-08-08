import { toJS } from "mobx";
import {
  types,
  Instance,
  applySnapshot,
  SnapshotIn,
  getSnapshot,
} from "mobx-state-tree";



const defaultValues: SnapshotIn<typeof saleStore> = {
  category: "PRODUCT",
  customer: null,
  doesCustomerExist: false,
  products: null,
  doesProductCategoryExist: false,
  parameters: null,
  miscellaneousPrices: null,
  devices: null,
  saleItems: null,
  identificationDetails: {
    idType: "",
    idNumber: "",
    customerCountry: "",
    customerState: "",
    customerLGA: "",
    expirationDate: "",
    installationAddress: "",
    installationAddressLongitude: "",
    installationAddressLatitude: "",
  },
  nextOfKinDetails: {
    fullName: "",
    phoneNumber: "",
  },
  guarantorDetails: {
    fullName: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
  },
  paymentDetails: {
    public_key: "",
    tx_ref: "",
    amount: 0,
    currency: "NGN",
    customer: { email: "", phone_number: "", name: "" },
    customizations: { title: "", description: "", logo: "" },
    meta: {},
    redirect_url: "",
    payment_options: "card, ussd, mobilemoney",
  },
};

const IdentificationDetailsModel = types.model({
  idType: types.string,
  idNumber: types.string,
  customerCountry: types.string,
  customerState: types.string,
  customerLGA: types.string,
  expirationDate: types.string,
  installationAddress: types.string,
  installationAddressLongitude: types.string,
  installationAddressLatitude: types.string,
  customerIdImage: types.maybeNull(types.frozen<File>())
});

const GuarantorDetailsModel = types.model({
  fullName: types.string,
  phoneNumber: types.string,
  email: types.string,
  homeAddress: types.string,
});

const NextOfKinDetailsModel = types.model({
  fullName: types.string,
  phoneNumber: types.string,

});

const CustomerModel = types.model({
  customerId: types.string,
  customerName: types.string,
  firstname: types.string,
  lastname: types.string,
  location: types.string,
  email: types.string,
  phone: types.string,
});

const ProductModel = types.model({
  productId: types.string,
  productName: types.string,
  productUnits: types.number,
  productPrice: types.string,
  productImage: types.string,
  productTag: types.string,
  productPaymentModes: types.string,
});


const ParametersModel = types.model({
  salesMode: types.string,//types.enumeration(["INSTALLMENT", "ONE_OFF"]),
  paymentMode: types.string,//types.enumeration(["INSTALLMENT", "ONE_OFF"]),
  repaymentStyle: types.string,//types.enumeration(["INSTALLMENT", "ONE_OFF"]),
  installmentDuration: types.number,
  installmentStartingPrice: types.number,
  discount: types.number,
  installmentStartingPriceType: types.boolean,
  discountType: types.boolean,
  contractType: types.string,
});

const MiscellaneousPricesModel = types.model({
  currentProductId: types.string,
  costs: types.map(types.number),
});

const SaleMiscellaneousPricesModel = types.model({
  costs: types.map(types.number),
});

const DevicesModel = types.model({
  devices: types.array(types.string),
});

const TentativeDeviceInventory = types.model({
  inventoryId: types.string,
  devices: types.array(types.string),
});

const TentativeDevicesModel = types.model({
  devices: types.array(types.string),
  inventories: types.array(TentativeDeviceInventory),
});

const SaleItemsModel = types.model({
  productId: types.string,
  quantity: types.number,
  parameters: types.maybe(ParametersModel),
  // paymentMode: types.enumeration(["INSTALLMENT", "ONE_OFF"]),
  // discount: types.number,
  // installmentDuration: types.maybe(types.number),
  // installmentStartingPrice: types.maybe(types.number),
  devices: types.array(types.string),
  miscellaneousPrices: types.maybe(SaleMiscellaneousPricesModel),
});

const CustomizationsModel = types.model({
  title: types.string,
  description: types.string,
  logo: types.string,
});

const PaymentDataModel = types.model({
  public_key: types.string,
  tx_ref: types.string,
  amount: types.number,
  currency: types.string,
  customer: types.model({
    email: types.string,
    phone_number: types.string,
    name: types.string,
  }),
  customizations: CustomizationsModel,
  meta: types.maybe(types.frozen()), // Accepts any JSON object
  redirect_url: types.string,
  payment_options: types.string,
});

const saleStore = types
  .model({
    category: types.enumeration(["PRODUCT"]),
    customer: types.maybeNull(CustomerModel),
    doesCustomerExist: types.boolean,
    products: types.maybeNull(ProductModel),
    doesProductCategoryExist: types.boolean,
    parameters: types.maybeNull(ParametersModel),
    miscellaneousPrices: types.maybeNull(MiscellaneousPricesModel),
    devices: types.maybeNull(DevicesModel),
    tentativeDevices: types.maybeNull(TentativeDevicesModel),
    saleItems: types.maybeNull(SaleItemsModel),
    identificationDetails: IdentificationDetailsModel,
    nextOfKinDetails: NextOfKinDetailsModel,
    guarantorDetails: GuarantorDetailsModel,
    paymentDetails: PaymentDataModel,
  })
  .actions((self) => ({
    addSaleItem() {
      if (!self.products) return;

      const { productId, productUnits } = self.products;
      // const { paymentMode, discount, installmentDuration, installmentStartingPrice } =
      //   self.parameters.params;

      // pull a plain array of device IDs
      const devices: string[] = self.devices?.devices.slice() ?? [];
      // pull your costs map into a plain object
      const miscCosts: Record<string, number> = {};
      if (self.miscellaneousPrices) {
        for (const [key, val] of toJS(self.miscellaneousPrices.costs).entries()) {
          if (typeof val === "number") miscCosts[key] = val;
        }
      }
      const paramsSnapshot = self.parameters
        ? getSnapshot(self.parameters)
        : undefined;

      self.saleItems = SaleItemsModel.create({
        productId,
        quantity: productUnits,

        // paymentMode: self.parameters?.params.paymentMode || "ONE_OFF",
        // discount: self.parameters?.params.discount || 0,
        // installmentDuration: self.parameters?.params.installmentDuration,
        // installmentStartingPrice: self.parameters?.params.installmentStartingPrice,
        devices,
        ...(paramsSnapshot && { parameters: paramsSnapshot }),
        miscellaneousPrices:
          Object.keys(miscCosts).length > 0
            ? { costs: miscCosts }
            : undefined,                                // <- undefined if no costs
      });
    },
    // addSaleItem() {
    //   const product = self.products;
    //   if (!product?.productId) return;

    //   const params = self.parameters;

    //   // Ensure devices is a plain array of strings
    //   const devices = toJS(self.devices);

    //   // Convert `miscellaneousPrices` into a plain object, filtering based on the current productId
    //   const miscellaneousCosts = self.miscellaneousPrices.reduce(
    //     (acc, misc) => {
    //       // Only include the costs that match the current productId
    //       if (misc.currentProductId === productId) {
    //         const plainCosts = toJS(misc.costs); // Convert to a plain object

    //         plainCosts.forEach((cost, name) => {
    //           if (typeof cost === "number") {
    //             acc[name] = cost; // Use the name as the key and cost as the value
    //           } else {
    //             console.warn(`Invalid cost value for ${name}:`, cost);
    //           }
    //         });
    //       }

    //       return acc;
    //     },
    //     {} as Record<string, number>
    //   );

    //   // Fetch or create the saleRecipient for the given productId
    //   const recipient = self.saleRecipient;

    //   // Ensure recipient is copied to avoid using a reference directly
    //   const saleRecipient = recipient
    //     ? { ...recipient.recipient } // Create a shallow copy of the recipient
    //     : {
    //       firstname: "",
    //       lastname: "",
    //       address: "",
    //       phone: "",
    //       email: "",
    //     };

    //   self.saleItems = {
    //     productId,
    //     quantity: product?.productUnits || 0,
    //     paymentMode: params?.params?.paymentMode || "ONE_OFF",
    //     discount: params?.params?.discount || 0,
    //     installmentDuration: params?.params?.installmentDuration || 0,
    //     installmentStartingPrice:
    //       params?.params?.installmentStartingPrice || 0,
    //     devices: devices,
    //     miscellaneousPrices: { costs: cast(miscellaneousCosts) },
    //     saleRecipient: { ...saleRecipient },
    //   };
    // },


    getTransformedSaleItems() {
      const plainItem = toJS(self.saleItems);

      const costsMap = self.miscellaneousPrices?.costs ?? new Map<string, number>();

      // Turn the Map into a plain { [name]: cost } object
      const miscellaneousCosts = Array.from(costsMap.entries()).reduce(
        (acc, [name, cost]) => {
          if (typeof cost === "number") {
            acc[name] = cost;
          } else {
            console.warn(`Invalid cost value for ${name}:`, cost);
          }
          return acc;
        },
        {} as Record<string, number>
      );

      // If there aren’t actually any costs, remove the field entirely
      if (Object.keys(miscellaneousCosts).length === 0) {
        delete plainItem?.miscellaneousPrices;
      }

      const transformedItem = {
        ...plainItem,
        // only include the field if there's something in it
        ...(Object.keys(miscellaneousCosts).length > 0 && {
          miscellaneousPrices: miscellaneousCosts,
        }),
      };

      return transformedItem;

    },
    doesSaleItemHaveInstallment() {
      const installmentExists = self.saleItems?.parameters?.salesMode === "INSTALLMENT" || self.saleItems?.parameters?.salesMode === "EAAS";
      return installmentExists;
    },
    removeSaleItem() {
      self.saleItems = null;
    },
    clearSaleItems() {
      self.saleItems = null;
    },
    addCustomer(customer: typeof self.customer) {
      self.customer = customer;
    },
    removeCustomer() {
      self.customer = null;
    },
    addUpdateCategory(category: "PRODUCT") {
      self.category = category;
    },
    setCustomerExist(value: boolean) {
      self.doesCustomerExist = value;
    },
    addProduct(product: any) {
      // simply overwrite the one product
      self.products = ProductModel.create(product);
      self.doesProductCategoryExist = true;
    },
    removeProduct() {
      // clear it
      self.products = null;
      //this.removeSaleItem(/* old productId, if you still need to purge */);
    },

    currentProductUnits() {
      return self.products?.productUnits;
    },
    emptyProducts() {
      self.products = null;
    },
    setProductCategoryExist(value: boolean) {
      self.doesProductCategoryExist = value;
    },
    addParameters(
      params: {
        paymentMode: string;
        contractType: string;
        salesMode: string;
        repaymentStyle: string;
        installmentDuration: number;
        installmentStartingPrice: number;
        discount: number;
        installmentStartingPriceType: boolean
        discountType: boolean
      }
    ) {
      console.log("PARAMS:", params);
      self.parameters = ParametersModel.create({
        paymentMode: params.paymentMode,
        repaymentStyle: params.repaymentStyle,
        salesMode: params.salesMode,
        contractType: params.contractType,
        installmentDuration: params.installmentDuration,
        installmentStartingPrice: params.installmentStartingPrice,
        installmentStartingPriceType: params.installmentStartingPriceType,
        discountType: params.discountType,
        discount: params.discount,
      });
    },
    getParametersByProductId() {
      return self.parameters;
    },
    removeParameter() {
      self.parameters = null;
      if (self.saleItems) {
        self.saleItems.parameters = undefined
      }

    },
    addOrUpdateMiscellaneousPrice(
      currentProductId: string,
      costs: Record<string, number>
    ) {
      self.miscellaneousPrices = MiscellaneousPricesModel.create({ currentProductId, costs })

    },
    getMiscellaneousByProductId() {
      return self.miscellaneousPrices;
    },
    removeMiscellaneousPrice() {
      // self.miscellaneousPrices.replace(
      //   self.miscellaneousPrices.filter(
      //     (p) => p.currentProductId !== currentProductId
      //   )
      // );
      // self.saleItems.forEach((item) => {
      //   if (item.productId === currentProductId) {
      //     item.miscellaneousPrices = undefined;
      //   }
      // });
    },
    addOrUpdateDevices(deviceList: string[]) {
      // 1️⃣ If there's no DevicesModel yet, create one.
      if (!self.devices) {
        self.devices = DevicesModel.create({
          devices: [],
        });
      }

      // // 2️⃣ Normalize incoming IDs into a de-duplicated array of strings.
      // const normalized = Array.from(new Set(deviceList.map((d) => String(d))));

      // // 3️⃣ Just replace the entire devices array in one go.
      // self.devices.devices.replace(normalized);
      self.devices.devices.replace(Array.from(new Set(deviceList)));

    },

    // addOrUpdateDevices( deviceList: string[]) {
    //   const existingIndex = self.devices.findIndex(
    //     (d) => d.currentProductId === currentProductId
    //   );

    //   // Normalize all device IDs to strings
    //   const normalizedDevices = deviceList.map((d) => String(d));

    //   if (existingIndex !== -1) {
    //     // Get current devices and merge with new ones
    //     const currentDevices = [...self.devices[existingIndex].devices];
    //     const mergedDevices = [
    //       ...new Set([...currentDevices, ...normalizedDevices]),
    //     ];

    //     // Use put to update the array in a MobX-friendly way
    //     self.devices[existingIndex].devices.clear();
    //     mergedDevices.forEach((deviceId) => {
    //       self.devices[existingIndex].devices.push(deviceId);
    //     });
    //   } else {
    //     // Create new entry with normalized devices
    //     self.devices.push(
    //       DevicesModel.create({
    //         currentProductId,
    //         devices: normalizedDevices,
    //       })
    //     );
    //   }
    // },
    getSelectedDevices() {
      return self.devices?.devices;

    },
    removeDevices() {
      self.devices = null;
    },

    addOrUpdateTentativeDevices(
      deviceList: string[],
      inventoryId?: string
    ) {
      // 1) Ensure we have a tentativeDevices object
      if (!self.tentativeDevices) {
        self.tentativeDevices = TentativeDevicesModel.create({
          devices: [],
          inventories: [],
        });
      }

      const td = self.tentativeDevices;

      // 2) Normalize incoming list
      const normalized = Array.from(new Set(deviceList.map(String)));

      // 3) Merge into the main devices array
      const mergedMain = Array.from(new Set([...td.devices, ...normalized]));
      td.devices.replace(mergedMain);

      // 4) If an inventoryId was passed, merge into that inventory
      if (inventoryId) {
        const idx = td.inventories.findIndex((inv) => inv.inventoryId === inventoryId);
        if (idx >= 0) {
          // merge into existing inventory
          const mergedInv = Array.from(new Set([...td.inventories[idx].devices, ...normalized]));
          td.inventories[idx].devices.replace(mergedInv);
        } else {
          // create a fresh inventory entry
          td.inventories.push(
            TentativeDeviceInventory.create({
              inventoryId,
              devices: normalized,
            })
          );
        }
      }
    },


    // addOrUpdateTentativeDevices(
    //   currentProductId: string,
    //   deviceList: string[],
    //   inventoryId?: string // Optional inventory ID
    // ) {
    //   const existingIndex = self.tentativeDevices.findIndex(
    //     (d) => d.currentProductId === currentProductId
    //   );

    //   const normalizedDevices = deviceList.map((d) => String(d));

    //   if (existingIndex !== -1) {
    //     // Update main devices list
    //     const currentDevices = [
    //       ...self.tentativeDevices[existingIndex].devices,
    //     ];
    //     const mergedDevices = [
    //       ...new Set([...currentDevices, ...normalizedDevices]),
    //     ];

    //     self.tentativeDevices[existingIndex].devices.clear();
    //     mergedDevices.forEach((deviceId) => {
    //       self.tentativeDevices[existingIndex].devices.push(deviceId);
    //     });

    //     // Update inventory-specific devices if provided
    //     if (inventoryId) {
    //       const inventoryIndex = self.tentativeDevices[
    //         existingIndex
    //       ].inventories.findIndex((inv) => inv.inventoryId === inventoryId);

    //       if (inventoryIndex !== -1) {
    //         const currentInventoryDevices = [
    //           ...self.tentativeDevices[existingIndex].inventories[
    //             inventoryIndex
    //           ].devices,
    //         ];
    //         const mergedInventoryDevices = [
    //           ...new Set([...currentInventoryDevices, ...normalizedDevices]),
    //         ];

    //         self.tentativeDevices[existingIndex].inventories[
    //           inventoryIndex
    //         ].devices.clear();
    //         mergedInventoryDevices.forEach((deviceId) => {
    //           self.tentativeDevices[existingIndex].inventories[
    //             inventoryIndex
    //           ].devices.push(deviceId);
    //         });
    //       } else {
    //         self.tentativeDevices[existingIndex].inventories.push(
    //           TentativeDeviceInventory.create({
    //             inventoryId,
    //             devices: normalizedDevices,
    //           })
    //         );
    //       }
    //     }
    //   } else {
    //     // Create new entry
    //     const newEntry: any = {
    //       currentProductId,
    //       devices: normalizedDevices,
    //       inventories: [],
    //     };

    //     if (inventoryId) {
    //       newEntry.inventories.push({
    //         inventoryId,
    //         devices: normalizedDevices,
    //       });
    //     }

    //     self.tentativeDevices.push(TentativeDevicesModel.create(newEntry));
    //   }
    // },

    // addOrUpdateTentativeDevices(
    //   currentProductId: string,
    //   deviceList: string[],
    //   inventoryId?: string
    // ) {
    //   // If we don't yet have a tentativeDevices object, create one
    //   if (!self.tentativeDevices) {
    //     self.tentativeDevices = TentativeDevicesModel.create({
    //       currentProductId,
    //       devices: [],
    //       inventories: [],
    //     });
    //   }

    //   // If the stored productId doesn't match, reset it
    //   if (self.tentativeDevices.currentProductId !== currentProductId) {
    //     applySnapshot(self.tentativeDevices, {
    //       currentProductId,
    //       devices: [],
    //       inventories: [],
    //     });
    //   }

    //   // Normalize incoming list
    //   const normalized = Array.from(new Set(deviceList.map(String)));

    //   // 1) Merge into the main devices array
    //   const existing = Array.from(self.tentativeDevices.devices);
    //   const merged = Array.from(new Set([...existing, ...normalized]));
    //   self.tentativeDevices.devices.replace(merged);

    //   // 2) If an inventoryId was passed, merge into that slot
    //   if (inventoryId) {
    //     const invs = self.tentativeDevices.inventories;
    //     const idx = invs.findIndex((inv) => inv.inventoryId === inventoryId);

    //     if (idx >= 0) {
    //       // merge into existing inventory
    //       const cur = Array.from(invs[idx].devices);
    //       const mergedInv = Array.from(new Set([...cur, ...normalized]));
    //       invs[idx].devices.replace(mergedInv);
    //     } else {
    //       // create a fresh inventory entry
    //       invs.push(
    //         TentativeDeviceInventory.create({
    //           inventoryId,
    //           devices: normalized,
    //         })
    //       );
    //     }
    //   }
    // },

    getAllTentativeDevices() {
      const productEntry = self.tentativeDevices;

      return productEntry ? productEntry.devices : [];
    },
    getSelectedTentativeDevices(inventoryId?: string) {
      const productEntry = self.tentativeDevices;

      if (!productEntry) return [];

      // Return inventory-specific devices if requested
      if (inventoryId) {
        const inventory = productEntry.inventories.find(
          (inv) => inv.inventoryId === inventoryId
        );
        return inventory ? [...inventory.devices] : [];
      }

      // Default to all devices for product
      return [...productEntry.devices];
    },

    removeSingleTentativeDevice(
      deviceIdToRemove: string,
      inventoryId?: string
    ) {
      const td = self.tentativeDevices;
      if (!td) return;

      // 1) remove from main devices
      const filteredMain = td.devices.filter((id) => id !== deviceIdToRemove);
      td.devices.replace(filteredMain);

      // 2) if inventoryId, remove from that slot
      if (inventoryId) {
        const invIdx = td.inventories.findIndex((inv) => inv.inventoryId === inventoryId);
        if (invIdx !== -1) {
          const filteredInv = td.inventories[invIdx].devices.filter((id) => id !== deviceIdToRemove);
          td.inventories[invIdx].devices.replace(filteredInv);
          // drop empty inventory
          if (filteredInv.length === 0) {
            td.inventories.splice(invIdx, 1);
          }
        }
      }

      // 3) if nothing left anywhere, clear entire tentativeDevices
      if (td.devices.length === 0 && td.inventories.length === 0) {
        self.tentativeDevices = null;
      }
    },


    // removeSingleTentativeDevice(
    //   deviceIdToRemove: string,
    //   inventoryId?: string
    // ) {
    //   const productIndex = self.tentativeDevices.findIndex(
    //     (d) => d.currentProductId === currentProductId
    //   );

    //   if (productIndex !== -1) {
    //     // Remove from main devices list
    //     const updatedDevices = self.tentativeDevices[
    //       productIndex
    //     ].devices.filter((deviceId) => deviceId !== deviceIdToRemove);
    //     self.tentativeDevices[productIndex].devices.replace(updatedDevices);

    //     // Remove from specific inventory if provided
    //     if (inventoryId) {
    //       const inventoryIndex = self.tentativeDevices[
    //         productIndex
    //       ].inventories.findIndex((inv) => inv.inventoryId === inventoryId);

    //       if (inventoryIndex !== -1) {
    //         const updatedInventoryDevices = self.tentativeDevices[
    //           productIndex
    //         ].inventories[inventoryIndex].devices.filter(
    //           (deviceId) => deviceId !== deviceIdToRemove
    //         );

    //         self.tentativeDevices[productIndex].inventories[
    //           inventoryIndex
    //         ].devices.replace(updatedInventoryDevices);

    //         // Remove inventory entry if empty
    //         if (updatedInventoryDevices.length === 0) {
    //           self.tentativeDevices[productIndex].inventories.splice(
    //             inventoryIndex,
    //             1
    //           );
    //         }
    //       }
    //     }

    //     // Remove entire product entry if no devices left
    //     if (
    //       updatedDevices.length === 0 &&
    //       self.tentativeDevices[productIndex].inventories.length === 0
    //     ) {
    //       self.tentativeDevices.splice(productIndex, 1);
    //     }
    //   }
    // },
    removeTentativeDevices(currentProductId?: string) {
      console.log(currentProductId)
    },
    // removeTentativeDevices(inventoryId?: string) {
    //   // if (!currentProductId) return;

    //   // if (inventoryId) {
    //   //   // Remove specific inventory devices only
    //   //   const productIndex = self.tentativeDevices.findIndex(
    //   //     (d) => d.currentProductId === currentProductId
    //   //   );

    //   //   if (productIndex !== -1) {
    //   //     const inventoryIndex = self.tentativeDevices[
    //   //       productIndex
    //   //     ].inventories.findIndex((inv) => inv.inventoryId === inventoryId);

    //   //     if (inventoryIndex !== -1) {
    //   //       // Remove devices from main list that only belong to this inventory
    //   //       const inventoryDevices = new Set(
    //   //         self.tentativeDevices[productIndex].inventories[
    //   //           inventoryIndex
    //   //         ].devices
    //   //       );

    //   //       const updatedDevices = self.tentativeDevices[
    //   //         productIndex
    //   //       ].devices.filter((deviceId) => {
    //   //         // Check if device exists in other inventories
    //   //         const inOtherInventories = self.tentativeDevices[
    //   //           productIndex
    //   //         ].inventories.some(
    //   //           (inv, idx) =>
    //   //             idx !== inventoryIndex && inv.devices.includes(deviceId)
    //   //         );
    //   //         return !inventoryDevices.has(deviceId) || inOtherInventories;
    //   //       });

    //   //       self.tentativeDevices[productIndex].devices.replace(updatedDevices);
    //   //       self.tentativeDevices[productIndex].inventories.splice(
    //   //         inventoryIndex,
    //   //         1
    //   //       );

    //   //       // Remove product entry if empty
    //   //       if (
    //   //         updatedDevices.length === 0 &&
    //   //         self.tentativeDevices[productIndex].inventories.length === 0
    //   //       ) {
    //   //         self.tentativeDevices.splice(productIndex, 1);
    //   //       }
    //   //     }
    //   //   }
    //   // } else {
    //   //   // Remove all devices for product
    //   //   self.tentativeDevices.replace(
    //   //     self.tentativeDevices.filter(
    //   //       (d) => d.currentProductId !== currentProductId
    //   //     )
    //   //   );
    //   // }
    // },
    getTentativeDevicesByInventory(productId: string, inventoryId: string) {
      console.log(productId)
      const productEntry = self.tentativeDevices;

      if (!productEntry) return [];

      const inventory = productEntry.inventories.find(
        (inv) => inv.inventoryId === inventoryId
      );

      return inventory ? [...inventory.devices] : [];
    },
    addIdentificationDetails(details: typeof self.identificationDetails) {
      console.log("details real one:", details);
      self.identificationDetails = details;
    },
    removeIdentificationDetails() {
      self.identificationDetails = {
        idType: "",
        idNumber: "",
        customerCountry: "",
        customerState: "",
        customerLGA: "",
        expirationDate: "",
        installationAddress: "",
        installationAddressLongitude: "",
        installationAddressLatitude: "",
        customerIdImage: null
      };
    },
    addNextOfKinDetails(details: typeof self.nextOfKinDetails) {
      self.nextOfKinDetails = details;
    },
    removeNextOfKinDetails() {
      self.nextOfKinDetails = {
        fullName: "",
        phoneNumber: "",
      };
    },
    addGuarantorDetails(details: typeof self.guarantorDetails) {
      self.guarantorDetails = details;
    },
    removeGuarantorDetails() {
      self.guarantorDetails = {
        fullName: "",
        phoneNumber: "",
        email: "",
        homeAddress: "",
      };
    },
    // addOrUpdateRecipient(
    //   currentProductId: string,
    //   recipient: {
    //     firstname: string;
    //     lastname: string;
    //     address: string;
    //     phone: string;
    //     email: string;
    //   }
    // ) {
    //   // const existingIndex = self.saleRecipient.findIndex(
    //   //   (d) => d.currentProductId === currentProductId
    //   // );

    //   // if (existingIndex !== -1) {
    //   //   // Update the existing recipient using applySnapshot
    //   //   applySnapshot(self.saleRecipient[existingIndex].recipient, recipient);
    //   // } else {
    //   //   // Add new recipient if not found
    //   //   self.saleRecipient.push(
    //   //     RecipientModel.create({
    //   //       currentProductId,
    //   //       recipient: toJS(recipient),
    //   //     })
    //   //   );
    //   // }
    // },
    // getRecipientByProductId(productId: string) {
    //   // const recipient = self.saleRecipient.find(
    //   //   (r) => r.currentProductId === productId
    //   // )?.recipient;
    //   // return recipient;
    // },
    // removeRecipient(currentProductId: string) {
    //   // self.saleRecipient.replace(
    //   //   self.saleRecipient.filter(
    //   //     (d) => d.currentProductId !== currentProductId
    //   //   )
    //   // );
    //   // self.saleItems.forEach((item) => {
    //   //   if (item.productId === currentProductId) {
    //   //     item.saleRecipient = undefined;
    //   //   }
    //   // });
    // },
    addPaymentDetails(data: any) {
      self.paymentDetails = data;
    },
    purgeStore() {
      applySnapshot(self, defaultValues);
    },
  }));

export const SaleStore = saleStore.create({
  category: "PRODUCT",
  customer: null,
  doesCustomerExist: false,
  products: null,
  doesProductCategoryExist: false,
  parameters: null,
  miscellaneousPrices: null,
  devices: null,
  saleItems: null,
  identificationDetails: {
    idType: "",
    idNumber: "",
    customerCountry: "",
    customerState: "",
    customerLGA: "",
    expirationDate: "",
    installationAddress: "",
    installationAddressLongitude: "",
    installationAddressLatitude: "",
  },
  nextOfKinDetails: {
    fullName: "",
    phoneNumber: "",
  },
  guarantorDetails: {
    fullName: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
  },
  paymentDetails: {
    public_key: "",
    tx_ref: "",
    amount: 0,
    currency: "NGN",
    customer: { email: "", phone_number: "", name: "" },
    customizations: { title: "", description: "", logo: "" },
    meta: {},
    redirect_url: "",
    payment_options: "card, ussd, mobilemoney",
  },
});

export type SaleStoreType = Instance<typeof saleStore>;
export type SaleItemStoreType = Instance<typeof SaleStore.saleItems>;
