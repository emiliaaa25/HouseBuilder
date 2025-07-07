using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Infrastructure
{
    public class PublicProjectRepository : IPublicProjectRepository
    {
        private readonly ApplicationDbContext context;

        public PublicProjectRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<Result<Guid>> AddAsync(PublicProject publicProject)
        {
            try
            {
                await context.PublicProjects.AddAsync(publicProject);
                await context.SaveChangesAsync();
                return Result<Guid>.Success(publicProject.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.Failure(ex.Message);
            }
        }

        public async Task<IEnumerable<PublicProject>> GetAllAsync(Expression<Func<PublicProject, bool>>? filter = null)
        {
            IQueryable<PublicProject> query = context.PublicProjects
                .Include(p => p.Project);

            if (filter != null)
            {
                query = query.Where(filter);
            }

            return await query.OrderByDescending(p => p.PublishedAt).ToListAsync();
        }

        public async Task<PublicProject?> GetByIdAsync(Guid id)
        {
            return await context.PublicProjects
                .Include(p => p.Project)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<PublicProject?> GetByProjectIdAsync(Guid projectId)
        {
            return await context.PublicProjects
                .Include(p => p.Project)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
        }

        public async Task UpdateAsync(PublicProject publicProject)
        {
            context.PublicProjects.Update(publicProject);
            await context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var publicProject = await context.PublicProjects.FindAsync(id);
            if (publicProject != null)
            {
                var likes = context.PublicProjectLikes.Where(l => l.PublicProjectId == id);
                var views = context.PublicProjectViews.Where(v => v.PublicProjectId == id);

                context.PublicProjectLikes.RemoveRange(likes);
                context.PublicProjectViews.RemoveRange(views);
                context.PublicProjects.Remove(publicProject);

                await context.SaveChangesAsync();
            }
        }

        public async Task<bool> IsProjectPublicAsync(Guid projectId)
        {
            return await context.PublicProjects.AnyAsync(p => p.ProjectId == projectId);
        }

        public async Task<Result<bool>> ToggleLikeAsync(Guid publicProjectId, Guid userId)
        {
            try
            {
                var existingLike = await context.PublicProjectLikes
                    .FirstOrDefaultAsync(l => l.PublicProjectId == publicProjectId && l.UserId == userId);

                if (existingLike != null)
                {
                    context.PublicProjectLikes.Remove(existingLike);

                    var publicProject = await context.PublicProjects.FindAsync(publicProjectId);
                    if (publicProject != null)
                    {
                        publicProject.Likes = Math.Max(0, publicProject.Likes - 1);
                    }

                    await context.SaveChangesAsync();
                    return Result<bool>.Success(false); 
                }
                else
                {
                    var newLike = new PublicProjectLike
                    {
                        PublicProjectId = publicProjectId,
                        UserId = userId
                    };

                    await context.PublicProjectLikes.AddAsync(newLike);

                    var publicProject = await context.PublicProjects.FindAsync(publicProjectId);
                    if (publicProject != null)
                    {
                        publicProject.Likes++;
                    }

                    await context.SaveChangesAsync();
                    return Result<bool>.Success(true); 
                }
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(ex.Message);
            }
        }

        public async Task<bool> IsLikedByUserAsync(Guid publicProjectId, Guid userId)
        {
            return await context.PublicProjectLikes
                .AnyAsync(l => l.PublicProjectId == publicProjectId && l.UserId == userId);
        }

        public async Task<List<Guid>> GetLikedProjectIdsAsync(Guid userId)
        {
            return await context.PublicProjectLikes
                .Where(l => l.UserId == userId)
                .Select(l => l.PublicProjectId)
                .ToListAsync();
        }

        public async Task IncrementViewAsync(Guid publicProjectId, Guid? userId = null, string? ipAddress = null)
        {
            try
            {
                var recentThreshold = DateTime.UtcNow.AddSeconds(-10);

                var recentView = await context.PublicProjectViews
                    .Where(v => v.PublicProjectId == publicProjectId && v.ViewedAt > recentThreshold)
                    .Where(v => (userId.HasValue && v.UserId == userId) ||
                               (userId == null && v.IpAddress == ipAddress))
                    .FirstOrDefaultAsync();

                if (recentView == null)
                {
                    var newView = new PublicProjectView
                    {
                        PublicProjectId = publicProjectId,
                        UserId = userId,
                        IpAddress = ipAddress,
                        ViewedAt = DateTime.UtcNow
                    };

                    await context.PublicProjectViews.AddAsync(newView);

                    var publicProject = await context.PublicProjects.FindAsync(publicProjectId);
                    if (publicProject != null)
                    {
                        publicProject.Views++;
                    }

                    await context.SaveChangesAsync();
                    Console.WriteLine("✅ View recorded");
                }
                else
                {
                    Console.WriteLine("⚠️ Recent view detected, skipping (anti-spam)");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error recording view: {ex.Message}");
            }
        }
    }
}
