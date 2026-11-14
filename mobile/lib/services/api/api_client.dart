import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../../core/config/app_config.dart';

class ApiException implements Exception {
  final String message;
  final int statusCode;
  final dynamic details;

  ApiException(this.message, {this.statusCode = 500, this.details});

  @override
  String toString() => 'ApiException [$statusCode]: $message';
}

/// Supplies a (possibly refreshed) Firebase ID token for outgoing requests.
/// Return `null` when no user is signed in.
typedef AuthTokenProvider = Future<String?> Function({bool forceRefresh});

class ApiClient {
  final http.Client _client;
  String? _authToken;
  AuthTokenProvider? _tokenProvider;

  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  /// Caches a token (e.g. pushed from `FirebaseAuth.idTokenChanges()`).
  void setAuthToken(String? token) {
    _authToken = token;
  }

  /// Registers a provider that is asked for a fresh ID token before every
  /// request. Firebase's `getIdToken()` transparently refreshes expired tokens.
  void setTokenProvider(AuthTokenProvider? provider) {
    _tokenProvider = provider;
  }

  Future<String?> _resolveToken({bool forceRefresh = false}) async {
    final provider = _tokenProvider;
    if (provider != null) {
      try {
        final token = await provider(forceRefresh: forceRefresh);
        _authToken = (token != null && token.isNotEmpty) ? token : null;
      } catch (_) {
        // Keep the cached token if the refresh itself failed (e.g. offline).
      }
    }
    return _authToken;
  }

  Map<String, String> _buildHeaders(String? token, {Map<String, String>? extraHeaders}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }

    return headers;
  }

  /// Sends a request with a current ID token and retries exactly once with a
  /// force-refreshed token if the server answers 401.
  Future<Map<String, dynamic>> _send(
    Future<http.Response> Function(Map<String, String> headers) send, {
    Map<String, String>? extraHeaders,
    required Duration timeout,
  }) async {
    try {
      var token = await _resolveToken();
      var response = await send(_buildHeaders(token, extraHeaders: extraHeaders)).timeout(timeout);

      if (response.statusCode == 401 && _tokenProvider != null) {
        final refreshed = await _resolveToken(forceRefresh: true);
        if (refreshed != null && refreshed.isNotEmpty) {
          token = refreshed;
          response = await send(_buildHeaders(token, extraHeaders: extraHeaders)).timeout(timeout);
        }
      }

      return _processResponse(response);
    } on SocketException {
      throw ApiException('Network failure. Please check your internet connection.', statusCode: 0);
    } on TimeoutException {
      throw ApiException('The server took too long to respond. Please try again.', statusCode: 0);
    } on http.ClientException catch (e) {
      throw ApiException('HTTP client error: ${e.message}', statusCode: 0);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e', statusCode: 0);
    }
  }

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, String>? headers,
    Map<String, String>? queryParameters,
  }) {
    final uri = Uri.parse('${AppConfig.baseUrl}$path').replace(queryParameters: queryParameters);
    return _send(
      (h) => _client.get(uri, headers: h),
      extraHeaders: headers,
      timeout: const Duration(seconds: 45),
    );
  }

  Future<Map<String, dynamic>> post(
    String path, {
    dynamic body,
    Map<String, String>? headers,
  }) {
    final uri = Uri.parse('${AppConfig.baseUrl}$path');
    final encoded = body != null ? jsonEncode(body) : null;
    return _send(
      (h) => _client.post(uri, headers: h, body: encoded),
      extraHeaders: headers,
      timeout: const Duration(seconds: 120), // Generous timeout for Gemini AI generation
    );
  }

  Future<Map<String, dynamic>> put(
    String path, {
    dynamic body,
    Map<String, String>? headers,
  }) {
    final uri = Uri.parse('${AppConfig.baseUrl}$path');
    final encoded = body != null ? jsonEncode(body) : null;
    return _send(
      (h) => _client.put(uri, headers: h, body: encoded),
      extraHeaders: headers,
      timeout: const Duration(seconds: 45),
    );
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    Map<String, String>? headers,
  }) {
    final uri = Uri.parse('${AppConfig.baseUrl}$path');
    return _send(
      (h) => _client.delete(uri, headers: h),
      extraHeaders: headers,
      timeout: const Duration(seconds: 45),
    );
  }

  Map<String, dynamic> _processResponse(http.Response response) {
    dynamic bodyJson;
    try {
      if (response.body.isNotEmpty) {
        bodyJson = jsonDecode(response.body);
      }
    } catch (_) {
      bodyJson = null;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (bodyJson is Map<String, dynamic>) {
        return bodyJson;
      }
      return {'data': bodyJson};
    }

    final errorMessage = (bodyJson is Map && bodyJson.containsKey('error'))
        ? bodyJson['error'].toString()
        : 'Request failed with status: ${response.statusCode}';

    throw ApiException(
      errorMessage,
      statusCode: response.statusCode,
      details: bodyJson,
    );
  }
}
