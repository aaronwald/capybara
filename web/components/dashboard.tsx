"use client";

import {
  AlertCircle,
  BookOpenText,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Inbox,
  LayoutList,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api/client";
import type { Category, Prompt, Task, TaskStatus } from "@/lib/domain/model";

type View = "tasks" | "prompts";

const statusStyle: Record<TaskStatus, { label: string; className: string }> = {
  draft: { label: "Ready", className: "status-ready" },
  dispatched: { label: "Working", className: "status-working" },
  done: { label: "Done", className: "status-done" },
  failed: { label: "Needs attention", className: "status-failed" },
};

const defaultModel = "openai/gpt-5.6-sol";

export function Dashboard() {
  const [view, setView] = useState<View>("tasks");
  const [categories, setCategories] = useState<Category[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([]);
  const [model, setModel] = useState(defaultModel);
  const [category, setCategory] = useState("all");
  const [hideDone, setHideDone] = useState(true);
  const [query, setQuery] = useState("");
  const [taskEditor, setTaskEditor] = useState<Task | "new" | null>(null);
  const [promptEditor, setPromptEditor] = useState<Prompt | "new" | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [nextCategories, nextPrompts, nextTasks] = await Promise.all([
        api.categories.list(),
        api.prompts.list(),
        api.tasks.list(),
      ]);
      setCategories(nextCategories);
      setPrompts(nextPrompts);
      setTasks(nextTasks);
      setError(null);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not load Capybara.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.categories.list(), api.prompts.list(), api.tasks.list()])
      .then(([nextCategories, nextPrompts, nextTasks]) => {
        if (!active) return;
        setCategories(nextCategories);
        setPrompts(nextPrompts);
        setTasks(nextTasks);
        setError(null);
      })
      .catch((value: unknown) => {
        if (active) setError(value instanceof Error ? value.message : "Could not load Capybara.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    api.models()
      .then((nextModels) => { if (active) setModels(nextModels); })
      .catch(() => { if (active) setModels([{ id: defaultModel, name: defaultModel }]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!tasks.some((task) => task.status === "dispatched")) return;
    const timer = window.setInterval(() => void load(true), 2_000);
    return () => window.clearInterval(timer);
  }, [load, tasks]);

  const visibleTasks = useMemo(() => {
    const term = query.trim().toLowerCase();
    return tasks.filter((task) =>
      (category === "all" || task.categoryId === category) &&
      (!hideDone || task.status !== "done") &&
      (!term || `${task.title} ${task.description}`.toLowerCase().includes(term)),
    );
  }, [category, hideDone, query, tasks]);

  const workingCount = tasks.filter((task) => task.status === "dispatched").length;

  async function dispatch(task: Task) {
    setBusy(task.id);
    try {
      await api.tasks.dispatch(task.id, model);
      await load(true);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Dispatch failed.");
    } finally {
      setBusy(null);
    }
  }

  async function removeTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setBusy(task.id);
    try {
      await api.tasks.delete(task.id);
      await load(true);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={`nav-item ${view === "tasks" ? "nav-item-active" : ""}`} onClick={() => setView("tasks")} type="button">
            <LayoutList size={18} /> Tasks <span className="nav-count">{tasks.filter((task) => task.status !== "done").length}</span>
          </button>
          <button className={`nav-item ${view === "prompts" ? "nav-item-active" : ""}`} onClick={() => setView("prompts")} type="button">
            <BookOpenText size={18} /> Prompt library
          </button>
        </nav>
        <div className="sidebar-section">
          <p className="section-label">Views</p>
          <button className="view-item" type="button" onClick={() => { setView("tasks"); setCategory("all"); }}><Inbox size={16} /> Inbox</button>
          <button className="view-item" type="button" onClick={() => { setView("tasks"); setCategory("all"); setHideDone(false); }}><Sparkles size={16} /> All activity</button>
          <button className="view-item" type="button" onClick={() => setShowCategories(true)}><Plus size={16} /> Manage categories</button>
        </div>
        <div className="sidebar-bottom">
          <div className="agent-health">
            <span className="health-dot" />
            <div><strong>OpenRouter ready</strong><span>{model.replace("openai/", "")}</span></div>
          </div>
          <Settings2 size={18} className="sidebar-settings" />
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark" aria-hidden="true">C</div><span>capybara</span></div>
          <label className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={view === "tasks" ? "Search tasks" : "Search prompts"} />
          </label>
          <select className="model-select" aria-label="Dispatch model" value={model} onChange={(event) => setModel(event.target.value)}>
            {(models.length ? models : [{ id: defaultModel, name: defaultModel }]).map((item) => <option key={item.id} value={item.id}>{item.id.replace("openai/", "")}</option>)}
          </select>
        </header>

        <div className="content">
          {error && <div className="error-banner"><AlertCircle size={17} /><span>{error}</span><button onClick={() => setError(null)} aria-label="Dismiss error"><X size={16} /></button></div>}
          {view === "tasks" ? (
            <TasksView
              categories={categories}
              category={category}
              setCategory={setCategory}
              hideDone={hideDone}
              setHideDone={setHideDone}
              loading={loading}
              tasks={visibleTasks}
              totalTasks={tasks.length}
              workingCount={workingCount}
              busy={busy}
              onNew={() => setTaskEditor("new")}
              onEdit={setTaskEditor}
              onDispatch={dispatch}
              onDelete={removeTask}
            />
          ) : (
            <PromptsView
              prompts={prompts.filter((prompt) => !query || `${prompt.name} ${prompt.text}`.toLowerCase().includes(query.toLowerCase()))}
              loading={loading}
              onNew={() => setPromptEditor("new")}
              onEdit={setPromptEditor}
              onDelete={async (prompt) => {
                if (!window.confirm(`Delete “${prompt.name}”?`)) return;
                await api.prompts.delete(prompt.id);
                await load(true);
              }}
            />
          )}
        </div>
      </section>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button className={view === "tasks" ? "mobile-nav-active" : ""} onClick={() => setView("tasks")}><LayoutList size={20} /><span>Tasks</span></button>
        <button className={view === "prompts" ? "mobile-nav-active" : ""} onClick={() => setView("prompts")}><BookOpenText size={20} /><span>Prompts</span></button>
        <button className="mobile-new" onClick={() => setTaskEditor("new")}><Plus size={21} /><span>New</span></button>
        <button onClick={() => setShowCategories(true)}><Inbox size={20} /><span>Categories</span></button>
        <button onClick={() => void load()}><CircleDot size={20} /><span>Refresh</span></button>
      </nav>

      {taskEditor && (
        <TaskModal
          task={taskEditor === "new" ? null : taskEditor}
          categories={categories}
          prompts={prompts}
          onClose={() => setTaskEditor(null)}
          onSave={async (input) => {
            if (taskEditor === "new") await api.tasks.create(input);
            else await api.tasks.update(taskEditor.id, input);
            setTaskEditor(null);
            await load(true);
          }}
        />
      )}
      {promptEditor && (
        <PromptModal
          prompt={promptEditor === "new" ? null : promptEditor}
          onClose={() => setPromptEditor(null)}
          onSave={async (input) => {
            if (promptEditor === "new") await api.prompts.create(input);
            else await api.prompts.update(promptEditor.id, input);
            setPromptEditor(null);
            await load(true);
          }}
        />
      )}
      {showCategories && <CategoryModal categories={categories} onClose={() => setShowCategories(false)} onChanged={() => load(true)} />}
    </main>
  );
}

function Brand() {
  return <div className="brand"><div className="brand-mark" aria-hidden="true">C</div><div><div className="brand-name">capybara</div><div className="brand-subtitle">quietly get things done</div></div></div>;
}

interface TasksViewProps {
  categories: Category[];
  category: string;
  setCategory: (value: string) => void;
  hideDone: boolean;
  setHideDone: (value: boolean) => void;
  loading: boolean;
  tasks: Task[];
  totalTasks: number;
  workingCount: number;
  busy: string | null;
  onNew: () => void;
  onEdit: (task: Task) => void;
  onDispatch: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function TasksView(props: TasksViewProps) {
  return <>
    <div className="page-heading"><div><p className="eyebrow">Your agent workspace</p><h1>Today&apos;s focus</h1><p className="heading-copy">Choose what matters. Let an agent move it forward.</p></div><button className="primary-button" onClick={props.onNew}><Plus size={18} /> New task</button></div>
    <div className="focus-card"><div className="focus-icon"><Bot size={21} /></div><div className="focus-copy"><span className="focus-kicker">Agent lane</span><strong>{props.workingCount ? `${props.workingCount} ${props.workingCount === 1 ? "task is" : "tasks are"} moving` : "The agent lane is clear"}</strong><span>{props.workingCount ? "Work continues even when you close this page." : "Send a ready task when you want help."}</span></div>{props.workingCount > 0 && <div className="focus-progress"><span /></div>}</div>
    <div className="task-toolbar"><div className="category-tabs" role="group" aria-label="Task category"><button className={props.category === "all" ? "category-tab category-tab-active" : "category-tab"} onClick={() => props.setCategory("all")}>All tasks</button>{props.categories.map((item) => <button className={props.category === item.id ? "category-tab category-tab-active" : "category-tab"} key={item.id} onClick={() => props.setCategory(item.id)}>{item.name}</button>)}</div><button className={props.hideDone ? "filter-toggle filter-toggle-active" : "filter-toggle"} aria-pressed={props.hideDone} onClick={() => props.setHideDone(!props.hideDone)}><span className="filter-check">{props.hideDone && <Check size={12} />}</span>Hide done</button></div>
    <div className="task-list"><div className="list-heading"><span>{props.loading ? "Loading" : `${props.tasks.length} of ${props.totalTasks} tasks`}</span></div>
      {props.loading ? <LoadingCards /> : props.tasks.map((task) => <TaskCard key={task.id} task={task} category={props.categories.find((item) => item.id === task.categoryId)} busy={props.busy === task.id} onEdit={() => props.onEdit(task)} onDispatch={() => props.onDispatch(task)} onDelete={() => props.onDelete(task)} />)}
      {!props.loading && props.tasks.length === 0 && <div className="empty-state"><Check size={24} /><strong>Nothing waiting here</strong><span>Create a task or choose another category.</span></div>}
    </div>
  </>;
}

function TaskCard({ task, category, busy, onEdit, onDispatch, onDelete }: { task: Task; category?: Category; busy: boolean; onEdit: () => void; onDispatch: () => void; onDelete: () => void }) {
  const status = statusStyle[task.status];
  return <article className="task-card">
    <div className={`task-state ${task.status === "done" ? "task-state-checked" : ""}`}>{task.status === "done" && <Check size={15} />}{task.status === "dispatched" && <span className="working-pulse" />}</div>
    <div className="task-body"><div className="task-title-row"><h2>{task.title}</h2><span className={`status-chip ${status.className}`}>{status.label}</span></div>{task.description && <p>{task.description}</p>}{task.resultText && <div className="task-result">{task.resultText}</div>}{task.error && <div className="task-error"><AlertCircle size={13} />{task.error}</div>}<div className="task-meta"><span className="category-dot" /><span>{category?.name ?? "Unknown"}</span>{task.dueDate && <><span className="meta-separator" /><CalendarDays size={14} /><span>{formatDate(task.dueDate)}</span></>}</div></div>
    <div className="task-actions"><button onClick={onEdit} aria-label={`Edit ${task.title}`}><Pencil size={16} /></button>{task.status !== "dispatched" && <button className="dispatch-button" onClick={onDispatch} disabled={busy} aria-label={`Dispatch ${task.title}`}>{busy ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}</button>}<button onClick={onDelete} aria-label={`Delete ${task.title}`}><Trash2 size={16} /></button><ChevronRight className="task-chevron" size={18} /></div>
  </article>;
}

function PromptsView({ prompts, loading, onNew, onEdit, onDelete }: { prompts: Prompt[]; loading: boolean; onNew: () => void; onEdit: (prompt: Prompt) => void; onDelete: (prompt: Prompt) => void }) {
  return <><div className="page-heading"><div><p className="eyebrow">Reusable instructions</p><h1>Prompt library</h1><p className="heading-copy">Keep your best ways of asking close at hand.</p></div><button className="primary-button" onClick={onNew}><Plus size={18} /> New prompt</button></div><div className="prompt-grid">{loading ? <LoadingCards /> : prompts.map((prompt) => <article className="prompt-card" key={prompt.id}><div className="prompt-icon"><BookOpenText size={18} /></div><h2>{prompt.name}</h2><p>{prompt.text}</p><div className="prompt-actions"><button onClick={() => onEdit(prompt)}><Pencil size={15} /> Edit</button><button onClick={() => onDelete(prompt)}><Trash2 size={15} /> Delete</button></div></article>)}{!loading && !prompts.length && <div className="empty-state prompt-empty"><BookOpenText size={24} /><strong>No saved prompts</strong><span>Add one to reuse it on future tasks.</span></div>}</div></>;
}

function TaskModal({ task, categories, prompts, onClose, onSave }: { task: Task | null; categories: Category[]; prompts: Prompt[]; onClose: () => void; onSave: (input: Omit<Task, "id" | "status" | "resultText" | "error">) => Promise<void> }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [categoryId, setCategoryId] = useState(task?.categoryId ?? categories[0]?.id ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [prompt, setPrompt] = useState(task?.prompt ?? "Research this task and respond with any follow ups for investigation.");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); try { await onSave({ title, description, categoryId, dueDate: dueDate || null, prompt: prompt || null }); } catch (value) { setError(value instanceof Error ? value.message : "Could not save task."); setSaving(false); } }
  return <Modal title={task ? "Edit task" : "New task"} subtitle="Give the agent a clear outcome." onClose={onClose}><form className="editor-form" onSubmit={submit}>{error && <div className="form-error">{error}</div>}<label>Title<input autoFocus required maxLength={240} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to happen?" /></label><label>Description<textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add context, constraints, or a definition of done." /></label><div className="form-row"><label>Category<select aria-label="Category" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="" disabled>Choose category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Due date<input type="date" value={dueDate ?? ""} onChange={(event) => setDueDate(event.target.value)} /></label></div>{prompts.length > 0 && <label>Use a saved prompt<select value="" onChange={(event) => setPrompt(prompts.find((item) => item.id === event.target.value)?.text ?? prompt)}><option value="">Choose a prompt</option>{prompts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}<label>Agent prompt<textarea rows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={saving || !categoryId}>{saving && <LoaderCircle className="spin" size={16} />}{task ? "Save changes" : "Create task"}</button></div></form></Modal>;
}

function PromptModal({ prompt, onClose, onSave }: { prompt: Prompt | null; onClose: () => void; onSave: (input: Pick<Prompt, "name" | "text">) => Promise<void> }) {
  const [name, setName] = useState(prompt?.name ?? ""); const [text, setText] = useState(prompt?.text ?? ""); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); try { await onSave({ name, text }); } catch (value) { setError(value instanceof Error ? value.message : "Could not save prompt."); setSaving(false); } }
  return <Modal title={prompt ? "Edit prompt" : "New prompt"} subtitle="Save instructions that work well." onClose={onClose}><form className="editor-form" onSubmit={submit}>{error && <div className="form-error">{error}</div>}<label>Name<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Research brief" /></label><label>Instructions<textarea required rows={8} value={text} onChange={(event) => setText(event.target.value)} placeholder="Research this task and…" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving && <LoaderCircle className="spin" size={16} />}Save prompt</button></div></form></Modal>;
}

function CategoryModal({ categories, onClose, onChanged }: { categories: Category[]; onClose: () => void; onChanged: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function add(event: FormEvent) { event.preventDefault(); try { await api.categories.create(name); setName(""); await onChanged(); } catch (value) { setError(value instanceof Error ? value.message : "Could not add category."); } }
  return <Modal title="Categories" subtitle="Deleting a category also deletes its tasks." onClose={onClose}><form className="category-add" onSubmit={add}><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="New category" /><button className="primary-button" type="submit"><Plus size={16} />Add</button></form>{error && <div className="form-error">{error}</div>}<div className="category-list">{categories.map((item) => <CategoryRow category={item} key={item.id} onChanged={onChanged} onError={setError} />)}</div></Modal>;
}

function CategoryRow({ category, onChanged, onError }: { category: Category; onChanged: () => Promise<void>; onError: (message: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  async function rename(event: FormEvent) {
    event.preventDefault();
    try { await api.categories.update(category.id, name); setEditing(false); await onChanged(); }
    catch (value) { onError(value instanceof Error ? value.message : "Could not rename category."); }
  }
  if (editing) return <form className="category-row category-rename" onSubmit={rename}><input autoFocus required value={name} onChange={(event) => setName(event.target.value)} /><button type="submit" aria-label={`Save ${category.name}`}><Check size={15} /></button><button type="button" aria-label="Cancel rename" onClick={() => { setName(category.name); setEditing(false); }}><X size={15} /></button></form>;
  return <div className="category-row"><span className="category-dot" /><span>{category.name}</span><button aria-label={`Rename ${category.name}`} onClick={() => setEditing(true)}><Pencil size={15} /></button><button aria-label={`Delete ${category.name}`} onClick={async () => { if (!window.confirm(`Delete “${category.name}” and all of its tasks?`)) return; try { await api.categories.delete(category.id); await onChanged(); } catch (value) { onError(value instanceof Error ? value.message : "Could not delete category."); } }}><Trash2 size={15} /></button></div>;
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button onClick={onClose} aria-label="Close"><X size={19} /></button></div>{children}</section></div>;
}

function LoadingCards() { return <div className="loading-stack"><div /><div /><div /></div>; }
function formatDate(value: string) { const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date); }
