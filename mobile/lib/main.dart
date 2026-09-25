import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';

import 'services/api/api_client.dart';
import 'services/firebase/firebase_auth_service.dart';

import 'features/auth/services/auth_provider.dart';
import 'features/generator/services/generator_provider.dart';
import 'features/history/services/history_provider.dart';
import 'features/subscription/services/subscription_provider.dart';
import 'features/admin/services/admin_provider.dart';

import 'app/app.dart';

import 'firebase_options.dart';
import 'app/theme/theme_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (_) {
    // Fallback if running unit tests without native bindings
  }

  // Edge-to-edge system UI styling matching dark theme
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0A0A0A),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  final apiClient = ApiClient();
  final authService = FirebaseAuthServiceImpl(apiClient);

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: apiClient),
        Provider<FirebaseAuthService>.value(value: authService),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider(authService)),
        ChangeNotifierProvider(create: (_) => GeneratorProvider(apiClient)),
        ChangeNotifierProvider(create: (_) => HistoryProvider(apiClient)),
        ChangeNotifierProvider(create: (_) => SubscriptionProvider(apiClient)),
        ChangeNotifierProvider(create: (_) => AdminProvider(apiClient)),
      ],
      child: const SmartPaperApp(),
    ),
  );
}
