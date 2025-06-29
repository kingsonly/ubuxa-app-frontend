import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { Modal } from "@/Components/ModalComponent/Modal";
import { DropDown } from "../DropDownComponent/DropDown";
import { useGetRequest, useApiCall } from "@/utils/useApiCall";
import { CustomerType } from "./CustomerTable";
import TabComponent from "../TabComponent/TabComponent";
import CustomerDetails, { DetailsType } from "./CustomerDetails";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import EditSettingsIcon from "../appIcons/edit-settings.icon";
import { toast } from "react-toastify";
const CustomerModal = ({
  isOpen,
  setIsOpen,
  customerID,
  refreshTable,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  customerID: string;
  refreshTable: KeyedMutator<any>;
}) => {
  const { apiCall } = useApiCall();
  const [tabContent, setTabContent] = useState<string>("customerDetails");
  const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [activeTabName, setActiveTabName] = useState<string>("");

  const fetchSingleCustomer = useGetRequest(
    `/v1/customers/single/${customerID}`,
    false
  );

  const generateCustomerEntries = (data: CustomerType): DetailsType => {
    return {
      customerId: data?.id,
      firstName: data?.firstname,
      lastName: data?.lastname,
      email: data?.email,
      phoneNumber: data?.phone,
      addressType: data?.addressType ?? "",
      location: data?.location,
      longitude: data?.longitude || "",
      latitude: data?.latitude || "",
      image: data?.image || "",
      landmark: data?.landmark || "",
    };
  };
  const handleCancelClick = () => setDisplayInput(false);
  const deleteCustomerById = async () => {
    const confirmation = prompt(
      `Are you sure you want to delete the customer with the name " ${fetchSingleCustomer?.data?.firstname} ${fetchSingleCustomer?.data?.lastname}" This action is irreversible! Enter "Yes" or "No".`,
      "No"
    );

    if (confirmation?.trim()?.toLowerCase() === "yes") {
      toast.info(`Deleting "${fetchSingleCustomer?.data?.firstname} ${fetchSingleCustomer?.data?.lastname}" `);
      await apiCall({
        endpoint: `/v1/customers/${customerID}`,
        method: "delete",
        successMessage: "Customer deleted successfully!",
      })
        .then(async () => {
          await refreshTable();
          setIsOpen(false);
        })
        .catch(() =>
          toast.error(`Failed to delete ${fetchSingleCustomer?.data?.firstname} ${fetchSingleCustomer?.data?.lastname}`)
        );
    }
  };
  const barCustomerById = async () => {
    if (fetchSingleCustomer?.data?.status === "barred") {
      const confirmation = prompt(
        `Are you sure you want to unbar the customer with the name " ${fetchSingleCustomer?.data?.firstname} ${fetchSingleCustomer?.data?.lastname}" ! Enter "Yes" or "No".`,
        "No"
      );

      if (confirmation?.trim()?.toLowerCase() === "yes") {
        toast.info(`Customer with the name "${fetchSingleCustomer?.data?.firstname} ${fetchSingleCustomer?.data?.lastname}" is being unbarred`);
        apiCall({
          endpoint: `/v1/customers/${customerID}`,
          method: "put",
          data: { status: "active" },
          successMessage: "Customer unbarred successfully!",
        })
          .then(async () => {
            await refreshTable();
            setIsOpen(false);
          })
          .catch(() =>
            toast.error(`Failed to unbar ${fetchSingleCustomer?.data?.firstname} ${fetchSingleCustomer?.data?.lastname}`)
          );
      }
    } else {
      const confirmation = prompt(
        `Are you sure you want to barr the customer with the name " ${fetchSingleCustomer?.data?.firstname} ${fetchSingleCustomer?.data?.lastname}" ! Enter "Yes" or "No".`,
        "No"
      );

      if (confirmation?.trim()?.toLowerCase() === "yes") {
        toast.info(`Customer with the name "${fetchSingleCustomer?.data?.firstname} ${fetchSingleCustomer?.data?.lastname}" is being barred`);
        apiCall({
          endpoint: `/v1/customers/${customerID}`,
          method: "put",
          data: { status: "barred" },
          successMessage: "Customer barred successfully!",
        })
          .then(async () => {
            await refreshTable();
            setIsOpen(false);
          })
          .catch(() =>
            toast.error(`Failed to barr ${fetchSingleCustomer?.data?.firstname} ${fetchSingleCustomer?.data?.lastname}`)
          );
      }
    }
  };
  const barCustomerText = fetchSingleCustomer?.data?.status === "barred" ? "Unbar Customer" : "Bar Customer";
  const dropDownList = {
    items: ["Delete Customer", barCustomerText],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          deleteCustomerById();
          break;
        case 1:
          barCustomerById();
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const tabNames = [
    { name: "Customer Details", key: "customerDetails", count: null },
    { name: "Product Details", key: "stats", count: null },
    { name: "Registration History", key: "registrationHistory", count: null },
    { name: "Contracts", key: "contracts", count: null },
    { name: "Transactions", key: "transactions", count: 0 },
    { name: "Tickets", key: "tickets", count: 0 },
  ];

  // const handleCallClick = () => {
  //   const callURL = `tel:${fetchSingleCustomer?.data?.phone}`;
  //   window.open(callURL, "_self");
  // };

  // const handleWhatsAppClick = () => {
  //   const whatsappURL = `https://wa.me/${fetchSingleCustomer?.data?.phone}`;
  //   window.open(whatsappURL, "_blank");
  // };

  return (
    <Modal
      layout="right"
      bodyStyle="pb-44 overflow-auto"
      isOpen={isOpen}
      onClose={() => {
        setTabContent("customerDetails");
        setIsOpen(false);
        setDisplayInput(false)
        handleCancelClick();
      }}
      leftHeaderContainerClass="pl-2"
      rightHeaderComponents={
        displayInput ? (
          <p
            className="text-xs text-textDarkGrey font-semibold cursor-pointer over"
            onClick={handleCancelClick}
            title="Cancel editing customer details"
          >
            Cancel Edit
          </p>
        ) : (
          <button
            className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full hover:bg-slate-100"
            onClick={() => {
              setActiveTabName(tabNames[0].name);
              setTabContent(tabNames[0].key);
              setDisplayInput(true)
            }
            }
          >
            <EditSettingsIcon />
          </button>
        )
      }
    >
      <div className="bg-white">
        <header
          className={`flex items-center ${fetchSingleCustomer?.data?.firstname
            ? "justify-between"
            : "justify-end"
            } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
        >
          {fetchSingleCustomer?.data?.firstname && (
            <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
              {fetchSingleCustomer?.data?.firstname}{" "}
              {fetchSingleCustomer?.data?.lastname}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            {/* <Icon icon={call} iconText="Call" handleClick={handleCallClick} />
            <Icon
              icon={message}
              iconText="Message"
              handleClick={handleWhatsAppClick}
            /> */}
            <DropDown {...dropDownList} />
          </div>
        </header>
        <div className="flex flex-col w-full gap-4 px-4 py-2">
          <TabComponent
            tabs={tabNames.map(({ name, key, count }) => ({
              name,
              key,
              count,
            }))}
            tabsContainerClass="p-2 rounded-[20px]"
            activeTabName={activeTabName}
            onTabSelect={(key) => {
              setActiveTabName("");
              setTabContent(key);
            }}
          />

          {tabContent === "customerDetails" ? (
            <DataStateWrapper
              isLoading={fetchSingleCustomer?.isLoading}
              error={fetchSingleCustomer?.error}
              errorStates={fetchSingleCustomer?.errorStates}
              refreshData={fetchSingleCustomer?.mutate}
              errorMessage="Failed to fetch customer details"
            >
              <CustomerDetails
                {...generateCustomerEntries(fetchSingleCustomer?.data)}
                refreshTable={refreshTable}
                displayInput={displayInput}
              />
            </DataStateWrapper>
          ) : (
            <div>
              {tabNames?.find((item) => item.key === tabContent)?.name} Coming
              Soon
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomerModal;
