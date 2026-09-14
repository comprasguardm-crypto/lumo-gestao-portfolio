import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/lumo_theme.dart';
import '../../models/app_notification.dart';
import '../../services/notification_service.dart';
import '../../widgets/loading_state.dart';
import '../../widgets/empty_state.dart';

class NotificacoesScreen extends StatefulWidget {
  const NotificacoesScreen({super.key});
  @override
  State<NotificacoesScreen> createState() => _NotificacoesScreenState();
}

class _NotificacoesScreenState extends State<NotificacoesScreen> {
  final _service = NotificationService();
  List<AppNotification>? _notifications;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await _service.listNotifications();
      if (!mounted) return;
      setState(() { _notifications = data; _error = null; });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('SupabaseApiException: ', ''));
    }
  }

  Future<void> _markRead(AppNotification notification) async {
    try {
      if (!notification.read) {
        await _service.markRead(notification.id);
        await _load();
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceFirst('SupabaseApiException: ', ''))));
      return;
    }
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Notificação'),
        content: Text(notification.message),
        actions: [TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Fechar'))],
      ),
    );
  }

  Future<void> _markAll() async {
    try {
      await _service.markAllRead();
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Todas as notificações foram marcadas como lidas.')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceFirst('SupabaseApiException: ', ''))));
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasUnread = _notifications?.any((n) => !n.read) ?? false;
    return Scaffold(
      backgroundColor: LumoColors.frost,
      appBar: AppBar(
        title: const Text('Notificações', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [if (hasUnread) TextButton(onPressed: _markAll, child: const Text('Marcar todas'))],
      ),
      body: _notifications == null && _error != null
          ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [Text(_error!, textAlign: TextAlign.center), const SizedBox(height: 12), ElevatedButton(onPressed: () { setState(() => _error = null); _load(); }, child: const Text('Tentar novamente'))])))
          : _notifications == null
          ? const LoadingState()
          : _notifications!.isEmpty
              ? const EmptyState(icon: Icons.notifications_none_rounded, title: 'Nenhuma notificação', description: 'Você está em dia.')
              : RefreshIndicator(
                  onRefresh: _load,
                  color: LumoColors.turquoise,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(20),
                    itemCount: _notifications!.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final n = _notifications![index];
                      return InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () => _markRead(n),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: n.read ? LumoColors.border : LumoColors.ai.withOpacity(0.3)),
                          ),
                          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Container(
                              margin: const EdgeInsets.only(top: 5),
                              height: 7,
                              width: 7,
                              decoration: BoxDecoration(color: n.read ? LumoColors.border : LumoColors.ai, shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 10),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(n.message, style: TextStyle(fontSize: 13, color: LumoColors.ink, fontWeight: n.read ? FontWeight.w400 : FontWeight.w600)),
                              const SizedBox(height: 4),
                              Text(DateFormat("d MMM, HH:mm", 'pt_BR').format(n.createdAt), style: const TextStyle(fontSize: 11, color: LumoColors.slate)),
                            ])),
                          ]),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
