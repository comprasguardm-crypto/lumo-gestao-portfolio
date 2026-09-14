import 'package:url_launcher/url_launcher.dart';
import '../core/network/supabase_api.dart';
import '../models/document.dart';

class DocumentService {
  final SupabaseApi _api;
  DocumentService({SupabaseApi? api}) : _api = api ?? SupabaseApi();

  DocumentCategory _category(String value) {
    switch (value) {
      case 'contratos': return DocumentCategory.contratos;
      case 'atestados': return DocumentCategory.atestados;
      case 'termos': return DocumentCategory.termos;
      case 'politicas': return DocumentCategory.politicas;
      case 'holerite': return DocumentCategory.holerite;
      default: return DocumentCategory.pessoais;
    }
  }

  DocumentStatus _status(String value, DateTime? expiresAt) {
    if (expiresAt != null && expiresAt.isBefore(DateTime.now())) return DocumentStatus.vencido;
    switch (value) {
      case 'signed': case 'assinado': return DocumentStatus.assinado;
      case 'awaiting_signature': case 'aguardando_assinatura': return DocumentStatus.aguardandoAssinatura;
      case 'pending': case 'pendente': return DocumentStatus.pendente;
      case 'new': case 'novo': return DocumentStatus.novo;
      case 'expired': case 'vencido': return DocumentStatus.vencido;
      default: return DocumentStatus.disponivel;
    }
  }

  Future<List<EmployeeDocument>> listDocuments() async {
    final context = await _api.backendContext();
    final profile = Map<String, dynamic>.from(context['profile'] as Map);
    final employee = context['employee'] as Map<String, dynamic>?;
    if (employee == null) throw const SupabaseApiException('Seu usuário não está vinculado a um colaborador ativo.');
    final companyId = '${profile['company_id']}';
    final employeeId = '${employee['id']}';
    final rows = await _api.select(
      'ponto_employee_documents',
      'select=id,title,category,document_status,created_at,file_name,storage_path,expires_at&company_id=eq.${Uri.encodeComponent(companyId)}&employee_id=eq.${Uri.encodeComponent(employeeId)}&order=created_at.desc',
    );
    return rows.map((raw) {
      final row = Map<String, dynamic>.from(raw as Map);
      final expires = row['expires_at'] == null ? null : DateTime.tryParse('${row['expires_at']}');
      return EmployeeDocument(
        id: '${row['id']}',
        title: '${row['title']}',
        category: _category('${row['category']}'),
        status: _status('${row['document_status']}', expires),
        updatedAt: DateTime.parse('${row['created_at']}').toLocal(),
        fileName: row['file_name'] == null ? null : '${row['file_name']}',
        storagePath: row['storage_path'] == null ? null : '${row['storage_path']}',
        expiresAt: expires,
      );
    }).toList();
  }

  Future<void> openDocument(EmployeeDocument document) async {
    if (document.storagePath == null || document.storagePath!.isEmpty) throw const SupabaseApiException('Arquivo não encontrado para este documento.');
    final url = await _api.signedStorageUrl('ponto-documents', document.storagePath!, expiresIn: 300);
    final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    if (!ok) throw const SupabaseApiException('Não foi possível abrir o documento neste aparelho.');
  }
}
