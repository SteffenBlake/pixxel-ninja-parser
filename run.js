#!/usr/bin/env node
import dotenv from 'dotenv-defaults';
dotenv.config();

import { PixxelNinjaParser } from './src/pixxel-ninja-parser.js';

var parser = new PixxelNinjaParser();
await parser.runAsync();

