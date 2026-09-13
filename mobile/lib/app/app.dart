import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import '../features/splash/presentation/splash_screen.dart';

class SmartPaperApp extends StatelessWidget {
  const SmartPaperApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Paper Generator',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const SplashScreen(),
    );
  }
}
