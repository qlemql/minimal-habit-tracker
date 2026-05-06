package expo.modules.shareddefaults

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.appwidget.AppWidgetManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SharedDefaultsModule : Module() {
    private val prefsName = "habit_widget_shared"

    override fun definition() = ModuleDefinition {
        Name("SharedDefaultsModule")

        AsyncFunction("setItem") { key: String, value: String ->
            val ctx = appContext.reactContext
                ?: throw IllegalStateException("React context not available")
            val prefs = ctx.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
            prefs.edit().putString(key, value).apply()
            triggerWidgetUpdate(ctx)
            true
        }

        AsyncFunction("getItem") { key: String ->
            val ctx = appContext.reactContext
            ctx?.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
                ?.getString(key, null)
        }
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
