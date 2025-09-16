import { useEffect, useRef } from "react";

const Modal = ({ isOpen, onClose, children }) => {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Store the previously focused element
            previousFocusRef.current = document.activeElement;

            // Focus the modal
            modalRef.current?.focus();

            // Prevent body scroll
            document.body.style.overflow = "hidden";
        } else {
            // Restore body scroll
            document.body.style.overflow = "unset";

            // Restore focus to previously focused element
            if (previousFocusRef.current) {
                previousFocusRef.current.focus();
            }
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isOpen, onClose]);

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Tab") {
            // Trap focus within modal
            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements && focusableElements.length > 0) {
                const firstElement = focusableElements[0];
                const lastElement =
                    focusableElements[focusableElements.length - 1];

                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === lastElement
                ) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-999999 filter-b min-w-screen flex items-center justify-center backdrop-blur-xs  bg-black/20`}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={"modal"}
        >
            <div
                ref={modalRef}
                className={`relative bg-white  rounded-lg shadow-xl mx-4  `}
                style={{ overflow: "visible" }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
            >
                <div className="mx-8">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
