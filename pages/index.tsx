import type { NextPage } from 'next'
import { useState } from 'react'

type Player = 'X' | 'O' | '-'

type Tile = {
  x: number
  y: number
  player?: Player
}

type State = {
  board: Tile[][]
  winner?: Player
}

type BoardTileProps = {
  onClick: (t: Tile) => void
  tile: Tile
}

const BoardTile = ({ tile, onClick }: BoardTileProps) => {
  return (
    <div
      className="h-24 w-24 bg-neutral-100 rounded-lg cursor-pointer font-light text-4xl flex justify-center items-center"
      onClick={() => onClick(tile)}
    >
      {tile.player || ''}
    </div>
  )
}

type GameOverProps = {
  winner?: Player
  onPlayAgain: () => void
}

const GameOver = ({ winner, onPlayAgain }: GameOverProps) => (
  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center">
    <div className="text-4xl mb-2">
      {winner === 'X' && <>You Win</>}
      {winner === 'O' && <>You Lose</>}
      {winner === '-' && <>Draw</>}
    </div>
    <div>
      <button
        className="rounded bg-sky-400 px-4 py-2 cursor-pointer hover:bg-sky-500"
        onClick={onPlayAgain}
      >
        Play Again
      </button>
    </div>
  </div>
)

const emptyBoard = [
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ],
  [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 }
  ],
  [
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 }
  ]
]

const Home: NextPage = () => {
  const [game, setGame] = useState<State>({
    board: emptyBoard
  })

  const onPlayerMove = (t: Tile) => {
    if (isOver(game) || hasPlayer(t)) {
      return
    }

    const copy: State = JSON.parse(JSON.stringify(game))
    copy.board[t.y][t.x].player = 'X'

    let winner = isOver(copy)
    if (winner) {
      copy.winner = winner
      setGame(copy)
      return
    }

    ai(copy)

    winner = isOver(copy)
    if (winner) {
      copy.winner = winner
      setGame(copy)
      return
    }

    setGame(copy)
  }

  const restart = () => {
    setGame({
      board: emptyBoard
    })
  }

  return (
    <div className="flex justify-center mt-12">
      <div className="relative">
        {game.board.map((row, key) => (
          <div key={key} className="flex gap-4 mb-4">
            {row.map((tile, key) => (
              <BoardTile key={key} tile={tile} onClick={onPlayerMove} />
            ))}
          </div>
        ))}
        {game.winner && <GameOver winner={game.winner} onPlayAgain={restart} />}
      </div>
    </div>
  )
}

export default Home

function ai(game: State): State {
  while (true) {
    const [x, y] = [r(0, 2), r(0, 2)]
    const tile = game.board[y][x]
    if (hasPlayer(tile)) {
      continue
    }
    tile.player = 'O'
    break
  }
  return game
}

function isOver(game: State): Player | undefined {
  const { board } = game

  const toCheck = [
    {
      check: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ]
    },
    {
      check: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 }
      ]
    },
    {
      check: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 }
      ]
    },
    {
      check: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 }
      ]
    },
    {
      check: [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 }
      ]
    },
    {
      check: [
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 2, y: 2 }
      ]
    },
    {
      check: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 }
      ]
    },
    {
      check: [
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 2 }
      ]
    }
  ]

  for (const checker of toCheck) {
    const tiles = []
    for (const c of checker.check) {
      tiles.push(board[c.y][c.x])
    }
    if (isSame(...tiles)) {
      return tiles[0].player
    }
  }

  for (const row of board) {
    for (const tile of row) {
      if (!hasPlayer(tile)) {
        return undefined
      }
    }
  }

  return '-'
}

function hasPlayer(t: Tile) {
  return !!t.player
}

function isSame(...tiles: Tile[]): boolean {
  if (!hasPlayer(tiles[0])) {
    return false
  }
  const p = tiles[0].player
  for (const t of tiles) {
    if (t.player != p) {
      return false
    }
  }
  return true
}

function r(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
