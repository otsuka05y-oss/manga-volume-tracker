alter table series
  add column title_font text not null default 'sans'
    check (title_font in ('sans', 'serif', 'brush', 'dot'));
