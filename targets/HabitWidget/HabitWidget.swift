import WidgetKit
import SwiftUI

// MARK: - Data Model

struct WidgetHabit: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String
    let color: String
    // 최근 90일간 완료 날짜 목록 (YYYY-MM-DD). 위젯이 "오늘"을 자체 판정.
    let completedDates: [String]
}

// MARK: - Date helpers (위젯 자체 판정)

enum WidgetDate {
    static let formatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.calendar = Calendar(identifier: .gregorian)
        f.timeZone = TimeZone.current
        f.locale = Locale(identifier: "en_US_POSIX")
        return f
    }()

    static func todayKey(_ now: Date = Date()) -> String {
        return formatter.string(from: now)
    }
}

extension WidgetHabit {
    /// 오늘 체크 여부 — 위젯 렌더 시점의 시스템 날짜로 판정
    func isCompletedToday(now: Date = Date()) -> Bool {
        return completedDates.contains(WidgetDate.todayKey(now))
    }

    /// 현재 흐름 일수 — streak.ts의 calculateFlow 포팅
    /// 오늘부터 거꾸로 탐색, 실제 수행한 날만 카운트, 2일 연속 미완료 시 끊김
    func currentFlowDays(now: Date = Date()) -> Int {
        let completedSet = Set(completedDates)
        var flowDays = 0
        var consecutiveMisses = 0
        let calendar = Calendar(identifier: .gregorian)
        var checkDate = calendar.startOfDay(for: now)

        for _ in 0..<365 {
            let dateStr = WidgetDate.formatter.string(from: checkDate)
            if completedSet.contains(dateStr) {
                flowDays += 1
                consecutiveMisses = 0
            } else {
                consecutiveMisses += 1
                if consecutiveMisses >= 2 { break }
            }
            guard let prev = calendar.date(byAdding: .day, value: -1, to: checkDate) else { break }
            checkDate = prev
        }
        return flowDays
    }
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
        let now = Date()
        let entry = HabitEntry(date: now, habits: habits)

        // 자정에 자동 reload — 다음 timeline에서 시스템 날짜가 새 날로 바뀌어 있음
        // → completedDates에 오늘 날짜가 없으니 자연스럽게 "미완료"로 표시됨
        let calendar = Calendar(identifier: .gregorian)
        let tomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let timeline = Timeline(entries: [entry], policy: .after(tomorrow))
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
        let today = WidgetDate.todayKey()
        let calendar = Calendar(identifier: .gregorian)
        let yesterday = WidgetDate.formatter.string(
            from: calendar.date(byAdding: .day, value: -1, to: Date())!
        )
        return [
            WidgetHabit(id: "1", name: NSLocalizedString("widget.sample.water", comment: ""), icon: "💧", color: "#4A90D9",
                        completedDates: [yesterday, today]),
            WidgetHabit(id: "2", name: NSLocalizedString("widget.sample.exercise", comment: ""), icon: "🏃", color: "#FF6B6B",
                        completedDates: [yesterday]),
            WidgetHabit(id: "3", name: NSLocalizedString("widget.sample.reading", comment: ""), icon: "📖", color: "#7B68EE",
                        completedDates: []),
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
        let completed = habit.isCompletedToday()
        let flowDays = habit.currentFlowDays()

        HStack(alignment: .center, spacing: 8) {
            ZStack {
                Circle()
                    .fill(completed ? Color(hex: habit.color) : Color(hex: habit.color).opacity(0.15))
                    .frame(width: 26, height: 26)

                if completed {
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
                .font(.system(size: 13, weight: completed ? .semibold : .regular))
                .foregroundColor(completed ? Color(hex: habit.color) : CreamTheme.textPrimary)
                .lineLimit(1)
                .truncationMode(.tail)

            Spacer(minLength: 4)

            if flowDays > 0 {
                Text(String.localizedStringWithFormat(NSLocalizedString("widget.flowDays", comment: ""), flowDays))
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
        entry.habits.filter { $0.isCompletedToday() }.count
    }

    var allCompleted: Bool {
        !entry.habits.isEmpty && completedCount == entry.habits.count
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .center, spacing: 4) {
                Text(NSLocalizedString("widget.title", comment: ""))
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
                Text(NSLocalizedString("widget.empty.small", comment: ""))
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
        entry.habits.filter { $0.isCompletedToday() }.count
    }

    var allCompleted: Bool {
        !entry.habits.isEmpty && completedCount == entry.habits.count
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center, spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(NSLocalizedString("widget.title", comment: ""))
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(CreamTheme.textSecondary)
                        .lineLimit(1)
                    if allCompleted {
                        Text(NSLocalizedString("widget.allCompleted", comment: ""))
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
                Text(NSLocalizedString("widget.empty.medium", comment: ""))
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

// MARK: - Lock Screen Accessory Views (iOS 16+)

@available(iOS 16.0, *)
struct HabitWidgetAccessoryCircularView: View {
    let entry: HabitEntry

    var completed: Int { entry.habits.filter { $0.isCompletedToday() }.count }
    var total: Int { entry.habits.count }
    var progress: Double {
        guard total > 0 else { return 0 }
        return Double(completed) / Double(total)
    }

    var body: some View {
        Gauge(value: progress) {
            Text(NSLocalizedString("widget.accessory.label", comment: ""))
        } currentValueLabel: {
            Text("\(completed)/\(total)")
                .font(.system(size: 12, weight: .bold))
        }
        .gaugeStyle(.accessoryCircular)
    }
}

@available(iOS 16.0, *)
struct HabitWidgetAccessoryRectangularView: View {
    let entry: HabitEntry

    var completed: Int { entry.habits.filter { $0.isCompletedToday() }.count }
    var total: Int { entry.habits.count }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(NSLocalizedString("widget.title", comment: ""))
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.secondary)

            if total == 0 {
                Text(NSLocalizedString("widget.empty.accessory", comment: ""))
                    .font(.system(size: 12))
            } else {
                HStack(spacing: 8) {
                    HStack(spacing: 4) {
                        ForEach(entry.habits.prefix(3)) { habit in
                            Image(systemName: habit.isCompletedToday() ? "checkmark.circle.fill" : "circle")
                                .font(.system(size: 14))
                        }
                    }
                    Spacer(minLength: 4)
                    Text("\(completed)/\(total)")
                        .font(.system(size: 14, weight: .bold))
                        .lineLimit(1)
                        .fixedSize()
                }
            }
        }
    }
}

@available(iOS 16.0, *)
struct HabitWidgetAccessoryInlineView: View {
    let entry: HabitEntry

    var completed: Int { entry.habits.filter { $0.isCompletedToday() }.count }
    var total: Int { entry.habits.count }

    var body: some View {
        if total == 0 {
            Text(NSLocalizedString("widget.accessory.inline.empty", comment: ""))
        } else if completed == total {
            Label(
                String.localizedStringWithFormat(NSLocalizedString("widget.accessory.inline.allDone", comment: ""), completed, total),
                systemImage: "checkmark.seal.fill"
            )
        } else {
            Label(
                String.localizedStringWithFormat(NSLocalizedString("widget.accessory.inline.progress", comment: ""), completed, total),
                systemImage: "leaf.fill"
            )
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
        case .systemMedium:
            HabitWidgetMediumView(entry: entry)
        default:
            if #available(iOS 16.0, *) {
                accessoryView
            } else {
                HabitWidgetMediumView(entry: entry)
            }
        }
    }

    @available(iOS 16.0, *)
    @ViewBuilder
    private var accessoryView: some View {
        #if os(iOS)
        switch family {
        case .accessoryCircular:
            HabitWidgetAccessoryCircularView(entry: entry)
        case .accessoryRectangular:
            HabitWidgetAccessoryRectangularView(entry: entry)
        case .accessoryInline:
            HabitWidgetAccessoryInlineView(entry: entry)
        default:
            HabitWidgetMediumView(entry: entry)
        }
        #else
        HabitWidgetMediumView(entry: entry)
        #endif
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

    private var families: [WidgetFamily] {
        var f: [WidgetFamily] = [.systemSmall, .systemMedium]
        #if os(iOS)
        if #available(iOS 16.0, *) {
            f.append(.accessoryCircular)
            f.append(.accessoryRectangular)
            f.append(.accessoryInline)
        }
        #endif
        return f
    }

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HabitProvider()) { entry in
            HabitWidgetContainer { HabitWidgetEntryView(entry: entry) }
        }
        .configurationDisplayName(NSLocalizedString("widget.config.displayName", comment: ""))
        .description(NSLocalizedString("widget.config.description", comment: ""))
        .supportedFamilies(families)
    }
}

// Family-aware background: 시스템 위젯엔 크림 톤, 잠금화면 위젯엔 투명
struct HabitWidgetContainer<Content: View>: View {
    @Environment(\.widgetFamily) var family
    let content: () -> Content

    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    private var isAccessory: Bool {
        #if os(iOS)
        if #available(iOS 16.0, *) {
            return family == .accessoryCircular || family == .accessoryRectangular || family == .accessoryInline
        }
        #endif
        return false
    }

    var body: some View {
        if #available(iOS 17.0, *) {
            content()
                .containerBackground(for: .widget) {
                    if isAccessory {
                        Color.clear
                    } else {
                        CreamTheme.background
                    }
                }
        } else {
            if isAccessory {
                content()
            } else {
                content()
                    .padding()
                    .background(CreamTheme.background)
            }
        }
    }
}
