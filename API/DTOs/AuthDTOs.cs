using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public record RegisterDto(
    [Required, MaxLength(50)] string Username,
    [Required, EmailAddress, MaxLength(255)] string Email,
    [Required, MinLength(6)] string Password
);

public record LoginDto(
    [Required] string UsernameOrEmail,
    [Required] string Password
);

public record UserDto(int Id, string Username, string Email);
