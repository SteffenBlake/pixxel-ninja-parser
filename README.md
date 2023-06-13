# pixxel-filter-style

# Installation

`npm install git+https://github.com/SteffenBlake/pixxel-ninja-parser`

# Consuming

```
import { PixxelNinjaParser } from 'pixxel-ninja-parser';

var parser = new PixxelNinjaParser({
    league: `...`, // Required
    priceBreakpoints: { ... }, // Required
    expiration_ms: ..., // Default: 21600000
    apiDelay_ms: ..., // Default: 3000
    cachePath: `...`, // Default: "./"
    outputPath: `...`, // Default: "./output.json"
    apiEndpoint: `...` // Default: "https://poe.ninja/api/data"
});
await parser.runAsync();
```

# Configuration

## league

String for the League to pull Poe Ninja api data from. Case Sensitive. (IE: `Crucible`)

## priceBreakpoints

Key Value Pair dictionary of strings to integers, representing "breakpoints" of value by which to breakdown all poe.ninja API endpoint categories into "value" tiers.

For example, the following dictionary:

```
priceBreakpoints: {
    "TrashTier": 0, 
    "ChaosTier": 1, 
    "ExaltTier": 15, 
    "DivineTier": 215,
    "MirrorTier": 1000
},
```

Would produce tiers named things like `TrashTier_Currency` `ChaosTier_Currency` ... `MirrorTier_Currency`, etc etc

The complete output of all tiers that are produced can be reviewed in the output json file.

## expiration_ms

How long it takes for poe ninja cached data to expire and require re-caching, in milliseconds.

Default: 21600000 (6 hours)

## apiDelay_ms

Delay between API polls of each poe.ninja API endpoint, in milliseconds. Used to avoid slamming their servers and getting rate limited. Don't lower this too much ideally.

Default: 3000 (3 seconds)

## cachePath

Path to the directory to cache poe ninja data in.

Default: `./`

## outputPath

Path to the json file to output the compiled results to.

Default: `./output.json`

## apiEndpoint

Api Endpoint base to use

Default: `https://poe.ninja/api/data`