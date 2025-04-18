import { useAuth } from "@contexts/AuthProvider";
import { useToast } from "@contexts/ToastProvider";
import type { AuditLog, TaskDTO } from "@dto/task";
import type { UserDTO } from "@dto/user";
import { axiosInstance } from "@libs/axios";
import { logger } from "@libs/pino";
import { Cross2Icon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { useOnClickOutside } from "usehooks-ts";

interface TaskDetailModalProps {
  task: TaskDTO & { team: UserDTO | null };
  statusColors: string;
  setIsDetailModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsEditModalOpen: Dispatch<SetStateAction<boolean>>;
}

function TaskDetailModal({
  task,
  statusColors,
  setIsDetailModalOpen,
  setIsEditModalOpen,
}: TaskDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  useOnClickOutside(modalRef as RefObject<HTMLElement>, () =>
    setIsDetailModalOpen(false)
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get<
          TaskDTO & { audit_logs: AuditLog[] }
        >(`/api/tasks/${task.id}`);

        if (res.status === 200) {
          setAuditLogs(res.data.audit_logs);
        } else if (res.status === 401) {
          addToast(
            "Session expired, you will be redirected to login page",
            "error"
          );
          setUser(null);
        } else if (res.status === 404) {
          logger.error("unexpected not found status code");
        } else {
          throw new Error(`unhandled status code: ${res.status}`);
        }
      } catch (error) {
        logger.error(error, "failed to get task");
        addToast(
          "Something is wrong with the server, please try again",
          "error"
        );
      }
    })();
  }, [addToast, setUser, task.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold leading-none text-gray-800">
            Task Details
          </h3>

          <button
            onClick={() => setIsDetailModalOpen(false)}
            type="button"
            className="text-gray-400 hover:text-gray-600"
          >
            <Cross2Icon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex justify-between items-start gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{task.name}</h2>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize shrink-0 ${statusColors}`}
              >
                {task.status.split("_").join(" ")}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-4">
              <p
                className={
                  task.description ? "text-gray-600" : "text-gray-400 italic"
                }
              >
                {task.description ?? "No Description"}
              </p>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created at {format(task.created_at, "MMM d, yyyy")}
                </div>

                {user?.role === "lead" ? (
                  <div className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {task.team ? `${task.team.name}'s Team` : "Unassigned"}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Audit Logs
            </h3>

            {auditLogs.length > 0 ? (
              <div className="space-y-4">
                {auditLogs.map((log, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            log.action === "create"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        ></span>

                        <span className="font-semibold capitalize text-gray-700">
                          {log.action}
                        </span>
                      </div>

                      <span className="text-sm text-gray-500">
                        {format(log.created_at, "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      By <span className="font-medium">{log.user.name}</span>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Changes:
                      </h4>

                      <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                          {JSON.stringify(JSON.parse(log.changes), null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No audit logs available.</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => setIsDetailModalOpen(false)}
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>

          <button
            onClick={() => {
              setIsDetailModalOpen(false);
              setIsEditModalOpen(true);
            }}
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
}

export { TaskDetailModal };
