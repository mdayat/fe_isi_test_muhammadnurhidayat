import type { TaskDTO } from "@dto/task";
import type { UserDTO } from "@dto/user";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { format } from "date-fns";
import { useAuth } from "@contexts/AuthProvider";
import { EyeOpenIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskModal } from "./TaskModal";
import { DeleteTaskModal } from "./DeleteTaskModal";

interface TaskCardProps {
  task: TaskDTO & { team: UserDTO | null };
  setTasks: Dispatch<SetStateAction<Array<TaskDTO & { team: UserDTO | null }>>>;
}

function TaskCard({ task, setTasks }: TaskCardProps) {
  const { user } = useAuth();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const statusColors = useMemo((): string => {
    if (task.status === "not_started") {
      return "bg-gray-100 text-gray-800";
    } else if (task.status === "on_progress") {
      return "bg-blue-100 text-blue-800";
    } else if (task.status === "done") {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  }, [task.status]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="font-semibold text-lg leading-none text-gray-800">
            {task.name}
          </h3>

          <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ${statusColors}`}
          >
            {task.status.split("_").join(" ")}
          </span>
        </div>

        <div className="flex flex-col justify-between gap-4">
          <p
            className={`text-sm ${
              task.description ? "text-gray-600" : "text-gray-400 italic"
            }`}
          >
            {task.description ?? "No Description"}
          </p>

          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Created at {format(task.created_at, "MMM d, yyyy")}
            </div>

            {user?.role === "lead" ? (
              <div className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded w-fit">
                {task.team ? `${task.team.name}'s Team` : "Unassigned"}
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setIsDetailModalOpen(true)}
            type="button"
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <EyeOpenIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsUpdateModalOpen(true)}
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            title="Edit Task"
          >
            <Pencil2Icon className="w-5 h-5" />
          </button>

          {user?.role === "lead" ? (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              type="button"
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Task"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>

      {isDetailModalOpen ? (
        <TaskDetailModal
          task={task}
          statusColors={statusColors}
          setIsDetailModalOpen={setIsDetailModalOpen}
          setIsUpdateModalOpen={setIsUpdateModalOpen}
        />
      ) : (
        <></>
      )}

      {isUpdateModalOpen ? (
        <TaskModal
          type="update"
          oldTask={task}
          setTasks={setTasks}
          setIsModalOpen={setIsUpdateModalOpen}
        />
      ) : (
        <></>
      )}

      {isDeleteModalOpen ? (
        <DeleteTaskModal
          oldTask={task}
          setTasks={setTasks}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export { TaskCard };
