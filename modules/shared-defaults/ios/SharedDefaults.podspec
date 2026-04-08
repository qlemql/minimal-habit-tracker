Pod::Spec.new do |s|
  s.name           = 'SharedDefaults'
  s.version        = '1.0.0'
  s.summary        = 'App Group UserDefaults bridge for widget data sharing'
  s.homepage       = 'https://github.com/qlemql/minimal-habit-tracker'
  s.license        = 'MIT'
  s.author         = 'Daniel'
  s.source         = { git: '' }
  s.platform       = :ios, '15.1'
  s.swift_version  = '5.9'
  s.source_files   = '**/*.swift'

  s.dependency 'ExpoModulesCore'
end
