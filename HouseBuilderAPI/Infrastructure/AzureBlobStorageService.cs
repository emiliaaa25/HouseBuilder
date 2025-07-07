using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs;
using Domain.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Infrastructure
{
    public class AzureBlobStorageService : IFileStorageService
    {
        private readonly string _connectionString;
        private readonly string _containerName;

        public AzureBlobStorageService(IConfiguration configuration)
        {
            _connectionString = configuration["AzureStorage:ConnectionString"];
            _containerName = configuration["AzureStorage:ContainerName"];
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folderName, string containerName)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty or null", nameof(file));
            }

            var blobServiceClient = new BlobServiceClient(_connectionString);

            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            string uniqueFileName = $"{folderName}/{Guid.NewGuid()}_{file.FileName.Replace(" ", "_")}";

            var blobClient = containerClient.GetBlobClient(uniqueFileName);

            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = file.ContentType
            };

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = blobHttpHeaders });
            }

            return blobClient.Uri.ToString();
        }

        public void DeleteFile(string fileUrl)
        {
            try
            {
                var uri = new Uri(fileUrl);
                var blobPath = uri.AbsolutePath.Substring(uri.AbsolutePath.IndexOf(_containerName) + _containerName.Length + 1);

                var blobServiceClient = new BlobServiceClient(_connectionString);

                var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);

                var blobClient = containerClient.GetBlobClient(blobPath);

                blobClient.DeleteIfExists();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting blob: {ex.Message}");
            }
        }
    }
}