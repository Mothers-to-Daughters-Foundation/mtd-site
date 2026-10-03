-- Performance: wrap auth.uid()/get_user_role() in (select ...) within RLS
-- policies so they are evaluated once per query instead of once per row
-- (Supabase advisor: auth_rls_initplan). Access logic is unchanged.
-- Generated from live policy definitions; applied via the Management API.

begin;
alter policy "Admins manage audit logs" on public.audit_logs using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Admins view audit logs" on public.audit_logs using (((select get_user_role()) = 'admin'::text));
alter policy "Authenticated users create audit logs" on public.audit_logs with check (((user_id = (select auth.uid())) OR ((select get_user_role()) = 'admin'::text)));
alter policy "conversation_members_select_own" on public.conversation_members using ((user_id = (select auth.uid())));
alter policy "Admins manage conversations" on public.conversations using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Participants create conversations" on public.conversations with check ((EXISTS ( SELECT 1
   FROM mentorships m
  WHERE ((m.id = conversations.mentorship_id) AND ((m.mentor_id = (select auth.uid())) OR (m.mentee_id = (select auth.uid())))))));
alter policy "Participants view conversations" on public.conversations using ((EXISTS ( SELECT 1
   FROM mentorships m
  WHERE ((m.id = conversations.mentorship_id) AND ((m.mentor_id = (select auth.uid())) OR (m.mentee_id = (select auth.uid())))))));
alter policy "Admins manage mentor requests" on public.mentor_requests using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Users can create mentor request" on public.mentor_requests with check (((select auth.uid()) = user_id));
alter policy "Users can update pending mentor request" on public.mentor_requests using ((((select auth.uid()) = user_id) AND (status = 'pending'::mentor_request_status))) with check (((select auth.uid()) = user_id));
alter policy "Users can view own mentor requests" on public.mentor_requests using (((select auth.uid()) = user_id));
alter policy "Admins manage mentorship requests" on public.mentorship_requests using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Mentees create mentorship requests" on public.mentorship_requests with check (((select auth.uid()) = mentee_id));
alter policy "Mentees view own requests" on public.mentorship_requests using (((select auth.uid()) = mentee_id));
alter policy "Mentors respond to requests" on public.mentorship_requests using (((select auth.uid()) = mentor_id)) with check (((select auth.uid()) = mentor_id));
alter policy "Mentors view incoming requests" on public.mentorship_requests using (((select auth.uid()) = mentor_id));
alter policy "Admins manage mentorships" on public.mentorships using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Mentees view own mentorships" on public.mentorships using (((select auth.uid()) = mentee_id));
alter policy "Mentors update mentorships" on public.mentorships using (((select auth.uid()) = mentor_id)) with check (((select auth.uid()) = mentor_id));
alter policy "Mentors view own mentorships" on public.mentorships using (((select auth.uid()) = mentor_id));
alter policy "messages_insert_member" on public.messages with check (((sender_id = (select auth.uid())) AND is_conversation_member(conversation_id)));
alter policy "Admins manage notifications" on public.notifications using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Users create legitimate notifications" on public.notifications with check ((((select auth.uid()) = user_id) OR ((select get_user_role()) = 'admin'::text) OR (((select get_user_role()) = 'mentor'::text) AND (EXISTS ( SELECT 1
   FROM mentorships m
  WHERE ((m.mentor_id = (select auth.uid())) AND (m.mentee_id = notifications.user_id) AND (m.status = 'active'::mentorship_status)))))));
alter policy "Users delete own notifications" on public.notifications using (((select auth.uid()) = user_id));
alter policy "Users update own notifications" on public.notifications using (((select auth.uid()) = user_id)) with check (((select auth.uid()) = user_id));
alter policy "Users view own notifications" on public.notifications using (((select auth.uid()) = user_id));
alter policy "Users can create own payments" on public.payments with check (((select auth.uid()) = user_id));
alter policy "Users can view own payments" on public.payments using (((select auth.uid()) = user_id));
alter policy "Admins manage resources" on public.resources using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Mentees view mentee resources" on public.resources using (((visibility = 'mentee_only'::resource_visibility) AND ((select get_user_role()) = 'mentee'::text)));
alter policy "Mentors view mentor resources" on public.resources using (((visibility = 'mentor_only'::resource_visibility) AND ((select get_user_role()) = 'mentor'::text)));
alter policy "Owners manage resources" on public.resources using ((uploaded_by = (select auth.uid()))) with check ((uploaded_by = (select auth.uid())));
alter policy "Admins manage session feedback" on public.session_feedback using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Participants view shared feedback" on public.session_feedback using (((is_private = false) AND (EXISTS ( SELECT 1
   FROM sessions s
  WHERE ((s.id = session_feedback.session_id) AND ((s.mentor_id = (select auth.uid())) OR (s.mentee_id = (select auth.uid()))))))));
alter policy "Users create own feedback" on public.session_feedback with check ((submitted_by = (select auth.uid())));
alter policy "Users update own feedback" on public.session_feedback using ((submitted_by = (select auth.uid()))) with check ((submitted_by = (select auth.uid())));
alter policy "Users view own feedback" on public.session_feedback using ((submitted_by = (select auth.uid())));
alter policy "Admins manage sessions" on public.sessions using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Mentees update sessions" on public.sessions using (((select auth.uid()) = mentee_id)) with check (((select auth.uid()) = mentee_id));
alter policy "Mentees view own sessions" on public.sessions using (((select auth.uid()) = mentee_id));
alter policy "Mentors can create sessions for active mentees" on public.sessions with check ((((select auth.uid()) = mentor_id) AND (EXISTS ( SELECT 1
   FROM mentorships m
  WHERE ((m.id = sessions.mentorship_id) AND (m.mentor_id = (select auth.uid())) AND (m.mentee_id = sessions.mentee_id) AND (m.status = 'active'::mentorship_status))))));
alter policy "Mentors update sessions" on public.sessions using (((select auth.uid()) = mentor_id)) with check (((select auth.uid()) = mentor_id));
alter policy "Mentors view own sessions" on public.sessions using (((select auth.uid()) = mentor_id));
alter policy "Users can create own subscription" on public.subscriptions with check (((select auth.uid()) = user_id));
alter policy "Users can delete own subscription" on public.subscriptions using (((select auth.uid()) = user_id));
alter policy "Users can update own subscription" on public.subscriptions using (((select auth.uid()) = user_id)) with check (((select auth.uid()) = user_id));
alter policy "Users can view own subscription" on public.subscriptions using (((select auth.uid()) = user_id));
alter policy "Admin can manage everyone" on public.user_profiles using (((select get_user_role()) = 'admin'::text)) with check (((select get_user_role()) = 'admin'::text));
alter policy "Mentors can view active mentee profiles" on public.user_profiles using ((EXISTS ( SELECT 1
   FROM mentorships m
  WHERE ((m.mentor_id = (select auth.uid())) AND (m.mentee_id = user_profiles.id) AND (m.status = 'active'::mentorship_status)))));
alter policy "Users can insert only themselves" on public.user_profiles with check (((select auth.uid()) = id));
alter policy "Users can update own profile" on public.user_profiles using (((select auth.uid()) = id)) with check (((select auth.uid()) = id));
alter policy "Users can view their own profile" on public.user_profiles using (((select auth.uid()) = id));
alter policy "user_reads_own_profile" on public.user_profiles using (((select auth.uid()) = id));
alter policy "user_updates_own_profile" on public.user_profiles using (((select auth.uid()) = id)) with check (((select auth.uid()) = id));
commit;
