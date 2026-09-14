import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/lumo_theme.dart';
import '../../models/employee.dart';
import '../../services/employee_service.dart';
import '../../services/auth_service.dart';
import '../../services/notification_service.dart';
import '../../widgets/loading_state.dart';
import '../auth/login_screen.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});
  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  final _service = EmployeeService();
  final _authService = AuthService();
  final _notificationService = NotificationService();
  Employee? _employee;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await _service.getCurrentEmployee();
      if (!mounted) return;
      setState(() { _employee = data; _error = null; });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('SupabaseApiException: ', ''));
    }
  }

  Future<void> _changePassword() async {
    final current = TextEditingController();
    final next = TextEditingController();
    final confirm = TextEditingController();
    final submit = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Alterar senha'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: current, obscureText: true, decoration: const InputDecoration(labelText: 'Senha atual')),
          const SizedBox(height: 10),
          TextField(controller: next, obscureText: true, decoration: const InputDecoration(labelText: 'Nova senha')),
          const SizedBox(height: 10),
          TextField(controller: confirm, obscureText: true, decoration: const InputDecoration(labelText: 'Confirmar nova senha')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancelar')),
          ElevatedButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Salvar')),
        ],
      ),
    );
    if (submit != true || !mounted) return;
    if (next.text != confirm.text) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('As novas senhas nÃ£o conferem.')));
      return;
    }
    try {
      final success = await _authService.changePassword(current.text, next.text);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(success ? 'Senha alterada com sucesso.' : 'Verifique a senha atual e use pelo menos 8 caracteres.')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceFirst('SupabaseApiException: ', ''))));
    }
  }

  Future<void> _notificationPreferences() async {
    Map<String, bool> config;
    try {
      config = await _notificationService.getPreferences();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceFirst('SupabaseApiException: ', ''))));
      return;
    }
    bool point = config['point'] ?? true;
    bool vacation = config['vacation'] ?? true;
    bool documents = config['documents'] ?? true;
    bool bank = config['bank'] ?? true;
    if (!mounted) return;
    final save = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(builder: (context, setDialogState) => AlertDialog(
        title: const Text('PreferÃªncias de notificaÃ§Ã£o'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Ponto'), value: point, onChanged: (value) => setDialogState(() => point = value)),
          SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('FÃ©rias'), value: vacation, onChanged: (value) => setDialogState(() => vacation = value)),
          SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Documentos'), value: documents, onChanged: (value) => setDialogState(() => documents = value)),
          SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Banco de horas'), value: bank, onChanged: (value) => setDialogState(() => bank = value)),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancelar')),
          ElevatedButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Salvar')),
        ],
      )),
    );
    if (save != true) return;
    try {
      await _notificationService.savePreferences({'point': point, 'vacation': vacation, 'documents': documents, 'bank': bank});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PreferÃªncias salvas.')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceFirst('SupabaseApiException: ', ''))));
    }
  }

  void _help() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Ajuda e suporte'),
        content: const Text('Para dÃºvidas sobre ponto, fÃ©rias, documentos ou acesso, entre em contato com o RH da sua empresa.\n\nO suporte do Lumo pode orientar sobre acesso ao aplicativo; dÃºvidas trabalhistas e operacionais devem ser tratadas pelo RH da sua empresa.'),
        actions: [TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Fechar'))],
      ),
    );
  }

  Future<void> _openPrivacyPolicy() async {
    final uri = Uri.parse('https://lumo-gestao.vercel.app/privacidade');
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não foi possível abrir a Política de Privacidade.')),
      );
    }
  }

  Future<void> _openDataDeletion() async {
    final uri = Uri.parse('https://lumo-gestao.vercel.app/exclusao-de-dados');
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não foi possível abrir a página de exclusão de dados.')),
      );
    }
  }
  Future<void> _logout() async {
    await _authService.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const LoginScreen()), (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LumoColors.frost,
      appBar: AppBar(title: const Text('Perfil', style: TextStyle(fontWeight: FontWeight.w700))),
      body: _employee == null && _error != null
          ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [Text(_error!, textAlign: TextAlign.center), const SizedBox(height: 12), ElevatedButton(onPressed: _load, child: const Text('Tentar novamente'))])))
          : _employee == null ? const LoadingState() : ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(child: Column(children: [
            Container(height: 72, width: 72, decoration: BoxDecoration(color: LumoColors.ink, borderRadius: BorderRadius.circular(999)), alignment: Alignment.center, child: Text(_employee!.initials, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700))),
            const SizedBox(height: 12),
            Text(_employee!.name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: LumoColors.ink)),
            Text('${_employee!.role} Â· ${_employee!.department}', style: const TextStyle(fontSize: 12.5, color: LumoColors.slate)),
          ])),
          const SizedBox(height: 28),
          _infoTile(Icons.badge_outlined, 'MatrÃ­cula', _employee!.matricula),
          _infoTile(Icons.mail_outline_rounded, 'E-mail', _employee!.email),
          _infoTile(Icons.phone_outlined, 'Telefone', _employee!.phone),
          _infoTile(Icons.apartment_rounded, 'Filial', _employee!.branch),
          const SizedBox(height: 20),
          _menuTile(Icons.lock_outline_rounded, 'Alterar senha', _changePassword),
          _menuTile(Icons.notifications_none_rounded, 'PreferÃªncias de notificaÃ§Ã£o', _notificationPreferences),
          _menuTile(Icons.help_outline_rounded, 'Ajuda e suporte', _help),
          _menuTile(Icons.privacy_tip_outlined, 'Política de Privacidade', _openPrivacyPolicy),
          _menuTile(Icons.delete_outline_rounded, 'Exclusão e correção de dados', _openDataDeletion),
          const SizedBox(height: 8),
          _menuTile(Icons.logout_rounded, 'Sair', _logout, color: LumoColors.danger),
        ],
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value) => Container(
    margin: const EdgeInsets.only(bottom: 8),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: LumoColors.border)),
    child: Row(children: [Icon(icon, size: 18, color: LumoColors.slate), const SizedBox(width: 12), Text(label, style: const TextStyle(fontSize: 12.5, color: LumoColors.slate)), const Spacer(), Flexible(child: Text(value, textAlign: TextAlign.right, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: LumoColors.ink)))]),
  );

  Widget _menuTile(IconData icon, String label, VoidCallback onTap, {Color color = LumoColors.ink}) => Container(
    margin: const EdgeInsets.only(bottom: 8),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: LumoColors.border)),
    child: ListTile(leading: Icon(icon, color: color, size: 20), title: Text(label, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w600)), trailing: const Icon(Icons.chevron_right_rounded, color: LumoColors.slate, size: 18), onTap: onTap),
  );
}
