# Recording

Recording defaults to off. State progresses through NOT_REQUESTED, DISCLOSURE_REQUIRED, CONSENT_REQUESTED, CONSENT_GRANTED, CONSENT_DECLINED, or RECORDING_DISABLED according to workspace, business, jurisdiction, direction, and workflow policy.

No provider recording command is sent before authorization. Recording access uses short-lived signed URLs and an audit record. Retention and deletion are tenant-configurable. Routine logs never contain recording URLs or full transcript content.
