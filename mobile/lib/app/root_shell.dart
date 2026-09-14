import 'package:flutter/material.dart';
import '../core/theme/lumo_theme.dart';
import '../screens/home/home_screen.dart';
import '../screens/ponto/ponto_screen.dart';
import '../screens/ferias/ferias_screen.dart';
import '../screens/documentos/documentos_screen.dart';
import '../screens/perfil/perfil_screen.dart';

class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _index = 0;

  final _screens = const [
    HomeScreen(),
    PontoScreen(),
    FeriasScreen(),
    DocumentosScreen(),
    PerfilScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded), label: 'Início'),
          BottomNavigationBarItem(icon: Icon(Icons.fingerprint_rounded), label: 'Ponto'),
          BottomNavigationBarItem(icon: Icon(Icons.beach_access_rounded), label: 'Férias'),
          BottomNavigationBarItem(icon: Icon(Icons.description_rounded), label: 'Documentos'),
          BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Perfil'),
        ],
      ),
      backgroundColor: LumoColors.frost,
    );
  }
}
