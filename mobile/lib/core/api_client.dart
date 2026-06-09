import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants.dart';

class ApiClient {
  static ApiClient? _instance;
  late Dio _dio;
  String? _cachedToken; // in-memory token cache — avoids disk read per request

  ApiClient._internal() {
    final baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:5000/api';
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 20),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Use cached token; fall back to disk only if cache is empty
        _cachedToken ??= (await SharedPreferences.getInstance()).getString(AppConstants.tokenKey);
        if (_cachedToken != null) {
          options.headers['Authorization'] = 'Bearer $_cachedToken';
        }
        handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          _cachedToken = null;
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove(AppConstants.tokenKey);
          await prefs.remove(AppConstants.userKey);
        }
        handler.next(e);
      },
    ));
  }

  static ApiClient get instance {
    _instance ??= ApiClient._internal();
    return _instance!;
  }

  // Called by AuthNotifier after login/logout to keep cache in sync
  void setToken(String? token) => _cachedToken = token;

  Dio get dio => _dio;

  Future<Response> get(String path, {Map<String, dynamic>? params}) async {
    return _dio.get(path, queryParameters: params);
  }

  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? params}) async {
    return _dio.post(path, data: data, queryParameters: params);
  }

  Future<Response> put(String path, {dynamic data}) async {
    return _dio.put(path, data: data);
  }

  Future<Response> delete(String path) async {
    return _dio.delete(path);
  }

  Future<Response> postFormData(String path, FormData formData) async {
    return _dio.post(path, data: formData,
      options: Options(headers: {'Content-Type': 'multipart/form-data'}));
  }

  Future<Response> putFormData(String path, FormData formData) async {
    return _dio.put(path, data: formData,
      options: Options(headers: {'Content-Type': 'multipart/form-data'}));
  }
}
