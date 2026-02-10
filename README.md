# PasswordPanic Game

Welcome to [PasswordPanic](https://PasswordPanic.netlify.app)! Get ready to create the most complicated password of your life. You must craft a password that adheres to a series of increasingly absurd rules. Enjoy a variety of mini-games that incorporate puzzles, and riddles to enhance the gameplay experience.

[Play PasswordPanic Now](https://PasswordPanic.netlify.app)

![PasswordPanic_ss](https://github.com/sayantanDs/PasswordPanic/assets/39154403/016dd33a-ca59-4bc7-a4d1-51bfade4d7ea)

The idea for this game comes from [The Password Game](https://neal.fun/password-game/) made by [Neal](https://twitter.com/nealagarwal). Go check out the original if you haven't played it yet.

## Development

### Getting Started

1. Clone this repository to your local machine using `git clone https://github.com/sayantanDs/PasswordPanic.git`.
2. Navigate to the project directory using the command line: `cd PasswordPanic`.
3. Install the required dependencies by running `npm install`.
4. Start the development server with `npm run dev`.
5. Open your web browser and go to `http://localhost:3000` to play the game.

### Multiplayer Mode

The game now supports multiplayer mode! To run multiplayer:

1. **Install Bun** (if not already installed):
   - Visit [bun.sh](https://bun.sh) and follow installation instructions

2. **Start the multiplayer server**:

   ```bash
   cd server
   bun install
   bun run dev
   ```

   The server will run on `http://localhost:3001`

3. **Start the Next.js app** (in a separate terminal):

   ```bash
   npm run dev
   ```

4. **Access multiplayer**:
   - Go to `http://localhost:3000`
   - Click the "Multiplayer" button
   - Create a room or join with a room code
   - Host can see live stats and start the game

### Contributing

Contributions are welcome! If you find a bug or have suggestions for improvements, please open an issue or create a pull request.

## Acknowledgements

- This game is heavily inspired by [The Password Game](https://neal.fun/password-game/) made by [Neal](https://twitter.com/nealagarwal)
- This game was developed using the [Next.js](https://nextjs.org/) framework.
- [Reload icon by mavadee](https://www.freepik.com/icon/reload_3580291#fromView=keyword&term=Refresh&page=1&position=15)
