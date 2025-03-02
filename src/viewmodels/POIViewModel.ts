import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { POI, POICategory } from "@/models/POI";
import { Audit } from "@/models/Audit";
import { MapRepository } from "@/repositories/POIRepository";

export class POIViewModel extends BaseViewModel<POI> implements MapRepository {
    private readonly COLLECTION_NAME = "pois";

    async findPOIById(id: string): Promise<POI> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const doc = await collection.findOne({ _id: id });
            if (!doc) throw new Error(`POI with id ${id} not found`);
            return this.mapToDTO(doc);
        });
    }

    async getAllPOIs(): Promise<POI[]> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const docs = await collection.find({}).toArray();
            return docs.map(doc => this.mapToDTO(doc));
        });
    }

    async findPOIsByCategory(category: POICategory): Promise<POI[]> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const docs = await collection.find({ category }).toArray();
            return docs.map(doc => this.mapToDTO(doc));
        });
    }

    async findNearbyPOIs(latitude: number, longitude: number, radius: number): Promise<POI[]> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const docs = await collection.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: radius
                    }
                }
            }).toArray();
            return docs.map(doc => this.mapToDTO(doc));
        });
    }

    async createPOI(data: Omit<POI, '_id' | 'createdAtUTC' | 'updatedAtUTC'>, userId: string): Promise<POI> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const poi: POI = {
                ...data,
                ...await this.updateAudit(null, userId)
            };
            await collection.insertOne(poi);
            return poi;
        });
    }

    async updatePOI(id: string, data: Partial<POI>, userId: string): Promise<POI> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const existing = await collection.findOne({ _id: id });
            if (!existing) throw new Error(`POI with id ${id} not found`);

            const updatedPOI = {
                ...existing,
                ...data,
                ...await this.updateAudit(existing, userId)
            };

            await collection.updateOne({ _id: id }, { $set: updatedPOI });
            return this.mapToDTO(updatedPOI);
        });
    }

    async deletePOI(id: string, userId: string): Promise<void> {
        await this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const existing = await collection.findOne({ _id: id });
            if (!existing) throw new Error(`POI with id ${id} not found`);

            // Log deletion in audit before deleting
            const auditLog = await this.updateAudit(existing, userId);
            await collection.deleteOne({ _id: id });
        });
    }

    protected mapToDTO(doc: any): POI {
        if (!doc) throw new Error('POI Not Found');
        
        return {
            _id: doc._id,
            type: doc.type,
            name: doc.name,
            category: doc.category,
            description: doc.description,
            location: doc.location,
            createdAtUTC: doc.createdAtUTC,
            updatedAtUTC: doc.updatedAtUTC,
            createdBy: doc.createdBy,
            updatedBy: doc.updatedBy
        };
    }

    protected async updateAudit(existingAudit: Partial<Audit> | null, userId: string): Promise<Audit> {
        const now = new Date();
        if (!existingAudit) {
            return {
                _id: new string(),
                createdAtUTC: now,
                updatedAtUTC: now,
                createdBy: userId,
                updatedBy: userId
            };
        }
        return {
            _id: existingAudit._id!,
            createdAtUTC: existingAudit.createdAtUTC!,
            createdBy: existingAudit.createdBy!,
            updatedAtUTC: now,
            updatedBy: userId
        };
    }
}
