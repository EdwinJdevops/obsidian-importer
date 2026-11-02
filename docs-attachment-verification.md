# Cross-platform attachment release verification

This fork-only workflow verifies the candidate attachment fix on GitHub-hosted Windows and Linux runners. It is independent of upstream PR #692 and adds no service or dependency to the importer runtime.

Each job installs the frozen dependency lock without lifecycle scripts, runs the actual Notion API regression tests, typechecks the project, lints the changed implementation and builds the plugin. Failures produce a nonzero job result. Logs and build-file SHA-256 hashes are retained as artifacts for 14 days. Hashes identify outputs; the workflow does not assert cross-platform byte-identical builds or create release attestations.

Permissions are contents:read; checkout credentials are not persisted. External actions are pinned to commit revisions. No production credentials, deployment, release publication or user archives are involved. Runner labels and the Node major version still change over time; this is not a hermetic build.

This demonstrates CI design, failure visibility, bounded verification and repeatable handoff. The test harness uses mocked network and vault interfaces; it does not establish live workspace migration reliability or production incident response experience. Job success must be checked on GitHub before claiming it.
