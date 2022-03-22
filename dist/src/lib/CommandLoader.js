"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const glob_1 = require("glob");
const util_1 = require("util");
const PG = (0, util_1.promisify)(glob_1.glob);
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const index_1 = require("../index");
class CommandLoader {
    constructor(client, options) {
        this._commands = new discord_js_1.Collection();
        this._client = client;
        this._options = options;
        this.load();
        this.loadInternal();
    }
    async load() {
        (await PG(`${path_1.default.join(process.cwd(), this._options.commandsDir)}/**/*.${this._options.typescript ? "ts" : "js"}`)).map((file) => {
            const L = file.split("/");
            let name = L[L.length - 1].substring(0, L[L.length - 1].length - 3);
            let Command = this._options.typescript
                ? require(file).default
                : require(file);
            if (!Command) {
                console.log(chalk_1.default.red.bold(`Error: `) +
                    "Could not load command " +
                    chalk_1.default.white.bold(name));
                process.exit(0);
            }
            if (Command.name) {
                name = Command.name;
            }
            else {
                Command.name = name;
            }
            if (!Command.run) {
                console.log(chalk_1.default.red.bold(`Error: `) +
                    "No property named 'run' in command: " +
                    chalk_1.default.white.bold(name));
                process.exit(0);
            }
            this._commands.set(name, Command);
        });
    }
    // TODO: Change to JS on production build
    async loadInternal() {
        (await PG(`${path_1.default.join(__dirname, "InternalCommands")}/**/*.js`)).map((file) => {
            var _a;
            const L = file.split("/");
            let name = L[L.length - 1].substring(0, L[L.length - 1].length - 3);
            let Command = require(file).default;
            if (!Command) {
                console.log(chalk_1.default.red.bold(`Error: `) +
                    "Could not load command " +
                    chalk_1.default.white.bold(name));
                process.exit(0);
            }
            if (Command.name) {
                name = Command.name;
            }
            else {
                Command.name = name;
            }
            if ((_a = this._options.disabledDefaultCommands) === null || _a === void 0 ? void 0 : _a.includes(name))
                return;
            if (!Command.run) {
                console.log(chalk_1.default.red.bold(`Error: `) +
                    "No property named 'run' in command: " +
                    chalk_1.default.white.bold(name));
                process.exit(0);
            }
            this._commands.set(name, Command);
        });
        index_1.Utils.CLILog(`Loaded ${chalk_1.default.blueBright(this._commands.size)} command(s)`);
    }
    get commands() {
        return this._commands;
    }
}
exports.default = CommandLoader;
