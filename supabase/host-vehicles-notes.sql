-- Aggiunge note interne private (visibili solo all'owner via RLS gi`a esistente).
-- Esegui DOPO host-vehicles-schema.sql.

alter table cars add column if not exists internal_notes text;
