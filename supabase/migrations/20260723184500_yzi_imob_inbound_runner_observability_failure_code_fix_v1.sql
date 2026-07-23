begin;

alter table public.yzi_imob_inbound_runner_executions
  drop constraint if exists yzi_imob_inbound_runner_executions_failure_code_check;

alter table public.yzi_imob_inbound_runner_executions
  add constraint yzi_imob_inbound_runner_executions_failure_code_check
    check (
      failure_code is null
      or failure_code = any (array[
        'message_not_found',
        'conversation_not_found',
        'identity_mismatch',
        'invalid_message_contract',
        'intent_classification_failed',
        'workflow_selection_failed',
        'outbound_dispatch_failed',
        'completion_failed',
        'processing_abandoned'
      ]::text[])
    );

comment on column public.yzi_imob_inbound_runner_executions.failure_code is
  'Controlled runner observability failure vocabulary, including processing_abandoned emitted by governed timeout recovery.';

commit;
