export interface Extras {
    id?: string;
    houseSpecificationsId: string;
    doors?: Door[];
    windows?: Window[];
  }
  
  export interface Door {
    id?: string;
    wall: string; 
    position: number;
    path: string; 
    thumbnail: string;
    scale?: Scale
  }
  
  export interface Window {
    id?: string;
    wall: string; 
    position: number; 
    position2: number;
    path: string; 
    thumbnail: string;
    scale?: Scale
  }

  export interface Scale {
    x: number;
    y: number;
    z: number;
  }

