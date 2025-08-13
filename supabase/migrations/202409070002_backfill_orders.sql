-- Copy products -> items if items is missing
update orders
set checkout_snapshot = jsonb_set(
  coalesce(checkout_snapshot, '{}'::jsonb),
  '{items}',
  checkout_snapshot->'products',
  true
)
where checkout_snapshot ? 'products'
  and (not (checkout_snapshot ? 'items') or jsonb_typeof(checkout_snapshot->'items') <> 'array');

-- If the snapshot looks like a flat address blob, wrap it under shipping_address while preserving snapshot
update orders
set checkout_snapshot = coalesce(checkout_snapshot, '{}'::jsonb) || jsonb_build_object(
  'shipping_address', checkout_snapshot
)
where checkout_snapshot ? 'city'
  and not (checkout_snapshot ? 'shipping_address');
