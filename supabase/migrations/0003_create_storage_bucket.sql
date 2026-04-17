-- Create storage bucket for material images
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

-- Allow public read access
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'materials');

-- Allow authenticated users to upload (service role always bypasses RLS)
create policy "Service role upload"
  on storage.objects for insert
  with check (bucket_id = 'materials');

create policy "Service role update"
  on storage.objects for update
  using (bucket_id = 'materials');

create policy "Service role delete"
  on storage.objects for delete
  using (bucket_id = 'materials');
