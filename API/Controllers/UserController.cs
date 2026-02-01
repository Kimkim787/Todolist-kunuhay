using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly UserContext _db;
    private readonly PasswordHasher<User> _hasher = new();

    public UsersController(UserContext db)
    {
        _db = db;
    }

    // POST /users/register
    [HttpPost("register")]
    public async Task<ActionResult<UserPublicDto>> Register([FromBody] RegisterUserDto dto)
    {
        // basic normalization
        var username = dto.Username.Trim();
        var email = dto.Email.Trim().ToLowerInvariant();

        // check duplicates (fast, friendly error)
        var exists = await _db.Users.AnyAsync(u => u.Username == username || u.Email == email);
        if (exists)
            return Conflict(new { message = "Username or email already exists." });

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
            // In case two requests race each other, DB unique index still protects you
            return Conflict(new { message = "Username or email already exists." });
        }

        var result = new UserPublicDto(user.Id, user.Username, user.Email);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, result);
    }

    // GET /users/123
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserPublicDto>> GetById(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound();

        return Ok(new UserPublicDto(user.Id, user.Username, user.Email));
    }

    // POST /users/login
    // (No JWT/session yet; this just verifies credentials)
    [HttpPost("login")]
    public async Task<ActionResult<UserPublicDto>> Login([FromBody] LoginUserDto dto)
    {
        var key = dto.UsernameOrEmail.Trim();
        var keyLower = key.ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == key || u.Email.ToLower() == keyLower);

        if (user is null)
            return Unauthorized(new { message = "Invalid credentials." });

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (verify == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Invalid credentials." });

        return Ok(new UserPublicDto(user.Id, user.Username, user.Email));
    }
}
