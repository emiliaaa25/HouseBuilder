import { User } from "./user.model";
export interface Designer extends User {
    professionalLicenseNumber: string;
    yearsOfExperience : number;
    specialization  : string;
    certificateFilePath : string;
    status : VerificationStatus;
    adminNotes?: string;
}
export enum VerificationStatus
{
    Pending,
    Approved,
    Rejected,
    AdditionalInfoRequested
}
