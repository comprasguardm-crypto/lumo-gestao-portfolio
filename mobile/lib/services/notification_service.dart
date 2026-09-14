import '../core/network/supabase_api.dart';
import '../models/app_notification.dart';

class NotificationService {
  final SupabaseApi _api;
  NotificationService({SupabaseApi? api}) : _api = api ?? SupabaseApi();

  String _key(String id) => 'announcement:$id';

  Future<List<AppNotification>> listNotifications() async {
    final userId = await _api.currentUserId();
    if (userId == null) throw const SupabaseApiException('Sua sessão expirou. Entre novamente.');
    final context = await _api.backendContext();
    final profile = Map<String, dynamic>.from(context['profile'] as Map);
    final companyId = '${profile['company_id']}';
    final results = await Future.wait([
      _api.select('ponto_company_announcements', 'select=id,title,body,published_at,pinned,category&company_id=eq.${Uri.encodeComponent(companyId)}&active=eq.true&order=pinned.desc,published_at.desc&limit=100'),
      _api.select('ponto_notification_state', 'select=notification_key,read_at,dismissed_at&user_id=eq.${Uri.encodeComponent(userId)}'),
    ]);
    final announcements = results[0];
    final states = <String, Map<String, dynamic>>{};
    for (final raw in results[1]) {
      final row = Map<String, dynamic>.from(raw as Map);
      states['${row['notification_key']}'] = row;
    }
    return announcements.map((raw) {
      final row = Map<String, dynamic>.from(raw as Map);
      final id = '${row['id']}';
      final state = states[_key(id)];
      final title = '${row['title'] ?? ''}'.trim();
      final body = '${row['body'] ?? ''}'.trim();
      return AppNotification(
        id: id,
        message: title.isEmpty ? body : (body.isEmpty ? title : '$title\n$body'),
        createdAt: DateTime.parse('${row['published_at']}').toLocal(),
        read: state?['read_at'] != null,
      );
    }).toList();
  }

  Future<void> markRead(String id) async {
    final userId = await _api.currentUserId();
    if (userId == null) throw const SupabaseApiException('Sua sessão expirou. Entre novamente.');
    final key = _key(id);
    final existing = await _api.select('ponto_notification_state', 'select=user_id,notification_key&user_id=eq.${Uri.encodeComponent(userId)}&notification_key=eq.${Uri.encodeComponent(key)}&limit=1');
    final payload = {'read_at': DateTime.now().toUtc().toIso8601String(), 'updated_at': DateTime.now().toUtc().toIso8601String()};
    if (existing.isEmpty) {
      await _api.insert('ponto_notification_state', {'user_id': userId, 'notification_key': key, ...payload});
    } else {
      await _api.update('ponto_notification_state', 'user_id=eq.${Uri.encodeComponent(userId)}&notification_key=eq.${Uri.encodeComponent(key)}', payload);
    }
  }

  Future<void> markAllRead() async {
    final notifications = await listNotifications();
    for (final notification in notifications.where((n) => !n.read)) {
      await markRead(notification.id);
    }
  }

  Future<Map<String, bool>> getPreferences() async {
    final userId = await _api.currentUserId();
    if (userId == null) throw const SupabaseApiException('Sua sessão expirou. Entre novamente.');
    final rows = await _api.select('ponto_user_preferences', 'select=notification_config&user_id=eq.${Uri.encodeComponent(userId)}&limit=1');
    final config = rows.isEmpty ? <String, dynamic>{} : Map<String, dynamic>.from((Map<String, dynamic>.from(rows.first as Map)['notification_config'] as Map?) ?? const {});
    return {
      'point': config['point'] != false,
      'vacation': config['vacation'] != false,
      'documents': config['documents'] != false,
      'bank': config['bank'] != false,
    };
  }

  Future<void> savePreferences(Map<String, bool> config) async {
    final userId = await _api.currentUserId();
    if (userId == null) throw const SupabaseApiException('Sua sessão expirou. Entre novamente.');
    final context = await _api.backendContext();
    final profile = Map<String, dynamic>.from(context['profile'] as Map);
    final rows = await _api.select('ponto_user_preferences', 'select=user_id&user_id=eq.${Uri.encodeComponent(userId)}&limit=1');
    final payload = {
      'company_id': profile['company_id'],
      'notification_config': config,
      'updated_at': DateTime.now().toUtc().toIso8601String(),
    };
    if (rows.isEmpty) {
      await _api.insert('ponto_user_preferences', {'user_id': userId, ...payload});
    } else {
      await _api.update('ponto_user_preferences', 'user_id=eq.${Uri.encodeComponent(userId)}', payload);
    }
  }
}
