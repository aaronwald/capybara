ALTER TABLE dispatch_jobs
  ADD COLUMN next_attempt_at timestamptz NOT NULL DEFAULT now();

DROP INDEX dispatch_jobs_status_created_idx;
CREATE INDEX dispatch_jobs_status_next_attempt_idx
  ON dispatch_jobs(status, next_attempt_at, created_at);
