using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly UserContext _db;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthController(UserContext db) => _db = db;

    // POST /auth/register
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterDto dto)
    {
        var username = dto.Username.Trim();
        var email = dto.Email.Trim().ToLowerInvariant();

        var exists = await _db.Users.AnyAsync(u => u.Username == username || u.Email == email);
        if (exists) return Conflict(new { message = "Username or email already exists." });

        var user = new User
        {
            Username = username,
            Email = email
        };

        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        _db.Users.Add(user);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Username or email already exists." });
        }

        return Ok(new UserDto(user.Id, user.Username, user.Email));
    }

    // POST /auth/login
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto dto)
    {
        var key = dto.UsernameOrEmail.Trim();
        var keyLower = key.ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == key || u.Email.ToLower() == keyLower);

        if (user is null)
            return Unauthorized(new { message = "Invalid credentials." });

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (result == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Invalid credentials." });

        return Ok(new UserDto(user.Id, user.Username, user.Email));
    }
}
