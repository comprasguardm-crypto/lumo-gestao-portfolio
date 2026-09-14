import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/lumo_theme.dart';
import '../../models/document.dart';
import '../../services/document_service.dart';
import '../../widgets/loading_state.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/status_chip.dart';

class DocumentosScreen extends StatefulWidget {
  const DocumentosScreen({super.key});
  @override
  State<DocumentosScreen> createState() => _DocumentosScreenState();
}

class _DocumentosScreenState extends State<DocumentosScreen> {
  final _service = DocumentService();
  List<EmployeeDocument>? _documents;
  String? _error;
  String? _openingId;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await _service.listDocuments();
      if (!mounted) return;
      setState(() { _documents = data; _error = null; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _documents ??= []; _error = e.toString().replaceFirst('SupabaseApiException: ', ''); });
    }
  }

  Future<void> _open(EmployeeDocument document) async {
    setState(() { _openingId = document.id; _error = null; });
    try {
      await _service.openDocument(document);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('SupabaseApiException: ', ''));
    } finally {
      if (mounted) setState(() => _openingId = null);
    }
  }

  IconData _iconFor(DocumentCategory category) {
    switch (category) {
      case DocumentCategory.contratos: return Icons.description_rounded;
      case DocumentCategory.atestados: return Icons.medical_information_outlined;
      case DocumentCategory.pessoais: return Icons.badge_outlined;
      case DocumentCategory.termos: return Icons.fact_check_outlined;
      case DocumentCategory.politicas: return Icons.policy_outlined;
      case DocumentCategory.holerite: return Icons.receipt_long_rounded;
    }
  }

  StatusChip _chipFor(DocumentStatus status) {
    switch (status) {
      case DocumentStatus.assinado: return StatusChip.success('Assinado');
      case DocumentStatus.aguardandoAssinatura: return StatusChip.warning('Aguardando assinatura');
      case DocumentStatus.vencido: return StatusChip.danger('Vencido');
      case DocumentStatus.pendente: return const StatusChip(label: 'Pendente', color: LumoColors.slate);
      case DocumentStatus.disponivel: return StatusChip.info('Disponível');
      case DocumentStatus.novo: return StatusChip.info('Novo');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LumoColors.frost,
      appBar: AppBar(title: const Text('Documentos', style: TextStyle(fontWeight: FontWeight.w700))),
      body: _documents == null
          ? const LoadingState()
          : RefreshIndicator(
              onRefresh: _load,
              color: LumoColors.turquoise,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  if (_error != null) ...[
                    Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(10)), child: Text(_error!, style: const TextStyle(color: Color(0xFFBE123C), fontSize: 12))),
                    const SizedBox(height: 12),
                  ],
                  if (_documents!.isEmpty)
                    const EmptyState(icon: Icons.description_rounded, title: 'Nenhum documento disponível', description: 'Os documentos liberados pelo RH aparecerão aqui.')
                  else
                    ..._documents!.map((doc) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: LumoColors.border)),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: _openingId == null ? () => _open(doc) : null,
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Row(children: [
                            Container(height: 40, width: 40, decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)), child: Icon(_iconFor(doc.category), size: 18, color: LumoColors.ink)),
                            const SizedBox(width: 12),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(doc.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: LumoColors.ink)),
                              const SizedBox(height: 2),
                              Text(doc.fileName ?? 'Arquivo protegido', style: const TextStyle(fontSize: 11, color: LumoColors.slate), overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 2),
                              Text(doc.expiresAt == null ? 'Atualizado em ${DateFormat('dd/MM/yyyy').format(doc.updatedAt)}' : 'Vencimento: ${DateFormat('dd/MM/yyyy').format(doc.expiresAt!)}', style: const TextStyle(fontSize: 11, color: LumoColors.slate)),
                            ])),
                            const SizedBox(width: 8),
                            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                              _chipFor(doc.status),
                              const SizedBox(height: 8),
                              _openingId == doc.id ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.open_in_new_rounded, size: 16, color: LumoColors.slate),
                            ]),
                          ]),
                        ),
                      ),
                    )),
                ],
              ),
            ),
    );
  }
}
