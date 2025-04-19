import { useAuth } from "@contexts/AuthProvider";
import { useToast } from "@contexts/ToastProvider";
import { axiosInstance } from "@libs/axios";
import { logger } from "@libs/pino";
import { ExitIcon } from "@radix-ui/react-icons";
import type { AxiosResponse } from "axios";
import { useState } from "react";

function TopNavbar() {
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const onLogout = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post<string, AxiosResponse<string>>(
        "/api/auth/logout"
      );

      if (res.status === 200) {
        addToast("Successfully logged out", "success");
        setUser(null);
      } else {
        throw new Error(`unhandled status code: ${res.status}`);
      }
    } catch (error) {
      logger.error(error, "failed to logout");
      addToast("Something is wrong with the server, please try again", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-gray-800 font-medium text-2xl">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </span>
        </div>

        <button
          onClick={onLogout}
          type="button"
          className={`${
            isLoading ? "text-gray-700/50" : "text-gray-700"
          } flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors`}
        >
          <ExitIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}

export { TopNavbar };
