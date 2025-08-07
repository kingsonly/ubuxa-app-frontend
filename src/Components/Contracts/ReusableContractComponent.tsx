import React from 'react';



type LabelValueProps = {
    label: string;
    value?: React.ReactNode;
    labelClassName?: string;
    valueClassName?: string;
    wrapperClassName?: string;
};

type SectionHeaderProps = {
    children: React.ReactNode;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    className?: string;
};

export const LabelValue: React.FC<LabelValueProps> = ({
    label,
    value,
    labelClassName = 'font-semibold',
    valueClassName = '',
    wrapperClassName = '',
}) => {
    return (
        <div className={wrapperClassName}>
            <span className={labelClassName}>{label}: </span>
            <span className={valueClassName}>{value ?? 'N/A'}</span>
        </div>
    );
};




export const SectionHeader: React.FC<SectionHeaderProps> = ({
    children,
    as: Tag = 'h3',
    className = 'font-bold text-base mb-3',
}) => {
    return <Tag className={className}>{children}</Tag>;
};
