"use client";

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Welcome</h2>
        <p className="mt-2 text-sm text-zinc-600">
          This is your workspace. Switch between Todos, Board, and Health as features come online.
        </p>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Next steps</h2>
        <ul className="mt-2 space-y-2 text-sm text-zinc-600">
          <li>• Add your first project</li>
          <li>• Create todos and board tasks</li>
          <li>• Track water, gym, and sleep</li>
        </ul>
      </div>
    </div>
  );
}

