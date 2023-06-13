import { TypeTierStrategyProvider } from './compilation-strategies/type-tier-strategy-provider.js';
import { join as pathJoin, dirname } from 'path';
import { existsSync as pathExists  } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout } from "timers/promises";
import bent from 'bent';
const fetchJson = bent('json');

import * as ninjaTypes from './resources/ninja_types.js';

export class PixxelNinjaParser {
    #league;
    #priceBreakpoints;
    #expiration_ms;
    #apiDelay_ms
    #cachePath;
    #outputPath;
    #timestampPath;
    #itemEndpoint;
    #currencyEndpoint;

    #strategyProvider = new TypeTierStrategyProvider();

    #cache = {};

    constructor() {
        this.#league = process.env.LEAGUE;
        this.#priceBreakpoints = JSON.parse(process.env.PRICE_BREAKPOINTS);
        this.#expiration_ms = parseInt(process.env.EXPIRATION_MS);
        this.#apiDelay_ms = parseInt(process.env.APIDELAY_MS);

        this.#cachePath = process.env.CACHE_PATH;
        this.#outputPath = process.env.OUTPUT_PATH;
        this.#timestampPath = pathJoin(this.#cachePath, `.timestamp`);

        this.#itemEndpoint = `${process.env.API_ENDPOINT}/itemoverview`;
        this.#currencyEndpoint = `${process.env.API_ENDPOINT}/currencyoverview`;
    }

    async runAsync() {
        await this.#loadAsync();
        await this.#compileAsync();
    }

    async #loadAsync() {

        // Check if we refreshed cache
        if (await this.#cacheFromAPIAsync()) {
            return;
        }

        console.log(`Loading cache from '${this.#cachePath}'`);
        // Did not refresh cache, need to load cache from file instead
        for (var n = 0; n < ninjaTypes.allTypes.length; n++) 
        {
            const ninjaType = ninjaTypes.allTypes[n];
            const ninjaTypePath = pathJoin(this.#cachePath, `${ninjaType}.json`);
            console.log(`    └ Loading ${ninjaTypePath}`);
            const jsonRaw = await readFile(ninjaTypePath, {encoding: `utf-8`});
            this.#cache[ninjaType] = JSON.parse(jsonRaw);
        }
    }

    async #cacheFromAPIAsync() {
        const now = Date.now();

        await this.#ensurePathAsync();

        console.log(`Checking cached poe ninja API data...`);
        
        var isExpired = await this.#isExpiredAsync(now);
        if (!isExpired) {
            console.log("Poe Ninja data is up to date!");
            return false;
        }
        
        console.log("Poe Ninja data is expired, commencing re-cache...");

        for (var n = 0; n < ninjaTypes.itemTypes.length; n++) 
        {
            const itemType = ninjaTypes.itemTypes[n];
            await this.#cacheTypeAsync(this.#itemEndpoint, itemType);
        }
        for (var n = 0; n < ninjaTypes.currencyTypes.length; n++) 
        {
            const currencyType = ninjaTypes.currencyTypes[n];
            await this.#cacheTypeAsync(this.#currencyEndpoint, currencyType);
        }

        console.log(`Caching complete, creating new timestamp for time ${now}`);
        await writeFile(this.#timestampPath, now.toString());

        return true;
    }

    async #ensurePathAsync() {
        if (!pathExists(this.#cachePath)) {
            console.log(`Cacher path '${this.#cachePath}' does not exist, creating...`);
            await mkdir(this.#cachePath, {recursive: true});
            console.log(`Cacher path '${this.#cachePath}' created!`);
        }
        if (!pathExists(dirname(this.#outputPath))) {
            console.log(`Output path '${dirname(this.#outputPath)}' does not exist, creating...`);
            await mkdir(dirname(this.#outputPath), {recursive: true});
            console.log(`Cacher path '${dirname(this.#outputPath)}' created!`);
        }
    }

    async #isExpiredAsync(now) {
        let expires = now -1;

        if (pathExists(this.#timestampPath)) {
            const expiresRaw = await readFile(this.#timestampPath, { encoding: 'utf8' });
            const timestamp = parseInt(expiresRaw);
            expires = timestamp + this.#expiration_ms
            const timestampDate = new Date(timestamp).toLocaleString();
            const expiresDate = new Date(expires).toLocaleString();
            console.log(`.timestamp file located, last file cache was at: ${timestampDate} (Expires: ${expiresDate})`);
        } else {
            console.log(`No .timestamp file located, assuming data requires reloading...`);
        }
    
        return now >= expires;
    }

    async #cacheTypeAsync(endpoint, ninjaType) {
        var path = pathJoin(this.#cachePath, `${ninjaType}.json`);

        const uri = `${endpoint}?league=${this.#league}&type=${ninjaType}`;
        console.log(`    └ Parsing ${uri} --> ${path}`);

        var data = await fetchJson(uri);
        var json = JSON.stringify(data, null, 4);

        await writeFile(path, json);

        await setTimeout(this.#apiDelay_ms);

        this.#cache[ninjaType] = data;
    }

    #output = {};
    async #compileAsync() {

        for (var n = 0; n < ninjaTypes.allTypes.length; n++) {
            const ninjaType = ninjaTypes.allTypes[n];
            const data = this.#cache[ninjaType];

            // Unique data requires seperate special processing
            if (ninjaType.startsWith(`Unique`)) {
                this.#loadUniquesData(data);
                continue;
            }

            const strategy = this.#strategyProvider.getStrategy(ninjaType);

            if (ninjaType == `Currency`) {
                this.#processLineAsync(ninjaType, strategy, 1, `Chaos Orb`, null);
                this.#processLineAsync(ninjaType, strategy, 0.001, `Scroll of Wisdom`, null);
            }

            for (let n = 0; n < data.lines.length; n++) {
                const lineData = data.lines[n];
                const lineName = this.#getLineName(lineData);
                const lineValue = this.#getLineValue(lineData);

                await this.#processLineAsync(ninjaType, strategy, lineValue, lineName, lineData);
            }
        }

        this.#outputUniques();

        const outputJson = JSON.stringify(this.#output, null, 4);
        await writeFile(this.#outputPath, outputJson);
    }

    #getLineName(lineData) {
        // if (Object.hasOwn(lineData, `currencyTypeName`)) {
        //     return lineData.currencyTypeName;
        // } else if (Object.hasOwn(lineData, `name`)) {
        //     return lineData.name;
        // } 

        if (`currencyTypeName` in lineData) 
        {
            return lineData.currencyTypeName;
        } 
        else if (`name` in lineData)
        {
            return lineData.name;
        } 
        throw new Error("Unrecognized lineData in data, no name value found!");
    }
    
    #getLineValue(lineData) {
        // if (Object.hasOwn(lineData, `chaosEquivalent`)) {
        //     return lineData.chaosEquivalent;
        // } else if (Object.hasOwn(lineData, `chaosValue`)) {
        //     return lineData.chaosValue;
        // } 

        if (`chaosEquivalent` in lineData) 
        {
            return lineData.chaosEquivalent;
        } 
        else if (`chaosValue` in lineData)
        {
            return lineData.chaosValue;
        } 
        throw new Error("Unrecognized lineData in data, no chaosValue or chaosEquivalent found!");
    }

    async #processLineAsync(ninjaType, strategy, lineValue, lineName, lineData) {
        const rootTier = this.#getRootTier(lineValue, lineValue);
        const tier = await strategy.getTierAsync(ninjaType, rootTier, lineName, lineValue, lineData);
        if (tier === ``)
        {
            return;
        }
        if (!(tier in this.#output)) {
            this.#output[tier] = [];
        };

        const trueNames = await strategy.getTrueNamesAsync(ninjaType, rootTier, lineName, lineValue, lineData);
        for (var n = 0; n < trueNames.length; n++) {
            this.#output[tier].push(trueNames[n]);
        }
    }

    #getRootTier(min, max) 
    {
        var entries = Object.entries(this.#priceBreakpoints);
        for (var n = entries.length -1; n >= 0; n--) {
            const [tier, breakpoint] = entries[n];
            if (max > breakpoint) {
                // special case for items that have a max and min that vary more than 1 tier
                if (max != min && min < breakpoint) {
                    return `VariedTier`;
                }
                return tier;
            }
        }
        throw new Error(`No tier range found for value of ${lineValue}, please double check price breakpoints`);
    }

    #uniquesData = {};
    #loadUniquesData(data) {
        for (let n = 0; n < data.lines.length; n++) {
            const lineData = data.lines[n];
            const baseType = lineData.baseType;
            const chaosValue = lineData.chaosValue;

            if (!(baseType in this.#uniquesData)) 
            {
                this.#uniquesData[baseType] = {
                    min: chaosValue,
                    max: chaosValue
                }
            } else {
                if (chaosValue < this.#uniquesData[baseType].min) { 
                    this.#uniquesData[baseType].min = chaosValue;
                }
                if (chaosValue > this.#uniquesData[baseType].max) { 
                    this.#uniquesData[baseType].max = chaosValue;
                }
            }
        }
    }
    #outputUniques() 
    {
        var keys = Object.keys(this.#uniquesData);
        for (let n = 0; n < keys.length; n++) {
            var baseType = keys[n];

            var min = this.#uniquesData[baseType].min;
            var max = this.#uniquesData[baseType].max;

            var tier = this.#getRootTier(min, max) + "_Unique";
            if (!(tier in this.#output)) {
                this.#output[tier] = [];
            };
            this.#output[tier].push(baseType);
        }
    }
}

export default PixxelNinjaParser;