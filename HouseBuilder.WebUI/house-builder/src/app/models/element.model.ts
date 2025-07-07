import { Scale } from "./extras.model";

export interface PlacedElement {
  id: string;
  type: 'door' | 'window';
  modelId: string;
  wall: string;
  position: number; 
  position2?: number; 
  path: string;
  thumbnail: string;
  scale?: Scale;
}

export const DEFAULT_SCALES = {
  door: { x: 1.0, y: 1.0, z: 1.0 },
  window: { x: 0.5, y: 0.5, z: 0.5 }
};