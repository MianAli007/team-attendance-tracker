-- Create employees table
create table employees (
  id text primary key,
  name text not null,
  email text not null,
  department text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create time_logs table
create table time_logs (
  id text primary key,
  employee_id text not null references employees(id) on delete cascade,
  employee_name text not null,
  type text not null,
  timestamp text not null,
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table employees enable row level security;
alter table time_logs enable row level security;

-- Create policies to allow public access (since we are mimicking the previous localStorage behavior which was open)
-- In a real production app with auth, you would restrict this.
create policy "Allow public access to employees"
  on employees for all
  using (true)
  with check (true);

create policy "Allow public access to time_logs"
  on time_logs for all
  using (true)
  with check (true);
