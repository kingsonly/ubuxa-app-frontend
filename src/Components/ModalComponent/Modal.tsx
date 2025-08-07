import React, { useEffect, useState, useCallback } from "react";
import { MdCancel } from "react-icons/md";
import clsx from "clsx";

export type ModalType = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "extra";
  layout?: "right" | "default";
  bodyStyle?: string;
  headerClass?: string;
  leftHeaderContainerClass?: string;
  leftHeaderComponents?: React.ReactNode;
  rightHeaderContainerClass?: string;
  rightHeaderComponents?: React.ReactNode;
};

export const Modal = ({
  isOpen,
  onClose,
  children,
  size = "medium",
  layout = "default",
  bodyStyle,
  headerClass,
  leftHeaderContainerClass,
  leftHeaderComponents,
  rightHeaderContainerClass,
  rightHeaderComponents,
}: ModalType) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle modal visibility and animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready before animation
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Keep rendered during close animation
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);



  // Prevent background scroll and handle scrollbar flickering
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Set CSS custom property for scrollbar width
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      
      // Add modal-open class to body
      document.body.classList.add('modal-open');
      
      return () => {
        // Remove modal-open class and custom property
        document.body.classList.remove('modal-open');
        document.documentElement.style.removeProperty('--scrollbar-width');
      };
    }
  }, [isOpen]);

  // Don't render if not needed
  if (!shouldRender) return null;

  // Modal size mapping
  const sizeClasses = {
    small: "w-[90vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw] max-w-[360px]",
    medium: "w-[95vw] sm:w-[70vw] md:w-[60vw] lg:w-[50vw] xl:w-[42vw] max-w-[530px]",
    large: "w-[100vw] sm:w-[90vw] md:w-[75vw] lg:w-[65vw] xl:w-[50vw] max-w-[660px]",
    extra: "w-[100vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[85vw] max-w-[800px]",
  };

  // Conditional layout styles
  const layoutClasses = clsx(
    layout === "right" &&
    "h-[100vh] mt-2 mr-1.5 bg-white shadow-lg modal-content transform rounded-md",
    sizeClasses[size],
    {
      "translate-x-0": isAnimating && layout === "right",
      "translate-x-full": !isAnimating && layout === "right",
      "-translate-y-full mt-2": layout !== "right",
    }
  );

  const wrapperClasses = clsx(
    layout === "right"
      ? "fixed inset-0 z-50 flex items-center justify-end"
      : "relative inline-block"
  );

  return (
    <div className={wrapperClasses}>
      <div
        className={clsx(
          "fixed inset-0 bg-black modal-backdrop",
          layout === "default" ? "z-40 rounded-md" : "",
          {
            "opacity-0": !isAnimating,
            "opacity-50": isAnimating,
          }
        )}
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {layout === "right" ? (
        <div className={layoutClasses} role="dialog" aria-modal="true">
          <header
            className={`flex items-center p-2 h-[40px] border-b-[0.6px] border-b-strokeGreyThree ${leftHeaderComponents ? "justify-between" : "justify-end"
              } ${headerClass}`}
          >
            <div
              className={`flex ${leftHeaderContainerClass

                  ? leftHeaderContainerClass
                  : "items-center gap-1"
                }`}
            >
              {leftHeaderComponents}
            </div>
            <div
              className={`flex ${rightHeaderContainerClass

                  ? rightHeaderContainerClass
                  : "items-center gap-1 "
                }`}
            >
              {rightHeaderComponents}
              <button
                onClick={handleClose}
                type="button"
                className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full top-4 right-4 hover:bg-slate-100"
                aria-label="Close modal"
                title="Close modal"
              >
                <MdCancel className="text-error" />
              </button>
            </div>
          </header>

          <section className={`${bodyStyle} h-full overflow-auto`}>
            {children}
          </section>
        </div>
      ) : (
        <section className={`${bodyStyle} h-full overflow-auto`}>
          {children}
        </section>
      )}
    </div>
  );
};
