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
    }
    checkUnusedSlash() {
        var _a;
        index_1.Utils.CLILog("Checking for unused slash commands...");
        this._client.guilds.cache.map(async (guild) => {
            await guild.commands.fetch();
            guild.commands.cache.map((slash) => {
                const cmd = this._commands.find((cmd) => cmd.name == slash.name);
                if (!cmd)
                    return;
                if (!cmd.slash) {
                    slash.delete();
                    index_1.Utils.CLILog(`Removing guild slash command "${cmd.name}" due to property "slash" being disabled.`);
                }
            });
        });
        (async () => { var _a; return await ((_a = this._client.application) === null || _a === void 0 ? void 0 : _a.commands.fetch()); })();
        (_a = this._client.application) === null || _a === void 0 ? void 0 : _a.commands.cache.map((slash) => {
            const cmd = this._commands.find((cmd) => cmd.name == slash.name);
            if (!cmd)
                return;
            if (!cmd.slash) {
                slash.delete();
                index_1.Utils.CLILog(`Removing client slash command "${cmd.name}" due to property "slash" being disabled.`);
            }
        });
    }
    async load() {
        this.loadInternal();
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
            if (Command.slash) {
                if (this._options.testServers && Command.testOnly) {
                    this._options.testServers.map((server) => {
                        this.create(Command.name, Command.description, Command.options, server);
                    });
                }
                else {
                    this.create(Command.name, Command.description, Command.options);
                }
            }
            this._commands.set(name, Command);
        });
        this.checkUnusedSlash();
        index_1.Utils.CLILog(`Loaded ${chalk_1.default.blueBright(`${this._commands.size}`)} command(s)`);
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
            if (name == "prefix" && !this._options.mongo)
                return;
            if (!Command.run) {
                console.log(chalk_1.default.red.bold(`Error: `) +
                    "No property named 'run' in command: " +
                    chalk_1.default.white.bold(name));
                process.exit(0);
            }
            this._commands.set(name, Command);
        });
    }
    get commands() {
        return this._commands;
    }
    didOptionsChange(command, options) {
        var _a;
        return (((_a = command.options) === null || _a === void 0 ? void 0 : _a.filter((opt, index) => {
            var _a, _b, _c;
            return ((opt === null || opt === void 0 ? void 0 : opt.required) !== ((_a = options[index]) === null || _a === void 0 ? void 0 : _a.required) &&
                (opt === null || opt === void 0 ? void 0 : opt.name) !== ((_b = options[index]) === null || _b === void 0 ? void 0 : _b.name) &&
                ((_c = opt === null || opt === void 0 ? void 0 : opt.options) === null || _c === void 0 ? void 0 : _c.length) !== options.length);
        }).length) !== 0);
    }
    getCommands(guildId) {
        var _a, _b;
        if (guildId) {
            return (_a = this._client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
        }
        return (_b = this._client.application) === null || _b === void 0 ? void 0 : _b.commands;
    }
    async create(name, description, options, guildId) {
        var _a, _b;
        let commands;
        if (guildId) {
            commands = (_a = this._client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
        }
        else {
            commands = (_b = this._client.application) === null || _b === void 0 ? void 0 : _b.commands;
        }
        if (!commands) {
            return;
        }
        // @ts-ignore
        await commands.fetch();
        const cmd = commands.cache.find((cmd) => cmd.name === name);
        if (cmd) {
            const optionsChanged = this.didOptionsChange(cmd, options);
            if ((cmd.options &&
                cmd.description &&
                options &&
                cmd.options.length != options.length) ||
                cmd.description !== description ||
                optionsChanged) {
                index_1.Utils.CLILog(`Updating${guildId ? " guild" : ""} slash command "${name}"`);
                return commands === null || commands === void 0 ? void 0 : commands.edit(cmd.id, {
                    name,
                    description,
                    options,
                });
            }
            return Promise.resolve(cmd);
        }
        if (commands) {
            index_1.Utils.CLILog(`Creating${guildId ? " guild" : ""} slash command "${name}"`);
            const newCommand = await commands.create({
                name,
                description,
                options,
            });
            return newCommand;
        }
        return Promise.resolve(undefined);
    }
    async delete(commandId, guildId) {
        const commands = this.getCommands(guildId);
        if (commands) {
            const cmd = commands.cache.get(commandId);
            if (cmd) {
                index_1.Utils.CLILog(`Deleted${guildId ? " guild" : ""} slash command "${cmd.name}".`);
                cmd.delete();
            }
        }
        return Promise.resolve(undefined);
    }
}
exports.default = CommandLoader;
