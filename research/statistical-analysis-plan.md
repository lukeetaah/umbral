# Statistical analysis plan v0.1

## Freeze and validation

Before outcomes are inspected, freeze the protocol hash, engine version, scoring rules and analysis commit. Validate consent version, hashes, trial order, duplicate IDs, missingness, playback confirmation and sham count. Publish a flow diagram of enrollments, completions and exclusions.

## Primary estimand

For each participant, calculate the mean preregistered target-response score in paired/omission tests minus the mean in sham. Report the sample mean/median difference, individual trajectories, a percentile bootstrap 95% interval and a randomization/permutation check that respects within-person labels.

## Secondary analyses

- binary occurrence: paired versus sham risk difference;
- hidden repeat: agreement above nonmatching pairs;
- retest: agreement and uncertainty after seven days;
- expectation sensitivity: transparent regression with trial order and expectation;
- safety: counts and rates by severity without efficacy trade-off.

Confidence and expectation sliders are ordinal in the primary report. Any interval treatment is a labeled sensitivity analysis. Missing outcomes are not imputed in the primary analysis. A complete-case estimate is accompanied by missingness patterns and worst/best-case bounds when feasible.

## Multiplicity and exploration

The primary contrast is singular. Secondary outcomes are reported with unadjusted intervals and explicitly not used to rescue a failed primary result. Laboratory, language, device and stimulus-feature subgroups are exploratory. Anomaly Keeper cases are repeated in a new preregistration rather than promoted from the same dataset.

## Interpretation

Report effect sizes and uncertainty regardless of p-values. Do not infer neural activity, peripheral taste, diagnosis or treatment. A null or contradictory result is entered in `negative-results.md` with the same prominence as a positive result.
