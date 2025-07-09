import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useGetRequest } from "@/utils/useApiCall";
import { observer } from "mobx-react-lite";
import { SaleStore } from "@/stores/SaleStore";
import type { TabNamesType } from "../Inventory/InventoryDetailModal";
import type { ListDataType } from "../Products/SelectInventoryModal";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import { TableSearch } from "../TableSearchComponent/TableSearch";
import searchIcon from "../../assets/search.svg";
import ListPagination from "../PaginationComponent/ListPagination";
import TabComponent from "../TabComponent/TabComponent";
import wrong from "../../assets/table/wrong.png";
import { CardComponent } from "../CardComponents/CardComponent";
import { formatNumberWithCommas } from "@/utils/helpers";
import { DeviceStore } from "@/stores/DeviceStore";

type InventoryItem = {
    id: string;
    name: string;
    manufacturerName: string;
    sku: string;
    image: string;
    dateOfManufacture: null | string;
    status: "IN_STOCK" | string;
    class: "REGULAR" | string;
    inventoryCategoryId: string;
    inventorySubCategoryId: string;
    inventoryCategory: {
        id: string;
        name: string;
        parentId: null | string;
        type: string;
    };
    inventorySubCategory: {
        id: string;
        name: string;
        parentId: null | string;
        type: string;
    };
    batches: {
        id: string;
        costOfItem: number;
        price: number;
        batchNumber: number;
        numberOfStock: number;
        remainingQuantity: number;
        inventoryId: string;
    }[];
    salePrice: {
        minimumInventoryBatchPrice: number;
        maximumInventoryBatchPrice: number;
    };
    inventoryValue: number;
    totalRemainingQuantities: number;
    totalInitialQuantities: number;
};

const generateListDataEntries = (data: any): ListDataType[] => {
    return data?.inventories?.map((inventory: InventoryItem) => ({
        productId: inventory?.id,
        productImage: inventory?.image || "",
        productTag: inventory?.inventoryCategory?.name,
        productName: inventory?.name,
        productPrice:
            inventory?.salePrice?.minimumInventoryBatchPrice ===
                inventory?.salePrice?.maximumInventoryBatchPrice
                ? `₦ ${formatNumberWithCommas(
                    inventory?.salePrice?.maximumInventoryBatchPrice
                )}`
                : `₦ ${formatNumberWithCommas(
                    inventory?.salePrice?.minimumInventoryBatchPrice
                )} - ${formatNumberWithCommas(
                    inventory?.salePrice?.maximumInventoryBatchPrice
                )}`,
        totalRemainingQuantities: inventory?.totalRemainingQuantities || 0,
    }));
};

const SelectDeviceInventoryModal = observer(
    ({
        isModalOpen,
        setModalOpen,
    }: {
        isModalOpen: boolean;
        setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

    }) => {
        const [queryValue, setQueryValue] = useState<string>("");
        const [inventoryCategoryId, setInventoryCategoryId] = useState<string>("");
        const [dynamicListData, setDynamicListData] = useState<any[]>([]);
        const [tabContent, setTabContent] = useState<string>("");
        const [currentPage, setCurrentPage] = useState(1);
        const [entriesPerPage] = useState<number>(12);
        const [_filterValue, setFilterValue] = useState<string>("");
        const fetchAllProductCategories = useGetRequest(
            "/v1/inventory/categories/all",
            false
        );

        const fetchInventoryCategoryById = useGetRequest(
            `/v1/inventory?page=${currentPage}&limit=${entriesPerPage}&inventoryCategoryId=${_filterValue}${queryValue && `&search=${queryValue}`
            }`,
            false
        );
        const fetchedData = fetchInventoryCategoryById;

        useEffect(() => {
            if (fetchAllProductCategories?.error) {
                SaleStore.setProductCategoryExist(false);
            } else {
                SaleStore.setProductCategoryExist(true);
            }
        }, [fetchAllProductCategories]);

        const tabNames: TabNamesType[] = useMemo(() => {
            return (
                fetchAllProductCategories.data?.map((data: { name: any; id: any }) => ({
                    name: data.name,
                    key: data.name,
                    id: data.id,
                })) || []
            );
        }, [fetchAllProductCategories.data]);

        const fetchTabData = useCallback(
            async (categoryId: string) => {
                setFilterValue(categoryId);
                const data = await fetchInventoryCategoryById.data;
                if (data) {
                    return generateListDataEntries(data);
                }
            },
            [fetchInventoryCategoryById.data]
        );

        // Initialize tabContent with the first tab's key when modal opens
        useEffect(() => {
            if (isModalOpen && tabNames.length > 0) {
                const firstTabKey = tabNames[0].key;
                setTabContent(firstTabKey);
                setInventoryCategoryId(tabNames[0].id);
            }
        }, [isModalOpen, tabNames]);

        // Fetch data for the selected tab
        useEffect(() => {
            const fetchData = async () => {
                if (inventoryCategoryId) {
                    const tabData = await fetchTabData(inventoryCategoryId);
                    if (tabData) {
                        setDynamicListData((prevListData) => [
                            ...prevListData.filter((d) => d.name !== tabContent),
                            { name: tabContent, data: tabData },
                        ]);
                    }
                }
            };
            fetchData();
        }, [fetchTabData, inventoryCategoryId, tabContent]);

        const currentTabData = useMemo(() => {
            return (
                dynamicListData.find((item) => item.name === tabContent)?.data || []
            );
        }, [dynamicListData, tabContent]);

        const paginatedData: [] = useMemo(() => {
            return currentTabData;
        }, [currentTabData]);


        const activeTabName =
            tabNames.find((tab) => tab.key === tabContent)?.name || "";

        const handlePageChange = (page: number) => setCurrentPage(page);

        const itemsSelected = DeviceStore.selectedInventory?.productId ? 1 : 0;

        const handleTabSelect = useCallback(
            (key: string) => {
                setTabContent(key);
                const selectedTab = tabNames.find((tab) => tab.key === key);
                if (selectedTab) {
                    setInventoryCategoryId(selectedTab.id);
                    setCurrentPage(1);
                }
            },
            [tabNames]
        );

        return (
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setModalOpen(false);
                }}
                layout="right"
                size="large"
                bodyStyle="pb-[100px]"
                headerClass="h-[65px]"
                leftHeaderContainerClass="h-full items-start pl-1"
                leftHeaderComponents={
                    < h2
                        style={{ textShadow: "0.5px 1px grey" }}
                        className="text-textBlack text-xl font-semibold font-secondary"
                    >
                        Select Inventory
                    </h2>
                }
                rightHeaderContainerClass="h-full items-start"
            >
                <div className="flex flex-col gap-2 px-4 py-8" >
                    <TabComponent
                        tabs={
                            tabNames.map(({ name, key }) => ({
                                name,
                                key,
                                count: null,
                            }))
                        }
                        onTabSelect={handleTabSelect}
                        activeTabName={activeTabName}
                    />

                    <div className="flex items-center justify-between w-full" >
                        <ListPagination
                            totalItems={fetchedData?.data?.total || 0}
                            itemsPerPage={entriesPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            label={activeTabName}
                        />
                        <div className="flex items-center gap-3" >
                            <div className="flex items-center justify-center bg-[#F9F9F9] px-2 text-textDarkGrey w-max gap-1 h-[24px] border-[0.6px] border-strokeGreyThree rounded-full" >
                                <p className="flex items-center justify-center text-xs" >
                                    Item{itemsSelected > 1 ? "s" : ""} Selected
                                </p>
                                < span className="flex items-center justify-center w-max h-4 px-1 bg-[#EAEEF2] text-xs border-[0.2px] border-strokeGrey rounded-full" >
                                    {itemsSelected}
                                </span>
                            </div>
                            < button
                                type="button"
                                disabled={itemsSelected === 0}
                                onClick={() => {
                                    setModalOpen(false);
                                }}
                                className={`text-sm  ${itemsSelected > 0
                                    ? "bg-primaryGradient text-white"
                                    : "bg-[#F6F8FA] text-textDarkGrey cursor-not-allowed"
                                    } h-[24px] px-4 border-[0.6px] border-strokeGreyTwo rounded-full`}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                    < div className="w-full" >
                        <TableSearch
                            name={"Search"}
                            onSearch={(query: string) => {
                                setQueryValue(query);
                                setCurrentPage(1);
                            }}
                            queryValue={queryValue}
                            setQueryValue={setQueryValue}
                            refreshTable={fetchedData.mutate}
                            placeholder={`Search ${activeTabName} here`}
                            containerClass="w-full"
                            inputContainerStyle="w-full"
                            inputClass="w-full h-[32px] pl-3 bg-[#F9F9F9]"
                            buttonContainerStyle="w-full h-[32px] pl-3 pr-2 bg-white shadow-innerCustom"
                            icon={searchIcon}
                        />
                    </div>
                    <DataStateWrapper
                        isLoading={fetchInventoryCategoryById?.isLoading}
                        error={fetchInventoryCategoryById?.error}
                        errorStates={fetchInventoryCategoryById?.errorStates}
                        refreshData={fetchInventoryCategoryById?.mutate}
                        errorMessage={`Failed to fetch products list for "${activeTabName}".`
                        }
                    >
                        <div
                            className={
                                `flex flex-wrap ${fetchInventoryCategoryById?.error
                                    ? "justify-center"
                                    : "justify-start"
                                } items-center h-full gap-4`
                            }
                        >
                            {fetchedData?.data?.total > 0 ? (
                                paginatedData?.map((data: any, index: number) => {
                                    return (
                                        <CardComponent
                                            key={`${data.productId}-${index}`
                                            }
                                            variant={"deviceInventory"}
                                            isSale={true}
                                            productId={data.productId}
                                            productImage={data.productImage}
                                            productTag={data.productTag}
                                            productName={data.productName}
                                            productPrice={data.productPrice}
                                            onSelectProduct={(inventoryInfo: any) => {
                                                DeviceStore.setInventory(null)
                                                if (inventoryInfo) DeviceStore.setInventory(inventoryInfo);
                                            }}
                                            onRemoveProduct={() => {
                                                DeviceStore.unsetInventory();
                                            }}
                                        // isProductSelected={
                                        //     SaleStore.products.some(
                                        //         (p) => p.productId === data.productId
                                        //     )
                                        // }
                                        />
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full pt-16" >
                                    <img
                                        src={wrong}
                                        alt="No data available"
                                        className="w-[100px]"
                                    />
                                    <p className="text-textBlack font-medium" >
                                        No data available
                                    </p>
                                </div>
                            )}
                        </div>
                    </DataStateWrapper>
                </div>
            </Modal>
        );
    }
);

export default SelectDeviceInventoryModal;
