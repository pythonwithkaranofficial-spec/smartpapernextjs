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

class ApiClient {
  final http.Client _client;
  String? _authToken;

  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  void setAuthToken(String? token) {
    _authToken = token;
  }

  Map<String, String> _buildHeaders({Map<String, String>? extraHeaders}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (_authToken != null && _authToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_authToken';
    }

    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }

    return headers;
  }

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, String>? headers,
    Map<String, String>? queryParameters,
  }) async {
    try {
      final uri = Uri.parse('${AppConfig.baseUrl}$path').replace(queryParameters: queryParameters);
      final response = await _client
          .get(uri, headers: _buildHeaders(extraHeaders: headers))
          .timeout(const Duration(seconds: 45));

      return _processResponse(response);
    } on SocketException {
      throw ApiException('Network failure. Please check your internet connection.', statusCode: 0);
    } on http.ClientException catch (e) {
      throw ApiException('HTTP client error: ${e.message}', statusCode: 0);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e', statusCode: 0);
    }
  }

  Future<Map<String, dynamic>> post(
    String path, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    try {
      final uri = Uri.parse('${AppConfig.baseUrl}$path');
      final response = await _client
          .post(
            uri,
            headers: _buildHeaders(extraHeaders: headers),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 120)); // Generous timeout for Gemini AI generation

      return _processResponse(response);
    } on SocketException {
      throw ApiException('Network failure. Please check your internet connection.', statusCode: 0);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e', statusCode: 0);
    }
  }

  Future<Map<String, dynamic>> put(
    String path, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    try {
      final uri = Uri.parse('${AppConfig.baseUrl}$path');
      final response = await _client
          .put(
            uri,
            headers: _buildHeaders(extraHeaders: headers),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 45));

      return _processResponse(response);
    } on SocketException {
      throw ApiException('Network failure. Please check your internet connection.', statusCode: 0);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e', statusCode: 0);
    }
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    Map<String, String>? headers,
  }) async {
    try {
      final uri = Uri.parse('${AppConfig.baseUrl}$path');
      final response = await _client
          .delete(uri, headers: _buildHeaders(extraHeaders: headers))
          .timeout(const Duration(seconds: 45));

      return _processResponse(response);
    } on SocketException {
      throw ApiException('Network failure. Please check your internet connection.', statusCode: 0);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e', statusCode: 0);
    }
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
