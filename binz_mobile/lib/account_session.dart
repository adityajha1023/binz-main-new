import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

const _apiUrl = String.fromEnvironment(
  'BINZ_API_URL',
  defaultValue: 'https://binz-backend.onrender.com',
);
const _tokenKey = 'binz_session_token';

class Account {
  final String firstName;
  final String lastName;
  final String email;
  final String state;
  final int coins;
  final bool admin;

  const Account(
      {required this.firstName,
      required this.lastName,
      required this.email,
      required this.state,
      required this.coins,
      required this.admin});

  factory Account.fromJson(Map<String, dynamic> json) => Account(
        firstName: json['firstName'] as String? ?? '',
        lastName: json['lastName'] as String? ?? '',
        email: json['email'] as String? ?? '',
        state: json['state'] as String? ?? '',
        coins: (json['coins'] as num? ?? 0).round(),
        admin: json['admin'] == true,
      );
}

class AccountSession extends ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  bool ready = false;
  Account? account;
  String? _token;

  bool get signedIn => account != null;
  bool get isAdmin => account?.admin == true;
  String get apiUrl => _apiUrl.replaceAll(RegExp(r'/+$'), '');
  bool get configured => apiUrl.isNotEmpty;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'X-Client-Platform': 'flutter',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  /// Render can take a short time to wake a sleeping instance. Keep the user
  /// on the sign-in/sign-out screen while transient requests are retried.
  Future<http.Response> _sendWithBuffer(
      Future<http.Response> Function() request) async {
    http.Response? lastResponse;
    Object? lastError;
    for (var attempt = 0; attempt < 4; attempt++) {
      try {
        final response = await request().timeout(const Duration(seconds: 25));
        if (response.statusCode < 500 || attempt == 3) return response;
        lastResponse = response;
      } catch (error) {
        lastError = error;
      }
      await Future<void>.delayed(Duration(seconds: 2 + (attempt * 2)));
    }
    if (lastResponse != null) return lastResponse;
    throw StateError(
        'The server is taking longer than expected. Please keep this screen open and try again. ${lastError ?? ''}');
  }

  Future<Map<String, dynamic>> _request(String path,
      {String method = 'GET', Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$apiUrl$path');
    final response = await _sendWithBuffer(() => method == 'POST'
        ? http.post(uri, headers: _headers, body: jsonEncode(body))
        : http.get(uri, headers: _headers));
    final payload = response.body.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw StateError(payload['message'] as String? ?? 'Unable to load data.');
    }
    return payload;
  }

  Future<void> restore() async {
    _token = await _storage.read(key: _tokenKey);
    if (_token != null && configured) {
      try {
        final response =
            await http.get(Uri.parse('$apiUrl/session'), headers: _headers);
        if (response.statusCode >= 200 && response.statusCode < 300) {
          account = Account.fromJson(
              jsonDecode(response.body) as Map<String, dynamic>);
        }
      } catch (_) {
        // Start signed out if the API is unavailable; the sign-in screen explains configuration.
      }
    }
    ready = true;
    notifyListeners();
  }

  Future<void> signIn(String email, String password) =>
      _authenticate('/login', {
        'email': email.trim().toLowerCase(),
        'password': password,
      });

  Future<void> register(
          {required String firstName,
          required String lastName,
          required String email,
          required String password,
          required String state}) =>
      _authenticate('/register', {
        'firstName': firstName.trim(),
        'lastName': lastName.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        'state': state.trim(),
      });

  Future<void> _authenticate(String path, Map<String, String> body) async {
    if (!configured) {
      throw StateError('The app is not configured with the Render API URL.');
    }
    final response = await _sendWithBuffer(() => http.post(
        Uri.parse('$apiUrl$path'), headers: _headers, body: jsonEncode(body)));
    final payload = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw StateError(
          payload['message'] as String? ?? 'Unable to access your account.');
    }
    final token = payload['sessionToken'] as String?;
    if (token == null || token.isEmpty) {
      throw StateError('The server did not return a mobile session.');
    }
    _token = token;
    await _storage.write(key: _tokenKey, value: token);
    account =
        Account.fromJson((payload['User'] ?? payload) as Map<String, dynamic>);
    notifyListeners();
  }

  Future<void> signOut() async {
    if (configured && _token != null) {
      final response = await _sendWithBuffer(
          () => http.post(Uri.parse('$apiUrl/logout'), headers: _headers));
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw StateError('Unable to sign out. Please try again.');
      }
    }
    _token = null;
    account = null;
    await _storage.delete(key: _tokenKey);
    notifyListeners();
  }

  Future<void> refreshAccount() async {
    if (!signedIn) return;
    final payload = await _request('/session');
    account = Account.fromJson(payload);
    notifyListeners();
  }

  Future<Map<String, dynamic>> dashboard() async {
    final payload = await _request('/dashboard');
    if (payload['account'] is Map<String, dynamic>) {
      account = Account.fromJson(payload['account'] as Map<String, dynamic>);
      notifyListeners();
    }
    return payload;
  }

  Future<List<Map<String, dynamic>>> tickets() async {
    final payload = await _request('/tickets/me');
    return (payload['tickets'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .toList();
  }

  Future<List<Map<String, dynamic>>> adminTickets() async {
    final payload = await _request('/admin/ewaste-tickets');
    return (payload['tickets'] as List<dynamic>? ?? const [])
        .whereType<Map<String, dynamic>>()
        .toList();
  }

  Future<Map<String, dynamic>> createTicket({
    required String deviceType,
    required String details,
    required DateTime pickupAt,
  }) =>
      _request('/submit-ticket', method: 'POST', body: {
        'eWasteType': deviceType,
        'productName': deviceType,
        'productCategory': 'E-waste',
        'description': details,
        'scheduledPickupAt': pickupAt.toUtc().toIso8601String(),
      });

  Future<int> uploadCleanupVideo(XFile video) async {
    final request = http.MultipartRequest('POST', Uri.parse('$apiUrl/uploadVideo'));
    request.headers['X-Client-Platform'] = 'flutter';
    if (_token != null) request.headers['Authorization'] = 'Bearer $_token';
    request.files.add(await http.MultipartFile.fromPath('video', video.path));
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    final payload = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw StateError(payload['message'] as String? ?? 'Unable to submit the video.');
    }
    final coins = (payload['coins'] as num? ?? account?.coins ?? 0).round();
    if (account != null) {
      account = Account(firstName: account!.firstName, lastName: account!.lastName,
          email: account!.email, state: account!.state, coins: coins, admin: account!.admin);
      notifyListeners();
    }
    return coins;
  }
}
