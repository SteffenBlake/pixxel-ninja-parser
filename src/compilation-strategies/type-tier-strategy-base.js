export class TypeTierStrategyBase {
    ninjaTypes;

    constructor(ninjaTypes) {
        if (this.constructor == TypeTierStrategyBase) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.ninjaTypes = ninjaTypes;
    }

    async getTierAsync(ninjaType, rootTier, lineName, lineValue, lineData) {
        throw new Error("Not implemented");
    }

    async getTrueNamesAsync(ninjaType, rootTier, lineName, lineValue, lineData) {
        return [lineName];
    }
}