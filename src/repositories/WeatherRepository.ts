import { Weather, ForecastData } from "@/models/Weather";

export interface WeatherRepository {
  /**
   * Retrieves weather forecast by ID from database
   * @param id - The string of the forecast to find
   * @returns Promise resolving to the found Weather forecast
   * @throws {NotFoundError} If forecast doesn't exist
   */
  findForecastById(_id: string): Promise<Weather>;

  /**
   * Queries external weather API for forecast
   * @param latitude - Location latitude
   * @param longitude - Location longitude
   * @returns Promise resolving to forecast data
   * @throws {ApiError} If external API call fails
   */
  queryExternalForecast(latitude: number, longitude: number): Promise<ForecastData>;
}
