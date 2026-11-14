import 'package:flutter/services.dart';

/// Opens trusted web pages in the device's default browser via a small
/// platform channel implemented in Android's MainActivity (no extra plugin).
class ExternalBrowser {
  static const MethodChannel _channel = MethodChannel('com.smartpaper.generator/browser');

  /// Returns true if the browser was launched.
  static Future<bool> open(String url) async {
    try {
      final launched = await _channel.invokeMethod<bool>('openUrl', {'url': url});
      return launched ?? false;
    } on MissingPluginException {
      return false;
    } on PlatformException {
      return false;
    }
  }
}
