import React, { useState } from 'react';
import { Store } from '../../types/store';
import { mockStores } from '../../data/mockStores';

interface StoreSelectionProps {
  onStoreSelect?: (store: Store) => void;
}

export const StoreSelection: React.FC<StoreSelectionProps> = ({ onStoreSelect }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    onStoreSelect?.(store);
  };

  return (
    <div className="store-selection">
      <h3 className="text-lg font-semibold mb-4">Select Store/Warehouse</h3>
      <div className="grid gap-3">
        {mockStores.map((store, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedStore?.name === store.name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleStoreSelect(store)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">{store.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Type: <span className="font-medium text-blue-600">{store.type}</span>
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  store.type === 'MAIN' ? 'bg-green-100 text-green-800' :
                  store.type === 'REGIONAL' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {store.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedStore && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            Selected: <strong>{selectedStore.name}</strong> ({selectedStore.type})
          </p>
        </div>
      )}
    </div>
  );
};