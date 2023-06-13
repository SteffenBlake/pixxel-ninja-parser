#!/usr/bin/env node
import { PixxelNinjaParser } from './src/pixxel-ninja-parser.js';

var parser = new PixxelNinjaParser({
    league: `Crucible`,
    priceBreakpoints: {
        "TrashTier": 0, 
        "ChaosTier": 1, 
        "ExaltTier": 15, 
        "DivineTier": 215, 
        "MirrorTier": 1000 
    },
    cachePath: `./cache`,
    outputPath: `./output/results.json`
});
await parser.runAsync();

