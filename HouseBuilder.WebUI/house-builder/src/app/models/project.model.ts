export interface Project {
    id: string;
    constructorId: string;
    address: string;
    description: string;
    status : ProjectStatus;
    createdAt: string;
    
    updatedAt: string;
  }

  enum ProjectStatus {
    Pending,
    InProgress,
    Completed,
  }