package com.qlemql.minimalhabittracker.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
import android.os.Build
import android.text.SpannableString
import android.text.style.StyleSpan
import android.view.View
import android.widget.RemoteViews
import com.qlemql.minimalhabittracker.R
import org.json.JSONArray
import org.json.JSONObject
import android.net.Uri
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class HabitWidgetProvider : AppWidgetProvider() {

    companion object {
        const val PREFS_NAME = "habit_widget_shared"
        const val KEY_WIDGET_HABITS = "widgetHabits"
        const val KEY_PENDING_TOGGLES = "widgetPendingToggles"
        const val ACTION_TOGGLE = "com.qlemql.minimalhabittracker.widget.ACTION_TOGGLE"
        const val ACTION_MIDNIGHT_REFRESH = "com.qlemql.minimalhabittracker.widget.ACTION_MIDNIGHT_REFRESH"
        const val EXTRA_HABIT_ID = "habit_id"

        private const val MAX_ROWS = 3
        private const val MIDNIGHT_REQUEST_CODE = 9001

        // 크림 톤 팔레트 — iOS HabitWidget.swift CreamTheme와 동일
        private const val COLOR_TEXT_PRIMARY = "#302A25"
        private const val COLOR_TEXT_SECONDARY = "#75695F"
        private const val COLOR_ACCENT = "#9C6842"
        private const val COLOR_FALLBACK_HABIT = "#9C6842"

        private fun dateFormatter(): SimpleDateFormat =
            SimpleDateFormat("yyyy-MM-dd", Locale.US)

        fun todayKey(): String = dateFormatter().format(Date())
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (id in appWidgetIds) {
            renderWidget(context, appWidgetManager, id)
        }
        // 다음 자정에 자동 갱신 예약 (self-perpetuating)
        scheduleMidnightUpdate(context)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            ACTION_TOGGLE -> {
                val habitId = intent.getStringExtra(EXTRA_HABIT_ID) ?: return
                context.startActivity(openHabitIntent(context, habitId))
                refreshAllWidgets(context)
            }
            ACTION_MIDNIGHT_REFRESH -> {
                // 자정 도래 — 모든 위젯 redraw + 다음 자정 다시 예약
                refreshAllWidgets(context)
                scheduleMidnightUpdate(context)
            }
        }
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        // 첫 위젯 추가 시 자정 알람 등록
        scheduleMidnightUpdate(context)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        // 마지막 위젯 제거 시 알람 정리
        cancelMidnightUpdate(context)
    }

    private fun refreshAllWidgets(context: Context) {
        val mgr = AppWidgetManager.getInstance(context)
        val ids = mgr.getAppWidgetIds(
            ComponentName(context, HabitWidgetProvider::class.java)
        )
        for (id in ids) {
            renderWidget(context, mgr, id)
        }
    }

    private fun renderWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.habit_widget_medium)
        val habits = loadHabits(context)
        val today = todayKey()

        val rowIds = listOf(R.id.widget_row_1, R.id.widget_row_2, R.id.widget_row_3)
        val checkIds = listOf(R.id.widget_check_1, R.id.widget_check_2, R.id.widget_check_3)
        val nameIds = listOf(R.id.widget_name_1, R.id.widget_name_2, R.id.widget_name_3)
        val weekIds = listOf(R.id.widget_week_1, R.id.widget_week_2, R.id.widget_week_3)

        views.setOnClickPendingIntent(R.id.widget_title, PendingIntent.getActivity(
            context, 0, openHabitIntent(context, null),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
        views.setOnClickPendingIntent(R.id.widget_empty, PendingIntent.getActivity(
            context, 0, openHabitIntent(context, null),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
        if (habits.isEmpty()) {
            views.setViewVisibility(R.id.widget_empty, View.VISIBLE)
            views.setViewVisibility(R.id.widget_progress_ring, View.GONE)
            views.setViewVisibility(R.id.widget_all_completed, View.GONE)
            for (id in rowIds) views.setViewVisibility(id, View.GONE)
        } else {
            views.setViewVisibility(R.id.widget_empty, View.GONE)
            views.setViewVisibility(R.id.widget_progress_ring, View.VISIBLE)

            val completedCount = habits.count { it.isCompletedToday(today) }
            val total = habits.size
            val allCompleted = completedCount == total

            views.setImageViewBitmap(
                R.id.widget_progress_ring,
                createProgressRingBitmap(context, completedCount, total)
            )

            views.setViewVisibility(
                R.id.widget_all_completed,
                if (allCompleted) View.VISIBLE else View.GONE
            )

            for (i in 0 until MAX_ROWS) {
                if (i < habits.size) {
                    val habit = habits[i]
                    views.setViewVisibility(rowIds[i], View.VISIBLE)

                    val habitColor = Color.parseColor(COLOR_ACCENT)
                    val completedToday = habit.isCompletedToday(today)
                    val weekCount = habit.weeklyCount(today)

                    views.setImageViewBitmap(
                        checkIds[i],
                        createCheckBitmap(context, habit, completedToday)
                    )

                    if (completedToday) {
                        val span = SpannableString(habit.name)
                        span.setSpan(StyleSpan(Typeface.BOLD), 0, habit.name.length, 0)
                        views.setTextViewText(nameIds[i], span)
                        views.setTextColor(nameIds[i], habitColor)
                    } else {
                        views.setTextViewText(nameIds[i], habit.name)
                        views.setTextColor(nameIds[i], Color.parseColor(COLOR_TEXT_PRIMARY))
                    }

                    val week = context.getString(R.string.widget_weekly, weekCount, habit.target)
                    val status = context.getString(if (habit.isTinyToday(today)) R.string.widget_tiny
                        else if (completedToday) R.string.widget_done else R.string.widget_open)
                    views.setTextViewText(weekIds[i], if (habit.isTinyToday(today)) "$week · $status" else week)
                    views.setTextColor(weekIds[i], Color.parseColor(COLOR_TEXT_SECONDARY))
                    views.setContentDescription(rowIds[i], "${habit.name}, $status, $week")
                    val pi = PendingIntent.getActivity(context, 0, openHabitIntent(context, habit.id),
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                    views.setOnClickPendingIntent(rowIds[i], pi)
                } else {
                    views.setViewVisibility(rowIds[i], View.GONE)
                }
            }
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun loadHabits(context: Context): List<WidgetHabit> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = prefs.getString(KEY_WIDGET_HABITS, null) ?: return emptyList()
        return try {
            val arr = JSONArray(json)
            val list = mutableListOf<WidgetHabit>()
            for (i in 0 until arr.length()) {
                val o = arr.getJSONObject(i)
                val datesArr = o.optJSONArray("completedDates")
                val dates = mutableListOf<String>()
                if (datesArr != null) {
                    for (j in 0 until datesArr.length()) {
                        dates.add(datesArr.getString(j))
                    }
                }
                list.add(
                    WidgetHabit(
                        id = o.getString("id"),
                        name = o.getString("name"),
                        icon = o.optString("icon", ""),
                        color = o.optString("color", COLOR_FALLBACK_HABIT),
                        completedDates = dates,
                        weeklyTarget = o.optInt("weeklyTarget", 7),
                        tinyDates = o.optJSONArray("tinyDates")?.let { a ->
                            (0 until a.length()).map { a.getString(it) }
                        } ?: emptyList()
                    )
                )
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }

    // Explicit app component and encoded ID; old broadcast PendingIntents also open this path.
    private fun openHabitIntent(context: Context, habitId: String?): Intent {
        val uri = Uri.Builder().scheme("minimal-habit-tracker").authority(
            if (habitId == null) "" else "practice")
        if (habitId != null) uri.appendQueryParameter("id", habitId)
        else uri.path("/")
        return Intent(Intent.ACTION_VIEW, uri.build()).apply {
            setClassName(context.packageName, "${context.packageName}.MainActivity")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
    }

    // ─── 자정 자동 reload (AlarmManager) ───────────────────────────────────

    private fun midnightPendingIntent(context: Context): PendingIntent {
        val intent = Intent(context, HabitWidgetProvider::class.java).apply {
            action = ACTION_MIDNIGHT_REFRESH
        }
        return PendingIntent.getBroadcast(
            context,
            MIDNIGHT_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun nextMidnightMillis(): Long {
        val cal = Calendar.getInstance().apply {
            add(Calendar.DAY_OF_MONTH, 1)
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        return cal.timeInMillis
    }

    /**
     * 다음 자정에 ACTION_MIDNIGHT_REFRESH broadcast 예약.
     * 정확한 알람 권한이 거부된 경우 inexact로 폴백.
     */
    private fun scheduleMidnightUpdate(context: Context) {
        val alarmMgr = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val pi = midnightPendingIntent(context)
        val triggerAt = nextMidnightMillis()

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                !alarmMgr.canScheduleExactAlarms()) {
                alarmMgr.setAndAllowWhileIdle(AlarmManager.RTC, triggerAt, pi)
            } else {
                alarmMgr.setExactAndAllowWhileIdle(AlarmManager.RTC, triggerAt, pi)
            }
        } catch (e: SecurityException) {
            alarmMgr.setAndAllowWhileIdle(AlarmManager.RTC, triggerAt, pi)
        }
    }

    private fun cancelMidnightUpdate(context: Context) {
        val alarmMgr = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        alarmMgr.cancel(midnightPendingIntent(context))
    }

    // ─── Bitmap 헬퍼 ────────────────────────────────────────────────────────

    private fun applyAlpha(color: Int, alpha: Float): Int {
        val a = (alpha.coerceIn(0f, 1f) * 255).toInt()
        return (a shl 24) or (color and 0x00FFFFFF)
    }

    /**
     * 체크 인디케이터 비트맵 — iOS HabitRowView의 26pt 원형과 동일.
     */
    private fun createCheckBitmap(context: Context, habit: WidgetHabit, completed: Boolean): Bitmap {
        val density = context.resources.displayMetrics.density
        val sizePx = (26 * density).toInt().coerceAtLeast(64)
        val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val center = sizePx / 2f
        val radius = sizePx / 2f - 1f
        val habitColor = Color.parseColor(COLOR_ACCENT)

        val circlePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = if (completed) habitColor else applyAlpha(habitColor, 0.15f)
            style = Paint.Style.FILL
        }
        canvas.drawCircle(center, center, radius, circlePaint)

        if (completed) {
            val checkPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = Color.WHITE
                style = Paint.Style.STROKE
                strokeWidth = sizePx * 0.13f
                strokeCap = Paint.Cap.ROUND
                strokeJoin = Paint.Join.ROUND
            }
            val path = Path().apply {
                moveTo(sizePx * 0.28f, sizePx * 0.52f)
                lineTo(sizePx * 0.45f, sizePx * 0.68f)
                lineTo(sizePx * 0.74f, sizePx * 0.36f)
            }
            canvas.drawPath(path, checkPaint)
        } else if (habit.icon.isNotEmpty()) {
            val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                textSize = sizePx * 0.50f
                textAlign = Paint.Align.CENTER
            }
            val baselineY = center - (textPaint.descent() + textPaint.ascent()) / 2f
            canvas.drawText(habit.icon, center, baselineY, textPaint)
        }

        return bitmap
    }

    /**
     * 진행 도넛 링 비트맵 — iOS HabitWidgetMediumView의 32pt 링과 동일.
     */
    private fun createProgressRingBitmap(
        context: Context,
        completed: Int,
        total: Int
    ): Bitmap {
        val density = context.resources.displayMetrics.density
        val sizePx = (32 * density).toInt().coerceAtLeast(72)
        val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val strokeWidth = sizePx * 0.094f
        val center = sizePx / 2f
        val radius = sizePx / 2f - strokeWidth / 2f - 1f

        val accentColor = Color.parseColor(COLOR_ACCENT)
        val textSecondary = Color.parseColor(COLOR_TEXT_SECONDARY)
        val bgRingColor = applyAlpha(textSecondary, 0.20f)

        val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = bgRingColor
            style = Paint.Style.STROKE
            this.strokeWidth = strokeWidth
        }
        canvas.drawCircle(center, center, radius, bgPaint)

        if (total > 0 && completed > 0) {
            val sweepAngle = 360f * completed / total
            val arcPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = accentColor
                style = Paint.Style.STROKE
                this.strokeWidth = strokeWidth
                strokeCap = Paint.Cap.ROUND
            }
            val rect = RectF(
                center - radius, center - radius,
                center + radius, center + radius
            )
            canvas.drawArc(rect, -90f, sweepAngle, false, arcPaint)
        }

        val text = "$completed/$total"
        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = textSecondary
            textSize = sizePx * 0.28f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
        val baselineY = center - (textPaint.descent() + textPaint.ascent()) / 2f
        canvas.drawText(text, center, baselineY, textPaint)

        return bitmap
    }
}

data class WidgetHabit(
    val id: String,
    val name: String,
    val icon: String,
    val color: String,
    val completedDates: List<String>,
    val weeklyTarget: Int = 7,
    val tinyDates: List<String> = emptyList()
) {
    val target: Int get() = weeklyTarget.coerceIn(1, 7)
    fun isCompletedToday(today: String): Boolean = completedDates.contains(today)
    fun isTinyToday(today: String): Boolean = isCompletedToday(today) && tinyDates.contains(today)
    fun weeklyCount(today: String): Int {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply { isLenient = false }
        val cal = Calendar.getInstance().apply { time = sdf.parse(today) ?: return 0 }
        val offset = (cal.get(Calendar.DAY_OF_WEEK) + 5) % 7
        cal.add(Calendar.DAY_OF_MONTH, -offset)
        val monday = sdf.format(cal.time)
        return completedDates.toSet().count { it >= monday && it <= today }
    }
}
