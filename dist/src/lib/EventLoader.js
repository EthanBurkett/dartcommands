"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const glob_1 = require("glob");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const __1 = require("..");
const PG = (0, util_1.promisify)(glob_1.glob);
class EventLoader {
    constructor(client, options, instance) {
        (this._client = client),
            (this._instance = instance),
            (this._options = options);
        this._eventConfigs = new discord_js_1.Collection();
        this.Load();
    }
    async Load() {
        (await PG(`${path_1.default.join(process.cwd(), this._options.eventsDir)}/**/*.${this._options.typescript ? "ts" : "js"}`)).map(async (file) => {
            const L = file.split("/");
            let name = L[L.length - 1].substring(0, L[L.length - 1].length - 3);
            let func = require(file).default
                ? require(file).default.run
                : require(file).run;
            let config = require(file).default
                ? require(file).default.config
                : require(file).config;
            if (!func || typeof func != "function") {
                __1.Utils.CLIError(`${name} needs to have a 'run' export that is a function.`);
                process.exit(0);
            }
            if (!config) {
                __1.Utils.CLIError(`${name} is missing the config export.`);
                process.exit(0);
            }
            if (!config.name) {
                __1.Utils.CLIError(`${name} missing an event name`);
                process.exit(0);
            }
            func(this._client, this._instance);
        });
    }
}
exports.default = EventLoader;
