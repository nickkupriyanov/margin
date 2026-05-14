const { ConfigPlugin, withDangerousMod, withEntitlementsPlist, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_NAME = 'CozyQuotesWidget';
const BRIDGE_NAME = 'CozyWidgetBridge';

const withCozyQuotesIos = (config, props = {}) => {
  const appGroupIdentifier = props.appGroupIdentifier || 'group.com.nickkupriyanov.cozyquotes';
  const widgetBundleIdentifier = props.widgetBundleIdentifier || 'com.nickkupriyanov.cozyquotes.widget';

  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.security.application-groups'] = [appGroupIdentifier];
    return config;
  });

  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosRoot = config.modRequest.platformProjectRoot;
      const widgetRoot = path.join(iosRoot, WIDGET_NAME);
      const appRoot = path.join(iosRoot, config.modRequest.projectName);
      fs.mkdirSync(widgetRoot, { recursive: true });
      fs.mkdirSync(appRoot, { recursive: true });

      writeIfChanged(path.join(widgetRoot, `${WIDGET_NAME}.swift`), widgetSwift(appGroupIdentifier));
      writeIfChanged(path.join(widgetRoot, `${WIDGET_NAME}-Info.plist`), widgetInfoPlist(widgetBundleIdentifier));
      writeIfChanged(path.join(widgetRoot, `${WIDGET_NAME}.entitlements`), widgetEntitlements(appGroupIdentifier));
      writeIfChanged(path.join(appRoot, `${BRIDGE_NAME}.swift`), bridgeSwift(appGroupIdentifier));
      writeIfChanged(path.join(appRoot, `${BRIDGE_NAME}.m`), bridgeObjc());
      return config;
    },
  ]);

  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const appTarget = project.getFirstTarget();
    const widgetTargetName = WIDGET_NAME;

    if (!project.pbxTargetByName(widgetTargetName)) {
      const widgetTarget = project.addTarget(widgetTargetName, 'app_extension', WIDGET_NAME, widgetBundleIdentifier);
      project.addBuildPhase([`${WIDGET_NAME}/${WIDGET_NAME}.swift`], 'PBXSourcesBuildPhase', 'Sources', widgetTarget.uuid);
      project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', widgetTarget.uuid);

      const configs = project.pbxXCBuildConfigurationSection();
      for (const key of Object.keys(configs)) {
        const buildConfig = configs[key];
        if (!buildConfig || !buildConfig.buildSettings) continue;
        if (buildConfig.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === `"${widgetBundleIdentifier}"`) {
          buildConfig.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${WIDGET_NAME}/${WIDGET_NAME}.entitlements"`;
          buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '17.0';
          buildConfig.buildSettings.MARKETING_VERSION = '1.0';
          buildConfig.buildSettings.CURRENT_PROJECT_VERSION = '1';
          buildConfig.buildSettings.SWIFT_VERSION = '5.0';
          buildConfig.buildSettings.TARGETED_DEVICE_FAMILY = '1';
        }
      }
    }

    addSourceFile(project, `${config.modRequest.projectName}/${BRIDGE_NAME}.swift`, appTarget.uuid, config.modRequest.projectName);
    addSourceFile(project, `${config.modRequest.projectName}/${BRIDGE_NAME}.m`, appTarget.uuid, config.modRequest.projectName);
    stripUndefinedPbxValues(project);

    return config;
  });

  return config;
};

function addSourceFile(project, fileName, targetUuid, groupName) {
  const section = project.pbxFileReferenceSection();
  const alreadyExists = Object.values(section).some((entry) => entry && entry.path === fileName);
  if (alreadyExists) return;
  const groupKey = project.findPBXGroupKey({ name: groupName }) || project.getFirstProject().firstProject.mainGroup;
  project.addSourceFile(fileName, { target: targetUuid }, groupKey);
}

function stripUndefinedPbxValues(project) {
  for (const section of Object.values(project.hash.project.objects)) {
    if (!section || typeof section !== 'object') continue;
    for (const entry of Object.values(section)) {
      if (!entry || typeof entry !== 'object') continue;
      for (const key of Object.keys(entry)) {
        if (entry[key] === undefined) {
          delete entry[key];
        }
      }
    }
  }
}

function writeIfChanged(filePath, contents) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === contents) return;
  fs.writeFileSync(filePath, contents);
}

function widgetSwift(appGroupIdentifier) {
  return `import SwiftUI
import WidgetKit

private let appGroupIdentifier = "${appGroupIdentifier}"
private let payloadKey = "widgetPayload"

struct CozyQuotePayload: Decodable {
    let quoteId: String
    let text: String
    let author: String
    let source: String
    let accentStyle: String
    let updatedAt: String
}

struct CozyQuoteEntry: TimelineEntry {
    let date: Date
    let payload: CozyQuotePayload
}

struct CozyQuoteProvider: TimelineProvider {
    func placeholder(in context: Context) -> CozyQuoteEntry {
        CozyQuoteEntry(date: Date(), payload: fallbackPayload)
    }

    func getSnapshot(in context: Context, completion: @escaping (CozyQuoteEntry) -> Void) {
        completion(CozyQuoteEntry(date: Date(), payload: readPayload()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CozyQuoteEntry>) -> Void) {
        let entry = CozyQuoteEntry(date: Date(), payload: readPayload())
        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 6, to: Date()) ?? Date().addingTimeInterval(21600)
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }

    private func readPayload() -> CozyQuotePayload {
        guard
            let defaults = UserDefaults(suiteName: appGroupIdentifier),
            let json = defaults.string(forKey: payloadKey),
            let data = json.data(using: .utf8),
            let payload = try? JSONDecoder().decode(CozyQuotePayload.self, from: data)
        else {
            return fallbackPayload
        }
        return payload
    }
}

private let fallbackPayload = CozyQuotePayload(
    quoteId: "fallback",
    text: "Collect the lines that make the day feel wider.",
    author: "Cozy Quotes",
    source: "A quiet beginning",
    accentStyle: "paper",
    updatedAt: "1970-01-01T00:00:00Z"
)

struct CozyQuoteWidgetView: View {
    let entry: CozyQuoteProvider.Entry
    @Environment(\\.widgetFamily) private var family

    var body: some View {
        ZStack(alignment: .topLeading) {
            background
            VStack(alignment: .leading, spacing: family == .systemSmall ? 10 : 14) {
                Text(entry.payload.text)
                    .font(.custom("Georgia", size: family == .systemSmall ? 17 : 22))
                    .lineSpacing(family == .systemSmall ? 2 : 4)
                    .foregroundStyle(Color(red: 0.23, green: 0.18, blue: 0.14))
                    .minimumScaleFactor(0.78)
                    .lineLimit(family == .systemSmall ? 5 : 6)

                Spacer(minLength: 4)

                Text(sourceText)
                    .font(.system(size: family == .systemSmall ? 11 : 12, weight: .medium, design: .serif))
                    .foregroundStyle(Color(red: 0.48, green: 0.39, blue: 0.31))
                    .lineLimit(2)
            }
            .padding(family == .systemSmall ? 16 : 20)
        }
        .containerBackground(Color(red: 0.97, green: 0.94, blue: 0.88), for: .widget)
    }

    private var sourceText: String {
        [entry.payload.author, entry.payload.source].filter { !$0.isEmpty }.joined(separator: ", ")
    }

    private var background: some View {
        LinearGradient(
            colors: [
                Color(red: 0.98, green: 0.95, blue: 0.89),
                Color(red: 0.91, green: 0.84, blue: 0.75)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(alignment: .top) {
            Rectangle()
                .fill(Color(red: 0.48, green: 0.34, blue: 0.23).opacity(0.08))
                .frame(height: 1)
                .padding(.horizontal, 18)
                .padding(.top, 14)
        }
    }
}

@main
struct CozyQuotesWidgetBundle: WidgetBundle {
    var body: some Widget {
        CozyQuotesWidget()
    }
}

struct CozyQuotesWidget: Widget {
    let kind = "CozyQuotesWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CozyQuoteProvider()) { entry in
            CozyQuoteWidgetView(entry: entry)
        }
        .configurationDisplayName("Cozy Quote")
        .description("A saved passage returns quietly.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
`;
}

function widgetInfoPlist(bundleIdentifier) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>$(DEVELOPMENT_LANGUAGE)</string>
  <key>CFBundleDisplayName</key>
  <string>Cozy Quotes</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>${bundleIdentifier}</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>CozyQuotesWidget</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleShortVersionString</key>
  <string>$(MARKETING_VERSION)</string>
  <key>CFBundleVersion</key>
  <string>$(CURRENT_PROJECT_VERSION)</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
</dict>
</plist>
`;
}

function widgetEntitlements(appGroupIdentifier) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.application-groups</key>
  <array>
    <string>${appGroupIdentifier}</string>
  </array>
</dict>
</plist>
`;
}

function bridgeSwift(appGroupIdentifier) {
  return `import Foundation
import React
import WidgetKit

@objc(CozyWidgetBridge)
class CozyWidgetBridge: NSObject {
    private let appGroupIdentifier = "${appGroupIdentifier}"
    private let payloadKey = "widgetPayload"

    @objc
    static func requiresMainQueueSetup() -> Bool {
        false
    }

    @objc(writeSnapshot:resolver:rejecter:)
    func writeSnapshot(_ json: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else {
            reject("APP_GROUP_UNAVAILABLE", "Unable to open the Cozy Quotes App Group.", nil)
            return
        }

        defaults.set(json, forKey: payloadKey)
        defaults.synchronize()

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        resolve(true)
    }
}
`;
}

function bridgeObjc() {
  return `#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CozyWidgetBridge, NSObject)

RCT_EXTERN_METHOD(writeSnapshot:(NSString *)json
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
`;
}

module.exports = withCozyQuotesIos;
