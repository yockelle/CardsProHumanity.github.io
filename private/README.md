# Deck.js 

Class to hold all the cards.
Each card is stored as an array of integers from 0 - 700, or however big the deck is.

[0,1,2,3,4,5,.... 700]
A random number generator chooses the index to 'pop' out a card. RNG is chosen from 0 to length of array.

The number pop out is used as an ID to query the database for the 'text' message


# Player.js 

Class to hold all the players. See file for details


# funcutils
utility functions

range(start, end):
creates an array from start to end of integers

