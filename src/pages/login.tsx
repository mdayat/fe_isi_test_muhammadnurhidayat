import { useAuth } from "@contexts/AuthProvider";
import { useToast } from "@contexts/ToastProvider";
import type { LoginUserDTO, UserDTO } from "@dto/user";
import { axiosInstance } from "@libs/axios";
import { logger } from "@libs/pino";
import type { AxiosResponse } from "axios";
import { useState, type FormEvent } from "react";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const res = await axiosInstance.post<
        UserDTO,
        AxiosResponse<UserDTO>,
        LoginUserDTO
      >("/api/auth/login", { id: userId });

      if (res.status === 200) {
        addToast("Successfully logged in", "success");
        setUser(res.data);
      } else if (res.status === 400) {
        addToast("Invalid user Id, the user Id must be a valid UUID", "error");
      } else if (res.status === 404) {
        addToast("User not found", "error");
      } else {
        throw new Error(`unhandled status code: ${res.status}`);
      }
    } catch (error) {
      logger.error(error, "failed to login");
      addToast("Something is wrong with the server, please try again", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">Login</h1>

        <p className="text-center mb-10 mt-2 text-sm text-gray-600">
          Enter your user ID to continue
        </p>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 mb-0 space-y-6"
        >
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              User ID
            </label>

            <input
              id="userId"
              name="userId"
              type="text"
              required
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your user ID"
            />
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className={`${
              isLoading ? "bg-blue-600/50" : "bg-blue-600 hover:bg-blue-700"
            } w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
