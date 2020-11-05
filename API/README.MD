# IzzyDeals API Codebase

This repository serves the IzzyDeals project API and data.

## Setup and installation

### Contained technologies

This project is built with NodeJS as the server side technology and MongoDB as the data store.

Also, Kafka is used for key value pair storage.

All of these is bundled in one single docker compose file to ease development and deployment.

### System requirements

This project uses Docker to containerize the development environment. It is highly recommended to go through the setup of Docker for the targeted development platform before cloning this repository.

### Installation

**NB**: _As highlighted, a basic understanding of Docker and Docker Compose commands is required. Regardless, it is easier to walk through this setup once Docker is setup_ :)

Depending on your setup, follow [this guide](https://docs.docker.com/get-docker/) to install [Docker](https://docker.com/) on your machine.

Then, [this guide](https://docs.docker.com/compose/install/) to install [docker-compose](https://docs.docker.com/compose)

### Start

After successful installation, run `./run` from the terminal in the project directory.
