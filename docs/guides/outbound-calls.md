# Outbound calls

Only approved operational workflows may enqueue recipients. Before every attempt, revalidate destination, preferences, consent basis, suppression, jurisdiction, local calling window, campaign status, maximum attempts, cooldown, approved caller ID, verified language, agent version, training pack, provider readiness, and capacity.

Campaign.callerId stores the authorized PhoneNumber record ID, never an arbitrary browser-supplied number. The worker creates canonical records and leases before calling ElevenLabs through the Telnyx SIP trunk. Network ambiguity fails closed to avoid duplicate calls. Telnyx events and ElevenLabs post-call data finalize the same attempt and release leases.

Live tests require owned, authorized, consented numbers.
