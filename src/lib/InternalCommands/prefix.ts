import { Message, MessageEmbed } from "discord.js";
import { Events, ICommand } from "../../../index";
import { Messages } from "../../lang/english";

export default {
  description: "Change the prefix for the guild",
  permission: "ADMINISTRATOR",
  async run({ guild, channel, instance, args, client }) {
    if (!guild) return;
    if (!args![0]) {
      const GuildPrefix = instance?.Cache.GuildPrefixes?.get(guild.id);
      return new MessageEmbed({
        title: `This guild's prefix is: ${
          GuildPrefix ? GuildPrefix : instance!.prefix
        }`,
        color: instance?.getDefaultColor,
      });
    }
    const newPrefix = args![0].toLowerCase();
    if (newPrefix.length > 8)
      return new MessageEmbed({
        title: "Prefix cannot be longer than 8 characters",
        color: "RED",
      });

    await instance?.Cache.UpdatePrefix!(guild.id, newPrefix);

    if (!Messages.prefixUpdated) return;

    if (typeof Messages.prefixUpdated == "object") {
      if (!Messages.prefixUpdated || !Messages.prefixUpdated.description)
        return;
      Messages.prefixUpdated.description =
        Messages.prefixUpdated.description.replace(/{PREFIX}/g, `${newPrefix}`);
      return channel.send({
        embeds: [Messages.prefixUpdated],
      });
    }
    if (!Messages?.prefixUpdated) return;

    Messages!.prefixUpdated = Messages?.prefixUpdated.replace(
      /{PREFIX}/g,
      `${newPrefix}`
    );

    client.emit<Events>("Dart.UpdatePrefix", guild.id, newPrefix);

    return channel.send({
      content: Messages?.prefixUpdated,
    });
  },
} as ICommand;
