package com.mdreader.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.google.android.material.bottomnavigation.BottomNavigationView

class MainActivity : AppCompatActivity() {

    private lateinit var fileListFragment: FileListFragment
    private lateinit var viewerFragment: ViewerFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        if (savedInstanceState == null) {
            fileListFragment = FileListFragment()
            viewerFragment = ViewerFragment()
            supportFragmentManager.beginTransaction()
                .setReorderingAllowed(true)
                .add(R.id.fragment_container, fileListFragment, "fileList")
                .add(R.id.fragment_container, viewerFragment, "viewer")
                .hide(viewerFragment)
                .commit()
        } else {
            fileListFragment = supportFragmentManager.findFragmentByTag("fileList") as FileListFragment
            viewerFragment = supportFragmentManager.findFragmentByTag("viewer") as ViewerFragment
        }

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottom_navigation)
        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_files -> showFragment(fileListFragment)
                R.id.nav_viewer -> showFragment(viewerFragment)
            }
            true
        }
    }

    fun showFileList() {
        supportFragmentManager.beginTransaction()
            .setReorderingAllowed(true)
            .hide(viewerFragment)
            .show(fileListFragment)
            .commit()
        findViewById<BottomNavigationView>(R.id.bottom_navigation).selectedItemId = R.id.nav_files
    }

    fun openFile(filePath: String, fileName: String) {
        viewerFragment.loadFile(filePath, fileName)
        supportFragmentManager.beginTransaction()
            .setReorderingAllowed(true)
            .hide(fileListFragment)
            .show(viewerFragment)
            .commit()
        findViewById<BottomNavigationView>(R.id.bottom_navigation).selectedItemId = R.id.nav_viewer
    }

    private fun showFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction().apply {
            setReorderingAllowed(true)
            hide(fileListFragment)
            hide(viewerFragment)
            show(fragment)
            commit()
        }
    }
}
