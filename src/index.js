import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// Классовый компонент
// class Square extends React.Component {
//     render() {
//         return (
//             <button className="square"
//                 onClick={() => this.props.onClick()}
//             >
//                 {this.props.value}
//             </button>
//         );
//     }
// }

// Функциональный компонент
function Square(props) {
    let className = 'square';

    if ((props.squareHighlight && props.lastI === props.currentI) || props.winCoords.includes(props.currentI)) {
        className += ' highlight';
    }

    return (
        <button className={className}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                lastI={this.props.lastI}
                squareHighlight={this.props.squareHighlight}
                currentI={i}
                winCoords={this.props.winCoords}
            />);
    }


    render() {
        const rows = 3;
        const columns = 3;
        return (
            <div>
                {[...Array(rows).keys()].map(row => (
                    <div className="board-row" key={row}>
                        {[...Array(columns).keys()].map(column => this.renderSquare(row * columns + column))}
                    </div>
                ))}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                lastI: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            squareHighlight: null,
            sort: 'asc',
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        // Block square after win
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                lastI: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            squareHighlight: false,
        })
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            squareHighlight: true,
        });
    }

    sort() {
        let sort = this.state.sort === 'asc' ? 'desc' : 'asc'
        this.setState({
            sort: sort,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares).winner;
        const squareHighlight = this.state.squareHighlight;

        // Moves element
        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to #' + move :
                'To begin game';

            /* Step coords */
            const descCoords = move ? ` x: ${step.lastI % 3} y: ${Math.floor(step.lastI / 3)}` : '';

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        {desc}
                    </button>
                    <span>{descCoords}</span>
                </li>
            )
        })

        // Sorting
        moves.sort((a, b) => {
            if (this.state.sort === 'asc') {
                return a.key - b.key;
            } else {
                return b.key - a.key;
            }
        })

        // Sort button element
        let sortBtn = <button
            onClick={() => this.sort()}
        >
            Sort
        </button>;

        // Status element
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else if(!current.squares.includes(null)) {
            status = `It's draw!`;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' :
                'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        lastI={current.lastI}
                        squareHighlight={squareHighlight}
                        winCoords={calculateWinner(current.squares).winCoords}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                    <div>{sortBtn}</div>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                winCoords: [a, b, c],
            };
        }
    }

    return {
        winner: null,
        winCoords: [null, null, null],
    };
}