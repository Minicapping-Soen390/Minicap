import { Weather, ForecastData } from "@/models/Weather";

export interface WeatherRepository {
  /**
   * Retrieves weather forecast by _id from database
   * @param _id - The string of the forecast to find
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

  /**
   * Saves forecast data to database
   * @param data - Forecast data to save
   * @returns Promise resolving to saved Weather forecast
   * @throws {ValidationError} If data is invalid
   */
  saveForecast(data: Omit<Weather, "id" | "createdAt" | "updatedAt">): Promise<Weather>;

  /**
   * Updates existing forecast in database
   * @param _id - The string of the forecast to update
   * @param data - Partial forecast data to update
   * @returns Promise resolving to updated Weather forecast
   * @throws {NotFoundError} If forecast doesn't exist
   */
  updateForecast(_id: string, data: Partial<Weather>): Promise<Weather>;

  /**
   * Deletes outdated forecasts from database
   * @param olderThan - Delete forecasts older than this date
   * @returns Promise resolving to number of deleted forecasts
   */
  deleteOutdatedForecasts(olderThan: string): Promise<number>;
}
