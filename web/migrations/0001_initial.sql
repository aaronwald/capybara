CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE task_status AS ENUM ('draft', 'dispatched', 'done', 'failed');
CREATE TYPE job_status AS ENUM ('pending', 'running', 'done', 'failed');

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  due_date date,
  prompt text,
  status task_status NOT NULL DEFAULT 'draft',
  result_text text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_category_id_idx ON tasks(category_id);

CREATE TABLE dispatch_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  target text NOT NULL DEFAULT 'openroute',
  model text NOT NULL,
  status job_status NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);
CREATE INDEX dispatch_jobs_status_created_idx ON dispatch_jobs(status, created_at);
CREATE UNIQUE INDEX dispatch_jobs_one_active_per_task_idx
  ON dispatch_jobs(task_id) WHERE status IN ('pending', 'running');

INSERT INTO categories (name) VALUES ('General');
