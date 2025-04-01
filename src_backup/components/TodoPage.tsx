/**
 * @todo YOU HAVE TO IMPLEMENT THE DELETE AND SAVE TASK ENDPOINT, A TASK CANNOT BE UPDATED IF THE TASK NAME DID NOT CHANGE, YOU'VE TO CONTROL THE BUTTON STATE ACCORDINGLY
 */
import { Check, Delete } from '@mui/icons-material';
import { Box, Button, Container, IconButton, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch.ts';
import { Task } from '../index';
import { MenuItem, Select } from '@mui/material';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';

type EditableTask = Task & {
  isEditing?: boolean;
  originalName?: string;
  originalPriority?: string;
};


const TodoPage = () => {
  const api = useFetch();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [sortDescending, setSortDescending] = useState(true);

  const handleFetchTasks = async () => {
    const fetched: Task[] = await api.get('/tasks');
    const priorityOrder: Record<Task['priority'], number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

    const sorted = [...fetched].sort((a, b) =>
      sortDescending
        ? priorityOrder[b.priority] - priorityOrder[a.priority]
        : priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    setTasks(
      sorted.map((task: Task) => ({
        ...task,
        originalName: task.name,
        originalPriority: task.priority,
      }))
    );
  };




  const handleDelete = async (id: number) => {
    // @todo IMPLEMENT HERE : DELETE THE TASK & REFRESH ALL THE TASKS, DON'T FORGET TO ATTACH THE FUNCTION TO THE APPROPRIATE BUTTON
    await api.delete(`/tasks/${id}`);
    await handleFetchTasks();
  }

  const handleSave = async (task: EditableTask) => {
    // @todo IMPLEMENT HERE : SAVE THE TASK & REFRESH ALL THE TASKS, DON'T FORGET TO ATTACH THE FUNCTION TO THE APPROPRIATE BUTTON
    const method = task.id ? 'patch' : 'post';
    const url = task.id ? `/tasks/${task.id}` : '/tasks';
    const body = { name: task.name, priority: task.priority };


    await api[method](url, body);
    await handleFetchTasks();
  }
  const handleEditChange = (id: number, value: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: value } : t))
    );
  };

  const handlePriorityChange = (id: number, value: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority: value as Task['priority'] } : t))
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
      <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={sortDescending ? 'desc' : 'asc'}
            onChange={(e) => {
              const value = e.target.value;
              setSortDescending(value === 'desc');
              const priorityOrder: Record<Task['priority'], number> = {
                HIGH: 3,
                MEDIUM: 2,
                LOW: 1,
              };
              const sorted = [...tasks].sort((a, b) =>
                value === 'desc'
                  ? priorityOrder[b.priority] - priorityOrder[a.priority]
                  : priorityOrder[a.priority] - priorityOrder[b.priority]
              );
              setTasks(sorted);
            }}
          >
            <FormControlLabel value="desc" control={<Radio />} label="HIGH FIRST" />
            <FormControlLabel value="asc" control={<Radio />} label="LOW FIRST" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box justifyContent="center" mt={5} flexDirection="column">
        {tasks.map((task) => {
          const hasChanged =
            task.name !== task.originalName ||
            task.priority !== task.originalPriority;

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
                sx={{
                  maxWidth: 350,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor:
                        task.priority === 'LOW'
                          ? 'green'
                          : task.priority === 'MEDIUM'
                            ? 'orange'
                            : 'red',
                            borderWidth: 3,
                    },
                  },
                }}
                onChange={(e) => handleEditChange(task.id, e.target.value)}
              />

              <Select
                size="small"
                value={task.priority}
                onChange={(e) => handlePriorityChange(task.id, e.target.value)}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
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

          <Select
            size="small"
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </Select>
          <Button
            variant="outlined"
            disabled={!newTaskName.trim()}
            onClick={async () => {
              await api.post('/tasks', {
                name: newTaskName,
                priority: newTaskPriority,
              });
              setNewTaskName('');
              setNewTaskPriority('MEDIUM');
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
