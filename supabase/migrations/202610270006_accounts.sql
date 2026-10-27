begin;
alter table public.profiles add column revoked_before bigint not null default 0;
create function public.update_student(p_student uuid,p_teacher uuid,p_class uuid,p_name text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.classes where id=p_class and teacher_id=p_teacher and archived_at is null) then raise exception 'class not owned';end if;
 update public.student_accounts set class_id=p_class,data=jsonb_set(data,'{name}',to_jsonb(p_name)) where user_id=p_student and teacher_id=p_teacher;
 if not found then raise exception 'student not owned';end if;
 update public.profiles set name=p_name where user_id=p_student;
 insert into public.audit_events(actor_id,action,target_id)values(p_teacher,'update_student',p_student);
end $$;
revoke all on function public.update_student(uuid,uuid,uuid,text) from public,anon,authenticated;grant execute on function public.update_student(uuid,uuid,uuid,text) to service_role;
commit;
