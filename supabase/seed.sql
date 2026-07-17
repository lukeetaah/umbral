insert into public.feature_flags(key,enabled,description) values ('chocolate_pathway',false,'Future food-consent pathway; never enable in the public MVP') on conflict(key) do update set enabled=false;
insert into public.consent_documents(kind,version,locale,body_hash,body,published_at) values
('terms','0.1','es','seed-terms-es','Acepto los términos de uso experimental y no clínico.',now()),
('privacy','0.1','es','seed-privacy-es','Comprendo qué datos se guardan y cómo eliminarlos.',now()),
('experimental','0.1','es','seed-experiment-es','Acepto participar en una sesión audible, detenerme libremente y reportar malestar.',now()),
('aggregate-research','0.1','es','seed-aggregate-es','Elijo por separado si contribuir datos seudónimos a análisis agregados.',now()),
('free-text','0.1','es','seed-text-es','Elijo por separado si contribuir texto libre.',now()),
('food','0.1','es','seed-food-es','Desactivado en el MVP; requiere consentimiento alimentario específico.',null())
on conflict(kind,version,locale) do nothing;
