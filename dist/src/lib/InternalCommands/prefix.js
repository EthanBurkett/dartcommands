"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const english_1 = require("../../lang/english");
exports.default = {
    description: "Change the prefix for the guild",
    permission: "ADMINISTRATOR",
    async run({ guild, channel, instance, args, client }) {
        var _a;
        if (!guild)
            return;
        if (!args[0]) {
            const GuildPrefix = (_a = instance === null || instance === void 0 ? void 0 : instance.Cache.GuildPrefixes) === null || _a === void 0 ? void 0 : _a.get(guild.id);
            return new discord_js_1.MessageEmbed({
                title: `This guild's prefix is: ${GuildPrefix ? GuildPrefix : instance.prefix}`,
                color: instance === null || instance === void 0 ? void 0 : instance.getDefaultColor,
            });
        }
        const newPrefix = args[0].toLowerCase();
        if (newPrefix.length > 8)
            return new discord_js_1.MessageEmbed({
                title: "Prefix cannot be longer than 8 characters",
                color: "RED",
            });
        await (instance === null || instance === void 0 ? void 0 : instance.Cache.UpdatePrefix(guild.id, newPrefix));
        if (!english_1.Messages.prefixUpdated)
            return;
        if (typeof english_1.Messages.prefixUpdated == "object") {
            if (!english_1.Messages.prefixUpdated || !english_1.Messages.prefixUpdated.description)
                return;
            english_1.Messages.prefixUpdated.description =
                english_1.Messages.prefixUpdated.description.replace(/{PREFIX}/g, `${newPrefix}`);
            return channel.send({
                embeds: [english_1.Messages.prefixUpdated],
            });
        }
        if (!(english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.prefixUpdated))
            return;
        english_1.Messages.prefixUpdated = english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.prefixUpdated.replace(/{PREFIX}/g, `${newPrefix}`);
        client.emit("Dart.UpdatePrefix", guild.id, newPrefix);
        return channel.send({
            content: english_1.Messages === null || english_1.Messages === void 0 ? void 0 : english_1.Messages.prefixUpdated,
        });
    },
};
