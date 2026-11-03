import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:url_launcher/url_launcher.dart';
import 'account_session.dart';
import 'auth_page.dart';

void main() => runApp(BinZApp());

const pine = Color(0xFF174E2A);
const teal = Color(0xFF0B7C77);
const cream = Color(0xFFFBFAF2);
const mint = Color(0xFFEAF4E6);
const ink = Color(0xFF1F3327);

class BinZApp extends StatefulWidget {
  const BinZApp({super.key});
  @override
  State<BinZApp> createState() => _BinZAppState();
}

class LocaleController extends ChangeNotifier {
  Locale _locale = const Locale('en');
  Locale get locale => _locale;
  void setLanguage(String languageCode) {
    _locale = Locale(languageCode);
    notifyListeners();
  }
}

class LocaleScope extends InheritedNotifier<LocaleController> {
  const LocaleScope({super.key, required LocaleController controller, required super.child})
      : super(notifier: controller);
  static LocaleController of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<LocaleScope>()!.notifier!;
}

String tr(BuildContext context, String english, String hindi, String marathi) {
  switch (LocaleScope.of(context).locale.languageCode) {
    case 'hi': return hindi;
    case 'mr': return marathi;
    default: return english;
  }
}

class _BinZAppState extends State<BinZApp> {
  final session = AccountSession();
  final locale = LocaleController();

  @override
  void initState() {
    super.initState();
    session.restore();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
      animation: locale,
      builder: (_, __) => LocaleScope(
          controller: locale,
          child: MaterialApp(
        title: 'BinZ',
        locale: locale.locale,
        supportedLocales: const [Locale('en'), Locale('hi'), Locale('mr')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          scaffoldBackgroundColor: cream,
          colorScheme: ColorScheme.fromSeed(seedColor: pine, surface: cream),
          appBarTheme:
              const AppBarTheme(backgroundColor: cream, foregroundColor: ink),
          textTheme: ThemeData.light()
              .textTheme
              .apply(bodyColor: ink, displayColor: pine),
        ),
        home: AnimatedBuilder(
            animation: session,
            builder: (_, __) {
              if (!session.ready) {
                return const Scaffold(
                    body: Center(child: CircularProgressIndicator()));
              }
              return session.signedIn
                  ? Shell(session: session)
                  : AuthPage(session: session);
            }),
      )));
}

class Shell extends StatefulWidget {
  final AccountSession session;
  const Shell({super.key, required this.session});
  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int tab = 0;
  final labels = const ['Home', 'E-waste', 'Earn', 'Impact', 'Service'];
  final icons = const [
    Icons.home_outlined,
    Icons.recycling_outlined,
    Icons.auto_awesome_outlined,
    Icons.insights_outlined,
    Icons.support_agent_outlined
  ];

  void openBasket() => Navigator.of(context)
      .push(MaterialPageRoute(builder: (_) => BasketPage(session: widget.session)));

  @override
  Widget build(BuildContext context) => Scaffold(
        body: Stack(children: [
          IndexedStack(index: tab, children: [
            HomePage(session: widget.session),
            ScrapPage(session: widget.session),
            EarnPage(session: widget.session),
            ImpactPage(session: widget.session),
            ServicePage(session: widget.session)
          ]),
          Positioned(
            left: 16,
            right: 16,
            bottom: 14,
            child: SafeArea(
                top: false,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: .94),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: const [
                        BoxShadow(
                            color: Color(0x220E2C1A),
                            blurRadius: 16,
                            offset: Offset(0, 6))
                      ]),
                  child: Row(
                      children: List.generate(
                          5,
                          (i) => Expanded(
                                  child: InkWell(
                                borderRadius: BorderRadius.circular(20),
                                onTap: () => setState(() => tab = i),
                                child: Padding(
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 9),
                                    child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(icons[i],
                                              size: 21,
                                              color: tab == i
                                                  ? pine
                                                  : const Color(0xFF718078)),
                                          const SizedBox(height: 3),
                                          Text(labels[i],
                                              style: TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: tab == i
                                                      ? FontWeight.w700
                                                      : FontWeight.w500,
                                                  color: tab == i
                                                      ? pine
                                                      : const Color(
                                                          0xFF718078))),
                                        ])),
                              )))),
                )),
          ),
        ]),
      );
}

class PageFrame extends StatelessWidget {
  final String title, subtitle;
  final Widget child;
  final bool showAvatar;
  final AccountSession? session;
  const PageFrame(
      {super.key,
      required this.title,
      required this.subtitle,
      required this.child,
      this.showAvatar = true,
      this.session});
  @override
  Widget build(BuildContext context) => SafeArea(
          child: Column(children: [
        Padding(
            padding: const EdgeInsets.fromLTRB(22, 16, 22, 10),
            child: Row(children: [
              const BrandMark(),
              const Spacer(),
              CoinPill(session: session),
              const SizedBox(width: 10),
              if (showAvatar)
                InkWell(
                    borderRadius: BorderRadius.circular(24),
                    onTap: session == null
                        ? null
                        : () => Navigator.of(context).push(MaterialPageRoute(
                            builder: (_) => ProfilePage(session: session!))),
                    child: const CircleAvatar(
                        radius: 18,
                        backgroundColor: mint,
                        child: Icon(Icons.person_outline, color: pine))),
            ])),
        Expanded(
            child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 110),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title,
                          style: const TextStyle(
                              fontSize: 31,
                              height: 1,
                              letterSpacing: -1.2,
                              color: pine,
                              fontWeight: FontWeight.w800)),
                      const SizedBox(height: 7),
                      Text(subtitle,
                          style: const TextStyle(
                              color: Color(0xFF66756B), fontSize: 14)),
                      const SizedBox(height: 22),
                      child,
                    ]))),
      ]));
}

class CoinPill extends StatelessWidget {
  final AccountSession? session;
  const CoinPill({super.key, this.session});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration:
            BoxDecoration(color: mint, borderRadius: BorderRadius.circular(20)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.monetization_on_outlined, color: teal, size: 16),
          const SizedBox(width: 4),
          Text('${session?.account?.coins ?? 0}',
              style: const TextStyle(color: pine, fontWeight: FontWeight.w800)),
          const SizedBox(width: 3),
          const Text('Z', style: TextStyle(color: teal, fontSize: 11, fontWeight: FontWeight.w800)),
        ]),
      );
}

class BrandMark extends StatelessWidget {
  const BrandMark({super.key});
  @override
  Widget build(BuildContext context) => Image.asset(
        'assets/binz-logo.png',
        width: 84,
        height: 36,
        fit: BoxFit.contain,
        alignment: Alignment.centerLeft,
        semanticLabel: 'BinZ',
      );
}

class HomePage extends StatefulWidget {
  final AccountSession session;
  const HomePage({super.key, required this.session});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late Future<Map<String, dynamic>> _dashboard;
  @override
  void initState() { super.initState(); _dashboard = widget.session.dashboard(); }
  @override
  Widget build(BuildContext context) => FutureBuilder<Map<String, dynamic>>(
      future: _dashboard,
      builder: (context, snapshot) {
        final data = snapshot.data ?? const <String, dynamic>{};
        final impact = data['impact'] as Map<String, dynamic>? ?? const {};
        final account = widget.session.account;
        final co2 = (impact['co2Saved'] as num? ?? 0).toStringAsFixed(1);
        return PageFrame(
      session: widget.session,
      title: 'Hi, ${account?.firstName.isNotEmpty == true ? account!.firstName : 'there'}',
      subtitle: "Let's turn your scrap into value today.",
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        DecoratedBox(
            decoration: BoxDecoration(
                color: pine, borderRadius: BorderRadius.circular(22)),
            child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('PICKUP WINDOW TODAY',
                          style: TextStyle(
                              color: Color(0xFFB9DDC0),
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1)),
                      const SizedBox(height: 8),
                      const Text('10:00 AM – 2:00 PM',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.w800)),
                      const SizedBox(height: 5),
                      const Text('Sector 62 route',
                          style: TextStyle(color: Color(0xFFD5EAD8))),
                      const Divider(color: Color(0x3377B885), height: 26),
                      Row(children: [
                        const CircleAvatar(
                            backgroundColor: Color(0xFFDFEEDB),
                            child: Icon(Icons.person, color: pine)),
                        const SizedBox(width: 10),
                        const Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text('Rohit Kumar',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700)),
                              Text('4.8 • 98765 43210',
                                  style: TextStyle(
                                      color: Color(0xFFD5EAD8), fontSize: 12))
                            ])),
                        IconButton(
                            onPressed: () => _call(context, '9876543210'),
                            icon: const Icon(Icons.call_outlined,
                                color: Colors.white))
                      ])
                    ]))),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(
              child: ActionTile(
                  icon: Icons.calendar_month_outlined,
                  label: 'Schedule pickup',
                  onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => BasketPage(session: widget.session))))),
          const SizedBox(width: 10),
          Expanded(
              child: ActionTile(
                  icon: Icons.sell_outlined,
                  label: 'Rates',
                  onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => RatesPage(session: widget.session))))),
          const SizedBox(width: 10),
          Expanded(
              child: ActionTile(
                  icon: Icons.memory_outlined,
                  label: 'E-waste',
                  onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => EWastePage(session: widget.session)))))
        ]),
        const SizedBox(height: 22),
        const Text('Pickup status',
            style: TextStyle(
                fontSize: 18, fontWeight: FontWeight.w800, color: pine)),
        const SizedBox(height: 12),
        const StatusSteps(),
        const SizedBox(height: 18),
        InkWell(
            onTap: () {},
            child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                    color: mint, borderRadius: BorderRadius.circular(18)),
                child: Row(children: [
                  const Icon(Icons.eco_outlined, color: teal),
                  const SizedBox(width: 12),
                  Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Text('$co2 kg',
                            style: const TextStyle(
                                fontSize: 21,
                                fontWeight: FontWeight.w800,
                                color: pine)),
                        const Text('CO₂ saved to date',
                            style: TextStyle(color: Color(0xFF597064)))
                      ])),
                  const Icon(Icons.arrow_outward, color: pine)
                ]))),
      ]));
      });
}
class ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const ActionTile(
      {super.key,
      required this.icon,
      required this.label,
      required this.onTap});
  @override
  Widget build(BuildContext c) => InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(15),
      child: Container(
          height: 92,
          decoration: BoxDecoration(
              color: Colors.white, borderRadius: BorderRadius.circular(15)),
          padding: const EdgeInsets.all(12),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, color: pine),
            const Spacer(),
            Text(label,
                style:
                    const TextStyle(fontSize: 11, fontWeight: FontWeight.w700))
          ])));
}

class StatusSteps extends StatelessWidget {
  const StatusSteps({super.key});
  @override
  Widget build(BuildContext c) => Row(children: const [
        StepDot(label: 'Booked', active: true),
        Expanded(child: Divider(color: Color(0xFF9DC9A1))),
        StepDot(label: 'Assigned', active: true),
        Expanded(child: Divider(color: Color(0xFFD5DED6))),
        StepDot(label: 'Pending')
      ]);
}

class StepDot extends StatelessWidget {
  final String label;
  final bool active;
  const StepDot({super.key, required this.label, this.active = false});
  @override
  Widget build(BuildContext c) => Column(children: [
        Icon(active ? Icons.check_circle : Icons.circle_outlined,
            size: 18, color: active ? teal : const Color(0xFFABB8AE)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10))
      ]);
}

class ScrapPage extends StatelessWidget {
  final AccountSession session;
  const ScrapPage({super.key, required this.session});
  @override
  Widget build(BuildContext context) => PageFrame(
      session: session,
      title: 'Recycle your e-waste',
      subtitle: 'Dispose of unwanted electronics responsibly.',
      child: Column(children: [
        InkWell(
            onTap: () => _scanSheet(context, session),
            child: Container(
                width: double.infinity,
                height: 148,
                decoration: BoxDecoration(
                    color: mint,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFFBCD7BB))),
                child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.document_scanner_outlined,
                          color: teal, size: 38),
                      SizedBox(height: 10),
                      Text('Scan or upload your e-waste',
                          style: TextStyle(
                              fontWeight: FontWeight.w800, color: pine)),
                      SizedBox(height: 4),
                      Text('Our AI will identify it for safe recovery',
                          style:
                              TextStyle(color: Color(0xFF617568), fontSize: 12))
                    ]))),
        const SizedBox(height: 22),
        const Align(
            alignment: Alignment.centerLeft,
            child: Text('Accepted e-waste',
                style: TextStyle(
                    fontSize: 19, color: pine, fontWeight: FontWeight.w800))),
        const SizedBox(height: 8),
        ...[
          'Laptop     Raise a ticket',
          'Mobile phone     Raise a ticket',
          'Battery     Raise a ticket'
        ].map((x) => ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.check_box_outline_blank, color: teal),
            title: Text(x.split('     ').first,
                style: const TextStyle(fontWeight: FontWeight.w700)),
            trailing: Text(x.split('     ').last,
                style:
                    const TextStyle(color: teal, fontWeight: FontWeight.w700)),
            subtitle: const Text('Safe recovery is arranged through an e-waste ticket')))
      ]));
}

Future<void> _scanSheet(BuildContext context, AccountSession session) async {
  final coins = await Navigator.of(context).push<int>(
      MaterialPageRoute(builder: (_) => ScrapVideoCapturePage(session: session)));
  if (context.mounted && coins != null) {
    ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Video submitted • wallet updated to $coins Z-Coins')));
  }
}

class ScrapVideoCapturePage extends StatefulWidget {
  final AccountSession session;
  const ScrapVideoCapturePage({super.key, required this.session});
  @override
  State<ScrapVideoCapturePage> createState() => _ScrapVideoCapturePageState();
}

class _ScrapVideoCapturePageState extends State<ScrapVideoCapturePage> {
  bool uploading = false;
  Future<void> record() async {
    final video = await ImagePicker().pickVideo(source: ImageSource.camera, maxDuration: const Duration(seconds: 30));
    if (video == null || !mounted) return;
    setState(() => uploading = true);
    try {
      final coins = await widget.session.uploadCleanupVideo(video);
      if (mounted) Navigator.pop(context, coins);
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString().replaceFirst('Bad state: ', ''))));
    } finally { if (mounted) setState(() => uploading = false); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Record e-waste video')),
    body: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.videocam_outlined, size: 72, color: teal),
      const SizedBox(height: 20),
      const Text('Show your e-waste for verification', textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: pine)),
      const SizedBox(height: 10),
      const Text('Record up to 30 seconds. Once uploaded, the server updates your wallet.' , textAlign: TextAlign.center),
      const SizedBox(height: 28),
      FilledButton.icon(onPressed: uploading ? null : record, icon: const Icon(Icons.videocam), label: Text(uploading ? 'Uploading…' : 'Record video')),
    ])),
  );
}

class EarnPage extends StatelessWidget {
  final AccountSession session;
  const EarnPage({super.key, required this.session});
  @override
  Widget build(BuildContext context) => PageFrame(
      session: session,
      title: 'Earn rewards',
      subtitle: 'Small actions add up to a cleaner city.',
      child: Column(children: [
        Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [teal, pine]),
                borderRadius: BorderRadius.circular(23)),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Z-WALLET',
                      style: TextStyle(
                          color: Color(0xFFD5EAD8),
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1)),
                  SizedBox(height: 10),
                  Text('${session.account?.coins ?? 0} Z-Coins',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 31,
                          fontWeight: FontWeight.w800)),
                  SizedBox(height: 18),
                  LinearProgressIndicator(
                      value: .62,
                      color: Color(0xFFC5E8B9),
                      backgroundColor: Color(0x447CE097)),
                  SizedBox(height: 8),
                  Text('14 coins to your next reward',
                      style: TextStyle(color: Color(0xFFD5EAD8)))
                ])),
        const SizedBox(height: 24),
        const Align(
            alignment: Alignment.centerLeft,
            child: Text('Ways to earn',
                style: TextStyle(
                    fontSize: 19, fontWeight: FontWeight.w800, color: pine))),
        const SizedBox(height: 8),
        ...[
          ('Complete a pickup', '+10'),
          ('Upload recycling proof', '+5'),
          ('Refer a neighbour', '+20')
        ].map((e) => Card(
            child: ListTile(
                leading: const Icon(Icons.bolt_outlined, color: teal),
                title: Text(e.$1,
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                trailing: Text(e.$2,
                    style: const TextStyle(
                        color: teal, fontWeight: FontWeight.w800))))),
        const SizedBox(height: 10),
        Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
                color: mint, borderRadius: BorderRadius.circular(18)),
            child: const Row(children: [
              Icon(Icons.emoji_events_outlined, color: pine),
              SizedBox(width: 12),
              Expanded(
                  child: Text('You’re #18 in Greater Noida',
                      style: TextStyle(fontWeight: FontWeight.w700)))
            ]))
      ]));
}

class ImpactPage extends StatelessWidget {
  final AccountSession session;
  const ImpactPage({super.key, required this.session});

  @override
  Widget build(BuildContext context) => FutureBuilder<Map<String, dynamic>>(
      future: session.dashboard(),
      builder: (context, snapshot) {
        final impact = snapshot.data?['impact'] as Map<String, dynamic>? ?? const {};
        final tickets = snapshot.data?['tickets'] as List<dynamic>? ?? const [];
        final latestTicket = tickets.isNotEmpty && tickets.first is Map<String, dynamic>
            ? tickets.first as Map<String, dynamic>
            : null;
        final co2 = (impact['co2Saved'] as num? ?? 0).toStringAsFixed(1);
        final items = impact['eWasteItems'] as num? ?? 0;
        final progress = ((impact['co2Saved'] as num? ?? 0) / 50).clamp(0, 1).toDouble();
        final percent = (progress * 100).round();
        return PageFrame(
        session: session,
        title: 'Your impact',
        subtitle: 'Every item gets a second life.',
        child: Column(children: [
          Text(co2,
              style: const TextStyle(
                  fontSize: 62,
                  fontWeight: FontWeight.w900,
                  color: pine,
                  letterSpacing: -2)),
          const Text('kg CO₂ prevented',
              style: TextStyle(
                  color: teal, fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 26),
          Container(
            height: 190,
            width: 190,
            decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: SweepGradient(
                    colors: [teal, teal, Color(0xFFC8DEC8), Color(0xFFC8DEC8)],
                    stops: [0, progress, progress, 1])),
            child: Center(
              child: Container(
                height: 128,
                width: 128,
                decoration:
                    const BoxDecoration(color: cream, shape: BoxShape.circle),
                child: Center(
                    child: Text('$percent%\nCO₂ goal',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontWeight: FontWeight.w800, color: pine))),
              ),
            ),
          ),
          const SizedBox(height: 25),
          Row(children: [
            const Expanded(child: ImpactStat(value: '0 kg', label: 'scrap recycled')),
            const SizedBox(width: 12),
            Expanded(child: ImpactStat(value: '$items', label: 'e-waste items'))
          ]),
          const SizedBox(height: 22),
          ListTile(
              tileColor: mint,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              leading: const Icon(Icons.verified_user_outlined, color: teal),
              title: Text(latestTicket == null ? 'No e-waste ticket yet' : (latestTicket['productName'] as String? ?? 'E-waste ticket'),
                  style: TextStyle(fontWeight: FontWeight.w800)),
              subtitle: Text(latestTicket == null ? 'Create a ticket to start tracking.' : '${latestTicket['ticketID'] ?? ''} • ${latestTicket['status'] ?? ''}'),
              trailing: const Icon(Icons.chevron_right)),
        ]),
      );
      });
}

class ImpactStat extends StatelessWidget {
  final String value, label;
  const ImpactStat({super.key, required this.value, required this.label});
  @override
  Widget build(BuildContext c) => Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(16)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(value,
            style: const TextStyle(
                fontSize: 20, fontWeight: FontWeight.w800, color: pine)),
        Text(label,
            style: const TextStyle(fontSize: 12, color: Color(0xFF6A7C70)))
      ]));
}

class RatesPage extends StatelessWidget {
  final AccountSession session;
  const RatesPage({super.key, required this.session});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('E-waste recycling'), actions: [
          Padding(padding: const EdgeInsets.only(right: 16), child: CoinPill(session: session))
        ]),
        body: ListView(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 30),
            children: [
              const Text('Safe e-waste recovery',
                  style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: pine,
                      letterSpacing: -1.2)),
              const SizedBox(height: 7),
              const Text(
                  'Raise a ticket for responsible collection of unwanted electronics.',
                  style: TextStyle(color: Color(0xFF66756B))),
              const SizedBox(height: 18),
              ...const [
                ('Laptop', 'Ticket', 'Responsible recovery for old computers.', Icons.laptop_mac_outlined),
                ('Mobile phone', 'Ticket', 'Safe recycling for phones and accessories.', Icons.phone_android_outlined),
                ('Battery', 'Ticket', 'Separate disposal route for safe handling.', Icons.battery_charging_full_outlined),
              ].map((item) => RateCard(
                  name: item.$1, rate: item.$2, note: item.$3, icon: item.$4)),
              const SizedBox(height: 10),
              InkWell(
                  onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => EWastePage(session: session))),
                  child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                          color: mint, borderRadius: BorderRadius.circular(18)),
                      child: const Row(children: [
                        Icon(Icons.memory_outlined, color: teal),
                        SizedBox(width: 12),
                        Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text('Raise an e-waste ticket',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      color: pine)),
                              Text(
                                  'Raise a secure disposal ticket for devices.')
                            ])),
                        Icon(Icons.chevron_right, color: pine)
                      ]))),
            ]),
      );
}

class RateCard extends StatelessWidget {
  final String name, rate, note;
  final IconData icon;
  const RateCard(
      {super.key,
      required this.name,
      required this.rate,
      required this.note,
      required this.icon});

  @override
  Widget build(BuildContext context) => Card(
      child: Padding(
          padding: const EdgeInsets.all(15),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
                padding: const EdgeInsets.all(10),
                decoration:
                    const BoxDecoration(color: mint, shape: BoxShape.circle),
                child: Icon(icon, color: pine)),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(name,
                      style: const TextStyle(
                          fontWeight: FontWeight.w800, color: pine)),
                  const SizedBox(height: 4),
                  Text(note,
                      style: const TextStyle(
                          fontSize: 12, color: Color(0xFF66756B)))
                ])),
            const SizedBox(width: 8),
            Text(rate,
                style:
                    const TextStyle(color: teal, fontWeight: FontWeight.w800))
          ])));
}

class EWastePage extends StatefulWidget {
  final AccountSession session;
  const EWastePage({super.key, required this.session});

  @override
  State<EWastePage> createState() => _EWastePageState();
}

class _EWastePageState extends State<EWastePage> {
  late Future<List<Map<String, dynamic>>> _tickets;
  @override
  void initState() { super.initState(); _tickets = widget.session.tickets(); }

  Future<void> addTicket() async => showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: cream,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(26))),
        builder: (sheetContext) => TicketForm(
          session: widget.session,
          onCreated: () {
            setState(() => _tickets = widget.session.tickets());
            Navigator.pop(sheetContext);
          },
        ),
      );

  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('E-waste care'), actions: [
        Padding(padding: const EdgeInsets.only(right: 16), child: CoinPill(session: widget.session))
      ]),
      floatingActionButton: FloatingActionButton.extended(
          onPressed: addTicket,
          icon: const Icon(Icons.add),
          label: const Text('Raise ticket')),
      body: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 90),
          children: [
            Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                    color: pine, borderRadius: BorderRadius.circular(22)),
                child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.verified_user_outlined,
                          color: Color(0xFFC6E8C9)),
                      SizedBox(height: 12),
                      Text('Responsible device recycling',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w800)),
                      SizedBox(height: 5),
                      Text(
                          'Phones, laptops, batteries and more are collected separately and securely.',
                          style: TextStyle(color: Color(0xFFD5EAD8)))
                    ])),
            const SizedBox(height: 24),
            const Text('Your e-waste tickets',
                style: TextStyle(
                    fontSize: 19, color: pine, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            FutureBuilder<List<Map<String, dynamic>>>(
              future: _tickets,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
                if (snapshot.hasError) return const Padding(padding: EdgeInsets.all(12), child: Text('Unable to load tickets. Pull to refresh or try again.'));
                final tickets = snapshot.data ?? const <Map<String, dynamic>>[];
                if (tickets.isEmpty) return const Padding(padding: EdgeInsets.all(12), child: Text('No e-waste tickets yet. Raise one to begin.'));
                return Column(
                    children: tickets.map((ticket) => Card(
                        child: ListTile(
                            contentPadding: const EdgeInsets.all(12),
                            leading: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: const BoxDecoration(color: mint, shape: BoxShape.circle),
                                child: const Icon(Icons.memory_outlined, color: teal)),
                            title: Text(ticket['productName'] as String? ?? ticket['eWasteType'] as String? ?? 'E-waste item',
                                style: const TextStyle(fontWeight: FontWeight.w800)),
                            subtitle: Text('${ticket['ticketID'] ?? ''} • ${ticket['status'] ?? ''}'),
                            trailing: const Icon(Icons.chevron_right))))
                        .toList());
              },
            ),
            const SizedBox(height: 14),
            const Text('Accepted items',
                style: TextStyle(
                    fontSize: 19, color: pine, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            const Wrap(spacing: 8, runSpacing: 8, children: [
              Chip(label: Text('Phones')),
              Chip(label: Text('Laptops')),
              Chip(label: Text('Batteries')),
              Chip(label: Text('Cables')),
              Chip(label: Text('Tablets'))
            ])
          ]));
}

class TicketForm extends StatefulWidget {
  final AccountSession session;
  final VoidCallback onCreated;
  const TicketForm({super.key, required this.session, required this.onCreated});
  @override
  State<TicketForm> createState() => _TicketFormState();
}

class _TicketFormState extends State<TicketForm> {
  late final TextEditingController name;
  late final TextEditingController email;
  final device = TextEditingController();
  final details = TextEditingController();
  DateTime date = DateTime.now().add(const Duration(days: 1));
  bool saving = false;
  final types = const ['Mobile phone', 'Laptop', 'Tablet', 'Battery', 'Cable / charger', 'Computer accessory', 'Other'];
  String? type;
  @override
  void initState() {
    super.initState();
    final account = widget.session.account!;
    name = TextEditingController(text: '${account.firstName} ${account.lastName}'.trim());
    email = TextEditingController(text: account.email);
  }
  @override
  void dispose() { name.dispose(); email.dispose(); device.dispose(); details.dispose(); super.dispose(); }
  Future<void> submit() async {
    if (type == null || device.text.trim().isEmpty) return;
    setState(() => saving = true);
    try {
      await widget.session.createTicket(deviceType: type!, details: details.text.trim().isEmpty ? device.text.trim() : details.text.trim(), pickupAt: date);
      await widget.session.refreshAccount();
      if (mounted) widget.onCreated();
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString().replaceFirst('Bad state: ', ''))));
    } finally { if (mounted) setState(() => saving = false); }
  }
  @override
  Widget build(BuildContext context) => Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, 24 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Raise an e-waste ticket', style: TextStyle(fontSize: 23, fontWeight: FontWeight.w800, color: pine)),
        const SizedBox(height: 16),
        TextField(controller: name, readOnly: true, decoration: const InputDecoration(labelText: 'Name', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        TextField(controller: email, readOnly: true, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(initialValue: type, decoration: const InputDecoration(labelText: 'E-waste type', border: OutlineInputBorder()), items: types.map((value) => DropdownMenuItem(value: value, child: Text(value))).toList(), onChanged: (value) => setState(() => type = value)),
        const SizedBox(height: 12),
        TextField(controller: device, decoration: const InputDecoration(labelText: 'Device model / item', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        TextField(controller: details, maxLines: 2, decoration: const InputDecoration(labelText: 'Device details', border: OutlineInputBorder())),
        const SizedBox(height: 12),
        OutlinedButton.icon(onPressed: () async {
          final selected = await showDatePicker(context: context, initialDate: date, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
          if (selected != null) setState(() => date = selected);
        }, icon: const Icon(Icons.calendar_month_outlined), label: Text('Pickup date: ${date.day}/${date.month}/${date.year}')),
        const SizedBox(height: 14),
        SizedBox(width: double.infinity, child: FilledButton(onPressed: saving ? null : submit, child: Text(saving ? 'Creating…' : 'Raise ticket'))),
      ]));
}

class ScannerPage extends StatefulWidget {
  const ScannerPage({super.key});
  @override
  State<ScannerPage> createState() => _ScannerPageState();
}
class _ScannerPageState extends State<ScannerPage> {
  bool handled = false;
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.black,
    appBar: AppBar(backgroundColor: Colors.black, foregroundColor: Colors.white, title: const Text('Scan BinZ code')),
    body: MobileScanner(onDetect: (capture) {
      if (handled) return;
      final value = capture.barcodes.firstOrNull?.rawValue;
      if (value != null) { handled = true; Navigator.pop(context, value); }
    }),
  );
}

Future<void> _call(BuildContext context, String number) async {
  final ok = await launchUrl(Uri(scheme: 'tel', path: number));
  if (!ok && context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Unable to open the phone dialer.')));
}

class ProfilePage extends StatelessWidget {
  final AccountSession session;
  const ProfilePage({super.key, required this.session});
  @override
  Widget build(BuildContext context) {
    final account = session.account!;
    return Scaffold(appBar: AppBar(title: const Text('Profile')), body: ListView(padding: const EdgeInsets.all(20), children: [
      const CircleAvatar(radius: 38, backgroundColor: mint, child: Icon(Icons.person_outline, size: 38, color: pine)),
      const SizedBox(height: 12), Center(child: Text('${account.firstName} ${account.lastName}'.trim(), style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w800, color: pine))),
      Center(child: Text(account.email, style: const TextStyle(color: Color(0xFF66756B)))),
      const SizedBox(height: 24),
      if (kIsWeb)
        ListTile(leading: const Icon(Icons.language_outlined, color: pine), title: Text(tr(context, 'Language', 'भाषा', 'भाषा')), subtitle: Text(_languageName(LocaleScope.of(context).locale.languageCode)), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LanguagePage()))),
      ListTile(leading: const Icon(Icons.help_outline, color: pine), title: Text(tr(context, 'Support & FAQs', 'सहायता और प्रश्न', 'मदत आणि प्रश्न')), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FaqPage()))),
      SignOutButton(action: () async { await session.signOut(); if (context.mounted) Navigator.popUntil(context, (route) => route.isFirst); }),
    ]));
  }
}

String _languageName(String code) => switch (code) {
  'hi' => 'हिन्दी',
  'mr' => 'मराठी',
  _ => 'English',
};

class LanguagePage extends StatelessWidget {
  const LanguagePage({super.key});
  @override
  Widget build(BuildContext context) {
    final controller = LocaleScope.of(context);
    final current = controller.locale.languageCode;
    const languages = [('en', 'English', 'English'), ('hi', 'हिन्दी', 'Hindi'), ('mr', 'मराठी', 'Marathi')];
    return Scaffold(
      appBar: AppBar(title: Text(tr(context, 'Language', 'भाषा', 'भाषा'))),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        Text(tr(context, 'Choose your language', 'अपनी भाषा चुनें', 'तुमची भाषा निवडा'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: pine)),
        const SizedBox(height: 12),
        ...languages.map((language) => Card(child: ListTile(
          title: Text(language.$2, style: const TextStyle(fontWeight: FontWeight.w700)),
          subtitle: Text(language.$3),
          trailing: current == language.$1 ? const Icon(Icons.check_circle, color: teal) : const Icon(Icons.circle_outlined),
          onTap: () { controller.setLanguage(language.$1); Navigator.pop(context); },
        ))),
      ]),
    );
  }
}

class SignOutButton extends StatefulWidget {
  final Future<void> Function() action;
  const SignOutButton({super.key, required this.action});
  @override
  State<SignOutButton> createState() => _SignOutButtonState();
}
class _SignOutButtonState extends State<SignOutButton> {
  bool waiting = false;
  Future<void> signOut() async {
    setState(() => waiting = true);
    try { await widget.action(); }
    catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString().replaceFirst('Bad state: ', ''))));
    } finally { if (mounted) setState(() => waiting = false); }
  }
  @override
  Widget build(BuildContext context) => OutlinedButton.icon(
    onPressed: waiting ? null : signOut,
    icon: const Icon(Icons.logout),
    label: Text(waiting ? 'Signing out…' : 'Sign out'),
  );
}

class FaqPage extends StatelessWidget {
  const FaqPage({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Frequently asked questions')),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        const Text('How can we help?',
            style: TextStyle(
                fontSize: 28, fontWeight: FontWeight.w800, color: pine)),
        const SizedBox(height: 8),
        const Text('Quick answers about pickup, rewards and recycling.'),
        const SizedBox(height: 18),
        ...const [
          (
            'How do I book a pickup?',
            'Add scrap to your basket, choose a date and a time slot, then confirm your pickup.'
          ),
          (
            'When will I get paid?',
            'Your collector verifies the weight and condition at pickup; the final value is then confirmed.'
          ),
          (
            'How do Z-Coins work?',
            'You earn Z-Coins for verified recycling actions, including e-waste tickets and cleanup proof.'
          ),
          (
            'What happens to e-waste?',
            'Devices are processed through a separate, responsible recycling route. Eligible devices can receive a data-erasure certificate.'
          ),
          (
            'Can I change a pickup slot?',
            'Yes. Open the pickup ticket before the collector is assigned and choose another available slot.'
          )
        ].map((item) => Card(
                child: ExpansionTile(
                    title: Text(item.$1,
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    children: [
                  Text(item.$2,
                      style: const TextStyle(color: Color(0xFF596B60)))
                ])))
      ]));
}

class AdminDashboardPage extends StatefulWidget {
  final AccountSession session;
  const AdminDashboardPage({super.key, required this.session});

  @override
  State<AdminDashboardPage> createState() => _AdminDashboardPageState();
}

class _AdminDashboardPageState extends State<AdminDashboardPage> {
  int tab = 0;
  bool online = true;

  @override
  Widget build(BuildContext context) {
    final pages = [
      _AdminHome(
          account: widget.session.account!,
          online: online,
          onOnlineChanged: (value) => setState(() => online = value),
          onTabChanged: (value) => setState(() => tab = value)),
      AdminOrdersPage(onTabChanged: (value) => setState(() => tab = value)),
      AdminUpdatesPage(onTabChanged: (value) => setState(() => tab = value)),
      AdminProfilePage(
          account: widget.session.account!,
          online: online,
          onSignOut: widget.session.signOut,
          onTabChanged: (value) => setState(() => tab = value)),
    ];
    return pages[tab];
  }
}

class _AdminHome extends StatelessWidget {
  final Account account;
  final bool online;
  final ValueChanged<bool> onOnlineChanged;
  final ValueChanged<int> onTabChanged;
  const _AdminHome(
      {required this.account,
      required this.online,
      required this.onOnlineChanged,
      required this.onTabChanged});

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: const Color(0xFFF5F0E8),
        body: SafeArea(
            child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 104),
                children: [
              Row(children: [
                const BrandMark(),
                const Spacer(),
                IconButton(
                    onPressed: () {},
                    icon: const Icon(Icons.notifications_none_rounded,
                        color: Color(0xFF2B5329))),
                const CircleAvatar(
                    radius: 18,
                    backgroundColor: Color(0xFFE5E9DD),
                    child: Icon(Icons.person_outline, color: Color(0xFF2B5329)))
              ]),
              const SizedBox(height: 18),
              Text('Good morning, ${account.firstName}',
                  style: const TextStyle(
                      fontSize: 27,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2B5329),
                      letterSpacing: -1)),
              const SizedBox(height: 4),
              const Text('Ready to make an impact today?',
                  style: TextStyle(color: Color(0xFF6E756B))),
              const SizedBox(height: 18),
              Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                      color: const Color(0xFF2B5329),
                      borderRadius: BorderRadius.circular(22)),
                  child: Row(children: [
                    Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          Text('ON DUTY',
                              style: TextStyle(
                                  color: Color(0xFFBCD2B7),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1)),
                          SizedBox(height: 8),
                          Text(online ? 'You’re online' : 'You’re offline',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800)),
                          SizedBox(height: 5),
                          Text(
                              online
                                  ? '3 pickups assigned for today'
                                  : 'Go online to receive pickups',
                              style: const TextStyle(color: Color(0xFFDCE8D8)))
                        ])),
                    Switch(
                        value: online,
                        onChanged: onOnlineChanged,
                        activeThumbColor: const Color(0xFFB8DB8F))
                  ])),
              const SizedBox(height: 16),
              GridView.count(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.62,
                children: [
                  AdminStat(value: '03', label: 'TOTAL'),
                  AdminStat(value: '01', label: 'DONE'),
                  AdminStat(value: '02', label: 'PENDING'),
                  AdminStat(value: '₹420', label: 'EARNINGS'),
                ],
              ),
              const SizedBox(height: 26),
              Row(children: [
                const Expanded(
                    child: Text('Today’s pickups',
                        style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF2B5329)))),
                TextButton(
                    onPressed: () => onTabChanged(1),
                    child: const Text('View all'))
              ]),
              const SizedBox(height: 4),
              AdminPickupCard(
                  number: '01',
                  name: 'Aman Bhutani',
                  location: 'Sector 62, Greater Noida',
                  time: '10:00 AM – 12:00 PM',
                  status: 'NEXT PICKUP',
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const AdminPickupDetailsPage()))),
              const SizedBox(height: 10),
              const AdminPickupCard(
                  number: '02',
                  name: 'Priya Sharma',
                  location: 'Alpha 1, Greater Noida',
                  time: '12:00 PM – 2:00 PM',
                  status: 'UP NEXT'),
              const SizedBox(height: 10),
              const AdminPickupCard(
                  number: '03',
                  name: 'Vikram Singh',
                  location: 'Noida Extension',
                  time: '2:00 PM – 4:00 PM',
                  status: 'UP NEXT'),
            ])),
        floatingActionButton: FloatingActionButton.extended(
            backgroundColor: const Color(0xFF2B5329),
            foregroundColor: Colors.white,
            onPressed: () async {
              final result = await Navigator.of(context).push<String>(
                  MaterialPageRoute(builder: (_) => const ScannerPage()));
              if (context.mounted && result != null) {
                ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Scanned: $result')));
              }
            },
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('Scan QR')),
        bottomNavigationBar: AdminBottomNav(
            selectedIndex: 0, onDestinationSelected: onTabChanged),
      );
}

class AdminBottomNav extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  const AdminBottomNav(
      {super.key,
      required this.selectedIndex,
      required this.onDestinationSelected});
  @override
  Widget build(BuildContext context) => NavigationBar(
          selectedIndex: selectedIndex,
          onDestinationSelected: onDestinationSelected,
          destinations: const [
            NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home),
                label: 'Home'),
            NavigationDestination(
                icon: Icon(Icons.list_alt_outlined), label: 'Orders'),
            NavigationDestination(
                icon: Icon(Icons.notifications_none), label: 'Updates'),
            NavigationDestination(
                icon: Icon(Icons.person_outline), label: 'Profile'),
          ]);
}

class AdminOrdersPage extends StatefulWidget {
  final ValueChanged<int> onTabChanged;
  const AdminOrdersPage({super.key, required this.onTabChanged});
  @override
  State<AdminOrdersPage> createState() => _AdminOrdersPageState();
}

class _AdminOrdersPageState extends State<AdminOrdersPage> {
  String filter = 'All';
  final orders = const [
    ('Aman Bhutani', 'Sector 62 • 10:00 AM – 12:00 PM', 'In progress', '01'),
    ('Priya Sharma', 'Alpha 1 • 12:00 PM – 2:00 PM', 'Pending', '02'),
    ('Vikram Singh', 'Noida Extension • 2:00 PM – 4:00 PM', 'Pending', '03'),
    ('Neha Kapoor', 'Gaur City • Completed at 9:20 AM', 'Completed', '04'),
  ];

  @override
  Widget build(BuildContext context) {
    final visible = filter == 'All'
        ? orders
        : orders.where((order) => order.$3 == filter).toList();
    return Scaffold(
        backgroundColor: const Color(0xFFF5F0E8),
        body: SafeArea(
            child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 100),
                children: [
              const Text('Orders',
                  style: TextStyle(
                      fontSize: 29,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2B5329))),
              const SizedBox(height: 5),
              const Text('Manage your assigned pickups.',
                  style: TextStyle(color: Color(0xFF6E756B))),
              const SizedBox(height: 18),
              SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                      children: ['All', 'Pending', 'In progress', 'Completed']
                          .map((item) => Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                  label: Text(item == 'All'
                                      ? 'All (${orders.length})'
                                      : '$item (${orders.where((order) => order.$3 == item).length})'),
                                  selected: filter == item,
                                  onSelected: (_) =>
                                      setState(() => filter = item))))
                          .toList())),
              const SizedBox(height: 16),
              ...visible.map((order) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: AdminPickupCard(
                      number: order.$4,
                      name: order.$1,
                      location: order.$2,
                      time: order.$3,
                      status: order.$3.toUpperCase(),
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(
                          builder: (_) => const AdminPickupDetailsPage()))))),
              if (visible.isEmpty)
                const Padding(
                    padding: EdgeInsets.only(top: 38),
                    child: Center(child: Text('No pickups in this group.'))),
            ])),
        bottomNavigationBar: AdminBottomNav(
            selectedIndex: 1, onDestinationSelected: widget.onTabChanged));
  }
}

class AdminUpdatesPage extends StatefulWidget {
  final ValueChanged<int> onTabChanged;
  const AdminUpdatesPage({super.key, required this.onTabChanged});
  @override
  State<AdminUpdatesPage> createState() => _AdminUpdatesPageState();
}

class _AdminUpdatesPageState extends State<AdminUpdatesPage> {
  final read = <int>{};
  final updates = const [
    (
      'New pickup assigned',
      'Aman Bhutani • Sector 62 • 10:00 AM – 12:00 PM',
      Icons.local_shipping_outlined
    ),
    (
      'E-waste ticket approved',
      'EW-840261 is ready for secure collection.',
      Icons.memory_outlined
    ),
    (
      'Payout completed',
      '₹180 was sent for Neha Kapoor’s pickup.',
      Icons.payments_outlined
    ),
    (
      'Route reminder',
      'Your next pickup begins in 45 minutes.',
      Icons.route_outlined
    ),
  ];
  @override
  Widget build(BuildContext context) => Scaffold(
      backgroundColor: const Color(0xFFF5F0E8),
      body: SafeArea(
          child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 100),
              children: [
            Row(children: [
              const Expanded(
                  child: Text('Updates',
                      style: TextStyle(
                          fontSize: 29,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2B5329)))),
              TextButton(
                  onPressed: () => setState(() =>
                      read.addAll(List.generate(updates.length, (i) => i))),
                  child: const Text('Mark all read'))
            ]),
            const Text('Stay on top of your pickup activity.',
                style: TextStyle(color: Color(0xFF6E756B))),
            const SizedBox(height: 18),
            ...List.generate(updates.length, (index) {
              final update = updates[index];
              final isRead = read.contains(index);
              return Card(
                  color: isRead
                      ? Colors.white.withValues(alpha: .7)
                      : Colors.white,
                  child: ListTile(
                      onTap: () => setState(() => read.add(index)),
                      contentPadding: const EdgeInsets.all(14),
                      leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                              color: const Color(0xFF2B5329)
                                  .withValues(alpha: .10),
                              shape: BoxShape.circle),
                          child:
                              Icon(update.$3, color: const Color(0xFF2B5329))),
                      title: Text(update.$1,
                          style: TextStyle(
                              fontWeight:
                                  isRead ? FontWeight.w500 : FontWeight.w800,
                              color: const Color(0xFF2B5329))),
                      subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(update.$2)),
                      trailing: isRead
                          ? null
                          : const Icon(Icons.circle,
                              color: Color(0xFFB46C1D), size: 10)));
            }),
          ])),
      bottomNavigationBar: AdminBottomNav(
          selectedIndex: 2, onDestinationSelected: widget.onTabChanged));
}

class AdminProfilePage extends StatelessWidget {
  final Account account;
  final bool online;
  final Future<void> Function() onSignOut;
  final ValueChanged<int> onTabChanged;
  const AdminProfilePage(
      {super.key,
      required this.account,
      required this.online,
      required this.onSignOut,
      required this.onTabChanged});
  @override
  Widget build(BuildContext context) => Scaffold(
      backgroundColor: const Color(0xFFF5F0E8),
      body: SafeArea(
          child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 100),
              children: [
            const Center(
                child: CircleAvatar(
                    radius: 38,
                    backgroundColor: Color(0xFFE4EEDF),
                    child: Icon(Icons.person_outline,
                        size: 39, color: Color(0xFF2B5329)))),
            const SizedBox(height: 12),
            Center(
                child: Text('${account.firstName} ${account.lastName}'.trim(),
                    style: const TextStyle(
                        fontSize: 23,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2B5329)))),
            const SizedBox(height: 3),
            Center(
                child: Text('Pickup partner • ${account.state}',
                    style: const TextStyle(color: Color(0xFF6E756B)))),
            const SizedBox(height: 24),
            InkWell(
                onTap: () => onTabChanged(0),
                borderRadius: BorderRadius.circular(18),
                child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                        color: const Color(0xFF2B5329),
                        borderRadius: BorderRadius.circular(18)),
                    child: Row(children: [
                      const Icon(Icons.power_settings_new,
                          color: Color(0xFFB8DB8F)),
                      const SizedBox(width: 12),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            const Text('Duty status',
                                style: TextStyle(
                                    color: Color(0xFFDCE8D8), fontSize: 12)),
                            Text(
                                online
                                    ? 'Online and receiving pickups'
                                    : 'Offline',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800))
                          ])),
                      const Icon(Icons.chevron_right, color: Colors.white)
                    ]))),
            const SizedBox(height: 24),
            const Text('Account',
                style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF2B5329))),
            const SizedBox(height: 8),
            ...[
              ('My earnings', Icons.account_balance_wallet_outlined),
              ('Pickup history', Icons.history_outlined),
              ('Support & FAQs', Icons.help_outline),
              ('Settings', Icons.settings_outlined)
            ].map((item) => Card(
                child: ListTile(
                    onTap: () => _openProfileItem(context, item.$1),
                    leading: Icon(item.$2, color: const Color(0xFF2B5329)),
                    title: Text(item.$1,
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    trailing: const Icon(Icons.chevron_right)))),
            const SizedBox(height: 12),
            SignOutButton(action: onSignOut),
          ])),
      bottomNavigationBar: AdminBottomNav(
          selectedIndex: 3, onDestinationSelected: onTabChanged));
}

void _openProfileItem(BuildContext context, String title) {
  if (title == 'Support & FAQs') {
    Navigator.of(context)
        .push(MaterialPageRoute(builder: (_) => const FaqPage()));
    return;
  }
  Navigator.of(context)
      .push(MaterialPageRoute(builder: (_) => AccountDetailPage(title: title)));
}

class AccountDetailPage extends StatelessWidget {
  final String title;
  const AccountDetailPage({super.key, required this.title});

  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
          child: Text(
              '$title will appear here as account activity is recorded.',
              textAlign: TextAlign.center)));
}

class AdminStat extends StatelessWidget {
  final String value, label;
  const AdminStat({super.key, required this.value, required this.label});
  @override
  Widget build(BuildContext context) => Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(16)),
      child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(value,
                style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF2B5329))),
            const SizedBox(height: 2),
            Text(label,
                style: const TextStyle(
                    fontSize: 10,
                    letterSpacing: .7,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF788276)))
          ]));
}

class AdminPickupCard extends StatelessWidget {
  final String number, name, location, time, status;
  final VoidCallback? onTap;
  const AdminPickupCard(
      {super.key,
      required this.number,
      required this.name,
      required this.location,
      required this.time,
      required this.status,
      this.onTap});
  @override
  Widget build(BuildContext context) => InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
              color: Colors.white, borderRadius: BorderRadius.circular(18)),
          child: Row(children: [
            Container(
                width: 35,
                height: 35,
                alignment: Alignment.center,
                decoration: const BoxDecoration(
                    color: Color(0xFFE4EEDF), shape: BoxShape.circle),
                child: Text(number,
                    style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2B5329)))),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(name,
                      style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2B5329))),
                  const SizedBox(height: 3),
                  Text(location,
                      style: const TextStyle(
                          fontSize: 12, color: Color(0xFF6E756B))),
                  const SizedBox(height: 5),
                  Text(time,
                      style: const TextStyle(
                          fontSize: 12, fontWeight: FontWeight.w700))
                ])),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text(status,
                  style: const TextStyle(
                      fontSize: 9,
                      color: Color(0xFF2B5329),
                      fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              const Icon(Icons.chevron_right, color: Color(0xFF2B5329))
            ])
          ])));
}

class AdminPickupDetailsPage extends StatelessWidget {
  const AdminPickupDetailsPage({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
      backgroundColor: const Color(0xFFF5F0E8),
      appBar: AppBar(
          backgroundColor: const Color(0xFFF5F0E8),
          title: const Text('Pickup details'),
          actions: [IconButton(onPressed: () => _call(context, '9876543210'), icon: const Icon(Icons.call_outlined))]),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
                color: const Color(0xFF2B5329),
                borderRadius: BorderRadius.circular(20)),
            child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('AMAN BHUTANI',
                      style: TextStyle(
                          color: Color(0xFFBCD2B7),
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1)),
                  SizedBox(height: 8),
                  Text('Sector 62, Greater Noida',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 21,
                          fontWeight: FontWeight.w800)),
                  SizedBox(height: 5),
                  Text('Tower B • Flat 802',
                      style: TextStyle(color: Color(0xFFDCE8D8)))
                ])),
        const SizedBox(height: 20),
        ...const [
          ('Material', 'E-waste devices'),
          ('Estimated weight', '1 item'),
          ('Pickup window', '10:00 AM – 12:00 PM'),
          ('Estimated payout', '₹240')
        ].map((row) => ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(row.$1,
                style: TextStyle(color: Color(0xFF6E756B), fontSize: 12)),
            subtitle: Text(row.$2,
                style: TextStyle(
                    color: Color(0xFF2B5329),
                    fontWeight: FontWeight.w800,
                    fontSize: 16)))),
        const SizedBox(height: 12),
        const Text('Instructions',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Color(0xFF2B5329))),
        const SizedBox(height: 6),
        const Text(
            'Please call at the gate. Materials will be kept near the lobby.'),
        const SizedBox(height: 22),
        FilledButton.icon(
            style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF2B5329),
                minimumSize: const Size.fromHeight(52)),
            onPressed: () => ScaffoldMessenger.of(context)
                .showSnackBar(const SnackBar(content: Text('Pickup started'))),
            icon: const Icon(Icons.play_arrow_rounded),
            label: const Text('Start pickup'))
      ]));
}

class ServicePage extends StatelessWidget {
  final AccountSession session;
  const ServicePage({super.key, required this.session});
  @override
  Widget build(BuildContext context) => PageFrame(
      session: session,
      title: 'Help & services',
      subtitle: 'Everything you need, in one place.',
      child: Column(children: [
        Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
                color: mint, borderRadius: BorderRadius.circular(18)),
            child: const Row(children: [
              Icon(Icons.receipt_long_outlined, color: teal),
              SizedBox(width: 12),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text('Latest ticket',
                        style: TextStyle(
                            fontWeight: FontWeight.w800, color: pine)),
                    Text('Pickup #BZ1024 • Assigned')
                  ]))
            ])),
        const SizedBox(height: 16),
        ...[
          ('Pickup support', Icons.local_shipping_outlined),
          ('E-waste tickets', Icons.confirmation_number_outlined),
          ('Data erasure certificate', Icons.verified_user_outlined),
          if (session.isAdmin)
            ('Admin dashboard', Icons.admin_panel_settings_outlined),
          ('FAQs', Icons.help_outline),
          ('Contact us', Icons.chat_bubble_outline)
        ].map((e) => Card(
            child: ListTile(
                onTap: () {
                  if (e.$1.startsWith('Data')) {
                    Navigator.of(context).push(MaterialPageRoute(
                        builder: (_) => const CertificatePage()));
                  }
                  if (e.$1.startsWith('E-waste')) {
                    Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => EWastePage(session: session)));
                  }
                  if (e.$1 == 'FAQs') {
                    Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const FaqPage()));
                  }
                  if (e.$1 == 'Admin dashboard') {
                    Navigator.of(context).push(MaterialPageRoute(
                        builder: (_) => AdminDashboardPage(session: session)));
                  }
                },
                leading: Icon(e.$2, color: pine),
                title: Text(e.$1,
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                trailing: const Icon(Icons.chevron_right))))
      ]));
}

class CertificatePage extends StatelessWidget {
  const CertificatePage({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Data erasure certificate')),
      body: Padding(
          padding: const EdgeInsets.all(20),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Icon(Icons.verified_user, color: teal, size: 46),
            const SizedBox(height: 16),
            const Text('Secure data erasure',
                style: TextStyle(
                    fontSize: 28, fontWeight: FontWeight.w800, color: pine)),
            const SizedBox(height: 10),
            const Text(
                'This confirms that data on your device has been securely erased.'),
            const SizedBox(height: 30),
            ...[
              'Certificate ID  BZ-ER-2026-0142',
              'Device  Samsung Galaxy A52',
              'Erased on  13 September 2026',
              'Method  NIST 800-88 Clear'
            ].map((x) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(x,
                    style: const TextStyle(fontWeight: FontWeight.w600)))),
            const Spacer(),
            SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                    onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Certificate downloaded'))),
                    icon: const Icon(Icons.download_outlined),
                    label: const Text('Download certificate')))
          ])));
}

class BasketPage extends StatefulWidget {
  final AccountSession session;
  const BasketPage({super.key, required this.session});
  @override
  State<BasketPage> createState() => _BasketPageState();
}

class TimeSlotTile extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const TimeSlotTile(
      {super.key,
      required this.label,
      required this.selected,
      required this.onTap});

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          height: 54,
          padding: const EdgeInsets.symmetric(horizontal: 15),
          decoration: BoxDecoration(
            color: selected ? mint : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
                color: selected ? teal : const Color(0xFFD9E1DA),
                width: selected ? 1.5 : 1),
          ),
          child: Row(children: [
            Icon(selected ? Icons.check_circle : Icons.schedule_outlined,
                color: selected ? teal : const Color(0xFF718078)),
            const SizedBox(width: 12),
            Text(label,
                style: TextStyle(
                    fontWeight: FontWeight.w700, color: selected ? pine : ink)),
          ]),
        ),
      );
}

class _BasketPageState extends State<BasketPage> {
  int slot = 0;
  DateTime date = DateTime.now().add(const Duration(days: 1));
  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Pickup basket')),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        const Text('Your items',
            style: TextStyle(
                fontSize: 25, fontWeight: FontWeight.w800, color: pine)),
        const SizedBox(height: 10),
        ...['E-waste • 1 item'].map(
            (x) => Card(
                child: ListTile(
                    leading: const Icon(Icons.recycling_outlined, color: teal),
                    title: Text(x),
                    trailing: const Text('Edit')))),
        const SizedBox(height: 16),
        const Text('Pickup address',
            style: TextStyle(
                fontSize: 18, fontWeight: FontWeight.w800, color: pine)),
        const SizedBox(height: 8),
        const ListTile(
            tileColor: mint,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(16))),
            leading: Icon(Icons.location_on_outlined, color: teal),
            title: Text('Aman Bhutani'),
            subtitle: Text('Sector 62, Greater Noida')),
        const SizedBox(height: 18),
        const Text('Choose a pickup date',
            style: TextStyle(
                fontSize: 18, fontWeight: FontWeight.w800, color: pine)),
        const SizedBox(height: 8),
        OutlinedButton.icon(
            onPressed: () async {
              final chosen = await showDatePicker(context: context, initialDate: date, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
              if (chosen != null) setState(() => date = chosen);
            },
            icon: const Icon(Icons.calendar_month_outlined),
            label: Text('Pickup date: ${date.day}/${date.month}/${date.year}')),
        const SizedBox(height: 20),
        const Text('Choose a time slot',
            style: TextStyle(
                fontSize: 18, fontWeight: FontWeight.w800, color: pine)),
        const SizedBox(height: 8),
        ...List.generate(
            3,
            (i) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: TimeSlotTile(
                    label: [
                      '10:00 AM – 12:00 PM',
                      '12:00 PM – 2:00 PM',
                      '2:00 PM – 4:00 PM'
                    ][i],
                    selected: slot == i,
                    onTap: () => setState(() => slot = i),
                  ),
                )),
        const SizedBox(height: 30),
        FilledButton(
            onPressed: () => showDialog(
                context: context,
                builder: (_) => AlertDialog(
                        icon: const Icon(Icons.check_circle,
                            color: teal, size: 46),
                        title: const Text('Pickup confirmed'),
                        content: const Text(
                            'Rohit will arrive during your selected window.'),
                        actions: [
                          TextButton(
                              onPressed: () => Navigator.of(context)
                                  .popUntil((r) => r.isFirst),
                              child: const Text('Done'))
                        ])),
            child: const Padding(
                padding: EdgeInsets.all(14), child: Text('Confirm pickup')))
      ]));
}
