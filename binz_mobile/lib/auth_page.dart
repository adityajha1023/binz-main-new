import 'package:flutter/material.dart';

import 'account_session.dart';

class AuthPage extends StatefulWidget {
  final AccountSession session;
  const AuthPage({super.key, required this.session});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  bool signUp = false;
  bool loading = false;
  String? error;
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();

  @override
  void dispose() {
    firstName.dispose();
    lastName.dispose();
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      if (signUp) {
        await widget.session.register(
            firstName: firstName.text,
            lastName: lastName.text,
            email: email.text,
            password: password.text,
            state: 'Uttar Pradesh');
      } else {
        await widget.session.signIn(email.text, password.text);
      }
    } catch (exception) {
      setState(
          () => error = exception.toString().replaceFirst('Bad state: ', ''));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: const Color(0xFFFBFAF2),
        body: SafeArea(
            child: Center(
                child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 420),
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Image.asset('assets/binz-logo.png',
                                  width: 132,
                                  height: 62,
                                  fit: BoxFit.contain,
                                  semanticLabel: 'BinZ'),
                              const SizedBox(height: 12),
                              Text(signUp ? 'Join BinZ' : 'Welcome back',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                      fontSize: 30,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF174E2A))),
                              const SizedBox(height: 6),
                              Text(
                                  signUp
                                      ? 'Create an account to manage pickups and rewards.'
                                      : 'Sign in to manage your pickups and rewards.',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                      color: Color(0xFF66756B))),
                              const SizedBox(height: 28),
                              if (!widget.session.configured)
                                Container(
                                    padding: const EdgeInsets.all(14),
                                    decoration: BoxDecoration(
                                        color: const Color(0xFFFFF0D9),
                                        borderRadius:
                                            BorderRadius.circular(14)),
                                    child: const Text(
                                        'Add your Render API URL when launching the app: --dart-define=BINZ_API_URL=https://your-service.onrender.com')),
                              if (widget.session.configured && signUp) ...[
                                TextField(
                                    controller: firstName,
                                    textCapitalization:
                                        TextCapitalization.words,
                                    decoration: InputDecoration(
                                        labelText: 'First name',
                                        border: OutlineInputBorder())),
                                const SizedBox(height: 12),
                                TextField(
                                    controller: lastName,
                                    textCapitalization:
                                        TextCapitalization.words,
                                    decoration: const InputDecoration(
                                        labelText: 'Last name',
                                        border: OutlineInputBorder())),
                                const SizedBox(height: 12)
                              ],
                              if (widget.session.configured) ...[
                                TextField(
                                    controller: email,
                                    keyboardType: TextInputType.emailAddress,
                                    style: const TextStyle(
                                        color: Color(0xFF1F3327),
                                        fontSize: 16,
                                        fontWeight: FontWeight.w500),
                                    decoration: const InputDecoration(
                                        labelText: 'Email',
                                        labelStyle: TextStyle(
                                            color: Color(0xFF476451),
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600),
                                        border: OutlineInputBorder())),
                                const SizedBox(height: 12),
                                TextField(
                                    controller: password,
                                    obscureText: true,
                                    decoration: InputDecoration(
                                        labelText: 'Password',
                                        helperText: signUp
                                            ? '8+ characters with upper/lowercase, number and symbol.'
                                            : null,
                                        border: OutlineInputBorder())),
                                const SizedBox(height: 18),
                                FilledButton(
                                    onPressed: loading ? null : submit,
                                    child: Padding(
                                        padding: const EdgeInsets.all(13),
                                        child: Text(loading
                                            ? 'Please wait…'
                                            : signUp
                                                ? 'Create account'
                                                : 'Sign in')))
                              ],
                              if (error != null)
                                Padding(
                                    padding: const EdgeInsets.only(top: 12),
                                    child: Text(error!,
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                            color: Colors.red))),
                              const SizedBox(height: 10),
                              TextButton(
                                  onPressed: loading
                                      ? null
                                      : () => setState(() {
                                            signUp = !signUp;
                                            error = null;
                                          }),
                                  child: Text(signUp
                                      ? 'Already have an account? Sign in'
                                      : 'New to BinZ? Create an account')),
                            ]))))),
      );
}
