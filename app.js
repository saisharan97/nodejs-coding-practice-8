const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const { open } = sqlite;
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBandServer = async () => {
  try {
    app.listen(3000, () => {
      console.log("Server Running on Port 3000");
    });
    db = await open({ filename: dbPath, driver: sqlite3.Database });
  } catch (error) {
    console.log(`DB Encountered Error :${e.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

const conversionOfDBObjectToResponseObjectForAPI1 = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

//Create table todo
app.get("/", async (request, response) => {
  const createTableQuery = `
                            create table
                                todo
                            (id INTEGER primary key AUTOINCREMENT,
                            todo text,
                            priority text,
                            status text);
                            `;
  await db.run(createTableQuery);
  response.send("Table created Successfully");
});

// API-1 Get All Todos

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;
  let getAllTodosQuery = null;
  if (
    status !== undefined &&
    priority === undefined &&
    search_q === undefined
  ) {
    getAllTodosQuery = `
                            select 
                                * 
                            from 
                                todo
                            where
                                status like '%${status}%'
                            ;`;
  } else if (
    status === undefined &&
    priority !== undefined &&
    search_q === undefined
  ) {
    getAllTodosQuery = `
                            select 
                                * 
                            from 
                                todo
                            where
                                priority like '%${priority}%'
                            ;`;
  } else if (
    status !== undefined &&
    priority !== undefined &&
    search_q === undefined
  ) {
    getAllTodosQuery = `
                            select 
                                * 
                            from 
                                todo
                            where
                                status like '%${status}%' and
                                priority like '%${priority}%'
                            ;`;
  } else if (
    status === undefined &&
    priority === undefined &&
    search_q !== undefined
  ) {
    getAllTodosQuery = `
                            select 
                                * 
                            from 
                                todo
                            where
                                todo like '%${search_q}%' 
                            ;`;
  } else if (
    status === undefined &&
    priority === undefined &&
    search_q === undefined
  ) {
    getAllTodosQuery = `
                            select 
                                * 
                            from 
                                todo
                            ;`;
  }
  const TodosArray = await db.all(getAllTodosQuery);
  const responseTodosArray = TodosArray.map((eachTodo) =>
    conversionOfDBObjectToResponseObjectForAPI1(eachTodo)
  );
  //   console.log(responsePlayersArray);
  response.send(responseTodosArray);
});

// API-2 Get Specific Todo

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
                            select 
                                * 
                            from 
                                todo
                            where
                                id like '%${todoId}%'
                            ;`;

  const todoItem = await db.get(getTodoQuery);
  const responseTodoItem = conversionOfDBObjectToResponseObjectForAPI1(
    todoItem
  );
  response.send(responseTodoItem);
});

// API-3 Create Todo Item

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  //   console.log(request.body);
  const createTodoQuery = `
                            insert into todo
                                (id,todo, priority, status)
                            values 
                                (${id},'${todo}', '${priority}', '${status}')
                            ;`;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

// API-4 Modify Specific Todo

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let actionOnTodosQuery = null;
  //   console.log(request.body);
  if (status !== undefined && priority === undefined && todo === undefined) {
    actionOnTodosQuery = `
                            update todo
                            set status = '${status}' 
                            where
                                id like '%${todoId}%'
                            ;`;
    await db.run(actionOnTodosQuery);
    response.send("Status Updated");
  } else if (
    status === undefined &&
    priority !== undefined &&
    todo === undefined
  ) {
    actionOnTodosQuery = `
                            update todo
                            set priority = '${priority}' 
                            where
                                id like '%${todoId}%'
                            ;`;
    await db.run(actionOnTodosQuery);
    response.send("Priority Updated");
  } else if (
    status === undefined &&
    priority === undefined &&
    todo !== undefined
  ) {
    actionOnTodosQuery = `
                            update todo
                            set todo = '${todo}' 
                            where
                                id like '%${todoId}%'
                            ;`;
    await db.run(actionOnTodosQuery);
    response.send("Todo Updated");
  }
});

// API-5 Delete Specific Todo

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
                            delete 
                            from 
                                todo
                            where
                                id like '%${todoId}%'
                            ;`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
