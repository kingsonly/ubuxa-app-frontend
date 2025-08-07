import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import drop from "../../assets/table/dropdown.svg";
import dateIcon from "../../assets/table/date.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icon } from "../Settings/UserModal";
import edit from "../../assets/edit.svg";

export type DropDownType = {
  name?: string;
  items?: string[];
  onClickLink?: (index: number, cardData?: any) => void;
  buttonImgStyle?: string;
  dropDownContainerStyle?: string;
  isSearch?: boolean;
  isDate?: boolean;
  onDateClick?: (date: string) => void;
  showCustomButton?: boolean;
  disabled?: boolean[];
  defaultStyle?: boolean;
  cardData?: any;
};

export const DropDown = (props: DropDownType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showIcon, setShowIcon] = useState<number | null>();
  const [position, setPosition] = useState({ 
    top: 0, 
    left: 0, 
    placement: { vertical: 'bottom', horizontal: 'right' } 
  });

  const dropdownRef = useRef<HTMLDivElement | HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement | HTMLDivElement>(null);

  const {
    name,
    items,
    onClickLink,
    buttonImgStyle,
    dropDownContainerStyle,
    isDate,
    onDateClick,
    showCustomButton = false,
    disabled = items?.map(() => false) || [],
    defaultStyle,
    cardData,
  } = props;

  const calculatePosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Estimated dropdown dimensions with padding
    const dropdownWidth = 200;
    const dropdownHeight = isDate ? 320 : Math.min((items?.length || 1) * 40 + 20, 300);
    const padding = 10;

    // Calculate vertical placement and position
    const spaceBelow = viewportHeight - buttonRect.bottom - padding;
    const spaceAbove = buttonRect.top - padding;
    const vertical = spaceBelow >= dropdownHeight ? 'bottom' :
      spaceAbove >= dropdownHeight ? 'top' :
        spaceBelow > spaceAbove ? 'bottom' : 'top';

    // Calculate horizontal placement and position
    const spaceRight = viewportWidth - buttonRect.right - padding;
    const spaceLeft = buttonRect.left - padding;
    const horizontal = spaceRight >= dropdownWidth ? 'right' :
      spaceLeft >= dropdownWidth ? 'left' :
        spaceRight > spaceLeft ? 'right' : 'left';

    // Calculate absolute position for portal
    let top = vertical === 'bottom' ? buttonRect.bottom + 5 : buttonRect.top - dropdownHeight - 5;
    let left = horizontal === 'right' ? buttonRect.left : buttonRect.right - dropdownWidth;

    // Ensure dropdown stays within viewport bounds
    top = Math.max(padding, Math.min(top, viewportHeight - dropdownHeight - padding));
    left = Math.max(padding, Math.min(left, viewportWidth - dropdownWidth - padding));

    setPosition({ 
      top, 
      left, 
      placement: { vertical, horizontal } 
    });
  };

  const handleClick = () => {
    calculatePosition();
    setIsOpen(true);
  };

  const handleOptionClick = (index: number, cardData?: any) => {
    // Prevent clicks if the item is disabled
    if (disabled[index]) return;
    if (onClickLink) onClickLink(index, cardData);
    setIsOpen(false);
  };

  const handleDateChange = (date: Date | null) => {
    if (date && onDateClick) {
      setSelectedDate(date);
      onDateClick(date.toISOString());
      setIsOpen(false);
    }
  };

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowIcon(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowIcon(null);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      window.addEventListener('scroll', handleScroll, true); // Capture scroll events
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  // Create dropdown content
  const renderDropdownContent = () => {
    if (!isOpen) return null;

    const content = (
      <>
        {isDate ? (
          <div 
            ref={dropdownRef as React.RefObject<HTMLDivElement>}
            className="bg-white border border-strokeGreyThree rounded-lg shadow-lg"
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 9999,
            }}
          >
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              inline
            />
          </div>
        ) : (
          <ul
            ref={dropdownRef as React.RefObject<HTMLUListElement>}
            className={`${dropDownContainerStyle} flex flex-col gap-0.5 p-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] shadow-lg w-[200px] max-h-[300px] overflow-y-auto`}
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 9999,
            }}
          >
            {items?.map((item, index) => (
              <li
                key={index}
                className={`flex items-center justify-between h-max px-2 py-1 text-xs rounded-full border-[0.4px] border-transparent
                ${disabled[index]
                    ? "cursor-not-allowed text-gray-400 bg-gray-100"
                    : index === showIcon && !defaultStyle
                      ? "cursor-pointer bg-paleLightBlue text-textBlack"
                      : "cursor-pointer hover:bg-gray-100 text-textDarkGrey hover:border-strokeGreyTwo"
                  }`}
                onClick={() => handleOptionClick(index, cardData)}
                onMouseEnter={() => !disabled[index] && setShowIcon(index)}
                onMouseLeave={() => setShowIcon(null)}
              >
                {item}
                {index === showIcon && !defaultStyle && !disabled[index] ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.3292 4.6233C10.5372 4.80491 10.5586 5.12077 10.377 5.32879L5.1389 11.3288C5.04394 11.4376 4.90661 11.5 4.76224 11.5C4.61786 11.5 4.48053 11.4376 4.38558 11.3288L2.29034 8.92879C2.10873 8.72077 2.13015 8.40491 2.33817 8.2233C2.54619 8.0417 2.86205 8.06311 3.04366 8.27113L4.76224 10.2397L9.62367 4.67113C9.80528 4.46311 10.1211 4.4417 10.3292 4.6233Z"
                      fill="#66C95B"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13.6786 4.6796C13.8786 4.87004 13.8863 5.18653 13.6959 5.38649L7.9814 11.3865C7.88041 11.4925 7.73801 11.549 7.5918 11.5409C7.44558 11.5328 7.31025 11.4611 7.22154 11.3446L6.93599 10.9696C6.7687 10.7499 6.81118 10.4362 7.03088 10.2689C7.21962 10.1251 7.47775 10.1362 7.65282 10.2815L12.9717 4.69683C13.1622 4.49686 13.4787 4.48915 13.6786 4.6796Z"
                      fill="#66C95B"
                    />
                  </svg>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </>
    );

    // Render in portal to document body
    return createPortal(content, document.body);
  };

  return (
    <>
      <div className="flex w-max">
        {showCustomButton ? (
          <div ref={buttonRef as React.RefObject<HTMLDivElement>} onClick={handleClick} className="w-max">
            <Icon icon={edit} />
          </div>
        ) : (
          <button
            ref={buttonRef as React.RefObject<HTMLButtonElement>}
            type="button"
            className="flex items-center justify-between w-max gap-2 pl-2 pr-1 py-1 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-full"
            onClick={handleClick}
          >
            <span className="text-xs font-medium text-textGrey">
              {isDate && selectedDate
                ? selectedDate.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                : name || (isDate ? "Select Date" : "Select Option")}
            </span>
            <img
              src={isDate ? dateIcon : drop}
              alt="DropdownIcon"
              className={`w-4 h-4 ${buttonImgStyle || ""}`}
            />
          </button>
        )}
      </div>

      {/* Dropdown Content - Rendered via Portal */}
      {renderDropdownContent()}
    </>
  );
};
