"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const discord_js_1 = require("discord.js");
const CommandLoader_1 = __importDefault(require("./lib/CommandLoader"));
const CommandHandler_1 = __importDefault(require("./lib/CommandHandler"));
const english_1 = require("./lang/english");
const EventLoader_1 = __importDefault(require("./lib/EventLoader"));
const Mongo_1 = require("./lib/Mongo");
const chalk_1 = __importDefault(require("chalk"));
exports.Utils = {
    CLILog: (...messages) => console.log(chalk_1.default.blueBright.bold("DartCommands"), chalk_1.default.white.bold(">"), ...messages),
    CLIError: (...messages) => {
        console.log(chalk_1.default.redBright.bold("DartCommands Error"), chalk_1.default.white.bold(">"), ...messages);
    },
};
class default_1 {
    constructor(client, options) {
        this._cache = {
            GuildPrefixes: new discord_js_1.Collection(),
        };
        this._client = client;
        this._options = options;
        this._prefix = "!";
        this._defaultColor = 0xffffff;
        this._CommandLoader();
        this._EventHandler();
        if (options.mongo)
            this.Mongo();
    }
    async Mongo() {
        if (!this._options.mongo)
            return;
        if (!this._options.mongo.options) {
            await (0, Mongo_1.Connect)(this._options.mongo.uri);
        }
        else {
            await (0, Mongo_1.Connect)(this._options.mongo.uri, this._options.mongo.options);
        }
        Mongo_1.Cache.InitialCache();
        this._cache = Mongo_1.Cache;
    }
    _CommandLoader() {
        this._commandLoader = new CommandLoader_1.default(this._client, this._options);
        new CommandHandler_1.default(this._client, this._options, this);
        exports.Utils.CLILog("Bot is now online");
    }
    _EventHandler() {
        if (!this._options.eventsDir)
            return;
        this._eventHandler = new EventLoader_1.default(this._client, this._options, this);
    }
    defaultPrefix(p) {
        this._prefix = p;
        return this;
    }
    get client() {
        return this._client;
    }
    get prefix() {
        return this._prefix;
    }
    get events() {
        return this._eventHandler.events;
    }
    get commands() {
        return this._commandLoader.commands;
    }
    get settings() {
        return this._options;
    }
    get Cache() {
        return this._cache;
    }
    UpdatePrefix(guildId, newPrefix) {
        var _a;
        (_a = this._cache) === null || _a === void 0 ? void 0 : _a.UpdatePrefix(guildId, newPrefix);
    }
    setLanguageSettings(props) {
        if (props) {
            Object.assign(english_1.Messages, props);
        }
        return this;
    }
    defaultColor(color) {
        this._defaultColor = color;
        return this;
    }
    get getDefaultColor() {
        return this._defaultColor;
    }
    get self() {
        return this;
    }
}
exports.default = default_1;
