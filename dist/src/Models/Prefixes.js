"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Name = "dartcommands-prefixes";
exports.default = mongoose_1.default.models[Name] ||
    mongoose_1.default.model(Name, new mongoose_1.default.Schema({
        GuildID: {
            type: String,
            required: true,
        },
        Prefix: {
            type: String,
            required: true,
        },
    }));
