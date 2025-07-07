using Microsoft.AspNetCore.Http;

namespace Domain.Repositories
{
    public interface IFileStorageService
    {
        public Task<string> SaveFileAsync(IFormFile file, string folderName, string containerName);
        void DeleteFile(string fileUrl);
    }


}
