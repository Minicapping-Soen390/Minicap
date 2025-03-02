import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Weather, ForecastData } from "@/models/Weather";
import { WeatherRepository } from "@/repositories/WeatherRepository";

export class WeatherViewModel extends BaseViewModel<Weather> implements WeatherRepository {
    private readonly COLLECTION = "weather";

    async findForecastById(id: string): Promise<Weather> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async queryExternalForecast(latitude: number, longitude: number): Promise<ForecastData> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async saveForecast(data: Omit<Weather, "id" | "createdAt" | "updatedAt">): Promise<Weather> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async updateForecast(id: string, data: Partial<Weather>): Promise<Weather> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async deleteOutdatedForecasts(olderThan: Date): Promise<number> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    protected mapToDTO(doc: any): Weather {
        throw new Error("NotImplementedError: Operation not implemented");
    }
}
