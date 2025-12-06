export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              HabitFlow
            </p>
            <h1 className="text-3xl font-semibold leading-tight">
              One place for your todos, boards, and habits.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="cursor-pointer rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="cursor-pointer rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Get started
            </a>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Todos</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Capture tasks, set due dates, and keep today and upcoming views
              tidy.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Boards</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Track work across Todo, Pending, and Completed with a clean
              kanban.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Habits</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Log water, gym, and sleep, then watch your streak stay alive.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
