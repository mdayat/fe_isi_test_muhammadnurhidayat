import type { TaskDTO } from "@dto/task";
import type { UserDTO } from "@dto/user";
import { useMemo } from "react";
import { format } from "date-fns";

interface TaskCardProps {
  task: TaskDTO & { team: UserDTO | null };
}

function TaskCard({ task }: TaskCardProps) {
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
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-gray-800">{task.name}</h3>

          <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors}`}
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

            <div className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded w-fit">
              {task.team ? `${task.team.name}'s Team` : "Unassigned"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TaskCard };
