import SwiftUI

struct ContentView: View {
    @EnvironmentObject var fileStore: FileStore
    @State private var selectedFile: FileEntry?
    @State private var showingFilePicker = false

    var body: some View {
        NavigationSplitView {
            List(selection: $selectedFile) {
                if fileStore.files.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "doc.text.magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary.opacity(0.5))
                        Text("暂无文件")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("点击右上角 + 添加 Markdown 文件")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, minHeight: 200)
                    .listRowBackground(Color.clear)
                } else {
                    ForEach(fileStore.files) { file in
                        FileRowView(file: file)
                            .tag(file)
                            .swipeActions(edge: .trailing) {
                                Button(role: .destructive) {
                                    fileStore.removeFile(file)
                                } label: {
                                    Label("移除", systemImage: "trash")
                                }
                            }
                    }
                }
            }
            .navigationTitle("MDReader")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingFilePicker = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .fileImporter(
                isPresented: $showingFilePicker,
                allowedContentTypes: [.plainText, .data],
                allowsMultipleSelection: false
            ) { result in
                if case .success(let urls) = result, let url = urls.first {
                    fileStore.addFile(url)
                }
            }
        } detail: {
            if let file = selectedFile {
                MarkdownWebView(fileURL: file.url)
                    .navigationTitle(file.name)
                    .navigationBarTitleDisplayMode(.inline)
            } else {
                VStack(spacing: 16) {
                    Image(systemName: "doc.richtext")
                        .font(.system(size: 64))
                        .foregroundColor(.secondary.opacity(0.4))
                    Text("从左侧选择文件开始阅读")
                        .font(.title3)
                        .foregroundColor(.secondary)
                }
            }
        }
    }
}

struct FileRowView: View {
    let file: FileEntry

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "doc.text.fill")
                .font(.title3)
                .foregroundColor(.blue)
            VStack(alignment: .leading, spacing: 4) {
                Text(file.name)
                    .font(.body)
                    .fontWeight(.medium)
                    .lineLimit(1)
                Text(file.path)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                Text(file.formattedDate)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}
