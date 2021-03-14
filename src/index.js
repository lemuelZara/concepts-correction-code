const express = require("express");
const { v4: uuid, validate } = require("uuid");

const app = express();

app.use(express.json());

const repositories = [];

function checksIdIsValid(request, response, next) {
  const { id } = request.params;

  if (!validate(id)) {
    return response.status(404).json({ error: 'ID is not valid!' })
  }

  request.repoId = id;

  return next();
}

function checksRepositoryExists(request, response, next) {
  const { repoId } = request;

  const indexRepository = repositories.findIndex(repository => repository.id === repoId);
  if (indexRepository < 0) {
    return response.status(404).json({ error: 'Repository not found!' });
  }

  request.repository = repositories[indexRepository];

  return next();
}

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  const repository = { id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", checksIdIsValid, checksRepositoryExists, (request, response) => {
  const { repoId, repository } = request;
  const { title, url, techs } = request.body;

  const { title: oldTitle, url: oldUrl, techs: oldTechs } = repository;

  repository.id = repoId;
  repository.title = title ? title : oldTitle;
  repository.url = url ? url : oldUrl;
  repository.techs = techs ? techs : oldTechs;

  return response.status(200).json(repository);
});

app.delete("/repositories/:id", checksIdIsValid, checksRepositoryExists, (request, response) => {
  const { repository } = request;

  repositories.splice(repositories.indexOf(repository), 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", checksIdIsValid, checksRepositoryExists, (request, response) => {
  const { repository } = request;

  repository.likes++;

  return response.status(200).json(repository);
});

module.exports = app;
