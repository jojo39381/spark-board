import React, {useState, useEffect} from 'react';
import {v4 as uuid} from 'uuid';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import Column from './components/Column.jsx';
import Header from './components/Header.jsx';
import axios from 'axios';


/* random image */
const imageUrl = 'https://source.unsplash.com/random/?people/';
var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

function getRandomHardDate() {
     
    return months[Math.floor(Math.random() * 12)] + ' ' + Math.floor(Math.random() * 30 + 2)
    
}

const backlog = [
    {id: uuid(), content: 'Final QA', assigned:imageUrl + uuid(), date: getRandomHardDate(), color: getRandomColor()},
    {id: uuid(), content: 'Forms submit data properly', assigned:imageUrl + uuid(), date: getRandomHardDate(), color: getRandomColor()},
    {id: uuid(), content: 'Links across pages', assigned:imageUrl + uuid(), date: getRandomHardDate(), color: getRandomColor()}
]
const todo = [
    {id: uuid(), content: 'Do Homework', assigned:imageUrl + uuid(), date: getRandomHardDate(), color: getRandomColor()},
    {id: uuid(), content: "Finish Important Project for boss", assigned:imageUrl + uuid(), date: getRandomHardDate(), color: getRandomColor()}
]

function getRandomColor() {
   
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}
/* imageurl needs uuid/number at the end to be random so browser don't cache the image */
const columnsFromServer = 
    {   [uuid()] : {
            name: 'Backlog',
            items: backlog
        },
        [uuid()]: {
            name: 'Ready To Do',
            items: todo
        },
        [uuid()]: {
            name: 'In Progress',
            items: []
        },
        [uuid()]: {
            name: 'Done',
            items:[]
        }
    };

/* columns from the server, currently hard coded. */


/* function for when the drag ends, accounts for when dragging to other columns or to nowhere */
const dragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const {source, destination } = result;
    if(source.droppableId !== destination.droppableId) {
        const sourceColumn = columns[source.droppableId];
        const destColumn = columns[destination.droppableId];
        const sourceItems = [...sourceColumn.items];
        const destItems = [...destColumn.items];
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removed);
        setColumns({
            ...columns,
            [source.droppableId]:  {
                ...sourceColumn, 
                items: sourceItems
            },
            [destination.droppableId]: {
                ...destColumn, 
                items: destItems
            }
        })
    }
    else {
    const column = columns[source.droppableId];
    const copy = [...column.items];
    const [removed] = copy.splice(source.index, 1);
    copy.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copy
      }
    });
    }
};



function App() {

    

    
    const [columns, setColumns] = useState(columnsFromServer);
    useEffect(() => {
        const col = {

        }
        axios.get("/exercises")
        .then(response => {
            console.log(response.data.length)
            if (response.data.length > 0) {
                 response.data.forEach((task) => {
                    col[task.id] = {
                        name : task.category,
                        items: task.tasks
                    }
                    
                     
    
                }
                )
            }

            setColumns(col)
        })

        
      },[]);
        
    
      
    
    
    /* add to column the new task or update it */
    function addToColumn(destination, id, task) {
    
        const column = columns[destination]
        var updated = [...column.items]
        const object = {id: uuid(), content: task.title, assigned:imageUrl + uuid(), date: task.date, color: getRandomColor()}
        if (id != null) {
            var index = updated.findIndex( x => x.id === id)   
            updated[index] = object
        }
        else {
           
        updated.push(object)

            
        const serverColumn = {

            tasks:updated
        }
        axios.post('/exercises/update/' + destination, serverColumn)
        .then(res => console.log(res.data)) 
        }
        
        

        setColumns({
            ...columns,
            [destination]: {
              ...column,
              items: updated
            }
          });

        
    }
    function deleteFromColumn(destination, id) {
        const column = columns[destination]
        var updated = [...column.items]
        var index = updated.findIndex( x => x.id === id) 
        updated.splice(index, 1)
        setColumns({
            ...columns,
            [destination]: {
              ...column,
              items: updated
            }
          });
    }

    function addColumn(){
        
        const data = {
            id: uuid(),
            category: "todo",
            tasks:[]
        }
        
        axios.post("/exercises/add", data)
        .then(res => console.log(res.data))
    
    }
    
    return (
        
        <div>
        <Header></Header>
        
        <div style={{ display: 'flex', justifyContent: 'center', height: '100%'}}>
            <DragDropContext onDragEnd={result => dragEnd(result, columns, setColumns)}>
                {Object.entries(columns).map(([id, column]) => {
                    
                    return (
                        
                        <div style={{display:'flex', flexDirection: 'column', alignItems: 'center'}} key={uuid()}>
                        <h2>{column.name}</h2>
                        <div style ={{margin: 8}}>
                        <Droppable droppableId={id} key={id}>
                            {(provided, snapshot) => {
                                return (
                                    <Column key={id} provided={provided} snapshot={snapshot} column={column} addToColumn={addToColumn} id={id} editTask={addToColumn} deleteTask={deleteFromColumn}/>
                                )
                            }}
                        </Droppable>
                    </div>
                    </div>
                    )
                })}
            </DragDropContext>
        </div>
        <button onClick={addColumn}>Add</button>
        </div>
    )
}

export default App