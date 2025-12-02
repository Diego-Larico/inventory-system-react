import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaPlus, FaTrash } from 'react-icons/fa';

const initialTasks = [
  { id: '1', text: 'Revisar inventario de hilos', completed: false },
  { id: '2', text: 'Llamar a proveedor de telas', completed: false },
  { id: '3', text: 'Preparar pedido #1023', completed: false },
  { id: '4', text: 'Actualizar precios de productos', completed: false },
  { id: '5', text: 'Revisar máquinas de coser', completed: false },
  { id: '6', text: 'Confirmar entrega del día', completed: false },
];

function TodoListWidget() {
  const [tasks, setTasks] = useState(initialTasks);
  const [input, setInput] = useState('');

  function handleAddTask(e) {
    e.preventDefault();
    if (input.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: input, completed: false }]);
      setInput('');
    }
  }

  function handleDeleteTask(id) {
    setTasks(tasks.filter(task => task.id !== id));
  }

  function handleToggleComplete(id) {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }

  function handleDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTasks(reordered);
  }

  return (
    <div className="w-full p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] rounded-lg flex items-center justify-center">
          <FaPlus className="text-white text-sm" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Tareas Pendientes</h3>
        <span className="ml-auto bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold px-2.5 py-1 rounded-full">
          {tasks.filter(t => !t.completed).length}
        </span>
      </div>
      
      <form onSubmit={handleAddTask} className="flex w-full mb-4 gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Agregar nueva tarea..."
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#8f5cff] focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 transition-all text-sm"
        />
        <button 
          type="submit" 
          className="bg-gradient-to-r from-[#8f5cff] to-[#6e7ff3] text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <FaPlus />
        </button>
      </form>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul
              className="w-full flex flex-col gap-2.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <p className="text-sm">No hay tareas pendientes</p>
                  <p className="text-xs mt-1">¡Agrega una nueva tarea!</p>
                </div>
              ) : (
                tasks.map((task, idx) => (
                  <Draggable key={task.id} draggableId={task.id} index={idx}>
                    {(provided, snapshot) => (
                      <li
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer group ${
                          snapshot.isDragging 
                            ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 shadow-lg scale-105' 
                            : task.completed 
                            ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60' 
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md'
                        }`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task.id)}
                          className="w-5 h-5 rounded-lg cursor-pointer accent-[#8f5cff] transition-transform hover:scale-110"
                        />
                        <span
                          className={`flex-1 text-sm font-medium transition-all ${
                            task.completed 
                              ? 'line-through text-gray-400 dark:text-gray-500' 
                              : 'text-gray-700 dark:text-gray-300 group-hover:text-[#8f5cff]'
                          }`}
                          onClick={() => handleToggleComplete(task.id)}
                        >
                          {task.text}
                        </span>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:scale-110 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          title="Eliminar"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </li>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default TodoListWidget;
