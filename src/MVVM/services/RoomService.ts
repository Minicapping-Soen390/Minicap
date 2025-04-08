import { Room, Building } from '../models/Room';

export class RoomService  {
  private static instance: RoomService | null = null;


  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  /**
   * Search for rooms across all buildings
   * @param buildings List of buildings to search in
   * @param query Search query
   * @returns Array of matching rooms with their building context
   */
  searchRooms(buildings: Building[], query: string): Array<{ room: Room; building: Building }> {
    const normalizedQuery = this.normalizeQuery(query);
    const results: Array<{ room: Room; building: Building }> = [];

    for (const building of buildings) {
      const matchingRooms = building.rooms?.filter(room => 
        this.matchesQuery(room, normalizedQuery)
      ) || [];

      results.push(...matchingRooms.map(room => ({ room, building })));
    }

    return this.sortResults(results, normalizedQuery);
  }

  /**
   * Search for rooms within a specific building
   * @param building Building to search in
   * @param query Search query
   * @returns Array of matching rooms
   */
  searchRoomsInBuilding(building: Building, query: string): Room[] {
    const normalizedQuery = this.normalizeQuery(query);
    const matchingRooms = building.rooms?.filter(room => 
      this.matchesQuery(room, normalizedQuery)
    ) || [];

    return this.sortResults(matchingRooms.map(room => ({ room, building })), normalizedQuery)
      .map(result => result.room);
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim();
  }

  private matchesQuery(room: Room, normalizedQuery: string): boolean {
    // Check if query matches any search terms
    if (room.searchTerms.some(term => term.includes(normalizedQuery))) {
      return true;
    }
    // Check if query matches room number
    if (room.roomNumber?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Check if query matches building name
    if (room.building?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    return false;
  }

  private sortResults(
    results: Array<{ room: Room; building: Building }>,
    query: string
  ): Array<{ room: Room; building: Building }> {
    return results.sort((a, b) => {
      // Prioritize exact matches
      const aExactMatch = a.room.searchTerms.some(term => term === query);
      const bExactMatch = b.room.searchTerms.some(term => term === query);
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then prioritize room number matches
      const aRoomNumberMatch = a.room.roomNumber?.toLowerCase() === query;
      const bRoomNumberMatch = b.room.roomNumber?.toLowerCase() === query;
      
      if (aRoomNumberMatch && !bRoomNumberMatch) return -1;
      if (!aRoomNumberMatch && bRoomNumberMatch) return 1;

      // Finally sort by relevance (number of matching terms)
      const aRelevance = a.room.searchTerms.filter(term => term.includes(query)).length;
      const bRelevance = b.room.searchTerms.filter(term => term.includes(query)).length;
      
      return bRelevance - aRelevance;
    });
  }
}