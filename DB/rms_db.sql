-- Drop the database if it exists
DROP DATABASE IF EXISTS rms_db;

-- Create the database
CREATE DATABASE rms_db;

-- Connect to the newly created database
\c rms_db;

-- Drop tables if they exist
DROP TABLE IF EXISTS AuditTrail;
DROP TABLE IF EXISTS ReportStatusHistory;
DROP TABLE IF EXISTS Report;
DROP TABLE IF EXISTS StoredProcedure;
DROP TABLE IF EXISTS Destination;
DROP TABLE IF EXISTS Connection;
DROP TABLE IF EXISTS Application;
DROP TABLE IF EXISTS "User";

-- Create the User table with updated columns
CREATE TABLE "User" (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Name VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Application table
CREATE TABLE Application (
    ApplicationID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    UserID INT NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (UserID) REFERENCES "User"(UserID)
);

-- Create the Connection table
CREATE TABLE Connection (
    ConnectionID SERIAL PRIMARY KEY,
    Alias VARCHAR(255),
    Host VARCHAR(255),
    Port INT,
    Database VARCHAR(255),
    Type VARCHAR(50),
    Username VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    Password VARCHAR(255),
    ApplicationID INT NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (ApplicationID) REFERENCES Application(ApplicationID)
);

-- Create the StoredProcedure table
CREATE TABLE StoredProcedure (
    StoredProcedureID SERIAL PRIMARY KEY,
    SourceConnectionID INT,
    Name VARCHAR(255) NOT NULL,
    Definition TEXT,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT,
    FOREIGN KEY (SourceConnectionID) REFERENCES Connection(ConnectionID)
);

-- Create the Destination table
CREATE TABLE Destination (
    DestinationID SERIAL PRIMARY KEY,
    Alias VARCHAR(255),
    URL VARCHAR(255),
    APIKey VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    ApplicationID INT NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (ApplicationID) REFERENCES Application(ApplicationID)
);

-- Create the Report table
CREATE TABLE Report (
    ReportID SERIAL PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    GenerationDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Parameters JSON,
    SourceConnectionID INT,
    DestinationID INT,
    ApplicationID INT,
    StoredProcedureID INT,
    UserID INT,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT,
    FOREIGN KEY (SourceConnectionID) REFERENCES Connection(ConnectionID),
    FOREIGN KEY (DestinationID) REFERENCES Destination(DestinationID),
    FOREIGN KEY (ApplicationID) REFERENCES Application(ApplicationID),
    FOREIGN KEY (StoredProcedureID) REFERENCES StoredProcedure(StoredProcedureID),
    FOREIGN KEY (UserID) REFERENCES "User"(UserID)
);

-- Create the ReportStatusHistory table
CREATE TABLE ReportStatusHistory (
    ReportStatusHistoryID SERIAL PRIMARY KEY,
    ReportID INT NOT NULL,
    Status VARCHAR(50) NOT NULL,
    Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ReportID) REFERENCES Report(ReportID)
);

-- Create the AuditTrail table
CREATE TABLE AuditTrail (
    AuditTrailID SERIAL PRIMARY KEY,
    Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Action VARCHAR(255) NOT NULL,
    Details TEXT
);

ALTER TABLE "report"
ADD COLUMN filekey VARCHAR(255);

ALTER TABLE report RENAME COLUMN storedprocedureid TO storedprocedure;

--Delete Previous Audit Table
DROP TABLE IF EXISTS AuditTrail;
DROP TABLE IF EXISTS AuditEvents;


CREATE TABLE AuditEvents (
	ID int8 GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	CreatedBy varchar(255) NULL,
	CreatedDate timestamptz(6) NULL,
	ModifiedBy varchar(255) NULL,
	ModifiedDate timestamptz(6) NULL,
	Event varchar(255) NOT NULL,
	Description text NULL,
	Module varchar(255) NOT NULL,
	CONSTRAINT auditevents_pk PRIMARY KEY (ID)
);


CREATE TABLE AuditTrail (
	ID int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	IsActive boolean NULL,
	CreatedBy varchar(255) NULL,
	ModifiedDate timestamptz(6) NULL,
	Description text NULL,
	CreatedDate timestamptz(6) NULL,
	UserID int8 NULL,
	AuditEventID int8 NULL,
	CONSTRAINT audittrail_pk PRIMARY KEY (ID),
	CONSTRAINT audittrail_event FOREIGN KEY (AuditEventID) REFERENCES AuditEvents(ID),
	CONSTRAINT audittrail_user FOREIGN KEY (UserID) REFERENCES "User"(UserID)
);


INSERT INTO AuditEvents (CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, Event, Description, Module)
VALUES 
('system', CURRENT_TIMESTAMP, NULL, NULL, 'User Login', 'User logged into the system', 'Authentication'),
('system', CURRENT_TIMESTAMP, NULL, NULL, 'User Logout', 'User logged out of the system', 'Authentication'),
('system', CURRENT_TIMESTAMP, NULL, NULL, 'Data Creation', 'New data entry created', 'Data Management'),
('system', CURRENT_TIMESTAMP, NULL, NULL, 'Data Update', 'Existing data entry updated', 'Data Management'),
('system', CURRENT_TIMESTAMP, NULL, NULL, 'Data Deletion', 'Data entry deleted', 'Data Management'),
('system', CURRENT_TIMESTAMP, NULL, NULL, 'Password Change', 'User changed their password', 'User Management'),
('system', CURRENT_TIMESTAMP, NULL, NULL, 'Role Assignment', 'Assigned role to a user', 'User Management'),
('system', CURRENT_TIMESTAMP, NULL, NULL, 'Permission Change', 'Changed user permissions', 'User Management'),
('system', CURRENT_TIMESTAMP, NULL, NULL, 'Profile Update', 'User updated their profile', 'User Management'),
('system', CURRENT_TIMESTAMP, NULL, NULL, 'Account Lockout', 'User account was locked due to multiple failed login attempts', 'Security');

INSERT INTO AuditTrail (IsActive, CreatedBy, ModifiedDate, Description, CreatedDate, UserID, AuditEventID)
VALUES 
(TRUE, 'admin', CURRENT_TIMESTAMP, 'User logged in', CURRENT_TIMESTAMP, 1, 1),
(TRUE, 'admin', CURRENT_TIMESTAMP, 'User logged out', CURRENT_TIMESTAMP, 1, 2),
(TRUE, 'admin', CURRENT_TIMESTAMP, 'Created new data entry', CURRENT_TIMESTAMP, 2, 3),
(TRUE, 'editor', CURRENT_TIMESTAMP, 'Updated existing data entry', CURRENT_TIMESTAMP, 2, 4),
(TRUE, 'admin', CURRENT_TIMESTAMP, 'Deleted a data entry', CURRENT_TIMESTAMP, 3, 5),
(FALSE, 'user', CURRENT_TIMESTAMP, 'Changed password', CURRENT_TIMESTAMP, 10, 6),
(TRUE, 'admin', CURRENT_TIMESTAMP, 'Assigned role to user', CURRENT_TIMESTAMP, 11, 7),
(TRUE, 'admin', CURRENT_TIMESTAMP, 'Changed user permissions', CURRENT_TIMESTAMP, 11, 8),
(FALSE, 'user', CURRENT_TIMESTAMP, 'Updated profile information', CURRENT_TIMESTAMP, 10, 9),
(FALSE, 'system', CURRENT_TIMESTAMP, 'User account locked after failed login attempts', CURRENT_TIMESTAMP, 10, 10);




-- Create indexes if necessary
CREATE INDEX idx_user_email ON "User" (Email);
CREATE INDEX idx_application_userid ON Application (UserID);
CREATE INDEX idx_connection_appid ON Connection (ApplicationID);
CREATE INDEX idx_destination_appid ON Destination (ApplicationID);
CREATE INDEX idx_report_appid ON Report (ApplicationID);
CREATE INDEX idx_report_sourceconnid ON Report (SourceConnectionID);
CREATE INDEX idx_report_destid ON Report (DestinationID);
CREATE INDEX idx_report_userid ON Report (UserID);
CREATE INDEX idx_reportstatushistory_reportid ON ReportStatusHistory (ReportID);
CREATE INDEX idx_storedprocedure_sourceconnid ON StoredProcedure (SourceConnectionID);

-- Insert data into User table
INSERT INTO "User" (Email, Password, Name, CreatedAt, UpdatedAt)
VALUES 
('user1@example.com', 'password1', 'User One', NOW(), NOW()),
('user2@example.com', 'password2', 'User Two', NOW(), NOW()),
('user3@example.com', 'password3', 'User Three', NOW(), NOW());

-- Insert data into Application table
INSERT INTO Application (Name, Description, isActive, IsDeleted, UserID, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
VALUES 
('App1', 'Description for App1', TRUE, FALSE, 1, NOW(), NOW(), 1, 1),
('App2', 'Description for App2', TRUE, FALSE, 2, NOW(), NOW(), 2, 2),
('App3', 'Description for App3', FALSE, FALSE, 3, NOW(), NOW(), 3, 3),
('App4', 'Description for App4', FALSE, FALSE, 3, NOW(), NOW(), 1, 1),
('App5', 'Description for App5', FALSE, FALSE, 3, NOW(), NOW(), 2, 2),
('App6', 'Description for App6', FALSE, FALSE, 3, NOW(), NOW(), 3, 3),
('App7', 'Description for App7', FALSE, FALSE, 3, NOW(), NOW(), 3, 3);

-- Insert data into Connection table
INSERT INTO Connection (Alias, Host, Port, Database, Type, Username, isActive, IsDeleted, Password, ApplicationID, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
VALUES 
('Conn1', 'localhost', 5432, 'db1', 'PostgreSQL', 'user1', TRUE, FALSE, 'password1', 1, NOW(), NOW(), 1, 1),
('Conn2', 'localhost', 5432, 'db2', 'MySQL', 'user2', TRUE, FALSE, 'password2', 2, NOW(), NOW(), 2, 2),
('Conn3', 'localhost', 5432, 'db3', 'Oracle', 'user3', FALSE, TRUE, 'password3', 3, NOW(), NOW(), 3, 3);

-- Insert data into StoredProcedure table
INSERT INTO StoredProcedure (SourceConnectionID, Name, Definition, CreatedAt, UpdatedAt, CreatedBy)
VALUES 
(1, 'sp1', 'CREATE PROCEDURE sp1 AS BEGIN SELECT * FROM table1; END;', NOW(), NOW(), 1),
(2, 'sp2', 'CREATE PROCEDURE sp2 AS BEGIN SELECT * FROM table2; END;', NOW(), NOW(), 2),
(3, 'sp3', 'CREATE PROCEDURE sp3 AS BEGIN SELECT * FROM table3; END;', NOW(), NOW(), 3);

-- Insert data into Destination table
INSERT INTO Destination (Alias, URL, APIKey, isActive, IsDeleted, ApplicationID, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
VALUES 
('Dest1', 'http://example.com/api1', 'apikey1', TRUE, FALSE, 1, NOW(), NOW(), 1, 1),
('Dest2', 'http://example.com/api2', 'apikey2', TRUE, FALSE, 2, NOW(), NOW(), 2, 2),
('Dest3', 'http://example.com/api3', 'apikey3', FALSE, TRUE, 3, NOW(), NOW(), 3, 3);

-- Insert data into Report table
INSERT INTO Report (Title, Description, GenerationDate, Parameters, SourceConnectionID, DestinationID, ApplicationID, StoredProcedureID, UserID, CreatedAt, UpdatedAt, CreatedBy)
VALUES 
('Report1', 'Description for Report1', NOW(), '{"param1": "value1"}', 1, 1, 1, 1, 1, NOW(), NOW(), 1),
('Report2', 'Description for Report2', NOW(), '{"param2": "value2"}', 2, 2, 2, 2, 2, NOW(), NOW(), 2),
('Report3', 'Description for Report3', NOW(), '{"param3": "value3"}', 3, 3, 3, 3, 3, NOW(), NOW(), 3);

-- Insert data into ReportStatusHistory table
INSERT INTO ReportStatusHistory (ReportID, Status, Timestamp)
VALUES 
(1, 'Generated', NOW()),
(2, 'Pending', NOW()),
(3, 'Failed', NOW());

-- Insert data into AuditTrail table
INSERT INTO AuditTrail (Timestamp, Action, Details)
VALUES 
(NOW(), 'Create', 'Created new user'),
(NOW(), 'Update', 'Updated application details'),
(NOW(), 'Delete', 'Deleted a connection');

-- Example query to view data

SELECT * FROM "User";
