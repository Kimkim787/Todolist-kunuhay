import 'dart:convert';
import 'package:http/http.dart' as http;

const baseUrl = "http://192.168.254.115:5202/todos";

class Todo {
  final int id;
  final String title;
  final bool isDone;
  final DateTime createdAt;
  final DateTime lastUpdated;

  Todo({
    required this.id,
    required this.title,
    required this.isDone,
    required this.createdAt,
    required this.lastUpdated,
  });

  factory Todo.fromJson(Map<String, dynamic> j) {
    final _isDone = (j["isDone"] ?? j["isComplete"] ?? false) as bool;
    final createdRaw = (j["created_at"] ?? j["createdAt"]) as String?;
    final updatedRaw = (j["last_updated"] ?? j["lastUpdated"]) as String?;
    return Todo(
      id: j['id'] as int,
      title: j['title'] as String,
      isDone: _isDone,
      createdAt: createdRaw != null
          ? DateTime.parse(createdRaw)
          : DateTime.fromMillisecondsSinceEpoch(0),
      lastUpdated: updatedRaw != null
          ? DateTime.parse(updatedRaw)
          : DateTime.fromMillisecondsSinceEpoch(0),
    );
  }
}

class TodoApi {
  final String base;

  TodoApi({this.base = baseUrl});

  Future<List<Todo>> getAll() async {
    final res = await http.get(Uri.parse("$base/getall"));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception("GET failed: ${res.statusCode} ${res.body}");
    }
    final data = jsonDecode(res.body) as List;
    return data.map((e) => Todo.fromJson(e)).toList();
  }

  Future<void> toggle(int id) async {
    final res = await http.put(Uri.parse("$base/toggle/$id"));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception("TOGGLE failed: ${res.statusCode} ${res.body}");
    }
  }

  Future<void> add(String title) async {
    final res = await http.post(
      Uri.parse("$base/add"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"title": title}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception("ADD failed: ${res.statusCode} ${res.body}");
    }
  }

  Future<void> delete(int id) async {
    final res = await http.delete(Uri.parse("$base/delete/$id"));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception("DELETE failed: ${res.statusCode} ${res.body}");
    }
  }
}
