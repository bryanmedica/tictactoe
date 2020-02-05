import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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

function Square(props) {
	let classname = "square ";
	if (props.value)
		classname += "played ";
	return (
		<button className={classname + props.winner} onClick={props.onClick}>
			{props.value}
		</button>
	)
}

class Board extends React.Component {

	renderSquare(i, winner) {
		const uKey = "square" + i;
		let value = winner !== null ? "empty" : "";
		for (let j = 0; winner !== null && j < lines.length; j++)
			if (lines[winner][j] === i)
				value = "winner";
		return (<Square
					key={uKey}
					value={this.props.squares[i]}
					onClick={() => this.props.onClick(i)}
					winner={value}
				/>);
	}

	render() {
		let res = [];
		let tmp = [];
		let winner = findWinnerLine(this.props.squares);
		for (let i = 0; i < 9; i++) {
			tmp.push(this.renderSquare(i, winner));
			if ((i + 1) % 3 === 0) {
				const rowId = "row" + ((i + 1) / 3);
				res.push(<div className="board-row" key={rowId}>{tmp.slice()}</div>);
				tmp = [];
			}
		}
		return (<div>{res}</div>);
	}
}

class Game extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			history: [{
				squares: Array(9).fill(null),
				moveIndex: null
			}],
			stepNumber: 0,
			xIsNext: true,
			chronological: true
		}
	}

	reverseOrder() {
		this.setState({chronological: !this.state.chronological});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0
		})
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		if (calculateWinner(squares) || squares[i])
			return;
		squares[i] = (this.state.xIsNext ? 'X' : 'O');
		this.setState({
			history: history.concat([{
				squares: squares,
				moveIndex: i
			}]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);

		const moves = history.map((step, move) => {
			if (!move)
				return (<button key={move} className="moves" onClick={() => this.jumpTo(move)}>Revenir au début de la partie.</button>);
			const column = step.moveIndex % 3 + 1;
			const row = Math.trunc(step.moveIndex / 3) + 1;
			const played = ((move % 2) === 1 ? 'X' : 'O');
			const desc = 'Tour n°';
			const desc2 = ': ' + played + '(' + column + ',' + row + ').';
			return (<button key={move} className="moves" onClick={() => this.jumpTo(move)}>{desc}<b>{move}</b>{desc2}</button>)
		});

		if (!this.state.chronological) {
			const beginning = moves.shift();
			moves.reverse();
			moves.unshift(beginning);
		}

		let status;
		if (winner) {
			status = winner === '=' ? 'Match nul.' : winner + ' a gagné.';
		} else {
			status = 'Prochain joueur : ' + (this.state.xIsNext ? 'X' : 'O')
		}
		return (
			<div className="game">
				<div className="game-board">
					<Board squares={current.squares} onClick={(i) => this.handleClick(i)}/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<button onClick={() => this.reverseOrder()}>Changer l'ordre des boutons.</button>
					{moves}
				</div>
			</div>
		);
	}
}

function calculateWinner(squares) {
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
			return squares[a];
	}
	const found = squares.find(element => element === null);
	if (found === undefined)
		return '=';
	return null;
}

function findWinnerLine(squares) {
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
			return i;
	}
	return null;
}

	// ========================================

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);