-- Insert events related to the Connection module into the AuditEvents table
INSERT INTO AuditEvents (CreatedBy, CreatedDate, Event, Description, Module)
VALUES
    ('admin', CURRENT_TIMESTAMP, 'Connection Added', 'A new connection was added.', 'Connection'),
    ('admin', CURRENT_TIMESTAMP, 'Connection Updated', 'A connection was updated.', 'Connection'),
    ('admin', CURRENT_TIMESTAMP, 'Connection Deleted', 'A connection was deleted.', 'Connection'),
    ('admin', CURRENT_TIMESTAMP, 'Connection Restored', 'A deleted connection was restored.', 'Connection'),
    ('admin', CURRENT_TIMESTAMP, 'Connection Activated', 'A connection was activated.', 'Connection'),
    ('admin', CURRENT_TIMESTAMP, 'Connection Inactivated', 'A connection was inactivated.', 'Connection');



-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS connection_insert_trigger ON Connection;
DROP TRIGGER IF EXISTS connection_update_trigger ON Connection;
DROP FUNCTION IF EXISTS log_connection_insert();
DROP FUNCTION IF EXISTS log_connection_update();

-- Function for logging Insert operations (Connection Added)
CREATE OR REPLACE FUNCTION log_connection_insert()
RETURNS TRIGGER AS $$
DECLARE
    event_id INT;
BEGIN
    -- Retrieve the AuditEventID for "Connection Added"
    SELECT id INTO event_id FROM auditevents WHERE event = 'Connection Added' AND module = 'Connection';

    INSERT INTO AuditTrail (
        IsActive,
        CreatedBy,
        ModifiedDate,
        Description,
        CreatedDate,
        UserID,
        AuditEventID
    )
    VALUES (
        TRUE, -- IsActive
        (SELECT Name FROM "User" WHERE UserID = NEW.CreatedBy), -- CreatedBy (Name)
        CURRENT_TIMESTAMP, -- ModifiedDate
        CONCAT('Connection Added for ', NEW.Database, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.CreatedBy), ' at ', NEW.CreatedAt), -- Description
        NEW.CreatedAt, -- CreatedDate
        NEW.CreatedBy, -- UserID
        event_id -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Update operations (Connection Updated, Deleted, Restored, Activated, Inactivated)
CREATE OR REPLACE FUNCTION log_connection_update()
RETURNS TRIGGER AS $$
DECLARE
    event_id INT;
    event_description TEXT;
BEGIN
    -- Determine the event type and description
    CASE
        WHEN OLD.IsDeleted = FALSE AND NEW.IsDeleted = TRUE THEN
            event_description := CONCAT('Connection Deleted for ', NEW.Database, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Connection Deleted' AND module = 'Connection';

        WHEN OLD.IsDeleted = TRUE AND NEW.IsDeleted = FALSE THEN
            event_description := CONCAT('Connection Restored for ', NEW.Database, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Connection Restored' AND module = 'Connection';

        WHEN OLD.isActive = TRUE AND NEW.isActive = FALSE THEN
            event_description := CONCAT('Connection Inactivated for ', NEW.Database, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Connection Inactivated' AND module = 'Connection';

        WHEN OLD.isActive = FALSE AND NEW.isActive = TRUE THEN
            event_description := CONCAT('Connection Activated for ', NEW.Database, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Connection Activated' AND module = 'Connection';

        ELSE
            event_description := CONCAT('Connection Updated for ', NEW.Database, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Connection Updated' AND module = 'Connection';
    END CASE;

    -- Insert the log into the AuditTrail table
    INSERT INTO AuditTrail (
        IsActive,
        CreatedBy,
        ModifiedDate,
        Description,
        CreatedDate,
        UserID,
        AuditEventID
    )
    VALUES (
        TRUE, -- IsActive
        (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), -- CreatedBy (Name, based on UpdatedBy field)
        CURRENT_TIMESTAMP, -- ModifiedDate
        event_description, -- Description
        NEW.UpdatedAt, -- CreatedDate
        NEW.UpdatedBy, -- UserID
        event_id -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for connection insertion
CREATE TRIGGER connection_insert_trigger
AFTER INSERT ON Connection
FOR EACH ROW
EXECUTE FUNCTION log_connection_insert();

-- Trigger for connection update, including delete, restore, activate, and inactivate
CREATE TRIGGER connection_update_trigger
AFTER UPDATE ON Connection
FOR EACH ROW
EXECUTE FUNCTION log_connection_update();


-- Test Insert Operation (Connection Added)
INSERT INTO Connection (
    Alias,
    Host,
    Port,
    Database,
    Type,
    Username,
    ApplicationID,
    CreatedBy
) VALUES (
    'TestConnection1', -- Alias
    'localhost', -- Host
    5432, -- Port
    'TestDatabase1', -- Database
    'Postgres', -- Type
    'testuser1', -- Username
    1, -- ApplicationID (Assuming 1 is a valid ApplicationID)
    1 -- CreatedBy (Assuming 1 is a valid UserID)
);

-- Test Update Operation (Connection Updated)
UPDATE Connection
SET Host = '127.0.0.1',
    UpdatedBy = 1
WHERE ConnectionID = 1;

-- Test Soft Delete Operation (Connection Deleted)
UPDATE Connection
SET IsDeleted = TRUE,
    UpdatedBy = 1
WHERE ConnectionID = 1;

-- Test Restore Operation (Connection Restored)
UPDATE Connection
SET IsDeleted = FALSE,
    UpdatedBy = 1
WHERE ConnectionID = 1;

-- Test Inactivate Operation (Connection Inactivated)
UPDATE Connection
SET isActive = FALSE,
    UpdatedBy = 1
WHERE ConnectionID = 1;

-- Test Activate Operation (Connection Activated)
UPDATE Connection
SET isActive = TRUE,
    UpdatedBy = 1
WHERE ConnectionID = 1;


SELECT * FROM AuditTrail

select  * from "User" u 

update audittrail 
set isactive = true 
where isactive is false ;

update audittrail 
set isdeleted = false 
where isdeleted is true ;

