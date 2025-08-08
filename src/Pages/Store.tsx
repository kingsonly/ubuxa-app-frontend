import React, { useState } from 'react';
import PageLayout from './PageLayout';
import { StoreTable } from '../Components/Store/StoreTable';
import inventorybadge from "../assets/inventory/inventorybadge.png";
import { StoreResponse } from '../types/store';
import { TitlePill } from '../Components/TitlePillComponent/TitlePill';
import inventorygradient from "../assets/inventory/inventorygradient.svg";
import ActionButton from '../Components/ActionButtonComponent/ActionButton';
import circleAction from "../assets/settings/addCircle.svg";
import CreateNewStore from '@/Components/Store/CreateNewStore';
import { useStoreManagement } from '@/hooks/useStoreManagement';
import { observer } from 'mobx-react-lite';

const StorePage: React.FC = observer(() => {
  const { storeCount, activeStores, inactiveStores, fetchAllStores } = useStoreManagement();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleStoreSelect = (store: StoreResponse) => {
    console.log('Selected store:', store);
  };

  // Initial data fetch
  React.useEffect(() => {
    fetchAllStores(true);
  }, []);

  return (
    <>
      <PageLayout pageName="Stores" badge={inventorybadge} className="w-full p-6">
        <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
          <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
              <TitlePill
                  icon={inventorygradient}
                  iconBgColor="bg-[#FDEEC2]"
                  topText="All"
                  bottomText="STORES"
                  value={storeCount}
              />
              <TitlePill
                  icon={inventorygradient}
                  iconBgColor="bg-[#E8F5E8]"
                  topText="Active"
                  bottomText="STORES"
                  value={activeStores.length}
              />
              <TitlePill
                  icon={inventorygradient}
                  iconBgColor="bg-[#FFE8E8]"
                  topText="Inactive"
                  bottomText="STORES"
                  value={inactiveStores.length}
              />
          </div>
          <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
              <ActionButton
                  label="New Store"
                  icon={<img src={circleAction} />}
                  onClick={() => setIsOpen(true)}
              />
          </div>
        </section>
        <div className="w-full mx-auto mt-8">
          <StoreTable onStoreSelect={handleStoreSelect} />
        </div>
    </PageLayout>
    <CreateNewStore
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onStoreCreated={() => fetchAllStores(true)}
    />
    </>
  );
});

export default StorePage;