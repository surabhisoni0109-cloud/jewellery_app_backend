export declare class StoreLocationDto {
    latitude?: number;
    longitude?: number;
    addressLine1: string;
    addressLine2?: string;
    area: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}
export declare class VendorOnboardingStep2Dto {
    storeName: string;
    storeDescription: string;
    storeLocation: StoreLocationDto;
    jewelleryStartingPrice: number;
    storeWebsite?: string;
    storeContactNumber: string;
    storeEmail: string;
    storeOpeningTime: string;
    storeClosingTime: string;
    storeFoundedYear: number;
    storeLogo?: string;
    storeCoverImages?: string[];
}
