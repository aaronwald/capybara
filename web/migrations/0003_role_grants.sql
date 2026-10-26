DO $$
BEGIN
  EXECUTE format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database());

  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'capybara_app') THEN
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO capybara_app', current_database());
    EXECUTE 'GRANT USAGE ON SCHEMA public TO capybara_app';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO capybara_app';
    EXECUTE 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO capybara_app';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO capybara_app';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO capybara_app';
  END IF;

  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'capybara_backup') THEN
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO capybara_backup', current_database());
  END IF;
END
$$;
