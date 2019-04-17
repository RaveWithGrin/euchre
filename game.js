var BOARD_SIZE = 7;
var SUIT_VALUES = {
    CLUBS: '♣',
    SPADES: '♠',
    HEARTS: '♥',
    DIAMONDS: '♦'
};
var SUIT_NAMES = ['CLUBS', 'SPADES', 'HEARTS', 'DIAMONDS'];
var CARD_VALUES = ['9', '10', 'J', 'Q', 'K', 'A'];
var PLAYERS = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
var TRUMP_POINTS = {
    '9': 7,
    '10': 8,
    J: 13,
    Q: 9,
    K: 10,
    A: 11
};
var REGULAR_POINTS = {
    '9': 1,
    '10': 2,
    J: 3,
    Q: 4,
    K: 5,
    A: 6
};
var OPPOSITE_SUIT = {
    HEARTS: 'DIAMONDS',
    DIAMONDS: 'HEARTS',
    CLUBS: 'SPADES',
    SPADES: 'CLUBS'
};
var TEAMMATE = {
    NORTH: 'SOUTH',
    SOUTH: 'NORTH',
    EAST: 'WEST',
    WEST: 'EAST'
};

class Card {
    constructor(suit, value) {
        this.suitName = suit;
        this.suitValue = SUIT_VALUES[suit];
        this.value = value;
        this.score = 0;
    }

    print() {
        return this.value + this.suitValue;
    }
}

class Hand {
    constructor(name) {
        this.name = name;
        this.scores = {
            HEARTS: 0,
            DIAMONDS: 0,
            CLUBS: 0,
            SPADES: 0
        };
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    print() {
        var cardString = '';
        this.cards.forEach(function(card) {
            cardString += card.print() + ' ';
        });
        return cardString;
    }

    sort() {
        this.cards.sort(function(a, b) {
            if (a.suitName > b.suitName) {
                return 1;
            } else if (a.suitName < b.suitName) {
                return -1;
            } else if (REGULAR_POINTS[a.value] > REGULAR_POINTS[b.value]) {
                return 1;
            } else if (REGULAR_POINTS[a.value] < REGULAR_POINTS[b.value]) {
                return -1;
            } else {
                return 0;
            }
        });
    }
}

class Deck {
    constructor() {
        this.deck = [];
        this.shuffle();
    }

    shuffle() {
        for (var i = 0; i < CARD_VALUES.length; i++) {
            var value = CARD_VALUES[i];
            for (var j = 0; j < SUIT_NAMES.length; j++) {
                var suit = SUIT_NAMES[j];
                this.deck.push(new Card(suit, value));
            }
        }
        var currentIndex = this.deck.length;
        var temporaryValue;
        var randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this.deck[currentIndex];
            this.deck[currentIndex] = this.deck[randomIndex];
            this.deck[randomIndex] = temporaryValue;
        }
    }

    deal(dealer) {
        var hands = {
            NORTH: new Hand('NORTH'),
            EAST: new Hand('EAST'),
            SOUTH: new Hand('SOUTH'),
            WEST: new Hand('WEST')
        };
        var dealerIndex = PLAYERS.indexOf(dealer);
        var playerIndex = (dealerIndex + 1) % 4;
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 4; j++) {
                hands[PLAYERS[playerIndex]].addCard(this.deck.pop());
                playerIndex = (playerIndex + 1) % 4;
            }
        }
        for (var player in hands) {
            hands[player].sort();
        }
        return hands;
    }

    topCard() {
        return this.deck.pop();
    }
}

var chooseDealer = function(deck) {
    for (var i = 0; i < deck.deck.length; i++) {
        if (deck.deck[i].value === 'J') {
            return PLAYERS[i % 4];
        }
    }
};

var startGame = function() {
    var deck = new Deck();
    var dealer = chooseDealer(deck);
    return dealer;
};

var callTrump = function(hand, topCard, dealer) {
    var score = 0;
    for (var i = 0; i < hand.cards.length; i++) {}
    if (dealer) {
        score += TRUMP_POINTS[topCard.value];
    }
    if (score > 0) {
        return true;
    } else {
        return false;
    }
};

var playRound = function(dealer, team1Score, team2Score) {
    console.log(dealer + ' is dealing');
    var deck = new Deck();
    var hands = deck.deal();
    var topCard = deck.topCard();
    printDeal(hands, topCard);
    var called = false;
    for (var i = 1; i < 4 && !called; i++) {
        var player = PLAYERS[(PLAYERS.indexOf(dealer) + i) % 4];
        called = callTrump(hands[player], topCard, false);
        if (called) {
            console.log(player + ' orders ' + dealer + ' up');
        } else {
            console.log(player + ' passes');
        }
    }
    if (!called) {
        called = callTrump(hands[dealer], topCard, true);
        if (called) {
            console.log(dealer + ' picks up');
        } else {
            console.log(dealer + ' passes');
        }
    }
    if (!called) {
        console.log('Everyone passes, redeal');
        team1Score += 1;
        return [team1Score, team2Score];
    }
    team1Score += 1;
    return [team1Score, team2Score];
};

var printDeal = function(hands, topCard) {
    var board = [];
    for (var i = 0; i < BOARD_SIZE; i++) {
        board.push(new Array(BOARD_SIZE).fill('  '));
    }
    for (var i = 0; i < hands['NORTH'].cards.length; i++) {
        board[0][i + 1] = hands['NORTH'].cards[i].print();
        board[i + 1][0] = hands['WEST'].cards[i].print();
        board[i + 1][BOARD_SIZE - 1] = hands['EAST'].cards[i].print();
        board[BOARD_SIZE - 1][i + 1] = hands['SOUTH'].cards[i].print();
    }
    var middle = (BOARD_SIZE - 1) / 2;
    board[middle][middle] = topCard.print();
    for (var i = 0; i < BOARD_SIZE; i++) {
        board[i] = board[i].join(' ');
    }
    console.log(board.join('\n'));
};

var team1Score = 0;
var team2Score = 0;
var dealer = startGame();
while (team1Score < 10 && team2Score < 10) {
    var scores = playRound(dealer, team1Score, team2Score);
    dealer = PLAYERS[(PLAYERS.indexOf(dealer) + 1) % 4];
    team1Score = scores[0];
    team2Score = scores[1];
    console.log('N/S: ' + team1Score);
    console.log('E/W: ' + team2Score);
}
