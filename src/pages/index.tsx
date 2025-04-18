import { TaskCard } from "@components/TaskCard";
import { useAuth } from "@contexts/AuthProvider";
import { useToast } from "@contexts/ToastProvider";
import type { TaskDTO, TaskStatus } from "@dto/task";
import type { UserDTO } from "@dto/user";
import { axiosInstance } from "@libs/axios";
import { logger } from "@libs/pino";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [tasks, setTasks] = useState<Array<TaskDTO & { team: UserDTO | null }>>(
    []
  );

  const { setUser } = useAuth();
  const { addToast } = useToast();

  const filteredTasks = useMemo((): Array<
    TaskDTO & { team: UserDTO | null }
  > => {
    return statusFilter === "all"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);
  }, [statusFilter, tasks]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get<
          Array<TaskDTO & { team: UserDTO | null }>
        >("/api/tasks");

        if (res.status === 200) {
          setTasks(res.data);
        } else if (res.status === 401) {
          addToast(
            "Session expired, you will be redirected to login page",
            "error"
          );
          setUser(null);
        } else {
          throw new Error(`unhandled status code: ${res.status}`);
        }
      } catch (error) {
        logger.error(error, "failed to display tasks");
        addToast(
          "Something is wrong with the server, please try again",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [addToast, setUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Task Dashboard
          </h1>

          <div className="flex flex-wrap gap-2">
            <StatusFilterButton
              status="all"
              currentFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            <StatusFilterButton
              status="not_started"
              currentFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            <StatusFilterButton
              status="on_progress"
              currentFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            <StatusFilterButton
              status="done"
              currentFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            <StatusFilterButton
              status="reject"
              currentFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          </div>
        </header>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No tasks found with the selected status.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatusFilterButtonProps {
  status: TaskStatus | "all";
  currentFilter: TaskStatus | "all";
  setStatusFilter: Dispatch<SetStateAction<TaskStatus | "all">>;
}

function StatusFilterButton({
  status,
  currentFilter,
  setStatusFilter,
}: StatusFilterButtonProps) {
  return (
    <button
      onClick={() => setStatusFilter(status)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
        currentFilter === status
          ? "bg-blue-600 text-white"
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
      }`}
    >
      {status.split("_").join(" ")}
    </button>
  );
}
