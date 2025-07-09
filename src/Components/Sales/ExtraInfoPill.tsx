import React from 'react';
import { Info } from 'lucide-react';
import { Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export type ExtraInfoType = 'parameters' | 'miscellaneous' | 'devices' | 'recipient';

interface ExtraInfoPillProps {
    type: ExtraInfoType;
    label: string;
    onClick: (type: ExtraInfoType) => void;
    infoMessage?: string;
    required?: boolean;
    error?: string;
    filled?: boolean;
}

const labelsMap: Record<ExtraInfoType, string> = {
    parameters: 'Set Parameters',
    miscellaneous: 'Set Miscellaneous Costs',
    devices: 'Link Device',
    recipient: 'Set Recipient',
};

const ExtraInfoPill: React.FC<ExtraInfoPillProps> = ({
    type,
    onClick,
    infoMessage,
    required = false,
    error,
    filled = false,
}) => {
    const baseClasses = 'flex items-center text-sm font-medium px-3 py-1 w-max rounded-full cursor-pointer transition-all';
    const selectedClasses = 'bg-primaryGradient text-white border-transparent';
    const unselectedClasses = 'bg-white text-textDarkGrey border-[0.6px] border-strokeGreyTwo';
    const errorClasses = error ? 'border-red-500' : '';

    return (
        <div
            className={`${baseClasses} ${filled ? selectedClasses : unselectedClasses} ${errorClasses}`}
            onClick={() => onClick(type)}
        >
            {/* Optional asterisk for required */}
            {required && <span className="text-red-500 mr-1">*</span>}

            {/* Info tooltip */}
            {infoMessage && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info size={16} className="mr-1 text-textBlack bg-[#F6F8FA] rounded-full p-0.5" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs font-light p-2 border border-strokeGreyTwo rounded-md shadow-lg bg-white text-textBlack">
                            {infoMessage}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {/* Label */}
            <span>{labelsMap[type]}</span>

            {/* Validation error tooltip on hover */}
            {error && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="ml-1 text-red-500">!</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs font-light p-2 border border-red-500 rounded-md shadow-lg bg-white text-red-500">
                            {error}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {/* Check icon when filled */}
            {filled && <Check size={16} className="ml-1 text-green-500" />}
        </div>
    );
};

export default ExtraInfoPill;
