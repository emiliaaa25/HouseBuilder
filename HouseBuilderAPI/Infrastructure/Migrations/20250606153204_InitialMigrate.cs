using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigrate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PictureLink = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LastName = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admins", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "clients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PictureLink = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LastName = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "designers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalLicenseNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    Specialization = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CertificateFilePath = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    AdminNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PictureLink = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LastName = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_designers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "extras",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseSpecificationsId = table.Column<Guid>(type: "uuid", nullable: false),
                    Doors = table.Column<string>(type: "text", nullable: true),
                    Windows = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_extras", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "password_reset_tokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_password_reset_tokens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConstructorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Address = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "specifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ShapeType = table.Column<int>(type: "integer", nullable: false),
                    RoofType = table.Column<int>(type: "integer", nullable: false),
                    ShapeParameters = table.Column<string>(type: "text", nullable: false),
                    WallMaterial = table.Column<string>(type: "text", nullable: false),
                    RoofMaterial = table.Column<string>(type: "text", nullable: false),
                    FloorMaterial = table.Column<string>(type: "text", nullable: false),
                    MaterialCustomizations = table.Column<string>(type: "text", nullable: false),
                    NumFloors = table.Column<int>(type: "integer", nullable: false),
                    Floors = table.Column<string>(type: "text", nullable: false),
                    BaseLength = table.Column<float>(type: "real", nullable: true),
                    BaseWidth = table.Column<float>(type: "real", nullable: true),
                    CrossLength = table.Column<float>(type: "real", nullable: true),
                    CrossWidth = table.Column<float>(type: "real", nullable: true),
                    ExtensionLength = table.Column<float>(type: "real", nullable: true),
                    ExtensionWidth = table.Column<float>(type: "real", nullable: true),
                    LeftWingLength = table.Column<float>(type: "real", nullable: true),
                    LeftWingWidth = table.Column<float>(type: "real", nullable: true),
                    Length = table.Column<float>(type: "real", nullable: true),
                    MainLength = table.Column<float>(type: "real", nullable: true),
                    MainWidth = table.Column<float>(type: "real", nullable: true),
                    RightWingLength = table.Column<float>(type: "real", nullable: true),
                    RightWingWidth = table.Column<float>(type: "real", nullable: true),
                    Size = table.Column<float>(type: "real", nullable: true),
                    Width = table.Column<float>(type: "real", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_specifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "public_projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    Thumbnail = table.Column<string>(type: "text", nullable: true),
                    Views = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Likes = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    AuthorName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_public_projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_public_projects_projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "public_project_likes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PublicProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LikedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_public_project_likes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_public_project_likes_public_projects_PublicProjectId",
                        column: x => x.PublicProjectId,
                        principalTable: "public_projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "public_project_views",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PublicProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    ViewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_public_project_views", x => x.Id);
                    table.ForeignKey(
                        name: "FK_public_project_views_public_projects_PublicProjectId",
                        column: x => x.PublicProjectId,
                        principalTable: "public_projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "admins",
                columns: new[] { "Id", "Email", "FirstName", "LastName", "PasswordHash", "PhoneNumber", "PictureLink", "Username" },
                values: new object[,]
                {
                    { new Guid("94e22b10-e798-4805-a313-08fbaa4cb73d"), "admin2@gmail.com", "Admin2", "User", "$2a$11$PJ4v3s4AsHKUQQi6zBFxaus2ZOGjFOttdJYH0hUkkOJTnFIiImBBS", "0751234567", " ", "admin2" },
                    { new Guid("dd166437-d83c-4045-8c8e-19ab5de8f9ca"), "admin1@gmail.com", "Admin1", "User", "$2a$11$nsKKTmSjR8Pg8vq3jvpV/OQj14GFrQdhH.n8Twdm8GmNqMYFhttDG", "0757732675", "", "admin1" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_clients_Email",
                table: "clients",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_clients_Username",
                table: "clients",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_designers_Email",
                table: "designers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_designers_Username",
                table: "designers",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_public_project_likes_PublicProjectId_UserId",
                table: "public_project_likes",
                columns: new[] { "PublicProjectId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_public_project_views_PublicProjectId",
                table: "public_project_views",
                column: "PublicProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_public_projects_ProjectId",
                table: "public_projects",
                column: "ProjectId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admins");

            migrationBuilder.DropTable(
                name: "clients");

            migrationBuilder.DropTable(
                name: "designers");

            migrationBuilder.DropTable(
                name: "extras");

            migrationBuilder.DropTable(
                name: "password_reset_tokens");

            migrationBuilder.DropTable(
                name: "public_project_likes");

            migrationBuilder.DropTable(
                name: "public_project_views");

            migrationBuilder.DropTable(
                name: "specifications");

            migrationBuilder.DropTable(
                name: "public_projects");

            migrationBuilder.DropTable(
                name: "projects");
        }
    }
}
