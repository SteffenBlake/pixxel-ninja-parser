import { TypeTierStrategyBase } from "./type-tier-strategy-base.js";

export class CurrencyTierStrategy extends TypeTierStrategyBase {
    constructor() {
        super([
            "Currency", 
            "Fragment", 
            "Oil", 
            "Incubator", 
            "Scarab", 
            "Fossil", 
            "Essence",
            "DivinationCard", 
            "Vial", 
            "Sentinel", 
            "Artifact", 
            "DeliriumOrb", 
            "Invitation"
        ]);
    }

    #skips = [`Maven's Orb`];
    async getTierAsync(ninjaType, rootTier, lineName, lineValue, lineData) {
        if (this.#skips.includes(lineName))
        {
            return ``;
        }

        return `${rootTier}_${ninjaType}`;
    }
}