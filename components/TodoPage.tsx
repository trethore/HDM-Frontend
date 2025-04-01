/**
 * @todo YOU HAVE TO IMPLEMENT THE DELETE AND SAVE TASK ENDPOINT, A TASK CANNOT BE UPDATED IF THE TASK NAME DID NOT CHANGE, YOU'VE TO CONTROL THE BUTTON STATE ACCORDINGLY
 */
import { Check, Delete } from '@mui/icons-material';
import { Box, Button, Container, IconButton, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch.ts';
import { Task } from '../index';

type EditableTask = Task & { isEditing?: boolean; originalName?: string };

const TodoPage = () => {
  const api = useFetch();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState('');

  const handleFetchTasks = async () => setTasks(await api.get('/tasks'));

  const handleDelete = async (id: number) => {
    // @todo IMPLEMENT HERE : DELETE THE TASK & REFRESH ALL THE TASKS, DON'T FORGET TO ATTACH THE FUNCTION TO THE APPROPRIATE BUTTON
    await api.delete(`/tasks/${id}`);
    await handleFetchTasks();
  }

  const handleSave = async (task: EditableTask) => {
    // @todo IMPLEMENT HERE : SAVE THE TASK & REFRESH ALL THE TASKS, DON'T FORGET TO ATTACH THE FUNCTION TO THE APPROPRIATE BUTTON
    const method = task.id ? 'patch' : 'post';
    const url = task.id ? `/tasks/${task.id}` : '/tasks';
    const body = { name: task.name };

    await api[method](url, body);
    await handleFetchTasks();
  }
  const handleEditChange = (id: number, value: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: value } : t))
    );
  };

  useEffect(() => {
    (async () => {
      handleFetchTasks();
    })();
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h2">HDM Todo List</Typography>
      </Box>

      <Box justifyContent="center" mt={5} flexDirection="column">
        {tasks.map((task) => {
          const hasChanged = task.name !== task.originalName;

          return (
            <Box
              key={task.id}
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={2}
              gap={1}
              width="100%"
            >
              <TextField
                size="small"
                value={task.name}
                fullWidth
                sx={{ maxWidth: 350 }}
                onChange={(e) => handleEditChange(task.id, e.target.value)}
              />
              <Box>
                <IconButton
                  color="success"
                  disabled={!hasChanged}
                  onClick={() => handleSave(task)}
                >
                  <Check />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(task.id)}
                >
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          );
        })}

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={4}
          gap={2}
        >
          <TextField
            size="small"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Nouvelle tâche"
            sx={{ maxWidth: 350, width: '100%' }}
          />
          <Button
            variant="outlined"
            disabled={!newTaskName.trim()}
            onClick={async () => {
              await api.post('/tasks', { name: newTaskName });
              setNewTaskName('');
              await handleFetchTasks();
            }}
          >
            Ajouter une tâche
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default TodoPage;
