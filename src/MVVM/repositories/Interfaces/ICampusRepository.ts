import { Campus } from '@/MVVM/models/Campus';

export interface ICampusRepository {
  findCampusById(_id: string): Promise<Campus>;
  getAllCampuses(): Promise<Campus[]>;
}
