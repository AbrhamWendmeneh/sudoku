import { useEffect, useState } from 'react';
import './App.css';
import './index.css'

function App() {

 
  const [grid, setGrid]=useState(generateRandomPuzzle());
  const [history, setHistory]= useState([JSON.parse(JSON.stringify(grid))])
  const [historyIndex, setHistoryIndex]= useState(0)
  const [userModifiedCells, setUserModifiedCells] = useState({}); // Track user-modified cells


  useEffect(()=>{
    setHistory([...history, JSON.parse(JSON.stringify(grid))])
    setHistoryIndex(history.length)
  },[grid])

  function handleReStart(){
    setGrid(generateRandomPuzzle())
    setHistory([JSON.parse(JSON.stringify(grid))]);
    setHistoryIndex(0);
  }
  function handleSolve() {
    const solvedPuzzle = JSON.parse(JSON.stringify(grid)); // Create a deep copy
    solve(solvedPuzzle);
    setGrid(solvedPuzzle);
  }

  function handleCheck(grid){

    if(isValidSolution(grid)){
      console.log('correct')
    }
    else{
      console.log('not correct')
    }
  }

  function isValidSolution(grid){
    return isValidColumn(grid) && isValidRow(grid) && isValidSubGrids && hasNoEmptyCells(grid)

  }

  function isValidCell(grid){
    return isValidColumn(grid) && isValidRow(grid) && isValidSubGrids

  }

  function isValidColumn(grid){
    for(let i=0;i<9;i++){
      const colSet= new Set()
      for(let j=0;j<9; j++){
        const cellValue= grid[j][i];
        if(cellValue!=='.' && colSet.has(cellValue)){
          return false
        }

        colSet.add(cellValue)
      }

    }
    return true

  }

  function isValidRow(grid){
    for(let i=0; i<9;i++){
      const rowSet= new Set()

      for(let j=0 ; j<9; j++){
        const cellValue= grid[i][j]
        if(cellValue!=='.' && rowSet.has(cellValue)){
          return false
        }
      }
    }
    return true   
  }

  function isValidSubGrids(grid){
    for (let startRow = 0; startRow < 9; startRow += 3) {
      for (let startCol = 0; startCol < 9; startCol += 3) {
        const subgridSet = new Set();
        for (let i = startRow; i < startRow + 3; i++) {
          for (let j = startCol; j < startCol + 3; j++) {
            const cellValue = grid[i][j];
            if (cellValue !== '.' && subgridSet.has(cellValue)) {
              return false; // Duplicate number found in the same subgrid
            }
            subgridSet.add(cellValue);
          }
        }
      }
    }
    return true; 

  }

  function undo(){
    if (historyIndex>0){
      setHistoryIndex((prevIndex) => prevIndex - 1)
      setGrid(history[historyIndex-1])
      setUserModifiedCells({});
    }
  }

  function hasNoEmptyCells(grid){

    for(let i =0; i<9;i++){
      for (let j=0;j<9;j++){
        if(grid[i][j]==='.'){
          return false
        }
      }
    }
    return true

  }

  function onInputChange(event, cell, row) {
    var val = parseInt(event.target.value) || '.';
    var board = JSON.parse(JSON.stringify(grid));
  
    if (val === '.' || (val >= 1 && val <= 9)) {
      if (grid[row][cell] === '.' || board[row][cell] === '.') {
        // Only update the value if the cell is initially empty
        board[row][cell] = val;
        setGrid(board);
        setUserModifiedCells((prevCells) => {
          const updatedCells = { ...prevCells };
          updatedCells[`${row}-${cell}`] = true;
          return updatedCells;
        });
      }
    }
    
  }
  



  return(
    <div className='App top-bar'>

      <div className='App-header'>
        <h3>sodoku solver</h3>
        <table>
          <tbody>
            {
            grid.map((row, rowIndex)=>{
              return (
                <tr key={rowIndex} >
                  {
                    row.map(
                      (cell, colIndex)=>
                      {
                        return (
                          <td key={colIndex}>
                          <input
                            type='text'
                            className={`cellInput ${!isValidSolution(grid) ? 'incorrect' : ''}`}
                            style={{
                              backgroundColor: cell !== '.' ? 'lightgray' : 'white',
                              borderColor: !isValidCell(grid) ? 'red' : 'black',
                            }}
                            // style={{ backgroundColor: cell !== '.' ? 'lightgray' : 'white' }}
                            value={cell==='.'? '': cell}
                            onChange={(event) => onInputChange(event, colIndex, rowIndex)}
                            // readOnly={cell !== '.' && !userModifiedCells[`${rowIndex}-${colIndex}`]}

                          />
                          </td>
                        )
                      }
                    )
                  }

              </tr>
              )
            })
            }
          </tbody>
        </table>
        
        <div className='button-container'>
          <button onClick={()=>handleSolve()} >solve</button>
          <button onClick={()=> handleReStart()}>restart</button>
          <button onClick={()=> handleCheck(grid)}>check</button>
          <button onClick={()=> undo()}>undo</button>
        </div>
        
        
      </div>
    </div>
  )
  
}

function solve(board){
  for(let i=0; i< 9;i++){
    for(let j=0;j<9;j++){
      if( board[i][j]==='.'){
        for(let val=1; val<10;val++){
          if(possible(board,i,j,val)){
            board[i][j]=val;
            if(solve(board)){
              return true;

            }
            board[i][j]='.';
          }
        }

        return false
      }
    }
  }

  return true
}


function possible(board,y,x,n){
  for(let i=0;i<9;i++){
    if(board[y][i]===n){
      return false
    }

    if(board[i][x]===n){
      return false
    }
  }

  const xi=Math.floor((x/3))*3
  const yi=Math.floor((y/3))*3


  for(let i=0; i<3;i++){
    for(let j=0;j<3;j++){
      if(board[yi+i][xi+j]===n){
        return false
      }
    }
  }
  return true
}

function shuffle(array){
  for(let i= Array.length-1;i>0;i--){
    const j= Math.floor(Math.random()*(i+1));
    [array[i], array[j]]= [array[j], array[i]]
  }
}


function generateRandomPuzzle(){
  const solvedPuzzle= Array.from({length:9},()=> Array.from({length:9},()=> '.'))
  solve(solvedPuzzle);
  const flatPuzzle= solvedPuzzle.flat();
  shuffle(flatPuzzle);

  const board= Array.from({length:9},(_, rowIndex)=> flatPuzzle.slice(rowIndex*9, (rowIndex+1)*9));
  const numberOfEmptyCells=40;
  for(let i=0; i<numberOfEmptyCells;i++){
    const row= Math.floor(Math.random()*9);
    const col= Math.floor(Math.random()*9);
    board[row][col]='.'
    
  }
  return board
}

export default App;

