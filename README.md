# SnailTool
A program to quickly edit and convert Will You Snail content.

Will You Snail? is a game created by Jonas Tyroller released on March 9th, 2022 and is currently on PC, Nintendo Switch, Playstation, and Xbox.
It is a rage platformer where the main point is an AI named Squid will attempt to predict where you go and stop you by placing spikes or moving obstacles in your way.

This program allows you to:
- Convert Official Level Editor levels to Snailax Mod levels
- Convert both level types to JSON (to edit levels with code easier)
- Save and load backups of your levels and save files (with different names to save and load multiple levels in the official level editor)
- Edit Official Level Editor levels and do things not normally possible in the game's level editor

Known issues:
- Save editor menu is empty
- Snailax level editing is not possible yet
- Deleting objects in the editor is inconsistent
- Text boxes randomly stop working after a pop-up sometimes (minimize window and then focus on it again to fix)

Any suggestions or issues not listed can be added in the Issues tab.
Please let me know if this tool breaks any rules Jonas has for his game, and if the license needs to be changed or added if it wasn't added properly.

# Running or Compiling
Here's instructions on how to prep your computer for running or compiling the program locally.
1. Download the repository
2. Install NodeJS
3. If you are compiling, install Git and restart your machine
4. Open the folder you downloaded the repo into using a command line
5. Run ``npm install``

To run the program locally:
1. Run ``npm start``

To compile the program locally:
1. Run ``npm run make``
2. Check the folder it mentions when compiling is complete
