import useTokens from "@/hooks/useTokens";

const AddCircleGoldIcon = () => {
    const { tenant } = useTokens();
    const primaryColor = tenant?.theme?.primary?.trim();
    const secondaryColor = tenant?.theme?.ascent?.trim();

    return (
        <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="0.5"
                y="0.5"
                width="23"
                height="23"
                rx="11.5"
                fill={secondaryColor}
            />
            <rect
                x="0.5"
                y="0.5"
                width="23"
                height="23"
                rx="11.5"
                stroke={primaryColor}
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.0002 18.6654C15.6821 18.6654 18.6668 15.6806 18.6668 11.9987C18.6668 8.3168 15.6821 5.33203 12.0002 5.33203C8.31826 5.33203 5.3335 8.3168 5.3335 11.9987C5.3335 15.6806 8.31826 18.6654 12.0002 18.6654ZM12.5002 9.9987C12.5002 9.72256 12.2763 9.4987 12.0002 9.4987C11.724 9.4987 11.5002 9.72256 11.5002 9.9987L11.5002 11.4987H10.0002C9.72402 11.4987 9.50016 11.7226 9.50016 11.9987C9.50016 12.2749 9.72402 12.4987 10.0002 12.4987H11.5002V13.9987C11.5002 14.2748 11.724 14.4987 12.0002 14.4987C12.2763 14.4987 12.5002 14.2748 12.5002 13.9987L12.5002 12.4987H14.0002C14.2763 12.4987 14.5002 12.2749 14.5002 11.9987C14.5002 11.7226 14.2763 11.4987 14.0002 11.4987H12.5002V9.9987Z"
                fill={primaryColor}
            />
        </svg>
    );


};
export default AddCircleGoldIcon