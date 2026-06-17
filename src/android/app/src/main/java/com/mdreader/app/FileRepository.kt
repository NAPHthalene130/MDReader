package com.mdreader.app

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

data class FileEntry(
    val path: String,
    val name: String,
    val openedAt: String
)

class FileRepository(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("mdreader_files", Context.MODE_PRIVATE)
    private val gson = Gson()

    fun getFiles(): List<FileEntry> {
        val json = prefs.getString("recent_files", "[]") ?: "[]"
        val type = object : TypeToken<List<FileEntry>>() {}.type
        return try {
            gson.fromJson(json, type)
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun addFile(path: String, name: String) {
        if (path.isBlank() || name.isBlank()) return
        val files = getFiles().toMutableList()
        val existing = files.indexOfFirst { it.path == path }
        if (existing >= 0) {
            files.removeAt(existing)
        }
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        val entry = FileEntry(
            path = path,
            name = name,
            openedAt = sdf.format(Date())
        )
        files.add(0, entry)
        val trimmed = if (files.size > 50) files.take(50) else files
        synchronized(this) {
            prefs.edit().putString("recent_files", gson.toJson(trimmed)).commit()
        }
    }

    fun removeFile(path: String) {
        if (path.isBlank()) return
        val files = getFiles().filter { it.path != path }
        synchronized(this) {
            prefs.edit().putString("recent_files", gson.toJson(files)).commit()
        }
    }
}
