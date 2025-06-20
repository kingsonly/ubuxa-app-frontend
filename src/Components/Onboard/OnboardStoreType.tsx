import React, { useState } from 'react';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useTenantApi } from '@/utils/tenant-api';
import { useTenant } from '@/Context/tenantsContext';

export enum StoreType {
  SINGLE_STORE = 'SINGLE_STORE',
  MULTI_STORE = 'MULTI_STORE'
}

const storeTypeSchema = z.object({
  storeType: z.enum([StoreType.SINGLE_STORE, StoreType.MULTI_STORE], {
    required_error: 'Store type is required',
    invalid_type_error: 'Invalid store type selected'
  })
});

interface OnboardStoreTypeProps {
  updateTenantStatus: (status: string) => void;
}

const OnboardStoreType: React.FC<OnboardStoreTypeProps> = ({ updateTenantStatus }) => {
  const [selectedStoreType, setSelectedStoreType] = useState<StoreType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { updateTenant } = useTenantApi();
  const { tenant } = useTenant();

  const handleSelect = (type: StoreType) => {
    setSelectedStoreType(type);
    setError(null);
  };

  const handleNext = async () => {
    if (!selectedStoreType) {
      setError('Please select a store type');
      return;
    }

    try {
      // Validate the selection
      const validatedData = storeTypeSchema.parse({ storeType: selectedStoreType });
      
      // Update tenant with store type
      await updateTenant(tenant?.id, { storeType: validatedData.storeType });
      
      // Update tenant status after successful API call
      updateTenantStatus('ONBOARD_STORE_TYPE');
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('Failed to save store type. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Choose Your Store Type
      </h2>
      <p className="text-gray-600 mb-8">
        Select whether you want to manage a single store or multiple stores.
      </p>

      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={() => handleSelect(StoreType.SINGLE_STORE)}
          className={`w-full p-6 rounded-lg border transition-all duration-200 ${
            selectedStoreType === StoreType.SINGLE_STORE
              ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">Single Store</h3>
            <p className="text-gray-600 text-center">
              Manage a single store with all features and functionalities.
            </p>
          </div>
        </button>

        <button
          onClick={() => handleSelect(StoreType.MULTI_STORE)}
          className={`w-full p-6 rounded-lg border transition-all duration-200 ${
            selectedStoreType === StoreType.MULTI_STORE
              ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2">Multi-Store</h3>
            <p className="text-gray-600 text-center">
              Manage multiple stores with centralized administration.
            </p>
          </div>
        </button>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleNext}
          disabled={!selectedStoreType}
          className={`w-full flex items-center justify-center space-x-2 ${
            !selectedStoreType ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardStoreType;
