import { Category } from "../Products/CreateNewProduct";
import inventoryIcon from "../../assets/inventory/inventoryIcon.svg";
import { Tag } from "../Products/ProductDetails";
import { formatDateTime } from "@/utils/helpers";
import { GoDotFill } from "react-icons/go";
import { useEffect } from "react";



const CategoryDetails = ({
    categoryData,
}: {
    categoryData: any;
}) => {
    useEffect(() => {
        console.log("make me shine", categoryData)
    }, [])
    return (
        <div className="flex flex-col justify-between w-full h-full min-h-[360px]">
            {/* <div className="flex flex-col gap-3">
               
            </div> */}
            <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                    <img src={inventoryIcon} alt="Inventory Icon" /> CATEGORY DETAILS
                </p>
                <div className="flex items-center justify-between">
                    <Tag name="Name" />
                    <p className="text-xs font-bold text-textDarkGrey">
                        {categoryData.name}
                    </p>
                </div>
                {categoryData.parent ?
                    <div className="flex items-center justify-between">
                        <Tag name="Parent" />
                        <p className="text-xs font-bold text-textDarkGrey">
                            {categoryData.parent.name}
                        </p>
                    </div> : null}
                {/* {categoryData.children ?
                    <div className="flex items-center justify-between">
                        <Tag name="Parent" />
                        <p className="text-xs font-bold text-textDarkGrey">
                            {categoryData.parent.name}
                        </p>
                    </div> : null} */}

                <div className="flex items-center justify-between">
                    <Tag name="Date & Time" />
                    <p className="text-xs font-bold text-textDarkGrey">
                        <div className="flex items-center justify-center gap-1 bg-[#F6F8FA] px-2 py-1 w-max border-[0.4px] border-strokeGreyTwo rounded-full">
                            <p className="text-xs text-textDarkGrey font-semibold">
                                {formatDateTime("date", categoryData.dateTime)}
                            </p>
                            <GoDotFill color="#E2E4EB" />
                            <p className="text-xs text-textDarkGrey">
                                {formatDateTime("time", categoryData.dateTime)}
                            </p>
                        </div>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default CategoryDetails;
