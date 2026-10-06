package expo.modules.shareddefaults

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.appwidget.AppWidgetManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray

class SharedDefaultsModule : Module() {
    private val prefsName = "habit_widget_shared"

    override fun definition() = ModuleDefinition {
        Name("SharedDefaultsModule")

        AsyncFunction("setItem") { key: String, value: String ->
            val ctx = appContext.reactContext
                ?: throw IllegalStateException("React context not available")
            val prefs = ctx.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            synchronized(prefs) {
                // A React snapshot must not overwrite taps still waiting to be imported.
                val next = if (key == "widgetHabits") mergePending(value,
                    prefs.getString("widgetPendingToggles", "[]") ?: "[]") else value
                if (!prefs.edit().putString(key, next).commit())
                    throw IllegalStateException("Widget storage write failed")
            }
            triggerWidgetUpdate(ctx)
            true
        }

        AsyncFunction("getItem") { key: String ->
            val ctx = appContext.reactContext
            ctx?.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
                ?.getString(key, null)
        }

        AsyncFunction("ackWidgetEvents") { idsJson: String ->
            val ctx = appContext.reactContext
                ?: throw IllegalStateException("React context not available")
            val prefs = ctx.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            synchronized(prefs) {
                val ids = JSONArray(idsJson)
                val acknowledged = mutableSetOf<String>()
                for (i in 0 until ids.length()) acknowledged.add(ids.getString(i))
                val queue = JSONArray(prefs.getString("widgetPendingToggles", "[]"))
                val remaining = JSONArray()
                for (i in 0 until queue.length()) {
                    val event = queue.optJSONObject(i)
                    // Legacy string events have no date: never apply them to today.
                    if (event != null && !acknowledged.contains(event.optString("eventId")))
                        remaining.put(event)
                }
                if (!prefs.edit().putString("widgetPendingToggles", remaining.toString()).commit())
                    throw IllegalStateException("Widget acknowledgement failed")
            }
            true
        }
    }

    private fun mergePending(snapshot: String, pending: String): String {
        val habits = JSONArray(snapshot)
        val queue = JSONArray(pending)
        for (i in 0 until queue.length()) {
            val event = queue.optJSONObject(i) ?: continue
            val date = event.optString("date")
            for (j in 0 until habits.length()) {
                val habit = habits.getJSONObject(j)
                if (habit.optString("id") != event.optString("habitId")) continue
                val previous = habit.optJSONArray("completedDates") ?: JSONArray()
                val dates = JSONArray()
                for (k in 0 until previous.length())
                    if (previous.getString(k) != date) dates.put(previous.getString(k))
                if (event.optBoolean("completed")) dates.put(date)
                habit.put("completedDates", dates)
                // Old widget taps always represented the full action, never the tiny alternative.
                val previousTiny = habit.optJSONArray("tinyDates") ?: JSONArray()
                val tinyDates = JSONArray()
                for (k in 0 until previousTiny.length())
                    if (previousTiny.getString(k) != date) tinyDates.put(previousTiny.getString(k))
                habit.put("tinyDates", tinyDates)
            }
        }
        return habits.toString()
    }

    private fun triggerWidgetUpdate(ctx: Context) {
        val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
        val widgetClass = "com.qlemql.minimalhabittracker.widget.HabitWidgetProvider"
        val component = ComponentName(ctx.packageName, widgetClass)
        val ids = AppWidgetManager.getInstance(ctx).getAppWidgetIds(component)
        if (ids.isNotEmpty()) {
            intent.component = component
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            ctx.sendBroadcast(intent)
        }
    }
}
