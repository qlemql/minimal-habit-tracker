-- PostHog HogQL SQL insight. Prepared locally; not yet executed in project 703001.
-- Calendar days in Asia/Seoul. A complete D1 needs age >= 2 days;
-- a complete D7-D13 window needs age >= 14 days. NULL means not yet measurable.
WITH users AS (
    SELECT
        distinct_id,
        minIf(timestamp, event = 'first_open') AS first_at,
        groupArrayIf(timestamp, event = 'app_open') AS opens,
        groupArrayIf(timestamp, event = 'habit_completed') AS completions
    FROM events
    WHERE properties.environment = 'production' AND properties.cohort = 'new'
        AND properties.schema_version = 1
    GROUP BY distinct_id
    HAVING countIf(event = 'first_open') > 0
), flags AS (
    SELECT
        distinct_id,
        toDate(toTimeZone(first_at, 'Asia/Seoul')) AS first_day,
        dateDiff('day', first_day, toDate(toTimeZone(now(), 'Asia/Seoul'))) AS age,
        arrayExists(t -> dateDiff('day', first_day, toDate(toTimeZone(t, 'Asia/Seoul'))) = 1, opens) AS d1,
        arrayExists(t -> dateDiff('day', first_day, toDate(toTimeZone(t, 'Asia/Seoul'))) BETWEEN 0 AND 6, completions) AS activated,
        arrayExists(t -> dateDiff('day', first_day, toDate(toTimeZone(t, 'Asia/Seoul'))) BETWEEN 7 AND 13, completions) AS next_week
    FROM users
)
SELECT
    toStartOfWeek(first_day, 1) AS cohort_week,
    count() AS observed_new_installations,
    countIf(age >= 7) AS activation_eligible,
    countIf(age >= 7 AND activated) AS activation_users,
    round(100.0 * activation_users / nullIf(activation_eligible, 0), 1) AS activation_pct,
    countIf(age >= 2) AS d1_eligible,
    countIf(age >= 2 AND d1) AS d1_users,
    round(100.0 * d1_users / nullIf(d1_eligible, 0), 1) AS d1_pct,
    countIf(age >= 14) AS next_week_eligible,
    countIf(age >= 14 AND next_week) AS next_week_users,
    round(100.0 * next_week_users / nullIf(next_week_eligible, 0), 1) AS next_week_pct
FROM flags
GROUP BY cohort_week
ORDER BY cohort_week DESC
