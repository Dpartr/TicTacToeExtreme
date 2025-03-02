# Tic Tac Toe Extreme

A fun twist on the classic Tic Tac Toe game, featuring an expanding board and scoring system.

## Game Rules

### Phase 1: Classic 3x3
- Start with a classic 3x3 Tic Tac Toe game.
- Get three in a row to win.
- If nobody gets three in a row (cat's game), the board expands.

### Phase 2: Expanded 5x5
- The board expands to 5x5.
- The goal changes to get the most "three in a rows".
- A four in a row counts as two "three in a rows".
- A five in a row counts as three "three in a rows".
- The game ends when the board is filled or one player has a sufficient lead.

## Features

- Smart computer opponent that never loses in the 3x3 phase
- Strategic AI for the 5x5 phase
- Responsive design that works on mobile and desktop
- Visual highlighting of successful "three in a rows"
- Score tracking in the 5x5 phase

## Technologies Used

- HTML5
- CSS3
- JavaScript (vanilla, no frameworks)

## How to Play

1. Click on any cell to place your X.
2. The computer will respond with an O.
3. Try to get three in a row in the first phase.
4. If the game ties, the board expands to 5x5.
5. In the 5x5 phase, try to get more "three in a rows" than the computer.

## Deployment

This project is deployed using GitHub Pages:

To Play, visit https://dpartr.github.io/TicTacToeExtreme/

## Acknowledgments

- Inspired by the classic game of Tic Tac Toe
- Created as a fun project to explore game development with vanilla JavaScript