DROP DATABASE spotify;
CREATE DATABASE spotify;
\connect spotify

CREATE TABLE Tickets (
    ticketId SERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    message TEXT NOT NULL
);

INSERT INTO Tickets (subject, message)
VALUES ('Test', 'Test');