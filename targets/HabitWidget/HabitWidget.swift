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
    var minimum: String? = nil

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
        return Array(((try? JSONDecoder().decode([WidgetHabit].self, from: data)) ?? []).prefix(3))
    }

    private var sampleHabits: [WidgetHabit] {
        var habit = WidgetHabit(id: "preview-reading",
            name: NSLocalizedString("widget.sample.reading", comment: ""), icon: "📖", color: "#9C6842",
            completedDates: [], weeklyTarget: 5)
        habit.minimum = NSLocalizedString("widget.sample.minimum", comment: "")
        return [habit]
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
    static let line = Color(hex: "#E8DED2")
}

// MARK: - Widget Views

struct HabitWidgetSmallView: View {
    let entry: HabitEntry

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 6) {
                Text(NSLocalizedString("widget.title", comment: ""))
                    .font(.system(size: 12, weight: .semibold)).lineLimit(1)
                Spacer(minLength: 0)
                Text("\(entry.habits.filter { $0.isCompletedToday(now: entry.date) }.count)/\(entry.habits.count)")
                    .foregroundColor(CreamTheme.textSecondary).font(.system(size: 12)).fixedSize()
            }
            if entry.habits.count > 1 {
                VStack(spacing: 6) {
                    ForEach(entry.habits) { habit in
                        HStack(spacing: 7) {
                            HabitCheck(habit: habit, date: entry.date, size: 17)
                            VStack(alignment: .leading, spacing: 3) {
                                Text(habit.name).font(.system(size: 12, weight: .semibold)).lineLimit(1)
                                HStack(spacing: 4) {
                                    Text(weeklyText(habit, date: entry.date)).font(.system(size: 10)).lineLimit(1)
                                    if habit.isTinyToday(now: entry.date) {
                                        Text(NSLocalizedString("widget.tinyCompact", comment: "")).font(.system(size: 9)).fixedSize()
                                    }
                                }.foregroundColor(CreamTheme.textSecondary)
                            }.frame(maxWidth: .infinity, alignment: .leading)
                        }.frame(maxHeight: .infinity)
                    }
                }.padding(.top, 10).frame(maxHeight: .infinity)
            } else if let habit = entry.habits.first {
                VStack(spacing: 5) {
                    Text(habit.icon.isEmpty ? "🌱" : habit.icon).font(.system(size: 24))
                    Text(habit.name).font(.system(size: 14, weight: .semibold))
                        .lineLimit(1).multilineTextAlignment(.center)
                    Text(weeklyText(habit, date: entry.date))
                        .font(.system(size: 11)).foregroundColor(CreamTheme.textSecondary).lineLimit(1)
                }.frame(maxHeight: .infinity).padding(.vertical, 8)
                Text(habit.isCompletedToday(now: entry.date) ? statusText(habit, date: entry.date)
                    : habit.minimum.flatMap { $0.isEmpty ? nil : $0 } ?? NSLocalizedString("widget.open", comment: ""))
                    .font(.system(size: 10)).foregroundColor(CreamTheme.textSecondary).lineLimit(1)
                    .padding(.top, 7).frame(maxWidth: .infinity)
                    .overlay(alignment: .top) { Rectangle().fill(CreamTheme.line).frame(height: 0.5) }
            } else {
                Text(NSLocalizedString("widget.empty.small", comment: ""))
                    .font(.system(size: 13)).foregroundColor(CreamTheme.textSecondary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }.foregroundColor(CreamTheme.textPrimary)
    }
}

private func weeklyText(_ habit: WidgetHabit, date: Date) -> String {
    String.localizedStringWithFormat(NSLocalizedString("widget.weekly", comment: ""), habit.weeklyCount(now: date), habit.target)
}

private func statusText(_ habit: WidgetHabit, date: Date) -> String {
    NSLocalizedString(habit.isTinyToday(now: date) ? "widget.tiny" : habit.isCompletedToday(now: date) ? "widget.done" : "widget.open", comment: "")
}

private struct HabitCheck: View {
    let habit: WidgetHabit
    let date: Date
    let size: CGFloat

    var body: some View {
        Image(systemName: habit.isCompletedToday(now: date) ? "checkmark.circle.fill" : "circle")
            .font(.system(size: size, weight: .light))
            .foregroundColor(habit.isCompletedToday(now: date)
                ? CreamTheme.accent.opacity(habit.isTinyToday(now: date) ? 0.65 : 1) : CreamTheme.textSecondary)
            .frame(width: size).accessibilityHidden(true)
    }
}

struct HabitWidgetMediumView: View {
    let entry: HabitEntry

    var body: some View {
        Group {
            if entry.habits.count == 1, let habit = entry.habits.first {
                Link(destination: habit.actionURL) {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 8) {
                            Text(NSLocalizedString("widget.title", comment: ""))
                                .font(.system(size: 13, weight: .semibold)).lineLimit(1)
                            Spacer(minLength: 4)
                            Text(statusText(habit, date: entry.date))
                                .font(.system(size: 11)).foregroundColor(CreamTheme.textSecondary).lineLimit(1)
                        }
                        HStack(spacing: 16) {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack(spacing: 8) {
                                    Text(habit.icon.isEmpty ? "🌱" : habit.icon).font(.system(size: 28))
                                    Text(habit.name).font(.system(size: 19, weight: .semibold)).lineLimit(2)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                                Text(habit.minimum.flatMap { $0.isEmpty ? nil : $0 } ?? NSLocalizedString("widget.open", comment: ""))
                                    .font(.system(size: 12)).foregroundColor(CreamTheme.textSecondary).lineLimit(2)
                            }.frame(maxWidth: .infinity, alignment: .leading)
                            VStack(spacing: 5) {
                                Text("\(habit.weeklyCount(now: entry.date))/\(habit.target)")
                                    .font(.system(size: 28, weight: .medium)).monospacedDigit().foregroundColor(CreamTheme.accent)
                                Text(NSLocalizedString("widget.weekLabel", comment: ""))
                                    .font(.system(size: 11)).foregroundColor(CreamTheme.textSecondary).lineLimit(1)
                            }.frame(width: 65)
                        }.frame(maxHeight: .infinity)
                    }.frame(maxWidth: .infinity, maxHeight: .infinity).contentShape(Rectangle())
                }.accessibilityElement(children: .ignore)
                    .accessibilityLabel("\(habit.name), \(statusText(habit, date: entry.date)), \(weeklyText(habit, date: entry.date))")
            } else {
                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 6) {
                        Text(NSLocalizedString("widget.title", comment: ""))
                            .font(.system(size: 13, weight: .semibold)).lineLimit(1)
                        Text("\(entry.habits.filter { $0.isCompletedToday(now: entry.date) }.count)/\(entry.habits.count)")
                            .font(.system(size: 11)).foregroundColor(CreamTheme.textSecondary).fixedSize()
                        Spacer(minLength: 4)
                        if entry.habits.count == 3 {
                            Text(NSLocalizedString("widget.weekLabel", comment: ""))
                                .font(.system(size: 11)).foregroundColor(CreamTheme.textSecondary).fixedSize()
                        }
                    }
                    if entry.habits.isEmpty {
                        Text(NSLocalizedString("widget.empty.medium", comment: ""))
                            .font(.system(size: 13)).foregroundColor(CreamTheme.textSecondary)
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                    } else {
                        VStack(spacing: 10) {
                            ForEach(entry.habits) { habit in
                                Link(destination: habit.actionURL) {
                                    HStack(spacing: 9) {
                                        HabitCheck(habit: habit, date: entry.date, size: 24)
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(habit.name).font(.system(size: entry.habits.count == 2 ? 15 : 14, weight: .medium)).lineLimit(1)
                                            if entry.habits.count == 2 {
                                                Text(weeklyText(habit, date: entry.date))
                                                    .font(.system(size: 11)).foregroundColor(CreamTheme.textSecondary).lineLimit(1)
                                            }
                                        }.frame(maxWidth: .infinity, alignment: .leading)
                                        if habit.isTinyToday(now: entry.date) {
                                            Text(NSLocalizedString("widget.tinyCompact", comment: ""))
                                                .font(.system(size: 10, weight: .medium)).foregroundColor(CreamTheme.accent)
                                                .padding(.horizontal, 6).padding(.vertical, 4)
                                                .background(CreamTheme.accent.opacity(0.10), in: Capsule()).fixedSize()
                                        }
                                        if entry.habits.count == 3 {
                                            Text("\(habit.weeklyCount(now: entry.date))/\(habit.target)")
                                                .font(.system(size: 12)).monospacedDigit().foregroundColor(CreamTheme.textSecondary)
                                                .frame(minWidth: 28, alignment: .trailing).fixedSize()
                                        }
                                    }.frame(minHeight: 26, maxHeight: .infinity).contentShape(Rectangle())
                                }.accessibilityElement(children: .ignore)
                                    .accessibilityLabel("\(habit.name), \(statusText(habit, date: entry.date)), \(weeklyText(habit, date: entry.date))")
                            }
                        }.frame(maxHeight: .infinity)
                    }
                }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        }.foregroundColor(CreamTheme.textPrimary)
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
            EmptyView()
        } currentValueLabel: {
            Text("\(completed)/\(total)")
                .font(.system(size: 12, weight: .bold))
        }
        .gaugeStyle(.accessoryCircularCapacity)
        .accessibilityLabel("\(NSLocalizedString("widget.accessory.label", comment: "")), \(completed)/\(total)")
    }
}

@available(iOS 16.0, *)
struct HabitWidgetAccessoryRectangularView: View {
    let entry: HabitEntry

    var completed: Int { entry.habits.filter { $0.isCompletedToday(now: entry.date) }.count }
    var total: Int { entry.habits.count }

    var body: some View {
        Group {
            if let habit = entry.habits.first, total == 1 {
                VStack(alignment: .leading, spacing: 5) {
                    Text(habit.name).font(.system(size: 13, weight: .semibold)).lineLimit(1)
                    HStack(spacing: 6) {
                        Image(systemName: habit.isCompletedToday(now: entry.date) ? "checkmark.circle.fill" : "circle")
                            .font(.system(size: 13)).accessibilityHidden(true)
                        Text(statusText(habit, date: entry.date)).font(.system(size: 11)).lineLimit(1)
                    }
                    Text(weeklyText(habit, date: entry.date))
                        .font(.system(size: 10)).foregroundStyle(.secondary).lineLimit(1)
                }
            } else if total > 1 {
                VStack(alignment: .leading, spacing: total == 2 ? 8 : 5) {
                    ForEach(entry.habits.prefix(3)) { habit in
                        HStack(spacing: 6) {
                            Image(systemName: habit.isCompletedToday(now: entry.date) ? "checkmark.circle.fill" : "circle")
                                .font(.system(size: 13)).accessibilityHidden(true)
                            Text(habit.name).font(.system(size: 12, weight: .medium)).lineLimit(1)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            Text("\(habit.weeklyCount(now: entry.date))/\(habit.target)")
                                .font(.system(size: 10)).foregroundStyle(.secondary).fixedSize()
                        }.accessibilityElement(children: .ignore)
                            .accessibilityLabel("\(habit.name), \(statusText(habit, date: entry.date)), \(weeklyText(habit, date: entry.date))")
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text(NSLocalizedString("widget.title", comment: "")).font(.system(size: 11, weight: .semibold))
                    Text(NSLocalizedString("widget.empty.accessory", comment: "")).font(.system(size: 12)).lineLimit(2)
                }
            }
        }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
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
            Text(
                String.localizedStringWithFormat(NSLocalizedString("widget.accessory.inline.allDone", comment: ""), completed, total)
            )
        } else {
            Text(
                String.localizedStringWithFormat(NSLocalizedString("widget.accessory.inline.progress", comment: ""), completed, total)
            )
        }
    }
}

// MARK: - Widget Entry View

struct HabitWidgetEntryView: View {
    var entry: HabitProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        content.widgetURL(entry.habits.count == 1 && (family == .systemSmall || family == .systemMedium)
            ? entry.habits.first?.actionURL : URL(string: "minimal-habit-tracker:///"))
    }

    @ViewBuilder private var content: some View {
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
