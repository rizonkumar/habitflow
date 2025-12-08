"use client";

import { useState } from "react";
import type { BoardTask, ProjectMember } from "../../types/api";
import {
  X,
  Trash2,
  Calendar,
  Flag,
  User,
  AlertCircle,
  Sparkles,
} from "lucide-react";
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
  bgColor: string;
  dotColor: string;
}[] = [
  {
    value: "low",
    label: "Low",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    dotColor: "bg-emerald-500",
  },
  {
    value: "medium",
    label: "Medium",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    dotColor: "bg-amber-500",
  },
  {
    value: "high",
    label: "High",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    dotColor: "bg-red-500",
  },
];

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

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
  const currentPriorityConfig = priorityOptions.find(
    (p) => p.value === priority
  );

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-(--border) bg-(--card) shadow-2xl animate-in overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-(--border) bg-gradient-to-r from-(--primary)/5 to-(--accent)/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-(--primary)/20 to-(--accent)/20 text-(--primary)">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-(--foreground)">
                {canEdit ? "Edit Task" : "Task Details"}
              </h2>
              <p className="text-xs text-(--muted)">
                {canEdit ? "Update your task details" : "View task information"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-(--foreground) mb-2">
              Title
            </label>
            {canEdit ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-3 text-sm text-(--foreground) outline-none focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20 transition-all"
                placeholder="Task title"
              />
            ) : (
              <p className="text-sm text-(--foreground) p-3 rounded-xl bg-(--secondary)">
                {title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-(--foreground) mb-2">
              Description
            </label>
            {canEdit ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-3 text-sm text-(--foreground) outline-none focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20 resize-none transition-all"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-(--muted) p-3 rounded-xl bg-(--secondary)">
                {description || "No description"}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-(--foreground) mb-2">
              <User size={14} className="text-(--muted)" />
              Assignee
            </label>
            {canEdit ? (
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-3 text-sm text-(--foreground) outline-none focus:border-(--ring) cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-(--secondary)">
                {assignee ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-(--primary)/20 to-(--accent)/10 flex items-center justify-center text-(--primary) text-xs font-semibold">
                      {getInitials(assignee.name)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-(--foreground) mb-2">
                <Flag size={14} className="text-(--muted)" />
                Priority
              </label>
              {canEdit ? (
                <div className="flex gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPriority(opt.value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                        priority === opt.value
                          ? `${opt.bgColor} ${opt.color} border-current`
                          : "border-(--border) text-(--muted) hover:border-(--muted)"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${opt.dotColor}`}
                      ></span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span
                  className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${currentPriorityConfig?.bgColor} ${currentPriorityConfig?.color}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${currentPriorityConfig?.dotColor}`}
                  ></span>
                  {currentPriorityConfig?.label}
                </span>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-(--foreground) mb-2">
                <Calendar size={14} className="text-(--muted)" />
                Due Date
              </label>
              {canEdit ? (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--ring) cursor-pointer"
                />
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-(--muted) px-3 py-2 rounded-xl bg-(--secondary)">
                  <Calendar size={14} />
                  {dueDate
                    ? new Date(dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No due date"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 border-t border-(--border) bg-(--secondary)/30">
          {canEdit ? (
            <>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-(--destructive)/10 border border-(--destructive)/20">
                  <AlertCircle size={16} className="text-(--destructive)" />
                  <span className="text-sm text-(--destructive)">
                    Delete this task?
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg bg-(--destructive) text-(--destructive-foreground) text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-lg border border-(--border) text-xs font-medium text-(--foreground) hover:bg-(--card-hover) transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-(--muted) hover:text-(--destructive) hover:bg-(--destructive)/10 transition-all"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--card-hover) transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-(--primary) to-blue-600 text-sm font-semibold text-(--primary-foreground) shadow-lg shadow-(--primary)/25 hover:shadow-xl hover:shadow-(--primary)/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--card-hover) transition-colors"
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
