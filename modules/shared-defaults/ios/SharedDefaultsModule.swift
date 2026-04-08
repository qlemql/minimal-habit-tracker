import ExpoModulesCore
import WidgetKit

public class SharedDefaultsModule: Module {
    private let suiteName = "group.com.qlemql.minimalhabittracker"

    public func definition() -> ModuleDefinition {
        Name("SharedDefaultsModule")

        AsyncFunction("setItem") { (key: String, value: String) -> Bool in
            guard let defaults = UserDefaults(suiteName: self.suiteName) else {
                throw NSError(domain: "SharedDefaults", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to access App Group UserDefaults"])
            }
            defaults.set(value, forKey: key)
            defaults.synchronize()

            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }

            return true
        }

        AsyncFunction("getItem") { (key: String) -> String? in
            guard let defaults = UserDefaults(suiteName: self.suiteName) else {
                return nil
            }
            return defaults.string(forKey: key)
        }
    }
}
