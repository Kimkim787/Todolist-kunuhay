import 'dart:convert';
import 'package:http/http.dart' as http;

/// Change this to match your backend.
/// Android emulator -> use 10.0.2.2 instead of localhost.
/// Physical device -> use your PC LAN IP (e.g. http://192.168.x.x:5202)
const String baseUrl = "http://192.168.70.16:5202"; // emulator example

class UserDto {
  final int id;
  final String username;
  final String email;

  UserDto({
    required this.id,
    required this.username,
    required this.email,
  });

  factory UserDto.fromJson(Map<String, dynamic> j) => UserDto(
        id: (j["id"] as num).toInt(),
        username: (j["username"] ?? "") as String,
        email: (j["email"] ?? "") as String,
      );
}

class AuthApi {
  final String base;
  final http.Client _client;

  AuthApi({this.base = baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  Future<UserDto> register({
    required String username,
    required String email,
    required String password,
  }) async {
    final uri = Uri.parse("$base/auth/register");
    final res = await _client.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "username": username,
        "email": email,
        "password": password,
      }),
    );

    return _handleUserResponse(res, defaultErr: "Registration failed");
  }

  Future<UserDto> login({
    required String usernameOrEmail,
    required String password,
  }) async {
    final uri = Uri.parse("$base/auth/login");
    final res = await _client.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "usernameOrEmail": usernameOrEmail,
        "password": password,
      }),
    );

    return _handleUserResponse(res, defaultErr: "Login failed");
  }

  UserDto _handleUserResponse(http.Response res, {required String defaultErr}) {
    // Success
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return UserDto.fromJson(data);
    }

    // Try to read { message: "..." } from your API
    try {
      final obj = jsonDecode(res.body);
      if (obj is Map && obj["message"] != null) {
        throw Exception("${obj["message"]} (HTTP ${res.statusCode})");
      }
    } catch (_) {
      // ignore parsing errors
    }

    throw Exception("$defaultErr (HTTP ${res.statusCode})");
  }
}
