import WidgetKit
import SwiftUI

// MARK: - Data Model

struct WidgetHabit: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String
    let color: String
    let completedDates: [String]
    // Optional for snapshots written by the previous app version.
    let weeklyTarget: Int?
    let tinyDates: [String]?

    init(id: String, name: String, icon: String, color: String,
         completedDates: [String], weeklyTarget: Int? = nil, tinyDates: [String]? = nil) {
        self.id = id; self.name = name; self.icon = icon; self.color = color
        self.completedDates = completedDates
        self.weeklyTarget = weeklyTarget; self.tinyDates = tinyDates
    }

    var target: Int { min(7, max(1, weeklyTarget ?? 7)) }
    var actionURL: URL {
        var url = URLComponents()
        url.scheme = "minimal-habit-tracker"
        url.host = "practice"
        url.queryItems = [URLQueryItem(name: "id", value: id)]
        return url.url!
    }
    func isCompletedToday(now: Date = Date()) -> Bool {
        completedDates.contains(WidgetDate.todayKey(now))
    }
    func isTinyToday(now: Date = Date()) -> Bool {
        isCompletedToday(now: now) && (tinyDates ?? []).contains(WidgetDate.todayKey(now))
    }
    // Monday-based calendar week, exactly like renewal/domain.ts. Both efforts count once.
    func weeklyCount(now: Date = Date()) -> Int {
        let calendar = Calendar(identifier: .gregorian)
        let offset = (calendar.component(.weekday, from: now) + 5) % 7
        let monday = calendar.date(byAdding: .day, value: -offset, to: now)!
        let start = WidgetDate.todayKey(monday)
        let today = WidgetDate.todayKey(now)
        return Set(completedDates).filter { $0 >= start && $0 <= today }.count
    }
}

enum WidgetDate {
    static var formatter: DateFormatter {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = .current
        f.dateFormat = "yyyy-MM-dd"
        return f
    }
    static func todayKey(_ now: Date = Date()) -> String { formatter.string(from: now) }
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
        completion(HabitEntry(date: Date(), habits: context.isPreview ? sampleHabits : habits))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HabitEntry>) -> Void) {
        let habits = loadHabits()
        let now = Date()
        // Precompute day boundaries so an OS-delayed reload does not keep yesterday's check.
        let calendar = Calendar(identifier: .gregorian)
        var entries = [HabitEntry(date: now, habits: habits)]
        for offset in 1...7 {
            let day = calendar.startOfDay(for: calendar.date(byAdding: .day, value: offset, to: now)!)
            entries.append(HabitEntry(date: day, habits: habits))
        }
        let timeline = Timeline(entries: entries, policy: .atEnd)
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
    static let background = Color(hex: "#FFF9EF")
    static let textPrimary = Color(hex: "#302A25")
    static let textSecondary = Color(hex: "#75695F")
    static let accent = Color(hex: "#9C6842")
}

// MARK: - Widget Views

struct HabitRowView: View {
    let habit: WidgetHabit
    let date: Date

    var body: some View {
        let completed = habit.isCompletedToday(now: date)
        let status = NSLocalizedString(habit.isTinyToday(now: date) ? "widget.tiny" :
            (completed ? "widget.done" : "widget.open"), comment: "")
        let week = String.localizedStringWithFormat(
            NSLocalizedString("widget.weekly", comment: ""), habit.weeklyCount(now: date), habit.target)
        HStack(spacing: 8) {
            ZStack {
                Circle().fill(completed ? CreamTheme.accent : CreamTheme.accent.opacity(0.12))
                if completed {
                    Image(systemName: "checkmark").font(.system(size: 12, weight: .bold)).foregroundColor(.white)
                } else {
                    Text(habit.icon).font(.system(size: 13))
                }
            }.frame(width: 26, height: 26)
            VStack(alignment: .leading, spacing: 2) {
                Text(habit.name).font(.system(size: 13, weight: .medium))
                    .foregroundColor(CreamTheme.textPrimary).lineLimit(1)
                HStack(spacing: 5) {
                    Text(week)
                    if habit.isTinyToday(now: date) { Text(NSLocalizedString("widget.tiny", comment: "")) }
                }.font(.system(size: 10)).foregroundColor(CreamTheme.textSecondary).lineLimit(1)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(habit.name), \(status), \(week)")
    }
}

struct HabitWidgetSmallView: View {
    let entry: HabitEntry
    var body: some View { HabitListView(entry: entry, links: false) }
}
struct HabitWidgetMediumView: View {
    let entry: HabitEntry
    var body: some View { HabitListView(entry: entry, links: true) }
}
struct HabitListView: View {
    let entry: HabitEntry
    let links: Bool
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(NSLocalizedString("widget.title", comment: ""))
                    .font(.system(size: 12, weight: .semibold)).lineLimit(1)
                Spacer(minLength: 4)
                Text("\(entry.habits.filter { $0.isCompletedToday(now: entry.date) }.count)/\(entry.habits.count)")
                    .font(.system(size: 11, weight: .semibold)).fixedSize()
            }.foregroundColor(CreamTheme.textSecondary)
            if entry.habits.isEmpty {
                Spacer(minLength: 0)
                Text(NSLocalizedString("widget.empty.medium", comment: ""))
                    .font(.system(size: 12)).foregroundColor(CreamTheme.textSecondary)
            } else {
                ForEach(entry.habits.prefix(3)) { habit in
                    if links {
                        Link(destination: habit.actionURL) { HabitRowView(habit: habit, date: entry.date) }
                    } else {
                        HabitRowView(habit: habit, date: entry.date)
                    }
                }
            }
            Spacer(minLength: 0)
        }
    }
}

// MARK: - Lock Screen Accessory Views (iOS 16+)

@available(iOS 16.0, *)
struct HabitWidgetAccessoryCircularView: View {
    let entry: HabitEntry

    var completed: Int { entry.habits.filter { $0.isCompletedToday(now: entry.date) }.count }
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

    var completed: Int { entry.habits.filter { $0.isCompletedToday(now: entry.date) }.count }
    var total: Int { entry.habits.count }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Text(NSLocalizedString("widget.title", comment: ""))
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.secondary)
                Spacer(minLength: 4)
                if total > 0 {
                    Text("\(completed)/\(total)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(.primary)
                        .lineLimit(1)
                        .fixedSize()
                }
            }

            Spacer(minLength: 0)

            if total == 0 {
                Text(NSLocalizedString("widget.empty.accessory", comment: ""))
                    .font(.system(size: 12, weight: .medium))
                    .frame(maxWidth: .infinity, alignment: .center)
            } else {
                HStack(spacing: 5) {
                    ForEach(entry.habits.prefix(3)) { habit in
                        Image(systemName: habit.isCompletedToday(now: entry.date) ? "checkmark.circle.fill" : "circle")
                            .font(.system(size: 14, weight: .medium))
                    }
                    Spacer(minLength: 0)
                }
            }
        }
    }
}

@available(iOS 16.0, *)
struct HabitWidgetAccessoryInlineView: View {
    let entry: HabitEntry

    var completed: Int { entry.habits.filter { $0.isCompletedToday(now: entry.date) }.count }
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
                .widgetURL(URL(string: "minimal-habit-tracker:///"))
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

    private var isRectangularAccessory: Bool {
        #if os(iOS)
        if #available(iOS 16.0, *) {
            return family == .accessoryRectangular
        }
        #endif
        return false
    }

    var body: some View {
        if #available(iOS 17.0, *) {
            content()
                .padding(isRectangularAccessory ? 8 : 0)
                .containerBackground(for: .widget) {
                    if isAccessory {
                        Color.clear
                    } else {
                        CreamTheme.background
                    }
                }
                .overlay(borderOverlay)
        } else {
            if isAccessory {
                content()
                    .padding(isRectangularAccessory ? 8 : 0)
                    .overlay(borderOverlay)
            } else {
                content()
                    .padding()
                    .background(CreamTheme.background)
            }
        }
    }

    // accessoryRectangular에만 옅은 흰색 stroke — 잠금화면에서 영역 인지.
    // 다른 위젯(circular, inline, 홈스크린)은 보더 없음.
    @ViewBuilder
    private var borderOverlay: some View {
        if isRectangularAccessory {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(Color.white.opacity(0.35), lineWidth: 1)
        }
    }
}
