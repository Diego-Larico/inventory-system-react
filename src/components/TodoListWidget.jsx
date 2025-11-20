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
    <div
      className="bg-white rounded-2xl shadow-lg p-6 mb-4 flex flex-col items-center mx-auto"
      style={{ width: '100%', maxWidth: 700, minWidth: 500, boxSizing: 'border-box' }}
    >
      <h3 className="text-lg font-semibold mb-4 text-[#8f5cff]">Lista de tareas</h3>
      <form onSubmit={handleAddTask} className="flex w-full mb-4 gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nueva tarea..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f5cff]"
        />
        <button type="submit" className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition flex items-center gap-2">
          <FaPlus />
        </button>
      </form>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul
              className="w-full flex flex-col gap-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tasks.map((task, idx) => (
                <Draggable key={task.id} draggableId={task.id} index={idx}>
                  {(provided) => (
                    <li
                      className={`flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 ${task.completed ? 'opacity-60 line-through' : ''}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <span
                        className={`flex-1 cursor-pointer text-[#8f5cff] font-medium ${task.completed ? 'line-through' : ''}`}
                        onClick={() => handleToggleComplete(task.id)}
                      >
                        {task.text}
                      </span>
                      <button
                        className="ml-2 text-red-400 hover:text-red-600"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default TodoListWidget;
