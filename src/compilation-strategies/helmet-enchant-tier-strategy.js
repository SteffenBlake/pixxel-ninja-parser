import { TypeTierStrategyBase } from "./type-tier-strategy-base.js";
import EnchantData from '../resources/ninja_helm_lookup.js';

export class HelmetEnchantTierStrategy extends TypeTierStrategyBase {
    
    constructor() {
        super(["HelmetEnchant"]);
    }
    
    async getTierAsync(ninjaType, rootTier, lineName, lineValue, lineData) 
    {
        if (lineName.startsWith("Allocates"))
        {
            return ``;
        }

        if (!lineName in EnchantData) 
        {
            throw Error (`Unrecognized poe ninja enchantment: '${lineName}'`);
        }

        return `${rootTier}_HelmEnchant`;
    }

    #mappings;
    async getTrueNamesAsync(ninjaType, rootTier, lineName, lineValue, lineData) 
    {
        this.#ensureMappings();
        var trueNames = this.#mappings[lineName];
        if (!trueNames) 
        {
            throw Error (`Unrecognized poe ninja enchantment: '${lineName}'`);
        }

        return trueNames;
    }

    #ensureMappings() 
    {
        if (this.#mappings) 
        {
            return;
        }
        this.#mappings = {};

        var entries = Object.entries(EnchantData);
        for (var n = 0; n < entries.length; n++) 
        {
            const [to, from] = entries[n];
            if (!(from in this.#mappings)) {
                this.#mappings[from] = [];
            }

            this.#mappings[from].push(to);
        }
    }
}