import React from 'react';
import PageLayout from './PageLayout';
import { StoreTable } from '../Components/Store/StoreTable';
import inventorybadge from "../assets/inventory/inventorybadge.png";
import { Store } from '../types/store';

const StorePage: React.FC = () => {
  const handleStoreSelect = (store: Store) => {
    console.log('Selected store:', store);
  };

  return (
    <PageLayout pageName="Stores" badge={inventorybadge} className="w-full p-6">
      <div className="max-w-6xl mx-auto">
        <StoreTable onStoreSelect={handleStoreSelect} />
      </div>
    </PageLayout>
  );
};

export default StorePage;