import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:smart_paper_generator/services/api/api_client.dart';
import 'package:smart_paper_generator/services/firebase/firebase_auth_service.dart';
import 'package:smart_paper_generator/features/auth/services/auth_provider.dart';
import 'package:smart_paper_generator/features/generator/services/generator_provider.dart';
import 'package:smart_paper_generator/features/history/services/history_provider.dart';
import 'package:smart_paper_generator/features/subscription/services/subscription_provider.dart';
import 'package:smart_paper_generator/features/admin/services/admin_provider.dart';
import 'package:smart_paper_generator/app/theme/theme_provider.dart';
import 'package:smart_paper_generator/app/app.dart';

void main() {
  testWidgets('App initialization smoke test', (WidgetTester tester) async {
    final apiClient = ApiClient();
    final authService = FirebaseAuthServiceImpl(apiClient);

    await tester.pumpWidget(
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

    // Pump timer for splash screen transition into HomeScreen
    await tester.pump(const Duration(seconds: 2));
    await tester.pumpAndSettle();

    // Verify app title text in dashboard
    expect(find.text('Smart Paper Generator'), findsWidgets);
  });
}
