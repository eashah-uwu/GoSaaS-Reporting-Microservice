-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS application_insert_trigger ON Application;
DROP TRIGGER IF EXISTS application_update_trigger ON Application;
DROP FUNCTION IF EXISTS log_application_insert();
DROP FUNCTION IF EXISTS log_application_update();

-- Function for logging Insert operations
CREATE OR REPLACE FUNCTION log_application_insert()
RETURNS TRIGGER AS $$
DECLARE
    event_id INT;
BEGIN
    -- Retrieve the AuditEventID for "Application Created"
    SELECT id INTO event_id FROM auditevents WHERE event = 'Application Created' AND module = 'Application';

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
        CONCAT('New application was created: ', NEW.Name, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.CreatedBy), ' at ', NEW.CreatedAt), -- Description
        NEW.CreatedAt, -- CreatedDate
        NEW.UserID, -- UserID
        event_id -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Update operations including soft delete and restore
CREATE OR REPLACE FUNCTION log_application_update()
RETURNS TRIGGER AS $$
DECLARE
    event_id INT;
    event_description TEXT;
BEGIN
    -- Determine the event type and description
    CASE
        WHEN OLD.IsDeleted = FALSE AND NEW.IsDeleted = TRUE THEN
            event_description := CONCAT('Application was deleted: ', NEW.Name, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Application Deleted' AND module = 'Application';
        WHEN OLD.IsDeleted = TRUE AND NEW.IsDeleted = FALSE THEN
            event_description := CONCAT('Application was restored: ', NEW.Name, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Application Restored' AND module = 'Application';
        WHEN OLD.Name IS DISTINCT FROM NEW.Name THEN
            event_description := CONCAT('Application name was updated from ', OLD.Name, ' to ', NEW.Name, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Application Name Changed' AND module = 'Application';
        WHEN OLD.IsActive IS DISTINCT FROM NEW.IsActive THEN
            IF OLD.IsActive = TRUE AND NEW.IsActive = FALSE THEN
                event_description := CONCAT('Application was inactivated: ', NEW.Name, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
                SELECT id INTO event_id FROM auditevents WHERE event = 'Application Inactivated' AND module = 'Application';
            ELSIF OLD.IsActive = FALSE AND NEW.IsActive = TRUE THEN
                event_description := CONCAT('Application was activated: ', NEW.Name, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
                SELECT id INTO event_id FROM auditevents WHERE event = 'Application Activated' AND module = 'Application';
            END IF;
        ELSE
            event_description := CONCAT('Application details were updated: ', NEW.Name, ' by ', (SELECT Name FROM "User" WHERE UserID = NEW.UpdatedBy), ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Application Updated' AND module = 'Application';
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
        NEW.UserID, -- UserID
        event_id -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for application insertion
CREATE TRIGGER application_insert_trigger
AFTER INSERT ON Application
FOR EACH ROW
EXECUTE FUNCTION log_application_insert();

-- Trigger for application update, including soft delete and restore
CREATE TRIGGER application_update_trigger
AFTER UPDATE ON Application
FOR EACH ROW
EXECUTE FUNCTION log_application_update();


select * from "User" u 

-- Insert a new application
INSERT INTO Application (Name, Description, IsActive, IsDeleted, UserID, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
VALUES ('Test Application', 'Description for Test Application', TRUE, FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1);

-- Update the application name
UPDATE Application
SET Name = 'Updated Test Application', UpdatedAt = CURRENT_TIMESTAMP, UpdatedBy = 2
WHERE ApplicationID = 3;

-- Update the application to be activated
UPDATE Application
SET IsActive = TRUE, UpdatedAt = CURRENT_TIMESTAMP, UpdatedBy = 2
WHERE ApplicationID = 3;

-- Update the application to be inactivated
UPDATE Application
SET IsActive = FALSE, UpdatedAt = CURRENT_TIMESTAMP, UpdatedBy = 2
WHERE ApplicationID = 3;

-- Soft delete the application
UPDATE Application
SET IsDeleted = TRUE, UpdatedAt = CURRENT_TIMESTAMP, UpdatedBy = 2
WHERE ApplicationID = 3;

-- Restore the application from soft deletion
UPDATE Application
SET IsDeleted = FALSE, UpdatedAt = CURRENT_TIMESTAMP, UpdatedBy = 2
WHERE ApplicationID = 3;



select * from audittrail a ;

select * from auditevents a where "module" ='Application'

select * from application a 

