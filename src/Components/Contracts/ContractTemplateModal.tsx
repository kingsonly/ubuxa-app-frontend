import { useGetRequest } from "@/utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import type { Contract } from "./contractType";
import ContractTemplate from "./ContractTemplate";


const ContractTemplateModal = ({ contractId }: { contractId: string; }) => {

    const fetchSingleContract = useGetRequest(
        `/v1/contract/${contractId}`,
        false
    );

    const contractData: Contract = fetchSingleContract?.data;


    return (
        <div>
            <DataStateWrapper
                isLoading={fetchSingleContract?.isLoading}
                error={fetchSingleContract?.error}
                errorStates={fetchSingleContract?.errorStates}
                refreshData={fetchSingleContract?.mutate}
                errorMessage="Failed to fetch contract details"
            >
                <ContractTemplate {...contractData} refresh={fetchSingleContract?.mutate} />
            </DataStateWrapper>

        </div>
    )
}

export default ContractTemplateModal