![SnailTool Logo](https://github.com/JeremyGamer13/SnailTool-Executable/raw/main/images/logo.png)
# SnailTool
A program to quickly edit and convert Will You Snail content.

Will You Snail? is a game created by Jonas Tyroller released on March 9th, 2022 and is currently on PC, Nintendo Switch, Playstation, and Xbox.
It is a rage platformer where the main point is an AI named Squid will attempt to predict where you go and stop you by placing spikes or moving obstacles in your way.

**This program allows you to:**
- Convert Official Level Editor levels to Snailax Mod levels
- Convert both level types to JSON (to edit levels with code easier)
- Save and load backups of your levels and save files (with different names to save and load multiple levels in the official level editor)
- Edit Official Level Editor levels and do things not normally possible in the game's level editor

**Known issues:**
- Save editor menu is empty
- Snailax level editing is not possible yet
- Deleting objects in the editor is inconsistent
- Text boxes randomly stop working after a pop-up sometimes (minimize window and then focus on it again to fix)
- Wire tool does not do anything currently
- Thumbnail generator is not implemented (use the old snailax preview generator for now)

Any suggestions or issues not listed can be added in the Issues tab.
Please let me know if this tool breaks any rules Jonas has for his game, and if the license needs to be changed or added if it wasn't added properly.

# Running or Compiling
Here's instructions on how to prep your computer for running or compiling the program locally.
1. Download the repository
2. Install NodeJS
3. If you are compiling, install Git and restart your machine
4. Open the folder you downloaded the repo into using a command line
5. Run ``npm install``

**To run the program locally:**
1. Run ``npm run quick``

**To compile the program locally:**
1. Run ``npm run make``
2. Check the `out` folder when complete

# Extra program details
All releases are currently only on Windows.
The program is built on Electron though, so you might be able to compile it yourself if you are using Linux or Mac.

Backups require a folder that you set. DO NOT USE ANY FOLDER WITH .bak FILES ALREADY INSIDE. You may end up overwriting those backups.

Also make sure to never select ANY important files as the editing target in the program as they could be overwritten.

All app settings are stored as `settings.stsf` in the same directory as the .exe file. If you want to change your "last saved editor level" path to something else, edit it there for now.