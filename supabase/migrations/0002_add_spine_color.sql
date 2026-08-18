alter table series
  add column spine_color text not null default '#78716c'
    check (spine_color ~ '^#[0-9a-fA-F]{6}$');
