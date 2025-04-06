import { Weather, ForecastData } from "@/MVVM/models/Weather";

export interface IWeatherRepository {
  /**
   * Gets current weather for a location
   * @param latitude - The latitude coordinate
   * @param longitude - The longitude coordinate
   * @returns Promise resolving to current weather data
   * @throws {ServiceError} If weather service is unavailable
   */
  getCurrentWeather(latitude: number, longitude: number): Promise<Weather>;
  
  /**
   * Gets weather forecast for a location
   * @param latitude - The latitude coordinate
   * @param longitude - The longitude coordinate
   * @param days - Number of days to forecast (default: 7)
   * @returns Promise resolving to weather forecast array
   * @throws {ServiceError} If weather service is unavailable
   */
  getWeatherForecast(latitude: number, longitude: number, days?: number): Promise<ForecastData[]>;
  
  /**
   * Gets weather alerts for a location
   * @param latitude - The latitude coordinate
   * @param longitude - The longitude coordinate
   * @returns Promise resolving to weather alerts array
   * @throws {ServiceError} If weather service is unavailable
   */
  getWeatherAlerts(latitude: number, longitude: number): Promise<any[]>;
  
  /**
   * Gets historical weather data for a location on a specific date
   * @param latitude - The latitude coordinate
   * @param longitude - The longitude coordinate
   * @param date - The date to get historical data for
   * @returns Promise resolving to weather data
   * @throws {ServiceError} If weather service is unavailable
   * @throws {ValidationError} If date is invalid or too old
   */
  getHistoricalWeather(latitude: number, longitude: number, date: Date): Promise<Weather>;
}
