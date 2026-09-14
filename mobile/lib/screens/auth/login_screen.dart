import 'package:flutter/material.dart';
import '../../core/theme/lumo_theme.dart';
import '../../services/auth_service.dart';
import '../../app/root_shell.dart';
import '../../widgets/lumo_logo.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  Future<void> _handleLogin() async {
    if (_emailController.text.trim().isEmpty || _passwordController.text.isEmpty) {
      setState(() => _error = 'Informe e-mail e senha.');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final success = await _authService.login(email: _emailController.text, password: _passwordController.text);
      if (!mounted) return;
      if (success) Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const RootShell()));
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('SupabaseApiException: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _forgotPassword() async {
    final email = TextEditingController(text: _emailController.text);
    final submitted = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Recuperar senha'),
        content: TextField(
          controller: email,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'E-mail corporativo'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancelar')),
          ElevatedButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Enviar link')),
        ],
      ),
    );
    if (submitted != true || !mounted) return;
    try {
      final success = await _authService.requestPasswordReset(email.text);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(success ? 'Link de recuperaÃ§Ã£o enviado para ${email.text}.' : 'Informe um e-mail vÃ¡lido.')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceFirst('SupabaseApiException: ', ''))));
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LumoColors.inkDeep,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned(
              top: -120,
              right: -100,
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: LumoColors.turquoise.withValues(alpha: 0.08),
                ),
              ),
            ),
            Positioned(
              bottom: -160,
              left: -120,
              child: Container(
                width: 330,
                height: 330,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: LumoColors.lime.withValues(alpha: 0.06),
                ),
              ),
            ),
            LayoutBuilder(
              builder: (context, constraints) => SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight - 48),
                  child: IntrinsicHeight(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Spacer(),
                        const Center(child: LumoBrand(dark: true)),
                        const SizedBox(height: 10),
                        const Text(
                          'Ponto, fÃ©rias, documentos e sua jornada em um sÃ³ lugar.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                        const SizedBox(height: 30),
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: const [
                              BoxShadow(color: Color(0x33000000), blurRadius: 30, offset: Offset(0, 16)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Text('Entrar', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: LumoColors.ink)),
                              const SizedBox(height: 4),
                              const Text('Use o acesso fornecido pelo RH da sua empresa.', style: TextStyle(color: LumoColors.slate, fontSize: 12.5)),
                              const SizedBox(height: 20),
                              TextField(
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                textInputAction: TextInputAction.next,
                                decoration: const InputDecoration(labelText: 'E-mail corporativo', prefixIcon: Icon(Icons.mail_outline_rounded, size: 20)),
                              ),
                              const SizedBox(height: 12),
                              TextField(
                                controller: _passwordController,
                                obscureText: _obscure,
                                textInputAction: TextInputAction.done,
                                onSubmitted: (_) { if (!_loading) _handleLogin(); },
                                decoration: InputDecoration(
                                  labelText: 'Senha',
                                  prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20),
                                  suffixIcon: IconButton(icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20), onPressed: () => setState(() => _obscure = !_obscure)),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Align(
                                alignment: Alignment.centerRight,
                                child: TextButton(
                                  onPressed: _loading ? null : _forgotPassword,
                                  child: const Text('Esqueci minha senha', style: TextStyle(color: LumoColors.slate, fontSize: 12.5)),
                                ),
                              ),
                              if (_error != null) ...[
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(10)),
                                  child: Text(_error!, style: const TextStyle(color: Color(0xFFBE123C), fontSize: 12)),
                                ),
                                const SizedBox(height: 12),
                              ],
                              ElevatedButton(
                                onPressed: _loading ? null : _handleLogin,
                                child: _loading
                                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                    : const Text('Entrar'),
                              ),
                            ],
                          ),
                        ),
                        const Spacer(flex: 2),
                        const Text('NÃ£o tem acesso ainda? Fale com o RH da sua empresa.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white60, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
