import { Room, Building, Point, BoundingBox } from '../models/Room';
import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from '@xmldom/xmldom';

export class SvgProcessorService {
  private parser: DOMParser;

  constructor() {
    this.parser = new DOMParser();
  }

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
      const buildingName = this.extractBuildingName(doc, svgFilePath);
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
      throw new Error(`Failed to parse SVG file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractBuildingName(doc: Document, svgFilePath: string): string {
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

    // Try to get from filename
    const fileName = path.basename(svgFilePath, '.svg');
    if (fileName) {
      // Clean up the filename to make it more readable
      return fileName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
    }

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
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
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
      width: parseFloat(svgElement.getAttribute('width') || '0'),
      height: parseFloat(svgElement.getAttribute('height') || '0')
    };
  }

  private extractRooms(doc: Document): Room[] {
    const rooms: Room[] = [];
    const roomElements = doc.getElementsByTagName('rect');
    
    for (let i = 0; i < roomElements.length; i++) {
      const roomElement = roomElements[i];
      if (this.isRoomElement(roomElement)) {
        const room = this.parseRoomElement(roomElement);
        if (room) rooms.push(room);
      }
    }
    
    // Also check path elements
    const pathElements = doc.getElementsByTagName('path');
    for (let i = 0; i < pathElements.length; i++) {
      const pathElement = pathElements[i];
      if (this.isRoomElement(pathElement)) {
        const room = this.parseRoomElement(pathElement);
        if (room) rooms.push(room);
      }
    }
    
    return rooms;
  }

  private isRoomElement(element: Element): boolean {
    // Check if element is a rect or path (common room shapes)
    const isShape = element.tagName === 'rect' || element.tagName === 'path';
    if (!isShape) return false;
    
    // Check if element has room-related attributes
    const classAttr = element.getAttribute('class');
    const label = element.getAttribute('inkscape:label');
    const id = element.getAttribute('id');
    const style = element.getAttribute('style');
    
    // Check if element has room-like style (no fill, stroke present)
    const isRoomStyle = style ? 
      style.includes('fill:none') && 
      style.includes('stroke:#000000') : false;
    
    return (
      (classAttr?.includes('room') ?? false) ||
      (label?.toLowerCase().includes('room') ?? false) ||
      (id?.toLowerCase().includes('room') ?? false) ||
      isRoomStyle
    );
  }

  private parseRoomElement(roomElement: Element): Room | null {
    try {
      const name = this.extractRoomName(roomElement);
      const label = this.extractRoomLabel(roomElement);
      const type = this.extractRoomType(roomElement);
      const style = this.extractRoomStyle(roomElement);
      
      // Extract coordinates from path or polygon elements
      let coordinates: Point[] = [];
      
      if (roomElement.tagName === 'rect') {
        coordinates = this.parseRectCoordinates(roomElement);
      } else if (roomElement.tagName === 'path') {
        coordinates = this.parsePathCoordinates(roomElement.getAttribute('d') || '');
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
    // Try to get from data attributes
    const dataName = element.getAttribute('data-name');
    if (dataName) return dataName;
    
    // Try to get from label
    const label = element.getAttribute('inkscape:label');
    if (label) return label;
    
    // Try to extract from ID
    const id = element.getAttribute('id');
    if (id) {
      // Try to extract room number from ID
      const roomNumberMatch = id.match(/\d+/);
      if (roomNumberMatch) {
        return `Room ${roomNumberMatch[0]}`;
      }
      return id;
    }
    
    return 'Unnamed Room';
  }

  private extractRoomLabel(element: Element): string {
    return (
      element.getAttribute('data-label') ||
      element.getAttribute('aria-label') ||
      element.getAttribute('inkscape:label') ||
      ''
    );
  }

  private extractRoomType(element: Element): string {
    const classAttr = element.getAttribute('class');
    const roomType = classAttr?.split(' ').find(c => c !== 'room');
    return element.getAttribute('data-type') || roomType || 'room';
  }

  private extractRoomStyle(element: Element): { [key: string]: string } {
    const style: { [key: string]: string } = {};
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
      styleAttr.split(';').forEach(prop => {
        const [key, value] = prop.split(':').map(s => s.trim());
        if (key && value) {
          style[key] = value;
        }
      });
    }
    return style;
  }

  private parsePathCoordinates(pathData: string): Point[] {
    // Basic path parsing (handles M and L commands)
    const coordinates: Point[] = [];
    const commands = pathData.match(/[MLZ][^MLZ]*/g) || [];
    
    commands.forEach(cmd => {
      const type = cmd[0];
      const points = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
      
      for (let i = 0; i < points.length; i += 2) {
        if (type !== 'Z' && !isNaN(points[i]) && !isNaN(points[i + 1])) {
          coordinates.push({ x: points[i], y: points[i + 1] });
        }
      }
    });
    
    return coordinates;
  }

  private parsePolygonCoordinates(pointsData: string): Point[] {
    const points = pointsData.trim().split(/[\s,]+/).map(Number);
    const coordinates: Point[] = [];
    
    for (let i = 0; i < points.length; i += 2) {
      if (!isNaN(points[i]) && !isNaN(points[i + 1])) {
        coordinates.push({ x: points[i], y: points[i + 1] });
      }
    }
    
    return coordinates;
  }

  private parseRectCoordinates(rectElement: Element): Point[] {
    const x = parseFloat(rectElement.getAttribute('x') || '0');
    const y = parseFloat(rectElement.getAttribute('y') || '0');
    const width = parseFloat(rectElement.getAttribute('width') || '0');
    const height = parseFloat(rectElement.getAttribute('height') || '0');
    
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
    
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (attr.name.startsWith('data-')) {
        const key = attr.name.slice(5);
        metadata[key] = attr.value;
      }
    }
    
    return metadata;
  }

  private generateId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  private generateSearchTerms(name: string, label: string, type: string): string[] {
    const terms = new Set<string>();
    
    // Add name variations
    terms.add(name.toLowerCase());
    name.split(/[\s-]+/).forEach(part => terms.add(part.toLowerCase()));
    
    // Add label variations
    if (label) {
      terms.add(label.toLowerCase());
      label.split(/[\s-]+/).forEach(part => terms.add(part.toLowerCase()));
    }
    
    // Add type
    terms.add(type.toLowerCase());
    
    // Add room number if present
    const roomNumber = this.extractRoomNumber(name, label);
    if (roomNumber) {
      terms.add(roomNumber);
      // Add variations of room number
      terms.add(roomNumber.replace(/\D/g, '')); // Just numbers
      terms.add(roomNumber.replace(/\d/g, '')); // Just letters
    }
    
    // Add common room-related terms
    terms.add('room');
    terms.add('hall');
    terms.add('space');
    terms.add('area');
    
    return Array.from(terms);
  }

  private extractRoomNumber(name: string, label: string): string | undefined {
    // Try to find room number in name or label
    const text = `${name} ${label}`;
    const match = text.match(/\b[A-Z]?-?\d+\b/);
    return match ? match[0] : undefined;
  }

  private calculateBoundingBox(points: Point[]): BoundingBox {
    if (points.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0
      };
    }
    
    const bbox = {
      minX: points[0].x,
      minY: points[0].y,
      maxX: points[0].x,
      maxY: points[0].y
    };
    
    points.forEach(point => {
      bbox.minX = Math.min(bbox.minX, point.x);
      bbox.minY = Math.min(bbox.minY, point.y);
      bbox.maxX = Math.max(bbox.maxX, point.x);
      bbox.maxY = Math.max(bbox.maxY, point.y);
    });
    
    return bbox;
  }

  private calculateBuildingBoundingBox(rooms: Room[]): BoundingBox {
    if (rooms.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0
      };
    }
    
    const bbox = { ...rooms[0].boundingBox };
    
    rooms.forEach(room => {
      bbox.minX = Math.min(bbox.minX, room.boundingBox.minX);
      bbox.minY = Math.min(bbox.minY, room.boundingBox.minY);
      bbox.maxX = Math.max(bbox.maxX, room.boundingBox.maxX);
      bbox.maxY = Math.max(bbox.maxY, room.boundingBox.maxY);
    });
    
    return bbox;
  }

  private calculateCenter(bbox: BoundingBox): Point {
    return {
      x: (bbox.minX + bbox.maxX) / 2,
      y: (bbox.minY + bbox.maxY) / 2
    };
  }
} 