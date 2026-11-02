-- PostHog HogQL SQL insight. Prepared locally; not yet executed remotely.
-- Both existing and new installations, split by cohort. This is the first
-- observed record after analytics rollout, not necessarily their first ever record.
WITH users AS (
    SELECT
        distinct_id,
        properties.cohort AS cohort,
        min(timestamp) AS first_at,
        groupArray(timestamp) AS completions
    FROM events
    WHERE event = 'habit_completed' AND properties.environment = 'production'
        AND properties.schema_version = 1
    GROUP BY distinct_id, cohort
), flags AS (
    SELECT
        distinct_id, cohort,
        toDate(toTimeZone(first_at, 'Asia/Seoul')) AS first_day,
        dateDiff('day', first_day, toDate(toTimeZone(now(), 'Asia/Seoul'))) AS age,
        arrayExists(t -> dateDiff('day', first_day, toDate(toTimeZone(t, 'Asia/Seoul'))) BETWEEN 7 AND 13, completions) AS next_week
    FROM users
)
SELECT
    toStartOfWeek(first_day, 1) AS cohort_week,
    cohort,
    count() AS observed_recorders,
    countIf(age >= 14) AS eligible,
    countIf(age >= 14 AND next_week) AS returned,
    round(100.0 * returned / nullIf(eligible, 0), 1) AS next_week_pct
FROM flags
GROUP BY cohort_week, cohort
ORDER BY cohort_week DESC, cohort
