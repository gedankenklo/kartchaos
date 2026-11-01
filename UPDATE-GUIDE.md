# v1.32.2 — Glacier bridge underpasses and flicker fix

Upload these contents into your existing GitHub repository root, merging folders. Keep existing MP3 files. Update client and server together and let Render rebuild.

Glacier's raised terraces and central deck now use thin slabs with clear ice lanes beneath them. Elevated connecting ramps are closed sloping slabs rather than solid terrain wedges. Driving, projectile collision and camera clearance distinguish the upper deck from the ground underneath. Bot navigation includes the lower corridors. The summit remains a solid ice structure.

Corrected descending-ramp geometry and striped self-shadow artifacts on ramp sides and bridge undersides. Upper surfaces still receive shadows; kart self-shadows are retained. Both art styles are supported.

Validation: production build; all 211 automated tests, including driving below both connecting bridges and the central deck, upper deck support, projectile collision queries and ramp geometry. Glacier navigation runs at 50cc, 100cc and 150cc completed with no falls or persistent stalls. Both art styles checked in the browser.

All previous updates are included. Music folder names are unchanged. No MP3s or music manifest are included in this update; your uploaded tracks remain in place and are discovered when rebuilding.
