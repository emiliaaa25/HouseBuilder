import { Floor } from "./floor.model";
import { MaterialSpecification } from "./materialSpecification.model";

export interface HouseSpecifications {
    id?: string;
    projectId: string;
    roofType: RoofType;
    shapeType?: HouseShapeType;
    shapeParameters?: { [key: string]: number };
    
    length?: number;
    width?: number;
    size?: number;
    mainLength?: number;
    mainWidth?: number;
    extensionLength?: number;
    extensionWidth?: number;
    crossLength?: number;
    crossWidth?: number;
    baseLength?: number;
    baseWidth?: number;
    leftWingLength?: number;
    leftWingWidth?: number;
    rightWingLength?: number;
    rightWingWidth?: number;
  wallMaterial: MaterialSpecification;
  roofMaterial: MaterialSpecification;
  floorMaterial: MaterialSpecification;
  
  materialCustomizations: string;

  numFloors: number;
  floors: Floor[];

}
export enum RoofType {
    Gable, 
 Hip,
 Mansard,
 Flat,
 Shed,
 Pyramid,
 Dome,
 Cross_gabled,
 Intersecting_hip,
 Gable_roof_with_extension,
 Hip_roof_with_extension,
 Cross_gabled_T_configuration,
 Multiple_valley,
 Multiple_gable,
 Courtyard,
 Complex_hip_and_valley,
 Connected_section,
 Partial_flat_roof_with_hipped_wings
    }

    export enum HouseShapeType {
        Rectangular = 0,
        Square = 1,
        LShape = 2,
        TShape = 3,
        UShape = 4
      }