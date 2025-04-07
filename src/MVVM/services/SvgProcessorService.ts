import { Room, Building, Point, BoundingBox } from '../models/Room';
import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { getErrorMessage } from '@/Shared/utils/generalUtils';
import { BaseService } from './BaseService';

export class SvgProcessorService extends BaseService {
  private readonly parser: DOMParser = new DOMParser();

  /**
   * Parses an SVG file and extracts room data
   * @param svgFilePath Path to the SVG file
   * @returns Promise<Building> The building data extracted from the SVG
   */
  async parseSvgFile(svgFilePath: string): Promise<Building> {
    try {
      const svgContent = await fs.promises.readFile(svgFilePath, 'utf-8');
      const doc = this.parser.parseFromString(svgContent, 'text/xml');
      
      // Extract building information from SVG metadata
      const buildingName = this.extractBuildingName(doc);
      const floor = this.extractFloor(doc);
      const dimensions = this.extractDimensions(doc);
      
      // Extract rooms
      const rooms = this.extractRooms(doc);
      
      // Calculate building bounding box and center
      const buildingBoundingBox = this.calculateBuildingBoundingBox(rooms);
      const buildingCenter = this.calculateCenter(buildingBoundingBox);
      
      return {
        id: this.generateId(buildingName),
        name: buildingName,
        floors: [floor],
        rooms: rooms,
        boundingBox: buildingBoundingBox,
        center: buildingCenter,
        metadata: {
          dimensions,
          sourceFile: path.basename(svgFilePath),
          lastModified: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error parsing SVG file:', error);
      throw new Error(`Failed to parse SVG file: ${getErrorMessage(error)}`);
    }
  }

  private extractBuildingName(doc: Document): string {
    // Try to get building name from title
    const titleElement = doc.getElementsByTagName('title')[0];
    if (titleElement?.textContent) {
      return titleElement.textContent;
    }

    // Try to get from metadata
    const metadata = doc.getElementsByTagName('metadata')[0];
    const buildingName = metadata?.getAttribute('building-name');
    if (buildingName) {
      return buildingName;
    }

    // Fallback to filename
    return 'Unknown Building';
  }

  private extractFloor(doc: Document): string {
    // Try to get floor from metadata
    const metadata = doc.getElementsByTagName('metadata')[0];
    const floor = metadata?.getAttribute('floor');
    if (floor) {
      return floor;
    }

    // Try to extract from layer name
    const layers = doc.getElementsByTagName('g');
    for (const layer of Array.from(layers)) {
      const label = layer.getAttribute('inkscape:label');
      if (label?.toLowerCase().includes('floor')) {
        return label;
      }
    }

    return '1';
  }

  private extractDimensions(doc: Document): { width: number; height: number } {
    const svgElement = doc.documentElement;
    return {
      width: parseFloat(svgElement.getAttribute('width') ?? '0'),
      height: parseFloat(svgElement.getAttribute('height') ?? '0')
    };
  }

  private extractRooms(doc: Document): Room[] {
    const rooms: Room[] = [];
    const roomElements = doc.getElementsByTagName('g');
    
    for (const roomElement of Array.from(roomElements)) {
      if (this.isRoomElement(roomElement)) {
        const room = this.parseRoomElement(roomElement);
        if (room) rooms.push(room);
      }
    }
    
    return rooms;
  }

  private isRoomElement(element: Element): boolean {
    // Check if element has room-related attributes or classes
    return (
      !!element.getAttribute('class')?.includes('room') ||
      !!element.getAttribute('inkscape:label')?.toLowerCase().includes('room') ||
      !!element.getAttribute('id')?.toLowerCase().includes('room') ||
      false
    );
  }

  private parseRoomElement(roomElement: Element): Room | null {
    try {
      const name = this.extractRoomName(roomElement);
      const label = this.extractRoomLabel(roomElement);
      const type = this.extractRoomType(roomElement);
      const style = this.extractRoomStyle(roomElement);
      
      // Extract coordinates from path or polygon elements
      const pathElement = roomElement.getElementsByTagName('path')[0];
      const polygonElement = roomElement.getElementsByTagName('polygon')[0];
      const rectElement = roomElement.getElementsByTagName('rect')[0];
      
      let coordinates: Point[] = [];
      if (pathElement) {
        coordinates = this.parsePathCoordinates(pathElement.getAttribute('d') ?? '');
      } else if (polygonElement) {
        coordinates = this.parsePolygonCoordinates(polygonElement.getAttribute('points') ?? '');
      } else if (rectElement) {
        coordinates = this.parseRectCoordinates(rectElement);
      }
      
      if (coordinates.length === 0) return null;
      
      // Calculate room properties
      const boundingBox = this.calculateBoundingBox(coordinates);
      const center = this.calculateCenter(boundingBox);
      const searchTerms = this.generateSearchTerms(name, label, type);
      const roomNumber = this.extractRoomNumber(name, label);
      
      return {
        id: this.generateId(name),
        name,
        label,
        coordinates,
        floor: '1', // Default floor, can be overridden
        building: 'Unknown', // Default building, can be overridden
        type,
        searchTerms,
        roomNumber,
        boundingBox,
        center,
        metadata: {
          ...this.extractRoomMetadata(roomElement),
          style
        }
      };
    } catch (error) {
      console.error('Error parsing room element:', error);
      return null;
    }
  }

  private extractRoomName(element: Element): string {
    return (
      element.getAttribute('data-name') ??
      element.getAttribute('inkscape:label') ??
      element.getAttribute('id') ??
      'Unnamed Room'
    );
  }

  private extractRoomLabel(element: Element): string {
    return (
      element.getAttribute('data-label') ??
      element.getAttribute('aria-label') ??
      this.extractRoomName(element)
    );
  }

  private extractRoomType(element: Element): string {
    return (
      element.getAttribute('data-type') ??
      element.getAttribute('class')?.split(' ').find(c => c !== 'room') ??
      'room'
    );
  }

  private extractRoomStyle(element: Element): { [key: string]: string } {
    const style: { [key: string]: string } = {};
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
      styleAttr.split(';').forEach(property => {
        const [key, value] = property.split(':');
        if (key && value) {
          style[key.trim()] = value.trim();
        }
      });
    }
    return style;
  }

  private parsePathCoordinates(pathData: string): Point[] {
    const points: Point[] = [];
    const commands = pathData.split(/(?=[A-Za-z])/);
    
    for (const command of commands) {
      const [cmd, ...coords] = command.trim().split(/\s+/);
      if (cmd === 'M' || cmd === 'L') {
        for (let i = 0; i < coords.length; i += 2) {
          points.push({
            x: parseFloat(coords[i]),
            y: parseFloat(coords[i + 1])
          });
        }
      }
    }
    
    return points;
  }

  private parsePolygonCoordinates(pointsData: string): Point[] {
    return pointsData.split(/\s+/).map(point => {
      const [x, y] = point.split(',').map(parseFloat);
      return { x, y };
    });
  }

  private parseRectCoordinates(rectElement: Element): Point[] {
    const x = parseFloat(rectElement.getAttribute('x') ?? '0');
    const y = parseFloat(rectElement.getAttribute('y') ?? '0');
    const width = parseFloat(rectElement.getAttribute('width') ?? '0');
    const height = parseFloat(rectElement.getAttribute('height') ?? '0');

    return [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height }
    ];
  }

  private extractRoomMetadata(roomElement: Element): { [key: string]: any } {
    const metadata: { [key: string]: any } = {};
    const attributes = roomElement.attributes;
    
    for (const attr of Array.from(attributes)) {
      if (attr.name.startsWith('data-')) {
        const key = attr.name.substring(5); // Remove 'data-' prefix
        metadata[key] = attr.value;
      }
    }
    
    return metadata;
  }

  private generateId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  private calculateBoundingBox(coordinates: Point[]): BoundingBox {
    if (coordinates.length === 0) {
      throw new Error('Cannot calculate bounding box for empty coordinates');
    }

    return coordinates.reduce((bbox, point) => ({
      minX: Math.min(bbox.minX, point.x ?? 0),
      minY: Math.min(bbox.minY, point.y ?? 0),
      maxX: Math.max(bbox.maxX, point.x ?? 0),
      maxY: Math.max(bbox.maxY, point.y ?? 0)
    }), {
      minX: coordinates[0].x ?? 0,
      minY: coordinates[0].y ?? 0,
      maxX: coordinates[0].x ?? 0,
      maxY: coordinates[0].y ?? 0
    });
  }

  private calculateBuildingBoundingBox(rooms: Room[]): BoundingBox {
    if (rooms.length === 0) {
      throw new Error('Cannot calculate building bounding box for empty rooms');
    }

    return rooms.reduce((bbox, room) => {
      const roomBox = room.boundingBox ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      return {
        minX: Math.min(bbox.minX, roomBox.minX ?? 0),
        minY: Math.min(bbox.minY, roomBox.minY ?? 0),
        maxX: Math.max(bbox.maxX, roomBox.maxX ?? 0),
        maxY: Math.max(bbox.maxY, roomBox.maxY ?? 0)
      };
    }, {
      minX: (rooms[0].boundingBox?.minX ?? 0),
      minY: (rooms[0].boundingBox?.minY ?? 0),
      maxX: (rooms[0].boundingBox?.maxX ?? 0),
      maxY: (rooms[0].boundingBox?.maxY ?? 0)
    });
  }

  private calculateCenter(bbox: BoundingBox): Point {
    return {
      x: ((bbox.minX ?? 0) + (bbox.maxX ?? 0)) / 2,
      y: ((bbox.minY ?? 0) + (bbox.maxY ?? 0)) / 2
    };
  }

  private generateSearchTerms(name: string, label: string, type: string): string[] {
    const terms = new Set<string>();
    
    // Add name variations
    terms.add(name.toLowerCase());
    terms.add(name.replace(/\s+/g, '').toLowerCase());
    
    // Add label variations
    terms.add(label.toLowerCase());
    terms.add(label.replace(/\s+/g, '').toLowerCase());
    
    // Add type
    terms.add(type.toLowerCase());
    
    // Extract potential room numbers
    const roomNumber = this.extractRoomNumber(name, label);
    if (roomNumber) {
      terms.add(roomNumber);
      terms.add(roomNumber.replace(/\s+/g, ''));
    }
    
    return Array.from(terms);
  }

  private extractRoomNumber(name: string, label: string): string | undefined {
    // Try to extract room number from name or label
    const roomNumberPattern = /(?:room|rm|#)?\s*([A-Za-z0-9-]+)/i;
    
    const nameMatch = name.match(roomNumberPattern);
    if (nameMatch) return nameMatch[1];
    
    const labelMatch = label.match(roomNumberPattern);
    if (labelMatch) return labelMatch[1];
    
    return undefined;
  }
}