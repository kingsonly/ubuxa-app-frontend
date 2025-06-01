import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
// import transactions from "@/assets/home/transactions.svg";
// import support from "@/assets/home/support.svg";
// import communication from "@/assets/home/communication.svg";
import useBreakpoint from "@/hooks/useBreakpoint";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";
import SalesIcon from "@/Components/appIcons/sales.icon";
import InventoryIcon from "@/Components/appIcons/inventory.icon";
import ProductIcon from "@/Components/appIcons/product.icon";
import SettingsIcon from "@/Components/appIcons/settings.icon";
import AgentIcon from "@/Components/appIcons/agent.icon";
import CustomerIcon from "@/Components/appIcons/customer.icon";
import ContractIcon from "@/Components/appIcons/contract.icon";


type SectionData = {
  sectionName: string;
  notificationCount?: number;
  sectionImage: any;
  location: string;
};

const Home = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpoint("max", 640);
  const notificationCounts = {
    Sales: 3,
    Transactions: 1,
    Customers: 2,
    Agents: 0,
    Products: 10,
    Inventory: 15,
    Devices: 10,
    Contracts: 2,
    Support: 3,
    Communication: 4,
    Settings: 0,
  };
  const homeData = [
    { sectionName: "Sales", sectionImage: <SalesIcon />, location: "/sales" },
    // {
    //   sectionName: "Transactions",
    //   sectionImage: transactions,
    //   location: "/transactions",
    // },
    {
      sectionName: "Customers",
      sectionImage: <CustomerIcon />,
      location: "/customers",
    },
    { sectionName: "Agents", sectionImage: <AgentIcon />, location: "/agents" },
    { sectionName: "Products", sectionImage: <ProductIcon />, location: "/products" },
    {
      sectionName: "Inventory",
      sectionImage: <InventoryIcon />,
      location: "/inventory",
    },
    {
      sectionName: "Devices",
      sectionImage: <InventoryIcon />,
      location: "/devices",
    },
    {
      sectionName: "Contracts",
      sectionImage: <ContractIcon />,
      location: "/contracts",
    },
    // { sectionName: "Support", sectionImage: support, location: "/support" },
    // {
    //   sectionName: "Communication",
    //   sectionImage: communication,
    //   location: "/communication",
    // },
    { sectionName: "Settings", sectionImage: <SettingsIcon />, location: "/settings" },
  ];

  const newHomeData: SectionData[] = homeData.map((data: SectionData) => ({
    ...data,
    notificationCount:
      notificationCounts[data.sectionName as keyof typeof notificationCounts],
  }));

  return (

    <PageLayout showheaderBadge={false} className="w-full px-2 py-8 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center">
        {newHomeData.map((section) => (
          <div
            key={section.sectionName}
            className="group flex flex-col items-center justify-between sm:justify-normal w-full max-w-[450px] h-max sm:h-[350px] px-[10px] py-[25px] sm:py-[20px] gap-2.5 border-[0.4px] border-strokeGreyTwo bg-white hover:border-strokeCream hover:cursor-pointer hover:bg-[#f6f7f8] transition-colors duration-300 ease-in-out"
            onClick={() => {
              if (!isMobile) navigate(section.location);
            }}
          >
            {/* {section?.notificationCount && section.notificationCount > 0 ? (
              <div
                className={`flex items-center justify-center ${
                  section?.notificationCount >= 10 ? "bg-grape" : "bg-[#FDEEC2]"
                } w-max h-[24px] pl-3 pr-0.5 gap-2 text-textDarkGrey text-[11px] font-medium md:font-normal rounded-full`}
              >
                Your attention is needed
                <span className="flex items-center justify-center w-[20px] h-[20px] bg-chalk shadow-innerCustom text-xs font-medium text-primary rounded-full">
                  {section.notificationCount}
                </span>
              </div>
            ) : (
              )} */}
            <div className="sm:h-[24px]"></div>
            <div className="flex flex-col items-center justify-center pb-4 sm:p-0">
              <div className="w-[143px] h-[143px] sm:w-[128px] sm:h-[128px] overflow-hidden">
                {section.sectionImage}
              </div>
              <h2 className="font-secondary font-bold text-lg sm:text-2xl text-textDarkGrey uppercase">
                {section.sectionName}
              </h2>
            </div>
            {isMobile && (
              <ProceedButton
                type="button"
                onClick={() => navigate(section.location)}
                className="w-14 h-14"
                disabled={false}
              />
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Home;
