import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../core/api_client.dart';
import '../core/constants.dart';

class AuthState {
  final UserModel? user;
  final String? token;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.token, this.isLoading = false, this.error});

  bool get isAuthenticated => token != null && user != null;

  AuthState copyWith({UserModel? user, String? token, bool? isLoading, String? error}) {
    return AuthState(
      user: user ?? this.user,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _api;
  late final Future<void> initialized;

  AuthNotifier(this._api) : super(const AuthState()) {
    initialized = _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    final userStr = prefs.getString(AppConstants.userKey);
    if (token != null && userStr != null) {
      try {
        final user = UserModel.fromJson(jsonDecode(userStr) as Map<String, dynamic>);
        ApiClient.instance.setToken(token); // warm up in-memory cache
        state = AuthState(user: user, token: token);
      } catch (_) {}
    }
  }

  Future<void> _saveToStorage(UserModel user, String token) async {
    ApiClient.instance.setToken(token);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.tokenKey, token);
    await prefs.setString(AppConstants.userKey, jsonEncode(user.toJson()));
  }

  Future<String?> sendOtp(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _api.sendOtp(email);
      state = state.copyWith(isLoading: false);
      return null;
    } catch (e) {
      final msg = _errorMessage(e);
      state = state.copyWith(isLoading: false, error: msg);
      return msg;
    }
  }

  Future<String?> verifyOtp(String email, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.verifyOtp(email, otp);
      final token = res['token'] as String;
      final user = UserModel.fromJson(res['user'] as Map<String, dynamic>);
      await _saveToStorage(user, token);
      state = AuthState(user: user, token: token);
      return null;
    } catch (e) {
      final msg = _errorMessage(e);
      state = state.copyWith(isLoading: false, error: msg);
      return msg;
    }
  }

  Future<String?> register(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _api.register(data);
      final token = res['token'] as String?;
      final userMap = res['user'] as Map<String, dynamic>?;
      if (token != null && userMap != null) {
        final user = UserModel.fromJson(userMap);
        await _saveToStorage(user, token);
        state = AuthState(user: user, token: token);
      } else {
        state = state.copyWith(isLoading: false);
      }
      return null;
    } catch (e) {
      final msg = _errorMessage(e);
      state = state.copyWith(isLoading: false, error: msg);
      return msg;
    }
  }

  Future<void> logout() async {
    ApiClient.instance.setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
    state = const AuthState();
  }

  String _errorMessage(Object e) {
    // Dio errors carry response data
    final str = e.toString();
    if (str.contains('Invalid OTP')) return 'Invalid or expired OTP.';
    if (str.contains('401')) return 'Invalid credentials.';
    if (str.contains('SocketException') || str.contains('Connection')) {
      return 'No internet connection.';
    }
    return 'Something went wrong. Please try again.';
  }
}

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(apiServiceProvider));
});
