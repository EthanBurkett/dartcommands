"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
Array.prototype.chunk = function (size) {
    let result = [];
    while (this.length) {
        result.push(this.splice(0, size));
    }
    return result;
};
exports.default = {
    description: "Displays the menu for all commands",
    options: [
        {
            name: "page",
            description: "help menu page",
            type: "INTEGER",
        },
    ],
    run({ channel, instance, args, message, user }) {
        const actionRow = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
            .setCustomId("first")
            .setLabel("<<")
            .setStyle("PRIMARY"), new discord_js_1.MessageButton()
            .setCustomId("previous")
            .setLabel("<")
            .setStyle("SECONDARY"), new discord_js_1.MessageButton()
            .setCustomId("next")
            .setLabel(">")
            .setStyle("SECONDARY"), new discord_js_1.MessageButton().setCustomId("last").setLabel(">>").setStyle("PRIMARY"));
        let page = parseInt(args[0]);
        if (!page)
            page = 1;
        Array.from(instance === null || instance === void 0 ? void 0 : instance.commands.values());
        const chunks = [...instance === null || instance === void 0 ? void 0 : instance.commands.values()].chunk(4);
        const Page = (index) => {
            return chunks.map((value, i) => {
                if (index - 1 != i)
                    return;
                if (!value)
                    return;
                const values = value.map((Commands) => Commands);
                return values;
            });
        };
        const embed = new discord_js_1.MessageEmbed({
            title: `Help | Page ${page}`,
            description: `You can navigate through pages by clicking the buttons below`,
            color: "BLURPLE",
            footer: {
                text: `Page ${page}/${chunks.length}`,
            },
        });
        Page(page).map((commands) => {
            if (!commands)
                return;
            commands.map((Command, index) => {
                if (!Command)
                    return;
                embed.addField(`**${Command.name}**${Command.aliases ? ` [${Command.aliases.join(", ")}]` : ""}${Command.slash === true ? " | SLASH ONLY" : ""}`, `${Command.description}${Command.expectedArgs ? `\nArguments: ${Command.expectedArgs}` : ""}${Command.permission ? `\nPermission: ${Command.permission}` : ""}${Command.minArgs ? `\nMinimum Args: ${Command.minArgs}` : ``}${Command.maxArgs ? `\nMaximum Args: ${Command.maxArgs}` : ``}`, false);
            });
        });
        message
            .reply({
            embeds: [embed],
            components: [actionRow],
        })
            .then((msg) => {
            const collector = msg.createMessageComponentCollector({
                componentType: "BUTTON",
                filter: (i) => {
                    return !i.user.bot;
                },
            });
            collector.on("collect", (i) => {
                if (i.user.id != user.id)
                    return i.reply({
                        ephemeral: true,
                        embeds: [
                            new discord_js_1.MessageEmbed()
                                .setColor("RED")
                                .setTitle("You cannot interact with this embed"),
                        ],
                    });
                i.deferUpdate();
                const action = i.customId;
                if (action == "previous")
                    page - 1 == 0 ? (page = chunks.length) : (page = page - 1);
                if (action == "next")
                    page + 1 > chunks.length ? (page = 1) : (page = page + 1);
                if (action == "first")
                    page = 1;
                if (action == "last")
                    page = chunks.length;
                const newEmbed = new discord_js_1.MessageEmbed({
                    title: `Help | Page ${page}`,
                    description: `You can navigate through pages by clicking the buttons below`,
                    color: "BLURPLE",
                    footer: {
                        text: `Page ${page}/${chunks.length}`,
                    },
                });
                Page(page).map((commands) => {
                    if (!commands)
                        return;
                    commands.map((Command, index) => {
                        if (!Command)
                            return;
                        newEmbed.addField(`**${Command.name}**${Command.aliases ? ` [${Command.aliases.join(", ")}]` : ""}${Command.slash === true ? " | SLASH ONLY" : ""}`, `${Command.description}${Command.expectedArgs
                            ? `\nArguments: ${Command.expectedArgs}`
                            : ""}${Command.permission
                            ? `\nPermission: ${Command.permission}`
                            : ""}${Command.minArgs ? `\nMinimum Args: ${Command.minArgs}` : ``}${Command.maxArgs ? `\nMaximum Args: ${Command.maxArgs}` : ``}`, false);
                    });
                });
                msg.edit({
                    embeds: [newEmbed],
                    components: [actionRow],
                });
            });
        });
        return;
    },
};
