// import { useState } from "react";
import { Table } from "../TableComponent/Table";
import { formatDateTime } from "@/utils/helpers";
import { GoDotFill } from "react-icons/go";



interface DeviceTokenEntries {
    dateTime: string;
    duration: string;
    id: string;
    token: string;
    serialNumber: number;
}
export interface Token {
    id: string,
    createdAt: string,
    token: string,
    duration: string,
    tenantId: string
}


// Helper function to map the API data to the desired format
const generateDeviceTokenEntries = (data: Token[]): DeviceTokenEntries[] => {
    const entries: DeviceTokenEntries[] = data?.map((item, index) => {
        return {
            serialNumber: index + 1,
            id: item.id,
            dateTime: item.createdAt,
            token: item.token,
            duration: item.duration,
        };
    });

    return entries;
};

const DeviceTokens = ({
    tokenData,
    isLoading,
}: {
    tokenData: Token[];
    isLoading: boolean;
}) => {

    const columnList = [
        { title: "S/N", key: "serialNumber" },
        { title: "TOKEN", key: "token", },
        { title: "DURATION", key: "duration", },
        {
            title: "DATE & TIME",
            key: "dateTime",

            valueIsAComponent: true,
            customValue: (value: string) => {
                return (
                    <div className="flex items-center justify-center gap-1 bg-[#F6F8FA] px-2 py-1 w-max border-[0.4px] border-strokeGreyTwo rounded-full">
                        <p className="text-xs text-textDarkGrey font-semibold">
                            {formatDateTime("date", value)}
                        </p>
                        <GoDotFill color="#E2E4EB" />
                        <p className="text-xs text-textDarkGrey">
                            {formatDateTime("time", value)}
                        </p>
                    </div>
                );
            },
        },
    ];



    return (
        <>
            <div className="w-full">
                <Table
                    showHeader={false}
                    columnList={columnList}
                    loading={isLoading}
                    tableData={generateDeviceTokenEntries(tokenData)}

                />
            </div>

        </>
    );
};

export default DeviceTokens;
