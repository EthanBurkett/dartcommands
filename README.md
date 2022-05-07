# Dart Commands

Dart Commands is a simple command handler to easily create discord bots meant to be lightweight.

## Ongoing Development

You can see the bot currently being developed with DartCommands [here](https://www.github.com/ethanburkett/slitherbot)

## Getting started

To get started with DartCommands just install the package globally and run the CLI tool that automatically creates a boiler plate template

```
npm i -g dartcommands
```

And then run the CLI tool

```
dartcommands
```

### Without the CLI tool

First create your index file
`index.js`

```js
const DartCommands = require("dartcommands");
const { Client, Intents } = require("discord.js");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Settings with question marks mean they are optional
client.on('ready', () => {
  new DartCommands(client, {
    commandsDir: 'Commands',
    eventsDir?: 'Events',
    botOwners?: ['user id'],
    ignoreBots?: true | false,
    testServers?: ['server id'],
    typescript?: true | false,
    mongo?: {
      uri: 'mongo connection',
      options?: {
        keepAlive?: true | false
      }
    }
  })
})
```

## Custom Messages

You can integrate your own custom messages when an error occurs like too many arguments, not enough arguments, the default prefix message, etc.

Custom messages can be strings or embeds. When using embeds variables are only applicable in the description property.

```js
new DartCommands(client, {
  commandsDir: "Commands",
}).setLanguageSettings({
  minArgs:
    "Supply at least {MIN} arguments. Syntax for this command is {EXPECTED}", // The 'expectedArgs' options is required in your commands to use the {EXPECTED} variable
  maxArgs: new MessageEmbed({
    title: "Too many arguments",
    description: "You can only supply up to {MAX} arguments",
  }),
  noPermission: "You don't have permission to run this command.",
  ownerOnly: `Only the bot owners can run this command`,
  testOnly: `This command can not be run in this server`,
  prefixUpdated: `Updated this guild's prefix to **{PREFIX}**`,
});
```

## Default Embed Color

You can set the embed color of embeds that are returned from internal commands like '!prefix'. Colors must be provided in a hex format using 0x{HEX}

```js
new DartCommands(client, {
  commandsDir: "Commands",
}).defaultColor(0x000000);
```

## Disabling default commands

You can disable commands that come with DartCommands using the 'disabledDefaultCommands' property

```js
new DartCommands(client, {
  commandsDir: "Commands",
  disabledDefaultCommands: ["prefix"],
});
```

### And that's it! You can now start creating commands for your bot

We're going to create a command that sends "Pong!" as a message

### With the recent update, slash commands are now supported!

`Commands/ping.js`

```js
module.exports = {
  name?: 'ping',
  description: 'Returns pong!',
  ownerOnly?: true | false,
  testOnly?: true | false,
  minArgs?: 1,
  maxArgs?: 2,
  slash?: "both", // Can also be set to true to only be a slash command.
  options: [
    {
      name: "arg1",
      description: "1st argument of slash command",
      required: true,
      type: "STRING"
    },
    {
      name: "arg2",
      description: "2nd argument of slash command",
      type: "STRING"
    }
  ],
  expectedArgs?: '<arg1> [arg2]',
  aliases?: ['p'],
  permission?: 'ADMINISTRATOR',
  async run({
    args,
    channel,
    guild,
    instance,
    member,
    message,
    text,
    user,
    client,
    interaction
  }) {
    return "Pong!"
    or
    return channel.send({ content: "pong!" })
    or
    return {
      custom: true,
      content: "Pong!"
    }
    or
    return new MessageEmbed({
      description: "Pong!"
    })
  }
}
```

#### With TypeScript

```ts
import { ICommand } from "dartcommands";
export default {
  description: "Returns pong!",
  async run() {
    return "Pong!";
  },
} as ICommand;
```

# Making Events

You can implement your own events through custom files, keeping your events organized.
Simply create a folder named 'Events' and add the 'eventsDir' to the options in the DartCommands initializer in index.js

`Events/message.js`

```js
module.exports.run = (client, instance) => {
  client.on("messageCreate", (message) => {
    // do stuff here
  });
};

module.exports.config = {
  name: "message",
};
```

#### With TypeScript

```ts
import { Client } from "discord.js";
import DartCommands from "dartcommands";

export const run = (client: Client, instance: DartCommands) => {
  client.on("messageCreate", () => {
    // do stuff here
  });
};

export const config = {
  name: "message",
};
```

## Client Command Event

With the latest update to DartCommands, you can now add an event listener from the client inside your events folder. This could be used for commands such as moderation logging.

Example

```js
// Events/commands.js

module.exports.run = (client) => {
  client.on("Dart.LegacyCommand", (Command, message) => {
    console.log(Command.name, message.author.id);
  });
  client.on("Dart.SlashCommand", (Command, interaction) => {
    console.log(Command.name, interaction.member.user.id);
  });
};

module.exports.config = {
  name: "commands",
};
```

#### With Typescript

```ts
// Events/commands.ts
import { Client, Message, CommandInteraction, CacheType } from "discord.js";
import { Events, ICommand } from "dartcommands";

export const run = (client: Client) => {
  client.on<Events>(
    "Dart.LegacyCommand",
    (Command: ICommand, message: Message<boolean>) => {
      console.log(Command.name, message.author.id);
    }
  );
  client.on<Events>(
    "Dart.SlashCommand",
    (Command: ICommand, interaction: CommandInteraction<CacheType>) => {
      console.log(Command.name, interaction.member.user.id);
    }
  );
};

export const config = {
  name: "commands",
};
```
