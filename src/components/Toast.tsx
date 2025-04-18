import { useEffect, useState } from "react";
import type { ToastProps } from "../contexts/ToastProvider";
import {
  CheckCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

function Toast({
  message,
  type,
  onClose,
}: Pick<ToastProps, "type" | "message"> & { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        role="alert"
        className={`flex min-w-96 w-full max-w-sm items-center justify-between rounded-lg p-4 shadow-lg sm:max-w-md md:max-w-lg ${
          type === "success"
            ? "bg-green-50 text-green-800"
            : "bg-red-50 text-red-800"
        }`}
      >
        <div className="flex items-center gap-3">
          {type === "success" ? (
            <CheckCircledIcon className="h-5 w-5 text-green-500" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          )}
          <p className="text-sm font-medium sm:text-base">{message}</p>
        </div>

        <button
          onClick={handleClose}
          type="button"
          className="ml-3 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Close"
        >
          <Cross2Icon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export { Toast };
