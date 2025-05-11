type HeaderBadgeIconProps = {
    image: string;
};
const HeaderBadgeIcon = (props: HeaderBadgeIconProps) => {
    const { image } = props;
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();

    return (
        <svg width="129"
            height="128"
            viewBox="0 0 129 128" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <mask id="settings-header-badge-mask">
                    <image
                        width="128"
                        height="128"
                        href={image}
                    />
                </mask>
            </defs>

            <rect
                width="128"
                height="128"
                fill={primaryColor || '#fff'}
                mask="url(#settings-header-badge-mask)"
            />
        </svg>
    );


};
export default HeaderBadgeIcon