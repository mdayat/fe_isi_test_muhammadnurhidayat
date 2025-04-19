import { useAuth } from "@contexts/AuthProvider";
import { useToast } from "@contexts/ToastProvider";
import type { TaskDTO } from "@dto/task";
import type { UserDTO } from "@dto/user";
import { axiosInstance } from "@libs/axios";
import { logger } from "@libs/pino";
import {
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { useOnClickOutside } from "usehooks-ts";

interface DeleteTaskModalProps {
  oldTask: TaskDTO & { team: UserDTO | null };
  setTasks: Dispatch<SetStateAction<Array<TaskDTO & { team: UserDTO | null }>>>;
  setIsDeleteModalOpen: Dispatch<SetStateAction<boolean>>;
}

function DeleteTaskModal({
  oldTask,
  setTasks,
  setIsDeleteModalOpen,
}: DeleteTaskModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useAuth();
  const { addToast } = useToast();

  useOnClickOutside(modalRef as RefObject<HTMLElement>, () =>
    setIsDeleteModalOpen(false)
  );

  const handleDeleteTask = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.delete<string>(
        `/api/tasks/${oldTask.id}`
      );

      if (res.status === 204) {
        addToast("Successfully deleted task", "success");
        setTasks((tasks) => tasks.filter((task) => task.id !== oldTask.id));
        setIsDeleteModalOpen(false);
      } else if (res.status === 401) {
        addToast(
          "Session expired, you will be redirected to login page",
          "error"
        );
        setUser(null);
      } else if (res.status === 403) {
        addToast("Access denied due to insufficient permissions", "error");
      } else if (res.status === 404) {
        addToast("Task not found", "error");
      } else {
        throw new Error(`unhandled status code: ${res.status}`);
      }
    } catch (error) {
      logger.error(error, "failed to delete task");
      addToast("Something is wrong with the server, please try again", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden"
      >
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Confirm Deletion
          </h3>

          <p className="text-gray-600">
            Are you sure you want to delete the task &quot;{oldTask.name}&quot;?
            This action cannot be undone.
          </p>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>

          <button
            onClick={handleDeleteTask}
            type="button"
            className={`${
              isLoading ? "bg-red-600/50" : "bg-red-600 hover:bg-red-700"
            } px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export { DeleteTaskModal };
