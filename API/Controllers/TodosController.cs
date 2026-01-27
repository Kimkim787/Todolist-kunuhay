using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Models;

namespace MyApi.Controllers;

[ApiController]
[Route("todos")] // => /todos
public class TodosController : ControllerBase
{
    private readonly TodoContext _db;

    public TodosController(TodoContext db) => _db = db;

    // GET /getall
    [HttpGet("getall")]
    public async Task<ActionResult<List<Todo>>> GetAll()
    {
        return Ok(await _db.Todos.ToListAsync());
    }

    // GET /todos/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Todo>> GetById(int id)
    {
        var todo = await _db.Todos.FindAsync(id);
        return todo is null ? NotFound() : Ok(todo);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<Todo>>> SearchTodo([FromQuery] string Title)
    {
        if (string.IsNullOrWhiteSpace(Title))
            return BadRequest("Title is required");

        var q = Title.Trim().ToLower();

        var results = await _db.Todos
            .Where(t => t.Title != null && t.Title.ToLower().Contains(q))
            .OrderBy(t => t.Id)
            .ToListAsync();

        return Ok(results);
    }

    [HttpPost("add")]
    public async Task<ActionResult<Todo>> AddTodo([FromBody] TodoAdd todo)
    {
        if (string.IsNullOrWhiteSpace(todo.Title))
            return BadRequest("Title is required.");

        var newtodo = new Todo
        {
            Title = todo.Title,
            IsDone = false
        };

        _db.Todos.Add(newtodo);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = newtodo.Id }, todo);
    }

    [HttpDelete("delete/{id:int}")]
    public async Task<IActionResult> DeleteTodo(int id)
    {
        var todo = await _db.Todos.FindAsync(id);
        if (todo is null) return NotFound();

        _db.Todos.Remove(todo);
        await _db.SaveChangesAsync();

        return NoContent(); // 204
    }

    [HttpPut("toggle/{id:int}")]
    public async Task<ActionResult<Todo>> Toggle(int id)
    {
        var todo = await _db.Todos.FindAsync(id);
        if (todo is null) return NotFound();

        todo.IsDone = !todo.IsDone;
        await _db.SaveChangesAsync();
        return Ok(todo);
    }
    
}