import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Weather, ForecastData } from "@/models/Weather";
import { WeatherRepository } from "@/repositories/WeatherRepository";
import { MMKVLoader, create } from "react-native-mmkv-storage";

export class WeatherViewModel extends BaseViewModel<Weather> implements WeatherRepository {
    private readonly COLLECTION = "weather";
    // Added MMKV storage instance for weather collection
    private readonly weatherStorage = create(new MMKVLoader().initialize());

    async findForecastById(_id: string): Promise<Weather> {
        throw new Error("Method not implemented: findForecastById");
    }

    async queryExternalForecast(latitude: number, longitude: number): Promise<ForecastData> {
        throw new Error("Method not implemented: queryExternalForecast");
    }

    async saveForecast(data: Omit<Weather, "id" | "createdAt" | "updatedAt">): Promise<Weather> {
        throw new Error("Method not implemented: saveForecast");
    }

    async updateForecast(_id: string, data: Partial<Weather>): Promise<Weather> {
        throw new Error("Method not implemented: updateForecast");
    }

    async deleteOutdatedForecasts(olderThan: string): Promise<number> {
        throw new Error("Method not implemented: deleteOutdatedForecasts");
    }

    protected mapToDTO(doc: any): Weather {
        if (!doc) throw new Error('Document not found');
        return {
            _id: doc._id,
            ...doc
        } as Weather;
    }
}
