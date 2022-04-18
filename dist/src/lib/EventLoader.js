"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const util_1 = require("util");
const EventHandler_1 = __importDefault(require("./EventHandler"));
const index_1 = require("../index");
const chalk_1 = __importDefault(require("chalk"));
const PG = (0, util_1.promisify)(glob_1.glob);
class EventLoader {
    constructor(client, options) {
        this._client = client;
        this._options = options;
        this._events = new discord_js_1.Collection();
        this.handleFiles();
    }
    async handleFiles() {
        if (!this._options.eventsDir)
            return;
        try {
            (await PG(`${path_1.default.join(process.cwd(), this._options.eventsDir)}/**/*.${this._options.typescript ? "ts" : "js"}`)).map((file) => {
                let Event = this._options.typescript
                    ? require(file).default
                    : require(file);
                const L = file.split("/");
                let name = L[L.length - 1].substring(0, L[L.length - 1].length - 3);
                if (!Event)
                    throw new Error(`Error loading events`);
                if (!Event.name) {
                    Event.name = name;
                }
                if (!Event.run) {
                    index_1.Utils.CLIError(chalk_1.default.bold(`${name}`), 'is missing the required "run" property.');
                    process.exit(0);
                }
                this._events.set(Event.name, Event);
            });
            index_1.Utils.CLILog(`Loaded ${chalk_1.default.blueBright(this._events.size)} event(s)`);
            new EventHandler_1.default(this._client, this._options, this._events);
        }
        catch (e) {
            throw new Error(e);
        }
    }
}
exports.default = EventLoader;
