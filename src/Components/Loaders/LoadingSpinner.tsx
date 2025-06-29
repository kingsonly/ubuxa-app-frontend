const LoadingSpinner = ({
  parentClass,
  loaderClass,
  text,
  textClass,
}: {
  parentClass?: string;
  loaderClass?: string;
  text?: string;
  textClass?: string;
}) => {
  return (
    <div
      className={`${parentClass} flex flex-col items-center justify-center gap-2`}
    >
      {/* <div className={`${loaderClass} loader`}></div> */}
      <img src="/Images/loader.gif" alt="Loader" width={50} height={50} />
      <p className={`${textClass}text-textDarkGrey text-base animate-pulse`}>
        {text || "Loading"}
      </p>

    </div>
  );
};

export default LoadingSpinner;
