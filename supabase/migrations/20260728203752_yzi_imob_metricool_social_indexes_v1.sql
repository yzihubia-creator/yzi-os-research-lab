begin;

create index yzi_imob_social_publications_connection_idx
  on public.yzi_imob_social_publications (connection_id, tenant_id, provider);

create index yzi_imob_social_publications_revision_idx
  on public.yzi_imob_social_publications (publication_revision_id, tenant_id, property_id);

create index yzi_imob_social_publications_created_by_idx
  on public.yzi_imob_social_publications (created_by_user_id);

create index yzi_imob_social_publication_jobs_publication_idx
  on public.yzi_imob_social_publication_jobs (social_publication_id, tenant_id);

create index yzi_imob_social_metrics_publication_idx
  on public.yzi_imob_social_metrics (social_publication_id, tenant_id)
  where social_publication_id is not null;

create index yzi_imob_social_publication_events_publication_idx
  on public.yzi_imob_social_publication_events (social_publication_id, tenant_id, created_at desc);

create index yzi_imob_social_publication_events_job_idx
  on public.yzi_imob_social_publication_events (job_id)
  where job_id is not null;

create index yzi_imob_social_publication_events_actor_idx
  on public.yzi_imob_social_publication_events (actor_user_id)
  where actor_user_id is not null;

commit;
