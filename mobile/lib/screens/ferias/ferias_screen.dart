import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/lumo_theme.dart';
import '../../models/vacation.dart';
import '../../services/vacation_service.dart';
import '../../widgets/loading_state.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/status_chip.dart';
import '../../widgets/section_header.dart';

class FeriasScreen extends StatefulWidget {
  const FeriasScreen({super.key});
  @override
  State<FeriasScreen> createState() => _FeriasScreenState();
}

class _FeriasScreenState extends State<FeriasScreen> {
  final _service = VacationService();
  VacationBalance? _balance;
  List<Vacation>? _vacations;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final results = await Future.wait([_service.getBalance(), _service.listVacations()]);
      if (!mounted) return;
      setState(() { _balance = results[0] as VacationBalance; _vacations = results[1] as List<Vacation>; _error = null; });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('SupabaseApiException: ', ''));
    }
  }

  StatusChip _chipFor(VacationStatus status) {
    switch (status) {
      case VacationStatus.aprovada: return StatusChip.success('Aprovada');
      case VacationStatus.agendada: return StatusChip.info('Agendada');
      case VacationStatus.emAnalise: return StatusChip.warning('Em análise');
      case VacationStatus.rejeitada: return StatusChip.danger('Rejeitada');
      case VacationStatus.cancelada: return const StatusChip(label: 'Cancelada', color: LumoColors.slate);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LumoColors.frost,
      appBar: AppBar(title: const Text('Férias', style: TextStyle(fontWeight: FontWeight.w700))),
      body: (_balance == null || _vacations == null) && _error != null
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.error_outline_rounded, color: LumoColors.danger, size: 42),
                  const SizedBox(height: 12),
                  Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: LumoColors.ink)),
                  const SizedBox(height: 14),
                  ElevatedButton(onPressed: () { setState(() => _error = null); _load(); }, child: const Text('Tentar novamente')),
                ]),
              ),
            )
          : _balance == null || _vacations == null ? const LoadingState() : RefreshIndicator(
        onRefresh: _load,
        color: LumoColors.turquoise,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            if (_error != null) ...[
              Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(10)), child: Text(_error!, style: const TextStyle(color: Color(0xFFBE123C), fontSize: 12))),
              const SizedBox(height: 12),
            ],
            _buildBalanceCard(),
            const SizedBox(height: 24),
            SectionHeader(title: 'Solicitações', actionLabel: 'Solicitar', onAction: () => _showRequestSheet(context)),
            if (_vacations!.isEmpty)
              const EmptyState(icon: Icons.beach_access_rounded, title: 'Nenhuma solicitação registrada')
            else
              ..._vacations!.map((v) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: LumoColors.border)),
                child: Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('${DateFormat('dd/MM/yyyy').format(v.startDate)} – ${DateFormat('dd/MM/yyyy').format(v.endDate)}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: LumoColors.ink)),
                    const SizedBox(height: 2),
                    Text('${v.days} dias', style: const TextStyle(fontSize: 12, color: LumoColors.slate)),
                  ])),
                  _chipFor(v.status),
                ]),
              )),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard() {
    final balance = _balance!;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(gradient: const LinearGradient(colors: [LumoColors.ink, Color(0xFF1E293B)]), borderRadius: BorderRadius.circular(16)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Dias disponíveis', style: TextStyle(color: Colors.white70, fontSize: 12)),
        const SizedBox(height: 4),
        Text('${balance.availableDays} dias', style: const TextStyle(color: LumoColors.turquoise, fontSize: 30, fontWeight: FontWeight.w800)),
        const SizedBox(height: 14),
        Row(children: [_balanceStat('Total', '${balance.totalDays}'), _balanceStat('Agendados', '${balance.scheduledDays}'), _balanceStat('Vencimento', DateFormat('MM/yyyy').format(balance.acquisitionPeriodEnd))]),
      ]),
    );
  }

  Widget _balanceStat(String label, String value) => Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)), Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11))]));

  Future<void> _showRequestSheet(BuildContext context) async {
    DateTime? startDate;
    final daysController = TextEditingController(text: '15');
    bool saving = false;
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (sheetContext) => StatefulBuilder(builder: (context, setSheetState) {
        Future<void> submit() async {
          final days = int.tryParse(daysController.text) ?? 0;
          if (startDate == null || days < 1 || days > 30) {
            ScaffoldMessenger.of(this.context).showSnackBar(const SnackBar(content: Text('Informe uma data e uma quantidade entre 1 e 30 dias.')));
            return;
          }
          setSheetState(() => saving = true);
          try {
            final success = await _service.requestVacation(startDate: startDate!, days: days);
            if (!mounted) return;
            if (success && sheetContext.mounted) Navigator.of(sheetContext).pop();
            await _load();
            if (!mounted) return;
            ScaffoldMessenger.of(this.context).showSnackBar(SnackBar(content: Text(success ? 'Solicitação enviada ao RH.' : 'Não foi possível enviar a solicitação.')));
          } catch (e) {
            if (!mounted) return;
            setSheetState(() => saving = false);
            ScaffoldMessenger.of(this.context).showSnackBar(SnackBar(content: Text(e.toString().replaceFirst('SupabaseApiException: ', ''))));
          }
        }
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 20, left: 20, right: 20, top: 20),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const Text('Solicitar férias', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: LumoColors.ink)),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () async {
                final picked = await showDatePicker(context: sheetContext, initialDate: DateTime.now().add(const Duration(days: 30)), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 730)));
                if (picked != null) setSheetState(() => startDate = picked);
              },
              icon: const Icon(Icons.calendar_month_rounded),
              label: Text(startDate == null ? 'Selecionar data de início' : DateFormat('dd/MM/yyyy').format(startDate!)),
            ),
            const SizedBox(height: 12),
            TextField(controller: daysController, decoration: const InputDecoration(labelText: 'Quantidade de dias'), keyboardType: TextInputType.number),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: saving ? null : submit, child: saving ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Enviar solicitação')),
          ]),
        );
      }),
    );
    daysController.dispose();
  }
}
