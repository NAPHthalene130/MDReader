package com.mdreader.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.ItemTouchHelper.SimpleCallback
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class FileListFragment : Fragment() {

    private lateinit var fileRepo: FileRepository
    private lateinit var recyclerView: RecyclerView
    private lateinit var emptyView: TextView
    private lateinit var fab: FloatingActionButton
    private lateinit var adapter: FileAdapter

    companion object {
        private const val REQUEST_CODE_OPEN_FILE = 100
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        fileRepo = FileRepository(requireContext())

        val root = inflater.inflate(R.layout.fragment_file_list, container, false)
        recyclerView = root.findViewById(R.id.file_list)
        emptyView = root.findViewById(R.id.empty_view)
        fab = root.findViewById(R.id.fab_add)

        adapter = FileAdapter(fileRepo.getFiles()) { entry ->
            (activity as? MainActivity)?.openFile(entry.path, entry.name)
        }
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = adapter

        fab.setOnClickListener {
            openFilePicker()
        }

        // Swipe to delete
        val itemTouchHelper = ItemTouchHelper(object : SimpleCallback(0, ItemTouchHelper.LEFT) {
            override fun onMove(
                rv: RecyclerView,
                viewHolder: RecyclerView.ViewHolder,
                target: RecyclerView.ViewHolder
            ) = false

            override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
                val position = viewHolder.bindingAdapterPosition
                if (position == RecyclerView.NO_POSITION) return
                val entry = adapter.getFiles()[position]
                fileRepo.removeFile(entry.path)
                updateFileList()
            }
        })
        itemTouchHelper.attachToRecyclerView(recyclerView)

        updateFileList()
        return root
    }

    private fun openFilePicker() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(
                "text/markdown",
                "text/plain",
                "application/octet-stream"
            ))
        }
        startActivityForResult(intent, REQUEST_CODE_OPEN_FILE)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_CODE_OPEN_FILE && resultCode == Activity.RESULT_OK) {
            data?.data?.also { uri ->
                val name = getFileName(uri) ?: "Unknown"
                val path = uri.toString()
                fileRepo.addFile(path, name)
                updateFileList()
            }
        }
    }

    private fun getFileName(uri: Uri): String? {
        var name: String? = null
        requireContext().contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && nameIndex >= 0) {
                name = cursor.getString(nameIndex)
            }
        }
        return name
    }

    fun updateFileList() {
        val files = fileRepo.getFiles()
        adapter.updateFiles(files)
        if (files.isEmpty()) {
            emptyView.visibility = View.VISIBLE
            recyclerView.visibility = View.GONE
        } else {
            emptyView.visibility = View.GONE
            recyclerView.visibility = View.VISIBLE
        }
    }
}

class FileAdapter(
    private var files: List<FileEntry>,
    private val onClick: (FileEntry) -> Unit
) : RecyclerView.Adapter<FileAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val nameView: TextView = view.findViewById(R.id.file_name)
        val pathView: TextView = view.findViewById(R.id.file_path)
        val dateView: TextView = view.findViewById(R.id.file_date)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_file_entry, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val entry = files[position]
        holder.nameView.text = entry.name
        holder.pathView.text = entry.path
        holder.dateView.text = formatDate(entry.openedAt)
        holder.itemView.setOnClickListener { onClick(entry) }
    }

    override fun getItemCount() = files.size

    fun updateFiles(newFiles: List<FileEntry>) {
        files = newFiles
        notifyDataSetChanged()
    }

    fun getFiles() = files

    private fun formatDate(isoString: String): String {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
            parser.timeZone = TimeZone.getTimeZone("UTC")
            val date = parser.parse(isoString)
            val formatter = SimpleDateFormat("MMM d, yyyy HH:mm", Locale.getDefault())
            formatter.format(date!!)
        } catch (e: Exception) {
            isoString
        }
    }
}
