import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class SupabaseApiException implements Exception {
  final String message;
  final int? statusCode;
  const SupabaseApiException(this.message, [this.statusCode]);
  @override
  String toString() => message;
}

class SupabaseApi {
  static const url = String.fromEnvironment('SUPABASE_URL', defaultValue: '');
  static const publishableKey = String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY', defaultValue: '');
  static const passwordResetRedirectUrl = String.fromEnvironment('PASSWORD_RESET_REDIRECT_URL', defaultValue: '');

  static const _accessKey = 'lumo.auth.access_token';
  static const _refreshKey = 'lumo.auth.refresh_token';
  static const _expiresKey = 'lumo.auth.expires_at';
  static const _userIdKey = 'lumo.auth.user_id';
  static const _emailKey = 'lumo.auth.email';

  final http.Client _client;
  SupabaseApi({http.Client? client}) : _client = client ?? http.Client();

  void _assertConfig() {
    if (url.isEmpty || publishableKey.isEmpty) {
      throw const SupabaseApiException('Configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no build.');
    }
  }

  String _friendly(String raw) {
    final value = raw.toLowerCase();
    if (value.contains('invalid login credentials')) return 'E-mail ou senha inválidos.';
    if (value.contains('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
    if (value.contains('jwt') || value.contains('token') || value.contains('session')) return 'Sua sessão expirou. Entre novamente.';
    if (value.contains('permission denied') || value.contains('row-level security') || value.contains('forbidden')) return 'Você não possui permissão para realizar esta ação.';
    return raw;
  }

  dynamic _decode(http.Response response) {
    dynamic data;
    try {
      data = response.body.isEmpty ? null : jsonDecode(response.body);
    } catch (_) {
      data = response.body;
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      String raw = 'Não foi possível concluir a operação.';
      if (data is Map) raw = '${data['msg'] ?? data['message'] ?? data['error_description'] ?? data['error'] ?? raw}';
      throw SupabaseApiException(_friendly(raw), response.statusCode);
    }
    return data;
  }

  Future<void> _storeSession(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    final expiresIn = (data['expires_in'] as num?)?.toInt() ?? 3600;
    final user = data['user'] as Map<String, dynamic>? ?? const {};
    await prefs.setString(_accessKey, '${data['access_token'] ?? ''}');
    await prefs.setString(_refreshKey, '${data['refresh_token'] ?? ''}');
    await prefs.setInt(_expiresKey, DateTime.now().millisecondsSinceEpoch ~/ 1000 + expiresIn);
    if (user['id'] != null) await prefs.setString(_userIdKey, '${user['id']}');
    if (user['email'] != null) await prefs.setString(_emailKey, '${user['email']}');
  }

  Future<Map<String, dynamic>> signIn(String email, String password) async {
    _assertConfig();
    final response = await _client.post(
      Uri.parse('$url/auth/v1/token?grant_type=password'),
      headers: {'apikey': publishableKey, 'Content-Type': 'application/json'},
      body: jsonEncode({'email': email.trim().toLowerCase(), 'password': password}),
    );
    final data = Map<String, dynamic>.from(_decode(response) as Map);
    await _storeSession(data);
    return data;
  }

  Future<void> recoverPassword(String email) async {
    _assertConfig();
    final endpoint = passwordResetRedirectUrl.isEmpty
        ? '$url/auth/v1/recover'
        : '$url/auth/v1/recover?redirect_to=${Uri.encodeComponent(passwordResetRedirectUrl)}';
    final response = await _client.post(endpoint,
      headers: {'apikey': publishableKey, 'Content-Type': 'application/json'},
      body: jsonEncode({'email': email.trim().toLowerCase()}),
    );
    _decode(response);
  }

  Future<String?> currentEmail() async => (await SharedPreferences.getInstance()).getString(_emailKey);
  Future<String?> currentUserId() async => (await SharedPreferences.getInstance()).getString(_userIdKey);

  Future<String?> accessToken({bool refreshIfNeeded = true}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_accessKey);
    final expires = prefs.getInt(_expiresKey) ?? 0;
    if (token == null || token.isEmpty) return null;
    if (refreshIfNeeded && expires <= DateTime.now().millisecondsSinceEpoch ~/ 1000 + 60) {
      try {
        return await refreshSession();
      } catch (_) {
        await clearSession();
        return null;
      }
    }
    return token;
  }

  Future<String> refreshSession() async {
    _assertConfig();
    final prefs = await SharedPreferences.getInstance();
    final refresh = prefs.getString(_refreshKey);
    if (refresh == null || refresh.isEmpty) throw const SupabaseApiException('Sua sessão expirou. Entre novamente.');
    final response = await _client.post(
      Uri.parse('$url/auth/v1/token?grant_type=refresh_token'),
      headers: {'apikey': publishableKey, 'Content-Type': 'application/json'},
      body: jsonEncode({'refresh_token': refresh}),
    );
    final data = Map<String, dynamic>.from(_decode(response) as Map);
    await _storeSession(data);
    return '${data['access_token']}';
  }

  Future<bool> hasSession() async => (await accessToken()) != null;

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    for (final key in [_accessKey, _refreshKey, _expiresKey, _userIdKey, _emailKey]) {
      await prefs.remove(key);
    }
  }

  Future<void> signOut() async {
    _assertConfig();
    final token = await accessToken(refreshIfNeeded: false);
    if (token != null) {
      try {
        await _client.post(Uri.parse('$url/auth/v1/logout'), headers: {'apikey': publishableKey, 'Authorization': 'Bearer $token'});
      } catch (_) {}
    }
    await clearSession();
  }

  Future<void> updatePassword(String password) async {
    final response = await _authorizedRequest('PUT', '/auth/v1/user', body: {'password': password});
    _decode(response);
  }

  Future<http.Response> _authorizedRequest(String method, String path, {Object? body, Map<String, String>? extraHeaders}) async {
    _assertConfig();
    final token = await accessToken();
    if (token == null) throw const SupabaseApiException('Sua sessão expirou. Entre novamente.');
    final request = http.Request(method, Uri.parse('$url$path'));
    request.headers.addAll({'apikey': publishableKey, 'Authorization': 'Bearer $token', if (body != null) 'Content-Type': 'application/json', ...?extraHeaders});
    if (body != null) request.body = jsonEncode(body);
    final streamed = await _client.send(request);
    return http.Response.fromStream(streamed);
  }

  Future<List<dynamic>> select(String table, String query) async {
    final response = await _authorizedRequest('GET', '/rest/v1/$table?$query');
    final data = _decode(response);
    return List<dynamic>.from(data as List);
  }

  Future<Map<String, dynamic>> insert(String table, Map<String, dynamic> value) async {
    final response = await _authorizedRequest('POST', '/rest/v1/$table', body: value, extraHeaders: {'Prefer': 'return=representation'});
    final data = List<dynamic>.from(_decode(response) as List);
    if (data.isEmpty) throw const SupabaseApiException('O registro não foi salvo.');
    return Map<String, dynamic>.from(data.first as Map);
  }

  Future<Map<String, dynamic>> update(String table, String filters, Map<String, dynamic> value) async {
    final response = await _authorizedRequest('PATCH', '/rest/v1/$table?$filters', body: value, extraHeaders: {'Prefer': 'return=representation'});
    final data = List<dynamic>.from(_decode(response) as List);
    if (data.isEmpty) throw const SupabaseApiException('Nenhum registro foi atualizado.');
    return Map<String, dynamic>.from(data.first as Map);
  }

  Future<Map<String, dynamic>> invoke(String slug, Map<String, dynamic> body) async {
    final response = await _authorizedRequest('POST', '/functions/v1/$slug', body: body);
    return Map<String, dynamic>.from(_decode(response) as Map);
  }

  Future<String> signedStorageUrl(String bucket, String path, {int expiresIn = 300}) async {
    final encodedPath = path.split('/').map(Uri.encodeComponent).join('/');
    final response = await _authorizedRequest('POST', '/storage/v1/object/sign/${Uri.encodeComponent(bucket)}/$encodedPath', body: {'expiresIn': expiresIn});
    final data = Map<String, dynamic>.from(_decode(response) as Map);
    final relative = '${data['signedURL'] ?? data['signedUrl'] ?? ''}';
    if (relative.isEmpty) throw const SupabaseApiException('Não foi possível abrir este documento.');
    return relative.startsWith('http') ? relative : '$url/storage/v1${relative.startsWith('/') ? '' : '/'}$relative';
  }

  Future<Map<String, dynamic>> backendContext() async {
    final userId = await currentUserId();
    if (userId == null) throw const SupabaseApiException('Sua sessão expirou. Entre novamente.');
    final profiles = await select('ponto_profiles', 'select=user_id,company_id,full_name,role,active&user_id=eq.${Uri.encodeComponent(userId)}&limit=1');
    if (profiles.isEmpty) throw const SupabaseApiException('Seu usuário não está vinculado a uma empresa ativa.');
    final profile = Map<String, dynamic>.from(profiles.first as Map);
    if (profile['active'] != true || profile['company_id'] == null) throw const SupabaseApiException('Seu usuário não está vinculado a uma empresa ativa.');
    final companyId = '${profile['company_id']}';
    final results = await Future.wait([
      select('ponto_employees', 'select=id,name,linked_user_id,work_email,function,department,admission_date,active,company_id&company_id=eq.${Uri.encodeComponent(companyId)}&linked_user_id=eq.${Uri.encodeComponent(userId)}&active=eq.true&limit=1'),
      select('ponto_companies', 'select=id,trade_name,legal_name,status&id=eq.${Uri.encodeComponent(companyId)}&limit=1'),
    ]);
    final employees = results[0];
    final companies = results[1];
    return {
      'profile': profile,
      'employee': employees.isEmpty ? null : Map<String, dynamic>.from(employees.first as Map),
      'company': companies.isEmpty ? null : Map<String, dynamic>.from(companies.first as Map),
    };
  }
}
