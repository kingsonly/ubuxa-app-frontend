import React from 'react';
import PageLayout from './PageLayout';
import { StoreTable } from '../Components/Store/StoreTable';
import inventorybadge from "../assets/inventory/inventorybadge.png";
import { Store } from '../types/store';
import { TitlePill } from '../Components/TitlePillComponent/TitlePill';
import inventorygradient from "../assets/inventory/inventorygradient.svg";
import ActionButton from '../Components/ActionButtonComponent/ActionButton';
import circleAction from "../assets/settings/addCircle.svg";
// import { DropDown } from '../Components/DropDownComponent/DropDown';

const StorePage: React.FC = () => {
  const handleStoreSelect = (store: Store) => {
    console.log('Selected store:', store);
  };

  // const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <PageLayout pageName="Stores" badge={inventorybadge} className="w-full p-6">
      <section className="flex flex-col-reverse sm:flex-row items-center justify-between w-full bg-paleGrayGradient px-2 md:px-8 py-4 gap-2 min-h-[64px]">
        <div className="flex flex-wrap w-full items-center gap-2 gap-y-3">
            <TitlePill
                icon={inventorygradient}
                iconBgColor="bg-[#FDEEC2]"
                topText="All"
                bottomText="STORES"
                value={0}
            />
        </div>
        <div className="flex w-full items-center justify-between gap-2 min-w-max sm:w-max sm:justify-end">
            <ActionButton
                label="New Store"
                icon={<img src={circleAction} />}
                // onClick={() => setIsOpen(true)}
            />
            {/* <DropDown {...dropDownList} /> */}
        </div>
      </section>
      <div className="max-w-6xl mx-auto">
        <StoreTable onStoreSelect={handleStoreSelect} />
      </div>
    </PageLayout>
  );
};

export default StorePage;