import 'package:flutter/material.dart';
import '../features/splash/presentation/splash_screen.dart';
import '../features/auth/presentation/auth_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/generator/presentation/generator_screen.dart';
import '../features/preview/presentation/preview_screen.dart';
import '../features/history/presentation/history_screen.dart';
import '../features/subscription/presentation/subscription_screen.dart';
import '../features/profile/presentation/profile_screen.dart';
import '../features/admin/presentation/admin_screen.dart';
import '../features/syllabus/presentation/syllabus_screen.dart';

/// Centralized application route constants and route generator
class AppRoutes {
  static const String splash = '/';
  static const String home = '/home';
  static const String auth = '/auth';
  static const String generator = '/generator';
  static const String preview = '/preview';
  static const String history = '/history';
  static const String subscription = '/subscription';
  static const String profile = '/profile';
  static const String admin = '/admin';
  static const String syllabus = '/syllabus';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    Widget page;
    switch (settings.name) {
      case splash:
        page = const SplashScreen();
        break;
      case home:
        page = const HomeScreen();
        break;
      case auth:
        page = const AuthScreen();
        break;
      case generator:
        page = const GeneratorScreen();
        break;
      case preview:
        page = const PreviewScreen();
        break;
      case history:
        page = const HistoryScreen();
        break;
      case subscription:
        page = const SubscriptionScreen();
        break;
      case profile:
        page = const ProfileScreen();
        break;
      case admin:
        page = const AdminScreen();
        break;
      case syllabus:
        page = const SyllabusScreen();
        break;
      default:
        page = Scaffold(
          body: Center(
            child: Text('No route defined for ${settings.name}'),
          ),
        );
    }

    return MaterialPageRoute(
      settings: settings,
      builder: (_) => page,
    );
  }
}
