import React from "react";
import curvedlines from "@/assets/sales/curvedlines.png";
import { MdCancel } from "react-icons/md";
import { observer } from "mobx-react-lite";
import SalesBoltIcon from "../appIcons/sales-bolt.icon";

const SmallModal = observer(
    ({
        description,
        children,
        onClose,

    }: {
        description: string;
        children: React.ReactNode;
        onClose: () => void
    }) => {


        const handleClose = () => {
            onClose();
        };



        return (
            <>
                <div
                    className="fixed inset-0 z-40 transition-opacity bg-black opacity-50"
                    onClick={handleClose}
                    aria-hidden="true"
                ></div>

                <div className="fixed inset-0 flex justify-center items-center z-50">
                    <div
                        className="space-y-3 bg-white px-5 py-4 rounded-[20px] shadow-menuCustom w-96 min-h-[500px] relative"
                        style={{
                            backgroundImage: `url(${curvedlines})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        <div className="flex items-start justify-between w-full">
                            <SalesBoltIcon />
                            {/* <img src={skewedsettings} alt="Skewed settings" width="45px" /> */}
                            <button
                                onClick={handleClose}
                                className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full top-4 right-4 hover:bg-slate-100"
                                aria-label="Close modal"
                                title="Close modal"
                            >
                                <MdCancel className="text-error" />
                            </button>
                        </div>
                        <p
                            className={`bg-customPrimary w-full px-2 py-1 text-textGrey text-xs italic font-medium rounded-full`}
                        >
                            {description}
                        </p>
                        {children}
                    </div>
                </div>
            </>
        );
    }
);

export default SmallModal;
