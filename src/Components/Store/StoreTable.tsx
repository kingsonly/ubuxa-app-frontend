import React, { useState } from 'react';
import { Table, PaginationType } from '../TableComponent/Table';
import { Store } from '../../types/store';
import { mockStores } from '../../data/mockStores';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { DropDown } from '../DropDownComponent/DropDown';
import StoreDetailModal from './StoreDetailModal';

interface StoreTableProps {
  onStoreSelect?: (store: Store) => void;
}

export const StoreTable: React.FC<StoreTableProps> = ({ onStoreSelect }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [storeId, setStoreId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
    setStoreId(store.id);
    setIsOpen(true);
    onStoreSelect?.(store);
  };

  const paginationInfo: PaginationType = () => ({
    total: mockStores.length,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });

  const dropDownList = {
    items: ["View Store", "View Inventory log", "De-activate warehouse"],
    onClickLink: (index: number) => {
      console.log("INDEX:", index);
      switch (index) {
        case 0:
          navigate(`/store/${storeId}`);
          break;
        case 1:
          navigate("/inventory");
          break;
        case 2:
          navigate("/inventory");
          break;
        default:
          break;
      }
    },
    showCustomButton: true,
  };

  const StoreCard = (data: Store[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {data.map((store, index) => (
           <div
           key={index}
           className="relative bg-white rounded-[28px] border-4 border-white shadow-md flex flex-col items-stretch w-full max-w-[440px]"
           style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.06)" }}
          //  onClick={() => handleStoreClick(store)}
         >
           <div className="absolute top-4 right-4 z-10">
             <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium shadow-lg">
               {store.type}
             </span>
           </div>
           <img
             src={store.image}
             alt={store.name}
             className="w-full aspect-[16/7] object-cover rounded-[20px] mt-2"
           />
           <div className="flex items-center justify-between gap-2 px-4 py-3">
             <div className="flex items-center gap-3 min-w-0">
               <span className="px-4 py-1 bg-purpleBlue border border-blue-300 text-dark-500 rounded-full text-base font-medium truncate max-w-[260px]" title={store.name}>
                 {store.name}
               </span>
             </div>
             <DropDown {...dropDownList} />
           </div>
         </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <Table
        showHeader={true}
        tableTitle="Stores"
        tableData={mockStores}
        tableType="card"
        cardComponent={StoreCard}
        loading={false}
        paginationInfo={paginationInfo}
        refreshTable={async () => {
          // Refresh logic if needed
        }}
        clearFilters={() => {
          // Clear filters logic if needed
        }}
      />
      {/* <StoreDetailModal /> */}
      {selectedStore && (
        <StoreDetailModal 
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          warehouseID={storeId}
          // refreshTable={refreshTable}
        />
      )}
    </div>
  );
};