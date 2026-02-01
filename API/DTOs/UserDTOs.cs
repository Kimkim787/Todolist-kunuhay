using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public record RegisterUserDto(
    [Required, MaxLength(50)] string Username,
    [Required, EmailAddress, MaxLength(255)] string Email,
    [Required, MinLength(6), MaxLength(100)] string Password
);

public record LoginUserDto(
    [Required] string UsernameOrEmail,
    [Required] string Password
);

public record UserPublicDto(int Id, string Username, string Email);
