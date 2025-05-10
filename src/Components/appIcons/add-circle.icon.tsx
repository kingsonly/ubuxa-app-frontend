const AddCircleIcon = () => {
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--buttonText')
        .trim();

    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clipPath="url(#add-circle-icon-clip)">
                <path
                    d="M10 8L8 8M8 8L6 8M8 8L8 6M8 8L8 10"
                    stroke={primaryColor || '#FFFFFF'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <path
                    d="M4.66634 2.22391C5.64692 1.65668 6.78538 1.33203 7.99967 1.33203C11.6816 1.33203 14.6663 4.3168 14.6663 7.9987C14.6663 11.6806 11.6816 14.6654 7.99967 14.6654C4.31778 14.6654 1.33301 11.6806 1.33301 7.9987C1.33301 6.78441 1.65766 5.64594 2.22489 4.66536"
                    stroke={primaryColor || '#FFFFFF'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </g>
            <defs>
                <clipPath id="add-circle-icon-clip">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );


};
export default AddCircleIcon