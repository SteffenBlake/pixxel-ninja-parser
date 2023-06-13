import { BaseTypeTierStrategy } from './base-type-tier-strategy.js';
import { ClusterJewelTierStrategy } from './cluster-jewel-tier-strategy.js';
import { CurrencyTierStrategy } from './currency-tier-strategy.js';
import { GemTierStrategy } from './gem-tier-strategy.js';
import { HelmetEnchantTierStrategy } from './helmet-enchant-tier-strategy.js';

export class TypeTierStrategyProvider {
    #strategies;

    constructor() {
        this.#strategies = [
            new BaseTypeTierStrategy(),
            new ClusterJewelTierStrategy(),
            new CurrencyTierStrategy(),
            new GemTierStrategy(),
            new HelmetEnchantTierStrategy()
        ];
    }

    getStrategy(ninjaType) {
        for (var n = 0; n < this.#strategies.length; n++) {
            if (this.#strategies[n].ninjaTypes.includes(ninjaType)) {
                return this.#strategies[n];
            }
        }
        throw Error(`No strategy registered for type '${ninjaType}'`);
    }
}