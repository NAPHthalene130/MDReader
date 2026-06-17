import Foundation
import SwiftUI

struct FileEntry: Identifiable, Codable, Hashable {
    let id: UUID
    let path: String
    let name: String
    let openedAt: Date

    var url: URL { URL(fileURLWithPath: path) }

    var formattedDate: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        return formatter.localizedString(for: openedAt, relativeTo: Date())
    }

    init(path: String, name: String, openedAt: Date = Date()) {
        self.id = UUID()
        self.path = path
        self.name = name
        self.openedAt = openedAt
    }
}

class FileStore: ObservableObject {
    @Published var files: [FileEntry] = []
    private let maxFiles = 50
    private let storageKey = "mdreader_recent_files"

    init() {
        load()
    }

    func addFile(_ url: URL) {
        let path = url.path
        let name = url.lastPathComponent

        guard url.startAccessingSecurityScopedResource() else { return }
        defer { url.stopAccessingSecurityScopedResource() }

        files.removeAll { $0.path == path }
        files.insert(FileEntry(path: path, name: name), at: 0)

        if files.count > maxFiles {
            files = Array(files.prefix(maxFiles))
        }

        save()
    }

    func removeFile(_ file: FileEntry) {
        files.removeAll { $0.id == file.id }
        save()
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([FileEntry].self, from: data) else { return }
        files = decoded
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(files) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }
}
