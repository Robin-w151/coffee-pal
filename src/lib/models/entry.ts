export interface Entry {
  id: string;
  method: string;
  water: number;
  waterTemperature?: number;
  coffee: number;
  coffeeType?: string;
  grindSettings?: string;
  description?: string;
  timestamp: string;
}
