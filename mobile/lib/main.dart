import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'core/theme/lumo_theme.dart';
import 'screens/auth/login_screen.dart';
import 'app/root_shell.dart';
import 'services/auth_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('pt_BR', null);
  runApp(const LumoGestaoApp());
}

class LumoGestaoApp extends StatelessWidget {
  const LumoGestaoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lumo Gestão',
      debugShowCheckedModeBanner: false,
      theme: LumoTheme.light(),
      home: const SessionGate(),
    );
  }
}

class SessionGate extends StatefulWidget {
  const SessionGate({super.key});
  @override
  State<SessionGate> createState() => _SessionGateState();
}

class _SessionGateState extends State<SessionGate> {
  final _auth = AuthService();
  bool? _authenticated;

  @override
  void initState() {
    super.initState();
    _restore();
  }

  Future<void> _restore() async {
    final ok = await _auth.hasValidSession();
    if (!mounted) return;
    setState(() => _authenticated = ok);
  }

  @override
  Widget build(BuildContext context) {
    if (_authenticated == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return _authenticated! ? const RootShell() : const LoginScreen();
  }
}
