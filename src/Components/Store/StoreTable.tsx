import React, { useState } from 'react';
import { Table, PaginationType } from '../TableComponent/Table';
import { Store } from '../../types/store';
import { mockStores } from '../../data/mockStores';

interface StoreTableProps {
  onStoreSelect?: (store: Store) => void;
}

export const StoreTable: React.FC<StoreTableProps> = ({ onStoreSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(6);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
    onStoreSelect?.(store);
  };

  const paginationInfo: PaginationType = () => ({
    total: mockStores.length,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage,
  });

  const StoreCard = (data: Store[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {data.map((store, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedStore?.name === store.name
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleStoreClick(store)}
          >
            <div className="flex flex-col items-center text-center">
              <img 
                src={store.image} 
                alt={store.name}
                className="w-16 h-16 object-cover rounded-full mb-3"
              />
              <h3 className="font-semibold text-gray-900 mb-2">{store.name}</h3>
              <div className="space-y-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  store.type === 'MAIN' ? 'bg-green-100 text-green-800' :
                  store.type === 'REGIONAL' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {store.type}
                </span>
                <p className="text-sm text-gray-600">
                  Capacity: <span className="font-medium">{store.capacity}</span>
                </p>
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
      {selectedStore && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Selected Store</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Name:</strong> {selectedStore.name}</p>
            <p><strong>Type:</strong> {selectedStore.type}</p>
            <p><strong>Capacity:</strong> {selectedStore.capacity}</p>
          </div>
        </div>
      )}
    </div>
  );
};