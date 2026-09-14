import 'package:flutter/material.dart';
import '../../core/theme/lumo_theme.dart';
import 'tabs/bater_ponto_tab.dart';
import 'tabs/meu_ponto_tab.dart';
import 'tabs/banco_horas_tab.dart';

class PontoScreen extends StatefulWidget {
  final int initialTab;
  final bool autoOpenClockIn;

  const PontoScreen({super.key, this.initialTab = 0, this.autoOpenClockIn = false});

  @override
  State<PontoScreen> createState() => _PontoScreenState();
}

class _PontoScreenState extends State<PontoScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LumoColors.frost,
      appBar: AppBar(
        title: const Text('Ponto', style: TextStyle(fontWeight: FontWeight.w700)),
        bottom: TabBar(
          controller: _tabController,
          labelColor: LumoColors.ink,
          unselectedLabelColor: LumoColors.slate,
          indicatorColor: LumoColors.turquoise,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          tabs: const [
            Tab(text: 'Bater ponto'),
            Tab(text: 'Meu ponto'),
            Tab(text: 'Banco de horas'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          BaterPontoTab(autoOpen: widget.autoOpenClockIn),
          const MeuPontoTab(),
          const BancoHorasTab(),
        ],
      ),
    );
  }
}
