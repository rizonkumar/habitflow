"use client";

import { useState } from "react";
import type { BoardTask, ProjectMember } from "../../types/api";
import { X, Trash2, Calendar, Flag, User } from "lucide-react";
import { useToastStore } from "../ui/Toast";

type TaskModalProps = {
  task: BoardTask;
  members: ProjectMember[];
  canEdit: boolean;
  onSave: (data: {
    title: string;
    description: string;
    assigneeId?: string;
    priority: BoardTask["priority"];
    dueDate?: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
};

const priorityOptions: {
  value: BoardTask["priority"];
  label: string;
  color: string;
}[] = [
  { value: "low", label: "Low", color: "text-(--success)" },
  { value: "medium", label: "Medium", color: "text-(--warning)" },
  { value: "high", label: "High", color: "text-(--destructive)" },
];

export function TaskModal({
  task,
  members,
  canEdit,
  onSave,
  onDelete,
  onClose,
}: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "");
  const [priority, setPriority] = useState<BoardTask["priority"]>(
    task.priority
  );
  const [dueDate, setDueDate] = useState(task.dueDate?.split("T")[0] || "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const assignee = members.find((m) => m.userId === assigneeId);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      onClose();
    } catch {
      useToastStore
        .getState()
        .push({ message: "Failed to save task", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch {
      useToastStore
        .getState()
        .push({ message: "Failed to delete task", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-(--border) bg-(--card) shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <h2 className="text-lg font-semibold text-(--foreground)">
            {canEdit ? "Edit Task" : "Task Details"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-(--foreground) mb-1">
              Title
            </label>
            {canEdit ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring)"
                placeholder="Task title"
              />
            ) : (
              <p className="text-sm text-(--foreground)">{title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-(--foreground) mb-1">
              Description
            </label>
            {canEdit ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring) resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-(--muted)">
                {description || "No description"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-(--foreground) mb-1">
              <User size={14} className="inline mr-1" />
              Assignee
            </label>
            {canEdit ? (
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring)"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                {assignee ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-(--primary)/10 flex items-center justify-center text-(--primary) text-xs font-medium">
                      {assignee.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-(--foreground)">
                      {assignee.name}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-(--muted)">Unassigned</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-(--foreground) mb-1">
                <Flag size={14} className="inline mr-1" />
                Priority
              </label>
              {canEdit ? (
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as BoardTask["priority"])
                  }
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring)"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`text-sm ${
                    priorityOptions.find((p) => p.value === priority)?.color
                  }`}
                >
                  {priorityOptions.find((p) => p.value === priority)?.label}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-(--foreground) mb-1">
                <Calendar size={14} className="inline mr-1" />
                Due Date
              </label>
              {canEdit ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring)"
                />
              ) : (
                <span className="text-sm text-(--muted)">
                  {dueDate
                    ? new Date(dueDate).toLocaleDateString()
                    : "No due date"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-(--border)">
          {canEdit ? (
            <>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-(--muted)">Delete task?</span>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-(--destructive) text-(--destructive-foreground) text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg border border-(--border) text-xs font-medium text-(--foreground) hover:bg-(--card-hover)"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-(--muted) hover:text-(--destructive) hover:bg-(--destructive)/10 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--card-hover) transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim()}
                  className="px-4 py-2 rounded-lg bg-(--primary) text-sm font-medium text-(--primary-foreground) hover:bg-(--primary-hover) transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--card-hover) transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
