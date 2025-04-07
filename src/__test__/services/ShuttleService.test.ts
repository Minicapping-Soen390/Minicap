import axios from 'axios';
import MockDate from 'mockdate';
import {ShuttleService, SHUTTLE_STOPS } from '@/MVVM/services/ShuttleService';
import { BaseService } from '@/MVVM/services/BaseService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the BaseService to allow instantiation of the abstract class
jest.mock('@/MVVM/services/BaseService', () => {
  return {
    BaseService: class MockBaseService {
      constructor() {}
    }
  };
});

describe('ShuttleService', () => {
  let shuttleService: ShuttleService;

  beforeEach(() => {
    // Create a new instance for each test
    shuttleService = new ShuttleService();
    // Reset the private property
    (shuttleService as any).sessionInitialized = false;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeSession', () => {
    it('should initialize session successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({});
      await expect(
        (shuttleService as any).initializeSession()
      ).resolves.not.toThrow();
      expect((shuttleService as any).sessionInitialized).toBe(true);
    });

    it('should throw error if initialization fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Failed'));
      await expect((shuttleService as any).initializeSession()).rejects.toThrow(
        'Failed to initialize shuttle tracking'
      );
    });
  });

  describe('getShuttleLocations', () => {
    it('should fetch and filter shuttle points', async () => {
      mockedAxios.get.mockResolvedValueOnce({});
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          d: {
            Points: [
              { _id: 'BUS001', Latitude: 45.5, Longitude: -73.6, IconImage: 'bus.png' },
              { _id: 'OTHER', Latitude: 0, Longitude: 0, IconImage: '' }
            ]
          }
        }
      });

      const result = await shuttleService.getShuttleLocations();
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('BUS001');
    });

    it('should throw error if post fails', async () => {
      mockedAxios.get.mockResolvedValueOnce({});
      mockedAxios.post.mockRejectedValueOnce(new Error('Post failed'));

      await expect(shuttleService.getShuttleLocations()).rejects.toThrow(
        'Failed to get shuttle locations'
      );
    });
  });

  describe('getClosestShuttle', () => {
    it('should return the closest shuttle', () => {
      const result = shuttleService.getClosestShuttle(
        [
          { _id: 'BUS1', Latitude: '45.45', Longitude: '-73.64' },
          { _id: 'BUS2', Latitude: '45.49', Longitude: '-73.59' }
        ],
        SHUTTLE_STOPS.SGW
      );
      expect(result._id).toBe('BUS2');
    });

    it('should return null for empty list', () => {
      const result = shuttleService.getClosestShuttle([], SHUTTLE_STOPS.SGW);
      expect(result).toBeNull();
    });
  });

  describe('getNextDepartureTime', () => {
    beforeEach(() => {
      MockDate.set('2025-04-05T10:00:00');
    });

    afterEach(() => {
      MockDate.reset();
    });

    it('should return next available departure', () => {
      const result = shuttleService.getNextDepartureTime('SGW');
      expect(result.departureTime).toBe('10:15');
      expect(result.waitTime).toBeGreaterThan(0);
    });

    it('should return first departure for next day if none left', () => {
      MockDate.set('2025-04-05T23:00:00');
      const result = shuttleService.getNextDepartureTime('LOYOLA');
      expect(result.departureTime).toBe('09:15');
      expect(result.waitTime).toBeGreaterThan(0);
    });
  });

  describe('estimateWaitingTime', () => {
    it('should estimate wait time based on distance', () => {
      const mockShuttle = { Latitude: '45.46', Longitude: '-73.63' };
      const wait = shuttleService.estimateWaitingTime(mockShuttle, SHUTTLE_STOPS.LOYOLA);
      expect(wait).toBeGreaterThan(0);
    });

    it('should fallback to next departure time if shuttle is null', () => {
      const wait = shuttleService.estimateWaitingTime(null, SHUTTLE_STOPS.LOYOLA);
      expect(wait).toBeGreaterThan(0);
    });
  });
});
