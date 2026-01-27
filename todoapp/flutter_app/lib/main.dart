import 'package:flutter/material.dart';
import 'api.dart';

void main() => runApp(const MyApp());

final api = TodoApi(); // uses baseUrl from api.dart

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.indigo,
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      home: const TodoPage(),
    );
  }
}

class TodoPage extends StatefulWidget {
  const TodoPage({super.key});

  @override
  State<TodoPage> createState() => _TodoPageState();
}

class _TodoPageState extends State<TodoPage> {
  final _controller = TextEditingController();

  List<Todo> _todos = [];
  bool _loading = true;
  String _err = "";

  @override
  void initState() {
    super.initState();
    _loadTodos();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _loadTodos() async {
    try {
      setState(() {
        _loading = true;
        _err = "";
      });
      final items = await api.getAll();
      setState(() => _todos = items);
    } catch (e) {
      setState(() => _err = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _addTodo() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    try {
      await api.add(text);       // requires add() in api.dart
      _controller.clear();
      await _loadTodos();        // refresh from DB
    } catch (e) {
      setState(() => _err = e.toString());
    }
  }

  Future<void> _toggleTodo(Todo t) async {
    try {
      await api.toggle(t.id);    // requires toggle() in api.dart
      await _loadTodos();
    } catch (e) {
      setState(() => _err = e.toString());
    }
  }

  Future<void> _deleteTodo(Todo t) async {
    try {
      await api.delete(t.id);    // requires delete() in api.dart
      await _loadTodos();
    } catch (e) {
      setState(() => _err = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Todo List"),
        actions: [
          IconButton(
            onPressed: _loadTodos,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    onSubmitted: (_) => _addTodo(),
                    decoration: const InputDecoration(
                      hintText: "Add a task...",
                      prefixIcon: Icon(Icons.add_task),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                FilledButton(onPressed: _addTodo, child: const Text("Add")),
              ],
            ),
            const SizedBox(height: 16),

            if (_err.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(_err, style: const TextStyle(color: Colors.red)),
              ),

            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : RefreshIndicator(
                      onRefresh: _loadTodos,
                      child: _todos.isEmpty
                          ? ListView(
                              children: [
                                SizedBox(height: 200),
                                Center(child: Text("No tasks yet. Add one!")),
                              ],
                            )
                          : ListView.separated(
                              itemCount: _todos.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 10),
                              itemBuilder: (context, i) {
                                final t = _todos[i];
                                return Dismissible(
                                  key: ValueKey(t.id),
                                  direction: DismissDirection.endToStart,
                                  // onDismissed: (_) => _deleteTodo(t),
                                  background: Container(
                                    alignment: Alignment.centerRight,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16),
                                    decoration: BoxDecoration(
                                      color: Colors.red.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: const Icon(Icons.delete,
                                        color: Colors.red),
                                  ),
                                  child: Card(
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                      side: BorderSide(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .outlineVariant,
                                      ),
                                    ),
                                    child: ListTile(
                                      leading: Checkbox(
                                        value: t.isDone,
                                        onChanged: (_) => _toggleTodo(t),
                                      ),
                                      title: Text(
                                        t.title,
                                        style: TextStyle(
                                          decoration: t.isDone
                                              ? TextDecoration.lineThrough
                                              : null,
                                        ),
                                      ),
                                      trailing: IconButton(
                                        icon: const Icon(Icons.close),
                                        onPressed: () => _deleteTodo(t),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
