-- Drop the database if it exists
DROP DATABASE IF EXISTS rms_db;

-- Create the database
CREATE DATABASE rms_db;

-- Connect to the newly created database
\c rms_db;

-- Drop tables if they exist
DROP TABLE IF EXISTS AuditTrail;
DROP TABLE IF EXISTS AuditEvents;
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
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastLoginAt TIMESTAMP NULL,
    LastLogoutAt TIMESTAMP NULL
);

-- Create the Application table
CREATE TABLE Application (
    ApplicationID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NOT NULL,
    UpdatedBy INT,
    UserID INT NOT NULL,  -- Added UserID column
    FOREIGN KEY (CreatedBy) REFERENCES "User"(UserID),
    FOREIGN KEY (UserID) REFERENCES "User"(UserID)  -- Foreign key constraint for UserID
);


-- Create the Connection table
CREATE TABLE Connection (
    ConnectionID SERIAL PRIMARY KEY,
    Alias VARCHAR(255),
    Host VARCHAR(255),
    Port INT,
    Database VARCHAR(255),
    Schema VARCHAR(255),  -- Added Schema column
    Type VARCHAR(50),
    Username VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    Password VARCHAR(255),
    ApplicationID INT NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NOT NULL,
    UpdatedBy INT,
    FOREIGN KEY (ApplicationID) REFERENCES Application(ApplicationID),
    FOREIGN KEY (CreatedBy) REFERENCES "User"(UserID)
);


-- Create the StoredProcedure table
CREATE TABLE StoredProcedure (
    StoredProcedureID SERIAL PRIMARY KEY,
    SourceConnectionID INT,
    Name VARCHAR(255) NOT NULL,
    Definition TEXT,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NOT NULL,
    FOREIGN KEY (SourceConnectionID) REFERENCES Connection(ConnectionID),
    FOREIGN KEY (CreatedBy) REFERENCES "User"(UserID)
);

-- Create the Destination table
CREATE TABLE Destination (
    DestinationID SERIAL PRIMARY KEY,
    Alias VARCHAR(255),
    URL VARCHAR(255),
    APIKey VARCHAR(255),
    BucketName VARCHAR(255),
    CloudProvider VARCHAR(255),  -- New column for the cloud provider's name
    isActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    ApplicationID INT NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INT NOT NULL,
    UpdatedBy INT,
    FOREIGN KEY (ApplicationID) REFERENCES Application(ApplicationID),
    FOREIGN KEY (CreatedBy) REFERENCES "User"(UserID)
);

-- Create the Report table
-- Create the Report table with userid column and foreign key constraint
CREATE TABLE public.report (
    reportid serial4 NOT NULL,
    title varchar(255) NOT NULL,
    description text NULL,
    generationdate timestamp NOT NULL,
    parameters json NULL,
    sourceconnectionid int4 NULL,
    destinationid int4 NULL,
    applicationid int4 NULL,
    userid int4 NULL, -- Added userid column
    storedprocedure varchar(255) NULL,
    createdat timestamp NOT NULL,
    updatedat timestamp NULL,
    createdby int4 NOT NULL,
    filekey varchar(255) NULL,
    isdeleted bool DEFAULT true NULL,
    CONSTRAINT report_pkey PRIMARY KEY (reportid),
    CONSTRAINT report_applicationid_fkey FOREIGN KEY (applicationid) REFERENCES public.application(applicationid),
    CONSTRAINT report_destinationid_fkey FOREIGN KEY (destinationid) REFERENCES public.destination(destinationid),
    CONSTRAINT report_sourceconnectionid_fkey FOREIGN KEY (sourceconnectionid) REFERENCES public."connection"(connectionid),
    CONSTRAINT report_createdby_fkey FOREIGN KEY (createdby) REFERENCES public."User"(userid),
    CONSTRAINT report_userid_fkey FOREIGN KEY (userid) REFERENCES public."User"(userid) -- Added foreign key constraint
);

CREATE INDEX idx_report_appid ON public.report USING btree (applicationid);
CREATE INDEX idx_report_destid ON public.report USING btree (destinationid);
CREATE INDEX idx_report_sourceconnid ON public.report USING btree (sourceconnectionid);
CREATE INDEX idx_report_createdby ON public.report USING btree (createdby);

-- Create the ReportStatusHistory table
-- Create the ReportStatusHistory table with userid column and foreign key constraint
CREATE TABLE public.reportstatushistory (
    reportstatushistoryid serial4 NOT NULL,
    reportid int4 NOT NULL,
    status varchar(50) NOT NULL,
    "timestamp" timestamp NOT NULL,
    createdby int4 NULL,
    userid int4 NULL, -- Added userid column
    message varchar(255) NULL,
    createdat timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    updatedat timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    filekey varchar(255) NULL,
    CONSTRAINT reportstatushistory_pkey PRIMARY KEY (reportstatushistoryid),
    CONSTRAINT reportstatushistory_reportid_fkey FOREIGN KEY (reportid) REFERENCES public.report(reportid),
    CONSTRAINT reportstatushistory_createdby_fkey FOREIGN KEY (createdby) REFERENCES public."User"(userid),
    CONSTRAINT reportstatushistory_userid_fkey FOREIGN KEY (userid) REFERENCES public."User"(userid) -- Added foreign key constraint
);

CREATE INDEX idx_reportstatushistory_reportid ON public.reportstatushistory USING btree (reportid);

-- Delete Previous Audit Table
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
    isDeleted BOOLEAN DEFAULT FALSE,
	CONSTRAINT audittrail_pk PRIMARY KEY (ID),
	CONSTRAINT audittrail_event FOREIGN KEY (AuditEventID) REFERENCES AuditEvents(ID),
	CONSTRAINT audittrail_user FOREIGN KEY (UserID) REFERENCES "User"(UserID)
);

-- Application Module Events
INSERT INTO AuditEvents (CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, Event, Description, Module)
VALUES
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Application Created', 'New application was created', 'Application'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Application Updated', 'Application details were updated', 'Application'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Application Deleted', 'Application was deleted', 'Application'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Application Restored', 'Application was restored from deletion', 'Application'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Application Inactivated', 'Application status was changed to inactive', 'Application'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Application Activated', 'Application status was changed to active', 'Application'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Application Name Changed', 'Application name was updated', 'Application'),

-- Destination Module Events
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Destination Added', 'New destination was added', 'Destination'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Destination Updated', 'Destination details were updated', 'Destination'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Destination Deleted', 'Destination was deleted', 'Destination'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Destination Restored', 'Destination was restored from deletion', 'Destination'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Destination Activated', 'Destination status was changed to active', 'Destination'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Destination Inactivated', 'Destination status was changed to inactive', 'Destination'),

-- User Module Events
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'User Created', 'New user account was created', 'User'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'User Updated', 'User details were updated', 'User'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'User Deleted', 'User account was deleted', 'User'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'User Restored', 'User account was restored', 'User'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'User Logged In', 'User logged into the system', 'User'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'User Logged Out', 'User logged out of the system', 'User'),

-- Report Module Events
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Report Created', 'New report was created', 'Report'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Report Updated', 'Report details were updated', 'Report'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Report Deleted', 'Report was deleted', 'Report'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Report Restored', 'Report was restored from deletion', 'Report'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Report Generated', 'Report was generated', 'Report'),
('admin', CURRENT_TIMESTAMP, NULL, NULL, 'Report Failed', 'Report generation failed', 'Report');

