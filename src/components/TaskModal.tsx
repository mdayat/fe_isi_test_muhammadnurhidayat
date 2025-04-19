import { useAuth } from "@contexts/AuthProvider";
import { useToast } from "@contexts/ToastProvider";
import type { CreateTaskDTO, TaskDTO, UpdateTaskDTO } from "@dto/task";
import type { UserDTO } from "@dto/user";
import { axiosInstance } from "@libs/axios";
import { logger } from "@libs/pino";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { AxiosResponse } from "axios";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import { useOnClickOutside } from "usehooks-ts";

interface TaskModalProps {
  type: "create" | "update";
  oldTask?: TaskDTO & { team: UserDTO | null };
  setTasks: Dispatch<SetStateAction<Array<TaskDTO & { team: UserDTO | null }>>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

function TaskModal({
  type,
  oldTask,
  setTasks,
  setIsModalOpen,
}: TaskModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<UserDTO[]>([]);
  const [formData, setFormData] = useState<CreateTaskDTO>({
    name: oldTask?.name ?? "",
    description: oldTask?.description ?? "",
    status: oldTask?.status ?? "not_started",
    team_id: oldTask?.team?.id ?? "",
  });

  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  useOnClickOutside(modalRef as RefObject<HTMLElement>, () =>
    setIsModalOpen(false)
  );

  const isButtonDisabled = useMemo((): boolean => {
    return (
      isLoading ||
      formData.name === "" ||
      (formData.name === oldTask?.name &&
        formData.description === oldTask?.description &&
        formData.status === oldTask?.status &&
        formData.team_id === oldTask?.team?.id)
    );
  }, [
    formData.description,
    formData.name,
    formData.status,
    formData.team_id,
    isLoading,
    oldTask?.description,
    oldTask?.name,
    oldTask?.status,
    oldTask?.team?.id,
  ]);

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      let res: AxiosResponse<TaskDTO>;
      const changes: UpdateTaskDTO = {};

      if (type === "create") {
        res = await axiosInstance.post<
          TaskDTO,
          AxiosResponse<TaskDTO>,
          CreateTaskDTO
        >("/api/tasks", {
          name: formData.name,
          status: formData.status,
          description: formData.description || undefined,
          team_id: formData.team_id || undefined,
        });
      } else {
        if (formData.name !== oldTask?.name) {
          changes.name = {
            old_value: oldTask?.name ?? "",
            new_value: formData.name,
          };
        }

        if ((formData.description || null) !== oldTask?.description) {
          changes.description = {
            old_value: oldTask?.description ?? null,
            new_value: formData.description || null,
          };
        }

        if (formData.status !== oldTask?.status) {
          changes.status = {
            old_value: oldTask?.status ?? "not_started",
            new_value: formData.status,
          };
        }

        if ((formData.team_id || null) !== oldTask?.team?.id) {
          changes.team_id = {
            old_value: oldTask?.team?.id ?? null,
            new_value: formData.team_id || null,
          };
        }

        res = await axiosInstance.put<
          TaskDTO,
          AxiosResponse<TaskDTO>,
          UpdateTaskDTO
        >(`/api/tasks/${oldTask?.id}`, changes);
      }

      if (res.status === 200) {
        addToast("Successfully updated task", "success");
        setTasks((tasks) =>
          tasks.map((task) => {
            if (task.id !== oldTask?.id) {
              return task;
            }

            let team: UserDTO | null = null;
            if (formData.team_id !== "") {
              if (user?.role === "lead") {
                team =
                  teams.find((team) => team.id === formData.team_id) ?? null;
              } else {
                team = oldTask.team;
              }
            }

            return {
              id: res.data.id,
              name: res.data.name,
              description: res.data.description,
              status: res.data.status,
              created_at: res.data.created_at,
              updated_at: res.data.updated_at,
              team,
            };
          })
        );
        setIsModalOpen(false);
      } else if (res.status === 201) {
        addToast("Successfully created task", "success");
        setTasks((tasks) => {
          let team: UserDTO | null = null;
          if (formData.team_id !== "") {
            team = teams.find((team) => team.id === formData.team_id) ?? null;
          }

          return [
            ...tasks,
            {
              id: res.data.id,
              name: res.data.name,
              description: res.data.description,
              status: res.data.status,
              created_at: res.data.created_at,
              updated_at: res.data.updated_at,
              team,
            },
          ];
        });
        setIsModalOpen(false);
      } else if (res.status === 400) {
        addToast("Task name and status must not empty", "error");
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
      logger.error(error, `failed to ${type} task`);
      addToast("Something is wrong with the server, please try again", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "lead") {
      setIsLoading(true);
      (async () => {
        try {
          const res = await axiosInstance.get<UserDTO[]>("/api/teams");
          if (res.status === 200) {
            setTeams(res.data);
          } else if (res.status === 401) {
            addToast(
              "Session expired, you will be redirected to login page",
              "error"
            );
            setUser(null);
          } else if (res.status === 403) {
            addToast("Access denied due to insufficient permissions", "error");
          } else {
            throw new Error(`unhandled status code: ${res.status}`);
          }
        } catch (error) {
          logger.error(error, "failed to get teams");
          addToast(
            "Something is wrong with the server, please try again",
            "error"
          );
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [addToast, setUser, user?.role]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden"
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800 capitalize">
            {type === "create" ? "Create New Task" : "Update Task"}
          </h3>

          <button
            onClick={() => setIsModalOpen(false)}
            type="button"
            className="text-gray-400 hover:text-gray-600"
          >
            <Cross2Icon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Task Name <span className="text-red-500">*</span>
              </label>

              <input
                disabled={isLoading || user?.role === "team"}
                value={formData.name}
                onChange={handleInputChange}
                type="text"
                id="name"
                name="name"
                className={`${
                  user?.role === "team" ? "bg-gray-300" : ""
                } w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-gray-700`}
                placeholder="Enter task name"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Task Description
              </label>

              <textarea
                disabled={isLoading}
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                id="description"
                name="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                placeholder="Enter task description (optional)"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status <span className="text-red-500">*</span>
              </label>

              <select
                required
                disabled={isLoading}
                value={formData.status}
                onChange={handleInputChange}
                id="status"
                name="status"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-gray-700"
              >
                <option value="not_started">Not Started</option>
                <option value="on_progress">On Progress</option>
                <option value="done">Done</option>
                <option value="reject">Reject</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="team_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign to Team
              </label>

              <select
                disabled={isLoading || user?.role === "team"}
                value={formData.team_id}
                onChange={handleInputChange}
                id="team_id"
                name="team_id"
                className={`${
                  user?.role === "team" ? "bg-gray-300" : ""
                } w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700`}
              >
                {user?.role === "team" ? (
                  <option value={oldTask?.team?.id}>
                    {oldTask?.team?.name}
                  </option>
                ) : (
                  <option value="">Select a team (optional)</option>
                )}

                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>

            <button
              disabled={isButtonDisabled}
              type="submit"
              className={`${
                isButtonDisabled
                  ? "bg-blue-600/50"
                  : "bg-blue-600 hover:bg-blue-700"
              } px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {type === "create" ? "Create Task" : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { TaskModal };
