import { TypeTierStrategyBase } from "./type-tier-strategy-base.js";

export class BaseTypeTierStrategy extends TypeTierStrategyBase {
    constructor() {
        super(["BaseType"]);
    }

    async getTierAsync(ninjaType, rootTier, lineName, lineValue, lineData) {
        if (lineData.listingCount < 50) {
            return ``;
        }
        if (lineValue < 20) {
            return ``;
        }

        let variant = `Normal`;
        if (`variant` in lineData) {
            variant = lineData.variant;
        }

        // Skip double influence types, those don't drop
        if (variant.includes("/")) 
        {
            return ``;
        }
        
        const level = lineData.levelRequired;

        return `${variant}_${level}_Bases`;
    }
}