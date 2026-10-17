"""Compile the production Swift/Kotlin widget models and exercise calendar boundaries.
Requires Xcode command-line tools, Java, and a downloaded Gradle distribution (or KOTLIN_LIB).
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
cases = [
    ("empty", "2026-10-06", [], 0),
    ("Monday boundary", "2026-10-05", ["2026-10-04", "2026-10-05"], 1),
    ("Sunday", "2026-10-11", ["2026-10-04", "2026-10-05", "2026-10-07", "2026-10-11"], 3),
    ("duplicates and future", "2026-10-06", ["2026-10-05", "2026-10-05", "2026-10-06", "2026-10-07"], 2),
    ("long gap", "2026-10-06", ["2026-09-01", "2026-10-06"], 1),
    ("year boundary", "2027-01-01", ["2026-12-27", "2026-12-28", "2027-01-01"], 2),
    ("leap day", "2028-03-01", ["2028-02-27", "2028-02-28", "2028-02-29", "2028-03-01"], 3),
    ("spring DST", "2026-03-08", ["2026-03-01", "2026-03-02", "2026-03-07", "2026-03-08"], 3),
    ("fall DST", "2026-11-01", ["2026-10-25", "2026-10-26", "2026-10-31", "2026-11-01"], 3),
    ("above a three-day intention", "2026-10-11", [f"2026-10-{d:02}" for d in range(5, 12)], 7),
]
swift = (ROOT / 'targets/HabitWidget/HabitWidget.swift').read_text()
swift = 'import Foundation\n' + swift.split('// MARK: - Data Model')[1].split('// MARK: - Timeline Provider')[0]
kotlin = (ROOT / 'targets/HabitWidgetAndroid/kotlin/HabitWidgetProvider.kt').read_text()
kotlin = ('import java.text.SimpleDateFormat\nimport java.util.Calendar\nimport java.util.Locale\n'
          + 'data class WidgetHabit(' + kotlin.split('data class WidgetHabit(')[1])
swift += '\n'
kotlin += '\nfun main() {\n'
for name, today, dates, expected in cases:
    data = json.dumps(dates)
    swift += f'''do {{
        let habit = WidgetHabit(id: "a", name: "Read", icon: "", color: "", completedDates: {data}, weeklyTarget: 3)
        let date = WidgetDate.formatter.date(from: "{today}")!
        precondition(habit.weeklyCount(now: date) == {expected}, "{name}")
    }}\n'''
    kotlin += f'''check(WidgetHabit("a", "Read", "", "", listOf({', '.join(json.dumps(d) for d in dates)}), 3).weeklyCount("{today}") == {expected}) {{ "{name}" }}\n'''
swift += '''
let legacy = try JSONDecoder().decode(WidgetHabit.self, from: Data(#"{"id":"a &?# 한글","name":"Read","icon":"","color":"","completedDates":["2026-10-06"]}"#.utf8))
precondition(legacy.target == 7 && !legacy.isTinyToday(now: WidgetDate.formatter.date(from: "2026-10-06")!))
precondition(URLComponents(url: legacy.actionURL, resolvingAgainstBaseURL: false)!.queryItems!.first!.value == legacy.id)
let tiny = WidgetHabit(id: "a", name: "Read", icon: "", color: "", completedDates: ["2026-10-06"], weeklyTarget: 3, tinyDates: ["2026-10-06"])
precondition(tiny.isTinyToday(now: WidgetDate.formatter.date(from: "2026-10-06")!))
precondition(!tiny.isTinyToday(now: WidgetDate.formatter.date(from: "2026-10-07")!))
print("Swift: 10 calendar cases, legacy snapshot, encoded link and tiny state passed")
'''
kotlin += '''
check(WidgetHabit("a", "Read", "", "", emptyList()).target == 7)
val tiny = WidgetHabit("a", "Read", "", "", listOf("2026-10-06"), 3, listOf("2026-10-06"))
check(tiny.isTinyToday("2026-10-06"))
check(!tiny.isTinyToday("2026-10-07"))
println("Kotlin: 10 calendar cases, legacy default and tiny state passed")
}
'''
java = shutil.which('java')
java_home = os.environ.get('JAVA_HOME', '/Applications/Android Studio.app/Contents/jbr/Contents/Home')
if (Path(java_home) / 'bin/java').exists():
    java = str(Path(java_home) / 'bin/java')
libs = os.environ.get('KOTLIN_LIB')
if not libs:
    compilers = sorted((Path.home()/'.gradle/wrapper/dists').glob('*/**/lib/kotlin-compiler-embeddable-*.jar'))
    if not compilers:
        raise SystemExit('Set KOTLIN_LIB to a Gradle lib directory with kotlin-compiler-embeddable.')
    libs = str(compilers[-1].parent)
with tempfile.TemporaryDirectory(prefix='ssak-widget-models-') as temp:
    tmp = Path(temp)
    (tmp/'main.swift').write_text(swift)
    (tmp/'Main.kt').write_text(kotlin)
    subprocess.run(['xcrun','swiftc',str(tmp/'main.swift'),'-o',str(tmp/'swift-tests')],check=True)
    classpath = os.pathsep.join(str(p) for p in Path(libs).glob('*.jar'))
    subprocess.run([java,'-cp',classpath,'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler',
                    '-no-stdlib','-no-reflect','-classpath',classpath,str(tmp/'Main.kt'),'-d',str(tmp/'kotlin-tests.jar')], check=True)
    for zone in ['Asia/Seoul', 'UTC', 'America/New_York']:
        print(zone, flush=True)
        env = dict(os.environ, TZ=zone)
        subprocess.run([str(tmp/'swift-tests')], env=env,check=True)
        subprocess.run([java,f'-Duser.timezone={zone}','-cp',str(tmp/'kotlin-tests.jar')+os.pathsep+classpath,'MainKt'], env=env,check=True)
