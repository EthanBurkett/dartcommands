"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const __1 = __importDefault(require("../.."));
const Name = "dartcommands-prefixes";
const schema = new mongoose_1.default.Schema({
    GuildID: {
        type: String,
        required: true,
    },
    Prefix: {
        type: String,
        required: true,
    },
});
schema.post("save", (guildid, prefix) => {
    __1.default.prototype.client.emit("Dart.UpdatePrefix", guildid, prefix);
});
exports.default = mongoose_1.default.models[Name] || mongoose_1.default.model(Name, schema);
