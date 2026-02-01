import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'authAPI.dart';

final authApi = AuthApi();

class LoginPage extends StatefulWidget {
  const LoginPage({super.key, this.onLoggedIn});

  final VoidCallback? onLoggedIn;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _userOrEmail = TextEditingController();
  final _pass = TextEditingController();

  bool _loading = false;
  String _err = "";

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _err = "";
    });

    try {
      final user = await authApi.login(
        usernameOrEmail: _userOrEmail.text.trim(),
        password: _pass.text,
      );

      // Persist session
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        "user",
        jsonEncode({
          "id": user.id,
          "username": user.username,
          "email": user.email,
        }),
      );

      // Notify parent (AuthGate) to switch screens
      widget.onLoggedIn?.call();

      // For now just show it:
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Logged in as ${user.username}")),
      );
    } catch (e) {
      setState(() => _err = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _userOrEmail.dispose();
    _pass.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Login")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _userOrEmail,
              decoration: const InputDecoration(labelText: "Username or Email"),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _pass,
              obscureText: true,
              decoration: const InputDecoration(labelText: "Password"),
            ),
            const SizedBox(height: 12),
            if (_err.isNotEmpty)
              Text(_err, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _loading ? null : _login,
              child: Text(_loading ? "Logging in..." : "Login"),
            ),
          ],
        ),
      ),
    );
  }
}
