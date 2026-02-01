using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace API.Models;

public partial class User
{
    public int Id{ get; set; }
    
    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [ Required, EmailAddress, MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [ Required ]
    public string PasswordHash { get; set; } = string.Empty;
}