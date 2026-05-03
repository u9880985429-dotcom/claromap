-- Erweitert label_position um neue Positionen für Knoten-Labels.
-- Bisher: 'inside' (Default, im Knoten zentriert) | 'outside' (über dem Knoten)
-- Neu:    'top-banner' = kleines Header-Band oben innerhalb des Knotens.
--         'above' = Alias für 'outside' (klarer Name)
--
-- Backward kompatibel: alte Werte ('inside', 'outside') bleiben gültig und
-- werden im UI gleich behandelt wie ('center', 'above').
ALTER TABLE public.nodes
  DROP CONSTRAINT IF EXISTS nodes_label_position_check;

ALTER TABLE public.nodes
  ADD CONSTRAINT nodes_label_position_check
  CHECK (
    label_position = ANY (
      ARRAY['inside', 'outside', 'center', 'top-banner', 'above']
    )
  );
