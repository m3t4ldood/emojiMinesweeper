var rowNumber = 9;
var bombsNumber = 10;

var UI = (function() {
    var DOMstrings = {
        enableFlagBtn: '#enable-flag-btn',
        flagIcon: 'flag-icon',
        flagIconBroken: 'flag-icon--broken',
        flagCounter: '#flag-counter',
        restartBtn: '#restart-btn',
        container: '.square-container',
        disabled: 'disabled',
        stopwatch: '#stopwatch',
        squareClass: 'square',
        bomb: 'square--bomb',
        exploded: 'square--exploded',
        open: 'square--open',
        open0: 'square--open0',
        open1: 'square--open1',
        open2: 'square--open2',
        open3: 'square--open3',
        open4: 'square--open4',
        open5: 'square--open5',
        open6: 'square--open6',
        open7: 'square--open7',
        open8: 'square--open8',
        emoji: 'emoji',
        emojiSmile: 'emoji--smile',
        emojiCool: 'emoji--cool',
        emojiO: 'emoji--o',
        emojiDead: 'emoji--dead',
        hidden: 'hidden'
    };

    var emojiClasses = [DOMstrings.emojiSmile, DOMstrings.emojiCool, DOMstrings.emojiO, DOMstrings.emojiDead];
    var stopwatchInterval = null;
    var flagCounter = bombsNumber;
    var squares = null;

    function init() {
        var container = document.querySelector(DOMstrings.container);
        var numberOfSquares = rowNumber * rowNumber;

        for (var i = 0; i < numberOfSquares; i++) {
            var square = document.createElement('div');
            square.classList.add(DOMstrings.squareClass);
            container.appendChild(square);
        }

        squares = Array.from(container.getElementsByClassName(DOMstrings.squareClass));
    }

    function getIndexOfSquare(squareElement) {
        return squares.indexOf(squareElement);
    }

    function openSquares(squareData) {
        if (stopwatchInterval === null) {
            stopwatchInterval = setInterval(updateStopwatch, 1000);
        }

        squareData.forEach(function(square) {
            var squareElement = squares[square.index];
            squareElement.classList.add(DOMstrings.open);

            if (typeof (square.value) === 'number' && square.value > 0) {
                squareElement.classList.add(DOMstrings['open' + square.value]);
                squareElement.textContent = square.value;
            } else if (square.value === 'b') {
                squareElement.classList.add(DOMstrings.exploded, DOMstrings.emoji);
                document.querySelector(DOMstrings.container).classList.add(DOMstrings.disabled);
                showEmojiDead();
                stopStopwatch();
            }
        });
    }

    function showFlagAndBombValidation(bombsAndWrongFlags) {
        bombsAndWrongFlags.forEach(function(square) {
            var squareElement = squares[square.index];

            if (square.value === 'b') {
                squareElement.classList.add(DOMstrings.bomb, DOMstrings.emoji);
            } else if (square.value === 'f') {
                squareElement.classList.add(DOMstrings.flagIconBroken);
            }
        });
    }

    function showWin() {
        stopStopwatch();
        document.querySelector(DOMstrings.container).classList.add(DOMstrings.disabled);
        showEmojiCool();
    }

    function updateStopwatch() {
        var stopwatch = document.querySelector(DOMstrings.stopwatch);
        var time = parseInt(stopwatch.innerText);
        ++time;

        if (time < 1000) {
            stopwatch.innerText = ('00' + time).slice(-3);
        }
    }

    function stopStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }

    function resetStopwatch() {
        stopStopwatch();
        document.querySelector(DOMstrings.stopwatch).innerText = '000';
    }

    function updateFlagCounterUI() {
        if (flagCounter < 0) {
            var flagCounterUI = ('00' + -flagCounter).slice(-3).split('');
            flagCounterUI.splice(0, 1, '-');
            document.querySelector(DOMstrings.flagCounter).innerText = flagCounterUI.join('');
        } else {
            document.querySelector(DOMstrings.flagCounter).innerText = ('00' + flagCounter).slice(-3);
        }
    }

    function resetFlagCounterUI() {
        document.querySelector(DOMstrings.flagCounter).innerText = ('000' + flagCounter).slice(-3);
    }

    function putFlag(squareElement) {
        flagCounter--;
        squareElement.classList.add(DOMstrings.flagIcon);
        updateFlagCounterUI();
    }

    function removeFlag(squareElement) {
        flagCounter++;
        squareElement.classList.remove(DOMstrings.flagIcon);
        updateFlagCounterUI();
    }

    function restart() {
        resetStopwatch();
        disableFlagEnabled();
        flagCounter = bombsNumber;
        resetFlagCounterUI();

        squares.forEach(function(square) {
            square.textContent = '';
            square.className = DOMstrings.squareClass;
        });
        document.querySelector(DOMstrings.container).classList.remove(DOMstrings.disabled)
        showEmojiSmile();
    }

    function hideEmojis() {
        emojiClasses.forEach(function(emojiClass) {
            document.querySelector(DOMstrings.restartBtn).classList.remove(emojiClass);
        });
    }

    function toggleEmojiO() {
        document.querySelector(DOMstrings.restartBtn).classList.toggle(DOMstrings.emojiO);
        document.querySelector(DOMstrings.restartBtn).classList.toggle(DOMstrings.emojiSmile);
    }

    function showEmojiDead() {
        hideEmojis();
        document.querySelector(DOMstrings.restartBtn).classList.add(DOMstrings.emojiDead);
    }

    function showEmojiCool() {
        hideEmojis();
        document.querySelector(DOMstrings.restartBtn).classList.add(DOMstrings.emojiCool);
    }

    function showEmojiSmile() {
        hideEmojis();
        document.querySelector(DOMstrings.restartBtn).classList.add(DOMstrings.emojiSmile);
    }

    function disableFlagEnabled() {
        document.querySelector(DOMstrings.enableFlagBtn).classList.remove(DOMstrings.open);
    }

    return {
        init,
        getIndexOfSquare,
        putFlag,
        removeFlag,
        openSquares,
        getDOMstrings: function() {
            return DOMstrings;
        },
        toggleFlagEnabled: function() {
            document.querySelector(DOMstrings.enableFlagBtn).classList.toggle(DOMstrings.open);
        },
        restart,
        toggleEmojiO,
        showWin,
        showFlagAndBombValidation
    };
})();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Game = (function() {
    var isFlagEnabled = false;
    var squares = [];
    var flags = [];

    function init() {
        squares = [];

        for (var i = 0; i < rowNumber; i++) {
            squares[i] = [];

            for (var j = 0; j < rowNumber; j++) {
                squares[i][j] = {value: 0, isOpen: false};
            }
        }

        for (var i = 0; i < bombsNumber; i++) {
            var randomRow = Math.floor(Math.random() * rowNumber);
            var randomCol = Math.floor(Math.random() * rowNumber);

            if (squares[randomRow][randomCol].value === 'b') {
                i--;
                continue;
            }

            squares[randomRow][randomCol].value = 'b';
            incrementAdjacentSquares(randomRow, randomCol);
        }
        // helps with debugging
        // console.table(squares.map((i) => i.map(j => j.value)));
    }

    function incrementAdjacentSquares(row, col) {
        var adjacentSquares = [
            squares[row - 1] && squares[row - 1][col - 1],
            squares[row - 1] && squares[row - 1][col],
            squares[row - 1] && squares[row - 1][col + 1],
            squares[row] && squares[row][col - 1],
            squares[row] && squares[row][col + 1],
            squares[row + 1] && squares[row + 1][col - 1],
            squares[row + 1] && squares[row + 1][col],
            squares[row + 1] && squares[row + 1][col + 1]
        ];

        adjacentSquares.forEach(function(square) {
            doesSquareHaveNumber(square) ? square.value++ : false;
        });
    }

    function doesSquareHaveNumber(square) {
        return square && typeof square.value === 'number';
    }

    function getSquarePositionByIndex(index) {
        var row = Math.floor(index / rowNumber);
        var col = index % rowNumber;

        if (isNaN(row) || isNaN(col) || row < 0 || col < 0 || row >= rowNumber || col >= rowNumber) {
            return false;
        }

        return {row, col};
    }

    function getSquareIndexByCoords(coords) {
        var i = coords.row * rowNumber + coords.col;

        if (coords.row < 0 || coords.col < 0 || coords.row >= rowNumber || coords.col >= rowNumber) {
            return false;
        }

        return i;
    }

    function toggleFlag(index) {
        var squarePos = getSquarePositionByIndex(index);

        return toggleFlagOnSquare(index, squarePos.row, squarePos.col);
    }

    function toggleFlagOnSquare(index, row, col) {
        var isFlagSet = flags.some(function(el) {return el.index === index;});

        if (isFlagSet) {
            removeFlag(index);
            return false;
        } else {
            putFlag(index, row, col);
            return true;
        }
    }

    function putFlag(index, row, col) {
        flags.push({value: 'f', index, row, col});
    }

    function removeFlag(index) {
        flags = flags.filter(function(el) {return el.index !== index;});
    }

    function openSquaresByIndex(i) {
        var position = getSquarePositionByIndex(i);
        var isFlagSet = flags.some(function(el) {return el.index === i;});

        if (!position || isFlagSet) {
            return [];
        }

        var square = squares[position.row][position.col];

        if (square.isOpen) {
            return [];
        }

        square.isOpen = true;
        var squaresToOpen = [{index: i, value: square.value}];

        if (square.value === 'b') {
            return squaresToOpen;
        }
        if (square.value !== 0) {
            return squaresToOpen;
        }

        var adjacentSquareCoords = [
            {row: position.row - 1, col: position.col - 1},
            {row: position.row - 1, col: position.col},
            {row: position.row - 1, col: position.col + 1},
            {row: position.row, col: position.col - 1},
            {row: position.row, col: position.col + 1},
            {row: position.row + 1, col: position.col - 1},
            {row: position.row + 1, col: position.col},
            {row: position.row + 1, col: position.col + 1}
        ];

        return adjacentSquareCoords.reduce(function (squaresToOpen, coords) {
            var i = getSquareIndexByCoords(coords);
            return typeof i === 'number' ? squaresToOpen.concat(openSquaresByIndex(i)) : squaresToOpen;
        }, squaresToOpen);
    }

    function restart() {
        isFlagEnabled = false;
        flags = [];
        init();
    }

    function areAllSafeSquaresOpened() {
        var numberOfOpened = 0;
        squares.forEach(function(row) {
            numberOfOpened += row.filter(function(square) {
                return square.isOpen;
            }).length;
        });
        
        return (rowNumber * rowNumber - numberOfOpened) === bombsNumber;
    }

    function areAllFlagsCorrect() {
        return flags.every(function(flag) {
            return squares[flag.row][flag.col].value === 'b';
        }) && (flags.length === bombsNumber);
    }

    function getFlagAndBombValidation() {
        var bombs = [];
        var bombIndeces = [];

        squares.forEach(function(row, i) {
            row.forEach(function(square, j) {
                if (square.value === 'b') {
                    var bomb = {value: 'b', index: getSquareIndexByCoords ({row: i, col: j})}
                    var isFlagged = flags.some(function(flag) { return flag.index === bomb.index; });
                    
                    if (!isFlagged) {
                        bombs.push(bomb);
                    }
                    bombIndeces.push(bomb.index);
                }
            });
        });

        var wrongFlags = flags.filter(function(flag) { return bombIndeces.indexOf(flag.index) === -1; });
        return bombs.concat(wrongFlags);
    }

    return {
        init,
        putFlag,
        toggleFlagEnabled: function() {
            isFlagEnabled = !isFlagEnabled;
        },
        isFlagEnabled: function() {
            return isFlagEnabled;
        },
        toggleFlag,
        openSquaresByIndex,
        restart,
        areAllSafeSquaresOpened,
        areAllFlagsCorrect,
        getFlagAndBombValidation
    };
})();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Controller = (function(UIController, GameController) {
    var DOM = UIController.getDOMstrings();
    var firstReveal = true;

    function setupEventListeners() {
        document.querySelector(DOM.enableFlagBtn).addEventListener('click', toggleFlagEnabled);
        setupTapAndHold();
        document.querySelector(DOM.container).addEventListener('contextmenu', toggleFlag);
        document.querySelector(DOM.restartBtn).addEventListener('click', restart);
        document.addEventListener('checkIfWinByOpenedSquares', checkIfWinByOpenedSquares);
        document.addEventListener('checkIfWinByFlag', checkIfWinByFlag);
        document.addEventListener('gameOver', showFlagAndBombValidation);
    }

    function setupTapAndHold() {
        var holdStart;

        document.querySelector(DOM.container).addEventListener('touchstart', function(e) {
            document.querySelector(DOM.container).removeEventListener('contextmenu', toggleFlag);
            document.querySelector(DOM.container).removeEventListener('mousedown', mousedown);
            document.querySelector(DOM.container).removeEventListener('mouseup', mouseup);
            
            holdStart = new Date();
            UIController.toggleEmojiO();
        });
        document.querySelector(DOM.container).addEventListener('touchend', function(e) {
            var diff = new Date() - holdStart;
            UIController.toggleEmojiO();
            diff > 300 ? toggleFlag(e) : handleSquare(e);
        });

        document.querySelector(DOM.container).addEventListener('mousedown', mousedown);
        document.querySelector(DOM.container).addEventListener('mouseup', mouseup);
    }

    function mousedown(e) {
        if (e.button === 0) {
            UIController.toggleEmojiO();
        }
    }
    function mouseup(e) {
        if (e.button === 0) {
            UIController.toggleEmojiO();
            handleSquare(e);
        }
    }

    function init() {
        GameController.init();
        UIController.init();
        setupEventListeners();
    }

    function toggleFlagEnabled(event) {
        GameController.toggleFlagEnabled();
        UIController.toggleFlagEnabled();
    }

    function handleSquare(event) {
        if (
            !event.target.classList.contains(DOM.squareClass)
            || event.target.classList.contains(DOM.open)
        ) {
            return;
        }

        if (GameController.isFlagEnabled()) {
            toggleFlag(event);
            return;
        }
        if (event.target.classList.contains(DOM.flagIcon)) {
            return;
        }

        var index = UIController.getIndexOfSquare(event.target);

        /** [{index: 1, value: 'b'||0||5}] */
        var squareData = GameController.openSquaresByIndex(index);

        if (squareData[0].value === 'b' && firstReveal) {
            GameController.init();
            handleSquare(event);
            return;
        } else if (squareData[0].value === 'b') {
            document.dispatchEvent(new Event('gameOver'));
        }

        firstReveal = false;

        if (squareData) {
            UIController.openSquares(squareData);
        }

        document.dispatchEvent(new Event('checkIfWinByOpenedSquares'));
    };
    
    function restart() {
        firstReveal = true;
        GameController.restart();
        UIController.restart();
    }

    function toggleFlag(event) {
        event.preventDefault();

        if (!event.target.classList.contains(DOM.squareClass) || event.target.classList.contains(DOM.open)) {
            return;
        }
        
        var index = UIController.getIndexOfSquare(event.target);
        var isFlagAdded = GameController.toggleFlag(index);

        if (isFlagAdded) {
            UIController.putFlag(event.target);
        } else {
            UIController.removeFlag(event.target);
        }

        document.dispatchEvent(new Event('checkIfWinByFlag'));
    }

    function checkIfWinByOpenedSquares() {
        if (GameController.areAllSafeSquaresOpened()) {
            UIController.showWin();
        }
    }

    function checkIfWinByFlag() {
        if (GameController.areAllFlagsCorrect() && !firstReveal) {
            UIController.showWin();
        }
    }

    function showFlagAndBombValidation() {
        if (firstReveal) {
            restart();
        } else {
            var squares = GameController.getFlagAndBombValidation();
            UIController.showFlagAndBombValidation(squares);
        }
    }

    return {
        init
    };
})(UI, Game);

document.addEventListener('DOMContentLoaded', function() {
    Controller.init();
});

function toggleHint(e) {
    var hints = document.querySelectorAll('.hint');
    hints[0].classList.toggle('hidden');
    hints[1].classList.toggle('hidden');
    e.stopPropagation();
}
