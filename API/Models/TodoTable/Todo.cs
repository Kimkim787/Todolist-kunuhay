using System;
using System.Collections.Generic;

namespace API.Models;

public partial class Todo
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public bool IsDone { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime LastUpdated { get; set; }
}

public partial class TodoAdd
{
    public string Title { get; set; } = null!;
    public bool isDone { get; set; } 
}