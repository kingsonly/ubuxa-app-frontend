import React, { useState } from 'react';
import { Table, PaginationType } from '../TableComponent/Table';
import { StoreResponse } from '../../types/store';
import { useStoreManagement } from '@/hooks/useStoreManagement';
import { useNavigate } from 'react-router-dom';
import { DropDown } from '../DropDownComponent/DropDown';
import StoreDetailModal from './StoreDetailModal';
import UserAssignmentModal from './UserAssignmentModal';
import { observer } from 'mobx-react-lite';

interface StoreTableProps {
  onStoreSelect?: (store: StoreResponse) => void;
}

export const StoreTable: React.FC<StoreTableProps> = observer(({ onStoreSelect }) => {
  const navigate = useNavigate();
  const { stores, loading, fetchAllStores } = useStoreManagement();
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [selectedStoreName, setSelectedStoreName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);

  const handleStoreClick = (store: StoreResponse) => {
    setSelectedStoreId(store.id);
    setSelectedStoreName(store.name);
    setIsDetailModalOpen(true);
    onStoreSelect?.(store);
  };

  const paginationInfo: PaginationType = () => ({
    total: stores.length,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });

  const getDropDownList = (store: StoreResponse) => ({
    items: ["View Store", "Assign Users", "View Inventory", store.isActive ? "Deactivate" : "Activate"],
    onClickLink: (index: number) => {
      setSelectedStoreId(store.id);
      setSelectedStoreName(store.name);
      
      switch (index) {
        case 0:
          setIsDetailModalOpen(true);
          break;
        case 1:
          setIsUserModalOpen(true);
          break;
        case 2:
          navigate("/inventory");
          break;
        case 3:
          // Toggle store status - this could be implemented as a quick action
          console.log(`${store.isActive ? 'Deactivating' : 'Activating'} store:`, store.name);
          break;
        default:
          break;
      }
    },
    showCustomButton: true,
  });

  const StoreCard = (data: StoreResponse[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {data.map((store, index) => (
           <div
           key={index}
           className="relative bg-white rounded-[28px] border-4 border-white shadow-md flex flex-col items-stretch w-full max-w-[440px] cursor-pointer hover:shadow-lg transition-shadow"
           style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.06)" }}
           onClick={() => handleStoreClick(store)}
         >
           <div className="absolute top-4 right-4 z-10">
             <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
               store.classification === 'MAIN' 
                 ? 'bg-purple-500 text-white'
                 : store.classification === 'BRANCH'
                 ? 'bg-blue-500 text-white'
                 : 'bg-green-500 text-white'
             }`}>
               {store.classification}
             </span>
           </div>
           
           <div className="absolute top-4 left-4 z-10">
             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
               store.isActive 
                 ? 'bg-green-100 text-green-800' 
                 : 'bg-red-100 text-red-800'
             }`}>
               {store.isActive ? 'Active' : 'Inactive'}
             </span>
           </div>
           
           {/* Placeholder image - you can replace with actual store images */}
           <div className="w-full aspect-[16/7] bg-gradient-to-br from-blue-100 to-purple-100 rounded-[20px] mt-2 flex items-center justify-center">
             <div className="text-4xl text-gray-400">🏪</div>
           </div>
           
           <div className="flex items-center justify-between gap-2 px-4 py-3">
             <div className="flex flex-col gap-1 min-w-0 flex-1">
               <span className="px-4 py-1 bg-purpleBlue border border-blue-300 text-dark-500 rounded-full text-base font-medium truncate max-w-[260px]" title={store.name}>
                 {store.name}
               </span>
               {store.address && (
                 <p className="text-xs text-textDarkGrey truncate" title={store.address}>
                   📍 {store.address}
                 </p>
               )}
             </div>
             <div onClick={(e) => e.stopPropagation()}>
               <DropDown {...getDropDownList(store)} />
             </div>
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
        tableData={stores}
        tableType="card"
        cardComponent={StoreCard}
        loading={loading}
        paginationInfo={paginationInfo}
        refreshTable={async () => await fetchAllStores(true)}
        clearFilters={() => {
          // Clear filters logic if needed
        }}
      />
      
      {selectedStoreId && (
        <>
          <StoreDetailModal 
            isOpen={isDetailModalOpen}
            setIsOpen={setIsDetailModalOpen}
            storeId={selectedStoreId}
            onStoreUpdated={() => fetchAllStores(true)}
          />
          
          <UserAssignmentModal
            isOpen={isUserModalOpen}
            setIsOpen={setIsUserModalOpen}
            storeId={selectedStoreId}
            storeName={selectedStoreName}
            onUserAssigned={() => fetchAllStores(true)}
          />
        </>
      )}
    </div>
  );
});