-- Removes the columns/table used only by the new-release notification
-- feature (Rakuten lookup + Web Push + Cron), which has been removed from
-- the app. Optional cleanup — run whenever you're ready.

alter table series
  drop column if exists next_volume_number,
  drop column if exists next_volume_release_date,
  drop column if exists next_volume_isbn,
  drop column if exists release_date_source,
  drop column if exists release_date_checked_at,
  drop column if exists notified_for_volume,
  drop column if exists notified_at;

drop table if exists push_subscriptions;
