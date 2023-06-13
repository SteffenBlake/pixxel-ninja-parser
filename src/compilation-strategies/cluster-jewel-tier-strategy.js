import { TypeTierStrategyBase } from "./type-tier-strategy-base.js";
import ClusterData from '../resources/ninja_cluster_lookup.js';

export class ClusterJewelTierStrategy extends TypeTierStrategyBase {
    
    constructor() {
        super(["ClusterJewel"]);
    }
    
    async getTierAsync(ninjaType, rootTier, lineName, lineValue, lineData) {
        const iLevel = lineData.levelRequired
        if (iLevel <= 1) 
        {
            return ``;
        }

        const size = this.#getSize(lineData);
        if (!size)
        {
            return ``;
        }

        return `${rootTier}_${size}_i${iLevel}_ClusterJewel`;
    }

    async getTrueNamesAsync(ninjaType, rootTier, lineName, lineValue, lineData) {
        await this.#ensureEnchantMappingsAsync();
        var trueName = this.#enchantMappings[lineName];

        if (trueName === undefined) {
            throw Error(`Unrecognized Cluster jewel enchantment: '${lineName}'`);
        }

        return [trueName];
    }

    #enchantMappings;
    async #ensureEnchantMappingsAsync() {
        if (this.#enchantMappings) 
        {
            return;
        }

        this.#enchantMappings = {};
        var entries = Object.entries(ClusterData);
        for (var n = 0; n < entries.length; n++) 
        {
            const [key, values] = entries[n];
            const from = values[0];
            const to = key;
            this.#enchantMappings[from] = to;
        }
    }

    #highBreakpoints = {
        "Large Cluster Jewel": 12,
        "Medium Cluster Jewel": 6,
        "Small Cluster Jewel": 3
    };
    #lowBreakpoints = {
        "Large Cluster Jewel": 9,
        "Medium Cluster Jewel": 5,
        "Small Cluster Jewel": 2
    };

    #getSize(lineData) {
        const baseType = lineData.baseType
        const passiveCount = parseInt(lineData.variant.split(" ")[0]);

        if (passiveCount >= this.#highBreakpoints[baseType]) 
        {
            return "High";
        }
        else if (passiveCount <= this.#lowBreakpoints[baseType]) {
            return "Low";
        }
        else
        {
            return ``;
        }
    }
}