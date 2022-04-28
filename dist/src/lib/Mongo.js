"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = exports.Connect = void 0;
const discord_js_1 = require("discord.js");
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../index");
const Prefixes_1 = __importDefault(require("../Models/Prefixes"));
async function Connect(uri, dbOptions = {}) {
    const options = Object.assign({ keepAlive: true }, dbOptions);
    try {
        await mongoose_1.default
            .connect(uri, options)
            .catch((e) => {
            index_1.Utils.CLIError("Mongo: " + e);
            process.exit(0);
        })
            .then(() => index_1.Utils.CLILog("Mongo connected"));
    }
    catch (e) {
        index_1.Utils.CLIError("Mongo: " + e);
        process.exit(0);
    }
}
exports.Connect = Connect;
exports.Cache = {
    GuildPrefixes: new discord_js_1.Collection(),
    InitialCache: async () => {
        const res = await Prefixes_1.default.find();
        if (!res)
            return;
        res.map((Guild) => {
            exports.Cache.GuildPrefixes.set(Guild.GuildID, Guild.Prefix);
        });
        return exports.Cache;
    },
    async UpdatePrefix(GuildID, Prefix) {
        const res = await Prefixes_1.default.findOne({ GuildID });
        if (!res) {
            await Prefixes_1.default.create({
                GuildID,
                Prefix,
            });
        }
        else {
            await Prefixes_1.default.findOneAndUpdate({
                GuildID,
            }, {
                Prefix,
            });
        }
        exports.Cache.GuildPrefixes.set(GuildID, Prefix);
    },
};
