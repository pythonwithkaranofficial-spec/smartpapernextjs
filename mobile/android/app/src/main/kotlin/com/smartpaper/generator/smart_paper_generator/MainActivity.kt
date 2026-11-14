package com.smartpaper.generator.smart_paper_generator

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    companion object {
        private const val BROWSER_CHANNEL = "com.smartpaper.generator/browser"
        private const val TRUSTED_HOST = "paperbykaran.vercel.app"
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, BROWSER_CHANNEL)
            .setMethodCallHandler { call, result ->
                if (call.method != "openUrl") {
                    result.notImplemented()
                    return@setMethodCallHandler
                }

                val uri = call.argument<String>("url")?.let { Uri.parse(it) }
                // Only open our own website over HTTPS (used for checkout).
                if (uri == null || uri.scheme != "https" || uri.host != TRUSTED_HOST) {
                    result.success(false)
                    return@setMethodCallHandler
                }

                try {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                    result.success(true)
                } catch (e: ActivityNotFoundException) {
                    result.success(false)
                }
            }
    }
}
