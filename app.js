const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const priorityArray = ["HIGH", "MEDIUM", "LOW"];
const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
const categoryArray = ["WORK", "HOME", "LEARNING"];
///QueryParametersChecking
var hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

var hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

var hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

var hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

var hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

var hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

///API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", category, priority, status } = request.query;

  switch (true) {
    ///API1 SENARIO 3
    case hasPriorityAndStatusProperties(request.query):
      if (priorityArray.includes(priority) && statusArray.includes(status)) {
        getTodosQuery = `
      SELECT
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
      } else {
        if (priorityArray.includes(priority)) {
          response.status(400);
          response.send("Invalid Todo Status");
        } else {
          if (statusArray.includes(status)) {
            response.status(400);
            response.send("Invalid Todo Priority");
          }
        }
      }
      break;
    ///API 1 SENARIO 5
    case hasCategoryAndStatusProperties(request.query):
      if (categoryArray.includes(category) && statusArray.includes(status)) {
        getTodosQuery = `
      SELECT
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
      } else {
        if (categoryArray.includes(category)) {
          response.status(400);
          response.send("Invalid Todo Status");
        } else {
          if (statusArray.includes(status)) {
            response.status(400);
            response.send("Invalid Todo Category");
          }
        }
      }
      break;
    ///API API 1 SENARIO 7
    case hasCategoryAndPriorityProperties(request.query):
      if (
        priorityArray.includes(priority) &&
        categoryArray.includes(category)
      ) {
        getTodosQuery = `
      SELECT
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
      } else {
        if (priorityArray.includes(priority)) {
          response.status(400);
          response.send("Invalid Todo category");
        } else {
          if (categoryArray.includes(category)) {
            response.status(400);
            response.send("Invalid Todo Priority");
          }
        }
      }
      break;
    ///API1 SENARIO 2
    case hasPriorityProperty(request.query):
      if (priorityArray.includes(priority)) {
        getTodosQuery = `
      SELECT
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    ///API1 SENARIO 1
    case hasStatusProperty(request.query):
      if (statusArray.includes(status)) {
        getTodosQuery = `
      SELECT
         id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    ///API 1 SENARIO 6
    case hasCategoryProperty(request.query):
      if (categoryArray.includes(category)) {
        getTodosQuery = `
      SELECT
         id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    ///API 1 SENARIO 4
    default:
      getTodosQuery = `
      SELECT
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
      data = await database.all(getTodosQuery);
      response.send(data);
  }
});
///API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
       id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});
///API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const dueDate = date;

  let month = parseInt(dueDate.split("-")[1]);
  let day = parseInt(dueDate.split("-")[2]);
  let year = dueDate.split("-")[0];
  if (month < 10) {
    month = 0 + month.toString();
  }
  if (day < 10) {
    day = 0 + day.toString();
  }
  day = parseInt(day);
  month = parseInt(month);
  year = parseInt(year);

  let isDateValid = isValid(new Date(`${year}-${month}-${day}`));

  if (isDateValid) {
    let month = parseInt(date.split("-")[1]);
    let day = parseInt(date.split("-")[2]);
    let year = date.split("-")[0];
    if (month < 10) {
      month = 0 + month.toString();
    }
    if (day < 10) {
      day = 0 + day.toString();
    }

    const getTodoQuery = `
    SELECT
       id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
    FROM
      todo
    WHERE
      strftime('%Y', due_date) = '${year}'
       AND strftime('%m', due_date) = '${month}'
  AND strftime('%d', due_date) = '${day}'
 `;
    const todo = await database.all(getTodoQuery);
    response.send(todo);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
///API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  /// for validating date
  let month = parseInt(dueDate.split("-")[1]);
  let day = parseInt(dueDate.split("-")[2]);
  let year = dueDate.split("-")[0];
  if (month < 10) {
    month = 0 + month.toString();
  }
  if (day < 10) {
    day = 0 + day.toString();
  }
  day = parseInt(day);
  month = parseInt(month);
  year = parseInt(year);

  let isDateValid = isValid(new Date(`${year}-${month}-${day}`));

  if (
    priorityArray.includes(priority) &&
    categoryArray.includes(category) &&
    statusArray.includes(status) &&
    isDateValid
  ) {
    ///Creating dateObj
    let month = parseInt(dueDate.split("-")[1]);
    let day = parseInt(dueDate.split("-")[2]);
    let year = dueDate.split("-")[0];
    if (month < 10) {
      month = 0 + month.toString();
    }
    if (day < 10) {
      day = 0 + day.toString();
    }

    let createDateObj = format(new Date(year, month - 1, day), "yyyy-MM-dd");

    const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status,category,due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}','${category}','${createDateObj}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
  } else {
    ///Invalid status Response
    if (
      priorityArray.includes(priority) === true &&
      isDateValid === true &&
      categoryArray.includes(category) === true &&
      statusArray.includes(status) === false
    ) {
      response.status(400);
      response.send("Invalid Todo Status");
    }
    ///Invalid category Response
    if (
      priorityArray.includes(priority) === true &&
      isDateValid === true &&
      categoryArray.includes(category) === false &&
      statusArray.includes(status) === true
    ) {
      response.status(400);
      response.send("Invalid Todo Category");
    }

    ///Invalid Priority Response
    if (
      priorityArray.includes(priority) === false &&
      isDateValid === true &&
      categoryArray.includes(category) === true &&
      statusArray.includes(status) === true
    ) {
      response.status(400);
      response.send("Invalid Todo Priority");
    }

    ///Invalid dueDate Response
    if (
      priorityArray.includes(priority) === true &&
      isDateValid === false &&
      categoryArray.includes(category) === true &&
      statusArray.includes(status) === true
    ) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});
///API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      if (statusArray.includes(requestBody.status)) {
        updateColumn = "Status";
        const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
        const previousTodo = await database.get(previousTodoQuery);

        const {
          todo = previousTodo.todo,
          priority = previousTodo.priority,
          status = previousTodo.status,
          category = previousTodo.category,
          dueDate = previousTodo.due_date,
        } = request.body;

        const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send(`Status Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    ///priority
    case requestBody.priority !== undefined:
      if (priorityArray.includes(requestBody.priority)) {
        updateColumn = "priority";
        const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
        const previousTodo = await database.get(previousTodoQuery);

        const {
          todo = previousTodo.todo,
          priority = previousTodo.priority,
          status = previousTodo.status,
          category = previousTodo.category,
          dueDate = previousTodo.due_date,
        } = request.body;

        const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send(`Priority Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    ///todo
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
      const previousTodo = await database.get(previousTodoQuery);

      const {
        todo = previousTodo.todo,
        priority = previousTodo.priority,
        status = previousTodo.status,
        category = previousTodo.category,
        dueDate = previousTodo.due_date,
      } = request.body;

      const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;

      await database.run(updateTodoQuery);
      response.send(`Todo Updated`);
      break;

    ///category
    case requestBody.category !== undefined:
      if (categoryArray.includes(requestBody.category)) {
        updateColumn = "Category";
        const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
        const previousTodo = await database.get(previousTodoQuery);

        const {
          todo = previousTodo.todo,
          priority = previousTodo.priority,
          status = previousTodo.status,
          category = previousTodo.category,
          dueDate = previousTodo.due_date,
        } = request.body;

        const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send(`Category Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    ///due date
    case requestBody.dueDate !== undefined:
      console.log(requestBody.dueDate);
      /// for validating date
      const dueDateFor = requestBody.dueDate;
      let month = parseInt(dueDateFor.split("-")[1]);
      let day = parseInt(dueDateFor.split("-")[2]);
      let year = dueDateFor.split("-")[0];
      if (month < 10) {
        month = 0 + month.toString();
      }
      if (day < 10) {
        day = 0 + day.toString();
      }
      day = parseInt(day);
      month = parseInt(month);
      year = parseInt(year);

      let isDateValid = isValid(new Date(`${year}-${month}-${day}`));

      if (isDateValid) {
        /// creating dateObj
        let monthFor = parseInt(dueDateFor.split("-")[1]);
        let dayFor = parseInt(dueDateFor.split("-")[2]);
        let yearFor = dueDateFor.split("-")[0];
        if (monthFor < 10) {
          monthFor = 0 + monthFor.toString();
        }
        if (dayFor < 10) {
          dayFor = 0 + dayFor.toString();
        }

        let createDateObjFor = format(
          new Date(yearFor, monthFor - 1, dayFor),
          "yyyy-MM-dd"
        );
        console.log(createDateObjFor);

        updateColumn = "due_date";
        const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
        const previousTodo = await database.get(previousTodoQuery);

        const {
          todo = previousTodo.todo,
          priority = previousTodo.priority,
          status = previousTodo.status,
          category = previousTodo.category,
          dueDat = previousTodo.due_date,
        } = request.body;

        const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${createDateObjFor}'
    WHERE
      id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send(`Due Date Updated`);
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
  }
});
///API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
