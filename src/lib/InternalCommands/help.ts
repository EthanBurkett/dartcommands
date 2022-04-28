import { ICommand } from "../../../index";
import {
  ButtonInteraction,
  CacheType,
  Collection,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";

declare global {
  interface Array<T> {
    chunk(size: number): any[];
  }
}

Array.prototype.chunk = function (size: number): any {
  let result = [];

  while (this.length) {
    result.push(this.splice(0, size));
  }

  return result;
};

export default {
  description: "Displays the menu for all commands",
  options: [
    {
      name: "page",
      description: "help menu page",
      type: "INTEGER",
    },
  ],
  run({ channel, instance, args, message, user }) {
    const actionRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("first")
        .setLabel("<<")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("previous")
        .setLabel("<")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId("next")
        .setLabel(">")
        .setStyle("SECONDARY"),
      new MessageButton().setCustomId("last").setLabel(">>").setStyle("PRIMARY")
    );
    let page = parseInt(args![0]);

    if (!page) page = 1;

    Array.from(instance?.commands.values());
    const chunks = [...instance?.commands.values()].chunk(4);

    const Page = (index: number): ICommand[] => {
      return chunks.map((value: any, i: number) => {
        if (index - 1 != i) return;
        if (!value) return;
        const values = value.map((Commands: any) => Commands);
        return values;
      });
    };

    const embed = new MessageEmbed({
      title: `Help | Page ${page}`,
      description: `You can navigate through pages by clicking the buttons below`,
      color: "BLURPLE",
      footer: {
        text: `Page ${page}/${chunks.length}`,
      },
    });

    Page(page).map((commands: any) => {
      if (!commands) return;
      commands.map((Command: ICommand, index: number) => {
        if (!Command) return;
        embed.addField(
          `**${Command.name!}**${
            Command.aliases ? ` [${Command.aliases.join(", ")}]` : ""
          }${Command.slash === true ? " | SLASH ONLY" : ""}`,
          `${Command.description}${
            Command.expectedArgs ? `\nArguments: ${Command.expectedArgs}` : ""
          }${Command.permission ? `\nPermission: ${Command.permission}` : ""}${
            Command.minArgs ? `\nMinimum Args: ${Command.minArgs}` : ``
          }${Command.maxArgs ? `\nMaximum Args: ${Command.maxArgs}` : ``}`,
          false
        );
      });
    });

    message!
      .reply({
        embeds: [embed],
        components: [actionRow],
      })
      .then((msg: Message<boolean>) => {
        const collector = msg.createMessageComponentCollector({
          componentType: "BUTTON",
          filter: (i: ButtonInteraction<CacheType>) => {
            return !i.user.bot;
          },
        });

        collector.on("collect", (i: ButtonInteraction<CacheType>) => {
          if (i.user.id != user!.id)
            return i.reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setColor("RED")
                  .setTitle("You cannot interact with this embed"),
              ],
            });

          i.deferUpdate();

          const action: "previous" | "next" | "first" | "last" =
            i.customId as any;

          if (action == "previous")
            page - 1 == 0 ? (page = chunks.length) : (page = page - 1);
          if (action == "next")
            page + 1 > chunks.length ? (page = 1) : (page = page + 1);
          if (action == "first") page = 1;
          if (action == "last") page = chunks.length;

          const newEmbed = new MessageEmbed({
            title: `Help | Page ${page}`,
            description: `You can navigate through pages by clicking the buttons below`,
            color: "BLURPLE",
            footer: {
              text: `Page ${page}/${chunks.length}`,
            },
          });

          Page(page).map((commands: any) => {
            if (!commands) return;
            commands.map((Command: ICommand, index: number) => {
              if (!Command) return;
              newEmbed.addField(
                `**${Command.name!}**${
                  Command.aliases ? ` [${Command.aliases.join(", ")}]` : ""
                }${Command.slash === true ? " | SLASH ONLY" : ""}`,
                `${Command.description}${
                  Command.expectedArgs
                    ? `\nArguments: ${Command.expectedArgs}`
                    : ""
                }${
                  Command.permission
                    ? `\nPermission: ${Command.permission}`
                    : ""
                }${
                  Command.minArgs ? `\nMinimum Args: ${Command.minArgs}` : ``
                }${
                  Command.maxArgs ? `\nMaximum Args: ${Command.maxArgs}` : ``
                }`,
                false
              );
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
} as ICommand;
