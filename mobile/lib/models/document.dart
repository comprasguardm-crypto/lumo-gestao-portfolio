enum DocumentCategory { contratos, atestados, pessoais, termos, politicas, holerite }
enum DocumentStatus { assinado, aguardandoAssinatura, vencido, pendente, disponivel, novo }

class EmployeeDocument {
  final String id;
  final String title;
  final DocumentCategory category;
  final DocumentStatus status;
  final DateTime updatedAt;
  final String? fileName;
  final String? storagePath;
  final DateTime? expiresAt;

  const EmployeeDocument({
    required this.id,
    required this.title,
    required this.category,
    required this.status,
    required this.updatedAt,
    this.fileName,
    this.storagePath,
    this.expiresAt,
  });
}
