using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace API.Models;

public partial class TodoContext : DbContext
{
    public TodoContext()
    {

    }

    public TodoContext(DbContextOptions<TodoContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Todo> Todos { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
    {
        if (!optionsBuilder.IsConfigured)
        {
            // Fallback for design-time usage; runtime configuration comes from Program.cs
            optionsBuilder.UseSqlServer("Server=CLEMENT\\MSSQLSERVER01;Database=study;Trusted_Connection=True;TrustServerCertificate=True");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Todo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Todos__3213E83F1EB5C880");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsDone).HasColumnName("isDone");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");

            entity.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.Property(x => x.LastUpdated)
            .HasColumnName("last_updated")
            .HasDefaultValueSql("SYSUTCDATETIME()");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

    public override int SaveChanges()
    {
        TouchLastUpdated();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        TouchLastUpdated();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void TouchLastUpdated()
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<Todo>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.LastUpdated = now;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastUpdated = now;
            }
        }
    }
}
