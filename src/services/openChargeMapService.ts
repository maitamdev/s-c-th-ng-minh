// OpenChargeMap API Service
// Fetches real charging station data from OpenChargeMap.io

const OPENCHARGE_MAP_BASE_URL = import.meta.env.VITE_OPENCHARGE_MAP_BASE_URL || 'https://api.openchargemap.io/v3';
const OPENCHARGE_MAP_API_KEY = import.meta.env.VITE_OPENCHARGE_MAP_API_KEY || '';

// Default location (Ho Chi Minh City)
const DEFAULT_LATITUDE = 10.7769;
const DEFAULT_LONGITUDE = 106.7009;
const DEFAULT_DISTANCE_KM = 50;
const DEFAULT_MAX_RESULTS = 100;

export interface OCMStation {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    provider: string;
    status: string;
    chargers: OCMCharger[];
    distanceKm?: number;
    avgRating?: number;
    reviewCount: number;
    hours: {
        open: string;
        close: string;
        is24h: boolean;
    };
    amenities: string[];
}

export interface OCMCharger {
    id: string;
    stationId: string;
    connectorType: string;
    powerKw: number;
    status: string;
    pricePerKwh: number;
}

interface OCMAddressInfo {
    Title?: string;
    AddressLine1?: string;
    Town?: string;
    StateOrProvince?: string;
    Latitude?: number;
    Longitude?: number;
    Distance?: number;
    AccessComments?: string;
}

interface OCMConnectionType {
    Title?: string;
}

interface OCMLevel {
    Comments?: string;
}

interface OCMConnection {
    ID?: number;
    ConnectionType?: OCMConnectionType;
    PowerKW?: number;
    Level?: OCMLevel;
    StatusType?: {
        IsOperational?: boolean;
    };
}

interface OCMOperatorInfo {
    ID?: number;
    Title?: string;
}

interface OCMStatusType {
    IsOperational?: boolean;
}

interface OCMUsageType {
    IsPayAtLocation?: boolean;
    IsMembershipRequired?: boolean;
    IsAccessKeyRequired?: boolean;
}

interface OCMDataItem {
    ID: number;
    AddressInfo?: OCMAddressInfo;
    Connections?: OCMConnection[];
    OperatorInfo?: OCMOperatorInfo;
    StatusType?: OCMStatusType;
    UsageType?: OCMUsageType;
    UserComments?: unknown[];
}

// Fetch stations from OpenChargeMap API
export async function fetchOCMStations(options?: {
    latitude?: number;
    longitude?: number;
    distanceKm?: number;
    maxResults?: number;
}): Promise<OCMStation[]> {
    const lat = options?.latitude ?? DEFAULT_LATITUDE;
    const lng = options?.longitude ?? DEFAULT_LONGITUDE;
    const distance = options?.distanceKm ?? DEFAULT_DISTANCE_KM;
    const maxResults = options?.maxResults ?? DEFAULT_MAX_RESULTS;

    const params = new URLSearchParams({
        output: 'json',
        latitude: lat.toString(),
        longitude: lng.toString(),
        distance: distance.toString(),
        distanceunit: 'km',
        maxresults: maxResults.toString(),
    });

    if (OPENCHARGE_MAP_API_KEY) {
        params.append('key', OPENCHARGE_MAP_API_KEY);
    }

    const url = `${OPENCHARGE_MAP_BASE_URL}/poi?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'SCS-GO-Web/1.0.0 (EV Charging App)',
            },
        });

        if (!response.ok) {
            throw new Error(`OpenChargeMap API error: ${response.status}`);
        }

        const data: OCMDataItem[] = await response.json();

        if (!Array.isArray(data)) {
            console.warn('OpenChargeMap returned non-array data');
            return [];
        }

        // Map OCM data to our format
        const stations: OCMStation[] = data.map((item) => mapOCMToStation(item, lat, lng)).filter(Boolean) as OCMStation[];

        // Sort by distance
        stations.sort((a, b) => (a.distanceKm ?? 100) - (b.distanceKm ?? 100));

        console.log(`✅ Fetched ${stations.length} stations from OpenChargeMap`);
        return stations;
    } catch (error) {
        console.error('❌ OpenChargeMap API error:', error);
        throw error;
    }
}

// Map OpenChargeMap data to our station format
function mapOCMToStation(item: OCMDataItem, userLat: number, userLng: number): OCMStation | null {
    const addressInfo = item.AddressInfo || {};
    const connections = item.Connections || [];
    const operatorInfo = item.OperatorInfo || {};
    const statusType = item.StatusType;
    const usageType = item.UsageType || {};

    if (!addressInfo.Latitude || !addressInfo.Longitude) {
        return null;
    }

    // Parse chargers from connections
    const chargers: OCMCharger[] = connections.map((conn) => {
        const connType = conn.ConnectionType || {};
        const level = conn.Level || {};
        const powerKw = conn.PowerKW ?? parsePowerFromComments(level.Comments || '') ?? 22;

        // Estimate price based on power
        const pricePerKwh = powerKw >= 50 ? 4500 : 3500;

        return {
            id: String(conn.ID || Math.random()),
            stationId: String(item.ID),
            connectorType: mapConnectorType(connType.Title || 'Unknown'),
            powerKw,
            status: conn.StatusType?.IsOperational !== false ? 'available' : 'out_of_service',
            pricePerKwh,
        };
    });

    // Parse amenities
    const amenities: string[] = [];
    if (usageType.IsPayAtLocation) amenities.push('Payment');
    if (usageType.IsMembershipRequired) amenities.push('Membership');
    if (addressInfo.AccessComments) amenities.push('Parking');

    // Calculate distance
    const distanceKm = calculateDistance(
        userLat, userLng,
        addressInfo.Latitude, addressInfo.Longitude
    );

    return {
        id: `ocm_${item.ID}`,
        name: addressInfo.Title || 'Unknown Station',
        address: buildAddress(addressInfo),
        lat: addressInfo.Latitude,
        lng: addressInfo.Longitude,
        provider: operatorInfo.Title || 'Unknown Provider',
        status: statusType?.IsOperational !== false ? 'approved' : 'inactive',
        chargers,
        distanceKm,
        avgRating: (item.UserComments as unknown[])?.length > 0 ? 4.0 : undefined,
        reviewCount: (item.UserComments as unknown[])?.length || 0,
        hours: {
            open: '00:00',
            close: '23:59',
            is24h: usageType.IsAccessKeyRequired !== true,
        },
        amenities,
    };
}

function buildAddress(addressInfo: OCMAddressInfo): string {
    const parts: string[] = [];
    if (addressInfo.AddressLine1) parts.push(addressInfo.AddressLine1);
    if (addressInfo.Town) parts.push(addressInfo.Town);
    if (addressInfo.StateOrProvince) parts.push(addressInfo.StateOrProvince);
    return parts.length > 0 ? parts.join(', ') : 'Unknown Address';
}

function mapConnectorType(ocmType: string): string {
    const typeMap: Record<string, string> = {
        'CCS (Type 2)': 'CCS2',
        'CCS (Type 1)': 'CCS1',
        'CHAdeMO': 'CHAdeMO',
        'Type 2 (Socket Only)': 'Type2',
        'Type 2 (Tethered Connector)': 'Type2',
        'Type 1 (J1772)': 'Type1',
        'Tesla Supercharger': 'Tesla',
        'GB/T 20234.2 (AC)': 'GB/T AC',
        'GB/T 20234.3 (DC)': 'GB/T DC',
    };
    return typeMap[ocmType] || ocmType;
}

function parsePowerFromComments(comments: string): number | null {
    const regex = /(\d+)\s*kW/i;
    const match = regex.exec(comments);
    if (match) {
        return parseInt(match[1], 10);
    }
    return null;
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default {
    fetchOCMStations,
};
