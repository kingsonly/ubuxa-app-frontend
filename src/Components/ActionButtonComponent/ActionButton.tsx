import React, { ReactNode } from "react";

interface ActionButtonProps {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  buttonClass?: string;
  labelClass?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  disabled = false,
  buttonClass,
  labelClass,
}) => {
  return (
    <button
      className={`${buttonClass} flex items-center bg-secondary px-2 py-1 h-[32px] gap-1 border-[0.2px] border-strokeGreyTwo rounded-[32px] shadow-innerCustom transition-all hover:bg-primary`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon ? icon : null}
      <span className={`${labelClass} text-buttonText text-[10px] font-medium`}>
        {label}
      </span>
    </button>
  );
};

export default ActionButton;
