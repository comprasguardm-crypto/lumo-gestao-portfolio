import '../core/network/supabase_api.dart';

class AuthService {
  final SupabaseApi _api;
  AuthService({SupabaseApi? api}) : _api = api ?? SupabaseApi();

  Future<bool> login({required String email, required String password}) async {
    if (!email.trim().contains('@') || password.isEmpty) return false;
    await _api.signIn(email, password);
    final context = await _api.backendContext();
    if (context['employee'] == null) {
      await _api.signOut();
      throw const SupabaseApiException('Seu acesso existe, mas ainda não está vinculado a um colaborador ativo. Fale com o RH.');
    }
    return true;
  }

  Future<bool> hasValidSession() async {
    if (!await _api.hasSession()) return false;
    try {
      final context = await _api.backendContext();
      final employee = context['employee'] as Map<String, dynamic>?;
      if (employee == null) {
        await _api.signOut();
        return false;
      }
      return true;
    } catch (_) {
      await _api.clearSession();
      return false;
    }
  }

  Future<bool> requestPasswordReset(String email) async {
    if (!email.trim().contains('@')) return false;
    await _api.recoverPassword(email);
    return true;
  }

  Future<bool> changePassword(String currentPassword, String newPassword) async {
    if (currentPassword.isEmpty || newPassword.length < 8) return false;
    final email = await _api.currentEmail();
    if (email == null) return false;
    await _api.signIn(email, currentPassword);
    await _api.updatePassword(newPassword);
    return true;
  }

  Future<void> logout() => _api.signOut();
}
