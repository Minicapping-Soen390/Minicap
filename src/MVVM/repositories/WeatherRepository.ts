import { Weather, ForecastData } from "@/MVVM/models/Weather";
import { IWeatherRepository } from "./Interfaces/IWeatherRepository";
import { BaseRepository } from "./BaseRepository";

// Export the interface for backward compatibility
export { IWeatherRepository as WeatherRepository };

export class WeatherRepositoryImpl extends BaseRepository<Weather> implements IWeatherRepository {
  async getCurrentWeather(latitude: number, longitude: number): Promise<Weather> {
    throw new Error("Method not implemented: getCurrentWeather");
  }
  
  async getWeatherForecast(latitude: number, longitude: number, days: number = 7): Promise<ForecastData[]> {
    throw new Error("Method not implemented: getWeatherForecast");
  }
  
  async getWeatherAlerts(latitude: number, longitude: number): Promise<any[]> {
    throw new Error("Method not implemented: getWeatherAlerts");
  }
  
  async getHistoricalWeather(latitude: number, longitude: number, date: Date): Promise<Weather> {
    throw new Error("Method not implemented: getHistoricalWeather");
  }
}
