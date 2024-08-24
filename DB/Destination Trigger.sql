-- Function for logging Insert operations
CREATE OR REPLACE FUNCTION log_destination_insert()
RETURNS TRIGGER AS $$
DECLARE
    event_id INT;
    application_name TEXT;
BEGIN
    -- Retrieve the AuditEventID for "Destination Added"
    SELECT id INTO event_id FROM auditevents WHERE event = 'Destination Added' AND module = 'Destination';

    -- Retrieve the Application Name
    SELECT Name INTO application_name FROM Application WHERE ApplicationID = NEW.ApplicationID;

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
        application_name, -- CreatedBy (Application Name)
        CURRENT_TIMESTAMP, -- ModifiedDate
        CONCAT('New destination was added: ', NEW.Alias, ' for application ', application_name, ' at ', NEW.CreatedAt), -- Description
        NEW.CreatedAt, -- CreatedDate
        NEW.CreatedBy, -- UserID
        event_id -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Update operations
CREATE OR REPLACE FUNCTION log_destination_update()
RETURNS TRIGGER AS $$
DECLARE
    event_id INT;
    event_description TEXT;
    application_name TEXT;
BEGIN
    -- Retrieve the Application Name
    SELECT Name INTO application_name FROM Application WHERE ApplicationID = NEW.ApplicationID;

    -- Determine the event type and description
    CASE
        WHEN OLD.IsDeleted = FALSE AND NEW.IsDeleted = TRUE THEN
            event_description := CONCAT('Destination was deleted: ', NEW.Alias, ' for application ', application_name, ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Destination Deleted' AND module = 'Destination';
        WHEN OLD.IsDeleted = TRUE AND NEW.IsDeleted = FALSE THEN
            event_description := CONCAT('Destination was restored: ', NEW.Alias, ' for application ', application_name, ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Destination Restored' AND module = 'Destination';
        WHEN OLD.isActive IS DISTINCT FROM NEW.isActive THEN
            IF OLD.isActive = TRUE AND NEW.isActive = FALSE THEN
                event_description := CONCAT('Destination was inactivated: ', NEW.Alias, ' for application ', application_name, ' at ', NEW.UpdatedAt);
                SELECT id INTO event_id FROM auditevents WHERE event = 'Destination Inactivated' AND module = 'Destination';
            ELSIF OLD.isActive = FALSE AND NEW.isActive = TRUE THEN
                event_description := CONCAT('Destination was activated: ', NEW.Alias, ' for application ', application_name, ' at ', NEW.UpdatedAt);
                SELECT id INTO event_id FROM auditevents WHERE event = 'Destination Activated' AND module = 'Destination';
            END IF;
        ELSE
            event_description := CONCAT('Destination details were updated: ', NEW.Alias, ' for application ', application_name, ' at ', NEW.UpdatedAt);
            SELECT id INTO event_id FROM auditevents WHERE event = 'Destination Updated' AND module = 'Destination';
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
        application_name, -- CreatedBy (Application Name)
        CURRENT_TIMESTAMP, -- ModifiedDate
        event_description, -- Description
        NEW.UpdatedAt, -- CreatedDate
        NEW.UpdatedBy, -- UserID
        event_id -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for destination insertion
CREATE TRIGGER destination_insert_trigger
AFTER INSERT ON Destination
FOR EACH ROW
EXECUTE FUNCTION log_destination_insert();

-- Trigger for destination update, including soft delete and restore
CREATE TRIGGER destination_update_trigger
AFTER UPDATE ON Destination
FOR EACH ROW
EXECUTE FUNCTION log_destination_update();






-- 1. Insert a new destination
INSERT INTO Destination (Alias, URL, APIKey, isActive, IsDeleted, ApplicationID, CreatedBy)
VALUES ('Test Alias 1', 'https://testurl1.com', 'APIKEY123', TRUE, FALSE, 1, 1);

-- 2. Update the destination alias and activate the destination
UPDATE Destination
SET Alias = 'Updated Alias 1', isActive = true , UpdatedBy = 2, UpdatedAt = CURRENT_TIMESTAMP
WHERE DestinationID = 1;

-- 3. Soft delete the destination
UPDATE Destination
SET IsDeleted = TRUE, UpdatedBy = 2, UpdatedAt = CURRENT_TIMESTAMP
WHERE DestinationID = 1;

-- 4. Restore the destination from deletion
UPDATE Destination
SET isactive = FALSE, UpdatedBy = 2, UpdatedAt = CURRENT_TIMESTAMP
WHERE DestinationID = 1;

-- 5. Check all audit entries related to the destination
SELECT * FROM AuditTrail WHERE Description LIKE '%Test Alias 1%' OR Description LIKE '%Updated Alias 1%';




select * from audittrail a 

select * from destination d 


select * from auditevents a where "module" ='Destination'



