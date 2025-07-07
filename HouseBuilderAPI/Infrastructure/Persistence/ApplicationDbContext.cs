using System.Collections.Generic;
using System.Reflection.Emit;
using System.Text.Json;
using Domain.Entities;
using Domain.Entities.Shapes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Project> Projects { get; set; } 
        public DbSet<Designer> Designers { get; set; } 
        public DbSet<Admin> Admins { get; set; } 
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
        public DbSet<HouseSpecifications> Specifications { get; set; }
        public DbSet<PublicProject> PublicProjects { get; set; }
        public DbSet<PublicProjectLike> PublicProjectLikes { get; set; }
        public DbSet<PublicProjectView> PublicProjectViews { get; set; }

        public DbSet<Extras> Extras { get; set; } 

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Client>(entity =>
            {
                entity.ToTable("clients");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(p => p.PictureLink).IsRequired();
                entity.Property(p => p.Username).IsRequired();
                entity.Property(p => p.FirstName).IsRequired().HasMaxLength(30);
                entity.Property(p => p.LastName).IsRequired().HasMaxLength(30);
                entity.Property(p => p.Email).IsRequired().HasMaxLength(50);
                entity.Property(p => p.PhoneNumber).IsRequired().HasMaxLength(15);
                entity.Property(p => p.PasswordHash).IsRequired();
                entity.HasIndex(p => p.Username).IsUnique();
                entity.HasIndex(p => p.Email).IsUnique();

            });

            modelBuilder.Entity<Project>(entity =>
            {
                entity.ToTable("projects");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(p => p.ConstructorId).IsRequired();

                entity.Property(p => p.Address).IsRequired().HasMaxLength(100);
                entity.Property(p => p.Description).IsRequired();

                entity.Property(p => p.Status).IsRequired();
                entity.Property(p => p.CreatedAt).IsRequired();
                entity.Property(p => p.UpdatedAt).IsRequired();
            });

            modelBuilder.Entity<Designer>(
    entity =>
    {
        entity.ToTable("designers");
        entity.HasKey(p => p.Id);
        entity.Property(p => p.Id)
              .ValueGeneratedOnAdd();
        entity.Property(p => p.PictureLink).IsRequired();
        entity.Property(p => p.Username).IsRequired().HasMaxLength(50);
        entity.Property(p => p.FirstName).IsRequired().HasMaxLength(30);
        entity.Property(p => p.LastName).IsRequired().HasMaxLength(30);
        entity.Property(p => p.Email).IsRequired().HasMaxLength(50);
        entity.Property(p => p.PhoneNumber).IsRequired().HasMaxLength(15);
        entity.Property(p => p.PasswordHash).IsRequired();
        entity.Property(p => p.ProfessionalLicenseNumber).IsRequired().HasMaxLength(20);
        entity.Property(p => p.YearsOfExperience).IsRequired();
        entity.Property(p => p.Specialization).IsRequired().HasMaxLength(50);
        entity.Property(p => p.CertificateFilePath).IsRequired();
        entity.Property(p => p.Status)
                     .HasDefaultValue(VerificationStatus.Pending);
        entity.Property(p => p.AdminNotes).HasMaxLength(500);

        entity.HasIndex(p => p.Username).IsUnique();
        entity.HasIndex(p => p.Email).IsUnique();


    });
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.ToTable("admins");
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(p => p.PictureLink).IsRequired();
                entity.Property(p => p.Username).IsRequired();
                entity.Property(p => p.FirstName).IsRequired().HasMaxLength(30);
                entity.Property(p => p.LastName).IsRequired().HasMaxLength(30);
                entity.Property(p => p.Email).IsRequired().HasMaxLength(50);
                entity.Property(p => p.PhoneNumber).IsRequired().HasMaxLength(15);
                entity.Property(p => p.PasswordHash).IsRequired();


                string hashedPassword = BCrypt.Net.BCrypt.HashPassword("Parola123!");
                string hashedPassword2 = BCrypt.Net.BCrypt.HashPassword("Parola123*");
                var birthDate = new DateTime(2004, 2, 15, 0, 0, 0, DateTimeKind.Utc);
                var birthDate2 = new DateTime(2003, 7, 20, 0, 0, 0, DateTimeKind.Utc);
                entity.HasData(
                    new Admin
                    {
                        Id = Guid.NewGuid(),
                        PictureLink = "",
                        Username = "admin1",
                        FirstName = "Admin1",
                        LastName = "User",
                        Email = "admin1@gmail.com",
                        PhoneNumber = "0757732675",
                        PasswordHash = hashedPassword,

                    },
                    new Admin
                    {
                        Id = Guid.NewGuid(),
                        PictureLink = " ",
                        Username = "admin2",
                        FirstName = "Admin2",
                        LastName = "User",
                        Email = "admin2@gmail.com",
                        PhoneNumber = "0751234567",
                        PasswordHash = hashedPassword2
                    }
                );
            });
            modelBuilder.Entity<PasswordResetToken>(entity =>
            {
                entity.ToTable("password_reset_tokens");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(prt => prt.Email);
                entity.Property(prt => prt.Token).IsRequired();
                entity.Property(prt => prt.ExpirationDate).IsRequired();
            });

            modelBuilder.Entity<HouseSpecifications>(entity =>
            {
                entity.ToTable("specifications");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id).ValueGeneratedOnAdd();
                entity.Property(p => p.ProjectId).IsRequired();
                entity.Property(p => p.RoofType).IsRequired();
                entity.Property(p => p.ShapeType).IsRequired();

              
                entity.Property(p => p.ShapeParameters)
                            .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(ConvertShapeParametersToDictionary(v), (System.Text.Json.JsonSerializerOptions?)null),
                    v => ConvertDictionaryToShapeParameters(System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, float?>>(v, (System.Text.Json.JsonSerializerOptions?)null))
                );
                

                entity.Property<float?>("Length");
                entity.Property<float?>("Width");
                entity.Property<float?>("Size");
                entity.Property<float?>("MainLength");
                entity.Property<float?>("MainWidth");
                entity.Property<float?>("ExtensionLength");
                entity.Property<float?>("ExtensionWidth");
                entity.Property<float?>("CrossLength");
                entity.Property<float?>("CrossWidth");
                entity.Property<float?>("BaseLength");
                entity.Property<float?>("BaseWidth");
                entity.Property<float?>("LeftWingLength");
                entity.Property<float?>("LeftWingWidth");
                entity.Property<float?>("RightWingLength");
                entity.Property<float?>("RightWingWidth");


                entity.Property(p => p.WallMaterial)
              .HasConversion(
                  v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                  v => System.Text.Json.JsonSerializer.Deserialize<MaterialSpecification>(v, (System.Text.Json.JsonSerializerOptions)null)
              );

                entity.Property(p => p.RoofMaterial)
                      .HasConversion(
                          v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                          v => System.Text.Json.JsonSerializer.Deserialize<MaterialSpecification>(v, (System.Text.Json.JsonSerializerOptions)null)
                      );

                entity.Property(p => p.FloorMaterial)
                      .HasConversion(
                          v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                          v => System.Text.Json.JsonSerializer.Deserialize<MaterialSpecification>(v, (System.Text.Json.JsonSerializerOptions)null)
                      );

                entity.Property(p => p.MaterialCustomizations).HasColumnType("text");

                entity.Property(p => p.NumFloors).IsRequired();
                entity.Property(p => p.Floors)
        .HasConversion(
            v => v != null ? JsonSerializer.Serialize(v, (JsonSerializerOptions)null) : "[]",
            v => string.IsNullOrEmpty(v) || v == "[]"
                ? new List<Floor>()
                : JsonSerializer.Deserialize<List<Floor>>(v, (JsonSerializerOptions)null)
        )
        .HasColumnType("text");
            });
            modelBuilder.Entity<PublicProject>(entity =>
            {
                entity.ToTable("public_projects");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id).ValueGeneratedOnAdd();
                entity.Property(p => p.ProjectId).IsRequired();
                entity.Property(p => p.Title).HasMaxLength(200);
                entity.Property(p => p.Description).HasMaxLength(1000);
                entity.Property(p => p.AuthorName).HasMaxLength(100);
                entity.Property(p => p.Thumbnail).HasColumnType("text");
                entity.Property(p => p.Views).HasDefaultValue(0);
                entity.Property(p => p.Likes).HasDefaultValue(0);
                entity.Property(p => p.PublishedAt).IsRequired();
                entity.Property(p => p.UpdatedAt).IsRequired();

                entity.HasOne(p => p.Project)
                      .WithMany()
                      .HasForeignKey(p => p.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(p => p.ProjectId).IsUnique();
            });

            modelBuilder.Entity<PublicProjectLike>(entity =>
            {
                entity.ToTable("public_project_likes");
                entity.HasKey(l => l.Id);
                entity.Property(l => l.Id).ValueGeneratedOnAdd();
                entity.Property(l => l.PublicProjectId).IsRequired();
                entity.Property(l => l.UserId).IsRequired();
                entity.Property(l => l.LikedAt).IsRequired();

                entity.HasOne(l => l.PublicProject)
                      .WithMany()
                      .HasForeignKey(l => l.PublicProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(l => new { l.PublicProjectId, l.UserId }).IsUnique();
            });

            modelBuilder.Entity<PublicProjectView>(entity =>
            {
                entity.ToTable("public_project_views");
                entity.HasKey(v => v.Id);
                entity.Property(v => v.Id).ValueGeneratedOnAdd();
                entity.Property(v => v.PublicProjectId).IsRequired();
                entity.Property(v => v.UserId); 
                entity.Property(v => v.IpAddress).HasMaxLength(45); 
                entity.Property(v => v.ViewedAt).IsRequired();

                entity.HasOne(v => v.PublicProject)
                      .WithMany()
                      .HasForeignKey(v => v.PublicProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Extras>(entity =>
            {
                entity.ToTable("extras");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(p => p.HouseSpecificationsId).IsRequired();
                entity.Property(p => p.Doors)
                        .HasConversion(
                            v => v != null ? JsonSerializer.Serialize(v, (JsonSerializerOptions)null) : "[]",
                            v => string.IsNullOrEmpty(v) || v == "[]"
                                ? new List<Door>()
                                : JsonSerializer.Deserialize<List<Door>>(v, (JsonSerializerOptions)null)
                        )
                        .HasColumnType("text");

                entity.Property(p => p.Windows)
        .HasConversion(
            v => v != null ? JsonSerializer.Serialize(v, (JsonSerializerOptions)null) : "[]",
            v => string.IsNullOrEmpty(v) || v == "[]"
                ? new List<Window>()
                : JsonSerializer.Deserialize<List<Window>>(v, (JsonSerializerOptions)null)
        )
        .HasColumnType("text");

            });


        }
        private static Dictionary<string, float?> ConvertShapeParametersToDictionary(HouseShapeParameters shapeParameters)
        {
            var dictionary = new Dictionary<string, float?>();

            switch (shapeParameters)
            {
                case RectangularShapeParameters rectangle:
                    dictionary["Length"] = rectangle.Length;
                    dictionary["Width"] = rectangle.Width;
                    break;
                case SquareShapeParameters square:
                    dictionary["Size"] = square.Size;
                    break;
                case LShapeParameters lShape:
                    dictionary["MainLength"] = lShape.MainLength;
                    dictionary["MainWidth"] = lShape.MainWidth;
                    dictionary["ExtensionLength"] = lShape.ExtensionLength;
                    dictionary["ExtensionWidth"] = lShape.ExtensionWidth;
                    break;
                case TShapeParameters tShape:
                    dictionary["MainLength"] = tShape.MainLength;
                    dictionary["MainWidth"] = tShape.MainWidth;
                    dictionary["CrossLength"] = tShape.CrossLength;
                    dictionary["CrossWidth"] = tShape.CrossWidth;
                    break;
                case UShapeParameters uShape:
                    dictionary["BaseLength"] = uShape.BaseLength;
                    dictionary["BaseWidth"] = uShape.BaseWidth;
                    dictionary["LeftWingLength"] = uShape.LeftWingLength;
                    dictionary["LeftWingWidth"] = uShape.LeftWingWidth;
                    dictionary["RightWingLength"] = uShape.RightWingLength;
                    dictionary["RightWingWidth"] = uShape.RightWingWidth;
                    break;
                default:
                    throw new InvalidOperationException("Unsupported shape type.");
            }

            return dictionary;
        }

        private static HouseShapeParameters ConvertDictionaryToShapeParameters(Dictionary<string, float?> dictionary)
        {
            if (dictionary.ContainsKey("Length") && dictionary.ContainsKey("Width"))
            {
                return new RectangularShapeParameters
                {
                    Length = dictionary["Length"] ?? 0,
                    Width = dictionary["Width"] ?? 0
                };
            }
            if (dictionary.ContainsKey("Size"))
            {
                return new SquareShapeParameters
                {
                    Size = dictionary["Size"] ?? 0
                };
            }
            if (dictionary.ContainsKey("ExtensionLength") && dictionary.ContainsKey("ExtensionWidth"))
            {
                return new LShapeParameters
                {
                    MainLength = dictionary["MainLength"] ?? 0,
                    MainWidth = dictionary["MainWidth"] ?? 0,
                    ExtensionLength = dictionary["ExtensionLength"] ?? 0,
                    ExtensionWidth = dictionary["ExtensionWidth"] ?? 0
                };
               
            }
            if(dictionary.ContainsKey("BaseLength") && dictionary.ContainsKey("BaseWidth"))
            {
                return new UShapeParameters
                {
                    BaseLength = dictionary["BaseLength"] ?? 0,
                    BaseWidth = dictionary["BaseWidth"] ?? 0,
                    LeftWingLength = dictionary["LeftWingLength"] ?? 0,
                    LeftWingWidth = dictionary["LeftWingWidth"] ?? 0,
                    RightWingLength = dictionary["RightWingLength"] ?? 0,
                    RightWingWidth = dictionary["RightWingWidth"] ?? 0
                };
            }

            if (dictionary.ContainsKey("CrossLength") && dictionary.ContainsKey("CrossWidth"))
            {
                return new TShapeParameters
                {
                    MainLength = dictionary["MainLength"] ?? 0,
                    MainWidth = dictionary["MainWidth"] ?? 0,
                    CrossLength = dictionary["CrossLength"] ?? 0,
                    CrossWidth = dictionary["CrossWidth"] ?? 0
                };
            }

            throw new InvalidOperationException("Unsupported dictionary format.");
        }
    }
}

