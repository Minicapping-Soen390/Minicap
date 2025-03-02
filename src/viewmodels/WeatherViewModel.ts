import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Weather, ForecastData } from "@/models/Weather";
import { WeatherRepository } from "@/repositories/WeatherRepository";
import { Audit } from "@/models/Audit";

export class WeatherViewModel extends BaseViewModel<Weather> implements WeatherRepository {
    private readonly COLLECTION = "weather";

    async findForecastById(id: string): Promise<Weather> {
        throw new Error("Method not implemented: findForecastById");
    }

    async queryExternalForecast(latitude: number, longitude: number): Promise<ForecastData> {
        throw new Error("Method not implemented: queryExternalForecast");
    }

    async saveForecast(data: Omit<Weather, "id" | "createdAt" | "updatedAt">): Promise<Weather> {
        throw new Error("Method not implemented: saveForecast");
    }

    async updateForecast(id: string, data: Partial<Weather>): Promise<Weather> {
        throw new Error("Method not implemented: updateForecast");
    }

    async deleteOutdatedForecasts(olderThan: Date): Promise<number> {
        throw new Error("Method not implemented: deleteOutdatedForecasts");
    }

    protected mapToDTO(doc: any): Weather {
        if (!doc) throw new Error('Document not found');
        return {
            _id: doc._id,
            ...doc,
            createdAtUTC: doc.createdAtUTC,
            updatedAtUTC: doc.updatedAtUTC,
            createdBy: doc.createdBy,
            updatedBy: doc.updatedBy
        } as Weather;
    }

    protected async updateAudit(existingAudit: Partial<Audit> | null, userId: string): Promise<Audit> {
        throw new Error("Method not implemented: updateAudit");
    }
}
