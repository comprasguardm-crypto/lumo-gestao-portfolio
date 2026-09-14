import 'package:flutter/material.dart';
import '../../core/theme/lumo_theme.dart';
import '../../models/employee.dart';
import '../../services/employee_service.dart';
import '../../services/notification_service.dart';
import '../../services/hour_bank_service.dart';
import '../../widgets/section_header.dart';
import '../../widgets/loading_state.dart';
import '../notificacoes/notificacoes_screen.dart';
import '../ponto/ponto_screen.dart';
import '../ferias/ferias_screen.dart';
import '../documentos/documentos_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _employeeService = EmployeeService();
  final _notificationService = NotificationService();
  final _hourBankService = HourBankService();

  Employee? _employee;
  int _unreadCount = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([
      _employeeService.getCurrentEmployee(),
      _notificationService.listNotifications(),
      _hourBankService.listEntries(),
    ]);
    final employee = results[0] as Employee;
    final notifications = results[1] as List;
    if (!mounted) return;
    setState(() {
      _employee = employee;
      _unreadCount = notifications.where((n) => !n.read).length;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LumoColors.frost,
      body: SafeArea(
        child: _loading
            ? const LoadingState()
            : RefreshIndicator(
                onRefresh: _load,
                color: LumoColors.turquoise,
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                  children: [
                    _buildHeader(context),
                    const SizedBox(height: 20),
                    _buildClockInCard(context),
                    const SizedBox(height: 24),
                    const SectionHeader(title: 'Acesso rápido'),
                    _buildQuickAccessGrid(context),
                    const SizedBox(height: 24),
                    const SectionHeader(title: 'Banco de horas'),
                    _buildHourBankSummary(),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final firstName = _employee?.name.split(' ').first ?? '';
    return Row(
      children: [
        Container(
          height: 44,
          width: 44,
          decoration: BoxDecoration(color: LumoColors.ink, borderRadius: BorderRadius.circular(999)),
          alignment: Alignment.center,
          child: Text(
            _employee?.initials ?? '',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Olá, $firstName 👋', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: LumoColors.ink)),
              Text(_employee?.role ?? '', style: const TextStyle(fontSize: 12.5, color: LumoColors.slate)),
            ],
          ),
        ),
        Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_none_rounded, color: LumoColors.ink),
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const NotificacoesScreen()),
              ),
            ),
            if (_unreadCount > 0)
              Positioned(
                right: 10,
                top: 10,
                child: Container(
                  height: 8,
                  width: 8,
                  decoration: const BoxDecoration(color: LumoColors.ai, shape: BoxShape.circle),
                ),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildClockInCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [LumoColors.ink, Color(0xFF1E293B)]),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Registrar ponto', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 4),
          const Text(
            'Foto e localização são capturadas automaticamente na marcação.',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: LumoColors.turquoise, foregroundColor: LumoColors.ink),
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const PontoScreen(initialTab: 0, autoOpenClockIn: true)),
              ),
              icon: const Icon(Icons.fingerprint_rounded),
              label: const Text('Bater ponto agora'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAccessGrid(BuildContext context) {
    final items = [
      (icon: Icons.fingerprint_rounded, label: 'Meu ponto', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PontoScreen(initialTab: 1)))),
      (icon: Icons.beach_access_rounded, label: 'Férias', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const FeriasScreen()))),
      (icon: Icons.description_rounded, label: 'Documentos', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const DocumentosScreen()))),
      (icon: Icons.receipt_long_rounded, label: 'Holerite', onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const DocumentosScreen()))),
    ];

    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      children: items
          .map((item) => GestureDetector(
                onTap: item.onTap,
                child: Column(
                  children: [
                    Container(
                      height: 52,
                      width: 52,
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: LumoColors.border)),
                      child: Icon(item.icon, color: LumoColors.ink, size: 22),
                    ),
                    const SizedBox(height: 6),
                    Text(item.label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: LumoColors.slate)),
                  ],
                ),
              ))
          .toList(),
    );
  }

  Widget _buildHourBankSummary() {
    final balance = _hourBankService.currentBalance;
    final isPositive = !balance.isNegative;
    final hours = balance.abs().inHours;
    final minutes = balance.abs().inMinutes.remainder(60);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: LumoColors.border)),
      child: Row(
        children: [
          Container(
            height: 40,
            width: 40,
            decoration: BoxDecoration(
              color: (isPositive ? LumoColors.success : LumoColors.warning).withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.timer_outlined, color: isPositive ? LumoColors.success : LumoColors.warning, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${isPositive ? '+' : '-'}${hours}h${minutes.toString().padLeft(2, '0')}',
                  style: const TextStyle(fontWeight: FontWeight.w700, color: LumoColors.ink, fontSize: 15),
                ),
                const Text('Saldo atual do banco de horas', style: TextStyle(fontSize: 12, color: LumoColors.slate)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: LumoColors.slate),
        ],
      ),
    );
  }
}
