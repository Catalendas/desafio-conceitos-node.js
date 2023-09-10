const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(( user ) => user.username === username)

  if (!user) {
    return response.status(404).json({ error: "Cannot find username"})
  }

  request.user = user

  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExist = users.some((user) => user.username === username)

  if (userExist) {
    return response.status(400).json({ error: "Username alredy exists!"})
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).json({
    id: uuidv4(),
    name,
    username,
    todos: []
  })
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const  { title, deadline } = request.body
  const { user } = request

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline} = request.body
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(( user ) => user.id === id)

  if (!todo) {
    return response.status(404).json({ error: "Todo not exist!"})
  }

  todo.title = title
  todo.deadline = deadline

  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find((user) => user.id === id)

  if (!todo) {
    return response.status(404).json({error: "Todo not exist!"})
  }

  todo.done = true 

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(( user ) => user.id === id)

  if (!todo) {
    return response.status(404).json({ error: "Todo not exist!"})
  }

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;