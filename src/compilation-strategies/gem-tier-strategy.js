import { TypeTierStrategyBase } from "./type-tier-strategy-base.js";

export class GemTierStrategy extends TypeTierStrategyBase {
    
    constructor() {
        super(["SkillGem"]);
    }
    
    #levelMappings = {
        "21c": "21_X",
        "21/20c": "21_20",
        "21/23c": "21_23",
        "1/20": "X_20",
        "20/23": "20_20"
    }

    async getTierAsync(ninjaType, rootTier, lineName, lineValue, lineData) {
        const corrupted = lineData.corrupted;
        const gemLevel = lineData.gemLevel;
        if (lineName.startsWith(`Awakened`)) {
            if (corrupted) {
                return ``;
            }
            if (gemLevel == 1) {
                return `${rootTier}_Fancy_Gem`;
            }
            return ``;
        }
        if (lineName.startsWith(`Divergent`) || lineName.startsWith(`Anomalous`) || lineName.startsWith(`Phantasmal`)) {
            if (corrupted) {
                return ``;
            }
            if (gemLevel != 16 && gemLevel != 1) {
                return ``;
            }
            const altType = lineName.split(" ")[0];
            return `${rootTier}_${altType}_Gem`;
        }

        if (lineData.variant in this.#levelMappings) {
            const mapping = this.#levelMappings[lineData.variant];
            return `${rootTier}_${mapping}_Gem`;
        }
    }

    async getTrueNamesAsync(ninjaType, rootTier, lineName, lineValue, lineData) {
        if (lineName.startsWith(`Divergent`)) {
            return [lineName.substring(10)];
        }
        if (lineName.startsWith(`Anomalous`)) {
            return [lineName.substring(10)];
        }
        if (lineName.startsWith(`Phantasmal`)) {
            return [lineName.substring(11)];
        }

        return [lineName];
    }
}