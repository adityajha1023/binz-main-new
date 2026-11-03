import 'package:flutter_test/flutter_test.dart';

import 'package:flutter/material.dart';
import 'package:binz_mobile/account_session.dart';
import 'package:binz_mobile/auth_page.dart';

void main() {
  testWidgets('shows the BinZ sign-in experience', (WidgetTester tester) async {
    await tester
        .pumpWidget(MaterialApp(home: AuthPage(session: AccountSession())));

    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('New to BinZ? Create an account'), findsOneWidget);
  });
}
