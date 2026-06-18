import SwiftUI

@main
struct MDReaderApp: App {
    @StateObject private var fileStore = FileStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(fileStore)
        }
    }
}
