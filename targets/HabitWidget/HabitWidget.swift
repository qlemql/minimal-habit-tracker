import WidgetKit
import SwiftUI

// MARK: - Data Model

struct WidgetHabit: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String
    let color: String
    let completed: Bool
    let flowDays: Int
}

// MARK: - Timeline Provider

struct HabitProvider: TimelineProvider {
    private let suiteName = "group.com.qlemql.minimalhabittracker"
    private let dataKey = "widgetHabits"

    func placeholder(in context: Context) -> HabitEntry {
        HabitEntry(date: Date(), habits: sampleHabits)
    }

    func getSnapshot(in context: Context, completion: @escaping (HabitEntry) -> Void) {
        let habits = loadHabits()
        completion(HabitEntry(date: Date(), habits: habits.isEmpty ? sampleHabits : habits))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HabitEntry>) -> Void) {
        let habits = loadHabits()
        let entry = HabitEntry(date: Date(), habits: habits)

        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadHabits() -> [WidgetHabit] {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let jsonString = defaults.string(forKey: dataKey),
              let data = jsonString.data(using: .utf8) else {
            return []
        }
        return (try? JSONDecoder().decode([WidgetHabit].self, from: data)) ?? []
    }

    private var sampleHabits: [WidgetHabit] {
        [
            WidgetHabit(id: "1", name: "물 마시기", icon: "💧", color: "#4A90D9", completed: true, flowDays: 5),
            WidgetHabit(id: "2", name: "운동하기", icon: "🏃", color: "#FF6B6B", completed: false, flowDays: 3),
            WidgetHabit(id: "3", name: "독서하기", icon: "📖", color: "#7B68EE", completed: false, flowDays: 7),
        ]
    }
}

// MARK: - Timeline Entry

struct HabitEntry: TimelineEntry {
    let date: Date
    let habits: [WidgetHabit]
}

// MARK: - Color Helper

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255.0
        let g = Double((int >> 8) & 0xFF) / 255.0
        let b = Double(int & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}

// MARK: - Cream Theme Colors

enum CreamTheme {
    static let background = Color(hex: "#FFF8F0")
    static let textPrimary = Color(hex: "#2D2016")
    static let textSecondary = Color(hex: "#8C7B6B")
    static let accent = Color(hex: "#5B8C6A")
}

// MARK: - Widget Views

struct HabitRowView: View {
    let habit: WidgetHabit

    var body: some View {
        HStack(alignment: .center, spacing: 8) {
            ZStack {
                Circle()
                    .fill(habit.completed ? Color(hex: habit.color) : Color(hex: habit.color).opacity(0.15))
                    .frame(width: 26, height: 26)

                if habit.completed {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                } else {
                    Text(habit.icon)
                        .font(.system(size: 13))
                }
            }
            .frame(width: 26, height: 26)

            Text(habit.name)
                .font(.system(size: 13, weight: habit.completed ? .semibold : .regular))
                .foregroundColor(habit.completed ? Color(hex: habit.color) : CreamTheme.textPrimary)
                .lineLimit(1)
                .truncationMode(.tail)

            Spacer(minLength: 4)

            if habit.flowDays > 0 {
                Text("\(habit.flowDays)일")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(Color(hex: habit.color))
                    .lineLimit(1)
                    .fixedSize()
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct HabitWidgetSmallView: View {
    let entry: HabitEntry

    var completedCount: Int {
        entry.habits.filter { $0.completed }.count
    }

    var allCompleted: Bool {
        !entry.habits.isEmpty && completedCount == entry.habits.count
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .center, spacing: 4) {
                Text("오늘의 습관")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(CreamTheme.textSecondary)
                    .lineLimit(1)
                Spacer(minLength: 4)
                Text("\(completedCount)/\(entry.habits.count)")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(allCompleted ? CreamTheme.accent : CreamTheme.textSecondary)
                    .lineLimit(1)
                    .fixedSize()
            }

            if entry.habits.isEmpty {
                Spacer()
                Text("습관을 추가해주세요")
                    .font(.system(size: 12))
                    .foregroundColor(CreamTheme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                Spacer()
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(entry.habits) { habit in
                        HabitRowView(habit: habit)
                    }
                }
                Spacer(minLength: 0)
            }
        }
    }
}

struct HabitWidgetMediumView: View {
    let entry: HabitEntry

    var completedCount: Int {
        entry.habits.filter { $0.completed }.count
    }

    var allCompleted: Bool {
        !entry.habits.isEmpty && completedCount == entry.habits.count
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center, spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("오늘의 습관")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(CreamTheme.textSecondary)
                        .lineLimit(1)
                    if allCompleted {
                        Text("모두 완료! 🎉")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(CreamTheme.accent)
                            .lineLimit(1)
                    }
                }
                Spacer(minLength: 4)

                ZStack {
                    Circle()
                        .stroke(CreamTheme.textSecondary.opacity(0.2), lineWidth: 3)
                        .frame(width: 32, height: 32)
                    Circle()
                        .trim(from: 0, to: entry.habits.isEmpty ? 0 : CGFloat(completedCount) / CGFloat(entry.habits.count))
                        .stroke(
                            CreamTheme.accent,
                            style: StrokeStyle(lineWidth: 3, lineCap: .round)
                        )
                        .frame(width: 32, height: 32)
                        .rotationEffect(.degrees(-90))
                    Text("\(completedCount)/\(entry.habits.count)")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(CreamTheme.textSecondary)
                }
                .frame(width: 32, height: 32)
            }

            if entry.habits.isEmpty {
                Spacer()
                Text("앱에서 습관을 추가해주세요")
                    .font(.system(size: 13))
                    .foregroundColor(CreamTheme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                Spacer()
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(entry.habits) { habit in
                        HabitRowView(habit: habit)
                    }
                }
                Spacer(minLength: 0)
            }
        }
    }
}

// MARK: - Widget Entry View

struct HabitWidgetEntryView: View {
    var entry: HabitProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            HabitWidgetSmallView(entry: entry)
        default:
            HabitWidgetMediumView(entry: entry)
        }
    }
}

// MARK: - Widget Configuration

@main
struct HabitWidgetBundle: WidgetBundle {
    var body: some Widget {
        HabitWidget()
    }
}

struct HabitWidget: Widget {
    let kind: String = "HabitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HabitProvider()) { entry in
            if #available(iOS 17.0, *) {
                HabitWidgetEntryView(entry: entry)
                    .containerBackground(CreamTheme.background, for: .widget)
            } else {
                HabitWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("오늘의 습관")
        .description("습관 달성 현황을 한눈에 확인하세요")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
